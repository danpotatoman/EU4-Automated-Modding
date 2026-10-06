# Native harness crash and hang recovery

Verified 2026-10-03 (America/Los_Angeles), EU4 **1.37.5.0 Inca (491d)**.
Execution was authorized by the user's testing-infrastructure request. No production
mod files, ordinary profiles, saves or installed game files were modified by this
task. This report establishes lifecycle recovery and existing logic/effect/wiring
contracts; it does not establish ordinary mission completion or release readiness.

## Existing architecture and changes

`tools/run-eu4-test.ps1` remains the entry point. `tools/runtime-tests/run.mjs`
continues to own launcher/DLC checks, byte-preserving staging, manifests, production
and staged CWTools, startup hooks, plain `run` files/CRLF `-auto_run` batches,
evaluation and the existing `tools/test-runs/collector.mjs` namespace.

The runner now uses `tools/runtime-tests/lifecycle.mjs` for owned launch, observation,
cleanup, stale ownership and bounded attempts. Its internal `processes.ps1` adapter
reads Windows process identity and terminates verified instances. These are harness
components, not an independent watchdog. Native lifecycle tests are in
`lifecycle.test.mjs`; portable recovery replays are in `recovery-evidence.test.mjs`.
The collector implementation is unchanged. Its self-test now names an explicitly
missing deployment fixture instead of assuming no real development record exists.

Each attempt copies only prepared profile inputs into `attempts/<number>/profile`,
including settings, isolated descriptor and console files. Failed logs, saves and
caches are never reused. Static validation happens once per staged build. Nonces
are shared within a run, but transcripts come from separate fresh profiles and
are evaluated separately; prior failed attempts remain in `result.json`.

## Detection and bounded policy

- Child exit or termination before completion: `unexpected-exit`, with exit/signal
  codes, elapsed time and last native marker. A nonzero exit cannot pass even with END.
- Startup: existing `-TimeoutSeconds` lifetime limit (default 120, range 30–600).
  Loading has no verified heartbeat; general log traffic is not proof of progress.
- After current-nonce assertions start: `-ProgressTimeoutSeconds` (default 30,
  range 5–600) bounds stalled native progress. The total limit still applies.
- Isolated crash directories force `native-crash`, even if assertions were observed.
  Graphics and launch/configuration/validation errors fail clearly without blind retry.
- Default `-Retries 1` permits **two total attempts**; allowed range 0–2. Only
  unexpected exit, native crash or progress/lifetime timeout can retry, and only
  after verified cleanup. Assertion failures, wiring/integrity/script errors,
  diagnostic capture failures and failed cleanup stop. Exhaustion remains
  INCOMPLETE/exit 2 with a final reason. Assertion FAIL remains exit 1.

## Process ownership and cleanup

The lifecycle lock rejects another live native runner before touching its processes
or collector. Stale lock recovery checks PID, creation time and executable.
Recognized run results and `ownership.json` identify isolated profiles and owned
process instances. Legacy runs without an ownership file require the recorded PID,
userdir and launch-time interval; merely reusing an old profile later does not
authorize termination. Malformed/unrecognized records never authorize broad kills.

Cleanup follows recorded descendants and matches the installed reporter's executable
plus an owned crash/profile path. It checks creation ordering and rejects PID reuse.
Before termination the PowerShell adapter rechecks PID, executable and creation time,
then uses a handle to that instance. Steam is excluded. Unrelated EU4 is refused.
Known parent identities survive game exit and retries, allowing orphan/late reporter
discovery. Three bounded cleanup scans plus a prelaunch sweep catch delayed remnants;
remaining owned processes block retry. Successful games retain normal close followed
by a five-second force-close limit. Failure cleanup force-terminates owned remnants.

Actual observed reporter: `crash_reporter/binaries/CrashReporter.exe`, parent EU4,
window title **Paradox Crash Reporter**, command argument `--crashdir=<isolated
profile>/crashes/eu4_20261003_170911`. The game had exited while the reporter remained.
Reporter PID 32380 was forced closed without keyboard/mouse or submitting a report.
See [raw result](evidence/crash/result.json) and
[ownership](evidence/crash/ownership.json). No launcher process was observed in this
direct-executable crash exercise. Other ownership-identifiable descendants use the
same cleanup; arbitrary unrelated launcher windows are not killed by name.

## Diagnostics

`result.json` retains run/nonce, installed version, launcher configuration, manifests,
policy, each attempt's command/profile/PID, timestamps, reason, elapsed time,
exit/signal, last progress, cleanup actions/remaining identities, retry decision,
case verdicts, collector references and crash metadata paths. `ownership.json`
supports subsequent stale recovery. Each attempt retains stdout/stderr, its profile,
collector logs and, on failure, pre-cleanup copies of four diagnostic logs.
Small `exception.txt` excerpts are public; `meta.yml` and hardware diagnostics stay local. Huge crash dumps are not copied
into portable evidence. The collector's outcome label still does not prove gameplay.
An abandoned isolated collector run is finished as not-completed under the lifecycle
lock before a new run begins.

## Validation and real exercises

Baseline: original 17 evaluator/wiring/evidence tests PASS. After implementation,
35 tests PASS, including actual dummy exit, actual live hung child, real Windows
dummy tree cleanup preserving an unrelated process, simulated stall/lifetime
deadlines, late/orphan reporter ownership, PID reuse, stale profile bounds,
idempotence, cleanup refusal, bounded retry and live/dead locks. Collector Node and
PowerShell wrapper self-tests PASS. Its initial environmental test failure remains
recorded in the execution plan; the explicit fixture corrected the assumption.
Portable evidence replays are additional verification of these retained runs,
not new game executions.
The first clean-inventory replay caught PowerShell's empty-pipeline serialization
as `{}`. Its [original snapshot](evidence/clean/post-run-processes-original.json)
is preserved; a repeated process inspection explicitly records count 0 and `[]`.
The replay requires that exact empty array and absent lock and now passes.

All actual runs checked launcher configuration, running version/start date, all
18 DLC, source/console integrity, script-error filtering and unchanged assertions.
Each had production CWTools **0 errors / 58 warnings** and staged **0 / 62**,
both completed, CWTools 0.10.31. Warnings and general unbaselined log errors remain
outside this lifecycle task.

| Scenario | Attempt 1 | Attempt 2 / follow-up | Portable evidence |
| --- | --- | --- | --- |
| Controlled termination | PID 36616 terminated through original child handle after five seconds; unexpected-exit; cleanup clean; retry scheduled | PID 31684; all four PASS; cleanup clean; exit 0 | [result](evidence/terminate/result.json) |
| Actual native crash | First batch invokes installed native `CrashReporter.SimulateCrash`; PID 35460 crashes; reporter 32380 remains; forced reporter cleanup; crash attempt INCOMPLETE | PID 59116; fresh profile; all four PASS; normal close; exit 0 | [result](evidence/crash/result.json), [exception](evidence/crash/attempt-1/exception.txt), metadata (local-only crash report; excluded from publication), [batch](evidence/crash/attempt-1/eu4rt_run.commands) |
| Separate final clean run | PID 57288; no fault switch; single attempt; all four PASS | 103.47 seconds total, 47.88 native including cleanup; exit 0; no EU4/reporter/WER or lifecycle lock remains | [result](evidence/clean/result.json), [post-run inventory](evidence/clean/post-run-processes.json) |
| Real after-BEGIN freeze follow-up | PID 30308; all 72 threads suspended; progress-timeout after 15.226 seconds idle despite 21 unrelated diagnostic lines; forced cleanup | PID 4136; fresh profile/original batch; four PASS; exit 0 | [result](evidence/freeze/result.json), [inventory](evidence/freeze/post-run-processes.json) |
| Separate clean suite after freeze | PID 17520; no diagnostic switch; one attempt; four PASS | 102.88 seconds total/47.59 native; no game/reporting/harness/lock/collector remnants | [result](evidence/freeze-clean/result.json), [inventory](evidence/freeze-clean/post-run-processes.json), [input integrity](evidence/freeze-clean/integrity-after.json) |

The native crash command is supported by retained installed
[helplog output](../runtime-nantes-market/evidence/console-batch/game.log), lines 119–120.
Diagnostic switches affect only the first attempt; the crash command is inserted
only into that attempt's isolated command batch with its own recorded hash.
Production scripts are untouched. The earlier normal run also passed, but is not
needed as portable recovery evidence. An external termination probe missed its
timing window due to PowerShell JSON-array enumeration; it killed nothing. The
built-in diagnostic exercise removed that timing dependency.

## Real after-BEGIN freeze validation

The narrow follow-up was explicitly authorized to close item 3, with no lifecycle
redesign. Baseline 35 tests passed; the diagnostic dummy suspension and two portable
replays bring final coverage to 38 tests. No recovery bug was exposed or timeout,
cleanup, retry, evaluator or contract weakened. Production/staged CWTools completed
with the same 0 errors/58 and 62 warnings in both new runs.

Commands:

```powershell
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ProgressTimeoutSeconds 15 -Retries 1 -ExerciseFreezeFirst
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1
```

Only diagnostic support changed `tools/run-eu4-test.ps1`,
`tools/runtime-tests/run.mjs`, `lifecycle.mjs` and `processes.ps1`. The disabled
`ExerciseFreezeFirst` switch is restricted to normal native `all`, affects attempt
1 only and cannot combine with another exercise. The Windows adapter adds a
diagnostic Suspend action using a held process handle after PID, creation time and
executable checks. The runner additionally requires that instance to match its
recorded owned game and exact isolated userdir. The native signature is documented
in the primary [PHNT header](https://github.com/winsiderss/phnt/blob/master/ntpsapi.h)
(`NtSuspendProcess`); availability was demonstrated locally before touching EU4.
The new Windows dummy test rejects changed identities, proves the owned heartbeat
stops while an unrelated heartbeat continues, and force-cleans the frozen instance.

**Timing gate:** on the first attempt only, omit `-auto_run` dispatch while keeping
the original console files, startup hooks and assertions byte-identical. This lets
the real startup/DLC assertions begin, with effect ENDs still pending, before the
observer suspends the game. Otherwise the fast batch can finish within one poll.
This is a diagnostic dispatch gate, not a change to production or the timeout
mechanism. Attempt 2 and the separate clean suite dispatch the original full batch.
The exercise validates a genuine suspended EU4 with an incomplete assertion stream;
it does not claim to interrupt an individual scripted effect midway through execution.

Observed [first-attempt native log](evidence/freeze/attempt-1/game.log):

```text
EU4RT c80185f6448b063e_0 BEGIN preview-gate
...
EU4RT c80185f6448b063e_3 OK dlc-18
```

The first line was observed before suspension; the last is the last progress signal
at suspension and detection. The observer recorded 86 current-nonce native markers.
PID **30308**, created `2026-10-04T00:32:17.2378870Z`, was suspended at
`00:32:58.6529667Z` via `ntdll!NtSuspendProcess` (NTSTATUS 0). All **72/72** observed
threads reported `Wait / Suspended`, retained in `freezeDiagnostic.suspension` in the
[result](evidence/freeze/result.json). It remained alive, with null exit/signal codes,
when the existing observer classified **progress-timeout** at `00:33:12.544Z`.

Configured stall limit: **15 seconds**. Observed native-progress idle time:
**15.226 seconds**; actual suspension to detection: **13.892 seconds**. Identity
lookup and diagnostic adapter execution consumed part of the existing deadline,
which starts when the observer sees native progress, not when suspension finishes.
The 150-second total deadline did not cause this outcome.

While frozen, the harness appended **21** explicitly labeled
`EU4RT_DIAGNOSTIC unrelated-general-activity` lines to the isolated `game.log`,
through the detection poll. They are synthetic harness noise, not EU4 assertions.
The marker count/last signal stayed unchanged and the log traffic did not reset
the deadline. The pre-cleanup [snapshot](evidence/freeze/attempt-1/failure-game.log)
and final log retain this traffic; no source/ordinary log was touched.

The existing cleanup **force-killed PID 30308**, returned `clean: true` with no
remaining owned processes, and retained every first-attempt case as incomplete.
First-attempt finalization finished at `00:33:17.408Z`; attempt 2 was prepared at
`00:33:17.421Z` and its EU4 PID **4136** was created at `00:33:19.3702750Z`.
Thus cleanup and capture completed before retry. Retry used `attempts/2/profile`,
not `attempts/1/profile`, dispatched the unchanged command batch, and passed all
four contracts with normal close. Retry budget remained one; final exit 0.

The separate clean run (PID **17520**) passed all four in a single attempt,
exit 0, with default progress timeout and no diagnostic switch. Both post-run
inventories linked above found **zero** EU4/CrashReporter/WER/wermgr and related
native harness processes, no lifecycle lock and no active runtime collector.
The recorded freeze harness owner was gone. Steam retained PID **43684** and
creation time `2026-10-03T18:59:55.3349540Z` in both snapshots. No unrelated EU4
was present or touched. Before/after hashes verify all production files and the
ordinary settings/dlc_load inputs unchanged. No normal saves or installed files
were targeted. The separately generated manual Nantes fixture remains outside scope.

**Item 3 is verified** for this controlled real-process suspension. Unusual dialogs
without observable ownership remain item 4; no broader compatibility claim follows.

## Playtest list and coverage limits

Affected files: `tools/run-eu4-test.ps1`, `tools/runtime-tests/{run,lifecycle}.mjs`,
`tools/runtime-tests/processes.ps1`; production fixtures remain unchanged.
Start with Steam usable, no unrelated EU4, normal launcher selecting only the
development mod/no disabled DLC, normal desktop/process access and installed 1.37.5.0.

1. **Verified: unexpected exit recovery.** Run
   `./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1 -ExerciseTerminateFirst`.
   Expect first unexpected-exit, clean cleanup, one fresh retry and four PASS.
   Failure signs: waiting beyond limits, extra attempts, reused failed logs, leftover
   processes or a first-attempt pass. Evidence is linked above.
2. **Verified: actual crash reporter recovery.** Run the same command with
   `-ExerciseNativeCrash` instead. Expect crash metadata, owned reporter forced
   closed, first attempt incomplete, clean retry and four PASS. Failure signs:
   reporter needs dismissal, no captured crash metadata, stale process, false PASS.
   Follow with a separate normal `-Test all`; that follow-up is verified above.
3. **Verified: a real suspended/frozen game after BEGIN.** Run
   `./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -ProgressTimeoutSeconds 15 -Retries 1 -ExerciseFreezeFirst`.
   Starting conditions are unchanged above. The first-attempt diagnostic gate
   withholds auto_run dispatch, observes unchanged startup BEGINs, and suspends only
   the verified owned game. Expect actual suspended-thread evidence, progress-timeout
   despite labeled unrelated noise, force-cleanup, verified-clean-before-fresh-retry,
   four PASS, then a separate clean suite and empty inventories. Those results are
   [verified above](#real-after-begin-freeze-validation). Failure signs: no BEGIN
   before suspension, general traffic extends the stall budget, frozen process
   survives, retry precedes cleanup, diagnostic affects retry/normal run, or stale
   processes/lock/collector remain. Do not suspend ordinary sessions.
4. **Open: unusual delayed/reparented dialogs.** Unit tests cover orphan paths,
   recorded parents, delayed reporters and PID reuse; the real observed reporter
   has the ownership above. A descendant that appears after cleanup's final scan,
   loses all observable parent ancestry and omits the owned path may remain
   unidentifiable. Permission-denied termination, damaged ownership records,
   Steam login/graphics failures or unrelated sessions may require operator repair.
   The harness fails boundedly; it does not kill ambiguous processes. Test new
   dialog variants in isolated profiles, record executable/parent/creation/path,
   and require a clean subsequent suite before closing this item.

The separately generated Nantes manual launcher/watchdog is outside the automatic
runner and was not refactored. Its historical cleanup limits remain. This change
does not turn manual gameplay or saved-game fixtures into unattended tests.
