import { loadConfig } from '../config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parse } from '../mission-inspector/engine.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
function safe(base, relative) {
  if (!relative || path.isAbsolute(relative)) throw Error('Use a path relative to the reference root.');
  const target = path.resolve(base, relative), realBase = fs.realpathSync(base);
  const rel = path.relative(base, target);
  if (rel === '..' || rel.startsWith('..' + path.sep) || path.isAbsolute(rel)) throw Error('Path escapes reference root.');
  if (fs.existsSync(target)) { const realRel = path.relative(realBase, fs.realpathSync(target)); if (realRel === '..' || realRel.startsWith('..' + path.sep) || path.isAbsolute(realRel)) throw Error('Symlink escapes reference root.'); }
  return target;
}
function files(directory, extensions) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a,b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file, extensions) : entry.isFile() && extensions.includes(path.extname(entry.name).toLowerCase()) ? [file] : [];
  });
}
function source(file) {
  const bytes = fs.readFileSync(file); let text, encoding;
  try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); encoding = bytes.subarray(0,3).equals(Buffer.from([239,187,191])) ? 'UTF-8 BOM' : 'UTF-8'; }
  catch { text = new TextDecoder('windows-1252').decode(bytes); encoding = 'Windows-1252 fallback'; }
  return { text: text.replace(/^\uFEFF/, ''), sha256: hash(bytes), encoding };
}
export function locate(text, file, line) {
  const lines = text.split(/\r?\n/);
  if (!Number.isInteger(line) || line < 1 || line > lines.length) throw Error('Line is outside the file.');
  let nodes; try { nodes = parse(text, file); } catch(error) { return { line, chain: [], parseWarning: error.message, block: { startLine: line, endLine: line, text: lines[line - 1] } }; }
  const ancestors = [];
  function walk(entries) {
    for (const node of entries) {
      if (!Array.isArray(node.value)) continue;
      const endLine = text.slice(0, node.end).split('\n').length;
      if (node.line <= line && endLine >= line) { ancestors.push({ node, endLine }); walk(node.value); break; }
    }
  }
  walk(nodes);
  const anchor = ancestors[file.replaceAll('\\','/').startsWith('missions/') && ancestors.length > 1 ? 1 : 0];
  return { line, chain: ancestors.map(entry => ({ key: entry.node.key, line: entry.node.line, endLine: entry.endLine })), block: anchor ? { startLine: anchor.node.line, endLine: anchor.endLine, text: text.slice(anchor.node.start, anchor.node.end) } : { startLine: line, endLine: line, text: lines[line - 1] } };
}
export function lookup(action, opts = {}, environment = {}) {
  const project = environment.root || root;
  const game = environment.game || loadConfig('cwtools', project).gamePath;
  if (!fs.existsSync(game) || !fs.statSync(game).isDirectory()) throw Error('Configured EU4 installation directory was not found.');
  const docs = path.join(project, 'docs/modding'), examples = path.join(docs, 'examples');
  const version = fs.existsSync(path.join(game, 'launcher-settings.json')) ? readJson(path.join(game, 'launcher-settings.json')).rawVersion : null;
  const limits = 'Literal text lookup, not semantic proof. Loose files only; DLC archives are not scanned. Installed assets do not prove DLC ownership or runtime availability.';
  if (action === 'list' || action === 'verify') {
    const results = files(examples, ['.json']).map(file => {
      const example = readJson(file); if (action === 'list') return { name: example.name, source: example.file, gameVersion: example.gameVersion, verification: example.verification };
      try {
        const current = source(safe(game, example.file));
        const currentLines = current.text.split(/\r?\n/).slice(example.startLine - 1, example.endLine).join('\n');
        return { name: example.name, versionMatches: !!version && version === example.gameVersion, fileMatches: current.sha256 === example.sourceSha256, excerptMatchesAtRecordedLines: hash(Buffer.from(currentLines)) === example.excerptSha256, reviewRequired: !version || version !== example.gameVersion || current.sha256 !== example.sourceSha256 };
      } catch(error) { return { name: example.name, reviewRequired: true, error: error.message }; }
    });
    return { action, gameVersion: version, results, limitations: limits };
  }
  if (action === 'show' || action === 'save') {
    const absolute = safe(game, opts.file), current = source(absolute), relative = path.relative(game, absolute).replaceAll('\\','/');
    const located = locate(current.text, relative, Number(opts.line || 1));
    const result = { file: relative, gameVersion: version, sourceSha256: current.sha256, encoding: current.encoding, ...located, limitations: limits };
    if (action === 'show') return result;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(opts.name || '')) throw Error('Example name must be a lowercase slug, such as branching-missions.');
    if (located.parseWarning || !located.chain.length) throw Error('Cannot save a structured example without a parsed enclosing block.');
    fs.mkdirSync(examples, { recursive: true });
    const metadataFile = path.join(examples, opts.name + '.json'), guideFile = path.join(examples, opts.name + '.md');
    if (fs.existsSync(metadataFile) || fs.existsSync(guideFile)) throw Error('Example already exists; review and update it explicitly rather than overwrite it.');
    const excerpt = current.text.split(/\r?\n/).slice(located.block.startLine - 1, located.block.endLine).join('\n');
    const metadata = { name: opts.name, file: relative, startLine: located.block.startLine, endLine: located.block.endLine, gameVersion: version, sourceSha256: current.sha256, excerptSha256: hash(Buffer.from(excerpt)), recordedAtUtc: new Date().toISOString(), encoding: current.encoding, chain: located.chain, notes: opts.notes || '', verification: 'Vanilla source captured; not validated as a standalone mod implementation and not playtested.' };
    const fence = '`'.repeat(Math.max(3, ...[...excerpt.matchAll(/`+/g)].map(match => match[0].length + 1)));
    const guide = `# ${opts.name}\n\nSource: \`${relative}:${metadata.startLine}-${metadata.endLine}\`\n\nGame version: ${version || 'unknown — review required'}\n\n${metadata.verification}\n\n## Purpose and notes\n\n${opts.notes || 'TODO: describe the intended mechanic.'}\n\n## Vanilla example\n\n${fence}text\n${excerpt}\n${fence}\n\n## Implementation checklist\n\n- TODO: required files, scopes and related definitions.\n- TODO: localisation, DLC requirements and dependencies; availability is not inferred from installed files.\n- TODO: minimal adapted example and known pitfalls.\n- TODO: automated validation and concrete in-game test steps.\n- TODO: unresolved assumptions and playtest results.\n\nRun \`./tools/vanilla-reference.ps1 -Action verify\` before relying on this example.\n`;
    fs.writeFileSync(guideFile, guide, { flag: 'wx' });
    try { fs.writeFileSync(metadataFile, JSON.stringify(metadata, null, 2) + '\n', { flag: 'wx' }); } catch(error) { fs.unlinkSync(guideFile); throw error; }
    return { savedGuide: guideFile, savedMetadata: metadataFile, ...metadata };
  }
  if (!['search','links','docs'].includes(action)) throw Error('Unknown action.');
  if (!opts.query?.trim()) throw Error('Provide a query.');
  const limit = Number(opts.limit || 12), context = Number(opts.context ?? 3);
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(context) || context < 0 || context > 30) throw Error('Limit must be 1–100 and context 0–30.');
  const directories = action === 'docs' ? [docs] : opts.folder ? [safe(game, opts.folder)] : ['missions','events','decisions','common','localisation','history','interface'].map(folder => path.join(game, folder));
  if (action !== 'docs' && opts.folder && (!fs.existsSync(directories[0]) || !fs.statSync(directories[0]).isDirectory())) throw Error('Search folder was not found or is not a directory.');
  const candidates = directories.flatMap(directory => files(directory, action === 'docs' ? ['.md'] : ['.txt','.yml','.gfx','.gui']));
  const results = []; let totalMatches = 0; const warnings = [];
  for (const absolute of candidates) {
    let current; try { current = source(absolute); } catch(error) { warnings.push({ file: absolute, error: error.message }); continue; }
    const relative = path.relative(action === 'docs' ? docs : game, absolute).replaceAll('\\','/'), lines = current.text.split(/\r?\n/);
    const query = opts.query.toLowerCase();
    for (let index = 0; index < lines.length; index++) {
      let matches = lines[index].toLowerCase().includes(query);
      if (matches && action === 'links') {
        const escaped = opts.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        matches = new RegExp(`(^|[^A-Za-z0-9_.])${escaped}($|[^A-Za-z0-9_.])`, 'i').test(lines[index]);
      }
      if (!matches) continue;
      if (opts.definitionsOnly && !lines[index].trim().startsWith('#')) {
        matches = lines[index].match(/^\s*([^\s=]+)\s*=\s*\{/ )?.[1].toLowerCase() === query;
      } else if (opts.definitionsOnly) matches = false;
      if (!matches) continue;
      totalMatches++;
      if (results.length >= limit) continue;
      const location = action === 'docs' || relative.startsWith('localisation/') ? { chain: [] } : locate(current.text, relative, index + 1);
      results.push({ file: relative, line: index + 1, match: lines[index], chain: location.chain, parseWarning: location.parseWarning, context: lines.slice(Math.max(0,index-context), index+context+1).map((text, offset) => ({ line: Math.max(0,index-context)+offset+1, text })), sourceSha256: current.sha256, encoding: current.encoding });
    }
  }
  return { action, query: opts.query, gameVersion: version, scannedFiles: candidates.length, totalMatches, truncated: totalMatches > results.length, results, warnings, limitations: limits };
}
export function format(result) {
  if (result.block) {
    const lines = result.block.text.split('\n');
    return [`${result.file}:${result.line} · EU4 ${result.gameVersion || 'unknown'}`, `Enclosing blocks: ${result.chain.map(entry=>entry.key).join(' > ') || '(none)'}`, result.parseWarning || '', ...lines.slice(0,120).map((line,index)=>`${result.block.startLine+index}: ${line}`), ...(lines.length > 120 ? [`[Truncated display: ${lines.length} lines; use -Json for the full block.]`] : []), result.limitations].join('\n');
  }
  if (result.results) return [`${result.action}: ${result.query || ''} · EU4 ${result.gameVersion || 'unknown'}`, result.totalMatches === undefined ? `${result.results.length} saved examples` : `${result.totalMatches} matches; ${result.scannedFiles} files; showing ${result.results.length}`, ...result.results.map(item => item.context ? `\n${item.file}:${item.line}\n${item.chain.map(entry=>entry.key).join(' > ')}\n${item.context.map(line=>`${line.line}: ${line.text}`).join('\n')}${item.parseWarning ? '\nParse warning: ' + item.parseWarning : ''}` : JSON.stringify(item)), result.limitations].join('\n');
  return JSON.stringify(result, null, 2);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2), action = args.shift(), opts = {};
    while(args.length) { const arg=args.shift(); if (['--json','--definitions-only'].includes(arg)) opts[arg === '--json' ? 'json' : 'definitionsOnly'] = true; else if (['--query','--folder','--file','--line','--limit','--context','--name','--notes'].includes(arg) && args.length) opts[arg.slice(2)] = args.shift(); else throw Error(`Invalid argument: ${arg}`); }
    const result = lookup(action, opts); console.log(opts.json ? JSON.stringify(result,null,2) : format(result));
    if (action === 'verify' && result.results.some(item=>item.reviewRequired)) process.exitCode = 1;
  } catch(error) { console.error(error.message); process.exitCode = 2; }
}
