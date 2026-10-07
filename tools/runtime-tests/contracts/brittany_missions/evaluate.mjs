import { requiredTests } from './behaviors.mjs';
import { inspectProtocol } from '../../protocol.mjs';
export function expectedMarkers(checks,test) {
  const expectedMarkers = test === 'nantes-claim' ? [`BEGIN ${test}`, ...checks.slice(0,23).map(c=>`OK ${c}`),
    'UI_READY nantes-claim', ...checks.slice(23).map(c=>`OK ${c}`),
    ['OBS console-completion true','OBS console-completion false'],
    ['OBS console-textiles true','OBS console-textiles false'], 'END nantes-claim'] : test !== 'nantes-market'
    ? [`BEGIN ${test}`, ...checks.flatMap(check => test === 'run-effects' && check === 'province-value-correct'
      ? [['OBS permanent-presence present', 'OBS permanent-presence query-false'], `OK ${check}`]
      : test === 'run-effects' && check === 'finite-value-correct'
      ? [['OBS finite-presence present', 'OBS finite-presence query-false'], `OK ${check}`] : [`OK ${check}`]), `END ${test}`]
    : ['BEGIN nantes-market', ...checks.slice(0, 24).map(check => `OK ${check}`),
      ['OBS modifier-169 present', 'OBS modifier-169 absent'],
      ['OBS modifier-4384 present', 'OBS modifier-4384 absent'],
      'OK downstream-parent-completed',
      ['OBS reward-value-169 correct', 'OBS reward-value-169 zero', 'OBS reward-value-169 other'],
      ['OBS reward-value-4384 correct', 'OBS reward-value-4384 zero', 'OBS reward-value-4384 other'],
      'OK selector-flags-unchanged', 'END nantes-market'];
  return expectedMarkers;
}
export function evaluate(text,nonce,checks,expectedVersion,test='preview-gate') {
  if(![...requiredTests,'nantes-market','nantes-claim','run-effects'].includes(test)) throw Error(`Unknown transcript: ${test}`);
  return inspectProtocol(text,nonce,checks,expectedMarkers(checks,test),{expectedVersion});
}
