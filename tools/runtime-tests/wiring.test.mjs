import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { parse } from '../mission-inspector/engine.mjs';
import { inspectWiring, unique } from './wiring.mjs';
import { requiredTests } from './behaviors.mjs';
import { compareExtraction } from './refactor-compare.mjs';

const root = new URL('../../', import.meta.url);
const missions = fs.readFileSync(new URL('mod/brittany_missions/missions/Custom_Breton_Missions.txt', root), 'utf8');
const effects = fs.readFileSync(new URL('mod/brittany_missions/common/scripted_effects/BRI_mission_effects.txt', root), 'utf8');
const original = fs.readFileSync(new URL('docs/testing/runtime-regression-suite/evidence/before/Custom_Breton_Missions.txt', root), 'utf8');
const extracted = fs.readFileSync(new URL('docs/testing/runtime-regression-suite/evidence/after/Custom_Breton_Missions.txt', root), 'utf8');
const extractedEffects = fs.readFileSync(new URL('docs/testing/runtime-regression-suite/evidence/after/BRI_mission_effects.txt', root), 'utf8');

test('real mission definitions pass wiring despite repeated prerequisite references', () => {
  assert.equal(unique(parse('mission = { effect = {} } other = { required_missions = { mission } }'), 'mission').key, 'mission');
  assert.equal(inspectWiring(fileURLToPath(new URL('mod/brittany_missions/', root)), requiredTests).passed, true);
});

test('wrong reward call and wrong province scope fail static wiring', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'eu4rt-wiring-'));
  // Bound cleanup to the directory created by this test, using one filesystem API.
  try {
    fs.mkdirSync(path.join(dir, 'missions'));
    fs.mkdirSync(path.join(dir, 'common/scripted_effects'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'common/scripted_effects/BRI_mission_effects.txt'), effects);
    const check = text => {
      fs.writeFileSync(path.join(dir, 'missions/Custom_Breton_Missions.txt'), text);
      return inspectWiring(dir, requiredTests);
    };
    assert.equal(check(missions.replace('bri_shipbuilding_reward_effect = yes', 'bri_secure_borders_reward_effect = yes')).passed, false);
    const changedScope = missions.replace('169 = {\n                add_or_upgrade_production_building', '170 = {\n                add_or_upgrade_production_building');
    assert.notEqual(changedScope, missions);
    assert.equal(check(changedScope).findings.find(item => item.test === 'textiles-upgrade').passed, false);
  } finally {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith('eu4rt-wiring-'));
    fs.rmSync(dir, { recursive: true });
  }
});

test('complete ordered refactor comparison rejects unrelated or reward changes', () => {
  assert.equal(compareExtraction(original, extracted, extractedEffects).equivalent, true);
  assert.equal(compareExtraction(original, extracted, extractedEffects.replace('add_dip_power = 50', 'add_dip_power = 49')).equivalent, false);
  assert.equal(compareExtraction(original, extracted.replace('position = 1', 'position = 9'), extractedEffects).equivalent, false);
});
