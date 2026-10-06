# Current state

Publication preparation (2026-10-05) preserves all 20 production files and active
development. Fresh Brittany `all` PASS/0: four contracts, one attempt, clean owned
cleanup; source/staged CWTools 0 errors with 58/62 warnings. USA source CWTools
0 errors/0 warnings. Offline 53 Node tests plus four tool self-tests and both real
Windows adapter tests passed. Public candidates have sanitized provenance and no
known scanner findings; original Git history is preserved in an ignored private
archive, and the active repository has fresh Git metadata and a staged-byte commit hook.
See [publication audit, licensing and validation](PUBLICATION.md),
[snapshot review](publication-snapshot.md) and [hygiene policy](REPOSITORY_HYGIENE.md).
No commit, remote or push was made. Existing gameplay/driver limits remain open.

American Century was added on 2026-10-04. Its [bounded slice results and open
playtests](testing/american-century/README.md) are maintained separately. The
Brittany snapshot below remains historical; USA work preserves its production
bytes and uses the shared isolated runner.
USA's first slice contains nine USA and three colonial missions, two preparation
decisions and a constitutional choice. Four USA real-button claims, a separate
negative readiness/refusal, numerical rewards and ordinary save/reload pass;
51 shared Node tests and all four Brittany native regressions pass. The full
55-USA-mission design, natural colonial campaign, alternate choice and remaining
slice roots are open. Native DLC activation was 21 including the required 18.

Snapshot: **2026-10-03**, based on the working tree and retained evidence, not just
committed HEAD, including the later Nantes automation and lifecycle follow-ups.
The original documentation bootstrap changed no gameplay content. Future sessions must reassess source/environment
freshness before reusing a result.

## Implemented

Brittany's mission content and shared tools are described in [PROJECT.md](PROJECT.md).
Two conditional mission rewards now call `BRI_mission_effects.txt`; Nantes remains
inline and textiles calls the installed production-building helper. All six
diplomatic branch missions call the defined preview trigger. Existing production
content and much runtime infrastructure were already modified/untracked when this
bootstrap began; no commit or deployment was made by this pass.

## Verified, with bounded scope

| Area | Evidence-supported result | Limits |
| --- | --- | --- |
| Production static validation | Retained final CWTools report: complete, 11 files, **0 errors / 58 warnings**, CWTools 0.10.31, EU4 1.37.5.0 | Static acceptance; warnings still open |
| Required native suite | Latest clean `all`: four PASS, exit 0, nonce `e890bd4b714c6b1c`, 2026-10-03; all 11 current production bytes match its manifest | LOGIC/EFFECT/WIRING; `missionCompletionPass = false` |
| Nantes real claim | Codex-operated `nantes-claim`: actual mission entry, normal reward dialog, saved completion once, both named permanent rewards once and immediate Textiles readiness; negative refusal and clean follow-up PASS | Bounded 1280x720/scale-1/top-scroll scenario; active Codex input runtime required; no new reload/numeric post-click probe |
| Preview predicate | Actual trigger allows absent preview and locked flags, blocks French/autonomous preview; six references checked statically | Fixtures set flags; no ready mission button tested automatically |
| Shipbuilding reward | Actual effect grants missing shipyard, preserves grand shipyard, observes cost/repair deltas and removal | Annual tradition, actual dispatch, tooltip, duration/persistence outside contract |
| Borders reward | Actual effect adds/removes +1 reputation and gives +50/+0 DIP without/with France alliance | Annual legitimacy, expiry, dispatch and persistence outside contract |
| Textiles helper | Actual installed helper demonstrates workshop -> counting house -> +2 production; correct province calls/parent wired | Empty-building fixture is a helper test, not mission readiness |
| Fault detection | Staged always-open preview, dock instead of shipyard and 49-DIP mutations pass CWTools but fail three native cases; textiles still passes | Demonstrates these contracts only; no production files faulted |
| Console effects/calibration | Profile-root plain `.txt` execution via CRLF `run` batches and `-auto_run`; implicit BRI and explicit country/province scope; named test effect, vanilla stability helper; cloth value 0 -> 0.15 -> 0 | Other lookup paths/scopes, helper max-stability branch, expiry and save/load untested |

Primary retained sources: [final result](testing/runtime-regression-suite/evidence/final/result.json),
[production CWTools](testing/runtime-regression-suite/evidence/final/cwtools-production.json),
[suite report](testing/runtime-regression-suite/README.md),
[coverage manifest](testing/runtime-coverage.md), and
[calibration](testing/runtime-run-effects/README.md).
Baseline, after-extraction and final native passes plus full ordered AST expansion
identity support reward-extraction equivalence within the recorded scope.

## Partially verified

- **Selector gameplay:** the user reported checks 1–9 passed on 2026-10-02,
  source commit `0cc4d3a`: natural entry, immediate refresh, mutual exclusion,
  repeated switches, preview/locked save-reload and review decision removal.
  Post-lock completions/rewards appeared correct. Exact reward quantities/mission
  IDs, an all-other-requirements-satisfied preview gate test, actual version/DLC
  confirmation and baseline-save path were not recorded. A launcher-descriptor
  newline change makes strict deployment evidence problematic. These observations
  remain valid as user reports for that scenario; do not erase them or promote them
  to current-build end-to-end certification. [Manual record](testing/brittany-diplomatic-selector.md).
- **Native mission diagnostics:** fresh `mission bri_nantes_market`, scripted
  `complete_mission` and `mission_tree true BRI` independently save completed
  state without Nantes rewards; Textiles parent/UI changes. The console completion
  query remains false even when the native save records Nantes. This supersedes
  historical query-only inference of absent actual completion; original failed/
  incomplete verdicts remain preserved. These commands are not faithful claims.
  [Fresh diagnostics](testing/runtime-mission-claim/README.md#native-mechanisms).

## Known findings and unresolved behavior

- **One bounded automated end-to-end mission scenario:** Nantes's real claim is
  [verified](testing/runtime-mission-claim/README.md) through Codex-owned UI input.
  Its separate [manual reference](testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
  additionally verifies numeric deltas, once-only UI and reload. Other mission dispatch,
  exact rewards, persistence and expiry still need the linked
  [suite playtests](testing/runtime-regression-suite/README.md#playtest-list).
- Cloth `has_province_modifier` queries return false despite positive calibrated
  values, for permanent/365-day application and a separate console dispatch.
  Failed strict-presence probes remain FAIL. Cause is unresolved; presence alone
  is not a reliable absence oracle in those contexts.
- CWTools warnings concern `desc_<modifier>` localisation and `BRI_ARTILLERY_DEMAND`;
  `_desc` keys already exist for many modifiers. Review rules/vanilla/UI before
  deciding which warnings are false positives or content omissions.
- Six duplicate English keys are evidenced by source and the older layout report:
  three selector tooltip keys, `bri_metropole_1`, and two French mission descriptions.
  This pass does not decide their correct text or alter localisation.
- Metropole tier activation/European threshold/later exemption, constitutional
  reform effects, fortress choices, iron-price event, colonial chains, most other
  rewards and AI behavior have no quantified verification recovered here.
- General game-log errors remain unbaselined; do not label them mod regressions.
  There is no evidence-backed claim that production gameplay is generally broken,
  nor a whole-mod export-readiness result. Source descriptors are absent;
  generated development descriptors exist as a tool capability.

## Testing infrastructure and evidence conflicts

The four-case native suite is demonstrated for targeted regressions. Nantes and
`run-effects` are separate diagnostics/calibration, excluded from `all`; comparison
adapters and negative controls are test-only. Evidence replays test evaluators,
not another game session. Graphics/Steam/startup remain environment dependencies.
Native lifecycle recovery now has the bounded evidence below. See [TESTING.md](TESTING.md).

At inspection, ignored `tools/checks/reports/brittany_missions/latest.json` was
**failed**, finished `2026-10-02T03:28:47.210Z` (October 1 in Los Angeles): six
undefined-preview-trigger errors, six duplicate-localisation warnings, no layout
errors. Later definition/source and complete zero-error CWTools evidence supersede
that old trigger finding; the combined check has **not** been rerun by this pass.
Do not describe its old failed report as a current combined pass.

Historical experiment prose is date-scoped: the early preview report's console
candidates and the calibration report's then-absent custom effects are superseded
by later work. New navigation notes link them to current coverage. Raw reports
and logs retain their original verdicts. [ROADMAP.md](ROADMAP.md) keeps open work;
[DECISIONS.md](DECISIONS.md) records evidence-handling choices.

Bootstrap checks: all 17 existing evaluator/wiring/evidence tests passed; local
Markdown links/anchors and whitespace checks passed. A before/after hash inventory
confirmed no changes to production, tools/tests/configuration or raw evidence.
See the [completed bootstrap plan](../.agent/plans/2026-10-03-documentation-bootstrap.md)
for the commands and scope. These are documentation/evidence checks, not new
CWTools or native-game results.

Authorized Nantes followup is complete: [faithful ordinary behavior verified](testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
on the unchanged recorded build. Missing-building unavailability -> marketplace-ready,
actual Nantes click, both named permanent +0.15 cloth contributions, immediate
Cloth for Sail readiness, no second ordinary action and real save/reload all verified.
Four native checkpoints and operator UI reports retained; no refresh/day advance
needed, all at 1444.11.11. No production gameplay defect demonstrated.
Production/staged CWTools and the four-case native regression passed within their
scopes; production bytes unchanged. Console `mission_completed` and modifier-ID
queries remain false despite UI/native saved state, including after reload; raw
probe FAILs remain retained as unresolved mechanism discrepancies. Save reader's
unsupported campaign-UUID assumption was corrected using explicit load provenance
and predecessor/state checks; initial failure preserved. Automated mission completion
was unestablished at that manual handoff; the subsequent bounded proof is below.
Normal development deployment's older content/descriptor
mismatch was preserved; that separate roadmap work did not begin.

## Native lifecycle recovery (2026-10-03)

The existing automatic runner now uses owned lifecycle/Windows process components,
fresh attempt profiles, total and post-marker stall limits, verified descendant/
reporter cleanup, stale ownership recovery and one retry by default (maximum two
configured retries). Assertion/integrity failures and failed cleanup stop; no
production content changed. The separate manual Nantes launcher is outside scope.

Existing 17 tests passed before editing; final 35 lifecycle/evaluator/wiring/evidence
tests and collector Node/PowerShell checks passed afterward. Three portable replays
verify the linked raw recovery results. Actual isolated `all` exercises verified
controlled child termination -> cleanup -> fresh retry/four PASS, and native
`CrashReporter.SimulateCrash` -> actual Paradox Crash Reporter -> forced reporter
cleanup -> fresh retry/four PASS. A separate clean final `all` passed, exit 0,
103.47 seconds total/47.88 native. Post-run inspection found zero EU4/reporter/WER
processes and no lifecycle lock. Production/staged CWTools completed with
0 errors/58 and 62 warnings; production bytes match the clean staged manifest.

[Recovery report, evidence and playtest list](testing/runtime-recovery/README.md)
record commands, actual process identities, retained diagnostics and limits.
Actual EU4 freeze after BEGIN is now verified by the narrow follow-up below;
unusual dialogs without observable ownership remain open. Dummy hang/progress/
cleanup and PID-reuse/retry paths are tested.
Steam authentication, graphics access and denied termination may still require
operator repair. This establishes unattended recovery for the exercised native
crash/exit paths, not automated ordinary mission completion or release readiness.

### Real after-BEGIN freeze follow-up (2026-10-03)

The disabled first-attempt diagnostic was added within the existing adapter/runner;
no lifecycle redesign or production change. The first attempt withheld auto_run
dispatch to expose unchanged startup BEGINs, then NtSuspendProcess froze only
identity-verified EU4 PID 30308 (72/72 threads suspended). Existing progress timeout
15s classified progress-timeout at 15.226s idle despite 21 labeled synthetic general
log lines (13.892s after actual suspension). Force cleanup succeeded before fresh
attempt 2 PID 4136 launched with the original batch; all four contracts passed.
Separate clean `all` PID 17520 passed in one attempt, exit 0 (102.88s total/47.59s
native). Both inventories found no game/reporting/harness processes, lock or active
collector; Steam identity unchanged. Protected production and ordinary settings/DLC
hashes unchanged. Both production/staged CWTools completed, zero errors/58 and 62
warnings. Final 38 automated tests include a real dummy suspension test and two
new native evidence replays. No lifecycle bug was exposed.

[Exact procedure, markers, timing and raw evidence](testing/runtime-recovery/README.md#real-after-begin-freeze-validation)
close playtest item 3 for this controlled suspension; unusual unidentifiable dialogs
remain open. This does not extend mission gameplay or version compatibility evidence.

## Faithful mission automation (2026-10-03)

The authorized investigation is complete. Native commands only manipulate
completion state in the fresh Nantes cases. No faithful non-UI command was found;
keyboard input through the available adapter did not respond and accessibility
exposed no mission controls. GUI-derived pointer input through the supported
Codex adapter exercised the real Nantes entry without human mouse operation.

Faithful nonce `1b769f9bb0df6959` PASS/0: before-save incomplete/unrewarded,
ready UI, one owned mission action, normal +15% permanent reward dialog,
after-save Nantes once/Textiles incomplete and both named modifiers once with
expiry -1.1.1. Textiles immediately became ready. Negative nonce
`da1fcc49d001d89a` PASS/0: no trade building, explicit refusal/no claim input,
both saves incomplete/unrewarded. Independent clean `all` PASS/0, one attempt;
46 automated tests passed. Final inventory has no game/reporter/WER/runner,
lock or active collector; 14 protected production/ordinary-profile hashes match.
Production/staged CWTools zero errors/58 and 62 warnings; production unchanged.

This requires an active Codex driver and supports one verified window geometry/
tree/top-scroll state. It is not a standalone scheduled UI runner or general bot.
Post-click numeric console observation/reload were not repeated. The final abort
wrapper is unit-tested; native UI-stage crash/locked-desktop extensions remain open.
[Report, changed files, raw evidence and playtest list](testing/runtime-mission-claim/README.md)
record all findings and pilot incomplete results without promoting them to PASS.
