// Review aid, not a substitute for ownership review or a dedicated secret scanner.
// Never print matched values: reports themselves must not leak a discovered secret.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('../../', import.meta.url)));
const patterns = [
  ['personal-path', /[A-Z]:[\\/]+Users[\\/]+(?!Public\b|Default\b)[^\s"'<>]+/gi],
  ['personal-path', /file:\/\/\/[^\s"']*\/Users\/[^\s"']+/gi],
  ['private-key', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
  ['credential-token', /\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16}|sk-(?:proj-)?[A-Za-z0-9_-]{24,}|xox[baprs]-[A-Za-z0-9-]{15,})\b/g],
  ['credential-assignment', /\b(?:api[_-]?key|client[_-]?secret|access[_-]?token|password)\s*[=:]\s*["'][^"'\r\n]{8,}["']/gi],
  ['email-address', /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi],
];
export function scanText(text, file) {
  const findings = [];
  for (const [rule, re] of patterns) {
    re.lastIndex = 0;
    for (const match of text.matchAll(re)) findings.push({ file, rule, line: text.slice(0, match.index).split('\n').length });
  }
  return findings;
}
export function scanBytes(bytes, file, local = false) {
  const findings = [];
  if (!local && forbidden(file)) findings.push({ file, rule: 'excluded-artifact' });
  if (!local && bytes.length > 1024 * 1024) findings.push({ file, rule: 'oversized-file', bytes: bytes.length });
  if (bytes.subarray(0,8192).includes(0)) return { bytes: bytes.length, findings, binary: true };
  findings.push(...scanText(bytes.toString('utf8'),file));
  return { bytes: bytes.length, findings, text: true };
}
function git(args, options = {}) {
  // Shared workspace ownership may differ from the sandbox identity. No global config.
  return execFileSync('git', ['-c', `safe.directory=${root.replaceAll('\\', '/')}`, ...args],
    { cwd: root, maxBuffer: 128 * 1024 * 1024, ...options });
}
export function candidateFiles() {
  return [...new Set(git(['ls-files', '-z', '--cached', '--others', '--exclude-standard']).toString().split('\0').filter(Boolean))].sort();
}
function forbidden(file) {
  return /(?:^|\/)(?:\.local|node_modules|\.vscode|\.idea|rules-download|test-work|save games|crashes|logs)(?:\/|$)/i.test(file)
    || /^tools\/(?:runtime-tests\/work|[^/]+\/(?:reports|state|\.cache))\//.test(file)
    || /^docs\/modding\/examples\//.test(file)
    || /^docs\/testing\/.*\/evidence\/(?:.*\/)?(?:meta\.yml|[^/]*system\.log)$/.test(file)
    || /(?:\.local\.json|\.eu4|\.dmp|\.mdmp|\.cwb|\.exe|\.dll|\.zip|\.pem|\.key|\.pfx|\.p12)$/i.test(file)
    || /(?:^|\/)\.env(?:\.|$)/.test(file) && !file.endsWith('.example')
    || /^docs\/testing\/.*\.(?:png|jpe?g|webp)$/i.test(file);
}
function scanFile(file, duplicateGroups, local = false) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) return { missing: true, findings: [] }; // unstaged deletion
  const stat = fs.lstatSync(absolute);
  if (!stat.isFile()) return { bytes: 0, findings: [{ file, rule: 'non-regular-file' }] };
  const findings = [];
  if (!local && forbidden(file)) findings.push({ file, rule: 'excluded-artifact' });
  if (!local && stat.size > 1024 * 1024) findings.push({ file, rule: 'oversized-file', bytes: stat.size });
  // Saves are text and scanned locally; binaries cannot be meaningfully secret-scanned.
  if (/\.(?:png|jpe?g|webp|gif|exe|dll|dmp|mdmp|cwb|zip|woff2?)$/i.test(file))
    return { bytes: stat.size, findings, binary: true };
  const bytes = fs.readFileSync(absolute);
  if (bytes.subarray(0, 8192).includes(0)) return { bytes: stat.size, findings, binary: true };
  if (duplicateGroups) {
    const hash = crypto.createHash('sha256').update(bytes).digest('hex');
    (duplicateGroups[hash] ||= []).push(file);
  }
  const text = bytes.toString('utf8');
  findings.push(...scanText(text, file));
  return { bytes: stat.size, findings, text: true };
}
function stagedAudit() {
  const entries = git(['ls-files','--stage','-z']).toString().split('\0').filter(Boolean);
  const findings = []; let bytes = 0;
  for (const entry of entries) {
    const [header,file] = entry.split('\t'), [mode,object,stage] = header.split(' ');
    if (stage !== '0' || !['100644','100755'].includes(mode)) {
      findings.push({file,rule:'unmerged-or-non-regular-index-entry'}); continue;
    }
    const data = git(['cat-file','blob',object]);
    const result = scanBytes(data,file);
    bytes += result.bytes; findings.push(...result.findings);
  }
  return { files: entries.length, bytes, findings };
}
function walk(dir = '') {
  return fs.readdirSync(path.join(root, dir), { withFileTypes: true }).flatMap(e => {
    if (e.name === '.git' || e.name === '.local') return [];
    const f = (dir ? dir + '/' : '') + e.name;
    return e.isDirectory() ? walk(f) : [f];
  });
}
function historyAudit() {
  const objects = git(['rev-list', '--objects', '--all', '--reflog']).toString().trim().split('\n').filter(Boolean);
  const info = git(['cat-file', '--batch-check=%(objectname) %(objecttype) %(objectsize)'],
    { input: objects.map(line => line.split(' ')[0]).join('\n') + '\n' }).toString().trim().split('\n');
  const findings = [];
  let blobs = 0, bytes = 0, binary = 0;
  for (let i = 0; i < info.length; i++) {
    const [oid, type, size] = info[i].split(' ');
    if (type !== 'blob') continue;
    blobs++; bytes += Number(size);
    const file = objects[i].slice(oid.length + 1) || '(unmapped blob)';
    if (forbidden(file)) findings.push({ file, object: oid, rule: 'historical-excluded-artifact' });
    if (Number(size) > 1024 * 1024) findings.push({ file, object: oid, rule: 'historical-oversized-file', bytes: Number(size) });
    const data = git(['cat-file', 'blob', oid]);
    if (data.subarray(0, 8192).includes(0)) { binary++; continue; }
    findings.push(...scanText(data.toString('utf8'), file).map(f => ({ ...f, object: oid })));
  }
  const commits = git(['log', '--all', '--format=%B%x00']).toString();
  findings.push(...scanText(commits, '(commit messages)'));
  const identities = git(['log', '--all', '--format=%an <%ae>%n%cn <%ce>']).toString();
  const metadataEmailCount = new Set(identities.match(/<[^>]+@[^>]+>/g) || []).size;
  return { blobs, bytes, binary, metadataEmailCount, findings };
}
function main() {
  const args = process.argv.slice(2);
  if (args.some(a => !['--history', '--local', '--json', '--staged'].includes(a))) throw Error('Usage: node tools/publication/audit.mjs [--history] [--local] [--staged] [--json]');
  const files = args.includes('--staged') ? [] : candidateFiles(), duplicateGroups = {}, findings = [];
  let bytes = 0, missing = 0;
  for (const file of files) {
    const result = scanFile(file, duplicateGroups);
    bytes += result.bytes || 0; missing += Number(!!result.missing); findings.push(...result.findings);
  }
  const report = { scope: args.includes('--staged') ? 'index bytes to be committed' : 'tracked + unignored untracked worktree; unstaged deletions omitted', files: files.length - missing, bytes, findings,
    duplicates: Object.values(duplicateGroups).filter(g => g.length > 1) };
  if (args.includes('--staged')) Object.assign(report,stagedAudit());
  if (args.includes('--history')) report.history = historyAudit();
  if (args.includes('--local')) {
    const all = walk(), groups = {}, localFindings = []; let localBytes = 0, binary = 0, text = 0;
    for (const file of all) {
      const group = file.split('/').slice(0, file.startsWith('tools/') ? 3 : 2).join('/');
      const result = scanFile(file, null, true);
      const g = groups[group] ||= { files: 0, bytes: 0 };
      g.files++; g.bytes += result.bytes || 0; localBytes += result.bytes || 0;
      binary += Number(!!result.binary); text += Number(!!result.text);
      localFindings.push(...result.findings);
    }
    report.local = { files: all.length, bytes: localBytes, binary, text, groups, findings: localFindings };
  }
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Candidate: ${report.files} files, ${report.bytes} bytes, ${report.findings.length} findings.`);
    for (const f of report.findings) console.log(`${f.file}${f.line ? ':' + f.line : ''}: ${f.rule}`);
    if (report.history) console.log(`History: ${report.history.blobs} blobs, ${report.history.findings.length} findings, ${report.history.metadataEmailCount} distinct author/committer email identities (review privately).`);
    if (report.local) console.log(`Local inventory: ${report.local.files} files, ${report.local.bytes} bytes, ${report.local.findings.length} findings; use --json and redirect to .local for detail.`);
    console.log('Binary contents, unknown credential formats, ownership and personal names require human review. No matched values printed.');
  }
  process.exitCode = report.findings.length || report.history?.findings.length ? 1 : 0;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
