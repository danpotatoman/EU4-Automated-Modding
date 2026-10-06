// Local public Markdown targets/anchors only; external sites are not fetched.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { candidateFiles } from './audit.mjs';
const root = path.resolve(fileURLToPath(new URL('../../',import.meta.url)));
const files = candidateFiles().filter(f => fs.existsSync(path.join(root,f)));
const publicFiles = new Set(files);
const stripCode = text => text.replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm,'').replace(/`[^`\n]*`/g,'');
function anchors(text) {
  const set = new Set(), counts = new Map();
  for (const heading of text.matchAll(/^#{1,6}\s+(.+?)\s*#*\s*$/gm)) {
    const slug = heading[1].toLowerCase().replace(/<[^>]*>/g,'').replace(/[^\p{L}\p{N}_\-\s]/gu,'').replace(/\s/g,'-');
    const count = counts.get(slug) || 0; counts.set(slug,count+1);
    set.add(slug + (count ? '-' + count : ''));
  }
  for (const html of text.matchAll(/(?:id|name)=["']([^"']+)["']/g)) set.add(html[1]);
  return set;
}
let checked = 0; const issues = [];
for (const file of files.filter(f => f.endsWith('.md'))) {
  const text = stripCode(fs.readFileSync(path.join(root,file),'utf8'));
  for (const match of text.matchAll(/!?\[[^\]]*\]\(([^\n)]+)\)/g)) {
    let target = match[1].replace(/^<|>$/g,'').split(/\s+["']/)[0];
    if (/^[a-z][a-z0-9+.-]*:/i.test(target)) continue;
    checked++;
    const [relative,fragment] = target.split('#');
    const absolute = path.resolve(root,path.dirname(file),decodeURIComponent(relative || path.basename(file)));
    const key = path.relative(root,absolute).replaceAll('\\','/');
    const directory = fs.existsSync(absolute) && fs.statSync(absolute).isDirectory();
    if (!publicFiles.has(key) && !(directory && files.some(f => f.startsWith(key + '/')))) {
      issues.push({file,target,reason:'target absent from public candidate'}); continue;
    }
    if (fragment && key.endsWith('.md') && !anchors(fs.readFileSync(absolute,'utf8')).has(decodeURIComponent(fragment)))
      issues.push({file,target,reason:'missing heading/anchor'});
  }
}
for (const issue of issues) console.log(`${issue.file}: ${issue.target}: ${issue.reason}`);
console.log(`Checked ${checked} local public links; ${issues.length} issues.`);
process.exitCode = issues.length ? 1 : 0;
