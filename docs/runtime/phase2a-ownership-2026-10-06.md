# Phase 2A runtime contract ownership handoff

Owner: repository/framework; workloads brittany_missions and american_century
Date: 2026-10-06
Execution: complete for Phase 2A; Phase 2B/2C unauthorized

The [governing plan](../../.agent/plans/2026-10-06-project-state-ownership.md)
authorizes runtime ownership and selection only. Production gameplay, collector
identity, operational storage, configuration/deployment and lifecycle semantics
are unchanged. The dated Phase 1 provenance manifest is preserved.

## Exact implementation inventory

Paths below are relative to `tools/runtime-tests/` unless stated otherwise.

| Operation | Exact paths |
| --- | --- |
| Create shared registry | `contracts.mjs` |
| Create owner entry points | `contracts/brittany_missions/index.mjs`, `contracts/american_century/index.mjs` |
| Move canonical Brittany modules; leave old export wrappers | `behaviors.mjs`, `wiring.mjs`, `refactor-compare.mjs`, `evaluate.mjs`, `mission-claim.mjs`, `claim-save.mjs` -> same basenames under `contracts/brittany_missions/` |
| Move canonical USA module; leave old export wrapper | `usa-slice.mjs` -> `contracts/american_century/usa-slice.mjs` |
| Move Brittany commands; leave guarded executable/import wrappers | `prepare-nantes-manual.mjs`, `retain-claim.mjs` -> same basenames under `contracts/brittany_missions/` |
| Move byte-identical Brittany fixtures, no old duplicate | `preview-gate.on_actions.txt`, `behavior-fixture.on_actions.txt`, `nantes-market.on_actions.txt`, `run-effects.on_actions.txt`, `run-effects.run.txt`, `run-effects.after.txt`, `shipbuilding-reward.run.txt`, `borders-reward.run.txt`, `textiles-upgrade.run.txt` -> same basenames under `contracts/brittany_missions/` |
| Create shared helpers | `script-ast.mjs`, `mission-geometry.mjs`, `save-blocks.mjs`, `protocol.mjs` |
| Edit shared entry points | `run.mjs`, `../run-eu4-test.ps1` |
| Create top-level tests | `contracts.test.mjs`, `shared-helpers.test.mjs` |
| Update existing top-level tests | `usa-slice.test.mjs`, `evaluate.test.mjs`, `wiring.test.mjs`, `regression-evidence.test.mjs`, `claim-evidence.test.mjs`, `mission-claim.test.mjs`, `recovery-evidence.test.mjs`: canonical imports/owner labels, unchanged replay assertions; registry tests separately verify wrappers |
| Label offline aggregate | `../test-offline.mjs` prints mixed framework/shared/Brittany/USA scope; discovery/CI behavior retained |

`script-ast` extracts canonical/unique AST lookup; geometry requires an explicit
mission ID; save-blocks retains balanced plaintext block lookup; protocol compares
ordered nonce/date/version markers. USA imports geometry/save lookup directly,
removing dependencies through Nantes `mission-claim`/`claim-save`. Shared helpers
import no adapter. Protocol differences remain caller options, not new verdicts.
The old geometry wrapper retains its Brittany default for import compatibility.

The registry maps source owners to adapters. Each adapter defines test ID, required
regression/suite membership, allowed modes/options, start/staging conditions,
expected protocol, applicable error IDs, evaluator, native oracle and coverage.
The shared runner delegates staging and evaluation. The combined historical error
guard is retained, including both owners' production/fixture IDs; no filter is
narrowed. USA's existing CWTools/layout wiring record is preserved; it does not
establish named reward-call wiring acceptance.

## Supported matrix and CLI

| Source owner / test | Allowed ClaimMode | Coverage |
| --- | --- | --- |
| brittany_missions / all | click (default placeholder) | Exactly preview-gate, shipbuilding-reward, borders-reward, textiles-upgrade; LOGIC/EFFECT/WIRING |
| brittany_missions / each of those four members | click | Targeted predicate/effect/wiring, no ordinary mission dispatch |
| brittany_missions / nantes-market | click | Completion diagnostic; complete transcript remains PARTIAL |
| brittany_missions / run-effects | click | BRI engine-effect calibration, no production claim |
| brittany_missions / nantes-claim | click, negative | Bounded real Nantes input/save claim or unready refusal |
| brittany_missions / nantes-claim | mission, scripted, tree, shortcut | First three state-only/PARTIAL diagnostics; shortcut experimental/unverified, cannot earn click mission PASS |
| american_century / usa-slice | click, negative | Bounded real vanilla formation/four production claims/native saves or unready refusal |

All contracts permit PrepareOnly and existing terminate/crash exercises. Only
normal Brittany all permits freeze; InlineBaseline/NegativeControl require all
and cannot combine. Recovery exercises are mutually exclusive. Existing timeout
defaults/bounds, retries, exit codes and protocol IDs are retained. Non-UI tests
reject nondefault modes formerly ignored by the runner. New explicit selections
reject mismatched owner/test pairs before config/profile/report/process work.

```powershell
./tools/run-eu4-test.ps1 -ListTests
./tools/run-eu4-test.ps1 -Mod american_century -ListTests
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test all -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test all -NegativeControl -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode negative -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode click -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode negative -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
```

Listing accepts only the optional Mod filter and mutates no profiles/reports.
Legacy no-Mod usa-slice routes to American Century; all/default/other existing IDs
route to Brittany with a compatibility notice. Test remains the first positional
PowerShell argument. Root import/manual command wrappers execute at most once;
top-level test entries remain the only discovery locations.

Native registry layers cover setup/input/save acceptance. Retained USA reload
comparisons are separate scenario evidence; the live usa-slice evaluator does not
automatically require an ordinary reload. No new persistence guarantee is inferred.

The runner prints resolved source owner/member IDs and records only
`selection: {owner, members}`. Existing storage aliases, collector semantics,
flat work root, report fields/oracle scopes, one global lock and identity-owned
cleanup remain intact. There is no new report schema version or generalized
source/storage/artifact metadata. Listing is never a native verdict.

## Validation and protected state

| Check | Result |
| --- | --- |
| `node tools/test-offline.mjs` | PASS: 66 Node tests plus all four tool self-tests. Includes unchanged historical verdict replays. |
| Final registry/PowerShell compatibility check | PASS: nine tests after the final empty-owner guard and legacy geometry-default assertions. |
| `node --test tools/runtime-tests/windows-adapter.test.mjs` | PASS: 2/2 with normal CIM access. Initial restricted-sandbox run failed with Get-CimInstance access denied; retained, not rewritten. |
| Source/staged CWTools, all six native runs | Complete/0 errors: Brittany source 11 files/58 warnings; all/control stage 13/62, Nantes stage 13/58. USA source 8/0 and stage 12/0. |
| Publication/local links/whitespace | PASS; final counts recorded in the governing plan. Scanner limits and ownership review remain applicable. |
| Protected-state comparison | PASS: all 905 captured files unchanged, including production, historical docs/testing evidence and Phase 1 manifest, tool config/deployment/collector code/state, lifecycle/input code, ordinary settings/launcher/database and selected installed references. |
| Moved fixture comparison | PASS: all nine canonical fixture files byte-identical to their original paths; no duplicate old fixtures. |

Whitespace review checks new authored files against an empty file and fixtures
against their captured originals. Three moved run-effect fixtures retain preexisting
blank lines at EOF; the initial empty-file check flagged them. Pure-move comparisons
pass without rewriting their bytes. A trailing blank line in the new geometry
helper was removed. Tracked diff checking passes; no production/evidence formatting
is normalized.

The first new shared-AST test expected a scalar definition, although existing unique
lookup selects array definitions. That new test was corrected to check nested
blocks and explicitly reject scalars; its initial 65/66 result remains local.
No original replay/assertion was weakened. Initial screenshot capture failed with
"foreground window did not report a process id"; fresh returned-window selection
recovered and the supported driver completed all four UI runs.

All native runs below used EU4 **1.37.5.0 Inca (491d)**, one existing shared
lifecycle lock/work root and byte-preserved production. Each completed in one
attempt, with cleanup clean, zero relevant script errors, zero staged/native-file
integrity changes and no retry. all/control are separate from real mission dispatch.

| Owner / contract | Native result / save scope | Local run ID under `tools/runtime-tests/work/` |
| --- | --- | --- |
| Brittany / all | PASS/0, exactly four required members; missionCompletionPass=false | `20261006T215854453Z_51fcd49ff94eae53` |
| Brittany / all staged negative control | FAIL/1 retained: preview, shipbuilding, borders FAIL; textiles PASS, expected pattern | `20261006T220339545Z_b62136bde7cfa9fd` |
| Brittany / nantes-claim click | PASS/0; one real derived input, completion and both permanent cloth rewards, Textiles immediately ready; 13 save checks | `20261006T220551214Z_8d6fc2d6436882d8` |
| Brittany / nantes-claim negative | PASS/0 refusal, no entry input/completion/rewards; 13 save checks, missionCompletionPass=false | `20261006T221021442Z_30b631affa5f34d6` |
| American Century / usa-slice click | PASS/0; real vanilla formation, four derived inputs, Enumerated Powers, exact duration/exclusivity/numerical rewards; 31 save checks | `20261006T221354331Z_7661ddf67c6eb896` |
| American Century / usa-slice negative | PASS/0; real formation, inspected missing marketplace, no entry input/completion/rewards; 8 save checks, missionCompletionPass=false | `20261006T222057184Z_0d9417f414bd4cff` |

All four UI saves independently identify only the isolated runtime mod and 21 DLC,
including the required 18 plus Art of War, Common Sense and Rights of Man; American
Dream is absent. This does not establish exactly-18-only/minimal-DLC compatibility.
The ordinary launcher remained Brittany-only/no disabled DLC; the USA adapter
retains its different ordinary-launcher preflight. Actual staging was checked
through native protocol and save provenance, not inferred from launcher preference.

No required Phase 2A native contract remains pending. No fresh ordinary reload,
expiry/natural campaign/alternate-choice check was added; those retained evidence
boundaries and open mod scenarios remain in the owner runbooks. Native crash/freeze
exercises were not repeated because lifecycle behavior/code is byte-preserved.

Raw attempts, initial failures, saves/screenshots/logs, protected hashes and local
summaries stay ignored in `.local/project-state-phase2a/` and existing runtime
work/collector namespaces. No operational evidence was relocated or historical
result rewritten. New public content is this reviewed narrative, not raw game files.

## Playtest list

Use [Brittany scenarios](../mods/brittany_missions/testing/README.md#playtest-list)
and [American Century scenarios](../mods/american_century/testing/README.md#playtest-list)
for affected production files, initial conditions, actions, expected behavior,
failure signs and retained evidence. Refactor acceptance uses fresh unchanged
production fixtures, EU4 1.37.5.0 Inca (491d), required 18 DLC, isolated profiles
and a supported owned-window driver for real-input contracts. A native all PASS
does not close Nantes/USA input checks, dispatch/expiry or natural campaign gaps.

## Remaining unauthorized work

Phase 2B: generalized report/source/storage/artifact identity, collector provenance,
CWTools report-key/freshness semantics, deployment-state schema and operational
evidence/retention migration. Phase 2C: per-mod tool metadata/readers, moving display
names/version configuration, inspector test-output isolation and related deployment
fixtures. These encompass proposal steps 3/5 and the output-isolation portion of
step 4. No lifecycle redesign, concurrent EU4, gameplay expansion, commit or push
is authorized. Stop after Phase 2A.
