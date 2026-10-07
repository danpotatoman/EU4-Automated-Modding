// Owner: repository/framework; retained Brittany workload
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { evaluate } from './contracts/brittany_missions/evaluate.mjs';
import { profileInCommand } from './lifecycle.mjs';

const evidence = new URL('../../docs/testing/runtime-recovery/evidence/', import.meta.url);
function replay(name) {
  const directory = new URL(`${name}/`, evidence);
  const report = JSON.parse(fs.readFileSync(new URL('result.json', directory), 'utf8'));
  const log = fs.readFileSync(new URL(`attempt-${report.attempts.length}/game.log`, directory), 'utf8');
  assert.equal(report.status, 'pass');
  assert.equal(report.exitCode, 0);
  assert.equal(report.missionCompletionPass, false);
  assert.ok(report.caseDefinitions.every(item => evaluate(log, item.nonce, item.checks,
    report.installedVersion.replace(/ \([^)]+\)$/, ''), item.test).transcriptPass));
  assert.ok(report.attempts.every(item => item.cleanup.clean));
  assert.deepEqual(report.relevantScriptErrors, []);
  assert.deepEqual(report.stagedChanges, []);
  assert.deepEqual(report.nativeFileChanges, []);
  return { directory, report };
}
test('real owned-game termination is incomplete then retries once to four valid contracts', () => {
  const { report } = replay('terminate');
  assert.equal(report.attempts.length, 2);
  const first = report.attempts[0];
  assert.equal(first.reason, 'unexpected-exit');
  assert.equal(first.behavioralPass, false);
  assert.equal(first.retryScheduled, true);
  assert.ok(first.controlledTermination);
  assert.ok(first.caseResults.every(item => item.status === 'incomplete'));
  assert.notEqual(first.profile, report.attempts[1].profile);
});
test('real native crash retains reporter identity, forced cleanup and fresh passing retry', () => {
  const { directory, report } = replay('crash');
  const first = report.attempts[0];
  assert.equal(report.attempts.length, 2);
  assert.equal(first.reason, 'native-crash');
  assert.equal(first.behavioralPass, false);
  assert.ok(first.crashes.length);
  assert.ok(first.caseResults.every(item => item.status === 'incomplete'));
  assert.equal(first.controlledCrash.command, 'CrashReporter.SimulateCrash');
  const reporter = first.cleanup.known.find(item => item.name === 'CrashReporter.exe');
  assert.ok(reporter.command.includes('--crashdir='));
  assert.equal(reporter.windowTitle, 'Paradox Crash Reporter');
  assert.ok(first.cleanup.actions.some(item => item.pid === reporter.pid && item.action === 'forced'));
  assert.ok(fs.readFileSync(new URL('attempt-1/exception.txt', directory), 'utf8').includes('EU4 v1.37.5.0'));
});
test('separate clean follow-up has one successful attempt and no retained processes or lock', () => {
  const { directory, report } = replay('clean');
  assert.equal(report.attempts.length, 1);
  assert.equal(report.attempts[0].reason, 'complete');
  const inventory = JSON.parse(fs.readFileSync(new URL('post-run-processes.json', directory), 'utf8').replace(/^\uFEFF/, ''));
  assert.equal(inventory.lockExists, false);
  assert.equal(inventory.remainingCount, 0);
  assert.deepEqual(inventory.remaining, []);
});

test('real after-BEGIN EU4 suspension times out despite unrelated log traffic, then cleans before fresh passing retry', () => {
  const { directory, report } = replay('freeze');
  assert.equal(report.attempts.length, 2);
  const [first, second] = report.attempts;
  const diagnostic = first.freezeDiagnostic;
  assert.equal(first.reason, 'progress-timeout');
  assert.equal(first.behavioralPass, false);
  assert.ok(first.caseResults.every(item => item.status === 'incomplete'));
  assert.equal(first.exitCode, null); assert.equal(first.signalCode, null); // Alive at timeout.
  assert.ok(first.elapsedMs < report.recoveryPolicy.timeoutSeconds * 1000);
  assert.equal(first.retryScheduled, true);
  assert.equal(diagnostic.suspension.action, 'suspended');
  assert.equal(diagnostic.suspension.ntStatus, 0);
  assert.equal(diagnostic.identity.pid, first.pid);
  assert.ok(profileInCommand(diagnostic.identity.command, first.profile, true));
  assert.ok(diagnostic.suspension.threadCount > 0);
  assert.equal(diagnostic.suspension.suspendedThreadCount, diagnostic.suspension.threadCount);
  assert.ok(diagnostic.suspension.threads.every(item => item.waitReason === 'Suspended'));
  const firstLog = fs.readFileSync(new URL('attempt-1/game.log', directory), 'utf8');
  assert.ok(firstLog.includes(diagnostic.begin));
  assert.ok(diagnostic.begin.includes(`EU4RT ${report.caseDefinitions[0].nonce} BEGIN`));
  const native = firstLog.split(/\r?\n/).filter(line => report.caseDefinitions.some(item => line.includes(`EU4RT ${item.nonce} `)));
  assert.equal(native.length, first.markerCount);
  assert.equal(native.at(-1), diagnostic.lastSignalBeforeSuspend);
  assert.equal(first.lastSignal, diagnostic.lastSignalBeforeSuspend);
  const noise = firstLog.split(/\r?\n/).filter(line => line.startsWith(diagnostic.generalActivity.prefix));
  assert.ok(noise.length > 0);
  assert.equal(noise.length, diagnostic.generalActivity.count);
  assert.ok(diagnostic.progressIdleSecondsAtDetection >= report.recoveryPolicy.progressTimeoutSeconds);
  assert.ok(diagnostic.progressIdleSecondsAtDetection < report.recoveryPolicy.progressTimeoutSeconds + 5);
  assert.ok(first.cleanup.actions.some(item => item.pid === first.pid && item.action === 'forced'));
  assert.deepEqual(first.cleanup.remaining, []);
  assert.ok(Date.parse(second.startedAtUtc) >= Date.parse(first.finishedAtUtc));
  assert.notEqual(first.profile, second.profile);
  assert.equal(second.freezeDiagnostic, undefined);
  assert.ok(!first.launchCommand.some(value => value.startsWith('-auto_run=')));
  assert.ok(second.launchCommand.includes('-auto_run=eu4rt_run.commands'));
  assert.deepEqual(fs.readFileSync(new URL('attempt-1/eu4rt_run.commands', directory)),
    fs.readFileSync(new URL('attempt-2/eu4rt_run.commands', directory)));
  const inventory = JSON.parse(fs.readFileSync(new URL('post-run-processes.json', directory), 'utf8').replace(/^\uFEFF/, ''));
  assert.equal(inventory.remainingCount, 0); assert.deepEqual(inventory.remaining, []);
  assert.equal(inventory.harnessRemainingCount, 0); assert.deepEqual(inventory.harnessRemaining, []);
  assert.equal(inventory.recordedHarnessOwnerStillPresent, false);
  assert.equal(inventory.lockExists, false); assert.equal(inventory.collectorActive, false);
});

test('separate clean suite after real freeze passes with original dispatch, unchanged inputs and no remnants', () => {
  const { directory, report } = replay('freeze-clean');
  assert.equal(report.attempts.length, 1);
  assert.equal(report.attempts[0].reason, 'complete');
  assert.equal(report.attempts[0].freezeDiagnostic, undefined);
  assert.ok(report.attempts[0].launchCommand.includes('-auto_run=eu4rt_run.commands'));
  const read = file => JSON.parse(fs.readFileSync(new URL(file, directory), 'utf8').replace(/^\uFEFF/, ''));
  const inventory = read('post-run-processes.json');
  assert.equal(inventory.remainingCount, 0); assert.deepEqual(inventory.remaining, []);
  assert.equal(inventory.harnessRemainingCount, 0); assert.deepEqual(inventory.harnessRemaining, []);
  assert.equal(inventory.lockExists, false); assert.equal(inventory.collectorActive, false);
  const integrity = read('integrity-after.json');
  assert.equal(integrity.allUnchanged, true);
  assert.ok(integrity.files.length > 0);
  assert.ok(integrity.files.every(file => file.unchanged && file.before === file.after));
  const frozenInventory = JSON.parse(fs.readFileSync(new URL('freeze/post-run-processes.json', evidence), 'utf8').replace(/^\uFEFF/, ''));
  assert.deepEqual(inventory.steam, frozenInventory.steam);
});
