// Owner: mod/brittany_missions; offline checks/replays, no new native verdict
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { evaluate } from './contracts/brittany_missions/evaluate.mjs';

// Real EU4 evidence, with deliberately damaged copies to check false-PASS risks.
const evidence = new URL('../../docs/testing/runtime-preview-gate/evidence/', import.meta.url);
const text = fs.readFileSync(new URL('game.log', evidence), 'utf8');
const nonce = 'b4956d1d33a586d0';
const version = 'EU4 v1.37.5.0 Inca';
const checks = ['initial', ...Array.from({ length: 18 }, (_, i) => `dlc-${i + 1}`),
  'initial-allowed', 'french-preview-blocked', 'autonomous-preview-blocked', 'locked-allowed', 'final-flags'];
const judge = (input, token = nonce) => evaluate(input, token, checks, version);

test('the recorded EU4 execution passes the stricter version/date evaluator', () => {
  assert.equal(judge(text).transcriptPass, true);
  assert.equal(judge(text).markers.length, 26);
});
test('a failing assertion is rejected', () => {
  const result = judge(text.replace('OK french-preview-blocked', 'FAIL french-preview-blocked'));
  assert.equal(result.transcriptPass, false);
  assert.deepEqual(result.assertionFailures, ['FAIL french-preview-blocked']);
});
test('missing, duplicated, unfinished and stale evidence is rejected', () => {
  const lines = text.split('\n');
  assert.equal(judge(lines.filter(line => !line.includes('OK dlc-1\r')).join('\n')).transcriptPass, false);
  assert.equal(judge(text + '\n' + lines.find(line => line.includes('OK locked-allowed'))).transcriptPass, false);
  assert.equal(judge(lines.filter(line => !line.includes('END preview-gate')).join('\n')).transcriptPass, false);
  assert.equal(judge(text, 'different-run').transcriptPass, false);
  assert.equal(judge('Game Version: ' + version).transcriptPass, false);
});
test('wrong start date or running version is rejected', () => {
  assert.equal(judge(text.replaceAll('EVENT [1444.11.11]', 'EVENT [1445.11.11]')).transcriptPass, false);
  assert.equal(judge(text.replace(version, 'EU4 v1.37.4.0 Inca')).transcriptPass, false);
});

const missionEvidence = new URL('../../docs/testing/runtime-nantes-market/evidence/ready/', import.meta.url);
const missionText = fs.readFileSync(new URL('game.log', missionEvidence), 'utf8');
const missionReport = JSON.parse(fs.readFileSync(new URL('result.json', missionEvidence), 'utf8'));
const missionChecks = ['initial', ...Array.from({ length: 18 }, (_, i) => `dlc-${i + 1}`),
  'missing-building', 'fixture-marketplace', 'incomplete-before-action', 'rewards-absent-before-action',
  'mission-completed', 'downstream-parent-completed', 'selector-flags-unchanged'];
const judgeMission = (input, token = missionReport.nonce) => evaluate(input, token, missionChecks, version, 'nantes-market');

test('actual mission transcript verifies a state-only probe, not production rewards', () => {
  const result = judgeMission(missionText);
  assert.equal(result.transcriptPass, true);
  assert.equal(result.markers.length, 32);
  assert.deepEqual(result.observations, {
    'modifier-169': 'absent', 'modifier-4384': 'absent',
    'reward-value-169': 'zero', 'reward-value-4384': 'zero',
  });
  assert.equal(missionReport.status, 'partial');
  assert.equal(missionReport.nativeProbeVerified, true);
  assert.equal(missionReport.completionRecorded, true);
  assert.equal(missionReport.productionRewardVerified, false);
  assert.equal(missionReport.readinessVerified, false);
  assert.equal(missionReport.behavioralPass, false);
});
test('mission observation gaps, duplicates, unknown values and stale runs are rejected', () => {
  const lines = missionText.split('\n');
  const observation = lines.find(line => line.includes('OBS modifier-169 absent'));
  assert.equal(judgeMission(lines.filter(line => line !== observation).join('\n')).transcriptPass, false);
  assert.equal(judgeMission(missionText + '\n' + observation).transcriptPass, false);
  assert.equal(judgeMission(missionText.replace('OBS reward-value-169 zero', 'OBS reward-value-169 unknown')).transcriptPass, false);
  assert.equal(judgeMission(missionText, 'different-run').transcriptPass, false);
});
test('mission assertions and completion must arrive in the expected order and date', () => {
  assert.equal(judgeMission(missionText.replace('OK mission-completed', 'FAIL mission-completed')).transcriptPass, false);
  assert.equal(judgeMission(missionText.replaceAll('EVENT [1444.11.11]', 'EVENT [1445.11.11]')).transcriptPass, false);
  assert.equal(judgeMission(missionText.replace('END nantes-market', 'END preview-gate')).transcriptPass, false);
  assert.equal(judgeMission(missionText.replace('OK missing-building', 'OK fixture-marketplace')).transcriptPass, false);
});

const runEvidence = new URL('../../docs/testing/runtime-run-effects/evidence/value-calibration/', import.meta.url);
const runText = fs.readFileSync(new URL('game.log', runEvidence), 'utf8');
const runReport = JSON.parse(fs.readFileSync(new URL('result.json', runEvidence), 'utf8'));
const runChecks = ['initial', ...Array.from({ length: 18 }, (_, i) => `dlc-${i + 1}`),
  'implicit-bri', 'prestige-before-zero', 'flag-and-prestige-seven', 'scripted-flag-before',
  'scripted-flag-after', 'stability-before-zero', 'production-scripted-stability-one',
  'province-reward-before', 'province-value-correct', 'province-removed-zero',
  'finite-value-correct', 'cleanup-zero', 'missions-untouched'];
const judgeRun = (input, token = runReport.nonce) => evaluate(input, token, runChecks, version, 'run-effects');

test('native run-file calibration passes its value contract without claiming mission completion', () => {
  const result = judgeRun(runText);
  assert.equal(result.transcriptPass, true);
  assert.equal(result.markers.length, 36);
  assert.deepEqual(result.observations, {'permanent-presence': 'query-false', 'finite-presence': 'query-false'});
  assert.equal(runReport.status, 'pass');
  assert.equal(runReport.runFileUnchanged, true);
  assert.equal(runReport.modifierValueTransitionsVerified, true);
  assert.equal(runReport.productionMissionRewardVerified, false);
  assert.equal(runReport.missionCompletionPass, false);
});
test('run-file value failures, missing removals, stale and unexpected observations cannot pass', () => {
  assert.equal(judgeRun(runText.replace('OK province-value-correct', 'FAIL province-value-correct')).transcriptPass, false);
  assert.equal(judgeRun(runText.split('\n').filter(line => !line.includes('OK province-removed-zero')).join('\n')).transcriptPass, false);
  assert.equal(judgeRun(runText, 'different-run').transcriptPass, false);
  assert.equal(judgeRun(runText.replace('OBS finite-presence query-false', 'OBS finite-presence unknown')).transcriptPass, false);
});
test('earlier failed presence-query evidence is not relabeled as a passing calibration', () => {
  for (const name of ['immediate-query', 'separate-query']) {
    const dir = new URL(`../../docs/testing/runtime-run-effects/evidence/${name}/`, import.meta.url);
    const report = JSON.parse(fs.readFileSync(new URL('result.json', dir), 'utf8'));
    const failedText = fs.readFileSync(new URL('game.log', dir), 'utf8');
    assert.equal(report.status, 'fail');
    assert.equal(report.behavioralPass, false);
    assert.equal(judgeRun(failedText, report.nonce).transcriptPass, false);
  }
});
