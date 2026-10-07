import { loadConfig } from '../config.mjs';
import { loadModConfig } from '../mod-config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { extract, parse, analyze } from './engine.mjs';
import { identity, buildIdentity, productionOwners } from '../evidence-identity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '../..');
const read = file => fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, '');
function files(directory, extension) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name)).flatMap(entry => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? files(file, extension) : entry.isFile() && entry.name.endsWith(extension) ? [file] : [];
  });
}
export function generate(mod, noVanilla = false, options = {}) {
  if (!/^[a-zA-Z0-9_-]+$/.test(mod)) throw Error('Invalid mod name.');
  const root=path.resolve(options.root || projectRoot);
  const source = path.join(root, 'mod', mod);
  if (!fs.existsSync(source)) throw Error(`Mod does not exist: ${mod}`);
  const startedAtUtc=new Date().toISOString();
  const artifactBuild=buildIdentity(source);
  const reportIdentity=identity({sourceMod:productionOwners.includes(mod)?mod:null,
    storageNamespace:options.storageNamespace || mod,artifactKind:options.artifactKind || (productionOwners.includes(mod)?'production':'untracked'),
    evidenceSource:'static',coveredLayers:['STATIC'],artifactBuild,runId:crypto.randomUUID(),startedAtUtc});
  const data = { mod, generatedAtUtc: new Date().toISOString(), series: [], diagnostics: [], externalMissions: [], icons: [], iconIndexAvailable: false, sourceFiles: [], referenceLimitations: [] };
  const titles = {};
  for (const file of files(path.join(source, 'localisation'), '.yml')) {
    const text = read(file);
    if (!/^\s*l_english\s*:/m.test(text)) continue;
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([^\s:#]+):\d*\s+"((?:\\.|[^"\\])*)"/);
      if (match) {
        if (Object.hasOwn(titles, match[1])) data.diagnostics.push({ severity: 'warning', code: 'duplicate-localisation', message: `Duplicate English key ${match[1]} in ${path.relative(source, file)}.`, missions: [] });
        titles[match[1]] = match[2].replace(/§./g, '').replace(/\\n/g, ' ').replace(/\\"/g, '"');
      }
    }
  }
  const missionFiles = files(path.join(source, 'missions'), '.txt');
  if (!missionFiles.length) throw Error('No mission scripts found.');
  for (const file of missionFiles) {
    const bytes = fs.readFileSync(file);
    const relative = path.relative(source, file).replaceAll('\\', '/');
    data.sourceFiles.push({ path: relative, sha256: crypto.createHash('sha256').update(bytes).digest('hex') });
    try { const result = extract(bytes.toString('utf8'), relative, titles); data.series.push(...result.series); data.diagnostics.push(...result.diagnostics); }
    catch (error) { data.diagnostics.push({ severity: 'error', code: 'parse-error', message: error.message, missions: [] }); }
  }
  const config = loadConfig('cwtools', root);
  const game = config.gamePath;
  const modNames = new Set(missionFiles.map(file => path.basename(file).toLowerCase()));
  if (!noVanilla) {
    for (const file of files(path.join(game, 'missions'), '.txt')) {
      // A same-named mod file replaces its vanilla counterpart.
      if (modNames.has(path.basename(file).toLowerCase())) continue;
      try { data.externalMissions.push(...extract(read(file), file).series.flatMap(group => group.missions.map(mission => mission.id))); }
      catch (error) { data.referenceLimitations.push(`Could not index vanilla ${path.basename(file)}: ${error.message}`); }
    }
  }
  const interfaceFiles = [...(!noVanilla ? files(path.join(game, 'interface'), '.gfx') : []), ...files(path.join(source, 'interface'), '.gfx')];
  function sprites(nodes) {
    for (const node of nodes) {
      if (node.key.toLowerCase() === 'spritetype' && Array.isArray(node.value)) {
        const name = node.value.find(entry => entry.key === 'name');
        if (name) data.icons.push(name.value);
      }
      if (Array.isArray(node.value)) sprites(node.value);
    }
  }
  for (const file of interfaceFiles) {
    try { sprites(parse(read(file), file)); }
    catch (error) { data.referenceLimitations.push(`Could not index interface ${path.basename(file)}: ${error.message}`); }
  }
  data.iconIndexAvailable = interfaceFiles.length > 0;
  data.externalMissions = [...new Set(data.externalMissions)];
  data.icons = [...new Set(data.icons)];
  const modMetadata=loadModConfig(mod,root,{onNotice:message=>console.error(message)});
  data.scenarios = modMetadata.missionInspector.scenarios;
  data.mutuallyExclusiveFlags = modMetadata.missionInspector.mutuallyExclusiveFlags;
  const reports = data.scenarios.map(scenario => ({ scenario, ...analyze(data, scenario) }));
  if(buildIdentity(source).sha256!==artifactBuild.sha256) throw Error('Inspector source changed during inspection.');
  const output = path.join(options.storage || path.join(here, 'reports'), reportIdentity.storageNamespace);
  fs.mkdirSync(output, { recursive: true });
  const engine = read(path.join(here, 'engine.mjs')).replace(/^export /gm, '');
  const json = JSON.stringify(data).replaceAll('<', '\\u003c');
  const html = read(path.join(here, 'viewer.html')).replace('/*__DATA__*/', `const DATA = ${json};`).replace('/*__ENGINE__*/', engine).replace('/*__VIEWER__*/', read(path.join(here, 'viewer.js')));
  fs.writeFileSync(path.join(output, 'index.html'), html);
  const report={...reportIdentity,status:'complete',finishedAtUtc:new Date().toISOString(),verdict:reports.some(r=>!r.scenario.diagnostic && r.summary.error)?'FAIL':'PASS',verdictSource:'mission inspector structural scenarios; STATIC only',mod,generatedAtUtc:data.generatedAtUtc,sourceFiles:data.sourceFiles,referenceLimitations:data.referenceLimitations,scenarios:reports};
  fs.writeFileSync(path.join(output, 'latest.json'), JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(path.join(output, 'latest.txt'), reports.map(report => [`Scenario: ${report.scenario.name}`, `Missions: ${report.missions.length}; errors: ${report.summary.error}; warnings: ${report.summary.warning}; info: ${report.summary.info}`, ...report.findings.map(finding => `[${finding.severity} ${finding.code}] ${finding.message}`)].join('\n')).join('\n\n') + '\n');
  return { output, identity:report, missions: data.series.reduce((sum, group) => sum + group.missions.length, 0), reports };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = process.argv.slice(2); let mod = 'brittany_missions', noVanilla = false;
    while (args.length) { const arg = args.shift(); if (arg === '--mod') mod = args.shift(); else if (arg === '--no-vanilla') noVanilla = true; else throw Error(`Unknown argument: ${arg}`); }
    const result = generate(mod, noVanilla);
    console.log(`Inspector: ${path.join(result.output, 'index.html')}`);
    for (const report of result.reports) console.log(`${report.scenario.name}${report.scenario.diagnostic ? ' [diagnostic only]' : ''}: ${report.missions.length} missions, ${report.summary.error} errors, ${report.summary.warning} warnings.`);
    process.exitCode = result.reports.some(report => !report.scenario.diagnostic && report.summary.error > 0) ? 1 : 0;
  } catch (error) { console.error(error.message); process.exitCode = 2; }
}
