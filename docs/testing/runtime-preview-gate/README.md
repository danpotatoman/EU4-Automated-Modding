# Automated Brittany preview-gate experiment

Historical experiment record. Later work verified profile-root `.txt` console
dispatch and added three effect contracts; see [current coverage](../runtime-coverage.md)
and [current status](../../STATUS.md). Candidate/unverified entries below describe
this first experiment only; its raw evidence and original verdict are unchanged.

Result: **PASS inside EU4 1.37.5.0**, 2026-10-03, 12:16-12:17 America/Los_Angeles.
This verifies the production preview predicate in the actual engine. It does not
claim that a mission was clicked/completed or that its reward was verified.

## Feature and contract

Feature: `bri_diplomacy_preview_trigger` in
`mod/brittany_missions/common/scripted_triggers/BRI_mission_triggers.txt`, used by
all six diplomatic branch missions in `missions/Custom_Breton_Missions.txt`.
Its tooltip and gate should require absence of `bri_diplomacy_preview`.

**INITIAL STATE:** fresh Brittany on 1444.11.11, independent, preview/French/
autonomous selector flags absent, the default 18 DLC enabled, and only the staged
test copy of Brittany enabled. The hook asserts country scope through `tag = BRI`,
independence/year/flags; the external evaluator additionally checks exact event
dates. A fresh profile avoids inheriting the user's saved campaign state.

**ACTION:** invoke the actual production scripted trigger in EU4; set the French
and preview flags; invoke it again; switch flags to autonomous while retaining
preview; invoke again; clear preview as locking does; invoke again. Flag effects
are fixture setup. Production trigger logic is neither copied nor replaced.

**EXPECTED STATE:** allowed initially; blocked in French preview; blocked in
autonomous preview; allowed after clearing preview; autonomous selection retained,
French and preview flags absent at the end. All 18 DLC checks must pass.

## Actual automation and evidence

No gameplay mouse actions, simulated keyboard input, console commands, or manual
session entry were used in the successful run. The pipeline staged the mod,
validated production and staged scripts, launched EU4 directly, established the
fresh session, executed native startup assertions, read `game.log`, evaluated
markers automatically, captured logs with the existing collector, and closed
the owned process. Steam had to be started beforehand; no login was automated.

Source HEAD: `05360179f0dc5ff27fcd9c7e09b365a47acc21ea`; production source was
unchanged. [result.json](evidence/result.json) preserves the staged file SHA-256
manifest, original verdict, nonce, arguments, launch configuration, and paths.
The actual game executable reported `EU4 v1.37.5.0 Inca` in
[game.log](evidence/game.log). Both [production](evidence/cwtools-production.json)
and [staged](evidence/cwtools-staged.json) CWTools completed with zero errors and
58 warnings (10 and 11 script/localisation files respectively).

Successful native run:

- Nonce `b4956d1d33a586d0`; owned EU4 PID `35384`.
- Started `2026-10-03T19:16:05.517Z`; report finished `19:17:35.195Z`.
- Launch arguments: `-debug -userdir=<isolated profile>/ -start_tag=BRI`.
- Exactly 26 markers: BEGIN, 24 successful assertions, END.
- Every assertion event reports `1444.11.11`.
- All required DLC verified by actual `has_dlc` conditions; game log also records
  their activation. The isolated `dlc_load.json` enables only `runtime_test.mod`.
- No relevant hook/production-trigger parse errors; staged hashes unchanged.
- Cleanup: `window-close`, with no forced termination on this run. An external
  process check afterward found no EU4 process.
- Collector run `20261003T191605506Z_3d70e9`, in its separate `brittany_runtime`
  namespace. Existing collector semantics and normal Brittany reports unchanged.

Selected raw engine output (full lines preserved in the linked game log):

```text
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 OK initial-allowed
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 OK french-preview-blocked
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 OK autonomous-preview-blocked
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 OK locked-allowed
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 OK final-flags
EVENT [1444.11.11]:EU4RT b4956d1d33a586d0 END preview-gate
```

There are 92 distinct unbaselined messages across the collector's error logs.
This is not an error-free game startup or proof of 92 mod regressions. Raw
[error.log](evidence/error.log) contains localisation hash collision notices;
[setup_error.log](evidence/setup_error.log) preserves the other findings.
The verdict is limited to the tested gate, and does not certify the whole mod.

The runner's evaluator was then tightened to verify running version and exact
event date. Four Node tests replayed this real transcript successfully and
rejected altered FAIL markers, missing/duplicate/stale/incomplete evidence, wrong
version and wrong date. Those are evaluator checks, not additional game runs.
The historical result file has not been rewritten to pretend the tighter checks
ran in the original process.

## Earlier attempts and exact boundaries

1. `20261003T185015199Z_57bd6632138799bc`: sandbox launch recognized `-userdir`
   and created logs there, but `system.log` reported failure to create the D3D
   device. No assertions; INCOMPLETE. Timeout cleanup needed force after the
   ordinary close request failed. This was a desktop execution restriction,
   not a failing production predicate.
2. `20261003T185315700Z_1730198eb303c47f`: native desktop launch initialized
   graphics and reported the actual game version, but an observed window title
   said `Steam is not running.` No assertions; INCOMPLETE. Timed cleanup again
   used force. A screenshot request timed out at app approval; no UI input was
   sent and no screenshot was used as assertion evidence.
3. Started the installed Steam client, without entering credentials. A preflight
   launch while an earlier owned test still existed was correctly refused.
4. Successful run above, once Steam was available. No manual gameplay step was
   necessary. A future Steam login requirement remains an operator boundary;
   do not automate authentication or call a launch blocked there PASS.

The shell's initial execution-policy restriction was handled with the existing
scripts under a process-local `-ExecutionPolicy Bypass`; no permanent policy was
changed. Direct game launch still requires graphics access: this is not headless.

## Mechanisms investigated

| Mechanism | Evidence / status |
|---|---|
| Direct `eu4.exe` launch | Verified; launcher bypassed, original playset untouched |
| `-userdir=<path>/` | Verified isolated logs/profile/mod configuration |
| `-start_tag=BRI` | Verified automatic initialized Brittany state at 1444.11.11 |
| `-debug` | Accepted in successful launch; whether required for `log` remains untested |
| `on_startup` test hook | Verified execution without commands or gameplay input; surrounding vanilla startup effects also appear in the game log |
| Country scripted triggers/flag effects | Verified with production trigger in both true and false states |
| `log` effect / `game.log` | Verified engine-written, nonce-qualified assertion evidence |
| Console `run`, `run_commands` | Candidates from documentation/executable strings; neither executed in this experiment; stdin/socket/IPC command delivery not established |
| Test events/decisions | Existing mod uses these; not needed or independently tested as automation hooks |
| `complete_mission` effect | Installed vanilla examples exist; reward execution and ordinary prerequisite enforcement unverified, so deliberately not used |
| Existing save fixtures | `Brittany1444_Baseline.eu4` inspected read-only as ZIP with `meta`, plaintext `gamestate`, `ai`; metadata says BRI, 1444.11.11, 1.37.5.0 and development mod. No fixture loaded in this experiment |
| Direct save loading | No verified launch argument; fresh native startup used instead |
| Other game-written files | Logs, profiling files and command logs exist; no state API or semantics established for them |
| Crashes/loading/timeouts | External owned-process monitoring and bounded cleanup verified; deliberate crash test not performed |

Console mechanisms were investigated as candidates, not promoted to supported
APIs. [Paradox's file-location reference](https://support.paradoxplaza.com/hc/en-us/articles/203089358-Europa-Universalis-IV-file-locations)
was consulted; local files and actual executions supply the behavioral evidence.

## Reproduce and next smallest step

With Steam available and no existing EU4 process, run from the project root:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./tools/run-eu4-test.ps1 -Test preview-gate
```

Run on the interactive Windows desktop, with the documented launcher preference.
If cold loading needs longer, use `-TimeoutSeconds 180`; never remove the bound.
Results and complete local snapshots remain under shared tools. If Steam needs
login, the user must establish that session and rerun. No production deployment
is necessary. Run `node --test tools/runtime-tests/evaluate.test.mjs` separately
to check evidence evaluation.

The next smallest step is a Steam preflight with a useful immediate blocked
result, followed by repeating this one native test. Extending to a real mission
completion should then investigate the native `run`/mission command semantics
experimentally, rather than assuming `complete_mission` exercises rewards.

## Playtest list: deliberately unresolved behavior

- **Actual mission completion gate** (`missions/Custom_Breton_Missions.txt`):
  satisfy every normal requirement of the first French/autonomous mission in a
  preview. Expect its completion UI unavailable; lock the branch and expect it
  available. Complete it naturally, inspect the intended reward and next mission
  prerequisite. Failure: available during preview, still unavailable after lock
  despite satisfied requirements, missing/wrong reward, or blocked next mission.
  Evidence here verifies only the named country predicate, not mission integration.
- **Selector/refresh/persistence** (`events/Custom_Breton_Events.txt`,
  `decisions/Custom_Breton_Decisions.txt`, mission file): the earlier user playtest
  is documented separately in `../brittany-diplomatic-selector.md`; this automated
  test did not exercise it. Reproduce from a fresh baseline, choose French preview,
  switch to autonomous, save/reload preview, then lock and save/reload again.
  Expect one branch, immediate refresh, intact shared prerequisites, persisted
  selection, and no review decision after locking. Failure: overlapping/stale
  branches, lost completions or flags, or review decision returning after reload.
- **Startup on saved games** (test-only `on_startup` hook): load a separately
  copied checkpoint with the staged hook and observe whether it executes again;
  do not overwrite the baseline. Rerunning destructive fixture setup on a saved
  campaign would invalidate that fixture. This runner always starts fresh and
  makes no promise about load-time hook semantics.
