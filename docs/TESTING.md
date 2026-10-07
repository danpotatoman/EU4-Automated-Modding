# Framework validation and testing

Owner: repository/framework testing
Last updated: 2026-10-06

This document defines current interfaces, evidence semantics and test selection.
[Framework status](STATUS.md) owns actual tool capability results; each
[mod](mods/README.md) owns gameplay coverage and open playtests. No CLI or tool
behavior changed in Phase 1.

## Static development loop

Use the source-folder ID with existing static interfaces:

```powershell
./tools/validate-cwtools.ps1 -Mod brittany_missions
./tools/inspect-missions.ps1 -Mod brittany_missions
./tools/check-project.ps1 -Mod brittany_missions
./tools/validate-cwtools.ps1 -Mod american_century
./tools/inspect-missions.ps1 -Mod american_century
./tools/check-project.ps1 -Mod american_century
```

These wrappers otherwise default to Brittany. CWTools -Project supports an
arbitrary/staged directory with optional -SourceMod/-ReportKey/-ArtifactKind/
-ProjectIdentity. Basename remains the default storage key; canonical path,
build hash and both invocation start/completion times establish applicability.
Saved files are validated. Cached vanilla/rules remain shared; source/staged
results are distinct. See [schema and legacy rules](runtime/evidence-identity.md).

| Tool | Interface/result semantics | Scope |
| --- | --- | --- |
| [CWTools](../tools/cwtools/README.md) | Exit 0 complete/no errors, 1 complete/errors, 2 failed/timed out; warnings do not fail; reports start running | Reports/cache/rules ignored; static syntax/scope/reference/localisation only |
| [Inspector](../tools/mission-inspector/README.md) | Exit 0 no structural errors in normal scenarios, 1 structural errors, 2 failed; diagnostic invalid-state scenarios do not fail | Narrow potential evaluation, schematic geometry; no actual tree swaps/merged generic missions/DLC artwork |
| [Combined check](../tools/checks/README.md) | Exit 0 passed, 1 completed/errors, 2 incomplete/stale; incomplete takes precedence | Last completed comparison baseline; incomplete missing findings deferred; deployment preparation makes no writes |
| [Deployment](../tools/deployment/README.md) | Failed validation blocks; diagnostic allowed errors/skipped validation remain labelled | Byte-preserving copy/generated descriptors and strict destination ownership; not playset or release proof |
| [Collector](../tools/test-runs/README.md) | Exit 0 collection completed even for operator gameplay FAIL; error exits 2 | Operator outcome, byte-preserving logs/deltas and explicitly selected baseline; clean logs do not prove loading/gameplay |

## Automated tool checks

```shell
node tools/test-offline.mjs
node --test tools/runtime-tests/windows-adapter.test.mjs
```

The offline aggregate currently discovers shared lifecycle/config/publication tests
**and mod-specific adapters/source-backed geometry/evidence replays**, then four
tool self-tests. The dated 2026-10-05 count is 53 Node tests offline plus four tool
self-tests, with two real Windows process-adapter tests separate (55 Node total).
Phase 2A adds 13 registry/shared-helper tests (66). Phase 2B adds nine identity/
collector tests and three saved-environment parser regressions (78). Phase 2C adds
11 metadata/parity/descriptor/isolation tests: current offline count is **89 plus
four tool self-tests**, with two Windows process-adapter tests separate. Two of
the 89 tests need Windows PowerShell; they explicitly skip on platforms without it.
Current Windows acceptance has no skips. [Phase 2B acceptance](runtime/phase2b-evidence-identity-2026-10-06.md)
retains native evidence; [Phase 2C acceptance](runtime/phase2c-configuration-ownership-2026-10-06.md)
records configuration/QA checks and the justified native scope.
CI runs offline tests, link/publication checks and whitespace, not EU4 or installed
CWTools. Tests/replays do not create new native mod verification.

Other interfaces: `node tools/cwtools/self-test.mjs` (installed server/rules),
`./tools/deployment/self-test.ps1`, `./tools/test-runs/self-test.ps1`,
`./tools/mission-inspector/self-test.ps1`, `./tools/checks/self-test.ps1`,
`./tools/vanilla-reference/self-test.ps1`, optional Chromium
`node tools/mission-inspector/browser-test.mjs`. Source-backed Brittany tests are
workloads, not generic gameplay coverage. Inspector self-test output uses a separate
fixture namespace to preserve provenance. Browser QA regenerates fresh isolated
fixture input under `test-work/browser-<id>/`; it never consumes production latest.
Both preserve ordinary report baselines. Do not run them
as a documentation check or mistake their output for fresh native evidence.

Deployment self-test additionally covers exact launcher final-LF restoration,
non-mutating repair preview, unchanged ownership state, manual launcher/content and
extra-file refusal, conflicting owner/schema/canonical hash refusal, normal strict
deployment afterward and unrelated sentinel preservation. This separate PowerShell
integration test is not one of the four offline aggregate self-test programs.
The [October 7 handoff](runtime/brittany-deployment-repair-2026-10-07.md#playtest-list)
records reproducible deployment scenarios and unchanged native coverage.

## Native test ownership and current commands

Prefer explicit native `-Mod <source-id>`. `-ListTests` (with optional -Mod filter)
lists ownership, modes, members and coverage without reading game configuration,
creating profiles/reports or launching EU4. Unsupported selections fail before
preparation. No repository-wide native all command exists.

| Selection | Source owner / layers | Current command |
| --- | --- | --- |
| all | Brittany: preview-gate, shipbuilding-reward, borders-reward, textiles-upgrade; LOGIC/EFFECT/WIRING, no ordinary dispatch | `./tools/run-eu4-test.ps1 -Mod brittany_missions -Test all -TimeoutSeconds 150` |
| Named member of all | Brittany targeted predicate/effect regression | `./tools/run-eu4-test.ps1 -Mod brittany_missions -Test shipbuilding-reward` (or other named member) |
| nantes-claim click/refusal | Brittany supervised actual-input/native-save contract | See [Brittany runbook](mods/brittany_missions/testing/README.md) |
| nantes-market / run-effects | Brittany completion diagnostic / BRI engine-calibration workload, outside all | `./tools/run-eu4-test.ps1 -Mod brittany_missions -Test run-effects -TimeoutSeconds 150` |
| usa-slice click/refusal | American Century supervised formation/four real claims/native-save fixture, outside all; reload is separate scenario evidence | See [USA runbook](mods/american_century/testing/README.md) |
| usa-local-union click | American Century: real Liberty/Compact/Local option/Union, six paused checkpoints and ordinary reload, same USA adapter/lifecycle | `./tools/run-eu4-test.ps1 -Mod american_century -Test usa-local-union -ClaimMode click -TimeoutSeconds 1800 -ProgressTimeoutSeconds 1800 -Retries 0` |

Legacy commands without -Mod retain usa-slice -> American Century and every other
test/default -> Brittany routing, with a scoped notice. The first positional
PowerShell argument remains Test. Defaults, exit codes and protocol IDs are intact.
Explicit USA all and USA diagnostic modes other than click/negative are rejected.
The added usa-local-union contract requires explicit -Mod american_century and
supports click only; legacy omitted-Mod routing remains unchanged. Its current
[native scope/report](testing/mods/american_century/local-guarantees-2026-10-07/README.md)
does not advance the natural colonial campaign or certify elapsed yearly accrual.
Only Nantes supports mission/scripted/tree diagnostics and experimental shortcut;
non-UI contracts accept the default click mode only. Diagnostic modes never earn
faithful mission PASS. `-ListTests` accepts only its optional Mod filter.

Default native test is Brittany preview-gate. InlineBaseline, NegativeControl and
freeze exercise are limited to Brittany all; retained negative control expects
exit 1 with three FAILs and textiles PASS. Preparation-only exit 0 is static
preparation, never native PASS. Framework recovery exercises use the Brittany
workload and verify lifecycle recovery, not whole-mod gameplay.

Covered production changes need the owning named contract plus CWTools. Shared
runner changes need the offline tests and Brittany all, and affected Nantes/USA
input/save contracts when their interfaces change. A Brittany PASS cannot replace
an affected USA contract; missing native checks remain pending/INCOMPLETE.

## Native environment, lifecycle and verdicts

Use [setup](SETUP.md), [shared environment preference](testing/environment.md),
[runtime knowledge](runtime/README.md) and [runner implementation guide](../tools/runtime-tests/README.md).
Recorded target: EU4 1.37.5.0 Inca (491d). Confirm installed/running version and
actual mod/DLC activation for every new result; desired 18 DLC is not activation
evidence and later USA saves show 21. Native execution needs Steam, Windows,
graphics and interactive desktop; it is not headless. Historical faithful UI
tests require an active supported Codex driver, known geometry and owned-window
inspection. Bare PowerShell alone does not provide that input driver.

Brittany preflight requires ordinary launcher only brittany_missions_dev.mod/no
disabled DLC; USA reads ordinary launcher config but does not apply that same
mod gate. The runner stages isolated source, hooks/descriptors/profile, validates
source and stage, uses owned process identity/global lock and refuses unrelated
EU4. Settings/vanilla/production remain read only. Default total native limit 120s,
progress 30s, one retry; configured bounds are documented in runner README.
Assertion/integrity/config errors and failed cleanup stop; infrastructure failures
can retry only after verified owned cleanup in a fresh profile.

PASS/0 means the specified native contract; FAIL/1 means assertions/wiring fail;
PARTIAL/2 diagnoses state without faithful reward dispatch; INCOMPLETE/2 means
timeout/crash/infrastructure/missing evidence. The runner additionally checks
ordered unique nonce/date/version markers, staged/console hashes and relevant
errors. Successful cleanup does not certify gameplay, and a retry's PASS does not
rewrite an earlier attempt. Source-backed offline replays preserve those verdicts.

## Manual runtime workflow and logs

Use existing deployment/collector -Mod explicitly for the source owner. Close EU4
before deployment, understand destination ownership, select/confirm launcher
activation yourself, then begin collection before gameplay and finish after exit:

```powershell
./tools/deploy-mod.ps1 -Mod brittany_missions
./tools/test-run.ps1 -Mod brittany_missions -Action begin -Scenario 'Exact documented behavior'
./tools/test-run.ps1 -Mod brittany_missions -Action finish -Outcome unverified -Notes 'Actual observations and limits'
```

Substitute american_century for a USA production/deployment scenario. The collector
namespace also represents runtime pseudo-mods, so a mod field alone is not verified
source identity. Save hashes, source/staged/deployment identity, actual environment,
scenario/actions and outcome provenance are necessary. Comparable no-mod baselines
use explicit Untracked/baseline selection; the collector does not verify vanilla
activation or infer behavior from logs. Preserve FAIL/INCOMPLETE and descriptor
mismatches, not just successful summaries.

## Playtest list and evidence ownership

Gameplay playtests with affected files, initial conditions, steps, expected behavior
and failure signs belong to [Brittany](mods/brittany_missions/testing/README.md#playtest-list)
or [American Century](mods/american_century/testing/README.md#playtest-list).
Framework recovery/calibration scenarios remain indexed in
[historical evidence](testing/README.md), with workload owners explicitly separated.
[Phase 2A handoff](runtime/phase2a-ownership-2026-10-06.md) records fresh ownership
refactor checks separately from retained mod gameplay evidence and pending playtests.

Raw profiles/saves/logs/screenshots stay ignored; public excerpts are reviewed
copies with separate provenance. Keep historical bundles/paths/bytes intact under
[hygiene](REPOSITORY_HYGIENE.md). Documentation changes require links, publication
audit, whitespace/scope review and protected-byte checks; CWTools/native/tool
self-tests are unnecessary when game/tool content is unchanged.

Configuration tests verify shared environment/local/default precedence, scoped
legacy display name and generic version overrides, Node/PowerShell effective
metadata/descriptor parity, unknown/future metadata, independent inspector owners
and fixture output isolation. [Configuration ownership](runtime/configuration-ownership.md)
defines sources. Development descriptor changes do not change native fixture
descriptors; inspect the actual preparation/activation diff before choosing native
regressions, and never label descriptor/preparation parity as a fresh native PASS.

## Historical section compatibility

Former root gameplay sections now route to the owner runbooks above. Their old
anchors remain for dated links; they are not independent current-state owners.

<a id="validation-and-testing"></a>
<a id="static-development-loop"></a>
<a id="combined-cwtools-layout-file-checks-and-deployment-preparation"></a>
<a id="automated-tool-checks"></a>
<a id="manual-runtime-workflow-and-logs"></a>
<a id="user-runs-the-documented-gameplay-scenario-then-closes-eu4"></a>
<a id="isolated-native-runner"></a>
<a id="diagnostics-outside-all"></a>
<a id="calibration-and-unresolved-limitations"></a>
<a id="playtest-list"></a>
<a id="american-century"></a>
