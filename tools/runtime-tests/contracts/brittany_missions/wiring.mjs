import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parse, field } from '../../../mission-inspector/engine.mjs';
import { extractedRewards } from './behaviors.mjs';

import { canonical, unique } from '../../script-ast.mjs';
export { canonical, unique } from '../../script-ast.mjs';
export function inspectWiring(mod, tests, inlineBaseline = false) {
  const file = path.join(mod, 'missions/Custom_Breton_Missions.txt');
  const text = fs.readFileSync(file, 'utf8');
  const missions = parse(text, file);
  const findings = [], adapters = [];
  const record = (test, label, fn) => {
    try { if (!fn()) throw Error(label); findings.push({ test, label, passed: true }); }
    catch (error) { findings.push({ test, label, passed: false, reason: error.message }); }
  };
  if (tests.includes('preview-gate')) {
    for (const id of ['bri_franco_breton_friendship', 'bri_franco_breton_commercial_pact',
      'bri_franco_breton_entente', 'bri_secure_the_borders', 'bri_balance_of_power', 'bri_military_self_reliance']) {
      record('preview-gate', `${id} invokes the production preview trigger`, () => {
        const trigger = field(unique(missions, id).value, 'trigger');
        return field(trigger.value, 'bri_diplomacy_preview_trigger')?.value === 'yes';
      });
    }
  }
  for (const [id, effectName] of Object.entries(extractedRewards)) {
    const test = id === 'bri_breton_shipbuilding' ? 'shipbuilding-reward' : 'borders-reward';
    if (!tests.includes(test)) continue;
    record(test, inlineBaseline ? `${id} exact inline block captured for comparison` : `${id} calls exactly ${effectName}`, () => {
      const effect = field(unique(missions, id).value, 'effect');
      if (inlineBaseline) {
        if (!Array.isArray(effect?.value) || field(effect.value, effectName)) return false;
        const raw = text.slice(effect.start, effect.end);
        const body = raw.slice(raw.indexOf('{') + 1, raw.lastIndexOf('}'));
        adapters.push({ mission: id, effectName, body, source: file,
          sourceSha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
          astSha256: crypto.createHash('sha256').update(JSON.stringify(canonical(effect.value))).digest('hex') });
        return true;
      }
      const definitions = parse(fs.readFileSync(path.join(mod, 'common/scripted_effects/BRI_mission_effects.txt'), 'utf8'));
      unique(definitions, effectName);
      return JSON.stringify(canonical(effect.value)) === JSON.stringify([{ key: effectName, op: '=', value: 'yes' }]);
    });
  }
  if (tests.includes('textiles-upgrade')) {
    record('textiles-upgrade', 'Textiles calls the actual production-building helper in 169 and 4384', () => {
      const mission = unique(missions, 'bri_breton_textiles');
      const expected = parse('169 = { add_or_upgrade_production_building = yes } 4384 = { add_or_upgrade_production_building = yes }');
      return JSON.stringify(canonical(field(mission.value, 'effect').value)) === JSON.stringify(canonical(expected))
        && field(mission.value, 'required_missions')?.value.some(node => node.key === 'bri_nantes_market');
    });
  }
  return { passed: findings.every(item => item.passed), layer: 'WIRING',
    mode: inlineBaseline ? 'generated inline adapters for refactor comparison only' : 'production definitions', findings, adapters };
}
