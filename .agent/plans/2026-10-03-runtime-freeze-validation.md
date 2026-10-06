# Real native freeze validation

Status: complete
Last updated: 2026-10-03

## Goal and authorization

The user explicitly authorizes closing the real EU4 after-BEGIN freeze gap in
`docs/testing/runtime-recovery/README.md`. Use the existing harness and recovery
policy. A minimal disabled diagnostic hook is permitted; no lifecycle redesign,
external watchdog, production/profile/save/game-file changes or GUI automation.

## Background and relevant files

The completed [recovery plan](2026-10-03-runtime-recovery.md) and
[report](../../docs/testing/runtime-recovery/README.md) establish real exit/crash
recovery, but item 3 remains open. `tools/run-eu4-test.ps1` invokes `run.mjs`, which
uses `lifecycle.mjs` observation/attempt policy and the `processes.ps1` adapter.
Existing diagnostics terminate or crash first attempts; neither suspends a child.
`behavior-fixture.on_actions.txt` emits BEGIN/start/DLC checks; effect ENDs come
from the auto_run files. All may arrive faster than the normal poll interval.

## Requirements and implementation plan

- [x] Inspect existing implementation/report/procedure and version/process state.
- [x] Add only `ExerciseFreezeFirst` for `-Test all`. First attempt withholds auto_run
  dispatch to expose the real startup BEGIN timing window, then suspends only the
  PID/executable/creation/profile-verified game instance. Original files unchanged.
- [x] Validate suspension availability/identity rejection on a dummy process first;
  do not proceed to EU4 if unsafe/unavailable. Use the existing adapter/cleanup.
- [x] Run all with total 150s, progress 15s and one retry. Record native marker,
  thread suspension evidence, timing, diagnostic unrelated log traffic, force-cleanup,
  cleanup-before-retry and fresh passing retry. Fix actual bugs only if exposed.
- [x] Capture post-recovery inventory, then run separate clean all and capture its
  inventory. Record Steam identity, collector status, locks and harness descendants.
- [x] Retain portable evidence under runtime-recovery/evidence/freeze and freeze-clean,
  add regressions/replays, update report/status/README and close verified item.

## Discoveries and decisions

Installed version reconfirmed 1.37.5.0 Inca (491d); Steam PID 43684 active, no EU4,
reporter or WER. Baseline 35 tests PASS with process access outside sandbox.
Suspension uses an identity-checked held process handle and native NtSuspendProcess,
whose declaration is in the primary PHNT `ntpsapi.h`; availability and frozen thread
state will be tested locally. It is diagnostic-only, not a monitoring mechanism.
Any unrelated lines added while frozen will be clearly identified as harness noise,
never represented as native progress. Normal timeout/evaluator/retry remain intact.

## Validation

Baseline: existing `node --test tools/runtime-tests/*.test.mjs`, 35/35 PASS.
Planned commands:

```powershell
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ProgressTimeoutSeconds 15 -Retries 1 -ExerciseFreezeFirst
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1
```

Native freeze and separate clean follow-up completed. No mechanic/
script/localisation edit made; normal runner performs production/staged CWTools.
New Windows dummy diagnostic proves NtSuspendProcess succeeds, all observed threads
are suspended, owned heartbeat stops, unrelated heartbeat continues, false creation/
executable identities are rejected, and existing cleanup force-kills the frozen
instance. All 36 current tests PASS. Production/settings/dlc_load baseline hashes
retained in ignored work before native launch and copied into portable evidence.

Real first attempt PID 30308 reached `EU4RT c80185f6448b063e_0 BEGIN preview-gate`
and startup/DLC markers; all 72 threads reported Suspended after NtSuspendProcess
NTSTATUS 0. Existing observer classified progress-timeout at 15.226s idle (13.892s
after actual suspension; identity/adapter overhead consumed part of the deadline).
21 labeled unrelated log lines did not extend it. Cleanup clean; retry scheduled
and PID 4136 launched in attempts/2/profile. All four retry contracts PASS, exit 0.
First cleanup force-killed 30308; first finished 00:33:17.408Z, second prepared
00:33:17.421Z and actually created 00:33:19.370Z, proving cleanup precedes retry.
Post-recovery inventory: game/reporter/WER count 0, harness count 0, lock absent,
collector inactive; original Steam still active. Evidence retained under
`docs/testing/runtime-recovery/evidence/freeze/`. No lifecycle bug was exposed.

Separate clean `all` nonce 63d3faf7c6cafb65, PID 17520: four PASS in one attempt,
exit 0, 102.88s total/47.59s native. Evidence under
`docs/testing/runtime-recovery/evidence/freeze-clean/`. Both inventories show no
game/reporting/harness processes, no lifecycle lock/active collector, and unchanged
Steam PID/creation. Before/after production/settings/dlc_load hashes all unchanged.
Both native commands performed production/staged CWTools: completed, 0 errors and
58/62 warnings. Final `node --test tools/runtime-tests/*.test.mjs`: **38/38 PASS**,
including the diagnostic dummy test and two new native evidence replays. Local
changed-document links and whitespace checks PASS. README item 3 is verified with
the diagnostic timing gate and precise scope recorded in its
[follow-up report](../../docs/testing/runtime-recovery/README.md#real-after-begin-freeze-validation).

## Remaining issues and completion criteria

Completion criteria met: real identity-verified frozen EU4 after current BEGIN,
progress-timeout despite general log noise, force cleanup, verified-clean-before-
fresh-retry/four PASS, separate clean four PASS and no process/lock/collector remnants.
Unidentifiable-dialog scenarios are outside this follow-up and remain open.
