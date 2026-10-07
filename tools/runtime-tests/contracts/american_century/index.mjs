import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { usaChecks, usaHook, stageUSA, evaluateUSA, inspectUSA, expectedUSA } from './usa-slice.mjs';
import { inspectConstitution } from './usa-constitution.mjs';
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
export const owner='american_century';
export const requiredRegression=[];
export const runtimeMod='american_runtime';
export const startTag='ENG';
export const descriptorName='American Runtime Test (DO NOT EXPORT)';
export const errorIdentifiers=['eu4usa_','AMC_','amc_'];
export function preflight() {} // Existing USA behavior reads, but does not gate ordinary launcher selection.
export const checksFor=()=>usaChecks;
export const hook=(item,dlcAssertions)=>usaHook(item.nonce,dlcAssertions.replaceAll('@NONCE@',item.nonce),item.test);
export function prepare({profile,staged,game,nonce,claimMode,test}) {
 const missionClaim=stageUSA({profile,staged,game,nonce,mode:claimMode,test});
 return {missionClaim,runFile:undefined,nativeFiles:missionClaim.files.map(file=>({file:path.join(profile,file),sha256:hash(path.join(profile,file))})),
  wiring:{passed:true,layer:'WIRING',findings:[],adapters:[],scope:'USA CWTools/layout; native tree membership checked independently'}};
}
export const evaluateCase=(text,item,version,mode)=>evaluateUSA(text,item.nonce,mode,item.test);
export function postEvaluate({report,result,attemptDir,dlcs,claimMode,missionClaim,nonce,test}) {
  const ui=JSON.parse(fs.readFileSync(path.join(attemptDir,'ui-finish.json'),'utf8'));
  const inputFile=path.join(attemptDir,'ui-actions.jsonl');
  const actions=fs.existsSync(inputFile)?fs.readFileSync(inputFile,'utf8').trim().split('\n').map(JSON.parse):[];
  report.uiEvidence=ui;
  report.savedState=test==='usa-local-union'?inspectConstitution(attemptDir,dlcs,ui,actions,missionClaim.geometries)
    :inspectUSA(attemptDir,dlcs,claimMode,ui,actions,missionClaim.geometries);
  report.behavioralPass=report.nativeProbeVerified && report.savedState.passed && ui.nonce===nonce;
  report.missionCompletionPass=report.behavioralPass && claimMode==='click';
  report.behavioralScope=test==='usa-local-union'?'Real vanilla formation, Liberty/Compact/Union buttons, Local Guarantees option, numerical rewards and paused reload':
    'Vanilla USA decision UI, four actual production mission buttons, constitutional choice and independent native saves';
  if(!report.savedState.passed) {result.blockRetry=true;report.assertionFailures.push('USA native saved state');}
}
export const definitions={'usa-slice':{owner,test:'usa-slice',modes:['click','negative'],suiteMembership:[],
 layers:['STATIC','LOGIC','INPUT','SAVE'],startConditions:'fresh overseas ENG fixture -> real vanilla USA formation, 1444.11.11, required 18 DLC',
 checksFor,hook,prepare,expectedProtocol:()=>expectedUSA(),evaluator:evaluateCase,oracle:inspectUSA,errorIdentifiers,
 modeCoverage:{click:'real vanilla formation + four actual mission claims + saved rewards; bounded fixture',negative:'unready refusal + saved absence; no mission claim'},
 options:['prepareOnly','exerciseTermination','exerciseCrash']}};
definitions['usa-local-union']={...definitions['usa-slice'],test:'usa-local-union',modes:['click'],oracle:inspectConstitution,
 expectedProtocol:()=>expectedUSA('usa-local-union'),
 modeCoverage:{click:'Local Guarantees -> A More Perfect Union: three actual claims, real event option, intermediate saves/numerical rewards and paused reload'}};

export const partialTranscript=()=>false;
export const initialBehavioralPass=()=>true;
