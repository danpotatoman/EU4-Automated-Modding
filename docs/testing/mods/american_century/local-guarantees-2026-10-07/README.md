# Local Guarantees -> A More Perfect Union, 2026-10-07

Owner: mod/american_century
Verdict: bounded native contract PASS/exit 0; one attempt, clean owned cleanup.

Run `20261007T201607449Z_bf7181bbc16ae60e`, contract `usa-local-union`, used the
existing USA isolated fixture, runner, leased input driver, collector and save
parser. [Reviewed summary](summary.json) contains the 65 checks, six native state
summaries, real reward-input records, build/save hashes and retained verdicts.
[Provenance](provenance.json) separately hashes local originals and the public
summary. This is selected generated evidence, not a byte-identical raw-result copy.
Raw saves/logs/screenshots/ownership stay ignored; no game assets or vanilla source
were published. Codex reviewed paths, generated-state ownership and bounded size.

## What was established

Real unchanged vanilla formation from the overseas ENG fixture selected USA and
the five custom series. Real mission buttons claimed Liberty at Last, The Federal
Compact and A More Perfect Union once each; the real `amc.1.b` event option chose
Local Guarantees. No console completion/reward commands were used. No other AMC
mission was completed. Production gameplay/localisation files were unchanged and
matched their staged copies. The runtime descriptor was intentionally rewritten;
the source release descriptor is not natively verified.

All six saves are paused at 1444.11.11, same native campaign/player, EU4 1.37.5.0
Inca (installed launcher checksum 491d), one isolated `mod/runtime_test.mod` and
21 activated DLC. All required 18 plus Art of War, Common Sense and Rights of Man
were enabled; American Dream was absent. Exactly-18 compatibility is untested.

| Checkpoint | Native evidence |
| --- | --- |
| before | Monarchy, stability 2, reform pool 0 (omitted zero field), no AMC completion/reward |
| pending | Liberty/Compact completed, republic with `republic_mechanic`/`oligarchy_reform`, tradition 50, pending flag, neither option chosen; Liberty prestige +20/progress +100 |
| compact | Real Local Guarantees input: tradition 60, only `amc_local_guarantees_chosen`, one `amc_local_guarantees` with expiry `-1.1.1`; no pending/enumerated flag or modifier |
| ready | Only prerequisite setup: once-only +10 tradition -> 70; stability remains 2, Union still incomplete, production rewards unchanged |
| after | Real Union input: exact three completions; one `amc_durable_union`, expiry `-1.1.1`; no instant tradition/progress reward |
| reload | Ordinary UI load of after checkpoint, fresh observation decision and fresh native save; all 13 persistence comparisons pass |

Engine-exported totals distinguish the option reward from vanilla tradition effects:

| Total | pending (50 RT) | compact (60 RT) | ready (70 RT) | after/reload (70 RT) |
| --- | ---: | ---: | ---: | ---: |
| Accepted-culture capacity | 2 | 3 | 3 | 3 |
| National unrest | -3.5 | -4.7 | -4.9 | -4.9 |
| Yearly republican tradition | 1.01 | 1.01 | 1.01 | 1.31 |
| Reform progress growth | 0.90 | 1.00 | 1.10 | 1.20 |

Installed `common/static_modifiers/00_static_modifiers.txt` gives the tradition
contribution: +10 tradition changes unrest -0.2/growth +0.10. The independent
60 -> 70 setup corroborates it. Option unrest -1.2 minus that -0.2 isolates the
intended permanent **-1 national unrest**; culture capacity rises exactly **+1**.
At constant tradition 70, Union gives exactly **+0.3 yearly tradition/+0.10 growth**.
The reward dialog also displayed +0.30/+10.0% until the end of the game.

Union's checklist was red only for tradition at 60, then entirely green at 70.
The setup decision disappeared after use. Reload retains completion IDs, country
modifiers/expiry, government/reforms/flags, fresh numerical observations, capital
manpower/modifiers, DIP/prestige/stability/tradition/reform pool. Unrelated governing
capacity, state maintenance, development cost and settler totals remained unchanged
across choice/setup/Union. Harbor, Doors, army, navy and workshop rewards were absent.
This checks bounded unrelated state, not every field in a game save.

## Validation and retained failures

- USA combined preflight PASS: source CWTools 8 files, zero errors/warnings;
  inspector zero structural errors/two warnings; files/deployment preparation clean.
- Both USA native attempts: source/staged CWTools 8/12 files, zero errors/warnings.
- Serial offline aggregate: 90 tests and four self-test programs PASS. After oracle
  corrections, smallest affected USA/selection set: 15 tests PASS. Two Windows
  owned-process integration tests PASS with normal CIM access.
- Brittany `all`, `20261007T200129243Z_5ed7ea6bcad1bbc0`: four native contracts
  PASS/exit 0, one attempt, clean cleanup; source/staged zero errors, 58/62 warnings.
  This protects dependencies and provides no additional USA coverage.
- First Brittany run `20261007T193724265Z_a987c1e22ce27676`: INCOMPLETE/exit 2,
  Steam-not-running timeout, clean cleanup. Approval review rejected a retry while
  Steam was unauthenticated; the user manually signed in before the successful run.
- USA calibration `20261007T200421644Z_f5d4b7b380413e23`: INCOMPLETE/exit 2,
  deliberate driver abort after three saves/Local Guarantees, clean cleanup. It
  exposed native mission ordering, omitted zero progress and tradition contributions;
  no Union/reload in that attempt. Original verdicts/bytes remain untouched.
- Initial sandbox process tests failed CIM access. Initial offline run failed a
  report-stability assertion because it overlapped a source-validation report write;
  serial rerun passed. Local failed logs remain under `.local/`.

Collector `american_runtime/20261007T201657172Z_7efb3a` completed with outcome
`passed`. Local original acceptance:
`tools/runtime-tests/work/20261007T201607449Z_bf7181bbc16ae60e/result.json` and
`attempts/1/{before,pending,compact,ready,after,reload}.eu4`, `ui-actions.jsonl`,
`ui-finish.json`. The two incomplete results and Brittany PASS use their run IDs
under the same work root. The 36 protected hashes all match: 11 Brittany source,
9 USA source, 2 ordinary-profile configs and 14 installed references. This is a
selected-file comparison, not a whole-install/profile audit. No commit or push.

## Changed files

The six testing implementation files are `tools/run-eu4-test.ps1`,
`tools/runtime-tests/contracts/american_century/{index,usa-slice,usa-constitution}.mjs`,
`tools/runtime-tests/contracts.test.mjs` and `tools/runtime-tests/usa-slice.test.mjs`.
They add the named scenario, fixture observations, save oracle and regressions in
the existing USA adapter. No production mod file or shared runtime lifecycle changed.

Documentation changes are `.agent/plans/2026-10-04-american-century.md`,
`docs/{STATUS,TESTING}.md`, `docs/modding/american-colonial-missions.md`,
`docs/mods/american_century/{STATUS,DESIGN,ROADMAP}.md`,
`docs/mods/american_century/testing/{README,coverage}.md`,
`docs/testing/README.md` and `tools/runtime-tests/README.md`. This report directory
adds `README.md`, `summary.json` and `provenance.json`: 20 changed/new files total.
Final publication audit: 819 candidates, zero findings; link check: 812 links,
zero issues; Git whitespace check clean. Nothing was staged, committed or pushed.

## Playtest list and remaining limits

Reproduction: [current owner scenario](../../../../mods/american_century/testing/README.md#local-guarantees---a-more-perfect-union-bounded-contract)
and [input/save steps](../../../../../tools/runtime-tests/README.md#alternate-usa-constitution-and-union-contract).
Affected production files, starts, actions, expected rewards and failure signs are
listed there. This run resolves Local Guarantees/Union dispatch, threshold transition
and this paused reload. Keep open: elapsed yearly accrual, repeat-click refusal,
war/formation refusal, timed expiry, already-republic conversion bypass, arbitrary
save launch, AI/balance/other versions/DLC/layouts, natural ENG/CN campaign and release
readiness. The fixture is not a natural independence campaign. Union has no
implemented downstream child; none was added or certified. Keyboard input had no
visible effect in the calibration attempt; acceptance used inspected pointer input
and existing observation decisions, preserving each native save under a unique
owned-profile filename before the next UI save. No input infrastructure refactor.

The next logical bounded task under the existing gameplay plan is the same-campaign
Harbors/Doors -> Workshop Republic building/readiness/reward proof. This session
does not begin it, the natural campaign, or the 55-mission expansion.
