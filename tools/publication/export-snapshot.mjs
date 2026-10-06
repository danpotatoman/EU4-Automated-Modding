// No history rewrite, commit, remote or push. Each invocation creates a new directory.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { candidateFiles } from './audit.mjs';
const root = path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const check = spawnSync(process.execPath,[path.join(root,'tools/publication/audit.mjs')],{cwd:root,stdio:'inherit',windowsHide:true});
if (check.status !== 0) throw Error('Candidate audit did not pass; no snapshot exported.');
const base = path.join(root,'.local','publication');
const directory = path.join(base,'snapshot-' + new Date().toISOString().replace(/[-:.]/g,''));
fs.mkdirSync(base,{recursive:true}); fs.mkdirSync(directory); // refuse an existing output
const manifest = [];
for (const file of candidateFiles()) {
  const source = path.join(root,file);
  if (!fs.existsSync(source)) continue;
  if (!fs.lstatSync(source).isFile()) throw Error('Non-regular candidate: ' + file);
  const destination = path.join(directory,file);
  if (!destination.startsWith(directory + path.sep)) throw Error('Candidate escaped snapshot root');
  fs.mkdirSync(path.dirname(destination),{recursive:true}); fs.copyFileSync(source,destination);
  manifest.push({file,bytes:fs.statSync(source).size,sha256:crypto.createHash('sha256').update(fs.readFileSync(source)).digest('hex')});
}
execFileSync('git',['init','--quiet',directory],{cwd:root,windowsHide:true});
fs.writeFileSync(directory + '-manifest.json',JSON.stringify({history:'Fresh local Git index; no commits, remote or inherited objects',files:manifest},null,2)+'\n');
fs.writeFileSync(path.join(base,'latest-snapshot.json'),JSON.stringify({directory,files:manifest.length,bytes:manifest.reduce((n,f)=>n+f.bytes,0)},null,2)+'\n');
console.log(`Exported ${manifest.length} files to a fresh local review repository. See .local/publication/latest-snapshot.json.`);
