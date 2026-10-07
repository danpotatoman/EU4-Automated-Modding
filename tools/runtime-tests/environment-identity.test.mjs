import test from 'node:test';
import assert from 'node:assert/strict';
import {savedEnvironment} from './environment-identity.mjs';
import {assertApplicable,identity} from '../evidence-identity.mjs';
const save=entry=>`savegame_versions={ "1.37.5.0" }
dlc_enabled={ "Emperor" "Dharma" }
mods_enabled_names={ ${entry} }
`;
test('saved mod filename and human display name remain distinct; neither manufactures source ownership',()=>{
  const env=savedEnvironment(save('{ filename="mod/runtime_test.mod" name="American Century / arbitrary Brittany name" }'),{file:'fixture',sha256:'fixture'},
    {expectedModFiles:['mod/runtime_test.mod']});
  assert.deepEqual(env.enabledModFiles,['mod/runtime_test.mod']);
  assert.deepEqual(env.enabledModNames,['American Century / arbitrary Brittany name']);
  assert.equal(env.activationIdentityStatus,'established');assert.equal(Object.hasOwn(env,'sourceMod'),false);
  assert.equal(Object.hasOwn(env,'storageNamespace'),false);assert.deepEqual(env.enabledDlcs,['Emperor','Dharma']);
});
test('display text alone, duplicate or conflicting filenames leave actual identity unknown',()=>{
  for(const entry of ['{ name="Brittany Runtime Test (DO NOT EXPORT)" }',
    '{ filename="mod/other.mod" name="Brittany Runtime Test (DO NOT EXPORT)" }',
    '{ filename="mod/runtime_test.mod" filename="mod/other.mod" name="Brittany" }',
    '{ filename="mod/runtime_test.mod" name="A" } { filename="mod/runtime_test.mod" name="B" }']) {
    const env=savedEnvironment(save(entry),{file:'fixture'},{expectedModFiles:['mod/runtime_test.mod']});
    assert.equal(env.activationIdentityStatus,'unknown');assert.ok(env.activationIdentityIssues.length);
    const record={...identity({sourceMod:'brittany_missions',storageNamespace:'brittany_runtime',artifactKind:'fixture',evidenceSource:'native',coveredLayers:['SAVE']}),
      startedAtUtc:'2026-10-06T00:00:00Z',finishedAtUtc:'2026-10-06T00:01:00Z',status:'pass',actualEnvironment:env};
    assert.throws(()=>assertApplicable(record,{requireActualActivation:true}),/activation identity unknown/);
  }
});
test('saved activation may establish filename with no display name; missing blocks fail',()=>{
  const env=savedEnvironment(save('{ filename="mod/runtime_test.mod" }'),{file:'fixture'},
    {expectedModFiles:['mod/runtime_test.mod']});
  assert.equal(env.activationIdentityStatus,'established');assert.deepEqual(env.enabledModNames,[]);
  assert.throws(()=>savedEnvironment('savegame_versions={ "1.37.5.0" }',{}),/Missing save block/);
});
