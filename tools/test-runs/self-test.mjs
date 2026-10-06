import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { delta, messages, compare, main } from './collector.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(here, 'test-work', crypto.randomUUID());
const logs = path.join(fixture, 'logs');
const storage = path.join(fixture, 'reports');
fs.mkdirSync(logs, { recursive: true });
const call = (...args) => main([...args], { storage });
const put = (name, value) => fs.writeFileSync(path.join(logs, name), value);
const getReport = id => JSON.parse(fs.readFileSync(path.join(storage, 'brittany_missions', id, 'report.json')));
assert.equal(delta(Buffer.from('old\n'), Buffer.from('old\nnew\n')).bytes.toString(), 'new\n');
assert.equal(delta(Buffer.from('long old'), Buffer.from('new')).mode, 'replaced-or-truncated');
assert.equal(delta(Buffer.from('old\npart'), Buffer.from('old\npartial line\n')).bytes.toString(), 'partial line\n');
assert.deepEqual(messages(Buffer.from('[12:34:56][scope.cpp:123]: province 456\n')), ['[scope.cpp:123]: province 456']);
assert.equal(compare(['x', 'x'], ['x'])[0].additionalOccurrences, 1);

put('error.log', 'previous session\n');
put('game.log', 'old game\n');
put('error_old.log', 'excluded\n');
assert.throws(() => call('begin', '--deployment', path.join(fixture, 'missing-deployment.json'),
  '--scenario', 'missing deployment'), /deployment record/);
const first = call('begin', '--untracked', '--logs', logs, '--scenario', 'Vanilla baseline');
assert.equal(call('status').status, 'running');
assert.throws(() => call('begin', '--untracked', '--logs', logs, '--scenario', 'overlap'), /unfinished/);
put('error.log', '[12:00:00][engine.cpp:10]: baseline issue\n');
fs.appendFileSync(path.join(logs, 'game.log'), 'new game\n');
const finished = call('finish', '--outcome', 'not-completed');
assert.equal(finished.outcome, 'not-completed');
const firstReport = getReport(first.id);
assert.equal(firstReport.files.find(file => file.name === 'error.log').mode, 'replaced-or-truncated');
assert.equal(firstReport.files.find(file => file.name === 'game.log').messages[0], 'new game');
assert.equal(firstReport.files.some(file => file.name === 'error_old.log'), false);
assert.equal(firstReport.newErrorMessages.length, 1);
assert.equal(call('status').status, 'no-active-run');
assert.throws(() => call('finish', '--run', first.id), /already finished/);
call('baseline', '--run', first.id);

const second = call('begin', '--untracked', '--logs', logs, '--scenario', 'Mod startup');
// A new startup replaces logs; timestamp changes should not create new findings.
put('error.log', '[13:00:00][engine.cpp:10]: baseline issue\n[13:00:01][mission.cpp:20]: new issue\n');
fs.unlinkSync(path.join(logs, 'game.log'));
call('finish', '--outcome', 'failed', '--notes', 'Mission did not appear');
const secondReport = getReport(second.id);
assert.equal(secondReport.newErrorMessages.length, 1);
assert.match(secondReport.newErrorMessages[0].message, /new issue/);
assert.deepEqual(secondReport.missingLogs, ['game.log']);
assert.equal(secondReport.notes, 'Mission did not appear');

const third = call('begin', '--untracked', '--logs', logs, '--scenario', 'No game launched');
call('finish');
assert.equal(getReport(third.id).changedLogs, 0);
assert.equal(getReport(third.id).outcome, 'unverified');
assert.throws(() => call('baseline', '--run', '../escape'), /Invalid/);

// Explicit deployment records identify the exact build and detect changes.
const deployed = path.join(fixture, 'deployed');
fs.mkdirSync(deployed);
const script = path.join(deployed, 'mission.txt');
const launcher = path.join(fixture, 'test.mod');
fs.writeFileSync(script, 'original bytes');
fs.writeFileSync(launcher, 'descriptor');
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();
const record = path.join(fixture, 'deployment.json');
fs.writeFileSync(record, JSON.stringify({ target: deployed, launcher, launcherSha256: hash(launcher), files: [{ path: 'mission.txt', sha256: hash(script) }] }));
const tracked = call('begin', '--deployment', record, '--logs', logs, '--scenario', 'Tracked test');
fs.writeFileSync(script, 'changed during run');
call('finish');
assert.deepEqual(getReport(tracked.id).deploymentChanges, ['mission.txt']);
assert.throws(() => call('begin', '--deployment', record, '--logs', logs, '--scenario', 'Changed build'), /differs from record/);
fs.writeFileSync(script, 'original bytes');
fs.writeFileSync(path.join(deployed, 'extra.txt'), 'unrecorded');
assert.throws(() => call('begin', '--deployment', record, '--logs', logs, '--scenario', 'Extra file'), /extra file/);
console.log('PASS: lifecycle, deployment identity, timestamps, append/reset detection, baseline comparison, missing logs, unverified outcomes, path protection.');
