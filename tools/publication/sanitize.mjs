// Only removes path provenance. Never use this to conceal failed assertions.
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../config.mjs';
const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const escape = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function redactPaths(text, mappings) {
  for (const [source, target] of [...mappings].sort((a,b) => b[0].length-a[0].length)) {
    const slash = source.replaceAll('\\', '/').replace(/\/$/, '');
    for (const separator of ['/', '\\', '\\\\']) {
      text = text.replace(new RegExp(escape(slash.replaceAll('/', separator)), 'gi'),
        () => target.replaceAll('/', separator));
    }
  }
  return text;
}
export function localMappings() {
  // All reports describe original Windows runs; replacement paths are stable
  // synthetic Windows paths, preserving process/profile comparisons in replays.
  const homeFromRoot = root.replaceAll('\\','/').match(/^[A-Z]:\/Users\/[^/]+/i)?.[0];
  return [[root,'X:/eu4-research'],
    [path.dirname(loadConfig('deployment').gameModDirectory),'X:/eu4-user-data'],
    [loadConfig('cwtools').gamePath,'X:/eu4-game'],
    [homeFromRoot || os.homedir(),'X:/developer-home']];
}
