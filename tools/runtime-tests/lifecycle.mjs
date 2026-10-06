// Owned native lifecycle used by run.mjs; no independent watcher or launcher.
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const helper = fileURLToPath(new URL('./processes.ps1', import.meta.url));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const norm = value => (value || '').replaceAll('\\', '/').toLowerCase().replace(/\/+$/, '');
export const sameProcess = (a, b) => a.pid === b.pid && a.created === b.created && norm(a.executable) === norm(b.executable);
export const inside = (base, file) => norm(file).startsWith(norm(base) + '/');
const ps = args => execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', helper, ...args],
  { encoding: 'utf8', windowsHide: true, timeout: 20000, maxBuffer: 8 * 1024 * 1024 }).trim();
export const windowsProcesses = {
  snapshot: () => JSON.parse(ps(['-Action', 'Snapshot'])),
  stop: (record, graceful) => ps(['-Action', 'Stop', '-OwnedId', String(record.pid),
    '-Created', record.created, '-Executable', record.executable, '-GraceSeconds', graceful ? '5' : '0']),
  // Only explicitly selected diagnostics call this; observation/cleanup do not.
  suspend: record => {
    const result = ps(['-Action', 'Suspend', '-OwnedId', String(record.pid), '-Created', record.created, '-Executable', record.executable]);
    if (!result.startsWith('{')) throw Error(`Diagnostic suspension refused: ${result}`);
    return JSON.parse(result);
  },
};

export function profileInCommand(command, profile, gameProcess = false) {
  const text = norm(command);
  const target = norm(profile);
  if (gameProcess) {
    // Windows may quote the whole argument or only its value. Spaces in userdir
    // must remain part of that argument; matching a directory prefix is unsafe.
    return [`"-userdir=${target}/"`, `-userdir="${target}/"`, `"-userdir=${target}"`,
      `-userdir="${target}"`].some(value => text.includes(value))
      || new RegExp(`(?:^|\\s)-userdir=${target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?(?:\\s|$)`).test(text);
  }
  return text.includes(target + '/') || text.includes(target + '"') || text.endsWith(target);
}

export function ownedProcesses(snapshot, { game, profiles, known = [], profileWindows }) {
  const gameExe = norm(path.join(game, 'eu4.exe'));
  const reporterExe = norm(path.join(game, 'crash_reporter/binaries/CrashReporter.exe'));
  const eligible = (item, profile, isGame) => !profileWindows || profileWindows.some(window => norm(window.profile) === norm(profile)
    && (!isGame || item.pid === window.pid)
    && Date.parse(item.created) >= Date.parse(window.startedAtUtc) - 2000
    && (!window.finishedAtUtc || Date.parse(item.created) <= Date.parse(window.finishedAtUtc) + (isGame ? 0 : 30000)));
  const selected = snapshot.filter(item => item.executable && (
    known.some(old => sameProcess(item, old))
    || norm(item.executable) === gameExe && profiles.some(profile => eligible(item, profile, true) && profileInCommand(item.command, profile, true))
    || norm(item.executable) === reporterExe && profiles.some(profile => eligible(item, profile, false) && profileInCommand(item.command, profile))));
  // Include descendants while their original parent identity is still known,
  // even when the game has exited. Creation ordering rejects recycled parents.
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of snapshot) {
      if (!item.executable || selected.some(old => sameProcess(item, old)) || /^steam(?:webhelper)?\.exe$/i.test(item.name)) continue;
      const parent = [...selected, ...known].find(old => old.pid === item.parentPid
        && Date.parse(old.created) <= Date.parse(item.created)
        && !snapshot.some(current => current.pid === old.pid && !sameProcess(current, old)));
      if (parent) { selected.push(item); changed = true; }
    }
  }
  return selected;
}

export function recordedOwnership(work) {
  const profiles = [], known = [], profileWindows = [];
  if (!fs.existsSync(work)) return { profiles, known, profileWindows };
  for (const entry of fs.readdirSync(work, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(work, entry.name);
    try {
      const result = JSON.parse(fs.readFileSync(path.join(directory, 'result.json'), 'utf8'));
      if (norm(result.directory) !== norm(directory) || !/^[a-f0-9]{16}$/.test(result.nonce)
        || !Array.isArray(result.stagedManifest)) continue;
      for (const value of result.launchArgs || []) {
        if (value.startsWith('-userdir=') && inside(directory, value.slice(9)) && result.startedAtUtc) {
          profiles.push(value.slice(9));
          profileWindows.push({ profile: value.slice(9), pid: result.pid, startedAtUtc: result.startedAtUtc, finishedAtUtc: result.finishedAtUtc });
        }
      }
      for (const attempt of result.attempts || []) if (inside(directory, attempt.profile || '') && attempt.startedAtUtc) {
        profiles.push(attempt.profile);
        profileWindows.push({ profile: attempt.profile, pid: attempt.pid, startedAtUtc: attempt.startedAtUtc, finishedAtUtc: attempt.finishedAtUtc });
      }
      if (result.activeAttempt?.profile && result.startedAtUtc && inside(directory, result.activeAttempt.profile)) {
        profiles.push(result.activeAttempt.profile);
        profileWindows.push({ profile: result.activeAttempt.profile, pid: result.activeAttempt.pid,
          startedAtUtc: result.startedAtUtc, finishedAtUtc: result.finishedAtUtc });
      }
      const file = path.join(directory, 'ownership.json');
      if (fs.existsSync(file)) {
        const owned = JSON.parse(fs.readFileSync(file, 'utf8'));
        profiles.push(...owned.profiles.filter(value => inside(directory, value)));
        known.push(...owned.known.filter(value => value.executable && value.created));
      }
    } catch { /* Incomplete records never authorize a broad name-based kill. */ }
  }
  return { profiles: [...new Set(profiles)], known, profileWindows };
}

export async function acquireRunLock(work, adapter) {
  const file = path.join(work, 'active-lifecycle.json');
  const snapshot = await adapter.snapshot();
  const owner = snapshot.find(item => item.pid === process.pid);
  if (!owner?.created || !owner.executable) throw Error('Cannot establish harness process identity.');
  const token = `${process.pid}-${Date.now()}`;
  const write = () => fs.writeFileSync(file, JSON.stringify({ owner, token }), { flag: 'wx' });
  try { write(); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    const old = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (snapshot.some(item => sameProcess(item, old.owner))) throw Error(`Native harness PID ${old.owner.pid} already owns the lifecycle.`);
    fs.unlinkSync(file);
    write(); // A racing caller wins atomically; never overwrite a live lock.
  }
  return () => {
    if (fs.existsSync(file) && JSON.parse(fs.readFileSync(file, 'utf8')).token === token) fs.unlinkSync(file);
  };
}

export async function cleanupOwned(adapter, context, { graceful = false, passes = 3, wait = delay } = {}) {
  const actions = [];
  const known = [...context.known || []];
  for (let pass = 0; pass < passes; pass++) {
    const owned = ownedProcesses(await adapter.snapshot(), { ...context, known });
    for (const item of owned) if (!known.some(old => sameProcess(old, item))) known.push(item);
    // Children/reporters first; the game can close normally only on success.
    for (const item of owned.sort((a, b) => (a.name.toLowerCase() === 'eu4.exe') - (b.name.toLowerCase() === 'eu4.exe'))) {
      const action = await adapter.stop(item, graceful && item.name.toLowerCase() === 'eu4.exe');
      actions.push({ pid: item.pid, created: item.created, executable: item.executable, action });
    }
    if (pass + 1 < passes) await wait(500);
  }
  const remaining = ownedProcesses(await adapter.snapshot(), { ...context, known });
  return { actions, remaining, clean: !remaining.length, known };
}

export async function observe(child, { read, complete, timeoutMs, progressTimeoutMs, pollMs = 500,
  now = Date.now, wait = delay, onPoll = async () => {}, onProgress = () => {} }) {
  const started = now();
  let lastProgressAt = started, lastSignal = null, count = 0, text = '', error;
  child.once('error', value => { error = value.message; });
  const finish = reason => ({ reason, recoverable: ['unexpected-exit', 'progress-timeout', 'lifetime-timeout', 'native-crash'].includes(reason),
    elapsedMs: now() - started, exitCode: child.exitCode, signalCode: child.signalCode,
    launchError: error, lastSignal, markerCount: count, lastProgressElapsedMs: lastProgressAt - started, text });
  while (true) {
    const sample = await read();
    text = sample.text;
    const markers = text.split(/\r?\n/).filter(line => sample.isProgress(line));
    if (markers.length > count) {
      count = markers.length; lastSignal = markers.at(-1); lastProgressAt = now();
      onProgress(lastSignal);
    }
    await onPoll();
    if (error) return finish('launch-error');
    if (sample.crash) return finish('native-crash');
    if (sample.graphicsFailure) return finish('graphics-initialization-failed');
    // A nonzero exit accompanying END is not a successful attempt.
    if (child.exitCode !== null || child.signalCode !== null) {
      if (child.exitCode === 0 && complete(text)) return finish('complete');
      return finish('unexpected-exit');
    }
    if (complete(text)) return finish('complete');
    if (now() - started >= timeoutMs) return finish('lifetime-timeout');
    // Loading has no reliable heartbeat. Until BEGIN use the startup/lifetime
    // budget; after native progress starts, only test markers reset the stall clock.
    if (count && now() - lastProgressAt >= progressTimeoutMs) return finish('progress-timeout');
    await wait(pollMs);
  }
}

export async function runAttempts({ retries, attempt, onAttempt = () => {} }) {
  if (!Number.isInteger(retries) || retries < 0 || retries > 2) throw Error('Retries must be 0..2.');
  const results = [];
  for (let number = 1; number <= retries + 1; number++) {
    const result = await attempt(number);
    result.number = number;
    result.retryScheduled = result.recoverable && result.cleanup?.clean === true && number <= retries;
    results.push(result);
    await onAttempt(result, results);
    if (!result.retryScheduled) break;
  }
  return { attempts: results, final: results.at(-1), exhausted: results.at(-1).recoverable
    && results.at(-1).cleanup?.clean === true && results.length === retries + 1 };
}

export function launchOwned(executable, args, { cwd, directory }) {
  const child = spawn(executable, args, { cwd, windowsHide: false, stdio: ['ignore', 'pipe', 'pipe'] });
  const outputErrors = [];
  const streams = ['stdout', 'stderr'].map(name => {
    const stream = fs.createWriteStream(path.join(directory, `${name}.txt`));
    stream.on('error', error => outputErrors.push(error.message));
    child[name].pipe(stream);
    return stream;
  });
  return { child, streams, outputErrors };
}
