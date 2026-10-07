// A small LSP client for the CWTools server shipped with its VS Code extension.
// No npm packages, VS Code session, game launch, or network access are required.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { loadConfig } from '../config.mjs';
import { cwtoolsIdentity, buildIdentity } from '../evidence-identity.mjs';

const args = process.argv.slice(2);
try {
  const valueFlags=['--project','--mod','--source-mod','--report-key','--artifact-kind','--project-identity'];
  for(let i=0;i<args.length;i++) {
    if(args[i]==='--rebuild-cache') continue;
    if(!valueFlags.includes(args[i]) || !args[i+1] || args[i+1].startsWith('--')) throw Error(`Invalid CWTools argument: ${args[i]}`);
    i++;
  }
} catch(error) {console.error(error.message);process.exit(2);}
const projectArg = args.indexOf('--project');
const helper = path.dirname(fileURLToPath(import.meta.url));
const helperProject = path.resolve(helper, '../..');
const modArg = args.indexOf('--mod');
const modName = modArg < 0 ? 'brittany_missions' : args[modArg + 1];
const project = path.resolve(projectArg < 0 ? path.join(helperProject, 'mod', modName) : args[projectArg + 1]);
const argValue = name => args.includes(name) ? args[args.indexOf(name)+1] : undefined;
const startedAtUtc = new Date().toISOString();
const runId = crypto.randomUUID();
// Basename fallback preserves report locations; applicability requires full path/build.
let reportIdentity;
try {reportIdentity = cwtoolsIdentity({root:helperProject,project,sourceMod:argValue('--source-mod'),
  reportKey:argValue('--report-key'),artifactKind:argValue('--artifact-kind'),projectIdentity:argValue('--project-identity')});}
catch(error) {console.error(error.message);process.exit(2);}
const reports = path.join(helper, 'reports', reportIdentity.storageNamespace);
const cache = path.join(helper, '.cache');
fs.mkdirSync(reports, { recursive: true });
fs.mkdirSync(cache, { recursive: true });
const reportFile = path.join(reports, 'latest.json');
const textFile = path.join(reports, 'latest.txt');
const logFile = path.join(reports, 'server.log');
fs.writeFileSync(logFile, '');
// Invalidate the previous report before any configuration or startup failure.
fs.writeFileSync(reportFile, JSON.stringify({ ...reportIdentity, runId, status: 'running', startedAt: startedAtUtc, startedAtUtc }, null, 2));
fs.writeFileSync(textFile, 'Validation is running; previous results are no longer current.\n');

let active;
let artifactBuild;
function findExtension() {
  const base = path.join(os.homedir(), '.vscode/extensions');
  if (!fs.existsSync(base)) return undefined;
  return fs.readdirSync(base).filter(n => n.startsWith('tboby.cwtools-vscode-'))
    .map(n => path.join(base, n)).sort((a, b) =>
      JSON.parse(fs.readFileSync(path.join(b, 'package.json'))).version.localeCompare(
        JSON.parse(fs.readFileSync(path.join(a, 'package.json'))).version, undefined, { numeric: true }))
    .find(dir => fs.existsSync(path.join(dir, 'bin/server/win-x64/CWTools Server.exe')));
}
function filesUnder(dir, extension) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory()
    ? filesUnder(path.join(dir, e.name), extension)
    : e.name.endsWith(extension) ? [path.join(dir, e.name)] : []);
}
function localFile(uri) {
  try { return fileURLToPath(uri); } catch { return null; }
}
function isProjectFile(filename) {
  if (!filename) return false;
  const relative = path.relative(project, filename);
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

class Client {
  constructor(server, timeoutSeconds) {
    this.buffer = Buffer.alloc(0);
    this.nextId = 1;
    this.pending = new Map();
    this.diagnostics = new Map();
    this.fileList = null;
    this.reload = false;
    this.finished = false;
    this.stderr = '';
    this.failure = null;
    this.process = spawn(server, [], { cwd: project, windowsHide: true, stdio: ['pipe', 'pipe', 'pipe'] });
    this.process.stdout.on('data', bytes => {
      try { this.receive(bytes); } catch (error) { this.fail(error); }
    });
    this.process.stderr.on('data', bytes => {
      const value = bytes.toString();
      this.stderr += value;
      fs.appendFileSync(logFile, value);
      if (/Exception in language server|Unhandled exception/.test(this.stderr)) {
        this.fail(new Error(`CWTools server failed. See ${logFile}`));
      }
    });
    this.process.on('error', error => this.fail(error));
    this.process.on('exit', code => {
      if (!this.stopping) this.fail(new Error(`CWTools server exited unexpectedly (${code}). See ${logFile}`));
    });
    this.process.stdin.on('error', error => { if (!this.stopping) this.fail(error); });
    this.timer = setTimeout(() => this.fail(new Error(`CWTools timed out after ${timeoutSeconds}s. See ${logFile}`)), timeoutSeconds * 1000);
  }
  fail(error) {
    this.failure ??= error;
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    this.rejectComplete?.(error);
  }
  send(message) {
    const body = Buffer.from(JSON.stringify({ jsonrpc: '2.0', ...message }));
    this.process.stdin.write(Buffer.concat([Buffer.from(`Content-Length: ${body.length}\r\n\r\n`), body]));
  }
  notify(method, params) { this.send({ method, params }); }
  request(method, params) {
    if (this.failure) return Promise.reject(this.failure);
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.send({ id, method, params });
    });
  }
  receive(bytes) {
    this.buffer = Buffer.concat([this.buffer, bytes]);
    for (;;) {
      const end = this.buffer.indexOf('\r\n\r\n');
      if (end < 0) return;
      const match = /Content-Length:\s*(\d+)/i.exec(this.buffer.subarray(0, end).toString());
      if (!match) throw new Error('Invalid CWTools protocol header');
      const size = Number(match[1]);
      if (this.buffer.length < end + 4 + size) return;
      const message = JSON.parse(this.buffer.subarray(end + 4, end + 4 + size).toString());
      this.buffer = this.buffer.subarray(end + 4 + size);
      this.handle(message);
    }
  }
  handle(message) {
    if (message.method && message.id !== undefined) {
      // Deny unexpected edits or requests requiring editor interaction.
      this.send({ id: message.id, error: { code: -32601, message: `Unsupported client request: ${message.method}` } });
      this.fail(new Error(`CWTools requested unsupported interaction: ${message.method}`));
      return;
    }
    if (!message.method) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      message.error ? pending.reject(new Error(JSON.stringify(message.error))) : pending.resolve(message.result);
      return;
    }
    const p = message.params;
    if (message.method === 'textDocument/publishDiagnostics') {
      // Startup publishes parser and rule diagnostics in separate batches.
      // Preserve both; deduplicate exact repeats rather than replacing batches.
      for (const diagnostic of p.diagnostics) {
        const filename = localFile(p.uri);
        if (isProjectFile(filename)) this.diagnostics.set(JSON.stringify([p.uri, diagnostic]), { filename, ...diagnostic });
      }
    } else if (message.method === 'updateFileList') this.fileList = p.fileList;
    else if (message.method === 'forceReload') {
      this.reload = true;
      console.log(`CWTools: ${p}`);
    } else if (message.method === 'loadingBar') {
      if (p.enable) console.log(`CWTools: ${p.value}`);
      else { this.finished = true; this.resolveComplete?.(); }
    } else if (message.method === 'promptVanillaPath' || message.method === 'promptReload') {
      this.fail(new Error(`CWTools needs configuration: ${message.method} ${JSON.stringify(p)}`));
    }
  }
  complete() {
    if (this.failure) return Promise.reject(this.failure);
    if (this.finished) return Promise.resolve();
    return new Promise((resolve, reject) => { this.resolveComplete = resolve; this.rejectComplete = reject; });
  }
  stop() {
    clearTimeout(this.timer);
    this.stopping = true;
    this.process.kill();
  }
}

try {
  artifactBuild = buildIdentity(project);
  const config = loadConfig('cwtools');
  const extension = config.extensionPath || findExtension();
  if (!extension) throw new Error('CWTools extension not found. Install tboby.cwtools-vscode or set extensionPath in config.json.');
  const server = path.join(extension, 'bin/server/win-x64/CWTools Server.exe');
  const version = JSON.parse(fs.readFileSync(path.join(extension, 'package.json'))).version;
  const rules = path.resolve(helperProject, config.rulesPath);
  const ruleFiles = [...filesUnder(rules, '.cwt'), ...filesUnder(rules, '.log')];
  if (ruleFiles.length < 10) throw new Error(`EU4 rules are missing or incomplete: ${rules}`);
  if (!fs.existsSync(path.join(config.gamePath, 'eu4.exe')) || !fs.existsSync(path.join(config.gamePath, 'common'))) {
    throw new Error(`EU4 installation not found: ${config.gamePath}. Update gamePath in tools/cwtools/config.json.`);
  }
  const launcherSettings = path.join(config.gamePath, 'launcher-settings.json');
  const gameVersion = JSON.parse(fs.readFileSync(launcherSettings, 'utf8')).rawVersion;
  const cacheKey = JSON.stringify({ version, gamePath: config.gamePath, gameVersion,
    launcherModified: fs.statSync(launcherSettings).mtimeMs });
  const cacheMeta = path.join(cache, 'game-cache-key.json');
  const gameCache = path.join(cache, 'eu4.cwb');
  if (args.includes('--rebuild-cache') || !fs.existsSync(cacheMeta) || fs.readFileSync(cacheMeta, 'utf8') !== cacheKey) {
    if (fs.existsSync(gameCache)) fs.unlinkSync(gameCache);
  }
  const rootUri = pathToFileURL(project).href;
  const expectedFiles = ['common', 'events', 'decisions', 'missions'].flatMap(dir => filesUnder(path.join(project, dir), '.txt'))
    .concat(filesUnder(path.join(project, 'localisation'), '.yml'));
  if (!expectedFiles.length) throw new Error('No EU4 scripts or localisation files found in the selected project.');
  for (let attempt = 0; attempt < 2; attempt++) {
    active = new Client(server, config.timeoutSeconds || 300);
    await active.request('initialize', {
      processId: process.pid, rootPath: project, rootUri,
      workspaceFolders: [{ uri: rootUri, name: path.basename(project) }],
      capabilities: {}, trace: 'off',
      initializationOptions: {
        language: 'eu4', isVanillaFolder: false, rulesCache: cache,
        rules_version: 'manual', repoPath: 'https://github.com/cwtools/cwtools-eu4-config', diagnosticLogging: false
      }
    });
    active.notify('initialized', {});
    active.notify('workspace/didChangeConfiguration', { settings: { cwtools: {
      localisation: { languages: config.languages || ['English'], generated_strings: ':0 "REPLACE_ME"' },
      errors: { vanilla: false, ignore: [], ignorefiles: [] },
      experimental: config.experimental ?? true, debug_mode: false, logging: { diagnostic: false },
      trace: { server: 'off' }, cache: { eu4: config.gamePath, stellaris: '', hoi4: '', ck2: '',
        imperator: '', vic2: '', ck3: '', vic3: '', eu5: '' },
      rules_folder: rules, maxFileSize: 10, ignore_patterns: []
    } } });
    await active.complete();
    if (active.reload) {
      active.stop();
      if (attempt === 1) throw new Error('CWTools requested another reload after cache generation.');
      continue;
    }
    if (!active.fileList) throw new Error(`CWTools did not finish loading the project. See ${logFile}`);
    const loaded = new Set(active.fileList.map(f => localFile(f.uri)).filter(Boolean).map(f => path.resolve(f).toLowerCase()));
    const missing = expectedFiles.filter(f => !loaded.has(f.toLowerCase()));
    if (missing.length) throw new Error(`CWTools did not load these project files: ${missing.join(', ')}`);
    if (/Unhandled exception|System\.[\w.]+Exception/.test(active.stderr)) {
      throw new Error(`CWTools logged an exception; results are incomplete. See ${logFile}`);
    }
    const severityNames = { 1: 'error', 2: 'warning', 3: 'information', 4: 'hint' };
    const diagnostics = [...active.diagnostics.values()].map(d => ({
      file: path.relative(project, d.filename).replaceAll('\\', '/'),
      line: d.range.start.line + 1, column: d.range.start.character + 1,
      severity: severityNames[d.severity] || 'information', code: d.code, message: d.message,
      range: d.range, relatedInformation: d.relatedInformation
    })).sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line || a.column - b.column);
    const errors = diagnostics.filter(d => d.severity === 'error').length;
    const warnings = diagnostics.filter(d => d.severity === 'warning').length;
    const ruleHash = crypto.createHash('sha256');
    for (const file of ruleFiles.sort()) ruleHash.update(path.relative(rules, file)).update(fs.readFileSync(file));
    if (buildIdentity(project).sha256 !== artifactBuild.sha256) throw Error('Project changed during validation; result is not applicable.');
    const report = { ...reportIdentity, artifactBuild, runId, startedAtUtc, finishedAtUtc: new Date().toISOString(),
      verdict: errors ? 'FAIL' : 'PASS', verdictSource: 'CWTools diagnostics; STATIC only',
      status: 'complete', validatedAt: new Date().toISOString(), project,
      cwtoolsVersion: version, gameVersion, gamePath: config.gamePath,
      rulesPath: rules, rulesSha256: ruleHash.digest('hex'), ruleFileCount: ruleFiles.length,
      languages: config.languages || ['English'], projectFileCount: expectedFiles.length,
      summary: { errors, warnings, total: diagnostics.length }, diagnostics };
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
    const summary = `CWTools ${version}, EU4 ${gameVersion}: ${expectedFiles.length} project files; ${errors} errors, ${warnings} warnings.`;
    fs.writeFileSync(textFile, summary + '\n\n' + diagnostics.map(d =>
      `${d.file}:${d.line}:${d.column} [${d.severity} ${d.code ?? ''}] ${d.message}`).join('\n') + '\n');
    fs.writeFileSync(cacheMeta, cacheKey);
    active.stop();
    console.log(summary);
    console.log(`Report: ${textFile}`);
    process.exitCode = errors ? 1 : 0;
    break;
  }
} catch (error) {
  active?.stop();
  const report = { ...reportIdentity, artifactBuild, runId, startedAtUtc, finishedAtUtc: new Date().toISOString(),
    verdict: 'INCOMPLETE', verdictSource: 'CWTools infrastructure failure', status: 'failed', failedAt: new Date().toISOString(), project, message: error.message, logFile };
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2) + '\n');
  fs.writeFileSync(textFile, `Validation failed: ${error.message}\n`);
  console.error(report.message);
  process.exitCode = 2;
}
