// Isolated headless-browser QA; does not open or control the user's browser session.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { prepareBrowserFixture } from './browser-fixture.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const browser = process.argv[2] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
if (!fs.existsSync(browser)) throw Error('Provide the path to an installed Chromium browser.');
const {fixture,output} = prepareBrowserFixture();
const qa = `
<script>
try {
 const check = (value, message) => { if (!value) throw Error(message); };
 check(document.querySelectorAll('.node').length === 36, 'initial mission count: ' + document.querySelectorAll('.node').length + '; ' + document.body.dataset.runtime);
 check(document.querySelectorAll('.card').length === 36, 'initial cards');
 document.getElementById('scenario').value = '1'; document.getElementById('scenario').dispatchEvent(new Event('change'));
 check(document.querySelectorAll('.node').length === 39, 'French branch selection');
 document.getElementById('all').click();
 check(document.querySelectorAll('.node').length === 42, 'all series selection');
 check([...document.querySelectorAll('.finding')].filter(n => n.textContent.includes('overlap')).length === 3, 'overlap warnings');
 const firstFinding = [...document.querySelectorAll('.finding')].find(n => n.textContent.includes('overlap')); firstFinding.click();
 check(document.querySelectorAll('.node.focus').length === 2, 'finding focuses overlapping pair');
 check(document.getElementById('details').textContent.includes('Slot 1, row 11'), 'finding details');
 document.getElementById('reset').click();
 check(document.querySelectorAll('.node').length === 39, 'reset selection');
 document.getElementById('search').value = 'franco_breton_friendship'; document.getElementById('search').dispatchEvent(new Event('input'));
 check(document.querySelectorAll('.node.search').length === 1, 'search highlights matching mission');
 document.querySelector('.node.search').dispatchEvent(new MouseEvent('click'));
 check(document.getElementById('details').textContent.includes('bri_franco_breton_friendship'), 'mission click details');
 const previousWidth = document.getElementById('tree').getAttribute('width');
 document.getElementById('zoom').value = '50'; document.getElementById('zoom').dispatchEvent(new Event('input'));
 check(document.getElementById('tree').getAttribute('width') !== previousWidth, 'zoom changes tree');
 document.getElementById('scenario').value = '2'; document.getElementById('scenario').dispatchEvent(new Event('change'));
 check(document.querySelector('[data-id="bri_secure_the_borders"]') !== null, 'autonomous branch');
 check(document.querySelector('[data-id="bri_franco_breton_friendship"]') === null, 'French branch hidden');
 document.getElementById('scenario').value = '3'; document.getElementById('scenario').dispatchEvent(new Event('change'));
 check([...document.querySelectorAll('.finding')].some(n => n.textContent.includes('conflicting-state')), 'invalid state finding');
 document.getElementById('scenario').value = '0'; document.getElementById('scenario').dispatchEvent(new Event('change'));
 document.getElementById('search').value = ''; document.getElementById('search').dispatchEvent(new Event('input')); document.getElementById('fit').click();
 document.getElementById('canvas').scrollTop = 0;
 document.body.dataset.qa = 'PASS';
} catch(error) { document.body.dataset.qa = 'FAIL: ' + error.message; }
</script>`;
const testHtml = path.join(fixture, 'index.html');
fs.writeFileSync(testHtml, fs.readFileSync(output, 'utf8').replace('<script>', '<script>window.addEventListener("error", event => { document.body.dataset.runtime = event.message + ":" + event.lineno; });</script><script>').replace('</body>', qa + '</body>'));
const screenshot = path.join(fixture, 'preview.png');
const result = spawnSync(browser, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--disable-extensions', '--disable-background-networking', `--user-data-dir=${path.join(fixture, 'profile')}`, '--window-size=1700,1100', '--dump-dom', `--screenshot=${screenshot}`, pathToFileURL(testHtml).href], { encoding: 'utf8', timeout: 45000, windowsHide: true, maxBuffer: 8 * 1024 * 1024 });
fs.writeFileSync(path.join(fixture, 'browser-stderr.txt'), result.stderr || '');
fs.writeFileSync(path.join(fixture, 'rendered.html'), result.stdout || '');
if (result.error) throw result.error;
assert.equal(result.status, 0, result.stderr);
assert.ok(/data-qa="PASS"/.test(result.stdout), result.stdout.match(/data-qa="[^"]*"/)?.[0] || 'No QA result produced');
assert.ok(fs.existsSync(screenshot), 'Screenshot missing');
console.log('PASS: rendered grid, scenario switching, overlap markers, finding selection, details, search, zoom and invalid-state warning.');
console.log(`Screenshot: ${screenshot}`);
