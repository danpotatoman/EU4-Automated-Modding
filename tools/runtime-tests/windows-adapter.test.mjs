// Local Windows process integration; kept outside the offline test command.
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { windowsProcesses, cleanupOwned } from './lifecycle.mjs';
const game = 'C:/Games/EU4';
test('Windows adapter terminates an owned dummy tree and preserves an unrelated child', { skip: process.platform !== 'win32' }, async () => {
  const unrelated = spawn(process.execPath, ['-e', 'setInterval(()=>{},1000)'], { stdio: 'ignore' });
  const parent = spawn(process.execPath, ['-e', `const {spawn}=require('node:child_process');
    const child=spawn(process.execPath,['-e','setInterval(()=>{},1000)'],{stdio:'ignore'});
    console.log(child.pid);setInterval(()=>{},1000);`], { stdio: ['ignore', 'pipe', 'ignore'] });
  let descendant;
  try {
    descendant = Number(await new Promise(resolve => parent.stdout.once('data', bytes => resolve(bytes.toString().trim()))));
    const identity = windowsProcesses.snapshot().find(item => item.pid === parent.pid);
    assert.ok(identity);
    const result = await cleanupOwned(windowsProcesses, { game, profiles: [], known: [identity] });
    assert.equal(result.clean, true);
    assert.deepEqual(new Set(result.actions.map(item => item.pid)), new Set([parent.pid, descendant]));
    const snapshot = windowsProcesses.snapshot();
    assert.ok(snapshot.some(item => item.pid === unrelated.pid));
    assert.ok(!snapshot.some(item => item.pid === descendant || item.pid === parent.pid));
  } finally {
    parent.kill(); unrelated.kill();
    if (descendant) {
      const identity = windowsProcesses.snapshot().find(item => item.pid === descendant);
      if (identity && identity.parentPid === parent.pid) windowsProcesses.stop(identity, false);
    }
  }
});

test('diagnostic suspension rejects changed identity, freezes only the held instance and existing cleanup kills it', { skip: process.platform !== 'win32' }, async () => {
  const heartbeat = () => spawn(process.execPath, ['-e', 'setInterval(()=>process.stdout.write("tick\\n"),10)'], { stdio: ['ignore', 'pipe', 'ignore'] });
  const owned = heartbeat(), unrelated = heartbeat();
  let ownedBytes = 0, unrelatedBytes = 0;
  owned.stdout.on('data', data => { ownedBytes += data.length; });
  unrelated.stdout.on('data', data => { unrelatedBytes += data.length; });
  const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    await new Promise(resolve => owned.stdout.once('data', resolve));
    const identity = windowsProcesses.snapshot().find(item => item.pid === owned.pid);
    assert.ok(identity);
    assert.throws(() => windowsProcesses.suspend({ ...identity, created: '2000-01-01T00:00:00.0000000Z' }), /identity-changed/);
    assert.throws(() => windowsProcesses.suspend({ ...identity, executable: 'C:/not-this-process.exe' }), /identity-changed/);
    const frozen = windowsProcesses.suspend(identity);
    assert.equal(frozen.action, 'suspended');
    assert.equal(frozen.ntStatus, 0);
    assert.ok(frozen.threadCount > 0);
    assert.equal(frozen.suspendedThreadCount, frozen.threadCount);
    await pause(100); // Drain output queued before suspension.
    const beforeOwned = ownedBytes, beforeUnrelated = unrelatedBytes;
    await pause(250);
    assert.equal(ownedBytes, beforeOwned);
    assert.ok(unrelatedBytes > beforeUnrelated);
    const result = await cleanupOwned(windowsProcesses, { game, profiles: [], known: [identity] });
    assert.equal(result.clean, true);
    assert.ok(result.actions.some(item => item.pid === owned.pid && item.action === 'forced'));
    assert.ok(windowsProcesses.snapshot().some(item => item.pid === unrelated.pid));
  } finally { owned.kill(); unrelated.kill(); }
});
