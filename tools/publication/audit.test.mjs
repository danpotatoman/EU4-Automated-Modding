import test from 'node:test';
import assert from 'node:assert/strict';
import { scanText, scanBytes } from './audit.mjs';
import { redactPaths } from './sanitize.mjs';

test('publication scan reports private paths and credentials without echoing values', () => {
  const userPath = 'C:' + '/Users/' + 'fixture-user/private';
  const token = 'gh' + 'p_' + 'a'.repeat(32);
  const findings = scanText(`safe\n${userPath}\n${token}`, 'fixture');
  assert.deepEqual(findings.map(f => [f.rule,f.line]), [['personal-path',2],['credential-token',3]]);
  assert.ok(!JSON.stringify(findings).includes(token));
  assert.deepEqual(scanText('mission_completed = sample\nnonce = abcdef', 'fixture'), []);
});
test('index byte scan detects staged secrets and force-added local artifacts', () => {
  const secret = Buffer.from('gh' + 'p_' + 'b'.repeat(32));
  assert.equal(scanBytes(secret,'fixture.txt').findings[0].rule,'credential-token');
  for (const file of ['tools/runtime-tests/work/save.txt','tools/cwtools/config.local.json','docs/testing/capture.png','.env',
    'docs/testing/case/evidence/system.log','docs/testing/case/evidence/attempt/meta.yml'])
    assert.ok(scanBytes(Buffer.from('test'),file).findings.some(f => f.rule==='excluded-artifact'));
  assert.ok(scanBytes(Buffer.alloc(1024*1024+1),'oversized.txt').findings.some(f => f.rule==='oversized-file'));
});
test('path redaction preserves JSON validity, path relationships and failed verdicts', () => {
  const mapping = [['C:/fixture/project','X:/eu4-research']];
  const raw = JSON.stringify({status:'fail', profile:'C:\\fixture\\project\\profile', command:'-userdir=C:/fixture/project/profile/'});
  const report = JSON.parse(redactPaths(raw,mapping));
  assert.equal(report.status,'fail');
  assert.equal(report.profile,'X:\\eu4-research\\profile');
  assert.equal(report.command,'-userdir=X:/eu4-research/profile/');
});
