import { loadConfig } from '../config.mjs';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { main as collect } from '../test-runs/collector.mjs';
import { parseArguments, errorPattern } from './contracts.mjs';
import { buildIdentity, runtimeIdentity, assertApplicable, snapshotAttempt } from '../evidence-identity.mjs';
import { savedEnvironment } from './environment-identity.mjs';
import { windowsProcesses, recordedOwnership, ownedProcesses, sameProcess,
  cleanupOwned, observe, runAttempts, launchOwned, acquireRunLock, inside, profileInCommand } from './lifecycle.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const slash = value => value.replaceAll('\\', '/');
const args = process.argv.slice(2);
const suiteStarted = Date.now();
// Resolve/list before config reads, profile creation, report writes or process work.
let selection;
try { selection=parseArguments(args); } catch(error) { console.error(error.message); process.exit(2); }
if(selection.listTests) { console.log(JSON.stringify(selection.contracts,null,2)); process.exit(0); }
const {owner:sourceMod,adapter,test,claimMode,inlineBaseline,negativeControl,timeout,retries,progressTimeout,
 exerciseTermination,exerciseCrash,exerciseFreeze}=selection;
const selectedTests=selection.members;
const runtimeMod=adapter.runtimeMod;
console.log(`Runtime owner: ${sourceMod}; selected: ${selectedTests.join(', ')}`);
if(selection.legacy)console.warn(`Compatibility routing: omitted -Mod resolves to ${sourceMod}; prefer -Mod ${sourceMod}.`);
const nonce = crypto.randomBytes(8).toString('hex');
const dir = path.join(here, 'work', new Date().toISOString().replace(/[-:.]/g, '') + '_' + nonce);
const profile = path.join(dir, 'profile');
const staged = path.join(dir, runtimeMod);
const logs = path.join(profile, 'logs');
fs.mkdirSync(logs, { recursive: true });
const game = loadConfig('cwtools', root).gamePath;
const normalProfile = path.dirname(loadConfig('deployment', root).gameModDirectory);
const launcher = readJson(path.join(normalProfile, 'dlc_load.json'));
adapter.preflight(launcher);
const dlcs = [...fs.readFileSync(path.join(root, 'docs/testing/environment.md'), 'utf8')
  .matchAll(/^  - (.+)$/gm)].map(m => m[1].trim());
if (dlcs.length !== 18) throw Error('Expected the documented 18 DLC. Review environment.md.');

const sourceBuild = { ...buildIdentity(path.join(root,'mod',sourceMod)), artifactKind:'production' };
fs.cpSync(path.join(root, 'mod',sourceMod), staged, { recursive: true });
const cases = selectedTests.map((name, i) => ({ test: name, nonce: test === 'all' ? `${nonce}_${i}` : nonce, checks: adapter.checksFor(name,dlcs) }));
const checks = cases[0].checks;
const dlcAssertions = dlcs.map((dlc, i) => `if = {
    limit = { has_dlc = "${dlc}" }
    log = "EU4RT @NONCE@ OK dlc-${i + 1}"
}
else = { log = "EU4RT @NONCE@ FAIL dlc-${i + 1}" }`).join('\n');
const hooks = cases.map(item => adapter.hook(item,dlcAssertions));
// Assemble one on_startup, rather than depend on unverified hook merge behavior.
const hook = test === 'all' ? `on_startup = {\n${hooks.map(value => value.slice(value.indexOf('on_startup = {') + 'on_startup = {'.length, value.lastIndexOf('}'))).join('\n')}\n}\n` : hooks[0];
fs.mkdirSync(path.join(staged, 'common/on_actions'), { recursive: true });
fs.writeFileSync(path.join(staged, 'common/on_actions/zz_runtime_test.txt'), hook);
const descriptor = `name="${adapter.descriptorName}"\npath="${slash(staged)}"\nsupported_version="1.37.*"\n`;
fs.mkdirSync(path.join(profile, 'mod'), { recursive: true });
fs.writeFileSync(path.join(profile, 'mod/runtime_test.mod'), descriptor);
fs.writeFileSync(path.join(staged, 'descriptor.mod'), descriptor.replace(/^path=.*\n/m, ''));
fs.writeFileSync(path.join(profile, 'dlc_load.json'), JSON.stringify({ enabled_mods: ['mod/runtime_test.mod'], disabled_dlcs: [] }));
// Reuse display preferences, never write the ordinary profile.
fs.copyFileSync(path.join(normalProfile,'settings.txt'),path.join(profile,'settings.txt'));
const {wiring,runFile,nativeFiles,missionClaim}=adapter.prepare({staged,profile,cases,selectedTests,test,nonce,game,claimMode,inlineBaseline,negativeControl});
const manifest = [];
function inventory(directory) {
  for (const item of fs.readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) inventory(file);
    else manifest.push({ path: slash(path.relative(staged, file)), sha256: hash(file) });
  }
}
inventory(staged);
const stagedBuild = { ...buildIdentity(staged), artifactKind:'fixture' };
const runId = path.basename(dir);
const runIdentity = runtimeIdentity(selection,{sourceBuild,stagedBuild,runId,coveredLayers:['STATIC'],evidenceSource:'preparation'});
const launchArgs = ['-debug', `-userdir=${slash(profile)}/`, `-start_tag=${adapter.startTag}`];
if (runFile || nativeFiles.length) launchArgs.push('-auto_run=eu4rt_run.commands');
const report = { ...runIdentity, requestedLayers:[...new Set(selection.definitions.flatMap(d=>d.layers))],
  startedAtUtc:new Date(suiteStarted).toISOString(), timestamp:new Date().toISOString(), verdict:'UNVERIFIED', verdictSource:'preparation only',
  intendedEnvironment:{version:'1.37.5.0 Inca (491d)',requiredDlcs:dlcs,enabledMods:['mod/runtime_test.mod'],source:'prepared isolated profile; not actual activation'},
  selection: { owner: sourceMod, members: selectedTests }, test, nonce, status: 'prepared', behavioralPass: false, directory: dir,
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
const saveReport = () => { report.timestamp=new Date().toISOString(); fs.writeFileSync(path.join(dir, 'result.json'), JSON.stringify(report, null, 2) + '\n'); };
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
  const startedAtUtc = new Date().toISOString();
  const artifactKind=label==='production'?'production':'fixture';
  const artifactBuild=label==='production'?sourceBuild:stagedBuild;
  if(buildIdentity(project).sha256!==artifactBuild.sha256) throw Error(`CWTools ${label} artifact changed before validation.`);
  const child = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File',
    path.join(root, 'tools/validate-cwtools.ps1'), '-Project', project, '-SourceMod',sourceMod,'-ArtifactKind',artifactKind], { cwd: root, windowsHide: true, stdio: 'inherit' });
  const exitCode = await new Promise((resolve, reject) => { child.once('error', reject); child.once('exit', resolve); });
  const source = path.join(root, 'tools/cwtools/reports', path.basename(project), 'latest.json');
  if (fs.existsSync(source)) {
    const validation=readJson(source);
    assertApplicable(validation,{sourceMod,storageNamespace:path.basename(project),artifactKind,projectPath:project,artifactBuild,notBefore:startedAtUtc,evidenceSource:'static'});
    fs.copyFileSync(source, path.join(dir, `cwtools-${label}.json`));
  } else throw Error(`CWTools ${label} report missing.`);
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
      fs.writeFileSync(path.join(attempt.directory,'result.json'),JSON.stringify(attempt,null,2)+'\n');
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
      const result = { ...runtimeIdentity(selection,{sourceBuild,stagedBuild,runId,attemptId:`${runId}/${number}`,coveredLayers:[]}),
        intendedEnvironment:report.intendedEnvironment, number, directory: attemptDir, profile: attemptProfile, launchCommand: [path.join(game, 'eu4.exe'), ...attemptArgs],
        startedAtUtc: new Date().toISOString(), reason: 'infrastructure-error', recoverable: false };
      fs.writeFileSync(path.join(attemptDir,'result.json'),JSON.stringify({...result,status:'starting',verdict:'INCOMPLETE',verdictSource:'attempt not completed'},null,2)+'\n');
      if (missionClaim) { report.activeAttempt = {profile:attemptProfile,directory:attemptDir}; }
      if (controlledCrash) result.controlledCrash = controlledCrash;
      if (exerciseFreeze && number === 1) result.freezeDiagnostic = { timingGate: 'withhold auto_run dispatch on first attempt only',
        generalActivity: { source: 'harness diagnostic, not native assertions', prefix: 'EU4RT_DIAGNOSTIC unrelated-general-activity', count: 0 } };
      let child, streams = [], outputErrors = [], collectorRun;
      report.behavioralPass = report.nativeProbeVerified = false;
      report.caseResults = [];
      report.manual = [];
      // These describe one attempt; never carry failed/retried observations forward.
      for(const key of ['savedState','uiEvidence','actualEnvironment','observations','markers','assertionFailures','missionCompletionPass','transcriptPass','claimInputVerified','relevantScriptErrors','stagedChanges','nativeFileChanges']) delete report[key];
      report.coveredLayers=[];
      report.evidenceSource='native'; report.attemptId=result.attemptId;
      delete report.error;
      try {
        const previous = recordedOwnership(path.join(here, 'work'));
        result.prelaunchCleanup = await cleanupOwned(windowsProcesses, { game, ...previous }, { passes: 1 });
        if (!result.prelaunchCleanup.clean) throw Error('Owned remnants remain before attempt launch.');
        refuseUnrelatedGame();
        collectorRun = collect(['begin', '--mod', runtimeMod, '--scenario', `Native ${test} ${nonce} attempt ${number}`,
          '--logs', attemptLogs, '--untracked'],{provenance:{...result,storageNamespace:runtimeMod}});
        report.collectorRun = result.collectorRun = collectorRun;
        ({ child, streams, outputErrors } = launchOwned(path.join(game, 'eu4.exe'), attemptArgs, { cwd: game, directory: attemptDir }));
        report.pid = result.pid = child.pid;
        if (missionClaim) report.activeAttempt.pid = child.pid;
        report.nativeStartedAtUtc = result.startedAtUtc;
        report.status = 'running';
        fs.writeFileSync(path.join(attemptDir,'result.json'),JSON.stringify({...result,status:'running',verdict:'INCOMPLETE',verdictSource:'attempt not completed'},null,2)+'\n');
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
        report.actualEnvironment = {
          ...(text.match(/Game Version: (.+)/)?.[1] ? {runningVersion:text.match(/Game Version: (.+)/)[1].trim(),versionSource:'attempt game.log'} : {}),
          observedRequiredDlcs:dlcs.filter((_,i)=>cases.some(c=>text.split(/\r?\n/).some(line=>line.endsWith(`EU4RT ${c.nonce} OK dlc-${i+1}`)))),
          dlcSource:'individual nonce-scoped native assertions; extras unknown unless saved',
        };
        report.lifecycleReason = observed.reason;
        report.status = observed.reason === 'complete' ? 'running' : observed.reason;
        const judged = cases.map(item => ({ test: item.test, nonce: item.nonce,
          ...adapter.evaluateCase(text,item,report.installedVersion.replace(/ \([^)]+\)$/, ''),claimMode),
          wiringPass: wiring.findings.filter(finding => finding.test === item.test).every(finding => finding.passed) }));
        if (test !== 'all') Object.assign(report, judged[0]);
        else {
          report.transcriptPass = judged.every(item => item.transcriptPass);
          report.assertionFailures = judged.flatMap(item => item.assertionFailures.map(value => `${item.test}: ${value}`));
          report.markers = judged.flatMap(item => item.markers);
        }
        report.relevantScriptErrors = ['error.log', 'setup_error.log'].flatMap(name => {
          const file = path.join(attemptLogs, name);
          return fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/)
            .filter(line => errorPattern.test(line)) : [];
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
          status: item.transcriptPass && environmentVerified && item.wiringPass ? (adapter.partialTranscript(item.test) ? 'partial' : 'pass')
            : item.assertionFailures.length || !item.wiringPass ? 'fail' : 'incomplete' }));
        report.behavioralPass = report.nativeProbeVerified && adapter.initialBehavioralPass(test);
        adapter.postEvaluate({report,result,attemptDir,dlcs,claimMode,missionClaim,nonce,test});
        report.coveredLayers=[...report.requestedLayers];
        if(report.behavioralPass && missionClaim && claimMode==='click') report.coveredLayers.push('END-TO-END');
        const saveFile=path.join(attemptDir,'after.eu4');
        if(fs.existsSync(saveFile)) {
          const saveText=fs.readFileSync(saveFile,'utf8');
          Object.assign(report.actualEnvironment,savedEnvironment(saveText,{file:saveFile,sha256:hash(saveFile)},
            {expectedModFiles:['mod/runtime_test.mod']}));
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
        result.behavioralVerdict=report.behavioralPass?'PASS':report.status==='fail'?'FAIL':report.status==='partial'?'PARTIAL':'INCOMPLETE';
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
        result.coveredLayers=[...report.coveredLayers];
        Object.assign(result,snapshotAttempt(report,result));
        fs.writeFileSync(path.join(attemptDir,'result.json'),JSON.stringify(result,null,2)+'\n');
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
  report.verdict=report.behavioralPass?'PASS':report.status==='fail'?'FAIL':report.status==='partial'?'PARTIAL':report.status==='prepared-and-statically-validated'?'UNVERIFIED':'INCOMPLETE';
  report.verdictSource=args.includes('--prepare-only')?'static preparation; no native verdict':'runtime contract evaluator; cleanup separately recorded';
  report.lifecycleOutcome={reason:report.lifecycleReason,cleanup:report.cleanup,preflightCleanup:report.preflightCleanup};
  report.elapsedSeconds = Number(((Date.now() - suiteStarted) / 1000).toFixed(2));
  if (report.nativeStartedAtUtc) report.nativeSeconds = Number(((Date.now() - Date.parse(report.nativeStartedAtUtc)) / 1000).toFixed(2));
  report.exitCode = report.behavioralPass || args.includes('--prepare-only') && report.status === 'prepared-and-statically-validated' ? 0 : report.status === 'fail' ? 1 : 2;
  saveReport();
  if (test === 'all') for (const item of report.caseResults || []) console.log(`${item.status.toUpperCase()}: ${item.test}`);
  console.log(`${report.behavioralPass ? 'PASS' : report.status === 'partial' ? 'PARTIAL' : report.status === 'fail' ? 'FAIL' : report.status === 'prepared-and-statically-validated' ? 'PREPARED' : 'INCOMPLETE'}: ${test}`);
  console.log(`Evidence: ${path.join(dir, 'result.json')}`);
  process.exitCode = report.exitCode;
}
