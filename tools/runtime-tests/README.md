# Small EU4 runtime regression suite

The separately authorized ordinary-button Nantes investigation uses
`prepare-nantes-manual.mjs` to prepare an isolated profile and plain setup/ready/
observation files. It does not launch EU4 or grant/complete mission rewards.
Generated `launch.ps1` supplies bounded visible gameplay and `-Reload` without
setup dispatch. This fixture is outside the automatic required suite. See
[pattern](../../docs/modding/ordinary-mission-button-fixtures.md) and
[closed session record](../../docs/testing/runtime-nantes-market/manual-session.md).
The [final manual report](../../docs/testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
verifies ordinary Nantes readiness/dispatch, both permanent rewards, Textiles
readiness, once-only action and save/reload. Console completion/presence probe
FAILs remain retained; no automated faithful action was established.

`-Test all` runs four required production contracts in one isolated EU4 process:

| Test | Native contract | Static wiring |
| --- | --- | --- |
| `preview-gate` | Actual diplomatic preview trigger in four flag states | Six missions reference the trigger |
| `shipbuilding-reward` | Production conditional shipyard reward, grand-shipyard preservation, ship cost/repair apply/remove values | Shipbuilding calls its named reward |
| `borders-reward` | Production country reputation bonus and +50/+0 DIP alliance branches | Borders calls its named reward |
| `textiles-upgrade` | Actual installed production-building helper: workshop, counting house, +2 production | Textiles calls it in 169/4384 and retains Nantes parent |

The two conditional rewards were extracted only after successful original-block
comparison fixtures; complete expanded AST identity and native before/after passes
are recorded in the [suite report](../../docs/testing/runtime-regression-suite/README.md).
Tests invoke actual production definitions in a hashed byte-for-byte staged copy.
The [coverage manifest](../../docs/testing/runtime-coverage.md) distinguishes
LOGIC/EFFECT/WIRING from ordinary END-TO-END dispatch. The four required contracts
do not verify the latter. Subsequent bounded automated Nantes and USA real-input
contracts are separate scenarios described below and in the current reports;
the earlier manual scenario remains reference evidence.

`preview-gate` tests the production `bri_diplomacy_preview_trigger`.
`nantes-market` diagnoses the native `complete_mission` effect against a production
mission ID. It records completion without executing the mission reward in the
observed run, and therefore reports PARTIAL. Neither test verifies ordinary
mission-button completion, selector events or save/load persistence.
`run-effects` separately investigates plain console files, named scripted-effect
calls and individual province-reward effect observability. It never completes a
mission and cannot establish the mission's real reward dispatch.

```powershell
./tools/run-eu4-test.ps1 -Test preview-gate
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Test shipbuilding-reward
./tools/run-eu4-test.ps1 -Test borders-reward
./tools/run-eu4-test.ps1 -Test textiles-upgrade
./tools/run-eu4-test.ps1 -Test nantes-market -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Test run-effects -TimeoutSeconds 150
# If the shell blocks scripts, use a process-local execution policy:
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./tools/run-eu4-test.ps1 -Test preview-gate
# Cold startup may need a larger, still bounded limit:
./tools/run-eu4-test.ps1 -TimeoutSeconds 180
./tools/run-eu4-test.ps1 -PrepareOnly
node --test tools/runtime-tests/*.test.mjs
# Faults only the isolated copy; expected exit 1, three FAIL and textiles PASS:
./tools/run-eu4-test.ps1 -Test all -NegativeControl -TimeoutSeconds 150
```

Requirements: installed Steam running with EU4 available; access to the Windows
desktop graphics device; the existing Node/CWTools installation. A restricted
desktop session can fail Direct3D creation. Do not change adapter settings as an
assumed fix. Native launch succeeded outside that restriction. Do not automate
authentication if Steam needs login; ask the operator to establish the session.

The runner verifies the normal launcher configuration against the documented
development-mod preference, cleans identity-verified stale harness processes and
refuses unrelated EU4 processes, copies production
files byte for byte to ignored `work/`, adds one test-only startup hook, generates
an isolated user profile and descriptor, validates both projects with the existing
CWTools helper, and starts `eu4.exe -debug -userdir=<profile>/ -start_tag=BRI`.
Effect cases additionally use `-auto_run=eu4rt_run.commands`, containing CRLF
`run eu4rt_<test>.txt` lines for files in the isolated profile root. `all` combines
startup preconditions into one hook; plain files invoke production effects after
startup. Their exact bodies are also validated in non-invoked static wrappers.
The default profile, installed game files and production mod are not written.
EU4 writes its own data inside the isolated profile.

At startup in Brittany the hook asserts independence, the 1444 start and absent
selector flags; checks the 18 documented DLC; then invokes the actual production
trigger for absent preview, French preview, autonomous preview, and locked states.
Fixture effects establish flags directly. They do not exercise the selector's
options or ordinary mission completion.

The Nantes diagnostic asserts membership and incompletion of `bri_nantes_market`
and `bri_breton_textiles`, removes trade buildings in 172, observes the missing
building, adds a marketplace, and observes it. These fixture observations do not
query EU4's mission readiness. It invokes `complete_mission = bri_nantes_market`
in BRI scope and observes actual completion, downstream parent completion,
reward-modifier presence and exported goods-produced modifier values in 169 and
4384. It never duplicates or invokes the production reward body. Missing rewards
are observations of this candidate mechanism, not a demonstrated production bug.

The evaluator requires exactly one ordered transcript for the current nonce,
all checks successful, the expected running version and 1444.11.11 event dates,
unchanged staged files and no relevant hook/trigger parse errors. The runner
reports PASS, PARTIAL (verified diagnostic with unproven faithful completion),
FAIL (assertion failure), or INCOMPLETE (infrastructure, timeout, missing evidence).
Exit codes are 0, 2, 1, and 2 respectively. `preview-gate` and `run-effects` may
report PASS for their respective predicate/effect contracts; a complete Nantes
diagnostic transcript is insufficient for mission PASS. Prepare-only exits 0
after static acceptance and never establishes a behavioral pass.
The three new effect tests likewise report PASS for their effect contracts while
`missionCompletionPass` remains false. `all` reports every case separately and
exits nonzero for any required failure or incomplete result. Final clean runtime
was 92.40 seconds including static checks, 41.16 seconds native including cleanup.
`-InlineBaseline` is a historical comparison option requiring original inline
rewards; it is not the normal runner mode after extraction.

The owned lifecycle is implemented in `lifecycle.mjs` and its internal Windows
`processes.ps1` adapter. Normal successful games still receive a window-close
request, then force-close after five seconds. Failure cleanup also removes verified
descendants and the installed crash reporter. PID/executable/creation-time checks
protect unrelated processes; ordinary EU4 and Steam are not reused or closed.
Recorded ownership and a lifecycle lock support stale recovery before another run.

`-TimeoutSeconds` remains the total native limit, separate from CWTools.
`-ProgressTimeoutSeconds 30` additionally bounds stalled current-nonce assertions
after native progress begins. Loading has no established heartbeat and uses the
total limit. Unexpected exit, crash or timeout can retry once by default:
`-Retries 1` means two total attempts; allowed values are 0–2. Cleanup must verify
clean before retry. Assertions, wiring/integrity errors, failed cleanup and
configuration/graphics/capture failures stop. Exhaustion is INCOMPLETE/exit 2.

Every attempt uses a fresh `attempts/<number>/profile` copied from prepared inputs,
and retains its own stdout/stderr and collector logs in `brittany_runtime`.
`result.json` retains all attempts, failure reason, last signal, elapsed time,
exit/signal code, cleanup actions and retry decisions; `ownership.json` records
process identities. Failed attempts additionally snapshot four logs before cleanup.
Crash dumps stay in ignored work; selected small metadata supports portable evidence.
Collector outcomes remain operator supplied; the runtime evaluator judges contracts.
Do not relabel general log errors as mod regressions without a baseline.

Explicit isolated recovery exercises (first attempt only):

```powershell
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ExerciseTerminateFirst
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ExerciseNativeCrash
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ProgressTimeoutSeconds 15 -ExerciseFreezeFirst
```

The second inserts installed native `CrashReporter.SimulateCrash` only into the
first isolated command batch. It does not modify production or ordinary profiles.
Both exercises and a separate clean subsequent suite passed on 1.37.5.0, including
actual Paradox Crash Reporter cleanup without interaction. See the
[recovery report and playtest list](../../docs/testing/runtime-recovery/README.md)
for raw evidence, detailed ownership bounds and remaining unusual-dialog tests.
The real after-BEGIN freeze is now verified too: `-ExerciseFreezeFirst` withholds
auto_run dispatch only on attempt 1 so unchanged startup assertions reach BEGIN
before the suite can finish. It suspends the verified held game instance with
NtSuspendProcess, records native thread suspension, and adds explicitly labeled
unrelated diagnostic log activity. The existing progress timeout/force-cleanup/
retry path handles the freeze; attempt 2 dispatches the original batch unchanged.
The switch is disabled by default, restricted to a normal native `-Test all`, and
cannot combine with another recovery exercise. Normal timeout and attempt policy
are unchanged. See [real freeze evidence](../../docs/testing/runtime-recovery/README.md#real-after-begin-freeze-validation)
and the remaining unusual-dialog item in that report.
The Windows adapter test requires normal process-inspection access; a restricted
sandbox may deny CIM. The separate manual Nantes fixture is outside this lifecycle.

The first successful run and portable raw evidence are recorded in
`docs/testing/runtime-preview-gate/README.md`. The evaluator tests replay that real
transcript and the [Nantes diagnostic](../../docs/testing/runtime-nantes-market/README.md),
and reject damaged/stale evidence; they are not additional game runs.
The Nantes report also preserves failed native command-batch experiments. Relative
`-auto_run=eu4rt_native.commands` invoked `helplog`, but subsequent commands produced
no state assertions or save. Native `mission <id>` reward behavior was not established.
Later `.txt` probes established profile-root file execution and two-command
`run` batches. The current effect calibration verifies named-effect calls and
exact apply/remove value changes while recording false named-modifier presence
queries as unresolved observations. Original strict presence probes remain FAIL.
See the [run-file findings](../../docs/testing/runtime-run-effects/README.md).
That original investigation attempted no gameplay UI automation. The later
bounded real Nantes claim is documented below and in the
[mechanism guide](../../docs/modding/faithful-mission-input.md).
Test content lives outside all exportable mod directories. Normal deployment
continues to use the existing `deploy-mod.ps1` workflow and cannot copy this hook.

## Faithful Nantes claim

```powershell
./tools/run-eu4-test.ps1 -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
# Separate fresh unready case:
./tools/run-eu4-test.ps1 -Test nantes-claim -ClaimMode negative -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
```

These stage unchanged production plus setup in the existing lifecycle; no separate
launcher/watchdog. They require active Codex `node_repl` with the supported
`@oai/sky` API. A bare PowerShell run cannot complete the UI handoff and times out/
cleans boundedly. Default 30-second progress timeout is too short for this paced
proof; the commands explicitly give up to 600 seconds. Normal `all` is unchanged.

Operator flow inside Codex, following the Computer Use skill:

1. Start the wrapper asynchronously. Read its run directory; wait for current
   `attempts/<n>/ui-lease.json` with native `ready=true`, `failed=false`, PID/HWND.
2. Import `createInputDriver` from this directory's `codex-input.mjs` into
   `node_repl`, injecting the supported `sky` object and current attempt directory.
   Call `observe()`, inspect the returned screenshot; activate/reobserve if needed.
   Use `act({kind:'click',x,y,inspected:true})` only for a control identified in that
   current screenshot. Each action refreshes observation; inspect it before another.
3. Use owned UI controls to reach Missions (country shield then Missions tab),
   inspect Nantes/Cloth for Sail at top scroll. Use the actual Save Game menu and
   visible save-name field to create a paused native save. Copy its stable bytes
   from the attempt's profile save-games directory into `before.eu4`. Run
   `readClaimSave()` to reject wrong version/date/DLC/owner/buildings/reward state.
   Restore the inspected Missions view after saving.
4. For the ready case, call
   `await driver.claimMission('bri_nantes_market',{readyInspected:true,topScroll:true})`.
   This derives the point from production slot/position and installed GUI, checks
   exact capture geometry and obtains a fresh harness process-identity response.
   Inspect the normal reward dialog, completed Nantes and immediately ready
   Textiles. For negative mode inspect the missing-building tooltip; the same
   call records refusal without mission-entry input.
5. Save independently again and copy to `after.eu4`. Write `ui-finish.json` with
   current lease nonce and actual inspected facts: ready claim requires
   `readyInspected`, `downstreamReadyInspected`, `rewardDialogInspected`; negative
   requires `unreadyRefused`. Diagnostic modes require the actual `after.eu4` only.
   Never assert inspection facts that were not observed. The runner then judges
   native markers/integrity, save state and claim input before owned cleanup.
   On uncertainty write `ui-abort.json` with the reason; action failures do this
   automatically. The existing timeout/crash/cleanup rules remain authoritative.

The adapter supplies no timer-only click sequence or general vision parser.
Known window is 1280x720/client, scale 1, top scroll; captured decoration is
1282x752 with offset (1,31). Nantes point derives to (167,343) in that capture.
No ordinary shortcuts/settings/GUI or production file is changed. Every input
uses fresh original PID/creation/executable/exact userdir/HWND verification and
returned screenshot/window scope; no arbitrary foreground/desktop input.

`-ClaimMode mission|scripted|tree` runs fresh state-only command diagnostics,
requiring UI/save evidence and finishing PARTIAL/exit 2, never mission PASS.
`shortcut` is experimental and unverified, not a supported claim method.
Only click's real saved production rewards/completion + inspected UI + one
derived input can earn `missionCompletionPass=true`. Negative PASS is refusal,
not mission completion. Full evidence, tests, failures, recommendation and labeled
[playtest list](../../docs/testing/runtime-mission-claim/README.md#playtest-list)
cover the verified bounded case and remaining extensions.

## USA vertical slice

`./tools/run-eu4-test.ps1 -Test usa-slice -ClaimMode click -TimeoutSeconds 1200
-ProgressTimeoutSeconds 1200 -Retries 0` stages `mod/american_century/` in the same
owned lifecycle. Negative readiness uses `-ClaimMode negative`. Both require an
active Codex input session. The longer bounded progress window covers paused UI
inspection; default 30 seconds is appropriate for native assertion-only cases.
Total and progress limits permit up to 1800 seconds; defaults remain unchanged.
Ten-minute UI runs repeatedly reached correct rewards but timed out before the
final save/handoff. Do not relabel those attempts as complete.
Use the same driver with `{readyInspected:true,topScroll:true}` for each identified
mission. There is no separate launcher, background click bot or console completion.

The initial history fixture leaves ten American core cities with ENG; click the
unchanged vanilla formation decision, accept American ideas, and use the staged
"Record USA Test State" decision before each native save to export numerical
modifier totals. That test-only decision completes no missions or grants rewards.
Claim Liberty, Compact, Harbors and Open Doors in order, choosing enumerated powers.
Save/copy independent `before.eu4` and `after.eu4`; `inspectUSA` rejects wrong
campaign/version/DLC/mod/series, inputs, rewards, duration, exclusivity and totals.
`ui-finish.json` additionally requires current nonce and `formationInspected`,
`constitutionInspected` plus the ordinary inspected claim facts. Negative uses
`formationInspected` and `unreadyRefused`. See the
[USA report and playtests](../../docs/testing/american-century/README.md).
