import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { parse, extract, potential, analyze } from './engine.mjs';
import { generate } from './generate.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const make = script => ({ ...extract(script, 'fixture.txt'), icons: [], externalMissions: [] });
const codes = report => report.findings.map(finding => finding.code);
assert.throws(() => parse('a = { # comment\n b = "unterminated'), /Unterminated/);
assert.throws(() => parse('a = { b = yes'), /Unclosed/);
assert.equal(parse('a = { b = "a # } \\\" quoted" }')[0].value[0].value, 'a # } \\\" quoted');
const broken = make(`
one = { slot = 1 potential = { always = yes }
 a = { position = 1 icon = test required_missions = { b } }
 b = { position = 2 icon = test required_missions = { a } }
 c = { position = 2 required_missions = { b } }
 missing = { position = 3 required_missions = { nonexistent } }
 blocked = { position = 4 required_missions = { missing } }
}
invalid = { slot = 0 potential = { always = yes } bad = { position = -2 } }
`);
const findings = analyze(broken);
for (const code of ['overlap', 'cycle', 'backward-edge', 'missing-prerequisite', 'blocked-descendant', 'invalid-slot', 'invalid-position', 'missing-localisation', 'missing-icon']) assert.ok(codes(findings).includes(code), code);
assert.ok(findings.findings.find(finding => finding.code === 'cycle').missions.includes('a'));
const geometry = make(`
one = { slot = 1 a = { position = 1 } b = { position = 2 } c = { position = 3 required_missions = { a } } }
two = { slot = 2 d = { position = 1 } e = { position = 3 required_missions = { a } } }
three = { slot = 1 f = { position = 3 required_missions = { d } } }
`);
assert.ok(codes(analyze(geometry)).includes('arrow-through-card'));
assert.ok(codes(analyze(geometry)).includes('crossing-arrows'));
// Cross-column connections are clean only to the immediately following row.
// Test isolated edges so unrelated intersections cannot mask this rule.
for (const [slot, row, expected] of [[1, 2, false], [1, 3, false], [1, 4, false], [2, 2, false], [3, 2, false], [4, 2, false], [5, 2, false], [2, 3, true], [2, 4, true], [3, 3, true]]) {
  const edge = make(`first = { slot = 1 parent = { position = 1 } } second = { slot = ${slot} child = { position = ${row} required_missions = { parent } } }`);
  assert.equal(codes(analyze(edge)).includes('long-diagonal'), expected, `A1 -> slot ${slot}, row ${row}`);
}
const mirrored = make('first = { slot = 5 parent = { position = 1 } } second = { slot = 1 child = { position = 3 required_missions = { parent } } }');
assert.ok(codes(analyze(mirrored)).includes('long-diagonal'));
const alternatives = make(`
base = { slot = 1 root = { position = 1 } }
left = { slot = 1 potential = { has_country_flag = left NOT = { has_country_flag = right } } l = { position = 2 required_missions = { root } } }
right = { slot = 1 potential = { has_country_flag = right NOT = { has_country_flag = left } } r = { position = 2 required_missions = { root } } }
`);
assert.equal(analyze(alternatives, { flags: ['left'] }).missions.length, 2);
assert.equal(codes(analyze(alternatives, { flags: ['left'] })).includes('overlap'), false);
assert.ok(codes(analyze(alternatives, { flags: ['left'] }, ['base', 'left', 'right'])).includes('overlap'));
const hidden = make('a = { slot = 1 potential = { has_country_flag = hidden } parent = { position = 1 } } b = { slot = 2 child = { position = 2 required_missions = { parent } } }');
assert.ok(codes(analyze(hidden, { flags: [] })).includes('hidden-prerequisite'));
const unknown = parse('potential = { tag = BRI has_dlc = Emperor }')[0].value;
assert.equal(potential(unknown, { tag: 'BRI' }), null);
assert.equal(potential(unknown, { tag: 'FRA' }), false);
assert.equal(potential(parse('p = { OR = { tag = BRI has_dlc = Emperor } }')[0].value, { tag: 'BRI' }), true);
const implicit = extract('@row = 4 series = { slot = 1 first = {} second = { position = @row } third = {} }', 'implicit.txt').series[0].missions;
assert.deepEqual(implicit.map(mission => mission.row), [1, 4, 5]);
const duplicate = make('one = { slot = 1 same = { position = 1 } } two = { slot = 2 same = { position = 1 } }');
assert.ok(codes(analyze(duplicate)).includes('duplicate-id'));
assert.ok(codes(analyze(make('same = { slot = 1 a = {} } same = { slot = 2 b = {} }'))).includes('duplicate-series'));
const external = make('one = { slot = 1 child = { required_missions = { vanilla } } }'); external.externalMissions = ['vanilla'];
assert.ok(codes(analyze(external)).includes('external-prerequisite'));
const result = generate('brittany_missions');
assert.equal(result.missions, 42);
assert.deepEqual(result.reports.slice(0, 3).map(report => report.missions.length), [36, 39, 39]);
assert.ok(result.reports.slice(0, 3).every(report => !codes(report).includes('overlap')));
assert.ok(codes(result.reports[3]).includes('conflicting-state'));
const html = fs.readFileSync(path.join(result.output, 'index.html'), 'utf8');
assert.ok(!html.includes('/*__'));
const script = html.match(/<script>([\s\S]*)<\/script>/)[1];
new vm.Script(script); // Validate the generated standalone script syntax.
console.log('PASS: malformed syntax, overlap, cycles, blocked chains, layout geometry, branch visibility, unknown predicates, implicit positions, duplicate IDs, vanilla references, Brittany scenarios and generated script syntax.');
