# Nantes faithful readiness and completion investigation

Status: complete
Last updated: 2026-10-03
Owner: mod/brittany_missions
Affected mods: brittany_missions; shared save/probe findings
Documentation ownership updated: 2026-10-06
Current state: [canonical owner status](../../docs/mods/brittany_missions/STATUS.md)
Shared knowledge: [runtime index](../../docs/runtime/README.md)
Execution authorization: **granted by the user on 2026-10-03** for this plan's
bounded preparation, validation, test-only fixtures, evidence and documentation.
Conclusion: **faithful Nantes mission behavior verified** on the recorded unchanged
build/environment, including actual native save/reload. No operator action remains.
[Final report](../../docs/testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
records the per-dimension evidence and retained testing-mechanism failures.

## Goal

Investigate the existing production `bri_nantes_market` mission without changing
its design or balance. Establish separate evidence for actual readiness, ordinary
completion/reward dispatch, both cloth rewards, downstream Textiles readiness,
once-only behavior and save/reload persistence. Conclude either verified faithful
behavior, a demonstrated production defect, or unresolved production behavior
because the testing mechanism cannot establish it. Report partial findings by
dimension rather than forcing a whole-contract PASS.

The user initially authorized plan creation only, then explicitly authorized its
execution on 2026-10-03. This does not authorize production fixes or other roadmap
work. Ordinary choices within this scope may proceed
autonomously under [AGENTS.md](../../AGENTS.md) and [PLANS.md](../PLANS.md).

## Background / Context

Read [PROJECT](../../docs/PROJECT.md), [STATUS](../../docs/STATUS.md),
[ROADMAP](../../docs/ROADMAP.md), [DECISIONS](../../docs/DECISIONS.md) and
[TESTING](../../docs/TESTING.md). The roadmap identifies a faithful Nantes result
as the next investigation. Decisions D005/D006 require isolated, attributable
evidence and separation of effect coverage from end-to-end mission dispatch.
D007 preserves Nantes's inline reward; D008 favors fixed observations and constant
logs. Existing findings remain unchanged by this plan.

Production source establishes:

- Nantes is slot 2, row 1; BRI/non-random-map commerce series. Its trigger requires
  ownership of 172 and `has_trade_building_trigger = yes` there.
- Its inline reward applies `bri_demand_for_breton_cloth`, `duration = -1`, in both
  169 and 4384. The modifier specifies `trade_goods_size_modifier = 0.15`.
- `bri_breton_textiles` is slot 2, row 2. It requires Nantes completion plus
  ownership and production buildings in 169 and 4384. Membership or a true
  parent-completed query is not a readiness/button-refresh observation.

The [Nantes report and playtests](../../docs/testing/runtime-nantes-market/README.md#open-playtest-list)
already define the starting conditions and expected behavior. Raw evidence checked
while drafting this plan:

| Existing evidence | Result / boundary |
| --- | --- |
| [Ready diagnostic result](../../docs/testing/runtime-nantes-market/evidence/ready/result.json), [hook](../../docs/testing/runtime-nantes-market/evidence/ready/hook.txt), [log](../../docs/testing/runtime-nantes-market/evidence/ready/game.log); nonce `ba4aa821f0986042` | PARTIAL: `complete_mission` records Nantes/parent completion, both reward values zero, readiness/reward verification false |
| [Native-console result](../../docs/testing/runtime-nantes-market/evidence/native-console/result.json), [commands](../../docs/testing/runtime-nantes-market/evidence/native-console/eu4rt_run.commands), [log](../../docs/testing/runtime-nantes-market/evidence/native-console/game.log); nonce `d2e4c2808be44e94` | Candidate FAIL: `mission bri_nantes_market`, `savegame`, then working `.txt` observation; mission remains incomplete, reward values zero, no save; command response/reason unknown |
| [Value calibration](../../docs/testing/runtime-run-effects/evidence/value-calibration/result.json), [log](../../docs/testing/runtime-run-effects/evidence/value-calibration/game.log); nonce `c3f5819eb3166689` | Effect/value PASS: 0 -> 0.15 -> 0 apply/remove; permanent/finite named-presence queries false; no mission completion PASS |
| [Coverage manifest](../../docs/testing/runtime-coverage.md) | Four native logic/effect/wiring contracts pass; no automated END-TO-END mission completion coverage |

These are historical results, not new sessions. Their failures do not demonstrate
that ordinary production Nantes behavior is wrong.

## Requirements

- Keep production scripts/localisation, balance and installed vanilla unchanged.
  Preserve existing evidence/verdicts; add new evidence under `docs/testing/` only
  during authorized execution. Temporary setup/observation files and profiles
  belong under shared ignored tools, never source mod directories.
- Use [the default environment](../../docs/testing/environment.md): non-Ironman,
  only the tested mod and all 18 specified DLC. Confirm actual configuration and
  running version; previous evidence targets EU4 1.37.5.0 Inca (491d), not every
  version advertised by `1.37.*` descriptors.
- Identify/hash the tested source and deployed/staged copy. Do not rely on clean
  logs, static validation, operator outcome labels or old evidence as gameplay proof.
- Prefer the documented **user-performed ordinary mission-button workflow** as
  the faithful reference. The assistant prepares instructions and analyzes evidence;
  the user performs gameplay/reloads. Automation is not required for success.
- `complete_mission` is forbidden as the faithful success action. Do not manually
  apply/copy/invoke the cloth reward to manufacture mission success. Current native
  `mission` is a candidate only, not an accepted substitute. Any candidate comparison
  belongs in a separate checkpoint/session from the ordinary-button reference.
- Record readiness, dispatch, rewards, Textiles update, once-only behavior and
  persistence individually. Observe actual mission UI/readiness rather than equating
  fixture building checks or copied trigger evaluation with an engine readiness oracle.
- Record named-modifier queries as observations. False `has_province_modifier`
  alone cannot establish absence; use UI/native saved state and numerical changes.

## Non-goals

Nantes redesign/rebalancing, reward extraction, fixing a discovered production
defect, unrelated selectors/rewards/DLC variants, general UI automation, broad
runner refactoring, release certification, and resolution of the entire named-query
discrepancy. Textiles's reward dispatch is outside this plan; prove its readiness
and parent refresh without completing it in the main checkpoint chain.

## Relevant Files / Systems

- Production: `mod/brittany_missions/missions/Custom_Breton_Missions.txt`
  (`bri_nantes_market`, `bri_breton_textiles`),
  `common/event_modifiers/BRI_mission_modifiers.txt` and
  `localisation/english/bri_missions_l_english.yml` within that mod.
- Reusable guides: [native completion](../../docs/modding/native-mission-completion.md),
  [console files](../../docs/modding/console-run-effects.md),
  [native assertions](../../docs/modding/runtime-script-assertions.md).
- Scenario owner: `docs/testing/runtime-nantes-market/README.md` and its
  `evidence/ready/`, `evidence/native-console/`, `evidence/console-batch/`.
  Calibration owner: `docs/testing/runtime-run-effects/README.md` and evidence.
- Existing tools: `tools/deploy-mod.ps1`, `tools/test-run.ps1`,
  `tools/validate-cwtools.ps1`, `tools/run-eu4-test.ps1`;
  [deployment](../../tools/deployment/README.md),
  [collector](../../tools/test-runs/README.md),
  [runtime README](../../tools/runtime-tests/README.md).
- Configuration: `tools/deployment/config.json`, `tools/cwtools/config.json`;
  runtime staging/process/evaluation: `tools/runtime-tests/run.mjs`, `evaluate.mjs`,
  `nantes-market.on_actions.txt`, `run-effects.after.txt`, `*.test.mjs`.

## Implementation Plan

Execution is authorized; phase checkboxes and the handoff state below track actual
work. No historical result is promoted to a new gameplay pass.

### 1. Reconfirm scope, build and usable test route

Record authorization, source inventory, actual version/DLC/playset and operator
availability. Read guides before adapting a mechanism. Check current deployment
ownership; do not silently reconcile a changed descriptor or overwrite a baseline.
Review version/source changes against old evidence before carrying expectations forward.

Primary route: use the existing development deployment and manual scenario/log
workflow in TESTING.md. Keep fixture setup limited to the test campaign; preserve
pristine saves. If isolated console instrumentation is needed, stage unchanged
production in a new `-userdir` profile using the documented pattern. Such a route
needs an explicitly recorded, bounded interactive launch/cleanup procedure.

**Existing runner limitation:** `-Test nantes-market` installs a startup hook that
calls `complete_mission`; it is not a baseline for this plan. `-PrepareOnly` still
stages that hook. `run-effects` applies/removes the cloth modifier. None is a
ready-made hold-open manual test command. Do not launch those fixtures and treat
them as ordinary completion. A minimal new test-only setup/observation arrangement
may be prepared after authorization if necessary; document its pattern before
implementing it. Broad tool changes require separate scope authorization.

For manual deployed testing, these are existing command templates, not executed
by plan creation (close EU4 before deploying):

```powershell
./tools/validate-cwtools.ps1
./tools/deploy-mod.ps1
./tools/test-run.ps1 -Action begin -Scenario 'Nantes readiness, ordinary completion, rewards and persistence'
# User performs phases 2–6; close EU4 before finishing collection.
./tools/test-run.ps1 -Action finish -Outcome unverified -Notes 'Record per-dimension results and checkpoint/evidence references'
```

Use `passed`/`failed` only when justified for the stated scenario. Static or collection
failure is not production gameplay failure. For isolated logs, use the collector's
documented `-Untracked`/`-LogsDirectory` options and a separate test namespace;
retain independent staged hashes because untracked collection does not verify them.

### 2. Establish missing-requirement and ready states

Follow the existing Nantes playtest: fresh independent BRI on 1444.11.11, owns
172/169/4384; preview/French/autonomous flags absent; both missions present and
incomplete; no cloth reward already attached in either recipient province.
Establish absence using fresh state plus UI/save/value evidence, not just the
known unreliable ID query. Pause, record both provinces' numerical baselines.

Remove `marketplace`, `trade_depot` and `stock_exchange` in 172 as fixture setup,
as the retained hook does. Establish ordinary production buildings (e.g. workshops)
in 169/4384 before Nantes completion so Textiles's other requirements are satisfied.
Verify ownership/buildings and Textiles's remaining parent restriction in the UI.
Setup must never complete missions or apply their rewards.

Preserve a pristine scenario checkpoint. Proposed new labels, not existing saves:
`BRI_nantes_unready`, `BRI_nantes_ready`, `BRI_nantes_completed`.
Record actual save paths/hashes and dates in the run record.

Capture Nantes unavailable with the missing trade building, then add/observe
`marketplace` in 172 and capture actual ready button/tooltip with mission still
incomplete. Record immediate refresh; if necessary separately record panel reopen
and a real one-day advance. Delayed readiness is a finding, not an immediate pass.
Failure signs: missing mission, ready before setup, unavailable after satisfying
requirements. First rule out wrong build/profile/state before attributing a defect.

### 3. Prove ordinary completion and cloth reward dispatch

From the ready checkpoint, capture the user clicking the actual Nantes completion
button. Record action, before/after date/state and observations. Expect recorded
completion and real reward in **both** 169 and 4384; flags remain unchanged.
Verify completion using UI and, where available, native state queries/save evidence.

Independently observe the named cloth modifier and permanent duration in each
province's UI/native save, plus its +0.15 goods-produced modifier contribution.
With verified zero baseline, the existing numerical classification is
`[0.15, 0.151)`; zero is `[0, 0.001)`. If other contributions exist, isolate their
sources and use the fixed +0.15 before/after contribution/delta rather than assuming
the total equals 0.15. Do not infer this percentage from absolute goods production.
Capture UI/save evidence even if the ID query returns false.

Observation scripts may export variables/log constant markers but must not grant,
remove or reapply cloth rewards in this checkpoint chain. The calibration's
`eu4rt_after.txt` is destructive and cannot be reused unchanged. If using numeric
logs, employ documented 0.001 intervals and actual checkpoint dates, not dynamic
`GetValue` logs or the existing evaluator's hardcoded 1444.11.11 for later dates.
Unproven post-click observation dispatch is a mechanism gap, not a missing reward.

Failure signs: button action not registered, completion without either reward,
wrong value/duration or changed selector flags. Retain evidence before retries;
do not repair the state to produce a pass.

### 4. Prove Textiles readiness/update and once-only behavior

Keep Textiles incomplete. With ownership and production buildings already satisfied,
compare its parent lock before Nantes completion with its actual ready state after.
Record immediate update, then any separate reopen/day-advance observations. Do not
force a tree swap/parent completion or call the textiles reward as a substitute.
Failure: parent remains blocked or no ready action despite all requirements satisfied.

Verify Nantes remains completed and exposes no second ordinary completion action;
record that reward entries/values remain unchanged while reopening the panel.
Do not use the native toggle or forced scripted completion to test ordinary
once-only behavior. Unavailable second UI action establishes the ordinary path;
unchanged numerical value alone cannot exclude a regrant/replacement of the same
modifier. Record UI/state evidence for that distinction.

### 5. Prove save/reload persistence

After faithful completion evidence, create a separately named native checkpoint,
record its actual artifact/path/hash, close EU4, and ask the user to reload it with
the same build/DLC. Preserve both earlier checkpoints. Verify Nantes completed,
both permanent cloth rewards/contributions retained, selector flags unchanged,
Textiles still incomplete/ready with parent cleared, and no second Nantes action.

Do not reuse destructive startup setup on reload: saved-game hook behavior is
unverified. Observe actual restored state before any setup/probe mutation.
Native save schema must be inspected, not assumed. A `savegame` line with no save
artifact or an attempted reload that never loaded that artifact is insufficient.
Failure signs: lost completion/reward, finite expiry replacing permanent duration,
changed flags, restored parent lock or repeatable Nantes completion. If no valid
save/reload can be observed, mark persistence unresolved, not verified.

### 6. Classify, reproduce meaningful failures and close the investigation

Maintain a per-dimension matrix: readiness, ordinary action/dispatch, each province's
reward ID/value/duration, Textiles readiness/refresh, once-only and persistence.
Each row gets verified, demonstrated wrong, unresolved or not performed, with
build/checkpoint/action/evidence and failure attribution.

For a suspected production failure, reproduce on a fresh comparable checkpoint
with unchanged source and validated observation route; preserve the first failure.
Distinguish wrong setup/stale deployment, parsing/graphics/Steam/crash/timeout,
missing evidence, unreliable queries and command dispatch failures from an
ordinary gameplay contradiction. Do not retry or weaken assertions into a PASS.

Only if useful and within authorized execution scope, compare native `mission`
on a **separate** ready checkpoint after establishing the ordinary-button reference.
Capture the exact native console response, context/date and independent state/
reward observations. A working subsequent `run` is only a dispatch control.
No substitution is valid without demonstrating equivalent readiness enforcement,
actual rewards and once-only behavior; state toggling is not equivalence. If the
command fails but manual behavior succeeds, report production verified and native
mechanism unestablished. Automation equivalence is not required to finish this plan.

Write a dated result record and new portable evidence under
`docs/testing/runtime-nantes-market/`, referencing source hashes/checkpoints and
raw artifacts. Update the scenario/coverage and relevant STATUS/TESTING/modding
guide with only demonstrated findings; adjust the existing roadmap item's status
without adding scope. Retain old raw evidence/verdicts. Record new durable decisions
only if made; do not invent design rationale. Then apply the completion criteria.

## Progress

- [x] Planning only: read durable context, production definitions and existing evidence.
- [x] Draft this execution plan and add it to the plan index.
- [x] Obtain and record authorization to execute.
- [x] Prepare precise operator readiness actions; autonomous setup complete.
- [x] Verify source/staged identity, native initial setup, actual version and all 18 DLC.
- [x] Receive operator UI readiness observations and native checkpoint saves.
- [x] Observe missing-requirement -> ready transition in the mission UI.
- [x] Observe ordinary completion and both actual permanent cloth rewards.
- [x] Observe Textiles readiness/update immediately after Nantes.
- [x] Explicitly confirm no second ordinary Nantes action on reload (completed node retained on panel reopen already reported).
- [x] Observe actual save/reload persistence.
- [x] Classify results, reproduce attributable failures and publish durable findings.
- [x] Mark execution complete under the criteria below.

## Discoveries

2026-10-03 planning review confirms the historical limits in Background / Context.
No new gameplay finding exists. In particular, current diagnostic hooks perform
state-only completion or modifier calibration and would contaminate a faithful
reference. Existing bounded runner shutdown is not a manual hold-open feature.

Unsupported assumptions to validate during execution: a chosen interactive fixture/
observation route can observe all checkpoints without mutating rewards; UI/native
save exposes reward identity/permanence sufficiently; any new post-click run-file
dispatch works in that session. No exact save schema, direct-save launch option,
default-profile console-file lookup or native readiness API is assumed supported.
Proposed checkpoint labels and test ordering are organizational choices, not
existing artifacts or gameplay findings.

2026-10-03 execution: operator observed Nantes unavailable for the missing trade
building, then ready immediately after `run nantes_ready.txt`; no unpause, panel
refresh or day advance, still 1444.11.11. Cloth for Sail remained parent-locked
before/after. Actual compressed native saves now exist for both checkpoints.
Their plain-text `meta`/`gamestate` entries corroborate paused BRI, same campaign,
only the isolated mod, workshops in 169/4384 and marketplace absent/present in
172 respectively. Both cloth IDs absent from full recipient province blocks;
baseline/exported variables 0.000. Commerce series saved; mission IDs and selector
flags absent from BRI block, consistent with native incomplete checks. Saved-state
absence is not a readiness oracle. Eight ordered ready markers all match the
nonce/date/expected results. Source, staged and console hashes unchanged.
Save metadata lists all 18 specified DLC plus Art of War, Common Sense and Rights
of Man (21 names); the initial native checks covered the specified 18. No wider
compatibility conclusion. Portable evidence and hashes are in
`docs/testing/runtime-nantes-market/evidence/manual-868e7002f5332b98/readiness-check.json`.
At that readiness checkpoint, ordinary completion/rewards/downstream readiness
and persistence were still unperformed. The subsequent findings below supersede
that pending state without altering the initial evidence.

2026-10-03 ordinary completion: operator clicked the actual Nantes button,
reported immediate Cloth for Sail readiness, permanent +15% local goods produced
tooltips in both provinces, Nantes retained completed after panel reopen, still
1444.11.11, completed save and normal exit. Actual `BRI_nantes_completed.eu4`
SHA-256 `90117609cc7b7492e80a3b9056650f4e1d6ac3b40114775bd1fe5170fc428582`
retained under session `checkpoints/completed/`. Native saved BRI has
`completed_missions = { "bri_nantes_market" }`, Textiles absent from completion
list, unchanged selector flags/buildings. Both province blocks have exactly one
`modifier="bri_demand_for_breton_cloth"`, `date=-1.1.1`, exports/deltas 0.150
against 0.000 baseline. Native observer dispatched all 11 ordered markers at the
same nonce/date: six positive assertions, two false named-query observations,
BEGIN/END and **FAIL completed-nantes-completed**. Keep the observer FAIL; its
`mission_completed` query contradicts actual UI/native saved completion. This is
an unresolved observation-mechanism discrepancy, not a demonstrated production
failure; cause not established. Reload uses the unchanged observer to record
whether the discrepancy persists. No assertion weakened, production repaired,
reward copied or command substituted. Portable `completed-check.json`, raw logs,
save excerpts and `operator-completed.txt` retain this evidence.

2026-10-03 reload: operator collectively confirmed every requested restored state,
including completed Nantes/no second action, incomplete/ready Cloth for Sail and
both permanent +15% rewards, no refresh, still 1444.11.11, successful save/exit.
New save explicitly names `BRI_nantes_completed.eu4` as loaded source; relevant
mission/province/flag/building state matches the preserved predecessor. New observer
exports/deltas remain 0.150. Its completion query still FAILs, named queries false.
The reader initially assumed stable `campaign_id` and failed; actual UUID changed.
Retained this failure and corrected provenance checks to exact loaded filename,
unchanged predecessor hashes, version and relevant native state, without changing
native gameplay/probe assertions. No general campaign-ID behavior is inferred.
Final report holds raw evidence and hashes; no attributable ordinary gameplay
contradiction requires production reproduction or repair.

## Decisions

Authorized execution choices: manual button reference first; production bytes unchanged;
Textiles buildings established early to isolate its parent; separate native-command
comparison only if useful; no copied reward or destructive calibration in the main
chain. These follow the roadmap/default manual workflow and decisions D005–D008.
Execution authorization is recorded at the top; these choices do not expand it.
No new gameplay design decision is required.

2026-10-03: the normal development destination is outdated and its launcher
descriptor hash differs from the recorded deployment. Preserve it; use a fresh
isolated manual copy rather than modify the ownership record or deployment tool.
This is the plan's bounded isolated-fixture route, with the ordinary button still
the reference action. Documented before implementation in
`docs/modding/ordinary-mission-button-fixtures.md`; dedicated preparer is
`tools/runtime-tests/prepare-nantes-manual.mjs`. The original runner is unchanged.

## Current execution state / handoff

Execution is complete; no operator dependency remains. Result owner:
[final manual report](../../docs/testing/runtime-nantes-market/faithful-completion-2026-10-03.md).
All required dimensions verified; no production defect demonstrated. Console
completion/presence probe FAILs remain failures with unresolved mechanism cause.
No native `mission` comparison was needed or performed; automation remains unestablished.

Session `tools/runtime-tests/work/nantes-manual-20261003T222727038Z-868e7002f5332b98/`,
nonce `868e7002f5332b98`. Four actual native saves preserved/hash-checked; portable
meta/BRI/province excerpts, logs, manifests, readers and operator reports under
`docs/testing/runtime-nantes-market/evidence/manual-868e7002f5332b98/`.
The final report supplies all paths/hashes and action provenance. Generated
`launch.ps1 -Reload` used only debug/userdir, no setup/start-tag/auto_run; native
reload log confirms no setup reran. User loaded `BRI_nantes_completed`, restored
all requested states at 1444.11.11 without refresh, ran the reload observer, saved
`BRI_nantes_reloaded`, exited normally. Both game/watchdog pairs are absent.

Collector `brittany_nantes_manual`: first run `20261003T223050435Z_8f94eb` finished
unverified while persistence was pending; reload `20261003T225952773Z_8db3e6`
finished passed for the manual persistence scenario. Raw reports retain
unbaselined errors, not attributed to gameplay. No active collector remains.
All 11 source/staged production hashes and console files unchanged through final
inspection; normal launcher configuration still matches preparation. The older
normal development deployment/descriptor mismatch was preserved.

Continue only separately authorized work. The unresolved query/automation and
other mission/deployment playtests remain linked in the final report and roadmap;
completion of this plan does not authorize their execution.

## Validation

Planning-only validation: check plan format, local links/anchors, contradictions,
whitespace and that only this plan plus its index changed. No game/static runner,
deployment, evidence replay or EU4 session is required to create the plan.

Planning checks completed 2026-10-03: all 12 standard sections present; 28 local
links/anchors across plan and index resolve; whitespace/conflict checks and
`git diff --check` pass. Hash comparison of 282 pre-existing source/docs/evidence
files shows only `.agent/PLANS.md` changed; this plan is the sole new file.
No execution phase, static/game runner, deployment or evidence replay was run.

Future validation after authorization:

- Before runtime, use existing CWTools and inspect completed reports; if adding
  test-only scripts, validate the full staged project via
  `./tools/validate-cwtools.ps1 -Project <staged-directory>` as well. Record
  warnings/error limits; static acceptance is not readiness or dispatch evidence.
- If shared runtime tooling changes, run existing
  `node --test tools/runtime-tests/*.test.mjs` and the required
  `./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150` regression under the
  documented environment. They retain effect/wiring scope; no automatic mission PASS.
- Old `./tools/run-eu4-test.ps1 -Test nantes-market -TimeoutSeconds 150` may reproduce
  its state-only diagnostic, but is not necessary for the primary manual result
  and cannot satisfy this plan's success criteria. `run-effects` likewise remains
  an optional separate calibration, never a substitute reward action.
- Preserve production/staged/deployed before/after hashes, actual version/DLC,
  logs, UI observations and native checkpoint artifacts. Set any new automated
  assertions' nonce/date/version to the recorded scenario, rather than relabeling
  stale logs. New assertions must detect genuine state failure and missing evidence.

Execution validation completed: production/staged CWTools exit 0 (0 errors,
58/66 warnings), 17 existing tool tests and four-case native regression PASS within
logic/effect/wiring scope, syntax/593-node fixture audit accepted. Readiness and
completion/reload readers verify source/staged/console identities and actual native
artifacts. Raw console completion FAILs remain retained; UI/save/manual verdict is
separate. Final local-link/anchor, whitespace/conflict and diff checks passed.
No extra production change or EU4 session was needed after operator reload results.

## Remaining Issues / Follow-up

No required Nantes manual dimension or operator step remains open. Completion-query
and named-modifier-query failures persist after reload despite independent UI/save/
value proof; mechanism cause remains unestablished. The native `mission` command is
still unverified. Their raw FAILs and smallest follow-up comparisons are retained in
[the final playtest list](../../docs/testing/runtime-nantes-market/faithful-completion-2026-10-03.md#remaining-playtest-list).
No production fix or broader tooling work is authorized by closing this plan.
Textiles reward dispatch, other missions, balance, ordinary deployment reconciliation
and export readiness remain outside this investigation. Existing roadmap scope is
unchanged except marking the Nantes manual evidence gap resolved.

## Completion Criteria

Plan creation is delivered and execution is authorized. To complete the
investigation, preserve an attributable result matrix and durable report supporting
one of these conclusions:

| Conclusion | Required evidence |
| --- | --- |
| **Faithful Nantes mission behavior verified** | Missing-building unavailability and marketplace-ready UI observed; ordinary button completion recorded; actual named permanent cloth reward and +0.15 contribution observed independently in **both** provinces; Textiles's other conditions satisfied before action and its parent lock clears to actual readiness; Nantes has no second ordinary action; verified native save/reload retains these states and unchanged flags. All required dimensions verified on the recorded unchanged build/environment; native automation may remain unestablished. |
| **Production behavior demonstrably wrong** | At least one required contract contradicts the production expectation in the actual ordinary gameplay path, with source/environment/setup/action and observation reliability established; reproduced from a comparable independent checkpoint and raw evidence retained. Identify the precise wrong dimension and mark others verified/unresolved/not performed. Unsupported command failures or a false presence query alone never qualify. No fix is required to complete this investigation. |
| **Production behavior unresolved because testing mechanism insufficient** | Record the exact missing proof (readiness/action, either reward, downstream update, once-only or persistence), mechanism/observation attempts and blockers. No attributable ordinary-gameplay contradiction establishes a defect and at least one required dimension lacks reliable evidence. Preserve partial verified facts, do not call state-only completion/full effect calibration faithful success, and state the smallest next test/user action needed. |

A successful ordinary completion with untested persistence is a partial result,
not the full verified conclusion. If a demonstrated production defect coexists
with unresolved dimensions, use the defect conclusion and retain those gaps.
Do not mark complete merely because authorization/operator availability is pending
or a first startup attempt fails; use blocked with the next action while meaningful
work is pending. A documented mechanism-insufficiency conclusion may close a bounded
authorized investigation only after explaining why available in-scope routes cannot
supply the missing proof. In all conclusions propagate durable findings, retain
open playtests and verify that production bytes remain unchanged before marking
this plan complete. None of these conclusions certifies whole-mod export readiness.

Applied conclusion, 2026-10-03: **faithful Nantes mission behavior verified**.
All required rows satisfied through operator UI/native saves/new numerical probes,
including once-only ordinary action and persistence. Durable report, scenario,
coverage, testing/mechanism guides, STATUS and roadmap updated; production hashes
unchanged. Query FAILs preserved separately; no design decision, production fix,
other roadmap work or export-readiness claim follows from this completion.

Phase 1 added owner/current-source navigation only. Execution dates, authorizations,
observations and verdicts above remain historical and do not authorize new work.
