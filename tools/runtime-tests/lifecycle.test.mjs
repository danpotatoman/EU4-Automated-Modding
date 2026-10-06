import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { test } from 'node:test';
import { observe, runAttempts, ownedProcesses, cleanupOwned, profileInCommand, recordedOwnership, acquireRunLock, windowsProcesses } from './lifecycle.mjs';

const game = 'C:/Games/EU4';
const profile = 'C:/work/isolated profile';
const record = (pid, name, extra = {}) => ({ pid, parentPid: 1, name, created: '2026-10-03T00:00:00Z',
  executable: `${game}/${name}`, command: '', ...extra });
const ownedGame = record(10, 'eu4.exe', { command: `eu4.exe "-userdir=${profile}/" -debug` });
const reporter = record(11, 'CrashReporter.exe', { parentPid: 10, executable: `${game}/crash_reporter/binaries/CrashReporter.exe` });
const fakeChild = () => Object.assign(new EventEmitter(), { exitCode: null, signalCode: null });
const deterministic = async (read, options = {}) => {
  let time = 0;
  return observe(options.child || fakeChild(), { read, complete: text => text.includes('END'),
    timeoutMs: 100, progressTimeoutMs: 30, now: () => time, wait: async ms => { time += ms; }, pollMs: 10, ...options });
};
const sample = text => ({ text, isProgress: line => line.startsWith('EU4RT current ') });

test('actual child exit is detected even when no markers were emitted', async () => {
  const child = spawn(process.execPath, ['-e', 'process.exit(7)'], { stdio: 'ignore' });
  const result = await observe(child, { read: () => sample(''), complete: () => false,
    timeoutMs: 5000, progressTimeoutMs: 1000, pollMs: 10 });
  assert.equal(result.reason, 'unexpected-exit');
  assert.equal(result.exitCode, 7);
  assert.equal(result.recoverable, true);
});
test('actual hung child is bounded and cleaned after timeout', async () => {
  const child = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { stdio: 'ignore' });
  try {
    const result = await observe(child, { read: () => sample(''), complete: () => false,
      timeoutMs: 100, progressTimeoutMs: 30, pollMs: 10 });
    assert.equal(result.reason, 'lifetime-timeout');
    assert.equal(result.recoverable, true);
  } finally {
    const exited = new Promise(resolve => child.once('exit', resolve));
    child.kill(); await exited;
  }
  assert.ok(child.exitCode !== null || child.signalCode !== null);
});
test('current markers drive stall timeout; unrelated log traffic cannot reset it', async () => {
  let polls = 0;
  const result = await deterministic(() => sample(`EU4RT current BEGIN\nEU4RT old OK ${++polls}`));
  assert.equal(result.reason, 'progress-timeout');
  assert.equal(result.elapsedMs, 30);
  assert.equal(result.markerCount, 1);
});
test('new test progress extends stall deadline but never lifetime deadline', async () => {
  let polls = 0;
  const result = await deterministic(() => sample(Array.from({ length: ++polls }, (_, i) => `EU4RT current OK ${i}`).join('\n')));
  assert.equal(result.reason, 'lifetime-timeout');
  assert.equal(result.elapsedMs, 100);
});
test('success remains complete, while nonzero exit and crash defeat complete markers', async () => {
  assert.equal((await deterministic(() => sample('EU4RT current END'))).reason, 'complete');
  const child = fakeChild(); child.exitCode = 3;
  assert.equal((await deterministic(() => sample('EU4RT current END'), { child })).reason, 'unexpected-exit');
  assert.equal((await deterministic(() => ({ ...sample('EU4RT current END'), crash: true }))).reason, 'native-crash');
});
test('launch and graphics failures do not trigger blind retries', async () => {
  const child = fakeChild();
  const launch = await deterministic(() => { child.emit('error', Error('missing exe')); return sample(''); }, { child });
  assert.equal(launch.reason, 'launch-error'); assert.equal(launch.recoverable, false);
  const graphics = await deterministic(() => ({ ...sample(''), graphicsFailure: true }));
  assert.equal(graphics.reason, 'graphics-initialization-failed'); assert.equal(graphics.recoverable, false);
});
test('quoted userdir matches exactly; similarly named or normal profiles are excluded', () => {
  for (const command of [`eu4 "-userdir=${profile}/"`, `eu4 -userdir="${profile}/"`, 'eu4 -userdir=C:/work/plain/'])
    assert.ok(profileInCommand(command, command.includes('plain') ? 'C:/work/plain' : profile, true));
  assert.equal(profileInCommand(`eu4 "-userdir=${profile}-other/"`, profile, true), false);
  assert.equal(profileInCommand('eu4 -debug', profile, true), false);
});
test('owned tree and orphan reporter are found; unrelated games/reporters and Steam survive', () => {
  const orphan = { ...reporter, parentPid: 999, command: `reporter "${profile}/crashes/crash1"` };
  const unrelated = record(20, 'eu4.exe', { command: 'eu4 -debug' });
  const otherReporter = { ...reporter, pid: 21, parentPid: 20 };
  const steam = record(22, 'steam.exe', { parentPid: 10 });
  const snapshot = [ownedGame, reporter, unrelated, otherReporter, steam];
  assert.deepEqual(ownedProcesses(snapshot, { game, profiles: [profile] }).map(item => item.pid), [10, 11]);
  assert.deepEqual(ownedProcesses([orphan, otherReporter], { game, profiles: [profile] }).map(item => item.pid), [11]);
  assert.deepEqual(ownedProcesses([reporter], { game, profiles: [], known: [ownedGame] }).map(item => item.pid), [11]);
});
test('PID reuse neither authorizes the replacement nor its descendants', () => {
  const recycled = { ...ownedGame, command: 'eu4 -debug', created: '2026-10-03T01:00:00Z' };
  const laterReporter = { ...reporter, created: '2026-10-03T02:00:00Z' };
  assert.deepEqual(ownedProcesses([recycled, laterReporter], { game, profiles: [], known: [ownedGame] }), []);
});
test('a later manual reuse of an old isolated profile is not a stale owned game', () => {
  const laterGame = { ...ownedGame, created: '2026-10-03T03:00:00Z' };
  const context = { game, profiles: [profile], profileWindows: [{ profile, pid: ownedGame.pid,
    startedAtUtc: '2026-10-03T00:00:00Z', finishedAtUtc: '2026-10-03T00:10:00Z' }] };
  assert.deepEqual(ownedProcesses([laterGame], context), []);
  assert.deepEqual(ownedProcesses([ownedGame], context).map(item => item.pid), [10]);
});
test('cleanup is idempotent, catches delayed reporters, and reports surviving processes', async () => {
  let snapshot = [ownedGame, reporter], polls = 0;
  const adapter = { snapshot: () => {
    if (++polls === 2) snapshot.push({ ...reporter, pid: 12, command: `reporter "${profile}/crashes/late"` });
    return snapshot;
  }, stop: item => { snapshot = snapshot.filter(value => value.pid !== item.pid); return 'forced'; } };
  const context = { game, profiles: [profile] };
  const result = await cleanupOwned(adapter, context, { wait: async () => {} });
  assert.equal(result.clean, true);
  assert.deepEqual(result.actions.map(item => item.pid), [11, 10, 12]);
  assert.equal((await cleanupOwned(adapter, context, { wait: async () => {} })).actions.length, 0);
  const stubborn = await cleanupOwned({ snapshot: () => [ownedGame], stop: () => 'refused' }, context, { wait: async () => {} });
  assert.equal(stubborn.clean, false); assert.equal(stubborn.remaining.length, 1);
});
test('retry is bounded; assertions and unsuccessful cleanup never retry; success stops', async () => {
  for (const retries of [0, 1, 2]) {
    const result = await runAttempts({ retries, attempt: async () => ({ reason: 'unexpected-exit', recoverable: true, cleanup: { clean: true } }) });
    assert.equal(result.attempts.length, retries + 1); assert.equal(result.exhausted, true);
    assert.equal(result.final.retryScheduled, false);
  }
  for (const result of [{ recoverable: false, cleanup: { clean: true } }, { recoverable: true, cleanup: { clean: false } }])
    assert.equal((await runAttempts({ retries: 2, attempt: async () => ({ ...result }) })).attempts.length, 1);
  const recovered = await runAttempts({ retries: 2, attempt: async number => ({ reason: number === 1 ? 'progress-timeout' : 'complete', recoverable: number === 1, cleanup: { clean: true } }) });
  assert.equal(recovered.attempts.length, 2); assert.equal(recovered.exhausted, false);
});
test('ownership registry requires a recognized result and a profile inside its run', () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'eu4rt-ownership-'));
  try {
    const directory = path.join(work, 'run'); fs.mkdirSync(directory);
    fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify({ directory, nonce: '0123456789abcdef', startedAtUtc: '2026-10-03T00:00:00Z', stagedManifest: [], launchArgs: [`-userdir=${directory}/profile/`, '-userdir=C:/normal/profile/'] }));
    assert.deepEqual(recordedOwnership(work).profiles, [`${directory}/profile/`]);
    fs.writeFileSync(path.join(directory, 'result.json'), JSON.stringify({ directory: 'C:/other', nonce: '0123456789abcdef', stagedManifest: [] }));
    assert.deepEqual(recordedOwnership(work), { profiles: [], known: [], profileWindows: [] });
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});
test('lifecycle lock refuses live ownership, recovers dead ownership and releases', async () => {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'eu4rt-lock-'));
  const owner = record(process.pid, 'node.exe');
  try {
    const adapter = { snapshot: () => [owner] };
    const release = await acquireRunLock(work, adapter);
    await assert.rejects(acquireRunLock(work, adapter), /already owns/);
    release();
    fs.writeFileSync(path.join(work, 'active-lifecycle.json'), JSON.stringify({ owner: { ...owner, created: '2000-01-01' }, token: 'stale' }));
    (await acquireRunLock(work, adapter))();
    assert.equal(fs.existsSync(path.join(work, 'active-lifecycle.json')), false);
  } finally { fs.rmSync(work, { recursive: true, force: true }); }
});
