import { parse, field } from '../../../mission-inspector/engine.mjs';
import { canonical, unique } from './wiring.mjs';
import { extractedRewards } from './behaviors.mjs';

// Ordered full-file comparison after expanding only the two selected calls.
export function compareExtraction(before, after, effects) {
  const original = parse(before), rewritten = parse(after), definitions = parse(effects);
  for (const [id, name] of Object.entries(extractedRewards)) {
    const call = field(unique(rewritten, id).value, 'effect');
    if (call.value.length !== 1 || call.value[0].key !== name || call.value[0].value !== 'yes')
      return { equivalent: false, reason: `${id} does not make its sole expected call` };
    call.value = unique(definitions, name).value;
  }
  return { equivalent: JSON.stringify(canonical(original)) === JSON.stringify(canonical(rewritten)),
    compared: 'complete ordered mission AST with both named calls expanded',
    proves: 'structural extraction equivalence, not mission UI dispatch or tooltip rendering' };
}
