# Brittany behavioral regression suite

Four production behavior contracts passed before and after the extraction of two
conditional rewards on 2026-10-03. The required suite is `preview-gate`,
`shipbuilding-reward`, `borders-reward`, and `textiles-upgrade`. It supplies
LOGIC/EFFECT plus static WIRING evidence. Normal mission completion/reward dispatch
remains explicitly unverified; every effect fixture asserts its mission stays
incomplete. No `complete_mission` workaround is used by the suite.

```powershell
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Test borders-reward
# Existing diagnostics remain available outside the required suite:
./tools/run-eu4-test.ps1 -Test run-effects -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Test nantes-market -TimeoutSeconds 150
# Bounded, isolated faults; expected overall FAIL, exit 1:
./tools/run-eu4-test.ps1 -Test all -NegativeControl -TimeoutSeconds 150
node --test tools/runtime-tests/*.test.mjs
```

If PowerShell policy blocks execution, prefix the command with
`powershell.exe -NoProfile -ExecutionPolicy Bypass -File`. Node's bundled fallback
is handled by the runner. Steam and desktop graphics access are required.

## Behavior, state and production code

All native assertions execute on 1444.11.11 in independent Brittany with ownership
of provinces 169, 170 and 4384 and all 18 required DLC verified. The actual normal
launcher JSON enabled only `mod/brittany_missions_dev.mod`, disabled DLC empty;
the isolated profile enabled only `mod/runtime_test.mod`. `all` builds one startup
hook and runs three plain files sequentially through native `-auto_run`. Startup
does not load these files itself. Each case has its own nonce and ordered markers.

| Test | Established before-state | Actual production code | Asserted after-state and meaning |
| --- | --- | --- | --- |
| `preview-gate` | No selector flags, then French preview, autonomous preview, then locked state | `common/scripted_triggers/BRI_mission_triggers.txt`: `bri_diplomacy_preview_trigger` | true/false/false/true; final flags match locked fixture. Tests the real predicate, not selector event actions |
| `shipbuilding-reward` | Brest/170 has no shipyard or grand shipyard; reward modifier removed; baseline exported cost/repair captured. Second branch installs grand shipyard and captures its repair baseline | `common/scripted_effects/BRI_mission_effects.txt`: `bri_shipbuilding_reward_effect` | Missing shipyard granted; cost delta -0.100; repair delta +0.450 (building +0.250 and reward +0.200). Removing reward returns cost to baseline and leaves +0.250 repair. Grand shipyard preserved, reward adds +0.200 repair. Proves branch and modifier-derived changes |
| `borders-reward` | Reward modifier removed; France alliance broken; DIP in [0,800), baseline DIP/reputation captured. Second branch creates France alliance and captures DIP again | `BRI_mission_effects.txt`: `bri_secure_borders_reward_effect` | Unallied DIP delta +50, reputation delta +1; modifier removal returns reputation to baseline. Allied DIP delta 0 and reputation delta +1. Baselines are captured values, not a falsely claimed fixed starting DIP total |
| `textiles-upgrade` | Province 169 has no production building, 4384 workshop; both base production exactly 4 | Installed `common/scripted_effects/00_scripted_effects.txt`: `add_or_upgrade_production_building` | First call: workshop/counting house, production 4/4. Second: counting house/counting house, 4/6. Third on 169: 6/6. Tests all three helper branches. Production mission requires buildings; empty-building fixture tests the shared helper beyond that mission's ready state |

Values use half-open intervals `[expected, expected + 0.001)`, matching observed
EU4 precision. Expected deltas are fixed in fixtures independently of reward
definitions. A 49-DIP mutation cannot pass a 50-DIP assertion. Named modifier
presence queries are not used to decide these reward contracts.

Static wiring additionally checks six diplomatic missions reference the preview
trigger, each extracted mission makes its sole expected reward call, and textiles
references the real helper in both expected province scopes plus its Nantes parent.
This does not evaluate complete mission readiness or ordinary dispatch.

## Refactor and validation

`bri_breton_shipbuilding` and `bri_secure_the_borders` formerly held conditional
inline rewards. They now call named country-scope effects, giving the building
branch and the modifier/tooltip/alliance branch clear shared ownership and direct
testability. No trivial Nantes reward was extracted; textiles already calls a
production helper. Modifier definitions, tooltip IDs, durations and localisation
are unchanged.

Before editing production, exact parsed inline blocks were placed in staged
comparison adapters. Those adapters were solely refactor baselines, not copies
of existing named effects and not production mission dispatch tests. After
extraction, fixtures call the real definitions copied byte for byte from production.

[Extraction evidence](evidence/extraction.json) compares the complete ordered
mission AST after expanding both calls; it is identical to the original. Original
UTF-8 without BOM and LF newlines are preserved. [Original source](evidence/before/Custom_Breton_Missions.txt)
and [extracted source](evidence/after/Custom_Breton_Missions.txt) are retained.
The same state assertions passed before and after. Baseline diagnostic markers
were subsequently removed; they had no gameplay effects or acceptance role.

| Run | Production CWTools | Staged CWTools | Native result |
| --- | --- | --- | --- |
| [Inline baseline](evidence/baseline/result.json) | 0 errors, 58 warnings, 10 files | 0 errors, 64 warnings, 13 files | 4 PASS |
| [Production after extraction](evidence/after/result.json) | 0 errors, 58 warnings, 11 files | 0 errors, 62 warnings, 13 files | 4 PASS; 92.92 s total, 41.25 s native including cleanup |
| [Staged negative controls](evidence/negative-control/result.json) | 0 errors, 58 warnings | 0 errors, 62 warnings | Preview, shipbuilding, borders FAIL; textiles PASS; exit 1 |
| [Final clean suite](evidence/final/result.json) | 0 errors, 58 warnings | 0 errors, 62 warnings | 4 PASS; exit 0; 92.40 s total, 41.16 s native including cleanup |

Warnings are retained findings, not an export-readiness claim. Full suite time
includes both CWTools validations, native load/assertions, normal window close and
log collection. No manual console command, keyboard automation or gameplay action
was required for these successful runs.

## Failure detection and earlier experiments

The staged negative-control run changed only copied production code: preview gate
to always true, shipyard grant to dock, and DIP reward 50 to 49. Static validation
accepted them, while the native assertions caught all three. Textiles remained
passing, showing failures are specific to changed contracts. Production was never
faulted. This is evidence the loop catches behavior errors beyond syntax checking.

The initial [assertion draft](evidence/assertion-draft/result.json) passed preview
and textiles, but its reward assertions failed. Intervals only 0.0002 wide were
too narrow; after changing to 0.001-wide intervals, the expected original values
passed. This was a harness failure, not an established production defect.
The original attempt to reset DIP with a very large negative amount was also
discarded; the accepted fixture captures a safe starting value and checks fixed
deltas, avoiding unsupported clamping assumptions.

The subsequent [crash attempt](evidence/crash/result.json) exited before any
assertions. [Exception report](evidence/crash/exception.txt) records
`C00000FD (EXCEPTION_STACK_OVERFLOW)`. The user manually dismissed the crash
reporter. Dynamic `Root/This.variable.GetValue` log expressions had just been added;
they are a suspect, not a confirmed cause. Replacing them with constant markers
allowed the [next diagnostic](evidence/constant-diagnostic/result.json) to finish
normally, and later accepted probes also closed normally. Dynamic log expressions
will not be reintroduced to the suite. The crash supplies no behavior PASS/FAIL;
the runner now records native crash artifacts and forces INCOMPLETE/nonzero status.

Portable evidence retains results, real native logs, executed plain files, command
batches, hooks, production/adaptor snapshots and CWTools reports. Result manifests
record staged/native file hashes, running version, nonce, exact ordered checks and
cleanup. Absolute paths identify original local attempts; adjacent copies provide
portable evidence. Existing collector outcomes remain operator-labelled; native
assertion evaluation determines behavioral status. Unit checks replay real positive,
negative and crash transcripts and reject stale, missing or reordered evidence;
they are not extra game runs. All 17 evaluator/wiring/evidence checks passed after
the final clean run.

## Playtest list

All items below remain open. Use the [default environment](../environment.md), a
fresh non-Ironman Brittany game with the development deployment, and separate
before/after saves. Never use `complete_mission` for the reward-bearing action.

1. **Ordinary reward dispatch/readiness and tooltips** — source
   `mod/brittany_missions/missions/Custom_Breton_Missions.txt` and
   `common/scripted_effects/BRI_mission_effects.txt`. For Shipbuilding own Brest,
   have a dock and one infrastructure expansion (Leviathan enabled); click the
   actual ready mission. Expect shipyard only if missing and Brest modifier with
   -10% local ship cost/+20% repair, plus annual naval tradition. For Borders commit
   to the autonomous branch, complete Question of France, have two allies and one
   with 1.5 times Brittany's army strength; test separate saves with/without France
   alliance, record DIP before clicking, expect +50/+0 plus +1 reputation and
   annual legitimacy. Tooltip bonus text should still render. Failure: ready button
   missing, incorrect bonus display, no reward or duplicated reward.
2. **Textiles normal readiness/parent** — same mission source and installed helper.
   Complete Nantes through its real button, own 169/4384 with production buildings,
   then click Textiles. Expect both provinces to upgrade or gain +2 base production
   according to their starting buildings. No-building helper coverage does not
   establish mission readiness. Failure: parent stays unavailable or actual reward
   differs from the helper contract.
3. **Persistence and duration** — the two extracted effects and
   `common/event_modifiers/BRI_mission_modifiers.txt`. Save/reload after actual reward
   completion; expect buildings, development, completion and modifier consequences
   to persist. Brest modifier is permanent; Borders should expire after 7300 days.
   Compare paused saves immediately before/after the expiry date. Failure: loss on
   reload, premature/permanent Borders bonus or removed permanent Brest bonus.
4. **Selector/tree refresh** — `events/Custom_Breton_Events.txt`, mission tree and
   `common/scripted_triggers/BRI_mission_triggers.txt`; follow
   [selector scenario](../brittany-diplomatic-selector.md). Check both preview
   branches before commitment, locked branch after selection, refresh/prerequisite
   availability and save/load visibility. Failure: visible blocked branch remains
   selectable, chosen branch unavailable, or flags/tree differ after reload.
5. **Named modifier query reliability** — reproduce the isolated `run-effects`
   apply/remove calibration. Compare UI modifier display and exported numerical
   values with `has_province_modifier`. Positive values alongside a false query
   keep the query unresolved; do not reinterpret a reward as absent on that query
   alone. Country/province presence reliability is not generalized from this suite.

The suite is suitable for normal targeted regression work on the covered behaviors,
with full-suite runs for shared changes. It has demonstrated clean before/after
passes and valid-script fault detection. It remains a bounded native-game test,
with Steam/graphics startup and possible crash-reporter interaction as infrastructure
boundaries; failures must stay visible rather than being retried into a claimed PASS.
See the [coverage manifest](../runtime-coverage.md) before interpreting its scope.
