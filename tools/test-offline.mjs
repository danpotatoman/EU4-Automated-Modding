// No installed game, CWTools server, external input driver or Windows CIM needed.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const suites = ['tools/config.test.mjs',
  ...['tools/runtime-tests','tools/publication'].flatMap(dir => fs.readdirSync(path.join(root,dir))
    .filter(f => f.endsWith('.test.mjs') && f !== 'windows-adapter.test.mjs').map(f => `${dir}/${f}`))];
const commands = [['--test', ...suites], ...[
  'tools/mission-inspector/self-test.mjs', 'tools/test-runs/self-test.mjs',
  'tools/checks/self-test.mjs', 'tools/vanilla-reference/self-test.mjs',
].map(f => [f])];
for (const args of commands) {
  const result = spawnSync(process.execPath,args,{cwd:root,stdio:'inherit',windowsHide:true});
  if (result.error) throw result.error;
  if (result.status !== 0) { process.exitCode = result.status || 2; break; }
}
