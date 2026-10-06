// Checks the experimental transcripts. Protocol success is not mission reward verification.
import { requiredTests } from './behaviors.mjs';
export function evaluate(text, nonce, checks, expectedVersion, test = 'preview-gate') {
  const prefix = `EU4RT ${nonce} `;
  const markers = text.split(/\r?\n/).filter(line => line.includes(prefix));
  const outcomes = markers.map(line => line.slice(line.indexOf(prefix) + prefix.length));
  if (![...requiredTests, 'nantes-market', 'nantes-claim', 'run-effects'].includes(test)) throw Error(`Unknown transcript: ${test}`);
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
  const runningVersion = text.match(/Game Version: (.+)/)?.[1]?.trim() || null;
  const assertionFailures = outcomes.filter(line => line.startsWith('FAIL '));
  const missingOrDuplicateChecks = checks.filter(check => outcomes.filter(line => line === `OK ${check}`).length !== 1);
  const dateMatches = markers.every(line => line.includes('EVENT [1444.11.11]:'));
  const observations = Object.fromEntries(outcomes.filter(line => line.startsWith('OBS '))
    .map(line => { const [key, ...value] = line.slice(4).split(' '); return [key, value.join(' ')]; }));
  return { markers, expectedMarkers, observations, runningVersion, assertionFailures, missingOrDuplicateChecks,
    dateMatches, versionMatches: runningVersion === expectedVersion,
    transcriptPass: outcomes.length === expectedMarkers.length
      && expectedMarkers.every((expected, i) => Array.isArray(expected) ? expected.includes(outcomes[i]) : expected === outcomes[i])
      && dateMatches && runningVersion === expectedVersion };
}
