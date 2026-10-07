import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {identity,buildIdentity,assertApplicable,legacyIdentity,cwtoolsIdentity,runtimeIdentity,snapshotAttempt} from '../evidence-identity.mjs';
import {resolveContract} from './contracts.mjs';
import {runAttempts} from './lifecycle.mjs';
import {main as collect} from '../test-runs/collector.mjs';
const root=path.resolve('.');
const fixture=path.join(root,'tools/test-runs/test-work','identity-'+crypto.randomUUID());
fs.mkdirSync(fixture,{recursive:true});
const dates={startedAtUtc:'2026-10-06T10:00:00.000Z',finishedAtUtc:'2026-10-06T10:01:00.000Z'};
const base=()=>({...identity({sourceMod:'brittany_missions',storageNamespace:'brittany_runtime',artifactKind:'fixture',coveredLayers:['LOGIC','EFFECT'],evidenceSource:'native'}),...dates,status:'pass',verdict:'PASS',behavioralPass:true});
test('source owner and storage namespaces are independent; bounded kinds/layers',()=>{
  assert.equal(base().sourceMod,'brittany_missions');assert.equal(base().storageNamespace,'brittany_runtime');
  for(const kind of ['production','staged','fixture']) assert.equal(identity({sourceMod:'brittany_missions',storageNamespace:'alias',artifactKind:kind}).artifactKind,kind);
  assert.throws(()=>identity({storageNamespace:'alias',artifactKind:'other'}),/kind/);
  assert.throws(()=>identity({storageNamespace:'alias',coveredLayers:['MAGIC']}),/layer/);
});
test('registry owner, suite, members, mode and layers serialize for both owners',()=>{
  for(const [mod,testId] of [['brittany_missions','all'],['american_century','usa-slice']]) {
    const s=resolveContract({mod,test:testId}),record=JSON.parse(JSON.stringify(runtimeIdentity(s,{runId:'run',attemptId:'run/1'})));
    assert.equal(record.sourceMod,mod);assert.equal(record.storageNamespace,s.adapter.runtimeMod);
    assert.equal(record.contractId,testId);assert.deepEqual(record.selectedMembers,s.members);
    assert.deepEqual(record.coveredLayers,[...new Set(s.definitions.flatMap(d=>d.layers))]);
    assert.equal(record.suiteId,testId==='all'?mod+'/all':null);assert.equal(record.artifactKind,'fixture');
    assert.equal(record.coveredLayers.includes('END-TO-END'),false);
  }
});
test('retry preserves incomplete/failed attempt identity and cleanup apart from verdict',async()=>{
  const s=resolveContract({mod:'brittany_missions',test:'all'});
  const report={...base(),status:'incomplete',behavioralPass:false,caseResults:[{test:'preview-gate',status:'fail'}],assertionFailures:['first']};
  const policy=await runAttempts({retries:1,attempt:async n=>{
    const result={...runtimeIdentity(s,{runId:'r',attemptId:`r/${n}`}),number:n,reason:n===1?'progress-timeout':'complete',recoverable:n===1,cleanup:{clean:true},...dates};
    if(n===2){report.status='pass';report.behavioralPass=true;report.caseResults=[{status:'pass'}];report.assertionFailures=[];}
    return snapshotAttempt(report,result);
  }});
  assert.equal(policy.final.verdict,'PASS');assert.equal(policy.attempts[0].verdict,'INCOMPLETE');
  assert.equal(policy.attempts[0].caseResults[0].status,'fail');assert.deepEqual(policy.attempts[0].assertionFailures,['first']);
  assert.deepEqual(policy.attempts.map(a=>a.attemptId),['r/1','r/2']);
  assert.equal(policy.attempts[0].lifecycleOutcome.cleanup.clean,true);assert.equal(policy.attempts[0].behavioralPass,false);
});
test('contradictory owner, namespace, artifact, build, layer, schema, replay and status rejected',()=>{
  const r={...base(),sourceBuild:{algorithm:'a',sha256:'one'}};
  for(const expected of [{sourceMod:'american_century'},{storageNamespace:'american_runtime'},{artifactKind:'production'},
    {sourceBuild:{algorithm:'a',sha256:'two'}},{stagedBuild:{algorithm:'a',sha256:'one'}},{coveredLayers:['END-TO-END']},{suiteId:'other'},{selectedMembers:['other']},{claimMode:'negative'}]) assert.throws(()=>assertApplicable(r,expected),/conflict|missing/);
  assert.throws(()=>assertApplicable({...r,behavioralPass:false,cleanup:{clean:true}}),/behavioral verdict/);
  for(const status of ['running','prepared','incomplete']) assert.throws(()=>assertApplicable({...r,status}),/incomplete/);
  assert.throws(()=>assertApplicable({...r,verdict:'INCOMPLETE'}),/incomplete/);
  for(const version of [undefined,1,99]) assert.throws(()=>assertApplicable({...r,schemaVersion:version}),/schema/);
  assert.throws(()=>assertApplicable({...r,evidenceSource:'replay'},{evidenceSource:'native'}),/conflict/);
  assert.throws(()=>identity({storageNamespace:'a',evidenceSource:'static',coveredLayers:['END-TO-END']}),/END-TO-END/);
});
test('freshness uses start AND completion; clean cleanup never promotes PASS',()=>{
  assertApplicable(base(),{notBefore:dates.startedAtUtc});
  assert.throws(()=>assertApplicable(base(),{notBefore:'2026-10-06T10:00:01Z'}),/stale/);
  assert.throws(()=>assertApplicable({...base(),finishedAtUtc:'2000-01-01Z'}),/timestamps/);
  const r=snapshotAttempt({status:'incomplete',behavioralPass:false},{reason:'timeout',cleanup:{clean:true}});
  assert.equal(r.verdict,'INCOMPLETE');
});
test('same-basename arbitrary CWTools paths have no invented owner and cannot cross-apply',()=>{
  const a=path.join(fixture,'one/same'),b=path.join(fixture,'two/same');
  for(const dir of [a,b]){fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(path.join(dir,'test.txt'),'identical');}
  const record={...cwtoolsIdentity({root,project:a}),artifactBuild:buildIdentity(a),...dates,status:'complete'};
  assert.equal(record.sourceMod,null);assert.equal(record.storageNamespace,'same');assert.equal(record.artifactKind,'untracked');
  assert.throws(()=>assertApplicable(record,{projectPath:b}),/path conflict/);
  assert.equal(cwtoolsIdentity({root,project:b,reportKey:'separate',sourceMod:'american_century',artifactKind:'staged'}).storageNamespace,'separate');
  assert.throws(()=>cwtoolsIdentity({root,project:a,artifactKind:'production'}),/canonical/);
  assert.throws(()=>cwtoolsIdentity({root,project:path.join(root,'mod/brittany_missions'),sourceMod:'american_century'}),/conflicts/);
  fs.writeFileSync(path.join(a,'test.txt'),'changed');assert.notEqual(buildIdentity(a).sha256,record.artifactBuild.sha256);
});
test('legacy compatibility is finite, build-backed, and never scenario-name based',()=>{
  const record={deployment:{record:{source:path.join(root,'mod/brittany_missions')}},scenario:'American Century PASS'};
  assert.equal(legacyIdentity(record,{format:'collector',root,storageNamespace:'brittany_runtime',buildMatches:true}).sourceMod,'brittany_missions');
  for(const opts of [{storageNamespace:'arbitrary',buildMatches:true},{storageNamespace:'brittany_runtime',buildMatches:false}]) assert.throws(()=>legacyIdentity(record,{format:'collector',root,...opts}),/ambiguous/);
  assert.throws(()=>legacyIdentity({...record,schemaVersion:99},{format:'collector',root,storageNamespace:'brittany_runtime',buildMatches:true}),/schema/);
  assert.equal(legacyIdentity({project:path.join(root,'mod/american_century')},{format:'cwtools',root,storageNamespace:'american_century'}).sourceMod,'american_century');
});
test('collector aliases/untracked/synthetic have no implicit source owner or native layers',()=>{
  const logs=path.join(fixture,'logs');fs.mkdirSync(logs);
  for(const [namespace,kind] of [['brittany_runtime','fixture'],['brittany_missions','untracked'],['synthetic','synthetic'],['baseline','baseline']]) {
    const options={storage:path.join(fixture,'reports')};
    const r=collect(['begin','--mod',namespace,'--untracked','--artifact-kind',kind,'--logs',logs,'--scenario','brittany_missions all PASS'],options);
    const run=collect(['status','--mod',namespace],options);assert.equal(run.sourceMod,null);assert.equal(run.artifactKind,kind);assert.deepEqual(run.coveredLayers,[]);
    collect(['finish','--mod',namespace,'--run',r.id,'--outcome','failed'],options);
    const report=JSON.parse(fs.readFileSync(path.join(r.directory,'report.json')));assert.equal(report.verdict,'FAIL');assert.equal(report.sourceMod,null);
  }
  const options={storage:path.join(fixture,'reports'),provenance:{sourceMod:'american_century',storageNamespace:'american_runtime',artifactKind:'fixture',contractId:'usa-slice',runId:'native',attemptId:'native/1',coveredLayers:['SAVE']}};
  const r=collect(['begin','--mod','american_runtime','--untracked','--logs',logs,'--scenario','native'],options);
  const run=collect(['status','--mod','american_runtime'],{storage:options.storage});
  assert.equal(run.sourceMod,'american_century');assert.equal(run.attemptId,'native/1');assert.deepEqual(run.coveredLayers,[]);assert.deepEqual(run.declaredLayers,['SAVE']);
  collect(['finish','--mod','american_runtime','--run',r.id],{storage:options.storage});
  assert.throws(()=>collect(['begin','--mod','wrong','--untracked','--logs',logs,'--scenario','x'],options),/conflict/);
});
test('explicit production selection supplies owner for a verified staged deployment; unknown namespaces do not',()=>{
  const deployed=path.join(fixture,'deployed'),logs=path.join(fixture,'logs');fs.mkdirSync(deployed);
  const launcher=path.join(fixture,'test.mod');fs.writeFileSync(launcher,'descriptor');fs.writeFileSync(path.join(deployed,'test.txt'),'script');
  const bytesHash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  const record=path.join(fixture,'deployment.json');
  fs.writeFileSync(record,JSON.stringify({target:deployed,launcher,launcherSha256:bytesHash(launcher),files:[{path:'test.txt',sha256:bytesHash(path.join(deployed,'test.txt'))}]}));
  const options={storage:path.join(fixture,'tracked')};
  for(const namespace of ['american_century','synthetic-storage']) {
    const r=collect(['begin','--mod',namespace,'--deployment',record,'--logs',logs,'--scenario','ordinary'],options);
    const run=collect(['status','--mod',namespace],options);assert.equal(run.sourceMod,namespace==='american_century'?'american_century':null);assert.equal(run.artifactKind,'staged');
    collect(['finish','--mod',namespace,'--run',r.id],options);
  }
  assert.throws(()=>collect(['begin','--mod','american_century','--deployment',record,'--logs',logs,'--artifact-kind','production','--scenario','x'],options),/staged/);
  const ownedRecord={...JSON.parse(fs.readFileSync(record)),schemaVersion:2,sourceMod:'american_century',storageNamespace:'american_century',artifactKind:'staged',sourceBuild:{algorithm:'test',sha256:'actual'}};
  fs.writeFileSync(record,JSON.stringify(ownedRecord));
  assert.throws(()=>collect(['begin','--mod','american_century','--deployment',record,'--logs',logs,'--scenario','x'],
    {...options,provenance:{sourceBuild:{algorithm:'test',sha256:'different'}}}),/sourceBuild conflict/);
});
