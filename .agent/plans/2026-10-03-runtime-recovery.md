# Native test lifecycle recovery

Status: complete
Last updated: 2026-10-03

## Goal and authorization

The user's attached request explicitly authorizes inspection, implementation and
deterministic/native recovery exercises. Extend the existing native runner for
unexpected exits, stalled progress, reporters and stale owned processes, with
bounded retries and retained diagnostics. Production and ordinary profiles stay
untouched. No independent watchdog and no manual dialog dependency.

## Background and relevant systems

`tools/run-eu4-test.ps1` invokes `tools/runtime-tests/run.mjs`; the latter stages
content, validates production/staged code, launches one isolated `-userdir`, polls
nonce END markers, evaluates contracts, closes its PID and finishes the existing
`tools/test-runs/collector.mjs` capture. No retry abstraction exists. Its timeout
is bounded but not progress-aware; reporter cleanup and lifecycle tests are absent.
The separate Nantes manual fixture is outside automatic suite scope.

## Requirements / non-goals

Reuse configurations, profiles, evaluator and collector. Retry only recoverable
infrastructure outcomes, never assertion failures. Record every attempt and final
exhaustion. Only clean identity-verified harness processes; refuse unrelated EU4.
Retain startup/version/DLC and wiring checks. No gameplay mechanic changes.

## Implementation plan and progress

- [x] Inspect entry points, launch, startup/completion signals, profiles, collector,
  existing tests and installed version; report architecture before edits.
- [x] Extract owned lifecycle within runtime-tests; bounded marker-progress and
  lifetime limits, safe identity/tree/reporter cleanup, stale recovery and lock.
- [x] Integrate attempt policy, fresh isolated attempt profiles and diagnostics.
- [x] Add deterministic child-process, ownership, retry and success tests.
- [x] Exercise real isolated EU4 controlled termination, recovery and subsequent
  clean `all`; inspect actual crash reporter behavior if practical.
- [x] Update documentation, retain portable evidence, finish plan.

## Discoveries and decisions

Installed launcher settings: EU4 1.37.5.0 Inca (491d). Reporter executable exists
at `crash_reporter/binaries/CrashReporter.exe`. Elevated read-only process inspection
finds Steam active, no game/reporter/launcher. Launcher config matches one development
mod and no disabled DLC. Restricted CIM inspection is denied; real lifecycle tests
need desktop/process access outside that session. Existing 17 native tests PASS.
Working tree already contains user changes and untracked infrastructure; preserve.

Actual native help lists `CrashReporter.SimulateCrash` (retained console-batch
game.log lines 119–120). An explicit first-attempt diagnostic batch triggered it.
EU4 spawned CrashReporter.exe with Paradox Crash Reporter title, parent EU4 and
an isolated --crashdir. The game exited while reporter remained; owned cleanup
forced reporter closed and a fresh retry passed. Launch is still owned by run.mjs;
no external watchdog was added. D010 records the architecture/ownership policy.

The initial external termination probe incorrectly treated PowerShell's parsed
JSON array as an enumerated pipeline; it killed nothing and missed the first
normal run's window. Built-in diagnostic first-attempt termination made the real
exercise deterministic. Its first attempt exited, cleanup was verified and the
second passed. Do not treat the missed probe as a recovery exercise.

## Validation

Baseline: node fallback `--test tools/runtime-tests/*.test.mjs`: 17/17 PASS.
Final same command: **35/35 PASS**, including 15 lifecycle tests and three raw
recovery replays; Windows dummy-tree cleanup actually preserves an unrelated child.
Collector `./tools/test-runs/self-test.ps1`: Node and wrapper PASS. Initial collector
test failed because it assumed the real development record did not exist; corrected
only that setup to use an explicit missing fixture record, without weakening its
assertion. A new replay initially failed on post-run empty-pipeline JSON `{}`;
original snapshot preserved, process inspection repeated with an explicit array
and zero-count field, and stronger exact-empty-array assertion now passes.

Native commands, all completed successfully:

```powershell
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1 -ExerciseTerminateFirst
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1 -ExerciseNativeCrash
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 1
```

Each failure exercise recovered to four PASS in attempt 2; separate final clean
run passed all four in one attempt. Production/staged CWTools completed without
errors (58/62 warnings). Post-run game/reporter/WER count zero; lock absent.
All production files match final clean staged manifest. Portable raw evidence and
scope are in the [recovery report](../../docs/testing/runtime-recovery/README.md).
Node syntax, local changed-document links and whitespace checks were reviewed.

## Remaining issues / playtests

Actual reporter command line and no-interaction recovery are verified. At this
plan's original handoff, real EU4 freeze after BEGIN and unusual dialogs remained
open in
the report's [playtest list](../../docs/testing/runtime-recovery/README.md#playtest-list-and-coverage-limits).
PID reuse, orphan/path ownership, delayed reporter scans, bounded stalls/retries and
cleanup refusal are covered by automated tests. The separate manual Nantes
launcher/watchdog was outside scope and unchanged. No release-readiness claim.
The separately authorized [freeze follow-up](2026-10-03-runtime-freeze-validation.md)
now verifies the real after-BEGIN suspension and closes that item; unusual dialogs
without observable ownership remain open.

## Completion criteria

Deterministic tests prove bounded failure/cleanup/retry and unaffected success;
real controlled failure regains control and clean follow-up works, or a concrete
external blocker is recorded. Durable report documents ownership limits and open
reporter/hang scenarios without claiming gameplay/export readiness.
