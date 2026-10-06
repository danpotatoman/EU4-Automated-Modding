# Nantes faithful completion: manual verification

**Faithful Nantes mission behavior verified**, 2026-10-03, on the recorded
unchanged Brittany build with EU4 1.37.5.0 Inca. All required dimensions of the
[authorized plan](../../../.agent/plans/2026-10-03-nantes-faithful-completion.md)
are verified by operator UI observations, actual native saves and numerical
observations. [Structured result](evidence/manual-868e7002f5332b98/result.json)
records the manual verdict separately from probe failures. No attributable
production defect was demonstrated. Production
scripts/localisation, balance and installed vanilla were unchanged.

This is a manual end-to-end result for this scenario. It does not establish
automated mission completion, Textiles reward dispatch, other missions or export
readiness. Historical diagnostic PARTIAL/FAIL evidence remains unchanged.

## Build and environment

Nonce `868e7002f5332b98`. The
[preparation manifest](evidence/manual-868e7002f5332b98/preparation.json) contains
all 11 source production paths/SHA-256s, identical staged copies, generated
descriptor/non-invoked static wrapper hashes and console-file hashes. All remained
unchanged through reload. The normal development copy was outdated with a
descriptor mismatch and was preserved; testing used a fresh isolated production
copy under shared ignored tools.

Session root:
`tools/runtime-tests/work/nantes-manual-20261003T222727038Z-868e7002f5332b98/`.
Only `mod/nantes_manual.mod` enabled in its profile, no disabled DLC, non-Ironman
BRI. Initial native assertions verified all 18 default DLC. Save metadata lists
these plus Art of War, Common Sense and Rights of Man (21 names); reload native
logs independently report all specified 18 enabled. Actual game logs report
EU4 1.37.5.0 Inca; installed metadata reports checksum 491d. No broader version/
DLC compatibility claim. Ordinary profile and deployment were not overwritten.

Source mechanic: `mod/brittany_missions/missions/Custom_Breton_Missions.txt`,
`bri_nantes_market` and `bri_breton_textiles`; cloth modifier in
`common/event_modifiers/BRI_mission_modifiers.txt` within that mod. Localised names:
The Nantes Market; Cloth for Sail; Demand for Breton Cloth. Actual recipient
province names in saves: 169 Arvor and 4384 Bro Roazhon; 172 Bro Naoned.

## Action and checkpoint chain

Fresh independent BRI, paused on 1444.11.11, owns 172/169/4384; both missions
incomplete; `bri_diplomacy_preview`, `bri_french_sphere_path`, `bri_autonomous_path`
absent. Setup removes marketplace/trade depot/stock exchange in 172 and adds
workshops in 169/4384, then stores zero numerical baselines. Setup does not
complete missions or apply cloth rewards. No startup hook is added.

1. Operator observed Nantes unavailable for its missing trade building and Cloth
   for Sail parent-locked; saved `BRI_nantes_unready`.
2. Operator ran `run nantes_ready.txt`, which adds only marketplace, then observed
   immediate Nantes readiness without unpause/refresh. Cloth for Sail remained
   Nantes-parent locked. Saved `BRI_nantes_ready`.
3. Operator clicked the actual Nantes mission button once. Cloth for Sail became
   ready immediately; both province tooltips showed permanent +15% local goods
   produced. Nantes remained completed after reopening missions. Operator ran
   `run nantes_completed.txt`, saved `BRI_nantes_completed`, then exited normally.
4. Assistant relaunched the same profile using `launch.ps1 -Reload`, with only
   `-debug -userdir`, no start tag, auto_run or setup. Operator loaded exactly
   `BRI_nantes_completed`, checked all requested restored states before the console,
   including no second Nantes completion action, reported no refresh needed, ran
   `run nantes_reloaded.txt`, saved `BRI_nantes_reloaded`, and exited normally.

All four checkpoints are paused 1444.11.11. Textiles stays incomplete. Observers
only export diagnostic variables/log markers; they do not mutate buildings,
selectors or rewards. No `complete_mission`, native `mission`, copied reward,
reward helper invocation, calibration apply/remove or tree manipulation was used.

Native saves are under session `profile/save games/`; immutable local copies
under `checkpoints/readiness/`, `checkpoints/completed/`, `checkpoints/reloaded/`.
Portable evidence contains exact-byte ZIP `meta` and relevant `gamestate` block
excerpts, logs, readers and hashes, rather than depending solely on ignored work.

| Native save | SHA-256 |
| --- | --- |
| BRI_nantes_unready.eu4 | `31998f062a60fa101ae2a8217c3e237bce67c295d625f11a6e5a8a1595bc9371` |
| BRI_nantes_ready.eu4 | `a18e0aa51d7de20139c892f0ffaa2866c917df3db694544fb7b52924cbafb204` |
| BRI_nantes_completed.eu4 | `90117609cc7b7492e80a3b9056650f4e1d6ac3b40114775bd1fe5170fc428582` |
| BRI_nantes_reloaded.eu4 | `483de08085aa18fa0263901ef271a15027d851cdedea0742a3bc04bb85cec4f2` |

## Per-dimension findings

| Dimension | Result and evidence |
| --- | --- |
| Readiness | **Verified.** Operator observed missing-building unavailability -> marketplace-ready immediately; [readiness check](evidence/manual-868e7002f5332b98/readiness-check.json), native saves and eight ordered ready markers corroborate setup and zero reward baseline. |
| Ordinary completion / reward dispatch | **Verified.** [Operator click report](evidence/manual-868e7002f5332b98/operator-completed.txt); native BRI `completed_missions` contains Nantes exactly once; both actual rewards appear after this sole completion action. [Completed check](evidence/manual-868e7002f5332b98/completed-check.json). |
| Cloth reward in 169 | **Verified.** Named UI reward, permanent +15%; save has exactly one `bri_demand_for_breton_cloth`, expiry sentinel `-1.1.1`; value/delta 0.150 against baseline 0.000. Retained unchanged on reload. |
| Cloth reward in 4384 | **Verified.** Same independently observed UI, saved identity/count/permanence and numerical contribution/delta in this province; retained unchanged on reload. |
| Downstream Textiles readiness/update | **Verified.** Ownership/workshops satisfied before Nantes; parent lock observed before click, immediately ready afterwards, incomplete/ready after reload without refresh. No Textiles reward execution tested. |
| Once-only ordinary mission behavior | **Verified.** Completed node retained on panel reopen; [operator reload report](evidence/manual-868e7002f5332b98/operator-reloaded.txt) confirms no second ordinary action among all requested states. One completion ID and one cloth entry per recipient retained. This does not test forced console toggles or rule out identical regrant from unrelated mechanisms. |
| Native save/reload persistence | **Verified.** Real completed artifact reloaded after process exit/restart; [reloaded metadata](evidence/manual-868e7002f5332b98/reloaded-meta.txt) explicitly names `BRI_nantes_completed.eu4`. Operator confirms restored UI/rewards/no refresh; new observer and [reloaded check](evidence/manual-868e7002f5332b98/reloaded-check.json) prove retained completion, both contributions/expiry, flags/buildings and Textiles incompletion. No setup markers on reload. |

UI evidence is operator text, including collective confirmation of the requested
reload checks; no screenshots or exact tooltip transcription were supplied.
Saved state independently supplies modifier IDs, expiry/counts and completion.
Numerical assertions use `[0.15,0.151)`; saved values/deltas are exactly 0.150.
Permanence is supported jointly by UI, unchanged production `duration=-1` and
native saved expiry sentinel, not an untested finite-duration expiry experiment.

## Testing-mechanism failures retained

Both [completed log](evidence/manual-868e7002f5332b98/completed-game.log) and
[reloaded log](evidence/manual-868e7002f5332b98/reloaded-game.log) have 11 ordered
nonce/date markers: six OK assertions, two false named-query observations,
BEGIN/END and **FAIL `<phase>-nantes-completed`**. The console `mission_completed`
query is false despite UI and native saved completion, including after reload.
Named `has_province_modifier` queries are also false despite actual named entries,
tooltips and positive values. Cause remains unestablished. Both probe checks stay
**FAIL**; the independent manual result does not relabel them PASS. Startup
state-only query behavior remains a separate historical result.

The first reload reader also failed an unsupported assumption that `campaign_id`
would be stable. The actual ID changed, while reloaded metadata names the exact
completed save. [Initial reader failure](evidence/manual-868e7002f5332b98/reload-reader-initial-check.json)
is retained. The reader now checks explicit source basename, unchanged original/
preserved predecessor SHA-256, version and matching relevant mission/province/
flag state. No gameplay assertion was weakened. This single reload does not
establish a general campaign-ID rule.

Neither discrepancy contradicts production gameplay in this ordinary path.
Native `mission` equivalence remains unestablished and was not compared again;
such comparison is optional and unnecessary to finish this manual investigation.

## Validation and closure

Production CWTools: completed exit 0, 11 files, 0 errors/58 warnings. Staged:
completed exit 0, 12 files, 0 errors/66 warnings. All 17 existing tool tests passed;
native `all` regression four PASS, exit 0, nonce `31fe8f97e09b2bc7`. Its
`missionCompletionPass=false` remains unchanged; it covers logic/effects/wiring.
Generated launcher/watchdog syntax accepted; 593 fixture nodes audited for
prohibited actions. Source/staged/console hashes checked through final saves.

Collectors: first run `20261003T223050435Z_8f94eb` finished unverified while reload
was pending; reload run `20261003T225952773Z_8db3e6` finished passed for the stated
manual persistence scenario. [Reload collector report](evidence/manual-868e7002f5332b98/reloaded-collector-report.json)
retains six new error messages, with no comparable vanilla baseline; these are
not attributed to the mod. No relevant fixture/mission script-error matches.
Both owned game/watchdog pairs exited; no active collector or operator step remains.

Completion conclusion: **faithful Nantes mission behavior verified** for the
recorded build/environment. Documentation/coverage/roadmap now reflect this manual
result; old evidence remains retained. No production fix, redesign or other roadmap
work began.

## Remaining playtest list

No required Nantes manual dimension remains open for this scenario. Console
completion/modifier query reliability is unresolved; before trusting those queries
for new coverage, reproduce them against UI/native saves with an unchanged build
and explicit nonce/date, comparing separate day-advance/reload observations. A
false query alone is a mechanism failure; conflicting ordinary UI/save/reward state
would require production attribution and reproduction. The existing
[calibration playtests](../runtime-run-effects/README.md#open-playtest-list) retain
this separate scope. Other mission dispatch/expiry, Textiles rewards and ordinary
deployment reconciliation remain their existing roadmap work, without authorization
from this result.
