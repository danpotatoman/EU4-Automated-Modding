import { loadConfig } from '../config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { main as collect } from '../test-runs/collector.mjs';
import { evaluate } from './evaluate.mjs';
import { behaviors, requiredTests } from './behaviors.mjs';
import { inspectWiring } from './wiring.mjs';
import { claimChecks, claimModes, stageClaim } from './mission-claim.mjs';
import { inspectSnapshots } from './claim-save.mjs';
import { usaChecks, usaHook, stageUSA, evaluateUSA, inspectUSA } from './usa-slice.mjs';
import { windowsProcesses, recordedOwnership, ownedProcesses, sameProcess,
  cleanupOwned, observe, runAttempts, launchOwned, acquireRunLock, inside, profileInCommand } from './lifecycle.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const slash = value => value.replaceAll('\\', '/');
const args = process.argv.slice(2);
const suiteStarted = Date.now();
const test = args.includes('--test') ? args[args.indexOf('--test') + 1] : 'preview-gate';
const usa = test === 'usa-slice';
const sourceMod = usa ? 'american_century' : 'brittany_missions';
const runtimeMod = usa ? 'american_runtime' : 'brittany_runtime';
const claimMode = args.includes('--claim-mode') ? args[args.indexOf('--claim-mode') + 1] : 'click';
if (!claimModes.includes(claimMode)) throw Error('Unsupported claim mode');
const selectedTests = test === 'all' ? requiredTests : [test];
const inlineBaseline = args.includes('--inline-baseline');
const negativeControl = args.includes('--negative-control');
const timeout = Number(args.includes('--timeout') ? args[args.indexOf('--timeout') + 1] : 120);
const retries = Number(args.includes('--retries') ? args[args.indexOf('--retries') + 1] : 1);
const progressTimeout = Number(args.includes('--progress-timeout') ? args[args.indexOf('--progress-timeout') + 1] : 30);
const exerciseTermination = args.includes('--exercise-terminate-first');
const exerciseCrash = args.includes('--exercise-native-crash');
const exerciseFreeze = args.includes('--exercise-freeze-first');
if ([exerciseTermination, exerciseCrash, exerciseFreeze].filter(Boolean).length > 1) throw Error('Choose one recovery exercise.');
if (exerciseFreeze && (test !== 'all' || args.includes('--prepare-only') || inlineBaseline || negativeControl))
  throw Error('Freeze diagnostic requires a normal native all suite.');
if (!Number.isInteger(retries) || retries < 0 || retries > 2 || !Number.isInteger(progressTimeout) || progressTimeout < 5 || progressTimeout > 1800)
  throw Error('Retries must be 0..2 and progress timeout 5..1800 seconds.');
if (![...requiredTests, 'all', 'nantes-market', 'nantes-claim', 'run-effects', 'usa-slice'].includes(test) || !Number.isInteger(timeout) || timeout < 30 || timeout > 1800)
  throw Error('Use a documented runtime test or all; timeout must be 30..1800 seconds.');
if ((inlineBaseline || negativeControl) && test !== 'all' || inlineBaseline && negativeControl)
  throw Error('Comparison/negative-control modes require all and cannot be combined.');
const nonce = crypto.randomBytes(8).toString('hex');
const dir = path.join(here, 'work', new Date().toISOString().replace(/[-:.]/g, '') + '_' + nonce);
const profile = path.join(dir, 'profile');
const staged = path.join(dir, runtimeMod);
const logs = path.join(profile, 'logs');
fs.mkdirSync(logs, { recursive: true });
const game = loadConfig('cwtools', root).gamePath;
const normalProfile = path.dirname(loadConfig('deployment', root).gameModDirectory);
const launcher = readJson(path.join(normalProfile, 'dlc_load.json'));
if (!usa && (launcher.enabled_mods.length !== 1 || launcher.enabled_mods[0] !== 'mod/brittany_missions_dev.mod'
    || launcher.disabled_dlcs.length)) throw Error('Default launcher environment differs; inspect before testing.');
const dlcs = [...fs.readFileSync(path.join(root, 'docs/testing/environment.md'), 'utf8')
  .matchAll(/^  - (.+)$/gm)].map(m => m[1].trim());
if (dlcs.length !== 18) throw Error('Expected the documented 18 DLC. Review environment.md.');

fs.cpSync(path.join(root, 'mod',sourceMod), staged, { recursive: true });
const checksFor = name => name === 'usa-slice' ? usaChecks : name === 'nantes-claim' ? claimChecks : ['initial', ...dlcs.map((_, i) => `dlc-${i + 1}`), ...(behaviors[name]
  || (name === 'nantes-market' ? ['missing-building', 'fixture-marketplace', 'incomplete-before-action', 'rewards-absent-before-action',
    'mission-completed', 'downstream-parent-completed', 'selector-flags-unchanged']
  : ['implicit-bri', 'prestige-before-zero', 'flag-and-prestige-seven', 'scripted-flag-before',
    'scripted-flag-after', 'stability-before-zero', 'production-scripted-stability-one',
    'province-reward-before', 'province-value-correct', 'province-removed-zero',
    'finite-value-correct', 'cleanup-zero', 'missions-untouched']))];
const cases = selectedTests.map((name, i) => ({ test: name, nonce: test === 'all' ? `${nonce}_${i}` : nonce, checks: checksFor(name) }));
const checks = cases[0].checks;
const dlcAssertions = dlcs.map((dlc, i) => `if = {
    limit = { has_dlc = "${dlc}" }
    log = "EU4RT @NONCE@ OK dlc-${i + 1}"
}
else = { log = "EU4RT @NONCE@ FAIL dlc-${i + 1}" }`).join('\n');
const hooks = cases.map(item => usa ? usaHook(nonce,dlcAssertions.replaceAll('@NONCE@',nonce)) : fs.readFileSync(path.join(here,
  (behaviors[item.test] && item.test !== 'preview-gate') || item.test === 'nantes-claim' ? 'behavior-fixture.on_actions.txt' : `${item.test}.on_actions.txt`), 'utf8')
  .replace('@DLC_ASSERTIONS@', dlcAssertions).replaceAll('@NONCE@', item.nonce).replaceAll('@TEST@', item.test));
// Assemble one on_startup, rather than depend on unverified hook merge behavior.
const hook = test === 'all' ? `on_startup = {\n${hooks.map(value => value.slice(value.indexOf('on_startup = {') + 'on_startup = {'.length, value.lastIndexOf('}'))).join('\n')}\n}\n` : hooks[0];
fs.mkdirSync(path.join(staged, 'common/on_actions'), { recursive: true });
fs.writeFileSync(path.join(staged, 'common/on_actions/zz_runtime_test.txt'), hook);
const descriptor = `name="${usa?'American':'Brittany'} Runtime Test (DO NOT EXPORT)"\npath="${slash(staged)}"\nsupported_version="1.37.*"\n`;
fs.mkdirSync(path.join(profile, 'mod'), { recursive: true });
fs.writeFileSync(path.join(profile, 'mod/runtime_test.mod'), descriptor);
fs.writeFileSync(path.join(staged, 'descriptor.mod'), descriptor.replace(/^path=.*\n/m, ''));
fs.writeFileSync(path.join(profile, 'dlc_load.json'), JSON.stringify({ enabled_mods: ['mod/runtime_test.mod'], disabled_dlcs: [] }));
const wiring = usa ? {passed:true,layer:'WIRING',findings:[],adapters:[],scope:'USA CWTools/layout; native tree membership checked independently'} : inspectWiring(staged, selectedTests, inlineBaseline);
if (inlineBaseline) {
  fs.mkdirSync(path.join(staged, 'common/scripted_effects'), { recursive: true });
  fs.writeFileSync(path.join(staged, 'common/scripted_effects/BRI_mission_effects.txt'),
    wiring.adapters.map(item => `# Generated exact inline baseline adapter; comparison only.\n${item.effectName} = {${item.body}}\n`).join('\n'));
}
if (negativeControl) {
  const triggerFile = path.join(staged, 'common/scripted_triggers/BRI_mission_triggers.txt');
  const effectFile = path.join(staged, 'common/scripted_effects/BRI_mission_effects.txt');
  const mutate = (file, from, to) => {
    const value = fs.readFileSync(file, 'utf8');
    if (!value.includes(from)) throw Error(`Negative-control target missing: ${from}`);
    fs.writeFileSync(file, value.replace(from, to));
  };
  mutate(triggerFile, 'NOT = { has_country_flag = bri_diplomacy_preview }', 'always = yes');
  mutate(effectFile, 'add_building = shipyard', 'add_building = dock');
  mutate(effectFile, 'add_dip_power = 50', 'add_dip_power = 49');
}
let runFile;
const nativeFiles = [];
if (test === 'run-effects') {
  runFile = `eu4rt_effects_${nonce}.txt`;
  const body = fs.readFileSync(path.join(here, 'run-effects.run.txt'), 'utf8').replaceAll('@NONCE@', nonce);
  const after = fs.readFileSync(path.join(here, 'run-effects.after.txt'), 'utf8').replaceAll('@NONCE@', nonce);
  fs.writeFileSync(path.join(profile, runFile), body);
  fs.writeFileSync(path.join(profile, 'eu4rt_after.txt'), after);
  fs.writeFileSync(path.join(profile, 'eu4rt_run.commands'), `run ${runFile}\r\nrun eu4rt_after.txt\r\n`);
  fs.mkdirSync(path.join(staged, 'common/scripted_effects'), { recursive: true });
  const named = `eu4rt_named_probe_${nonce} = { set_country_flag = eu4rt_scripted_${nonce} }\n`;
  // The wrapper validates the exact plain file body; it is never called in game.
  fs.writeFileSync(path.join(staged, 'common/scripted_effects/eu4rt_run_probe.txt'),
    named + `eu4rt_static_wrapper_${nonce} = {\n${body}\n${after}\n}\n`);
}
const effectCases = cases.filter(item => behaviors[item.test] && item.test !== 'preview-gate');
if (effectCases.length) {
  const wrappers = [];
  const commands = [];
  for (const item of effectCases) {
    const filename = `eu4rt_${item.test}.txt`;
    const body = fs.readFileSync(path.join(here, `${item.test}.run.txt`), 'utf8').replaceAll('@NONCE@', item.nonce);
    fs.writeFileSync(path.join(profile, filename), body);
    nativeFiles.push({ file: path.join(profile, filename), sha256: hash(path.join(profile, filename)) });
    commands.push(`run ${filename}`);
    wrappers.push(`eu4rt_static_${item.test.replaceAll('-', '_')}_${nonce} = {\n${body}\n}\n`);
  }
  fs.writeFileSync(path.join(profile, 'eu4rt_run.commands'), commands.join('\r\n') + '\r\n');
  nativeFiles.push({ file: path.join(profile, 'eu4rt_run.commands'), sha256: hash(path.join(profile, 'eu4rt_run.commands')) });
  fs.mkdirSync(path.join(staged, 'common/scripted_effects'), { recursive: true });
  fs.writeFileSync(path.join(staged, 'common/scripted_effects/eu4rt_behavior_wrappers.txt'), wrappers.join('\n'));
}
// Reuse display preferences, but never write to the user's normal profile.
fs.copyFileSync(path.join(normalProfile, 'settings.txt'), path.join(profile, 'settings.txt'));
let missionClaim;
if (test === 'nantes-claim' || usa) {
  missionClaim = (usa ? stageUSA : stageClaim)({profile,staged,game,nonce,mode:claimMode});
  for (const file of missionClaim.files) nativeFiles.push({file:path.join(profile,file),sha256:hash(path.join(profile,file))});
}
const manifest = [];
function inventory(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) inventory(file);
    else manifest.push({ path: slash(path.relative(staged, file)), sha256: hash(file) });
  }
}
inventory(staged);
const launchArgs = ['-debug', `-userdir=${slash(profile)}/`, `-start_tag=${usa?'ENG':'BRI'}`];
if (runFile || nativeFiles.length) launchArgs.push('-auto_run=eu4rt_run.commands');
const report = { test, nonce, status: 'prepared', behavioralPass: false, directory: dir,
  installedVersion: readJson(path.join(game, 'launcher-settings.json')).version,
  versionSource: 'installed launcher-settings.json; running version must also be checked in logs',
  launcherConfiguration: launcher, dlcs, stagedManifest: manifest, launchArgs,
  staticValidation: {}, wiring, inlineBaseline, negativeControl, nativeFiles,
  ...(missionClaim ? { missionClaim } : {}),
  recoveryPolicy: { retries, maxAttempts: retries + 1, timeoutSeconds: timeout, progressTimeoutSeconds: progressTimeout },
  caseDefinitions: cases, automated: ['isolated staging', 'CWTools', 'process launch',
    'native startup hook (experimental)', 'log assertions', 'bounded owned-process cleanup'], manual: [] };
if (selectedTests.includes('textiles-upgrade')) {
  const file = path.join(game, 'common/scripted_effects/00_scripted_effects.txt');
  report.productionHelper = { name: 'add_or_upgrade_production_building', file, sha256: hash(file) };
}
const saveReport = () => fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(report, null, 2) + '\n');
if (runFile) {
  report.runFile = { file: path.join(profile, runFile), command: `run ${runFile}`,
    sha256: hash(path.join(profile, runFile)), afterSha256: hash(path.join(profile, 'eu4rt_after.txt')),
    commandsSha256: hash(path.join(profile, 'eu4rt_run.commands')) };
  report.behavioralScope = 'run-file effects and observability, not production mission completion';
  report.missionCompletionPass = false;
  report.automated.push('native auto_run console batch', 'plain run-file effects');
}
if (nativeFiles.length) {
  report.behavioralScope = 'production logic/effects plus static wiring; no normal mission dispatch';
  report.missionCompletionPass = false;
  report.automated.push('native auto_run console batch', missionClaim ? 'plain run-file fixtures/assertions' : 'plain run-file production effect calls');
  if(missionClaim) report.automated.push('owned UI identity handoff to Codex input adapter');
}
saveReport();
console.log(`Prepared ${dir}`);
async function validate(project, label) {
  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    path.join(root, 'tools/validate-cwtools.ps1'), '-Project', project], { cwd: root, windowsHide: true, stdio: 'inherit' });
  const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  const source = path.join(root, 'tools/cwtools/reports', path.basename(project), 'latest.json');
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(dir, `cwtools-${label}.json`));
  report.staticValidation[label] = { exitCode, report: source };
  saveReport();
  if (exitCode !== 0) throw Error(`CWTools ${label} did not complete without errors: ${exitCode}`);
}
let releaseLock;
try {
  releaseLock = await acquireRunLock(path.join(here, 'work'), windowsProcesses);
  const stale = recordedOwnership(path.join(here, 'work'));
  report.preflightCleanup = await cleanupOwned(windowsProcesses, { game, ...stale });
  if (!report.preflightCleanup.clean) throw Error('Owned stale processes survived cleanup; refusing launch.');
  const refuseUnrelatedGame = () => {
    if (windowsProcesses.snapshot().some(item => /^eu4\.exe$/i.test(item.name)))
      throw Error('An unrelated EU4 is running; this test will not close or reuse it.');
  };
  refuseUnrelatedGame();
  const activeCapture = collect(['status', '--mod', runtimeMod]);
  if (activeCapture.status === 'running') {
    if (!inside(path.join(here, 'work'), activeCapture.logsDirectory)) throw Error('Unrecognized active runtime collector; refusing to overwrite it.');
    report.abandonedCapture = collect(['finish', '--mod', runtimeMod, '--run', activeCapture.id,
      '--outcome', 'not-completed', '--notes', 'Recovered abandoned isolated native run after owner exit.']);
  }
  await validate(path.join(root, 'mod',sourceMod), 'production');
  await validate(staged, 'staged');
  if (args.includes('--prepare-only')) {
    report.status = wiring.passed ? 'prepared-and-statically-validated' : 'fail';
    console.log(`${wiring.passed ? 'PREPARED' : 'FAIL (wiring)'}: ${test} (no behavioral run)`);
  } else {
    const attemptPolicy = await runAttempts({ retries, onAttempt: (attempt, attempts) => {
      report.attempts = attempts; saveReport();
      if (attempt.retryScheduled) console.log(`Recoverable ${attempt.reason}; cleanup verified, retrying (${attempt.number}/${retries + 1}).`);
    }, attempt: async number => {
      const attemptDir = path.join(dir, 'attempts', String(number));
      const attemptProfile = path.join(attemptDir, 'profile');
      const attemptLogs = path.join(attemptProfile, 'logs');
      // Copy only the prepared inputs, never a failed attempt's logs/saves/cache.
      fs.cpSync(profile, attemptProfile, { recursive: true });
      const attemptArgs = launchArgs.map(value => value.startsWith('-userdir=') ? `-userdir=${slash(attemptProfile)}/` : value)
        // Diagnostic timing gate: unchanged startup assertions emit BEGIN, while
        // effect ENDs cannot race the observer. The retry dispatches the full batch.
        .filter(value => !(exerciseFreeze && number === 1 && value.startsWith('-auto_run=')));
      let controlledCrash;
      if (exerciseCrash && number === 1) {
        const commandFile = path.join(attemptProfile, 'eu4rt_run.commands');
        fs.writeFileSync(commandFile, 'CrashReporter.SimulateCrash\r\n' + (fs.existsSync(commandFile) ? fs.readFileSync(commandFile, 'utf8') : ''));
        if (!attemptArgs.includes('-auto_run=eu4rt_run.commands')) attemptArgs.push('-auto_run=eu4rt_run.commands');
        controlledCrash = { command: 'CrashReporter.SimulateCrash', file: commandFile, sha256: hash(commandFile),
          evidence: 'installed native helplog retained in docs/testing/runtime-nantes-market/evidence/console-batch/game.log:119' };
      }
      const ownershipFile = path.join(dir, 'ownership.json');
      const context = { game, profiles: [attemptProfile], known: fs.existsSync(ownershipFile)
        ? JSON.parse(fs.readFileSync(ownershipFile, 'utf8')).known : [] };
      const result = { number, directory: attemptDir, profile: attemptProfile, launchCommand: [path.join(game, 'eu4.exe'), ...attemptArgs],
        startedAtUtc: new Date().toISOString(), reason: 'infrastructure-error', recoverable: false };
      if (missionClaim) { report.activeAttempt = {profile:attemptProfile,directory:attemptDir}; }
      if (controlledCrash) result.controlledCrash = controlledCrash;
      if (exerciseFreeze && number === 1) result.freezeDiagnostic = { timingGate: 'withhold auto_run dispatch on first attempt only',
        generalActivity: { source: 'harness diagnostic, not native assertions', prefix: 'EU4RT_DIAGNOSTIC unrelated-general-activity', count: 0 } };
      let child, streams = [], outputErrors = [], collectorRun;
      report.behavioralPass = report.nativeProbeVerified = false;
      report.caseResults = [];
      report.manual = [];
      delete report.error;
      try {
        const previous = recordedOwnership(path.join(here, 'work'));
        result.prelaunchCleanup = await cleanupOwned(windowsProcesses, { game, ...previous }, { passes: 1 });
        if (!result.prelaunchCleanup.clean) throw Error('Owned remnants remain before attempt launch.');
        refuseUnrelatedGame();
        collectorRun = collect(['begin', '--mod', runtimeMod, '--scenario', `Native ${test} ${nonce} attempt ${number}`,
          '--logs', attemptLogs, '--untracked']);
        report.collectorRun = result.collectorRun = collectorRun;
        ({ child, streams, outputErrors } = launchOwned(path.join(game, 'eu4.exe'), attemptArgs, { cwd: game, directory: attemptDir }));
        report.pid = result.pid = child.pid;
        if (missionClaim) report.activeAttempt.pid = child.pid;
        report.startedAtUtc = result.startedAtUtc;
        report.status = 'running';
        report.activeAttempt = { number, pid: child.pid, profile: attemptProfile };
        saveReport();
        console.log(`Launched owned EU4 PID ${child.pid}; attempt ${number}/${retries + 1}, timeout ${timeout}s.`);
        let sampledAt = 0, notifiedAt = Date.now();
        const readLog = name => {
          const file = path.join(attemptLogs, name);
          return fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
        };
        const observed = await observe(child, { timeoutMs: timeout * 1000, progressTimeoutMs: progressTimeout * 1000,
          read: () => ({ text: readLog('game.log'), isProgress: line => cases.some(item => line.includes(`EU4RT ${item.nonce} `)),
            graphicsFailure: /Failed to create device \(Adapter/.test(readLog('system.log')),
            crash: fs.existsSync(path.join(attemptProfile, 'crashes')) && fs.readdirSync(path.join(attemptProfile, 'crashes')).length > 0 }),
          complete: text => missionClaim ? fs.existsSync(path.join(attemptDir,'ui-finish.json')) : cases.every(item => text.includes(`EU4RT ${item.nonce} END ${item.test}`)),
          onProgress: signal => {
            if (!result.freezeDiagnostic || result.freezeDiagnostic.suspension) return;
            const text = readLog('game.log');
            const begin = text.split(/\r?\n/).find(line => cases.some(item => line.includes(`EU4RT ${item.nonce} BEGIN ${item.test}`)));
            if (!begin || cases.every(item => text.includes(`EU4RT ${item.nonce} END ${item.test}`)))
              throw Error('Freeze diagnostic requires observed BEGIN before suite completion.');
            const identity = windowsProcesses.snapshot().find(item => item.pid === child.pid
              && context.known.some(old => sameProcess(old, item)) && profileInCommand(item.command, attemptProfile, true));
            if (!identity) throw Error('Cannot verify original owned EU4 instance for diagnostic suspension.');
            Object.assign(result.freezeDiagnostic, { begin, lastSignalBeforeSuspend: signal,
              progressObservedAtUtc: new Date().toISOString(), identity });
            result.freezeDiagnostic.suspension = windowsProcesses.suspend(identity);
            if (!result.freezeDiagnostic.suspension.threadCount || result.freezeDiagnostic.suspension.suspendedThreadCount !== result.freezeDiagnostic.suspension.threadCount)
              throw Error('Native suspension did not establish all observed threads suspended.');
            saveReport();
            console.log(`Diagnostic froze owned EU4 PID ${child.pid} after ${begin}; existing progress timeout ${progressTimeout}s.`);
          },
          onPoll: async () => {
            if(missionClaim && fs.existsSync(path.join(attemptDir,'ui-abort.json'))) throw Error('Owned UI driver requested abort');
            if(missionClaim && fs.existsSync(path.join(attemptDir,'ui-check-request.json'))) {
              const request=JSON.parse(fs.readFileSync(path.join(attemptDir,'ui-check-request.json'),'utf8'));
              const responseFile=path.join(attemptDir,'ui-check-response.json');
              const previous=fs.existsSync(responseFile) ? JSON.parse(fs.readFileSync(responseFile,'utf8')) : {};
              if(request.token!==previous.token) {
                const identity=windowsProcesses.snapshot().find(p=>p.pid===child.pid
                  && context.known.some(old=>sameProcess(old,p)) && profileInCommand(p.command,attemptProfile,true));
                fs.writeFileSync(responseFile,JSON.stringify({token:request.token,nonce,identity,
                  verifiedAtUtc:new Date().toISOString(),allowed:request.nonce===nonce && !!identity
                    && identity.windowHandle===request.windowHandle && sameProcess(identity,request.identity)}));
              }
            }
            if (Date.now() - sampledAt >= 2000) {
              const snapshot = windowsProcesses.snapshot();
              const rootProcess = ownedProcesses(snapshot, context).find(item => item.pid === child.pid
                && Date.parse(item.created) >= Date.parse(result.startedAtUtc) - 2000);
              if (rootProcess && !context.known.some(item => sameProcess(item, rootProcess))) context.known.push(rootProcess);
              for (const item of ownedProcesses(snapshot, context)) if (!context.known.some(old => sameProcess(item, old))) context.known.push(item);
              fs.writeFileSync(path.join(dir, 'ownership.json'), JSON.stringify({ profiles: [profile, ...Array.from({ length: number }, (_, i) => path.join(dir, 'attempts', String(i + 1), 'profile'))], known: context.known }, null, 2));
              if (missionClaim) fs.writeFileSync(path.join(attemptDir,'ui-lease.json'),JSON.stringify({
                nonce,mode:claimMode,identity:rootProcess,profile:attemptProfile,
                observedAtUtc:new Date().toISOString(),expiresAtUtc:new Date(Date.now()+5000).toISOString(),
                ready:readLog('game.log').includes(`EU4RT ${nonce} UI_READY ${test}`),
                failed:readLog('game.log').includes(`EU4RT ${nonce} FAIL `),
                geometry:missionClaim.geometry,geometries:missionClaim.geometries
              }));
              sampledAt = Date.now();
            }
            if (exerciseTermination && number === 1 && !result.controlledTermination && Date.now() - Date.parse(result.startedAtUtc) >= 5000) {
              result.controlledTermination = { atUtc: new Date().toISOString(), pid: child.pid,
                action: 'terminate original child handle', purpose: 'explicit isolated recovery exercise' };
              child.kill();
            }
            if (result.freezeDiagnostic?.suspension) {
              const activity = result.freezeDiagnostic.generalActivity;
              const atUtc = new Date().toISOString();
              fs.appendFileSync(path.join(attemptLogs, 'game.log'), `\n${activity.prefix} tick=${activity.count + 1} at=${atUtc}\n`);
              activity.count++;
              activity.firstAtUtc ||= atUtc;
              activity.lastAtUtc = atUtc;
            }
            if (Date.now() - notifiedAt > 15000) { console.log('Waiting for EU4 runtime assertions...'); notifiedAt = Date.now(); }
          },
        });
        Object.assign(result, observed);
        if (result.freezeDiagnostic?.suspension) Object.assign(result.freezeDiagnostic, {
          detectedAtUtc: new Date().toISOString(), reason: observed.reason,
          progressIdleSecondsAtDetection: (observed.elapsedMs - observed.lastProgressElapsedMs) / 1000,
          secondsFromSuspendToDetection: (Date.now() - Date.parse(result.freezeDiagnostic.suspension.suspendedAtUtc)) / 1000,
        });
        const text = observed.text;
        report.lifecycleReason = observed.reason;
        report.status = observed.reason === 'complete' ? 'running' : observed.reason;
        const judged = cases.map(item => ({ test: item.test, nonce: item.nonce,
          ...(usa ? evaluateUSA(text,nonce,claimMode) : evaluate(text, item.nonce, item.checks, report.installedVersion.replace(/ \([^)]+\)$/, ''), item.test)),
          wiringPass: wiring.findings.filter(finding => finding.test === item.test).every(finding => finding.passed) }));
        if (missionClaim && !usa && ['click','shortcut','negative'].includes(claimMode)) {
          const pre = claimChecks.slice(0,23);
          const expected = ['BEGIN nantes-claim',...pre.map(c=>`OK ${c}`),'UI_READY nantes-claim'];
          const item=judged[0];
          item.expectedMarkers=expected;
          item.missingOrDuplicateChecks=pre.filter(c=>!item.markers.some(m=>m.endsWith(`OK ${c}`)));
          item.transcriptPass=item.markers.length===expected.length && item.dateMatches && item.versionMatches
            && expected.every((m,i)=>item.markers[i].endsWith(`EU4RT ${nonce} ${m}`));
        }
        if (test !== 'all') Object.assign(report, judged[0]);
        else {
          report.transcriptPass = judged.every(item => item.transcriptPass);
          report.assertionFailures = judged.flatMap(item => item.assertionFailures.map(value => `${item.test}: ${value}`));
          report.markers = judged.flatMap(item => item.markers);
        }
        report.relevantScriptErrors = ['error.log', 'setup_error.log'].flatMap(name => {
          const file = path.join(attemptLogs, name);
          return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/)
            .filter(line => /zz_runtime_test|zz_runtime_mission|eu4usa_|AMC_|amc_|eu4rt_|prepare_ready|after_console|bri_nantes_market|bri_diplomacy_preview_trigger|BRI_mission_triggers|BRI_mission_effects|bri_shipbuilding_reward_effect|bri_secure_borders_reward_effect|add_or_upgrade_production_building/i.test(line)) : [];
        });
        report.stagedChanges = manifest.filter(item => !fs.existsSync(path.join(staged, item.path)) || hash(path.join(staged, item.path)) !== item.sha256);
        report.nativeFileChanges = nativeFiles.filter(item => !fs.existsSync(item.file) || hash(item.file) !== item.sha256);
        report.nativeFileChanges.push(...nativeFiles.filter(item => {
          const file = path.join(attemptProfile, path.relative(profile, item.file));
          const expected = controlledCrash && path.basename(file) === 'eu4rt_run.commands' ? controlledCrash.sha256 : item.sha256;
          return !fs.existsSync(file) || hash(file) !== expected;
        }));
        if (runFile) {
          report.runFileUnchanged = hash(path.join(profile, runFile)) === report.runFile.sha256
            && hash(path.join(profile, 'eu4rt_after.txt')) === report.runFile.afterSha256
            && hash(path.join(profile, 'eu4rt_run.commands')) === report.runFile.commandsSha256
            && hash(path.join(attemptProfile, runFile)) === report.runFile.sha256
            && hash(path.join(attemptProfile, 'eu4rt_after.txt')) === report.runFile.afterSha256
            && hash(path.join(attemptProfile, 'eu4rt_run.commands')) === (controlledCrash?.sha256 || report.runFile.commandsSha256);
        }
        const environmentVerified = !report.relevantScriptErrors.length && !report.stagedChanges.length
          && !report.nativeFileChanges.length && report.runFileUnchanged !== false && observed.reason === 'complete';
        report.nativeProbeVerified = report.transcriptPass && environmentVerified && wiring.passed;
        report.caseResults = judged.map(item => ({ ...item,
          status: item.transcriptPass && environmentVerified && item.wiringPass ? (item.test === 'nantes-market' ? 'partial' : 'pass')
            : item.assertionFailures.length || !item.wiringPass ? 'fail' : 'incomplete' }));
        report.behavioralPass = report.nativeProbeVerified && !['nantes-market','nantes-claim'].includes(test);
        if (missionClaim && !usa) {
          report.savedState = inspectSnapshots(attemptDir,dlcs,claimMode);
          const ui=JSON.parse(fs.readFileSync(path.join(attemptDir,'ui-finish.json'),'utf8'));
          report.uiEvidence=ui;
          const inputFile=path.join(attemptDir,'ui-actions.jsonl');
          const inputRecords=fs.existsSync(inputFile) ? fs.readFileSync(inputFile,'utf8').trim().split('\n').map(JSON.parse) : [];
          const claims=inputRecords.filter(r=>r.kind==='input-returned' && r.action.mission==='bri_nantes_market');
          report.claimInputVerified=claimMode==='click' && claims.length===1 && claims[0].action.kind==='click'
            && claims[0].action.x===missionClaim.geometry.point.x+1 && claims[0].action.y===missionClaim.geometry.point.y+31;
          report.missionCompletionPass = report.nativeProbeVerified && report.savedState.passed
            && report.claimInputVerified && ui.nonce===nonce
            && ui.readyInspected===true && ui.downstreamReadyInspected===true;
          report.behavioralPass=report.missionCompletionPass || claimMode==='negative' && report.nativeProbeVerified
            && report.savedState.passed && ui.nonce===nonce && ui.unreadyRefused===true;
          report.behavioralScope = 'Native setup + actual mission-entry input + native save assertions; Nantes only, Codex UI driver required';
          if(!report.savedState.passed) { result.blockRetry=true;report.assertionFailures.push('native saved state'); }
        }
        if(usa) {
          const ui=JSON.parse(fs.readFileSync(path.join(attemptDir,'ui-finish.json'),'utf8'));
          const inputFile=path.join(attemptDir,'ui-actions.jsonl');
          const actions=fs.existsSync(inputFile)?fs.readFileSync(inputFile,'utf8').trim().split('\n').map(JSON.parse):[];
          report.uiEvidence=ui;
          report.savedState=inspectUSA(attemptDir,dlcs,claimMode,ui,actions,missionClaim.geometries);
          report.behavioralPass=report.nativeProbeVerified && report.savedState.passed && ui.nonce===nonce;
          report.missionCompletionPass=report.behavioralPass && claimMode==='click';
          report.behavioralScope='Vanilla USA decision UI, four actual production mission buttons, constitutional choice and independent native saves';
          if(!report.savedState.passed) {result.blockRetry=true;report.assertionFailures.push('USA native saved state');}
        }
        if (test === 'run-effects') {
          report.permanentModifierPresenceQuery = report.observations['permanent-presence'];
          report.finiteModifierPresenceQuery = report.observations['finite-presence'];
          report.modifierValueTransitionsVerified = report.nativeProbeVerified;
          report.productionMissionRewardVerified = false;
        }
        if (test === 'nantes-market') {
          report.mechanism = 'country scripted effect complete_mission = bri_nantes_market';
          report.completionRecorded = report.markers.some(line => line.endsWith('OK mission-completed'));
          report.productionRewardVerified = ['modifier-169 present', 'modifier-4384 present',
            'reward-value-169 correct', 'reward-value-4384 correct'].every(value => report.markers.some(line => line.endsWith(`OBS ${value}`)));
          report.readinessVerified = false;
          report.automationBoundary = 'complete_mission records completion but is not established as normal reward-bearing completion; no native readiness query was verified. The run-effects followup verified auto_run dispatch of profile-root .txt files. A separate native mission command probe left completion false and reward values zero; its console response and failure reason remain unresolved.';
        }
        report.status = report.behavioralPass ? 'pass' : report.nativeProbeVerified ? 'partial' : report.assertionFailures.length || !wiring.passed ? 'fail' : report.status === 'running' ? 'timeout-or-incomplete' : report.status;
        if (!report.markers.length) report.manual = ['No native assertions reached. Inspect startup blockers (including Steam), then establish a session if automatic entry remains blocked. Do not count startup as a behavioral pass.'];
        report.processExitCodeBeforeCleanup = child.exitCode;
        if (report.assertionFailures.length || !wiring.passed || report.stagedChanges.length || report.nativeFileChanges.length
          || report.relevantScriptErrors.length || report.runFileUnchanged === false) { result.recoverable = false; result.blockRetry = true; }
      } catch (error) {
        result.error = error.message;
        report.status = 'infrastructure-error';
        report.error = error.message;
        report.behavioralPass = false;
      } finally {
        // Capture immediately before termination as well as after it; collector
        // keeps final logs. Only small crash metadata is referenced, not dumps.
        result.diagnosticsBeforeCleanup = {};
        try { for (const name of ['game.log', 'error.log', 'system.log', 'setup_error.log']) {
          const source = path.join(attemptLogs, name);
          if (fs.existsSync(source)) {
            const destination = path.join(attemptDir, `failure-${name}`);
            if (result.reason !== 'complete') fs.copyFileSync(source, destination);
            result.diagnosticsBeforeCleanup[name] = { bytes: fs.statSync(source).size,
              ...(result.reason !== 'complete' ? { file: destination } : {}) };
          }
        } } catch (error) { result.diagnosticError = error.message; }
        try { result.cleanup = await cleanupOwned(windowsProcesses, context, { graceful: result.reason === 'complete' }); }
        catch (error) { result.cleanup = { clean: false, error: error.message }; }
        if (child?.pid && child.exitCode === null && child.signalCode === null && !result.cleanup.clean) {
          // Node holds the original process handle; never kill a looked-up PID.
          child.kill();
          result.cleanup.fallback = 'original-child-handle termination requested';
        }
        for (const [i, stream] of streams.entries()) {
          child[['stdout', 'stderr'][i]].unpipe(stream);
          if (!stream.destroyed) await Promise.race([new Promise(resolve => stream.end(resolve)), new Promise(resolve => setTimeout(resolve, 1000))]);
          stream.destroy();
        }
        const crashRoot = path.join(attemptProfile, 'crashes');
        try { result.crashes = fs.existsSync(crashRoot) ? fs.readdirSync(crashRoot).map(name => {
          const directory = path.join(crashRoot, name);
          const exception = path.join(directory, 'exception.txt');
          return { directory, metadata: ['exception.txt', 'meta.yml'].filter(file => fs.existsSync(path.join(directory, file))),
            exception: fs.existsSync(exception) ? fs.readFileSync(exception, 'utf8').split(/\r?\n/).find(line => line.startsWith('Unhandled Exception')) : null };
        }) : []; } catch (error) { result.crashes = []; result.diagnosticError = error.message; }
        if (result.crashes.length) {
          result.reason = report.status = 'native-crash';
          result.recoverable = !result.blockRetry;
          report.behavioralPass = report.nativeProbeVerified = false;
          for (const item of report.caseResults || []) item.status = 'incomplete';
        }
        if (outputErrors.length || result.diagnosticError) {
          result.outputErrors = outputErrors;
          result.recoverable = false;
          report.status = 'diagnostic-capture-failed'; report.behavioralPass = report.nativeProbeVerified = false;
          for (const item of report.caseResults || []) item.status = 'incomplete';
        }
        if (!result.cleanup.clean) {
          report.status = 'cleanup-failed'; report.behavioralPass = report.nativeProbeVerified = false;
          for (const item of report.caseResults || []) item.status = 'incomplete';
        }
        if (collectorRun) {
          try { report.logCapture = result.logCapture = collect(['finish', '--mod', runtimeMod, '--run', collectorRun.id,
            '--outcome', report.behavioralPass ? 'passed' : report.status === 'fail' ? 'failed' : 'not-completed',
            '--notes', `Runtime evaluator: ${report.status}; lifecycle: ${result.reason}; attempt ${number}. See ${path.join(dir, 'result.json')}.`]); }
          catch (error) {
            result.captureError = error.message;
            result.recoverable = false;
            report.status = 'log-capture-failed'; report.behavioralPass = report.nativeProbeVerified = false;
            for (const item of report.caseResults || []) item.status = 'incomplete';
          }
        }
        result.finishedAtUtc = new Date().toISOString();
        result.elapsedSeconds = Number(((Date.now() - Date.parse(result.startedAtUtc)) / 1000).toFixed(2));
        delete result.text; // Raw transcript is already retained by the collector.
        report.cleanup = result.cleanup;
        report.crashes = result.crashes;
        // Preserve prior parent identities across attempts for late orphaned
        // reporters whose command line omits the profile path.
        try {
          const old = fs.existsSync(ownershipFile) ? JSON.parse(fs.readFileSync(ownershipFile, 'utf8')) : { profiles: [], known: [] };
          const known = [...old.known];
          for (const item of result.cleanup.known || []) if (!known.some(value => sameProcess(value, item))) known.push(item);
          fs.writeFileSync(ownershipFile, JSON.stringify({ profiles: [...new Set([...old.profiles, attemptProfile])], known }, null, 2));
        } catch (error) { result.ownershipError = error.message; result.recoverable = false; report.status = 'ownership-record-failed'; report.behavioralPass = false; }
        result.status = report.status;
        result.behavioralPass = report.behavioralPass;
        result.caseResults = report.caseResults;
        saveReport();
      }
      return result;
    }});
    report.retryExhausted = attemptPolicy.exhausted;
    if (!report.behavioralPass) report.finalFailureReason = `${attemptPolicy.final.status} (lifecycle: ${attemptPolicy.final.reason})${attemptPolicy.exhausted ? `; retry budget exhausted after ${attemptPolicy.attempts.length} attempts` : ''}${!attemptPolicy.final.cleanup?.clean ? '; cleanup failed' : ''}${attemptPolicy.final.error ? `; ${attemptPolicy.final.error}` : ''}`;
  }
} catch (error) {
  report.status = 'infrastructure-error';
  report.behavioralPass = report.nativeProbeVerified = false;
  report.error = error.message;
} finally {
  releaseLock?.();
  report.finishedAtUtc = new Date().toISOString();
  report.elapsedSeconds = Number(((Date.now() - suiteStarted) / 1000).toFixed(2));
  if (report.startedAtUtc) report.nativeSeconds = Number(((Date.now() - Date.parse(report.startedAtUtc)) / 1000).toFixed(2));
  report.exitCode = report.behavioralPass || args.includes('--prepare-only') && report.status === 'prepared-and-statically-validated' ? 0 : report.status === 'fail' ? 1 : 2;
  saveReport();
  if (test === 'all') for (const item of report.caseResults || []) console.log(`${item.status.toUpperCase()}: ${item.test}`);
  console.log(`${report.behavioralPass ? 'PASS' : report.status === 'partial' ? 'PARTIAL' : report.status === 'fail' ? 'FAIL' : report.status === 'prepared-and-statically-validated' ? 'PREPARED' : 'INCOMPLETE'}: ${test}`);
  console.log(`Evidence: ${path.join(dir, 'result.json')}`);
  process.exitCode = report.exitCode;
}
