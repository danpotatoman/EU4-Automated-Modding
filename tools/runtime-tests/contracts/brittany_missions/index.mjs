import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { behaviors, requiredTests } from './behaviors.mjs';
import { inspectWiring } from './wiring.mjs';
import { evaluate, expectedMarkers } from './evaluate.mjs';
import { claimChecks, claimModes, stageClaim } from './mission-claim.mjs';
import { inspectSnapshots } from './claim-save.mjs';
import { inspectProtocol } from '../../protocol.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const owner='brittany_missions';
export const requiredRegression=requiredTests;
export const runtimeMod='brittany_runtime';
export const startTag='BRI';
export const descriptorName='Brittany Runtime Test (DO NOT EXPORT)';
export const errorIdentifiers=['bri_nantes_market','bri_diplomacy_preview_trigger','BRI_mission_triggers','BRI_mission_effects','bri_shipbuilding_reward_effect','bri_secure_borders_reward_effect','add_or_upgrade_production_building'];
export function preflight(launcher) {
 if(launcher.enabled_mods.length!==1 || launcher.enabled_mods[0]!=='mod/brittany_missions_dev.mod' || launcher.disabled_dlcs.length)
  throw Error('Default launcher environment differs; inspect before testing.');
}
export const checksFor = (name, dlcs) => name === 'nantes-claim' ? claimChecks : ['initial', ...dlcs.map((_, i) => `dlc-${i + 1}`), ...(behaviors[name]
  || (name === 'nantes-market' ? ['missing-building', 'fixture-marketplace', 'incomplete-before-action', 'rewards-absent-before-action',
    'mission-completed', 'downstream-parent-completed', 'selector-flags-unchanged']
  : ['implicit-bri', 'prestige-before-zero', 'flag-and-prestige-seven', 'scripted-flag-before',
    'scripted-flag-after', 'stability-before-zero', 'production-scripted-stability-one',
    'province-reward-before', 'province-value-correct', 'province-removed-zero',
    'finite-value-correct', 'cleanup-zero', 'missions-untouched']))];

export function hook(item,dlcAssertions) {
 return fs.readFileSync(path.join(here,(behaviors[item.test] && item.test!=='preview-gate') || item.test==='nantes-claim' ? 'behavior-fixture.on_actions.txt' : `${item.test}.on_actions.txt`),'utf8')
  .replace('@DLC_ASSERTIONS@',dlcAssertions).replaceAll('@NONCE@',item.nonce).replaceAll('@TEST@',item.test);
}
export function prepare({staged,profile,cases,selectedTests,test,nonce,game,claimMode,inlineBaseline,negativeControl}) {
  const wiring=inspectWiring(staged,selectedTests,inlineBaseline);
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

  let missionClaim;
  if(test==='nantes-claim') {
   missionClaim=stageClaim({profile,staged,game,nonce,mode:claimMode});
   for(const file of missionClaim.files)nativeFiles.push({file:path.join(profile,file),sha256:hash(path.join(profile,file))});
  }
  return {wiring,runFile,nativeFiles,missionClaim};
}
export function protocol(checks,test,mode) {
 if(test==='nantes-claim' && ['click','shortcut','negative'].includes(mode))return ['BEGIN nantes-claim',...claimChecks.slice(0,23).map(c=>`OK ${c}`),'UI_READY nantes-claim'];
 return expectedMarkers(checks,test);
}
export function evaluateCase(text,item,version,mode) {
 if(item.test==='nantes-claim' && ['click','shortcut','negative'].includes(mode)) {
  const result=inspectProtocol(text,item.nonce,claimChecks.slice(0,23),protocol(item.checks,item.test,mode),{expectedVersion:version,suffixMarkers:true});
  // Preserve full diagnostic check metadata, while UI setup is judged independently.
  result.missingOrDuplicateChecks=claimChecks.slice(0,23).filter(c=>!result.markers.some(m=>m.endsWith(`OK ${c}`)));
  return result;
 }
 return evaluate(text,item.nonce,item.checks,version,item.test);
}
export function postEvaluate({report,result,attemptDir,dlcs,claimMode,missionClaim,nonce,test}) {
 if (missionClaim) {
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

}
export const definitions=Object.fromEntries([...requiredTests,'nantes-market','nantes-claim','run-effects'].map(test=>[test,{
 owner,test,modes:test==='nantes-claim'?claimModes:['click'],suiteMembership:requiredTests.includes(test)?['all']:[],
 layers:test==='nantes-claim'?['STATIC','LOGIC','INPUT','SAVE']:test==='run-effects'?['STATIC','CALIBRATION']:test==='nantes-market'?['STATIC','LOGIC','DIAGNOSTIC']:['STATIC','LOGIC','EFFECT','WIRING'],
 startConditions:'fresh independent BRI, 1444.11.11, required 18 DLC; contract fixture controls flags/buildings',
 hook,checksFor,prepare,expectedProtocol:(checks,mode)=>protocol(checks,test,mode),evaluator:evaluateCase,oracle:test==='nantes-claim'?inspectSnapshots:null,
 modeCoverage:test==='nantes-claim'?{click:'actual input + saved production rewards; bounded Nantes only',negative:'unready refusal + saved absence; no mission claim',mission:'state-only diagnostic; never mission PASS',scripted:'state-only diagnostic; never mission PASS',tree:'state-only diagnostic; never mission PASS',shortcut:'experimental, unverified; cannot earn click mission PASS'}:undefined,
 errorIdentifiers,options:['prepareOnly','exerciseTermination','exerciseCrash'],
}]));

export const partialTranscript=test=>test==='nantes-market';
export const initialBehavioralPass=test=>!['nantes-market','nantes-claim'].includes(test);
