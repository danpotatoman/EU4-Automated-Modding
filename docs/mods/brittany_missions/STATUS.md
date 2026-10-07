# Brittany Missions state

Owner: mod/brittany_missions
Last updated: 2026-10-07 (deployment reconciliation; no new game validation)

Retained results apply to their recorded builds and EU4 1.37.5.0 Inca (491d).
The 2026-10-05 publication validation records Brittany `all` PASS/0, four contracts,
one attempt and clean owned cleanup; source/staged CWTools 0 errors with 58/62 warnings.
These are LOGIC/EFFECT/WIRING regressions, not a whole tree or campaign PASS.
[Publication validation](../../PUBLICATION.md) preserves the later check context;
the detailed snapshot below remains dated 2026-10-03. Source bytes are protected
by the [Phase 1 provenance](../../testing/project-state-migration.json).

## Implemented

Brittany's mission content is described in [PROJECT.md](PROJECT.md).
Two conditional mission rewards now call `BRI_mission_effects.txt`; Nantes remains
inline and textiles calls the installed production-building helper. All six
diplomatic branch missions call the defined preview trigger. The original documentation bootstrap made no gameplay changes; this ownership migration also preserves production bytes.

## Verified, with bounded scope

| Area | Evidence-supported result | Limits |
| --- | --- | --- |
| Production static validation | Retained final CWTools report: complete, 11 files, **0 errors / 58 warnings**, CWTools 0.10.31, EU4 1.37.5.0 | Static acceptance; warnings still open |
| Required native suite | Retained 2026-10-03 clean `all`: four PASS, exit 0, nonce `e890bd4b714c6b1c`; snapshot reported all 11 production files matching its manifest | LOGIC/EFFECT/WIRING; `missionCompletionPass = false`; not freshly rerun here |
| Nantes real claim | Codex-operated `nantes-claim`: actual mission entry, normal reward dialog, saved completion once, both named permanent rewards once and immediate Textiles readiness; negative refusal and clean follow-up PASS | Bounded 1280x720/scale-1/top-scroll scenario; active Codex input runtime required; no new reload/numeric post-click probe |
| Preview predicate | Actual trigger allows absent preview and locked flags, blocks French/autonomous preview; six references checked statically | Fixtures set flags; no ready mission button tested automatically |
| Shipbuilding reward | Actual effect grants missing shipyard, preserves grand shipyard, observes cost/repair deltas and removal | Annual tradition, actual dispatch, tooltip, duration/persistence outside contract |
| Borders reward | Actual effect adds/removes +1 reputation and gives +50/+0 DIP without/with France alliance | Annual legitimacy, expiry, dispatch and persistence outside contract |
| Textiles helper | Actual installed helper demonstrates workshop -> counting house -> +2 production; correct province calls/parent wired | Empty-building fixture is a helper test, not mission readiness |
| Fault detection | Staged always-open preview, dock instead of shipyard and 49-DIP mutations pass CWTools but fail three native cases; textiles still passes | Demonstrates these contracts only; no production files faulted |
| Brittany calibration workload | Profile-root plain `.txt` execution via CRLF `run` batches and `-auto_run`; implicit BRI and explicit country/province scope; named test effect, vanilla stability helper; cloth value 0 -> 0.15 -> 0 | Other lookup paths/scopes, helper max-stability branch, expiry and save/load untested |

Primary retained sources: [final result](../../testing/runtime-regression-suite/evidence/final/result.json),
[production CWTools](../../testing/runtime-regression-suite/evidence/final/cwtools-production.json),
[suite report](../../testing/runtime-regression-suite/README.md),
[coverage manifest](testing/coverage.md), and
[calibration](../../testing/runtime-run-effects/README.md).
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
  to current-build end-to-end certification. [Manual record](testing/diplomatic-selector.md).
- **Native mission diagnostics:** fresh `mission bri_nantes_market`, scripted
  `complete_mission` and `mission_tree true BRI` independently save completed
  state without Nantes rewards; Textiles parent/UI changes. The console completion
  query remains false even when the native save records Nantes. This supersedes
  historical query-only inference of absent actual completion; original failed/
  incomplete verdicts remain preserved. These commands are not faithful claims.
  [Fresh diagnostics](../../testing/runtime-mission-claim/README.md#native-mechanisms).

## Known findings and unresolved behavior

- **One bounded automated end-to-end mission scenario:** Nantes's real claim is
  [verified](../../testing/runtime-mission-claim/README.md) through Codex-owned UI input.
  Its separate [manual reference](../../testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
  additionally verifies numeric deltas, once-only UI and reload. Other mission dispatch,
  exact rewards, persistence and expiry still need the linked
  [suite playtests](../../testing/runtime-regression-suite/README.md#playtest-list).
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


## Report freshness and deployment

The 2026-10-07 combined check at `tools/checks/reports/brittany_missions/latest.json`
is complete PASS/0: CWTools 0 errors/58 warnings, inspector 0 errors/6 warnings,
file/deployment checks clean. Older October 2 source failures and Phase 2B/2C
`modified-destination` failures retain their original verdicts.

The separately authorized [deployment repair](../../runtime/brittany-deployment-repair-2026-10-07.md)
proved a single missing final `0A` in the launcher; all old deployed content matched
its October 2 ownership record. Canonical descriptor bytes and that record agreed.
After guarded restoration, normal validated deployment refreshed the two reward
call sites and added the existing production effect file. Production source was
unchanged; no unknown/manual content edits were found, and the actor responsible for
newline loss remains unknown. The ordinary development destination now matches
current source/generated output and fresh ownership hashes. This is deployment
integrity evidence, with activation/gameplay UNVERIFIED; no native run or release
descriptor change occurred. Historical selector observations remain scoped to the
old deployed build.

Nantes's [manual reference](../../testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
also verifies numeric cloth deltas, once-only behavior and ordinary save/reload;
the [automated claim](../../testing/runtime-mission-claim/README.md) has narrower
post-click/reload evidence. Query FAILs remain retained, not reward-absence proof.
Remaining gameplay checks live in [coverage](testing/coverage.md) and
[roadmap](ROADMAP.md). Shared driver/lifecycle/calibration state lives in
[framework status](../../STATUS.md) and [runtime knowledge](../../runtime/README.md).

## Phase 2A runtime ownership validation (2026-10-06)

Unchanged production passed explicit Brittany all (four cases), Nantes click and
fresh unready refusal; the staged negative control retained three FAILs/Textiles
PASS, exit 1. Source/staged CWTools completed without errors. These are bounded
regression/input/save results, not broader dispatch/campaign certification.
[Framework handoff](../../runtime/phase2a-ownership-2026-10-06.md) records exact
run references, environment, integrity and compatibility. Prefer explicit native
-Mod selection in the [testing runbook](testing/README.md).
