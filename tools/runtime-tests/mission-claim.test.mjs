import test from 'node:test';
import assert from 'node:assert/strict';
import { claimFixture,claimChecks,missionGeometry } from './mission-claim.mjs';
import { validLease } from './codex-input.mjs';
import { judgeClaim } from './claim-save.mjs';
import { evaluate } from './evaluate.mjs';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createInputDriver } from './codex-input.mjs';
test('ready/unready fixtures never grant production reward or force click completion',()=>{
  for(const mode of ['click','negative']) {
    const f=claimFixture('abc',mode);
    assert.doesNotMatch(f.before+f.after,/add_province_modifier|complete_mission|bri_demand_for_breton_cloth/);
    assert.equal(f.before.includes('add_building = marketplace'),mode==='click');
  }
});
test('input rejects expired, absent, mismatched and failed owned identities',()=>{
  const l={ready:true,failed:false,observedAtUtc:new Date(1000).toISOString(),expiresAtUtc:new Date(6000).toISOString(),
    profile:'C:/isolated',identity:{pid:2,created:'original',executable:'C:/game/eu4.exe',windowHandle:9,command:'-userdir=C:/isolated/'}};
  const w={id:9,app:'process:C:\\game\\eu4.exe'};
  assert.equal(validLease(l,w,2000),true);
  for(const bad of [{...l,ready:false},{...l,failed:true},{...l,identity:null}]) assert.throws(()=>validLease(bad,w,2000));
  for(const bad of [{...l,observedAtUtc:'invalid'},{...l,expiresAtUtc:null}]) assert.throws(()=>validLease(bad,w,2000));
  assert.throws(()=>validLease(l,w,7000));assert.throws(()=>validLease(l,{...w,id:10},2000));
  assert.throws(()=>validLease(l,{...w,app:'Chrome'},2000));
});
test('save contract rejects completion without rewards, duplicates and finite expiry',()=>{
  const before={campaignId:'native-test-campaign',completed:[],provinces:{172:{buildings:['marketplace']},169:{rewardCount:0,buildings:['workshop'],variables:{eu4claim_before:0}},4384:{rewardCount:0,buildings:['workshop'],variables:{eu4claim_before:0}}}};
  const after=structuredClone(before);after.completed=['bri_nantes_market'];
  for(const p of [169,4384]) Object.assign(after.provinces[p],{rewardCount:1,expiry:['-1.1.1']});
  assert.equal(judgeClaim(before,after,'click').passed,true);
  const absent=structuredClone(after);absent.provinces[169].rewardCount=0;
  assert.equal(judgeClaim(before,absent,'click').passed,false);
  const finite=structuredClone(after);finite.provinces[169].expiry=['1445.11.11'];
  assert.equal(judgeClaim(before,finite,'click').passed,false);
  const repeat=structuredClone(after);repeat.completed.push('bri_nantes_market');
  assert.equal(judgeClaim(before,repeat,'click').passed,false);
  assert.equal(judgeClaim({...before,campaignId:null},{...after,campaignId:null},'click').passed,false);
});
test('native claim diagnostic protocol accepts false console observations but rejects missing checks',()=>{
  const f=claimFixture('abc','mission');void f;
  const outcomes=['BEGIN nantes-claim',...claimChecks.slice(0,23).map(c=>`OK ${c}`),'UI_READY nantes-claim',
    ...claimChecks.slice(23).map(c=>`OK ${c}`),'OBS console-completion false','OBS console-textiles false','END nantes-claim'];
  const text='Game Version: EU4 v1.37.5.0 Inca\n'+outcomes.map(m=>`EVENT [1444.11.11]:EU4RT abc ${m}`).join('\n');
  assert.equal(evaluate(text,'abc',claimChecks,'EU4 v1.37.5.0 Inca','nantes-claim').transcriptPass,true);
  assert.equal(evaluate(text.replace('OK before-169','FAIL before-169'),'abc',claimChecks,'EU4 v1.37.5.0 Inca','nantes-claim').transcriptPass,false);
});
test('input waits for current harness identity challenge; denial sends no input',async()=>{
  const directory=fs.mkdtempSync(path.join(os.tmpdir(),'eu4-claim-'));
  const window={id:9,app:'process:C:/game/eu4.exe'};
  const identity={pid:2,created:'original',executable:'C:/game/eu4.exe',windowHandle:9,command:'-userdir=C:/isolated/'};
  let sent=0,allow=true,invalidTime=false;
  const sky={list_windows:async()=>[window],get_window_state:async()=>({window,screenshots:[],accessibility:null}),
    press_key:async()=>{sent++;}};
  const refresh=()=>fs.writeFileSync(path.join(directory,'ui-lease.json'),JSON.stringify({nonce:'test',identity,profile:'C:/isolated',
    ready:true,observedAtUtc:new Date().toISOString(),expiresAtUtc:new Date(Date.now()+5000).toISOString()}));
  const timer=setInterval(()=>{
    const requestFile=path.join(directory,'ui-check-request.json');if(!fs.existsSync(requestFile)) return;
    const request=JSON.parse(fs.readFileSync(requestFile,'utf8'));
    fs.writeFileSync(path.join(directory,'ui-check-response.json'),JSON.stringify({token:request.token,nonce:'test',identity,
      allowed:allow,verifiedAtUtc:invalidTime?'invalid':new Date().toISOString()}));
  },20);
  try {
    refresh();const driver=createInputDriver(sky,directory);await driver.observe();
    await driver.act({kind:'key',key:'8'});assert.equal(sent,1);
    allow=false;await assert.rejects(driver.act({kind:'key',key:'8'}),/refused/);assert.equal(sent,1);
    assert.match(JSON.parse(fs.readFileSync(path.join(directory,'ui-abort.json'),'utf8')).reason,/refused/);
    refresh();await driver.observe();allow=true;invalidTime=true;
    await assert.rejects(driver.act({kind:'key',key:'8'}),/refused/);assert.equal(sent,1);
  } finally {clearInterval(timer);fs.rmSync(directory,{recursive:true,force:true});}
});
