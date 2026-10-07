// Owner: mod/brittany_missions; offline checks/replays, no new native verdict
// Portable evidence replays: these checks do not launch another EU4 session.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {parse,field} from '../mission-inspector/engine.mjs';
import {judgeClaim} from './contracts/brittany_missions/claim-save.mjs';
const evidence=fileURLToPath(new URL('../../docs/testing/runtime-mission-claim/evidence/',import.meta.url));
const read=(label,file)=>fs.readFileSync(path.join(evidence,label,file),'utf8');
const json=(label,file)=>JSON.parse(read(label,file));
const completed=raw=>{
  const list=field(parse(raw)[0].value,'completed_missions')?.value||[];
  return list.map(n=>n.key);
};
test('actual native mission command records saved completion despite false query and skips rewards',()=>{
  const result=json('mission','save-check.json');
  assert.equal(result.completionRecorded,true);assert.equal(result.rewardExecuted,false);
  assert.equal(completed(read('mission','after-country.txt')).filter(m=>m==='bri_nantes_market').length,1);
  assert.match(read('mission','game.log'),/OBS console-completion false/);
  for(const p of [169,4384]) assert.doesNotMatch(read('mission',`after-province-${p}.txt`),/bri_demand_for_breton_cloth/);
  // The original infrastructure failure stays a failure, not a retroactive PASS.
  assert.equal(json('mission','result.json').exitCode,2);
});
test('actual automated Nantes input has native permanent rewards and preserves production dispatch boundary',()=>{
  const result=json('faithful','result.json');
  assert.equal(result.status,'pass');assert.equal(result.missionCompletionPass,true);
  assert.equal(result.cleanup.clean,true);
  assert.equal(judgeClaim(result.savedState.before,result.savedState.after,'click').passed,true);
  assert.equal(completed(read('faithful','before-country.txt')).includes('bri_nantes_market'),false);
  assert.equal(completed(read('faithful','after-country.txt')).filter(m=>m==='bri_nantes_market').length,1);
  for(const p of [169,4384]) {
    assert.doesNotMatch(read('faithful',`before-province-${p}.txt`),/bri_demand_for_breton_cloth/);
    const nodes=parse(read('faithful',`after-province-${p}.txt`))[0].value;
    const rewards=nodes.filter(n=>n.key==='modifier' && field(n.value,'modifier')?.value==='bri_demand_for_breton_cloth');
    assert.equal(rewards.length,1);assert.equal(field(rewards[0].value,'date').value,'-1.1.1');
  }
  const inputs=read('faithful','ui-actions.jsonl').trim().split('\n').map(JSON.parse);
  const claims=inputs.filter(r=>r.kind==='input-returned' && r.action.mission==='bri_nantes_market');
  assert.equal(claims.length,1);assert.equal(claims[0].action.x,167);assert.equal(claims[0].action.y,343);
  assert.equal(inputs.some(r=>r.kind==='identity-verified' && r.identity.pid===result.pid),true);
  assert.equal(read('faithful','eu4rt_run.commands'),'run eu4claim_before.txt\r\n');
  assert.equal(result.uiEvidence.rewardDialogInspected,true);
});
test('actual unready Nantes refuses entry activation and both native checkpoints remain unrewarded',()=>{
  const result=json('negative','result.json');
  assert.equal(result.status,'pass');assert.equal(result.missionCompletionPass,false);
  assert.equal(result.cleanup.clean,true);
  assert.equal(judgeClaim(result.savedState.before,result.savedState.after,'negative').passed,true);
  const inputs=read('negative','ui-actions.jsonl').trim().split('\n').map(JSON.parse);
  assert.equal(inputs.filter(r=>r.kind==='claim-refused').length,1);
  assert.equal(inputs.some(r=>r.kind==='input-returned' && r.action.mission),false);
  for(const phase of ['before','after']) {
    assert.equal(completed(read('negative',`${phase}-country.txt`)).includes('bri_nantes_market'),false);
    for(const p of [169,4384]) assert.doesNotMatch(read('negative',`${phase}-province-${p}.txt`),/bri_demand_for_breton_cloth/);
  }
});
