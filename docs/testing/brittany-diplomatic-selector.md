# Brittany diplomatic branch selector

Status: **manual selector checks 1–9 passed, reported by the user 2026-10-02**.
Tested deployment: source commit `0cc4d3a`; log run
`20261002T200731560Z_f2b029`. Specific reward quantities and a controlled preview
gate test with every other requirement satisfied remain undocumented.
Use [the default environment](environment.md), including its full DLC list.

## Build preparation and baseline

All six branch missions now use the defined `bri_diplomacy_preview_trigger` in
`common/scripted_triggers/BRI_mission_triggers.txt`. It requires absence of the
preview flag and uses the existing localisation in a custom trigger tooltip.
CWTools validation completed on 2026-10-02 with zero errors and 58 warnings;
normal mission-layout scenarios also have zero errors. Deploy and record this
build before establishing the authoritative baseline. Static validation does
not establish that the preview lock works in game.

Close EU4 before deployment. Begin log capture before launching the tested build:

```powershell
./tools/check-project.ps1
./tools/deploy-mod.ps1
./tools/test-run.ps1 -Action begin -Scenario 'Brittany diplomatic selector: preview, swap, lock and persistence'
```

Then enable only the development mod, verify the DLC list, start a non-Ironman
Brittany game at the default 11 November 1444 start, pause, and save as
`BRI_selector_1444_baseline`. Never overwrite this save. Record the actual game
version, save name/path and log-run ID in the results below. If a save was made
before deploying the test build, create a fresh baseline afterwards.

Keep the game paused where possible; do not complete other missions or branch
missions during visibility/persistence checks. Screenshots should show the
bottom of slot 1, the event options, and the review decision when relevant.

## Expected states from source

The results below record the later user-reported checks; not every controlled
gate/reward assertion in this scenario has been verified. See
[current status](../STATUS.md) for subsequent native predicate/effect coverage.

Source: `mod/brittany_missions/missions/Custom_Breton_Missions.txt`,
`events/Custom_Breton_Events.txt`, and `decisions/Custom_Breton_Decisions.txt`.

| State | Slot 1 rows 11–13 | Review Our Diplomatic Course | Preview completion gate |
|---|---|---|---|
| Fresh baseline | Neither diplomatic branch | Absent | Not applicable |
| French preview | Franco-Breton Friendship; Franco-Breton Commercial Pact; The Franco-Breton Entente | Present | Must prevent branch completion |
| Autonomous preview | Secure the Breton Borders; Balance of Power; Military Self-Reliance | Present | Must prevent branch completion |
| Locked French/autonomous | Selected branch remains; opposite branch absent | Absent | Preview gate released; normal requirements still apply |

Flags: `bri_diplomacy_preview` means preview is active. Branch selection sets
`bri_french_sphere_path` or `bri_autonomous_path` and clears the opposite flag.
Both preview options call `swap_non_generic_missions = yes`. Locking clears
the preview flag but leaves the selected branch flag.

## Manual checks

1. **Initial state.** Load the pristine baseline. Inspect the mission tree: custom
   Brittany missions and **The Question of France** at slot 1 row 10 should be
   visible; neither alternative branch nor the review decision should appear.
   Failure signs: vanilla-only tree, overlapping branches, or a preselected branch.
2. **Natural selector entry.** Hover The Question of France. The scripted
   requirement is independence (`is_subject = no`), with no mission prerequisite.
   Complete it through the mission UI. The Question of France event should open.
   It should offer the French and autonomous previews; the lock option should
   not yet appear. Do not use a forced mission-completion console command, because
   that would bypass the behavior being tested.
3. **French preview.** Choose **France is the natural guarantor of our security.**
   Verify exactly the three French missions, no autonomous missions, and the
   review decision. Check the branch mission tooltips for a preview restriction.
   Failure signs: stale tree, both branches, missing missions or no review decision.
4. **Refresh observation.** First record what appears immediately after the choice.
   If wrong, close/reopen the mission panel, then, only if necessary, advance one
   day and pause again. Record which action changed it; a delayed refresh is a
   finding, not an immediate-refresh pass. Verify other mission positions and the
   completed status of The Question of France remain intact.
5. **Unlocked persistence.** Save as `BRI_selector_french_preview`, reload that
   checkpoint, and verify the French branch and review decision persist.
6. **Switch to autonomous.** Use Review Our Diplomatic Course and choose
   **Brittany shall answer to no foreign court.** Verify exactly the autonomous
   branch and the continued review decision. Repeat the refresh observation if
   necessary. Save as `BRI_selector_autonomous_preview`, reload, and verify it.
7. **Switch back and repeat.** Return to the French preview through the decision,
   then autonomous once more. Verify no duplicate cards, orphan arrows, disappeared
   common missions, or loss of the completed selector mission.
8. **Lock autonomous.** Reopen the decision and choose **The matter is settled.
   See that our policy reflects it.** The autonomous branch should remain and the
   review decision should disappear. The preview restriction should be removed;
   unmet normal conditions must still prevent completion. Save separately as
   `BRI_selector_autonomous_locked`, reload and verify the same state.
9. **Independent French lock.** Reload the pristine baseline, complete the selector
   again, choose French, reopen the review decision and lock it. Verify the French
   branch persists, the review decision disappears, and the preview restriction
   is released. Save as `BRI_selector_french_locked`, reload and recheck.

Tooltip checks alone do not prove the preview gate enforces completion. A follow-up
gate test must satisfy all normal requirements of a first branch mission in both
preview and locked states, show it unavailable during preview and available after
locking, then verify its reward and next mission prerequisite. Prepare that fixture
after the initial visibility run is assessed.
Do not record this gate test as passed merely because another requirement is unmet.

## Playtest verification and remaining uncertainties

The user confirmed immediate refresh without unpausing or reopening the panel,
intact shared missions, repeated branch switching, preview persistence, both
locked branches persisting on reload, and the review decision disappearing after
locking. The preview restriction showed the expected text, disappeared on locking,
and other mission requirements remained. Missions were genuinely completable with
the correct requirements after locking; rewards appeared correct to the user.

The following original concerns are resolved for the reported manual scenario,
except that exact reward effects and the fully isolated preview completion gate
have not been recorded:

- Whether mission swapping refreshes immediately and preserves completed shared
  missions. Source invokes the swap effect; the layout inspector does not execute it.
- Whether previews are mutually exclusive in game, repeat switching remains stable,
  and selected missions retain correct prerequisites and arrows.
- Whether unlocked and locked states survive save/load, and locking actually removes
  the normal route back into selection. Do not console-fire the event after locking:
  forcibly firing it would bypass the review decision's visibility restriction.
- Whether the implemented completion gate and custom tooltip work in game.

## Results

Results below reflect user observations, not automated gameplay inspection.

Log collection completed with operator outcome passed while EU4 was still running.
The snapshot did not change during capture. It contains 94 distinct unbaselined
error-log messages; no vanilla baseline exists, so these are not 94 proven mod
regressions. None matched the initial Brittany/selector identifier filter; that
filter does not establish that every message is unrelated. Further triage remains
separate from the passed gameplay observations.

All deployed mod file hashes remained unchanged. The launcher descriptor lost its
final newline during the run; its name, version and path text are otherwise
identical. The strict collector reports a descriptor change, which can mark this
evidence stale in the project checker and block redeployment until reconciled.
The source build identity is retained, but no deployment record was silently updated.

| Item | Result | Observations / screenshot or save reference |
|---|---|---|
| Build, version, DLC and playset confirmed | Build recorded; launcher details not independently confirmed | Source commit 0cc4d3a; default documented DLC/playset expected; actual game version not supplied |
| Baseline save name/path and run ID | Save path not supplied; run recorded | 20261002T200731560Z_f2b029 |
| Initial layout and natural event entry | Passed | Correct slot/row, independence requirement and branch-choice event |
| French preview and immediate refresh | Passed | Three French missions and review decision; no refresh or unpausing needed |
| Preview save/reload | Passed | French missions and decision persist |
| Autonomous preview and switching back | Passed | Correct branch and decision; no refresh needed |
| Autonomous preview save/reload | Passed | State persists |
| Repeated swaps preserve common missions | Passed | Other missions intact through repeated switches |
| Autonomous lock and save/reload | Passed | Branch remains; decision removed; preview restriction released; normal conditions retained |
| French lock and save/reload | Passed | Same correct lock and persistence behavior |
| Post-lock completion and rewards | Passed by user observation | Missions complete with correct requirements; rewards look correct; mission IDs and exact effects not recorded |
| Completion gate with normal requirements satisfied during preview | Not isolated in reported results | Preview prevents completion and displays correct restriction; all other requirements satisfied during preview not explicitly established |

After the gameplay checks, close EU4 and finish collection with the observed
outcome (`passed`, `failed`, `not-completed`, or `unverified`) and notes:

```powershell
./tools/test-run.ps1 -Action finish -Outcome unverified -Notes 'Record which checks ran and their results'
```

Use passed only for the stated completed scenario; it does not resolve unperformed
follow-up gate/reward tests. Attach screenshots and observations to the result
record; clean logs alone do not establish successful selector behavior.
