# Validation and testing

This describes the infrastructure currently present. Evidence of actual capabilities
and open behavior lives in [STATUS.md](STATUS.md) and the
[runtime coverage manifest](testing/runtime-coverage.md). A command being available
does not mean it ran successfully on the current source/environment.

## Static development loop

Game-independent checks: `node tools/test-offline.mjs`. This runs 53 Node tests and
four synthetic tool self-tests. Real Windows process-adapter tests are separate:
`node --test tools/runtime-tests/windows-adapter.test.mjs`. Full
`node --test tools/runtime-tests/*.test.mjs` still includes both adapter tests;
the shared runtime count remains 51, plus four config/publication tests outside it.
CWTools and native runs require [local setup](SETUP.md); CI runs only the offline
command, public link/audit checks and whitespace review.

Run from the repository root after relevant script/localisation changes:

```powershell
./tools/validate-cwtools.ps1
./tools/inspect-missions.ps1 -Open
# Combined CWTools, layout, file checks and deployment preparation:
./tools/check-project.ps1
```

All accept `-Mod other_mod` where documented. PowerShell wrappers find Node on
PATH or the existing Codex runtime fallback. If process policy blocks scripts,
use `powershell.exe -NoProfile -ExecutionPolicy Bypass -File <script> ...`;
no permanent execution-policy change is necessary.

- **CWTools:** [validator README](../tools/cwtools/README.md). Launches the installed
  extension's LSP server itself using `tools/cwtools/config.json` and local rules;
  checks all saved script/localisation files are loaded. Reports/cache under shared
  ignored tools. `latest.json`/`latest.txt`: exit 0 completed without errors,
  1 completed with errors, 2 failed/timed out; warnings do not fail. Running/failed
  reports are not passes. Missing rules: `./tools/cwtools/install-rules.ps1` with
  network access. Version changes invalidate cache; `-RebuildCache` forces rebuilding.
- **Mission inspector:** [README](../tools/mission-inspector/README.md). Checks grid,
  dependencies, scenario visibility, duplicate/missing English keys and schematic
  arrow risks. `latest.json`, text and offline viewer stay under shared reports.
  Exit 0 no structural errors in normal scenarios, 1 structural errors, 2 failed;
  diagnostic scenarios deliberately containing invalid state do not fail the command.
  Its supported visibility predicates are narrow; unknown ones remain visible with
  warnings. It does not model real saves, mission swapping, engine arrow routing,
  DLC archives or generic mission merging.
- **Combined check:** [README](../tools/checks/README.md). Adds byte/encoding and
  export-folder integrity checks, descriptor preparation in memory, build fingerprints,
  finding history and deployment evidence freshness. Exit 0 passed, 1 completed with
  errors, 2 incomplete (takes precedence). It neither deploys nor launches EU4.
  Comparisons use the last completed run; missing findings from incomplete tools are
  deferred, not resolved. Deployment preparation does not establish write permission.

For a documentation-only edit, review local links, contradictions and the changed
file scope; a fresh CWTools/native run is unnecessary unless game content changed.

## Automated tool checks

These are the existing entry points, not a claim that every check was rerun during
the bootstrap. Fixtures stay outside production mods, under ignored shared tools
or bounded temporary directories. Integration wrappers test the wrappers as well
as their Node core; CWTools integration also needs the installed server/rules.

| Check | Command |
| --- | --- |
| CWTools integration (valid, syntax, scope/reference faults) | `node tools/cwtools/self-test.mjs` |
| Deployment integrity/rollback | `./tools/deployment/self-test.ps1` |
| Collector identity/baselines/log capture | `./tools/test-runs/self-test.ps1` |
| Layout/scenario/structural checks | `./tools/mission-inspector/self-test.ps1` |
| Optional isolated headless-Chromium viewer check | `node tools/mission-inspector/browser-test.mjs` |
| Combined result/history/failure/concurrency checks | `./tools/checks/self-test.ps1` |
| Vanilla lookup/provenance | `./tools/vanilla-reference/self-test.ps1` |
| Native lifecycle, transcript evaluator, wiring and evidence regressions | `node --test tools/runtime-tests/*.test.mjs` |

The last row replays preserved real logs, rejects stale/missing/duplicate/wrong-date/
wrong-version or failed assertions, checks production wiring/ordered reward expansion
and tests specific faults. It does not launch EU4 or create new behavioral evidence.
If Node is absent from PATH, use the same local fallback executable selected by
the PowerShell wrappers (under the user's `.cache/codex-runtimes/`).

## Manual runtime workflow and logs

[environment.md](testing/environment.md) defines the default: documented 18 DLC,
only the tested mod, non-Ironman scenarios. Verify actual launcher/DLC activation
before testing. The user performs gameplay and requested reloads; the assistant
prepares fixtures/instructions and analyzes results. Preserve a pristine baseline,
separate checkpoints, actual running version, tested build, scenario and run ID.

```powershell
./tools/deploy-mod.ps1
./tools/test-run.ps1 -Action begin -Scenario 'Describe the exact behavior'
# User runs the documented gameplay scenario, then closes EU4.
./tools/test-run.ps1 -Action finish -Outcome passed -Notes 'Record observations and limits'
```

Deployment creates the development copy/descriptors and ownership records; it does
not select the playset. Close EU4 before deploying. Validation errors block normal
deployment; `-AllowValidationErrors` explicitly records diagnostic deployment,
failed validation still blocks it. [Deployment details](../tools/deployment/README.md).

The [collector](../tools/test-runs/README.md) verifies deployment hashes before/after,
captures byte-preserving logs/deltas and records **operator-supplied** outcomes.
Exit 0 means collection succeeded even when gameplay failed or logs contain errors.
Clean/no changed logs do not prove loading or successful behavior. Use `-Untracked`
and explicit `-Action baseline -Run <id>` for a comparable no-mod log baseline;
the collector does not verify vanilla playset activation. Unbaselined errors must
not be attributed to this mod automatically. Descriptor bytes are part of strict
identity: the historical selector run lost a final descriptor newline and was
flagged, even though content files matched.

Start with the [selector scenario and reported results](testing/brittany-diplomatic-selector.md).
Do not use forced completion for normal mission-button scenarios.

## Isolated native runner

[Runtime README](../tools/runtime-tests/README.md) and
[assertion guide](modding/runtime-script-assertions.md) describe the implementation.

```powershell
./tools/run-eu4-test.ps1 -Test preview-gate
./tools/run-eu4-test.ps1 -Test shipbuilding-reward
./tools/run-eu4-test.ps1 -Test borders-reward
./tools/run-eu4-test.ps1 -Test textiles-upgrade
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150
# Diagnostics outside all:
./tools/run-eu4-test.ps1 -Test run-effects -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Test nantes-market -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -PrepareOnly
```

For covered behavior changes run the relevant named contract plus CWTools. Use
`all` after shared trigger/effect/runner changes or before a broader handoff.

The runner reads normal launcher `dlc_load.json` and requires only
`mod/brittany_missions_dev.mod` with no disabled DLC, cleans identity-verified stale
harness processes and refuses unrelated EU4, copies production byte for byte into
`tools/runtime-tests/work/`, adds
test-only hooks/wrappers and generates an isolated profile/descriptor. It reads
normal settings but does not write the ordinary profile, installed game or source
mod. Production and staged CWTools must both complete without errors before launch.

Launch is `eu4.exe -debug -userdir=<profile>/ -start_tag=BRI`. Startup assertions
check fresh independent Brittany on 1444.11.11, relevant flags/ownership and all 18
DLC. Plain effect cases use `-auto_run=eu4rt_run.commands`: profile-root CRLF
command lines `run eu4rt_<test>.txt`. These ordinary UTF-8 effect files have no
event envelope; native execution was demonstrated for implicit BRI, explicit
`BRI = { ... }` and province nesting. Startup does not itself load the console
files. Static wrappers validate bodies but are not invoked in game.

Required `all` covers preview logic, two named production rewards and the installed
textiles helper, plus static mission wiring. The final retained suite passed all
four, before/after reward extraction. See [suite evidence](testing/runtime-regression-suite/README.md).
`-NegativeControl -Test all` faults only staged code: expected exit 1, preview/
shipbuilding/borders FAIL and textiles PASS. `-InlineBaseline` is historical
comparison mode requiring original inline rewards, not normal current execution.

Native PASS/exit 0 means the stated predicate/effect contract. FAIL/exit 1 means
assertion/wiring failure. PARTIAL/exit 2 means the Nantes diagnostic completed but
faithful completion is unproven. Infrastructure/missing evidence/timeout/crash is
INCOMPLETE/exit 2. `-PrepareOnly` exits 0 for static preparation, never a native
PASS. Each required suite case is judged separately; any required failure or
incomplete case makes the suite nonzero.

The full runner requires ordered unique nonce/date/version markers, unchanged
staged/console files and no relevant script-error matches; these checks are broader
than the transcript evaluator alone. Owned lifecycle monitoring is bounded separately
from CWTools (default total native timeout 120 seconds, permitted 30–1800; after
native markers begin, default progress timeout 30 seconds). It requests normal
close on success, then forces termination after five seconds if needed. Failures
clean verified descendants/reporters and can retry once in a fresh profile by
default (`-Retries 0–2`, `-ProgressTimeoutSeconds 5–1800`). Cleanup failure and
assertion/integrity/configuration errors stop. The [recovery report and playtest
list](testing/runtime-recovery/README.md) retain actual termination/native crash
recovery, reporter removal and a clean follow-up suite, plus remaining bounds.
Steam must already be usable; authentication remains the operator's responsibility.
Graphics access is required: isolated execution is **not headless**. A restricted
desktop failed D3D creation; a Steam-not-running launch also reached no assertions.

Local results/manifests/CWTools/log snapshots live in ignored work and the collector's
separate `brittany_runtime` namespace. Portable selected artifacts live in
`docs/testing/`; public path provenance is redacted to synthetic roots and original
hashes refer to local originals. Game screenshots and bulk engine dumps remain local.
See [publication policy](REPOSITORY_HYGIENE.md) and
[redaction manifest](testing/publication-redactions.json).
Normal deployment cannot copy runtime hooks because they are not production files.

## Calibration and unresolved limitations

| Mechanism / risk | Established evidence and limit |
| --- | --- |
| Plain console files and `-auto_run` | Profile-root `.txt`, one/two-command CRLF batches, country/province effects and named calls verified; other extensions/absolute paths/spaces/default-profile lookup not verified |
| Province modifier observation | Cloth apply/remove changes exported goods modifier 0 -> 0.15 -> 0; ID query false despite positive values. Ordinary Nantes UI/native saves now independently verify named permanent rewards and +0.15 contributions, including reload; console ID queries remain false. Original probe FAILs retained; no general cause established |
| Post-click console completion query | `mission_completed` false despite ordinary Nantes completion in UI/native `completed_missions`, both before and after reload. Preserve FAIL and use independent UI/save evidence; startup state-only behavior is a separate context |
| Native save provenance | In the Nantes reload, metadata `save_game` names the loaded completed file but `campaign_id` changes. Record original/snapshot hashes, load source and relevant restored state; do not assume UUID stability. Not a general save-schema rule |
| Vanilla stability helper | Actual `add_stability_or_adm_power` yields stability 0 -> 1; max-stability ADM branch not tested |
| `complete_mission` | Nantes completion/parent state recorded without reward even in ready-building fixture; not faithful mission dispatch or readiness oracle |
| Native `mission` command | Fresh independent native saves/UI establish Nantes complete, Textiles ready and rewards absent despite false completion query. Historical raw query-based FAIL/incomplete verdicts remain unchanged; not faithful claiming. [Fresh report](testing/runtime-mission-claim/README.md) |
| Numerical assertions | 0.0002-wide intervals falsely failed expected rewards; accepted contracts use fixed deltas and `[expected, expected + 0.001)`; avoid caps/clamping assumptions |
| Native crash/hang | Historical dynamic-log stack overflow cause remains unisolated. Owned lifecycle captures crash/timeout attempts as incomplete, removes verified remnants and retries boundedly. Native crash/reporter recovery and a real after-BEGIN suspension are verified, each followed by a separate clean suite. Unusual unidentifiable dialogs remain open in the [recovery report](testing/runtime-recovery/README.md) |
| Relevant-error filtering | Identifier filter covers known hook/effect sources, not every possible game error. General errors require a comparable baseline |
| Mission/layout evidence | Predicate/effect plus wiring never establishes normal readiness, button dispatch, tooltip rendering, UI refresh or save/reload. Inspector geometry/unknown predicates can produce warnings requiring judgment |
| Localisation diagnostics | `desc_<id>` warnings despite existing `_desc` text need rules/vanilla/UI review; false-positive status not established. Duplicate keys are independently evidenced |

Read [run-file calibration](testing/runtime-run-effects/README.md),
[console guide](modding/console-run-effects.md), and
[native completion guide](modding/native-mission-completion.md) before extending
automation. Do not assume arbitrary startup/file dispatch, save loading, stdin,
sockets or gameplay UI automation are supported.

## Playtest list

The separate bounded faithful UI case is documented in
[the claim report and playtest list](testing/runtime-mission-claim/README.md#playtest-list):

```powershell
./tools/run-eu4-test.ps1 -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
./tools/run-eu4-test.ps1 -Test nantes-claim -ClaimMode negative -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
```

These require an active Codex `node_repl` driver using the supported Windows
adapter; see [operator handoff](../tools/runtime-tests/README.md#faithful-nantes-claim).
Bare PowerShell waits boundedly then fails/cleans without that driver. Native
markers verify setup inputs, screenshot inspection verifies actual UI readiness,
and actual native saves judge completion/rewards independently. Real button
dispatch and unready refusal passed, followed by a separate clean `all`.
Diagnostic modes `mission`, `scripted`, `tree` never earn mission PASS.
Keep these outside the four required logic/effect/wiring cases. Other layouts,
standalone UI operation, locked desktops and UI-stage native crashes remain open.

Concrete starting conditions, source files, steps, expected results and failure
signs remain in the detailed scenario owners:

- [Suite playtests](testing/runtime-regression-suite/README.md#playtest-list):
  ordinary shipbuilding/borders/textiles dispatch, tooltips, persistence/expiry,
  selector refresh and named-query comparison.
- [Nantes playtests](testing/runtime-nantes-market/README.md#open-playtest-list):
  required ordinary readiness/completion/rewards, Textiles parent refresh, once-only
  action and save/reload are now [verified manually](testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
  on the recorded build; query/automation boundaries remain explicit.
- [Calibration playtests](testing/runtime-run-effects/README.md#open-playtest-list):
  query reliability against UI/save/day advance, mission dispatch and vanilla
  helper's max-stability branch.
- [Selector manual record](testing/brittany-diplomatic-selector.md): retain reported
  passes; still isolate the preview gate with every normal requirement satisfied
  and record exact mission rewards/build/environment identity.

The runner starts fresh; direct save-launch semantics remain unverified. USA's
ordinary UI reload proved that startup hooks execute again, including former-tag
scope. Its fixture now guards setup with an initial identity predicate and saved
flag; duplicate protocol markers are still rejected. One bounded Codex-operated
Nantes END-TO-END test exists; its numeric post-click/reload remain additional
manual reference evidence. USA has a separate real-input/save/reload contract.
Follow [ROADMAP.md](ROADMAP.md) for open work rather than treating these
limitations as implemented or as proven production defects.

## American Century

Use the existing runner with `-Test usa-slice -ClaimMode click -TimeoutSeconds
1200 -ProgressTimeoutSeconds 1200 -Retries 0`; negative readiness changes only
`-ClaimMode negative`. An active Codex session operates the owned window through
the same input driver. Source/staged CWTools, startup assertions, actual vanilla
formation, production button claims, independent native saves and numerical
modifier observations are distinct evidence layers. See the [USA report and
playtest list](testing/american-century/README.md). Run Brittany `-Test all` after
shared runner changes; USA fixture success does not prove a natural colonial war,
the complete proposed tree, AI, other DLC combinations or export readiness.
