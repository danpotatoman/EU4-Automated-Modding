import { loadConfig } from '../config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { identity, productionOwners, canonicalPath, schemaVersion } from '../evidence-identity.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const writeJson = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n'); };
const inside = (base, child) => { const rel = path.relative(base, child); return rel !== '..' && !rel.startsWith('..' + path.sep) && !path.isAbsolute(rel); };

export function delta(before, after) {
  if (!before) return { mode: 'new', bytes: after };
  if (after.length >= before.length && after.subarray(0, before.length).equals(before)) {
    if (after.length === before.length) return { mode: 'unchanged', bytes: Buffer.alloc(0) };
    // A capture may end mid-line. Include that line's prefix when it later completes.
    const offset = before.length && before[before.length - 1] !== 10 ? before.lastIndexOf(10) + 1 : before.length;
    return { mode: 'appended', bytes: after.subarray(offset) };
  }
  return { mode: 'replaced-or-truncated', bytes: after };
}
export function messages(bytes) {
  // Strip clock timestamps only, preserving source filenames, line numbers and IDs.
  return bytes.toString('utf8').split(/\r?\n/).map(line => line.replace(/^\[\d{2}:\d{2}:\d{2}\]\s*/, '').trim()).filter(Boolean);
}
export function compare(current, baseline) {
  const counts = lines => { const result = new Map(); for (const line of lines) result.set(line, (result.get(line) || 0) + 1); return result; };
  const old = counts(baseline), now = counts(current);
  return [...now].map(([message, count]) => ({ message, count, baselineCount: old.get(message) || 0, additionalOccurrences: Math.max(0, count - (old.get(message) || 0)) }));
}
function snapshot(logs, destination) {
  if (!fs.existsSync(logs) || !fs.statSync(logs).isDirectory()) throw Error(`Logs directory not found: ${logs}`);
  fs.mkdirSync(destination, { recursive: true });
  const files = [];
  for (const entry of fs.readdirSync(logs, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.log') || /_old/.test(entry.name)) continue;
    const source = path.join(logs, entry.name);
    const statBefore = fs.statSync(source);
    const bytes = fs.readFileSync(source);
    const statAfter = fs.statSync(source);
    fs.writeFileSync(path.join(destination, entry.name), bytes);
    files.push({ name: entry.name, size: bytes.length, sha256: sha(bytes), modifiedAtUtc: statAfter.mtime.toISOString(), changedDuringCapture: statBefore.size !== statAfter.size || statBefore.mtimeMs !== statAfter.mtimeMs });
  }
  return files;
}
function verifyDeployment(record) {
  const problems = [];
  const expected = new Set(record.files.map(entry => path.resolve(record.target, entry.path).toLowerCase()));
  function inspect(directory) {
    if (!fs.existsSync(directory)) return;
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) problems.push(`symlink: ${path.relative(record.target, file)}`);
      else if (entry.isDirectory()) inspect(file);
      else if (!expected.has(file.toLowerCase())) problems.push(`extra file: ${path.relative(record.target, file)}`);
    }
  }
  if (fs.existsSync(record.target) && fs.lstatSync(record.target).isSymbolicLink()) throw Error('Deployment target is a symlink.');
  inspect(record.target);
  for (const entry of record.files) {
    const file = path.resolve(record.target, entry.path);
    if (!inside(record.target, file)) throw Error('Deployment record contains an escaping path.');
    if (!fs.existsSync(file) || sha(fs.readFileSync(file)) !== entry.sha256.toLowerCase()) problems.push(entry.path);
  }
  if (!fs.existsSync(record.launcher) || sha(fs.readFileSync(record.launcher)) !== record.launcherSha256.toLowerCase()) problems.push('launcher descriptor');
  return problems;
}
export function main(args, options = {}) {
  const action = args.shift();
  const opts = {};
  while (args.length) {
    const key = args.shift();
    if (key === '--untracked') { opts.untracked = true; continue; }
    if (!['--mod', '--scenario', '--run', '--logs', '--deployment', '--outcome', '--notes', '--source-mod', '--artifact-kind', '--contract-id', '--provenance'].includes(key) || !args.length) throw Error(`Invalid argument: ${key}`);
    opts[key.slice(2)] = args.shift();
  }
  const mod = opts.mod || 'brittany_missions';
  if (!/^[a-zA-Z0-9_-]+$/.test(mod)) throw Error('Invalid mod name.');
  const storage = path.resolve(options.storage || path.join(here, 'reports'), mod);
  const activePath = path.join(storage, 'active.json');
  const baselinePath = path.join(storage, 'baseline.json');
  const runPath = id => {
    if (!/^[a-zA-Z0-9_-]+$/.test(id || '')) throw Error('Invalid or missing run ID.');
    return path.join(storage, id);
  };
  if (action === 'begin') {
    if (!opts.scenario) throw Error('Provide --scenario describing what you will test.');
    if (fs.existsSync(activePath)) throw Error('An unfinished run exists. Finish it before beginning another.');
    const config = loadConfig('deployment', root);
    const logs = path.resolve(opts.logs || path.join(config.gameModDirectory, '../logs'));
    let deployment = null;
    if (!opts.untracked) {
      const target = path.resolve(config.gameModDirectory, `${mod}_dev`);
      const key = sha(Buffer.from(target.toLowerCase())).slice(0, 16);
      const recordPath = path.resolve(opts.deployment || path.join(root, `tools/deployment/state/${mod}/${key}/latest.json`));
      if (!fs.existsSync(recordPath)) throw Error('No deployment record found. Deploy first, or use --untracked for a vanilla/unmanaged run.');
      const record = readJson(recordPath);
      if (record.schemaVersion !== undefined && record.schemaVersion !== schemaVersion) throw Error('Unsupported deployment schema version.');
      if (record.sourceMod && opts['source-mod'] && record.sourceMod !== opts['source-mod']) throw Error('Deployment source owner conflict.');
      if (record.storageNamespace && record.storageNamespace !== mod) throw Error('Deployment storage namespace conflict.');
      const problems = verifyDeployment(record);
      if (problems.length) throw Error(`Deployed build differs from record: ${problems.join(', ')}`);
      deployment = { recordPath, recordSha256: sha(fs.readFileSync(recordPath)), record };
    }
    const id = new Date().toISOString().replace(/[-:.]/g, '') + '_' + crypto.randomBytes(3).toString('hex');
    const dir = runPath(id);
    const before = snapshot(logs, path.join(dir, 'before'));
    const provenance = options.provenance || (opts.provenance ? readJson(opts.provenance) : {});
    if(provenance.schemaVersion!==undefined && provenance.schemaVersion!==schemaVersion) throw Error('Unsupported collector provenance schema version.');
    const kind = opts['artifact-kind'] || provenance.artifactKind || (opts.untracked ? 'untracked' : 'staged');
    const sourceMod = opts['source-mod'] || provenance.sourceMod || (!opts.untracked && argsExplicitMod() && productionOwners.includes(mod) ? mod : null);
    function argsExplicitMod() { return Object.hasOwn(opts,'mod'); }
    if (deployment?.record.sourceMod && sourceMod && deployment.record.sourceMod !== sourceMod) throw Error('Deployment source owner conflict.');
    if (deployment?.record.artifactKind && kind !== deployment.record.artifactKind) throw Error('Deployment artifact kind conflict.');
    if(deployment && kind==='production') throw Error('Deployed copy is staged, not canonical production.');
    if(opts['contract-id'] && provenance.contractId && opts['contract-id']!==provenance.contractId) throw Error('Collector contractId conflict.');
    if (sourceMod && deployment?.record.source && canonicalPath(deployment.record.source)!==canonicalPath(path.join(root,'mod',sourceMod))) throw Error('Deployment source path conflict.');
    for (const [key,value] of Object.entries({storageNamespace:mod,sourceMod,artifactKind:kind})) {
      if(Object.hasOwn(provenance,key) && provenance[key]!==value) throw Error(`Collector ${key} conflict.`);
    }
    const provenanceFields = Object.fromEntries(['contractId','suiteId','selectedMembers','sourceBuild','stagedBuild','artifactBuild','intendedEnvironment','runId','attemptId','coveredLayers'].filter(k=>Object.hasOwn(provenance,k)).map(k=>[k,provenance[k]]));
    // Collection establishes log capture only; caller's native layers stay declared.
    const recordIdentity = identity({...provenanceFields,sourceMod,storageNamespace:mod,artifactKind:kind,
      evidenceSource:'operator',coveredLayers:[],runId:provenance.runId || id,
      ...(opts['contract-id']?{contractId:opts['contract-id']}:{})});
    if (provenance.coveredLayers) recordIdentity.declaredLayers=provenance.coveredLayers;
    if(deployment?.record.sourceBuild && !recordIdentity.sourceBuild) recordIdentity.sourceBuild=deployment.record.sourceBuild;
    if(deployment?.record.artifactBuild && !recordIdentity.artifactBuild) recordIdentity.artifactBuild=deployment.record.artifactBuild;
    for(const field of ['sourceBuild','artifactBuild']) {
      const recorded=deployment?.record[field],declared=recordIdentity[field];
      if(recorded && declared && (recorded.sha256!==declared.sha256 || recorded.algorithm!==declared.algorithm)) throw Error(`Collector deployment ${field} conflict.`);
    }
    const metadata = { ...recordIdentity, id, mod, scenario: opts.scenario, startedAtUtc: new Date().toISOString(), status: 'running', logsDirectory: logs, deployment, before, notes: opts.notes || '', gameVersion: fs.existsSync(path.join(root, 'tools/cwtools/reports', mod, 'latest.json')) ? readJson(path.join(root, 'tools/cwtools/reports', mod, 'latest.json')).gameVersion : null, gameVersionSource: 'latest CWTools report; not verified against running game' };
    writeJson(path.join(dir, 'run.json'), metadata);
    writeJson(activePath, { schemaVersion, sourceMod,storageNamespace:mod,artifactKind:kind,id,runId:recordIdentity.runId });
    return { id, directory: dir, status: 'running' };
  }
  if (action === 'status') return fs.existsSync(activePath) ? readJson(path.join(runPath(readJson(activePath).id), 'run.json')) : { status: 'no-active-run' };
  const id = opts.run || (fs.existsSync(activePath) ? readJson(activePath).id : null);
  const dir = runPath(id);
  const metadata = readJson(path.join(dir, 'run.json'));
  if(metadata.schemaVersion!==undefined && metadata.schemaVersion!==schemaVersion) throw Error('Unsupported collector schema version.');
  if(metadata.storageNamespace && metadata.storageNamespace!==mod) throw Error('Collector storage namespace conflict.');
  if(opts['source-mod'] && metadata.sourceMod!==opts['source-mod']) throw Error('Collector source owner conflict.');
  if (action === 'baseline') {
    if (metadata.status !== 'complete') throw Error('Baseline must come from a completed run.');
    writeJson(baselinePath, { schemaVersion,sourceMod:metadata.sourceMod ?? null,storageNamespace:mod,artifactKind:metadata.artifactKind || 'untracked',id,scenario: metadata.scenario,selectedAtUtc: new Date().toISOString(),referenceSchemaVersion:metadata.schemaVersion ?? null });
    return { baseline: id, note: 'Selected explicitly; collector does not verify that this was a vanilla run.' };
  }
  if (action !== 'finish') throw Error('Action must be begin, finish, baseline or status.');
  if (metadata.status !== 'running') throw Error('Run already finished.');
  const outcome = opts.outcome || 'unverified';
  if (!['passed', 'failed', 'not-completed', 'unverified'].includes(outcome)) throw Error('Invalid outcome.');
  const after = snapshot(metadata.logsDirectory, path.join(dir, 'after'));
  const baseline = fs.existsSync(baselinePath) ? readJson(baselinePath) : null;
  const baselineReport = baseline ? readJson(path.join(runPath(baseline.id), 'report.json')) : null;
  const files = [];
  for (const entry of after) {
    const beforeFile = path.join(dir, 'before', entry.name);
    const result = delta(fs.existsSync(beforeFile) ? fs.readFileSync(beforeFile) : null, fs.readFileSync(path.join(dir, 'after', entry.name)));
    fs.mkdirSync(path.join(dir, 'delta'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'delta', entry.name), result.bytes);
    const lines = messages(result.bytes);
    const baselineLines = baselineReport?.files.find(file => file.name === entry.name)?.messages || [];
    files.push({ name: entry.name, mode: result.mode, messages: lines, comparison: compare(lines, baselineLines), errorLog: ['error.log', 'setup_error.log'].includes(entry.name) });
  }
  const missingLogs = metadata.before.filter(entry => !after.some(file => file.name === entry.name)).map(entry => entry.name);
  const deploymentChanges = metadata.deployment ? verifyDeployment(metadata.deployment.record) : null;
  const identityFields = Object.fromEntries(['schemaVersion','sourceMod','storageNamespace','artifactKind','contractId','suiteId','selectedMembers','sourceBuild','stagedBuild','artifactBuild','runId','attemptId','intendedEnvironment','coveredLayers','declaredLayers','evidenceSource','startedAtUtc'].filter(k=>Object.hasOwn(metadata,k)).map(k=>[k,metadata[k]]));
  const report = { ...identityFields, status:'complete', verdict:outcome==='passed'?'PASS':outcome==='failed'?'FAIL':outcome==='not-completed'?'INCOMPLETE':'UNVERIFIED', verdictSource:'operator supplied; collection does not establish gameplay', id, scenario: metadata.scenario, outcome, outcomeSource: 'operator supplied; logs do not establish gameplay success', notes: opts.notes || '', finishedAtUtc: new Date().toISOString(), baseline, changedLogs: files.filter(file => file.mode !== 'unchanged').length, missingLogs, unstableCapture: after.some(file => file.changedDuringCapture) || metadata.before.some(file => file.changedDuringCapture), deploymentChanges, files };
  const findings = files.filter(file => file.errorLog).flatMap(file => file.comparison.filter(item => item.additionalOccurrences).map(item => ({ log: file.name, ...item })));
  report.newErrorMessages = findings;
  writeJson(path.join(dir, 'report.json'), report);
  const text = [`Run: ${id}`, `Scenario: ${metadata.scenario}`, `Gameplay outcome (operator): ${outcome}`, `Baseline: ${baseline?.id || 'none; all captured error messages listed as unbaselined'}`, `Changed logs: ${report.changedLogs}`, `Missing logs: ${missingLogs.join(', ') || 'none'}`, `Capture changed while reading: ${report.unstableCapture}`, `Deployment changes: ${deploymentChanges === null ? 'untracked' : deploymentChanges.join(', ') || 'none'}`, '', 'New or increased error messages:', ...findings.map(item => `[${item.log}] +${item.additionalOccurrences} ${item.message}`), '', 'No log errors does not prove gameplay success. Unchanged logs do not prove a game run occurred.'];
  fs.writeFileSync(path.join(dir, 'report.txt'), text.join('\n') + '\n');
  writeJson(path.join(dir, 'run.json'), { ...metadata, status: 'complete', after, finishedAtUtc: report.finishedAtUtc });
  writeJson(path.join(storage, 'latest.json'), { ...identityFields,id,report: path.join(dir, 'report.json') });
  if (fs.existsSync(activePath) && readJson(activePath).id === id) fs.unlinkSync(activePath);
  return { id, report: path.join(dir, 'report.txt'), outcome, newErrorMessages: findings.length, changedLogs: report.changedLogs };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { console.log(JSON.stringify(main(process.argv.slice(2)), null, 2)); }
  catch (error) { console.error(error.message); process.exitCode = 2; }
}
