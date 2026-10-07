// Ordered EU4RT transcript inspection; callers own expectations and verdict scope.
export function inspectProtocol(text, nonce, checks, expectedMarkers, {
  date = '1444.11.11', expectedVersion, versionPrefix = false, suffixMarkers = false,
} = {}) {
  const prefix = `EU4RT ${nonce} `;
  const markers = text.split(/\r?\n/).filter(line => line.includes(prefix));
  const outcomes = markers.map(line => line.slice(line.indexOf(prefix) + prefix.length));
  const runningVersion = text.match(/Game Version: (.+)/)?.[1]?.trim() || null;
  const assertionFailures = outcomes.filter(line => line.startsWith('FAIL '));
  const missingOrDuplicateChecks = checks.filter(check => outcomes.filter(line => line === `OK ${check}`).length !== 1);
  const dateMatches = markers.every(line => line.includes(`EVENT [${date}]:`));
  const versionMatches = versionPrefix ? text.includes(`Game Version: ${expectedVersion}`) : runningVersion === expectedVersion;
  const observations = Object.fromEntries(outcomes.filter(line => line.startsWith('OBS '))
    .map(line => { const [key, ...value] = line.slice(4).split(' '); return [key, value.join(' ')]; }));
  return { markers, expectedMarkers, observations, runningVersion, assertionFailures,
    missingOrDuplicateChecks, dateMatches, versionMatches,
    transcriptPass: outcomes.length === expectedMarkers.length && dateMatches && versionMatches
      && expectedMarkers.every((expected, i) => {
        const accepted = Array.isArray(expected) ? expected : [expected];
        return accepted.some(value => suffixMarkers ? markers[i].endsWith(prefix + value) : outcomes[i] === value);
      }) };
}
