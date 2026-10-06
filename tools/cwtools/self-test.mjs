// Integration checks against the real bundled CWTools server.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const helper = path.dirname(fileURLToPath(import.meta.url));
const fixture = path.join(helper, '.cache/self-test-project');
const effects = path.join(fixture, 'common/scripted_effects');
fs.mkdirSync(effects, { recursive: true });
const valid = path.join(effects, 'valid.txt');
const broken = path.join(effects, 'broken.txt');
const scope = path.join(effects, 'scope.txt');
const reference = path.join(effects, 'reference.txt');
for (const file of [broken, scope, reference]) if (fs.existsSync(file)) fs.unlinkSync(file);
fs.writeFileSync(valid, 'cwtools_helper_valid = { add_prestige = 1 }\n');

function validate() {
  const result = spawnSync(process.execPath, [path.join(helper, 'validate.mjs'), '--project', fixture],
    { encoding: 'utf8', timeout: 360000, windowsHide: true });
  process.stdout.write(result.stdout || '');
  process.stderr.write(result.stderr || '');
  if (result.error) throw result.error;
  const report = JSON.parse(fs.readFileSync(path.join(helper, 'reports/self-test-project/latest.json'), 'utf8'));
  assert.equal(report.status, 'complete', report.message);
  return { result, report };
}

const clean = validate();
assert.equal(clean.result.status, 0, 'A valid script should pass');
assert.equal(clean.report.summary.errors, 0);
fs.writeFileSync(broken, 'cwtools_helper_broken = { add_prestige = 1\n');
fs.writeFileSync(scope, 'cwtools_helper_bad_scope = { every_owned_province = { add_prestige = 1 } }\n');
fs.writeFileSync(reference, 'cwtools_helper_bad_reference = { add_country_modifier = { name = cwtools_helper_missing_modifier_28471 duration = 10 } }\n');
const invalid = validate();
assert.equal(invalid.result.status, 1, 'Invalid scripts should return the validation-error exit code');
assert.ok(invalid.report.diagnostics.some(d => d.file.endsWith('/broken.txt') && d.code === 'CW001'), 'Missing parser diagnostic');
assert.ok(invalid.report.diagnostics.some(d => d.file.endsWith('/scope.txt') && d.severity === 'error'), 'Missing scope diagnostic');
assert.ok(invalid.report.diagnostics.some(d => d.file.endsWith('/reference.txt')), 'Missing undefined-reference diagnostic');
const empty = path.join(helper, '.cache/self-test-empty');
fs.mkdirSync(empty, { recursive: true });
const failed = spawnSync(process.execPath, [path.join(helper, 'validate.mjs'), '--project', empty],
  { encoding: 'utf8', timeout: 10000, windowsHide: true });
assert.equal(failed.status, 2, 'An empty project must fail, not pass');
assert.equal(JSON.parse(fs.readFileSync(path.join(helper, 'reports/self-test-empty/latest.json'), 'utf8')).status, 'failed',
  'Failed runs must invalidate the previous report');
fs.writeFileSync(path.join(helper, 'reports/self-test.json'), JSON.stringify({
  status: 'passed', testedAt: new Date().toISOString(),
  checks: ['valid script passes', 'broken braces fail', 'wrong scope fails', 'undefined modifier is reported',
    'empty project fails and invalidates previous results'],
  cwtoolsVersion: invalid.report.cwtoolsVersion
}, null, 2) + '\n');
console.log('CWTools integration checks passed; fixture reports are separate from mod reports.');
