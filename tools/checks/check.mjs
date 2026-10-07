import { loadConfig } from '../config.mjs';
import { loadModConfig, developmentDescriptor } from '../mod-config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { generate } from '../mission-inspector/generate.mjs';
import { identity, buildIdentity, assertApplicable, legacyIdentity, productionOwners, schemaVersion } from '../evidence-identity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
const htmlEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function inventory(directory) {
  const files = [], links = [];
  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(current, entry.name), relative = path.relative(directory, file).replaceAll('\\', '/');
      if (entry.isSymbolicLink()) links.push(relative);
      else if (entry.isDirectory()) walk(file);
      else if (entry.isFile()) files.push({ path: relative, sha256: hash(fs.readFileSync(file)) });
    }
  }
  if (fs.lstatSync(directory).isSymbolicLink()) throw Error('Mod root is a symlink or junction.');
  walk(directory); return { files, links, fingerprint: hash(JSON.stringify({ files, links })) };
}
export function fileChecks(directory, snapshot) {
  const findings = [];
  const add = (severity, code, message, file) => findings.push({ tool: 'files', severity, code, message, file });
  for (const link of snapshot.links) add('error', 'symlink', 'Symlinks and junctions cannot be deployed safely.', link);
  for (const item of snapshot.files) {
    const file = item.path, lower = file.toLowerCase(), bytes = fs.readFileSync(path.join(directory, file));
    if (/(^|\/)(tools|tests?|fixtures?|reports|node_modules|\.git|\.cache|\.codex|\.vscode)(\/|$)/.test(lower) || /(^|\/)(agents\.md|readme\.md|package(-lock)?\.json)$/.test(lower) || /\.(ps1|mjs|cjs|js|py|pyc|log|bak|tmp)$/.test(lower)) add('error', 'development-file', 'Development tooling, reports or temporary files are inside exportable mod content.', file);
    if (/\.(txt|yml|gui|gfx|mod)$/.test(lower)) {
      if (bytes.includes(0) || bytes[0] === 0xff && bytes[1] === 0xfe || bytes[0] === 0xfe && bytes[1] === 0xff) add('error', 'unsupported-encoding', 'Script/localisation contains NUL bytes or UTF-16 data; preserve supported game text encoding.', file);
    }
    if (lower.startsWith('localisation/') && lower.endsWith('.yml')) {
      if (!(bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf)) add('error', 'localisation-bom', 'Localisation requires a UTF-8 BOM.', file);
      let text;
      try { text = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch { add('error', 'localisation-utf8', 'Localisation is not valid UTF-8.', file); continue; }
      const match = path.basename(file).match(/_l_([a-z_]+)\.yml$/i);
      if (!match) add('error', 'localisation-filename', 'Localisation filename must end with _l_<language>.yml.', file);
      const header = text.replace(/^\uFEFF/, '').split(/\r?\n/).find(line => line.trim() && !line.trim().startsWith('#'));
      if (!header || !/^\s*l_[a-z_]+:\s*(?:#.*)?$/i.test(header) || match && !new RegExp(`^\\s*l_${match[1]}:\\s*(?:#.*)?$`, 'i').test(header)) add('error', 'localisation-header', 'Localisation header is missing or does not match the filename language.', file);
    }
  }
  return findings;
}
export function deploymentPreparation(root, mod, snapshot) {
  const config = loadConfig('deployment', root);
  if (typeof config.gameModDirectory !== 'string' || !path.isAbsolute(config.gameModDirectory)) throw Error('Game mod directory must be an absolute path.');
  const modMetadata=loadModConfig(mod,root,{onNotice:message=>console.error(message)});
  const target = path.resolve(config.gameModDirectory, `${mod}_dev`), launcher = target + '.mod';
  const source = path.resolve(root, 'mod', mod);
  const overlaps = (a, b) => { const relative = path.relative(a, b); return relative === '' || relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative); };
  if (overlaps(source, target) || overlaps(config.gameModDirectory, source) || /["\r\n]/.test(target)) throw Error('Invalid or overlapping source/destination.');
  if (!fs.existsSync(config.gameModDirectory) || !fs.statSync(config.gameModDirectory).isDirectory()) throw Error('Configured game mod directory does not exist.');
  const descriptor = developmentDescriptor(modMetadata);
  const launcherText = descriptor + `path="${target.replaceAll('\\', '/')}"\n`;
  const preparedFiles = snapshot.files.filter(file => file.path !== 'descriptor.mod').concat({ path: 'descriptor.mod', sha256: hash(Buffer.from(descriptor)) }).sort((a, b) => a.path.localeCompare(b.path));
  const key = hash(Buffer.from(target.toLowerCase())).slice(0, 16);
  const recordPath = path.join(root, `tools/deployment/state/${mod}/${key}/latest.json`);
  const findings = [];
  if (snapshot.links.length) findings.push({ tool: 'deployment', severity: 'error', code: 'symlink', message: 'Source contains symlinks or junctions; deployment would reject it.' });
  if (fs.existsSync(target) || fs.existsSync(launcher)) {
    if (!fs.existsSync(recordPath)) findings.push({ tool: 'deployment', severity: 'error', code: 'unowned-destination', message: 'Development destination already exists without an ownership record; deployment would refuse it.' });
    else {
      const record = readJson(recordPath);
      if(record.schemaVersion!==undefined && record.schemaVersion!==schemaVersion) findings.push({tool:'deployment',severity:'error',code:'unsupported-schema',message:'Deployment record has an unsupported schema version.'});
      else if(record.schemaVersion===schemaVersion && (record.sourceMod!==(productionOwners.includes(mod)?mod:null) || record.storageNamespace!==mod || record.artifactKind!=='staged')) findings.push({tool:'deployment',severity:'error',code:'identity-conflict',message:'Deployment source owner, storage namespace or artifact kind conflicts with the selected destination.'});
      if (path.resolve(record.target).toLowerCase() !== target.toLowerCase() || path.resolve(record.launcher).toLowerCase() !== launcher.toLowerCase()) findings.push({ tool: 'deployment', severity: 'error', code: 'destination-mismatch', message: 'Deployment ownership record points to another destination.' });
      else if (!fs.existsSync(target) || !fs.existsSync(launcher)) findings.push({ tool: 'deployment', severity: 'error', code: 'incomplete-destination', message: 'Existing development deployment is incomplete.' });
      else {
        const actual = inventory(target);
        const expected = new Map(record.files.map(file => [file.path.replaceAll('\\', '/'), file.sha256.toLowerCase()]));
        if (actual.links.length || actual.files.length !== expected.size || actual.files.some(file => expected.get(file.path) !== file.sha256) || hash(fs.readFileSync(launcher)) !== record.launcherSha256.toLowerCase()) findings.push({ tool: 'deployment', severity: 'error', code: 'modified-destination', message: 'Deployed files differ from their ownership record; deployment would refuse to overwrite them.' });
      }
    }
  }
  return { findings, target, launcher, descriptor, launcherText, preparedFiles, launcherSha256: hash(Buffer.from(launcherText)), permissionCheck: 'No write probe; filesystem write permissions are not verified.' };
}
export function consolidate(findings) {
  const map = new Map();
  for (const finding of findings) {
    const identity = JSON.stringify([finding.tool, finding.severity, finding.code, finding.file || '', finding.message, [...(finding.missions || [])].sort()]);
    const id = hash(Buffer.from(identity));
    if (!map.has(id)) map.set(id, { ...finding, id, occurrences: [] });
    map.get(id).occurrences.push({ file: finding.file, line: finding.line, column: finding.column, scenario: finding.scenario });
  }
  return [...map.values()];
}
export function compare(current, previous, completeTools) {
  const old = new Map((previous?.findings || []).map(finding => [finding.id, finding]));
  const now = new Map(current.map(finding => [finding.id, finding]));
  return {
    baselineAtUtc: previous?.finishedAtUtc || null,
    new: current.filter(finding => !old.has(finding.id)),
    existing: current.filter(finding => old.has(finding.id)),
    resolved: [...old.values()].filter(finding => !now.has(finding.id) && completeTools.includes(finding.tool)),
    deferred: [...old.values()].filter(finding => !now.has(finding.id) && !completeTools.includes(finding.tool)),
    occurrenceChanges: current.filter(finding => old.has(finding.id) && finding.occurrences.length !== old.get(finding.id).occurrences.length).map(finding => ({ id: finding.id, before: old.get(finding.id).occurrences.length, after: finding.occurrences.length }))
  };
}
export function classify(checks) { return checks.some(check => check.status === 'incomplete') ? 'incomplete' : checks.some(check => check.errors > 0) ? 'failed' : 'passed'; }
function runValidator(root, mod, timeoutMs) {
  return new Promise(resolve => {
    const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'tools/validate-cwtools.ps1'), '-Mod', mod], { cwd: root, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'] });
    let output = '', settled = false;
    const settle = value => { if (settled) return; settled = true; clearTimeout(timer); resolve({ ...value, output }); };
    const timer = setTimeout(() => { if (process.platform === 'win32' && child.pid) spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }); else child.kill(); settle({ exitCode: 2, error: 'CWTools process exceeded the project-check timeout.' }); }, timeoutMs);
    for (const stream of [child.stdout, child.stderr]) stream.on('data', bytes => { output += bytes.toString(); process.stdout.write(bytes); });
    child.on('error', error => settle({ exitCode: 2, error: error.message }));
    child.on('close', exitCode => settle({ exitCode }));
  });
}
export function evidence(root, mod, prepared) {
  const latest = path.join(root, `tools/test-runs/reports/${mod}/latest.json`);
  if (!fs.existsSync(latest)) return { status: 'none', message: 'No completed in-game test report is available.' };
  try {
    const pointer = readJson(latest), report = readJson(pointer.report), run = readJson(path.join(path.dirname(pointer.report), 'run.json'));
    if(pointer.storageNamespace && pointer.storageNamespace!==mod) throw Error('Collector latest pointer namespace conflict.');
    if (run.status !== 'complete') return { status: 'unavailable', message: 'Latest test-run metadata is not complete.' };
    if (!run.deployment) return { status: 'untracked', id: run.id, outcome: report.outcome, message: 'Test run has no verified deployed build.' };
    if (!prepared) return { status: 'unavailable', id: run.id, message: 'Cannot compare test build because deployment preparation failed.' };
    const tested = new Map(run.deployment.record.files.map(file => [file.path.replaceAll('\\', '/'), file.sha256.toLowerCase()]));
    const matches = prepared.preparedFiles.length === tested.size && prepared.preparedFiles.every(file => tested.get(file.path) === file.sha256) && run.deployment.record.launcherSha256.toLowerCase() === prepared.launcherSha256;
    let resolved;
    if(run.schemaVersion===schemaVersion) {
      // Completion is checked independently of an operator FAIL/INCOMPLETE verdict.
      if(report.schemaVersion!==schemaVersion || report.sourceMod!==run.sourceMod || report.storageNamespace!==run.storageNamespace
        || report.artifactKind!==run.artifactKind || report.runId!==run.runId || report.attemptId!==run.attemptId) throw Error('Collector report/run identity conflict.');
      for(const field of ['sourceBuild','stagedBuild','artifactBuild','contractId','suiteId','selectedMembers','coveredLayers','evidenceSource']) {
        if(JSON.stringify(report[field])!==JSON.stringify(run[field])) throw Error(`Collector report/run ${field} conflict.`);
      }
      assertApplicable({...run,finishedAtUtc:report.finishedAtUtc},{sourceMod:productionOwners.includes(mod)?mod:null,storageNamespace:mod,
        sourceBuild:buildIdentity(path.join(root,'mod',mod))});
      resolved=run;
    } else resolved=legacyIdentity(run,{format:'collector',root,storageNamespace:mod,buildMatches:matches});
    if(!['production','staged'].includes(resolved.artifactKind)) throw Error('Collector fixture/untracked artifact cannot serve as production build evidence.');
    return { status: matches && !report.deploymentChanges?.length ? 'matching-build' : 'stale', sourceMod:resolved.sourceMod,storageNamespace:resolved.storageNamespace,artifactKind:resolved.artifactKind,
      applicability:'operator-only; gameplay coverage remains unverified', id: run.id, outcome: report.outcome, scenario: report.scenario, finishedAtUtc: report.finishedAtUtc, logReport: pointer.report, unstableCapture: report.unstableCapture, changedLogs: report.changedLogs, message: 'Operator-reported scenario evidence; build matching does not prove the playset loaded it or all gameplay works.' };
  } catch (error) { return { status: 'unavailable', message: error.message }; }
}
function render(report) {
  const diff = report.comparison;
  const rows = report.checks.map(check => `<tr><td>${htmlEscape(check.name)}</td><td>${htmlEscape(check.status)}</td><td>${check.errors ?? '—'}</td><td>${check.warnings ?? '—'}</td><td>${htmlEscape(check.message)}</td></tr>`).join('');
  const sections = [['New', diff.new], ['Existing', diff.existing], ['Resolved', diff.resolved], ['Deferred — checker incomplete', diff.deferred]].map(([name, findings]) => `<details ${name === 'New' ? 'open' : ''}><summary>${name}: ${findings.length}</summary>${findings.map(finding => `<article class="${htmlEscape(finding.severity)}"><strong>${htmlEscape(finding.tool)} · ${htmlEscape(finding.code)} · ${htmlEscape(finding.severity)}</strong><p>${htmlEscape(finding.message)}</p><small>${htmlEscape(finding.file || '')} ${finding.occurrences.length} occurrence(s)${finding.occurrences.map(item => item.line ? ` · line ${item.line}` : item.scenario ? ` · ${htmlEscape(item.scenario)}` : '').join('')}</small></article>`).join('') || '<p>None.</p>'}</details>`).join('');
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${htmlEscape(report.mod)} project check</title><style>body{font:15px system-ui,sans-serif;max-width:1150px;margin:30px auto;padding:0 20px;background:#111820;color:#edf2f7}p{line-height:1.5;color:#c0cfdd}table{border-collapse:collapse;width:100%;margin:20px 0}th,td{text-align:left;border-bottom:1px solid #354758;padding:12px}details{margin:18px 0;padding:15px;background:#1b2530;border-radius:6px}summary{cursor:pointer;font-weight:600}article{border-left:3px solid #77c9eb;padding:12px;margin:12px 0;background:#111820}.error{border-color:#ff767e}.warning{border-color:#f3c56b}small{color:#aabbcb}pre{white-space:pre-wrap;overflow-wrap:anywhere}a{color:#77c9eb}</style></head><body><h1>${htmlEscape(report.mod)} — ${report.status.toUpperCase()}</h1><p>${htmlEscape(report.finishedAtUtc)} · ${report.source.files.length} source files · snapshot ${report.source.fingerprint.slice(0, 12)}</p><p>Automated checks only. Deployment write permissions and in-game behavior are not established.</p><table><thead><tr><th>Check</th><th>Status</th><th>Errors</th><th>Warnings</th><th>Details</th></tr></thead><tbody>${rows}</tbody></table><p>Comparison: ${diff.baselineAtUtc ? 'last complete check at ' + htmlEscape(diff.baselineAtUtc) : 'first check; all findings are new'}. ${diff.occurrenceChanges.length} finding(s) changed occurrence count. Findings are grouped within each tool; cross-tool findings remain separate.</p><h2>In-game evidence: ${htmlEscape(report.gameEvidence.status)}</h2><pre>${htmlEscape(JSON.stringify(report.gameEvidence, null, 2))}</pre>${sections}</body></html>`;
}
async function performCheck(mod, options = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(mod)) throw Error('Invalid mod name.');
  const root = options.root || projectRoot, source = path.join(root, 'mod', mod);
  if (!fs.existsSync(source)) throw Error(`Missing mod: ${mod}`);
  const storage = path.join(options.storage || path.join(here, 'reports'), mod);
  fs.mkdirSync(storage, { recursive: true });
  const startedAtUtc = new Date().toISOString(), snapshot = inventory(source);
  const artifactBuild=buildIdentity(source);
  const reportIdentity=identity({sourceMod:productionOwners.includes(mod)?mod:null,storageNamespace:mod,
    artifactKind:productionOwners.includes(mod)?'production':'fixture',coveredLayers:['STATIC'],evidenceSource:'static',
    artifactBuild,runId:crypto.randomUUID(),startedAtUtc});
  const previousPath = path.join(storage, 'last-complete.json');
  const previous = fs.existsSync(previousPath) ? readJson(previousPath) : null;
  if(previous?.schemaVersion!==undefined && ![1,schemaVersion].includes(previous.schemaVersion)) throw Error('Unsupported last-complete schema version.');
  if(previous?.mod && previous.mod!==mod) throw Error('Last-complete legacy namespace conflict.');
  if(previous?.schemaVersion===schemaVersion && (previous.sourceMod!==reportIdentity.sourceMod || previous.storageNamespace!==mod || previous.artifactKind!==reportIdentity.artifactKind)) throw Error('Last-complete report identity conflict.');
  const findings = [], checks = [];
  writeJson(path.join(storage, 'latest.json'), { ...reportIdentity, mod, status: 'running', startedAtUtc });
  fs.writeFileSync(path.join(storage, 'latest.txt'), `${mod} — RUNNING\n`);
  fs.writeFileSync(path.join(storage, 'latest.html'), '<!doctype html><title>Project check running</title><h1>Project check is running</h1><p>No final result is available yet.</p>');
  const completed = (tool, name, items, message = '') => { findings.push(...items); checks.push({ tool, name, status: 'complete', errors: items.filter(item => item.severity === 'error').length, warnings: items.filter(item => item.severity === 'warning').length, message }); };
  const incomplete = (tool, name, error) => checks.push({ tool, name, status: 'incomplete', message: error.message || String(error) });
  console.log('Running CWTools...');
  try {
    const config = loadConfig('cwtools', root);
    const result = await (options.validator || runValidator)(root, mod, ((config.timeoutSeconds || 300) + 60) * 1000);
    fs.writeFileSync(path.join(storage, 'cwtools-output.txt'), result.output || '');
    if (![0, 1].includes(result.exitCode)) throw Error(result.error || `CWTools did not complete (exit ${result.exitCode}).`);
    const report = readJson(path.join(root, `tools/cwtools/reports/${mod}/latest.json`));
    if (report.status !== 'complete' || !Number.isFinite(Date.parse(report.validatedAt)) || Date.parse(report.validatedAt) < Date.parse(startedAtUtc) || path.resolve(report.project).toLowerCase() !== path.resolve(source).toLowerCase()) throw Error('CWTools report is incomplete, stale or belongs to a different project.');
    assertApplicable(report,{sourceMod:reportIdentity.sourceMod,storageNamespace:mod,artifactKind:productionOwners.includes(mod)?'production':'untracked',
      projectPath:source,artifactBuild,notBefore:startedAtUtc,evidenceSource:'static'});
    if (!Array.isArray(report.diagnostics) || (result.exitCode === 0) !== (report.summary.errors === 0)) throw Error('CWTools exit code and report disagree.');
    completed('cwtools', 'CWTools', report.diagnostics.map(item => ({ ...item, tool: 'cwtools' })), `${report.cwtoolsVersion}; EU4 ${report.gameVersion}`);
  } catch (error) { incomplete('cwtools', 'CWTools', error); }
  console.log('Checking mission layouts, files and deployment preparation...');
  try {
    const layout = (options.inspector || generate)(mod,false,{storage:options.inspectorStorage});
    assertApplicable(layout.identity,{sourceMod:reportIdentity.sourceMod,storageNamespace:mod,artifactBuild,notBefore:startedAtUtc,evidenceSource:'static'});
    if (!layout.reports.some(report => !report.scenario.diagnostic)) throw Error('No normal mission scenarios were inspected.');
    const items = layout.reports.filter(report => !report.scenario.diagnostic).flatMap(report => report.findings.map(item => ({ ...item, tool: 'missions', scenario: report.scenario.name })));
    completed('missions', 'Mission layout', items, `${layout.reports.filter(report => !report.scenario.diagnostic).length} normal scenarios; diagnostic scenarios excluded.`);
    const grouped = consolidate(items);
    checks.at(-1).errors = grouped.filter(item => item.severity === 'error').length;
    checks.at(-1).warnings = grouped.filter(item => item.severity === 'warning').length;
  } catch (error) { incomplete('missions', 'Mission layout', error); }
  try { completed('files', 'File checks', fileChecks(source, snapshot)); } catch (error) { incomplete('files', 'File checks', error); }
  let prepared;
  try {
    prepared = deploymentPreparation(root, mod, snapshot);
    completed('deployment', 'Deployment prep', prepared.findings, 'Descriptors prepared in memory; no game files written. Write permissions unverified.');
  } catch (error) { completed('deployment', 'Deployment prep', [{ tool: 'deployment', severity: 'error', code: 'configuration', message: error.message }]); }
  const finalSnapshot = inventory(source);
  if (snapshot.fingerprint !== finalSnapshot.fingerprint) {
    for (const item of checks) { item.status = 'incomplete'; item.message = 'Source changed during the check; rerun against a stable saved build.'; }
  }
  const unique = consolidate(findings), status = classify(checks), finishedAtUtc = new Date().toISOString();
  const report = { ...reportIdentity, verdict:status==='passed'?'PASS':status==='failed'?'FAIL':'INCOMPLETE',verdictSource:'combined static checks; no native gameplay verdict',mod, status, startedAtUtc, finishedAtUtc, source: snapshot, checks, findings: unique, comparison: compare(unique, previous, checks.filter(check => check.status === 'complete').map(check => check.tool)), gameEvidence: evidence(root, mod, prepared) };
  const text = [`${mod} — ${status.toUpperCase()}`, '', ...checks.map(check => `${check.name}: ${check.status}${check.errors === undefined ? '' : `; ${check.errors} errors, ${check.warnings} warnings`}${check.message ? '; ' + check.message : ''}`), '', `New: ${report.comparison.new.length}; existing: ${report.comparison.existing.length}; resolved: ${report.comparison.resolved.length}; deferred: ${report.comparison.deferred.length}`, `Occurrence-count changes: ${report.comparison.occurrenceChanges.length}`, `In-game evidence: ${report.gameEvidence.status}`, '', ...unique.map(finding => `[${finding.tool} ${finding.severity} ${finding.code}] ${finding.message} (${finding.occurrences.length} occurrences)`), '', 'Automated checks do not establish in-game behavior or permission to write the deployment destination.'];
  const reportHtml = render(report);
  writeJson(path.join(storage, 'latest.json'), report);
  fs.writeFileSync(path.join(storage, 'latest.txt'), text.join('\n') + '\n');
  fs.writeFileSync(path.join(storage, 'latest.html'), reportHtml);
  const archive = path.join(storage, finishedAtUtc.replace(/[-:.]/g, ''));
  fs.mkdirSync(archive, { recursive: true });
  writeJson(path.join(archive, 'report.json'), report);
  fs.writeFileSync(path.join(archive, 'report.html'), reportHtml);
  if (status !== 'incomplete') writeJson(previousPath, report);
  console.log(text.slice(0, checks.length + 7).join('\n'));
  console.log(`Full report: ${path.join(storage, 'latest.html')}`);
  return { report, exitCode: status === 'incomplete' ? 2 : status === 'failed' ? 1 : 0 };
}
export async function checkProject(mod, options = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(mod)) throw Error('Invalid mod name.');
  const storage = path.join(options.storage || path.join(here, 'reports'), mod);
  fs.mkdirSync(storage, { recursive: true });
  const lockPath = path.join(storage, 'active.lock');
  let lock;
  try { lock = fs.openSync(lockPath, 'wx'); }
  catch (error) { if (error.code === 'EEXIST') throw Error(`A project check is already active, or its lock survived an interruption: ${lockPath}`); throw error; }
  fs.writeFileSync(lock, JSON.stringify({ pid: process.pid, startedAtUtc: new Date().toISOString() }));
  try { return await performCheck(mod, options); }
  finally { fs.closeSync(lock); fs.unlinkSync(lockPath); }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { const args = process.argv.slice(2); if (args.length !== 2 || args[0] !== '--mod') throw Error('Usage: check.mjs --mod <mod>'); const result = await checkProject(args[1]); process.exitCode = result.exitCode; }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
