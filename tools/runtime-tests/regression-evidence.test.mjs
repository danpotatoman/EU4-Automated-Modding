import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { evaluate } from './evaluate.mjs';

const evidence = new URL('../../docs/testing/runtime-regression-suite/evidence/', import.meta.url);
function replay(name) {
  const dir = new URL(`${name}/`, evidence);
  const report = JSON.parse(fs.readFileSync(new URL('result.json', dir), 'utf8'));
  const log = fs.readFileSync(new URL('game.log', dir), 'utf8');
  const version = report.installedVersion.replace(/ \([^)]+\)$/, '');
  return { report, log, version, cases: report.caseDefinitions.map(item => ({ test: item.test,
    ...evaluate(log, item.nonce, item.checks, version, item.test) })) };
}
test('recorded before/after native fixtures pass without claiming mission completion', () => {
  for (const name of ['baseline', 'after', 'final']) {
    const { report, cases } = replay(name);
    assert.equal(report.status, 'pass');
    assert.equal(report.missionCompletionPass, false);
    assert.equal(cases.length, 4);
    assert.ok(cases.every(item => item.transcriptPass));
    assert.deepEqual(report.relevantScriptErrors, []);
    assert.deepEqual(report.stagedChanges, []);
    assert.deepEqual(report.nativeFileChanges, []);
  }
});
test('native valid-script negative controls reject three behaviors, preserving the fourth', () => {
  const { report, cases } = replay('negative-control');
  assert.equal(report.status, 'fail');
  assert.equal(report.exitCode, 1);
  assert.deepEqual(Object.values(report.staticValidation).map(item => item.exitCode), [0, 0]);
  assert.deepEqual(cases.map(item => item.transcriptPass), [false, false, false, true]);
  assert.ok(cases[2].assertionFailures.includes('FAIL unallied-dip-plus-50'));
});
test('a crash before assertions supplies no passing behavioral transcript', () => {
  const { report, cases } = replay('crash');
  assert.equal(report.behavioralPass, false);
  assert.ok(cases.every(item => !item.transcriptPass));
});
test('effect transcripts reject missing assertions, wrong nonce and swapped order', () => {
  const { report, log, version } = replay('after');
  const item = report.caseDefinitions.find(item => item.test === 'borders-reward');
  const judge = (text, nonce = item.nonce) => evaluate(text, nonce, item.checks, version, item.test).transcriptPass;
  assert.equal(judge(log, 'stale'), false);
  assert.equal(judge(log.split('\n').filter(line => !line.includes('OK unallied-dip-plus-50')).join('\n')), false);
  assert.equal(judge(log.replace('OK unallied-dip-plus-50', 'OK allied-dip-unchanged')), false);
});
