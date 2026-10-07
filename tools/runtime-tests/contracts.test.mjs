import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { owners, listContracts, resolveContract, parseArguments } from './contracts.mjs';
const required=['preview-gate','shipbuilding-reward','borders-reward','textiles-upgrade'];
test('registry exposes owner-bound staging, protocol, evaluator, oracle and coverage',()=>{
  for(const [owner,adapter] of Object.entries(owners)) {
    assert.equal(adapter.owner,owner);
    for(const [id,c] of Object.entries(adapter.definitions)) {
      assert.equal(c.owner,owner);assert.equal(c.test,id);
      for(const f of ['hook','checksFor','prepare','expectedProtocol','evaluator'])assert.equal(typeof c[f],'function');
      assert.ok(c.layers.length);assert.ok(c.startConditions);assert.ok(c.errorIdentifiers.length);
    }
  }
  assert.equal(typeof owners.american_century.definitions['usa-slice'].oracle,'function');
});
test('all resolves exactly four ordered Brittany members and never selects USA/UI',()=>{
  const s=resolveContract({mod:'brittany_missions',test:'all'});
  assert.deepEqual(s.members,required);assert.equal(s.owner,'brittany_missions');assert.equal(s.legacy,false);
  assert.deepEqual(listContracts('brittany_missions').find(c=>c.test==='all').members,required);
  assert.throws(()=>resolveContract({mod:'american_century',test:'all'}),/no all regression suite/);
});
test('explicit and legacy CLI routing preserve their source owner',()=>{
  for(const id of [...required,'all','nantes-market','nantes-claim','run-effects','usa-slice']) {
    const old=parseArguments(['--test',id]),owner=id==='usa-slice'?'american_century':'brittany_missions';
    const explicit=parseArguments(['--mod',owner,'--test',id]);
    assert.equal(old.owner,owner);assert.equal(old.legacy,true);assert.equal(explicit.legacy,false);
    assert.deepEqual(old.members,explicit.members);
  }
  assert.equal(resolveContract().test,'preview-gate');
});
test('unknown owners/pairs and unsupported modes/options fail before preparation',()=>{
  for(const args of [
    ['--mod','unknown'],['--mod','american_century','--test','preview-gate'],
    ['--mod','brittany_missions','--test','usa-slice'],['--test','unknown'],
    ['--test','usa-slice','--claim-mode','tree'],['--test','shipbuilding-reward','--claim-mode','negative'],
    ['--test','all','--inline-baseline','--negative-control'],['--test','usa-slice','--negative-control'],
    ['--test','all','--exercise-freeze-first','--prepare-only'],['--test','all','--exercise-native-crash','--exercise-terminate-first'],
    ['--mod'],['--unknown'],['--timeout','29'],['--progress-timeout','4'],['--retries','3'],
  ])assert.throws(()=>parseArguments(args),undefined,JSON.stringify(args));
  for(const mode of ['click','negative'])assert.equal(resolveContract({mod:'american_century',test:'usa-slice',claimMode:mode}).claimMode,mode);
  for(const mode of ['click','negative','mission','scripted','tree','shortcut'])assert.equal(resolveContract({test:'nantes-claim',claimMode:mode}).claimMode,mode);
});
const snapshot=()=>{
  const files=dir=>fs.existsSync(dir)?fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]):[];
  const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  return {
    work:fs.existsSync('tools/runtime-tests/work')?fs.readdirSync('tools/runtime-tests/work').sort():[],
    reports:Object.fromEntries(['tools/cwtools/reports','tools/test-runs/reports'].flatMap(files).sort().map(file=>[file,digest(file)])),
  };
};
const env={...process.env,EU4_GAME_PATH:'X:/missing-game-selection-must-not-read',EU4_USER_DIR:'X:/missing-profile-selection-must-not-read'};
test('Node listing and invalid selection do not read game config or create runtime/report namespaces',()=>{
  const before=snapshot();
  const listed=spawnSync(process.execPath,['tools/runtime-tests/run.mjs','--list-tests'],{env,encoding:'utf8',windowsHide:true});
  assert.equal(listed.status,0,listed.stderr);assert.deepEqual(JSON.parse(listed.stdout).find(c=>c.test==='all').members,required);
  for(const args of [['--mod','american_century','--test','all'],['--mod','american_century','--test','usa-slice','--claim-mode','scripted']]) {
    const result=spawnSync(process.execPath,['tools/runtime-tests/run.mjs',...args],{env,encoding:'utf8',windowsHide:true});
    assert.equal(result.status,2);assert.doesNotMatch(result.stderr,/ENOENT|Default launcher/);assert.equal(result.stdout,'');
  }
  assert.deepEqual(snapshot(),before);
});
test('PowerShell ListTests filters owners and invalid owner/test routing is non-launching', {skip:process.platform!=='win32'},()=>{
  const before=snapshot();
  const call=args=>spawnSync('powershell.exe',['-NoProfile','-ExecutionPolicy','Bypass','-File','tools/run-eu4-test.ps1',...args],{env,encoding:'utf8',windowsHide:true});
  const list=call(['-Mod','american_century','-ListTests']);assert.equal(list.status,0,list.stderr);
  assert.deepEqual(JSON.parse(list.stdout).map(c=>[c.owner,c.test]),[['american_century','usa-slice']]);
  const bad=call(['-Mod','american_century','-Test','all']);assert.equal(bad.status,2);assert.match(bad.stderr,/no all regression suite/);
  const invalidList=call(['-ListTests','-ClaimMode','negative']);assert.notEqual(invalidList.status,0);
  const emptyOwner=call(['-Mod','']);assert.notEqual(emptyOwner.status,0);
  // Test remains the first positional argument in the legacy PowerShell API.
  const positional=call(['usa-slice','-ClaimMode','tree']);assert.equal(positional.status,2);
  assert.match(positional.stderr,/Mode tree unsupported for american_century\/usa-slice/);
  assert.deepEqual(snapshot(),before);
});
test('shared helpers have no adapter dependency; USA imports helpers directly',()=>{
  for(const file of ['script-ast.mjs','mission-geometry.mjs','save-blocks.mjs','protocol.mjs']) {
    const source=fs.readFileSync(new URL(file,import.meta.url),'utf8');
    assert.doesNotMatch(source,/from ['"][^'"]*(contracts\/|brittany|usa-slice|mission-claim|claim-save|wiring\.mjs)/);
  }
  const source=fs.readFileSync(new URL('contracts/american_century/usa-slice.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/from ['"][^'"]*(brittany|mission-claim|claim-save|wiring\.mjs)/);
  assert.match(source,/from '\.\.\/\.\.\/mission-geometry\.mjs'/);assert.match(source,/from '\.\.\/\.\.\/save-blocks\.mjs'/);
});
test('compatibility imports forward canonical functions; helper commands do not execute on import',async()=>{
  for(const name of ['behaviors','wiring','refactor-compare','evaluate','mission-claim','claim-save','usa-slice']) {
    const owner=name==='usa-slice'?'american_century':'brittany_missions';
    const old=await import(`./${name}.mjs`),canonical=await import(`./contracts/${owner}/${name}.mjs`);
    for(const [key,value] of Object.entries(canonical))assert.equal(old[key],value,`${name}/${key}`);
  }
  for(const name of ['prepare-nantes-manual','retain-claim']) {
    const old=await import(`./${name}.mjs`),canonical=await import(`./contracts/brittany_missions/${name}.mjs`);
    assert.equal(old.main,canonical.main);
  }
  const legacyGeometry=await import('./mission-claim.mjs');
  const sharedGeometry=await import('./mission-geometry.mjs');
  assert.deepEqual(legacyGeometry.missionGeometry('mod/brittany_missions','tools/runtime-tests/fixtures/geometry'),
    sharedGeometry.missionGeometry('mod/brittany_missions','tools/runtime-tests/fixtures/geometry','bri_nantes_market'));
});
test('test discovery keeps one top-level entry per suite and no duplicate nested suites',()=>{
  const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):e.name.endsWith('.test.mjs')?[path.join(dir,e.name)]:[]);
  assert.deepEqual(walk('tools/runtime-tests/contracts'),[]);
  const source=fs.readFileSync('tools/test-offline.mjs','utf8');assert.match(source,/fs\.readdirSync/);
  assert.doesNotMatch(source,/contracts\/.*test/);
});
