# Nantes mission completion experiment

Historical diagnostic, retained with its original verdicts. Later effect-only
contracts passed without establishing faithful mission completion; see
[current coverage](../runtime-coverage.md) and [current status](../../STATUS.md).
Earlier failed batch probes below are not the limit of the later verified `.txt`
run-file dispatch described in the followup.

Authorized ordinary-button followup is complete: [final manual report](faithful-completion-2026-10-03.md)
verifies readiness, actual completion, both permanent cloth rewards, Textiles
readiness, once-only ordinary behavior and save/reload on the recorded build.
[Closed session record](manual-session.md) links its new evidence. The original
diagnostic evidence/verdicts below remain unchanged; console query FAILs persist.

**PARTIAL — 2026-10-03, installed EU4 1.37.5.0 Inca (491d).** The harness
automatically recorded a real production mission as completed and observed its
parent-prerequisite state. It did not establish faithful reward-bearing mission
completion. Both reward-value observations were zero and both named-modifier
queries returned false. Production files
were unchanged; no reward body was copied or invoked by the fixture.

## Requested findings

1. **Usable native mechanism:** country effect `complete_mission = <id>` is usable
   for recorded completion. No native mechanism for ordinary reward-bearing
   completion was verified. Console `mission <id>` is listed by native help, but
   its faithful execution was not demonstrated. A later batch containing `mission`,
   `savegame` and a proven `.txt` assertion file left Nantes incomplete and reward
   values zero. See the followup below.
2. **Invocation:** test-only `on_startup`, restricted to BRI, invokes
   `complete_mission = bri_nantes_market`. Native `mission_completed` then returns
   true. `has_mission` checks tree membership. See the
   [actual generated hook](evidence/ready/hook.txt) and
   [mechanism guide](../../modding/native-mission-completion.md).
3. **Equivalence:** not equivalent to normal reward-bearing completion in these
   startup probes. It marked completion with a missing requirement in the first
   probe, and did not grant rewards with a marketplace present in the fresh final
   probe. Normal readiness, button refresh, once-only UI behavior, and later
   execution contexts remain unverified. The user's clarification about
   state-only completion is consistent with these observations.
4. **Production mission:** `bri_nantes_market`, slot 2/position 1 in
   `mod/brittany_missions/missions/Custom_Breton_Missions.txt`. Reward definition
   adds permanent `bri_demand_for_breton_cloth` in 169 and 4384. Its definition in
   `common/event_modifiers/BRI_mission_modifiers.txt` specifies
   `trade_goods_size_modifier = 0.15`. These unchanged files were staged and hashed.
5. **Initial state:** independent BRI, native log date 1444.11.11, owns 172/169/4384;
   `bri_diplomacy_preview`, `bri_french_sphere_path` and `bri_autonomous_path`
   absent; Nantes and Textiles present and incomplete; both reward modifiers
   absent. The fixture removes all three trade-building tiers in 172 before
   asserting the missing building. Actual launcher JSON enabled only
   `mod/brittany_missions_dev.mod`, with no disabled DLC. The isolated profile
   enabled only the staged mod; all 18 documented DLC were asserted natively.
6. **Precondition/readiness:** missing trade building was observed with the
   vanilla `has_trade_building_trigger`; fixture then added and observed a
   marketplace in 172. These are fixture facts, not native mission-unavailable
   and mission-completable assertions. No readiness oracle was verified; the
   desired precondition/readiness portion of the contract remains open.
7. **Completion action:** actual mission ID passed to the country scripted effect.
   This completed recorded state only. Faithful completion of the production
   mission, including its real `effect`, was not achieved.
8. **Postconditions:** native completion true; modifier presence observed in both
   reward provinces; their goods-produced modifier exported and classified;
   Textiles present/incomplete with parent complete; selector flags unchanged.
   The final probe had 32 ordered markers: BEGIN/END, 26 successful checks and
   four reward observations. Date/version, nonce, unchanged staged hashes and
   relevant script-error checks all passed.
9. **Actual reward evidence:** negative. Native logs reported `modifier-169 absent`,
   `modifier-4384 absent`, and both `reward-value-* zero`. The value probe classifies
   zero as [0, 0.001), intended 0.15 as [0.15, 0.151), and everything else as
   `other`. A subsequent [run-file probe](../runtime-run-effects/README.md) calibrated
   the positive value transition but exposed a false named-presence query after
   application. An immediate negative presence query alone is therefore not a
   reliable absence oracle in these contexts. The zero values corroborate the
   lack of reward here. No evidence
   shows the production reward body executed. This is a candidate-mechanism
   limitation, not evidence of a production mission bug.
10. **Recorded completion evidence:** `OK incomplete-before-action` followed by
    `OK mission-completed`, querying actual `mission_completed` before/after.
    See [game.log](evidence/ready/game.log) and [result.json](evidence/ready/result.json).
11. **Downstream:** production `bri_breton_textiles` uses
    `required_missions = { bri_nantes_market }`. Native parent completion became
    true while Textiles remained present and incomplete. Full Textiles readiness
    and the displayed prerequisite refresh were not tested. `completed_by` in
    vanilla is a historical date field, not the dependency mechanism here.
12. **Persistence:** not tested; secondary work was deferred because faithful
    reward-bearing completion did not succeed. The command batch included
    `savegame` but generated no save artifact; this is not a save/reload test.
13. **CWTools:** all reported validations completed with exit 0. Final production:
    10 files, 0 errors/58 warnings; final staged diagnostic: 11 files, 0 errors/64
    warnings. Six added warnings reference missing English
    `desc_bri_demand_for_breton_cloth` in test-only modifier queries. Earlier batch
    staging: 12 files, 0 errors/68 warnings. Later native-console staging:
    12 files, 0 errors/62 warnings. Preserved final reports:
    [production](evidence/ready/cwtools-production.json),
    [staged](evidence/ready/cwtools-staged.json). No production localisation edits.
14. **Regression:** fresh native `preview-gate` **PASS**, all 24 checks/26 markers,
    same version/date and 18 DLC, normal owned-window close. CWTools production
    and staged both 0 errors/58 warnings.
    [Regression report](evidence/preview-regression/result.json),
    [native log](evidence/preview-regression/game.log).
    After the subsequent run-file extension, another fresh regression also passed:
    [final report](../runtime-run-effects/evidence/preview-regression/result.json).
15. **New/changed files in this followup:** `tools/run-eu4-test.ps1` and
    `tools/runtime-tests/run.mjs` gained the second diagnostic using existing
    infrastructure; `nantes-market.on_actions.txt` is new; `evaluate.mjs` and
    `evaluate.test.mjs` gained observation-protocol support and real-evidence
    replay checks. Updated `tools/runtime-tests/README.md`,
    `docs/modding/runtime-script-assertions.md` and the guide index. Added
    `docs/modding/native-mission-completion.md` and this report/evidence directory.
    Experimental command/effect files survive only as evidence or ignored work;
    they are not part of the final runner. Production mod files unchanged.
    The run-file followup additionally adds `run-effects.on_actions.txt`,
    `run-effects.run.txt`, `run-effects.after.txt`,
    `docs/modding/console-run-effects.md`, and the shared
    `docs/testing/runtime-run-effects/` report/evidence, using the same runner.
16. **Remaining boundary:** establish an instrumented native command path and
    mission readiness query, then prove that a mechanism executes the production
    reward with normal completion semantics. If native mechanisms cannot do this,
    a controlled mission-button UI experiment is the next fallback. We documented
    the native limitation without sending gameplay clicks, keys or console text.
    Save/reload follows only after faithful completion is established.

## Followup: working run dispatch, mission still unproven

The user's run-file diagnostic request established that profile-root `.txt` files
execute through `-auto_run=eu4rt_run.commands`, including a two-line batch of
`run` commands. Ordinary effects, custom named scripted effects and a real
installed scripted effect used by a Brittany mission executed successfully. This
narrows the earlier batch limitation: dispatch is usable, while the old `.effects`
files/path/timing combination was not established. See the separate
[run effects report](../runtime-run-effects/README.md).

Fresh native-console probe `run-file_d2e4c2808be44e94` on 2026-10-03 placed:

```text
mission bri_nantes_market
savegame
run eu4rt_simple_d2e4c2808be44e94.txt
```

in the isolated profile command file. Its startup fixture verified both missions
initially present/incomplete, ownership and absent reward queries, removed trade
buildings, then added/observed the marketplace. The subsequent run file loaded
from profile-root and reached every assertion, but `console-mission-completed`
and `downstream-parent-completed` failed. Both reward values were zero; no save
artifact appeared. No reward effects were invoked by either hook or run file.
CWTools staging completed with zero errors/62 warnings; the owned process closed
normally. [Report](evidence/native-console/result.json),
[command file](evidence/native-console/eu4rt_run.commands),
[native log](evidence/native-console/game.log).

The console command's response was not captured, so the exact reason is open:
command restrictions, syntax or initialization context/timing. The following
`run` executing does not prove `mission` successfully dispatched. This candidate
action probe is FAIL; the overall investigation remains PARTIAL with meaningful
native state observations. This is not a demonstrated production mission bug.
Neither actual reward dispatch nor persistence has been verified.

## Native experiments and evidence

All launches used unique isolated profiles and production copies, bounded owned
processes, existing CWTools and the existing collector. Final probes closed their
owned windows normally. The collector captured 92 general error-log messages
without a baseline; those are not classified as mod regressions. Final reports
have no relevant hook/mission parse errors and no staged hash changes.

| Run / nonce | Candidate | Observed result |
| --- | --- | --- |
| `194452286Z_bc40e381eeeb9c32` | Startup effect with missing building; absolute command batch | Completion recorded; rewards absent/incomplete; no batch assertions. Whole planned batch INCOMPLETE. [Evidence](evidence/unready/result.json) |
| `194857009Z_cb6adffc0bc32395` | Absolute batch plus `-auto` | No batch assertions; early normal owned-window close, INCOMPLETE. Full files remain in ignored work. |
| `195226089Z_a31d1301d0b2f25f` | Absolute batch plus `-auto -start` | Same boundary, INCOMPLETE. Full files remain in ignored work. |
| `195451102Z_aa01123fb957a1f1` | Relative `-auto_run=eu4rt_native.commands`, LF | Native `helplog` executed; no subsequent assertions/save. INCOMPLETE batch. |
| `200036361Z_d1daf1ab2d78a539` | Same relative batch, CRLF | Native help executed; no subsequent assertions/save, timeout 150 seconds. [Batch evidence](evidence/console-batch/result.json) |
| `200715051Z_ba4aa821f0986042` | Fresh startup effect after marketplace fixture; no command batch | Full diagnostic verified; completion true, modifiers absent, values zero; PARTIAL. [Evidence](evidence/ready/result.json) |
| `201242230Z_32ec5979bf15b998` | Retained preview-gate regression | PASS. [Evidence](evidence/preview-regression/result.json) |

All run IDs have prefix `20261003T`. Final diagnostic ran
20:08:01–20:08:41 UTC; regression 20:13:30–20:14:11 UTC. Runtime logs confirm
`EU4 v1.37.5.0 Inca`; checksum comes from installed launcher metadata, not the log.
Paths inside preserved reports identify original local work and collector files.
Sibling raw logs and hooks above remain usable if ignored work is cleared.

The preserved [command file](evidence/console-batch/eu4rt_native.commands) lists
`helplog`, `mission bri_nantes_market`, `run prepare_ready.effects`, another
`mission`, `savegame`, and `run after_console.effects`. Files were mirrored into
the isolated profile and staged mod root. The actual
[help log](evidence/console-batch/game.log) identifies `mission` as toggling
completion and `run` as executing effects from a file. Only help execution is
demonstrated. File syntax/lookup, timing/context and subsequent command execution
remain unresolved; do not interpret missing assertions as proof that `mission`
executed or suppresses rewards.

## Reproduce the diagnostic

Use the documented environment with Steam already available and no running EU4:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./tools/run-eu4-test.ps1 -Test nantes-market -TimeoutSeconds 150
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./tools/run-eu4-test.ps1 -Test preview-gate -TimeoutSeconds 150
node --test tools/runtime-tests/evaluate.test.mjs
```

Desktop graphics access is required. Nantes currently exits 2 for PARTIAL;
preview-gate exits 0 only for PASS. `-PrepareOnly` establishes static acceptance
only. The evaluator replay checks are not extra game runs. Staging/profile/cache
content stays outside exportable mod directories, under ignored shared tools.

## Open playtest list

The three required manual checks below are now **verified** by the
[2026-10-03 ordinary-button result](faithful-completion-2026-10-03.md). Retain
their starting conditions and failure signs for reproduction after build changes;
they are no longer pending for this recorded build. Query reliability remains open.

- **Faithful completion and readiness:** source
  `mod/brittany_missions/missions/Custom_Breton_Missions.txt`. Start fresh BRI
  1444.11.11, independent, selector flags absent, default 18 DLC and only this mod.
  In an isolated fixture, own 172/169/4384 and remove all trade buildings in 172;
  both missions must be incomplete and both cloth modifiers absent. Observe
  Nantes unavailable, add its marketplace, observe it becomes completable, then
  complete through the actual mission button or a newly verified native equivalent.
  Expected: recorded completion plus permanent cloth modifiers in both provinces.
  Failure signs: unavailable after setup, complete before setup, missing/temporary
  reward, or completion without effects. New evidence verifies ordinary readiness
  and completion using operator UI reports plus native checkpoints, independent
  of the historical state-only startup probes.
- **Reward value and downstream refresh:** same mission file plus
  `common/event_modifiers/BRI_mission_modifiers.txt`. After faithful completion,
  inspect both provinces for the named modifier and 0.15 goods-produced modifier
  contribution. Establish Textiles's other production-building conditions in
  169/4384 using fixture buildings. Expected: the parent dependency clears and
  Textiles becomes completable without manual tree manipulation; Nantes cannot
  be completed again. Failure signs: stale parent lock, missing reward/value or
  repeatable completion. New evidence verifies both +0.15 rewards and immediate
  Textiles ready UI, with no second ordinary Nantes action available after reload.
- **Save/reload persistence:** after the preceding successful test, save natively,
  exit and reload that save with the same mod/DLC. Expected: Nantes completion,
  permanent cloth modifiers, selector flags and downstream dependency state
  persist. Failure signs: lost completion/modifier, changed branch flags or stale
  dependency. Actual manual save/reload is now verified; successful automatic
  save generation or direct save-load automation remains unestablished.
- **Console observation reliability (open):** source remains the same mission/
  modifier files; use preserved completed/reloaded states and non-mutating observers
  from the final report. UI/native saves show Nantes completed and named permanent
  cloth rewards, but console `mission_completed` and `has_province_modifier` return
  false even after reload. Compare against UI/native state with exact nonce/date
  before trusting these queries. A false query alone is not a production failure.
  Cause and automated faithful completion remain unestablished; no investigation
  of either is authorized merely by listing it here.
