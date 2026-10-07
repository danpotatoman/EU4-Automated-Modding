// Small shared report vocabulary; no lifecycle authority is conveyed by a report.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const schemaVersion = 2;
export const artifactKinds = ['production','staged','fixture','synthetic','untracked','baseline'];
export const layers = ['STATIC','LOGIC','EFFECT','WIRING','END-TO-END','INPUT','SAVE','CALIBRATION','DIAGNOSTIC'];
export const productionOwners = ['brittany_missions','american_century'];
export const evidenceSources = ['static','native','preparation','operator','deployment','replay'];
export const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
export function canonicalPath(file) {
  const resolved = path.resolve(file);
  const actual = fs.existsSync(resolved) ? fs.realpathSync.native(resolved) : resolved;
  return process.platform === 'win32' ? actual.toLowerCase() : actual;
}
export function buildIdentity(directory) {
  const files = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
      const f=path.join(dir,e.name);
      if(e.isSymbolicLink()) throw Error('Build identity refuses symlinks/junctions.');
      if(e.isDirectory()) walk(f);
      else if(e.isFile()) files.push({path:path.relative(directory,f).replaceAll('\\','/'),sha256:digest(fs.readFileSync(f))});
    }
  }
  if(fs.lstatSync(directory).isSymbolicLink()) throw Error('Build root is a symlink/junction.');
  walk(directory);
  files.sort((a,b)=>a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return {algorithm:'sha256-path-manifest-v1',projectPath:canonicalPath(directory),sha256:digest(JSON.stringify(files)),files};
}
export function identity({sourceMod=null,storageNamespace,artifactKind='untracked',coveredLayers=[],evidenceSource,...rest}) {
  if(sourceMod!==null && !/^[a-zA-Z0-9_-]+$/.test(sourceMod)) throw Error('Invalid source owner.');
  if(!/^[a-zA-Z0-9_-]+$/.test(storageNamespace || '')) throw Error('Invalid storage namespace.');
  if(!artifactKinds.includes(artifactKind)) throw Error('Unknown artifact kind.');
  if(evidenceSource!==undefined && !evidenceSources.includes(evidenceSource)) throw Error('Unknown evidence source.');
  if(coveredLayers.some(l=>!layers.includes(l))) throw Error('Unknown evidence layer.');
  if(['synthetic','untracked','baseline'].includes(artifactKind) && coveredLayers.includes('END-TO-END')) throw Error('Unverified artifact cannot claim END-TO-END.');
  if(evidenceSource!=='native' && coveredLayers.includes('END-TO-END')) throw Error('END-TO-END requires native evidence.');
  return {schemaVersion,sourceMod,storageNamespace,artifactKind,coveredLayers:[...new Set(coveredLayers)],evidenceSource,...rest};
}
export function cwtoolsIdentity({root,project,sourceMod,reportKey,artifactKind,projectIdentity}) {
  const projectPath=canonicalPath(project);
  const canonicalOwner=productionOwners.find(id=>projectPath===canonicalPath(path.join(root,'mod',id)));
  if(canonicalOwner && sourceMod && canonicalOwner!==sourceMod) throw Error('CWTools owner conflicts with canonical project.');
  if(artifactKind==='production' && !canonicalOwner) throw Error('Arbitrary project is not canonical production.');
  if(canonicalOwner && artifactKind && artifactKind!=='production') throw Error('Canonical production project has conflicting artifact kind.');
  return identity({sourceMod:sourceMod || canonicalOwner || null,storageNamespace:reportKey || path.basename(project),
    artifactKind:artifactKind || (canonicalOwner?'production':'untracked'),coveredLayers:['STATIC'],evidenceSource:'static',
    projectPath,...(projectIdentity?{projectIdentity}:{})});
}
// Legacy CWTools needs exact canonical path + fresh completion; collectors need
// a known namespace AND canonical deployment source AND matching deployment bytes.
export function legacyIdentity(record,{format,root,storageNamespace,buildMatches=false}={}) {
  if(record.schemaVersion!==undefined && !(format==='checks' && record.schemaVersion===1)) throw Error('Unsupported report schema version.');
  if(format==='cwtools' && record.project) return cwtoolsIdentity({root,project:record.project,reportKey:storageNamespace});
  const aliases={brittany_missions:'brittany_missions',american_century:'american_century',brittany_runtime:'brittany_missions',american_runtime:'american_century',brittany_nantes_manual:'brittany_missions'};
  const owner=aliases[storageNamespace];
  if(format==='collector' && owner && buildMatches && record.deployment?.record?.source
    && canonicalPath(record.deployment.record.source)===canonicalPath(path.join(root,'mod',owner))) {
    return identity({sourceMod:owner,storageNamespace,artifactKind:storageNamespace===owner?'staged':'fixture',evidenceSource:'operator',coveredLayers:[]});
  }
  throw Error('Legacy evidence identity is ambiguous; no owner/build compatibility rule applies.');
}
export function assertApplicable(record,expected={}) {
  if(!record || !Object.hasOwn(record,'sourceMod') || record.sourceMod===undefined || !record.evidenceSource || !Array.isArray(record.coveredLayers)) throw Error('Evidence identity fields missing.');
  if(record.schemaVersion!==schemaVersion) throw Error('Unsupported or legacy report schema; explicit compatibility required.');
  identity(record); // bounded vocabulary and layer/source checks
  if(record.mod && record.mod!==record.storageNamespace) throw Error('Evidence mod/storage namespace conflict.');
  if(record.selection?.owner && record.selection.owner!==record.sourceMod) throw Error('Evidence selection/source owner conflict.');
  if(record.test && record.contractId && record.test!==record.contractId) throw Error('Evidence test/contract conflict.');
  if(record.selection?.members && JSON.stringify(record.selection.members)!==JSON.stringify(record.selectedMembers)) throw Error('Evidence selection/suite members conflict.');
  if(record.evidenceSource==='native' && record.verdict==='PASS' && record.behavioralPass!==true) throw Error('Evidence native PASS conflicts with behavioral verdict.');
  if(expected.requireActualActivation && record.actualEnvironment?.activationIdentityStatus!=='established') throw Error('Evidence actual activation identity unknown or conflicting.');
  for(const field of ['sourceMod','storageNamespace','artifactKind','contractId','suiteId','claimMode','runId','attemptId','evidenceSource','projectIdentity']) {
    if(Object.hasOwn(expected,field) && record[field]!==expected[field]) throw Error(`Evidence ${field} conflict.`);
  }
  if(expected.selectedMembers && JSON.stringify(record.selectedMembers)!==JSON.stringify(expected.selectedMembers)) throw Error('Evidence suite members conflict.');
  if(expected.projectPath && (!record.projectPath || canonicalPath(record.projectPath)!==canonicalPath(expected.projectPath))) throw Error('Evidence project path conflict.');
  for(const field of ['sourceBuild','stagedBuild','artifactBuild']) {
    if(expected[field] && (!record[field] || record[field].algorithm!==expected[field].algorithm || record[field].sha256!==expected[field].sha256
      || expected[field].projectPath && (!record[field].projectPath || canonicalPath(record[field].projectPath)!==canonicalPath(expected[field].projectPath)))) throw Error(`Evidence ${field} hash/build conflict.`);
  }
  const start=Date.parse(record.startedAtUtc),finish=Date.parse(record.finishedAtUtc);
  if(record.verdict==='INCOMPLETE' || !['complete','pass','fail','partial','passed','failed'].includes(record.status) || !Number.isFinite(start) || !Number.isFinite(finish) || finish<start) throw Error('Evidence incomplete/running or invalid completion timestamps.');
  if(expected.notBefore && (!Number.isFinite(Date.parse(expected.notBefore)) || start<Date.parse(expected.notBefore) || finish<Date.parse(expected.notBefore))) throw Error('Evidence stale or invalid freshness boundary for current invocation.');
  if(expected.coveredLayers?.some(l=>!record.coveredLayers.includes(l))) throw Error('Evidence layer missing.');
  return record;
}
export function runtimeIdentity(selection,{sourceBuild,stagedBuild,runId,attemptId,evidenceSource='native',coveredLayers}={}) {
  const selectedLayers=coveredLayers || [...new Set(selection.definitions.flatMap(d=>d.layers))];
  return identity({sourceMod:selection.owner,storageNamespace:selection.adapter.runtimeMod,artifactKind:'fixture',
    contractId:selection.test,suiteId:selection.test==='all'?`${selection.owner}/all`:null,
    selectedMembers:[...selection.members],claimMode:selection.claimMode,coveredLayers:selectedLayers,evidenceSource,
    sourceBuild,stagedBuild,runId,...(attemptId?{attemptId}:{})});
}
export function snapshotAttempt(report,result) {
  // JSON clone prevents a later evaluator/reset from modifying a prior attempt.
  return JSON.parse(JSON.stringify({...result,status:report.status,verdict:report.behavioralPass?'PASS':report.status==='fail'?'FAIL':report.status==='partial'?'PARTIAL':'INCOMPLETE',
    verdictSource:'runtime contract evaluator',behavioralPass:report.behavioralPass,caseResults:report.caseResults,
    assertionFailures:report.assertionFailures,savedState:report.savedState,uiEvidence:report.uiEvidence,
    transcriptPass:report.transcriptPass,observations:report.observations,markers:report.markers,
    relevantScriptErrors:report.relevantScriptErrors,stagedChanges:report.stagedChanges,nativeFileChanges:report.nativeFileChanges,
    actualEnvironment:report.actualEnvironment,lifecycleOutcome:{reason:result.reason,cleanup:result.cleanup}}));
}
