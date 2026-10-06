# American Century: bounded slice playtests

Status: first slice implemented; positive and negative native contracts **PASS**,
2026-10-04. The full proposed tree and natural colonial campaign remain open.
[Design](../../usa/DESIGN.md), [execution plan](../../../.agent/plans/2026-10-04-american-century.md).

## Implementation and environment

Production contains nine USA missions in five columns, three colonial-origin
missions, two additive English/British preparation decisions, one two-option
constitution event, twelve named modifiers and complete English localisation.
The [design](../../usa/DESIGN.md) specifies 55 USA missions through American Century;
unmarked future rows are design, not production content.

Installed/running version is EU4 1.37.5.0 Inca (491d). Native saves prove one
isolated runtime mod and **21 enabled DLC**, including all 18 required by the
[default environment](../environment.md), plus Art of War, Common Sense and Rights
of Man. American Dream is absent. An exactly-18-only environment remains untested.
See [native DLC](evidence/positive/before-enabled.txt),
[version](evidence/positive/before-versions.txt) and
[activation](evidence/positive/before-mods.txt). Ordinary launcher configuration
was read only; USA was staged in a fresh owned `-userdir` for every attempt.

## Verified native evidence

The fresh [positive result](evidence/positive/result.json) has behavioral,
native-probe and mission-completion PASS, exit 0 and clean owned cleanup.
Run `20261004T105823451Z_470def8e14de1db9` formed USA by clicking the unchanged
vanilla decision from a deterministic overseas-English fixture. It accepted the
American ideas offer, selected all five custom series and suppressed the vanilla
USA series. The fixture establishes ADM 10/ten eastern core cities/core coastal
capital/peace, not a naturally played independence campaign.

Four production missions were claimed once through their actual buttons:
Liberty at Last -> The Federal Compact, then Free Harbors -> Open Doors, choosing
enumerated federal powers in the constitution event. The [31-check save/input
oracle](evidence/positive/independent-save-check.json) and
[input transcript](evidence/positive/ui-actions.jsonl) establish:

- Exact completion IDs once, four derived button clicks, no other AMC completion.
- Liberty +20 prestige and a 20-year named modifier; reform progress 100 is also
  visible in the reward dialog and [native after state](evidence/positive/after-country.txt).
- Base republic/oligarchy reform, mutually exclusive choice flags, no pending
  event, permanent federal +10% governing capacity and -10% state maintenance.
  Native UI/save republican tradition is 60 after the +10 event reward.
- Harbors +50 DIP and permanent local +15% trade power; immigration +2 capital
  manpower, -10% development cost and +25 settlers for twenty years.
- Correct named modifier counts/expiry, numeric engine-export deltas and absence
  of unrelated constitution, army, navy, workshop or durable-union rewards.
- Compact unlocks only after Liberty; Doors remains blocked until both Compact
  and Harbors are complete, then becomes ready and can be claimed.

Normal UI load/save produced a fresh checkpoint. All [12 persistence
comparisons](evidence/positive/reload-check.json) pass: campaign identity, completed
missions, modifier identities/durations, government/reforms/flags, capital
development/modifiers, observed totals, DIP and prestige. The
loaded tree (local-only image; excluded from publication) still shows four completed
missions. This proves persistence across this ordinary paused reload; it does not
prove time-based expiry, repeat-click behavior or arbitrary save-launch semantics.

The separate [negative result](evidence/negative/result.json), run
`20261004T110948651Z_65dcd99511bff1c2`, is PASS/exit 0 with clean cleanup.
The checklist (local-only image; excluded from publication) shows the capital trigger
red without a marketplace. The driver records refusal and sends no mission-entry
input. Two independently written native saves pass all [eight checks](evidence/negative/independent-save-check.json):
no completion/reward before, correct missing building, no entry input and unchanged
mission/modifier state after refusal. Readiness was tested in separate fresh
false/true fixtures; building the marketplace in one running campaign is still open.

## Checks, failures and boundaries

Production CWTools: 8 files, zero errors/warnings. Staged CWTools: 12 files,
zero errors/warnings; retained [source](evidence/positive/cwtools-production.json)
and [staged](evidence/positive/cwtools-staged.json) reports. No AMC error-log findings.
The mission inspector finds no structural errors; USA has one same-row arrow
warning (Compact/Doors), whose native routed arrow and two-parent gate are verified.
The inspector cannot evaluate the colonial scripted potential; natural assignment
is open. All **51 shared Node tests** pass, including negative controls, ownership,
cleanup, crash/freeze recovery, save contracts and generic mission geometry.
Required Brittany native `all`: all four contracts **PASS**, exit 0, one attempt,
clean cleanup. See [regression result](evidence/brittany-regression/result.json).
Source/staged Brittany CWTools retain 58/62 warnings respectively and zero errors.
These narrower trigger/effect/wiring contracts do not test every Brittany mission.

Earlier raw failures remain INCOMPLETE and are never relabeled as PASS:

| Retained attempt | Failure and correction |
| --- | --- |
| [setup-capital](evidence/setup-capital/result.json), [setup-cn](evidence/setup-cn/result.json) | CN creation happened before console setup; set initial overseas capital in staged history. |
| [claim-timeout](evidence/claim-timeout/result.json) | Claims worked, but save parser investigation exhausted the deadline. Parse bounded native fields rather than anonymous estate tuples. |
| [input-abort](evidence/input-abort/result.json) | Incorrect readiness-record argument rejected by driver; owned cleanup succeeded. |
| [progress-timeout](evidence/progress-timeout/result.json) | Default 30-second quiet deadline unsuitable for paused UI work. Use explicit progress bound. |
| [reload-duplicate](evidence/reload-duplicate/result.json) | Rewards/reload comparisons passed, but reload replayed startup protocol. Guard the fixture with saved flag/initial identity; keep duplicate-marker rejection. |
| [reload-timeout](evidence/reload-timeout/result.json), [claim-dialog-timeout](evidence/claim-dialog-timeout/result.json) | Ten-minute ceiling expired before final UI/save handoff. Permit up to 1800 seconds, use 1200 for this contract; defaults unchanged. |

Every failed attempt's owned cleanup was clean. Eight failures are retained;
only the separate clean positive and negative runs earn complete PASS.
Raw logs include vanilla baseline errors; a clean AMC filter is not campaign proof.
The [protection audit](protection-check.json) matches all fourteen protected files
(eleven Brittany production files and three ordinary-profile configurations) and
all fourteen installed vanilla references. No vanilla or ordinary-profile writes
were needed. [Changed files](changed-files.md) distinguish this run's work from
pre-existing repository changes. Full saves remain in ignored `tools/runtime-tests/work/`;
portable evidence retains hashes, native excerpts, logs, input and screenshots.
All eight production gameplay/localisation files match the positive run's staged
manifest. The [byte audit](evidence/source-byte-check.json) retains the expected
descriptor mismatch too: the runner rewrites its name/path for isolated runtime
activation. Consequently the source release descriptor was not natively tested.

## Reproduction

From the project root, with an active Codex session providing the supported
Windows `sky` input API:

```powershell
./tools/validate-cwtools.ps1 -Mod american_century
./tools/inspect-missions.ps1 -Mod american_century
./tools/run-eu4-test.ps1 -Test usa-slice -ClaimMode click -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Test usa-slice -ClaimMode negative -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150 -Retries 0
```

The [shared runner guide](../../../tools/runtime-tests/README.md#usa-vertical-slice)
documents state observation, native saves and UI handoff. A bare shell invocation
does not operate the GUI. Console completion is never reward evidence.

## Playtest list

All scenarios: EU4 1.37.5.0/required 18 DLC (actual 21 above), normal map, only the isolated USA mod,
plain non-Ironman saves. Production affected: `mod/american_century/` mission,
decision, event, trigger, modifier and English localization files.

1. **Formation and tree selection — verified fixture, natural route open.** Start ENG; establish fixture ADM 10, ten
   eastern-American core cities and core American capital, peace/independence.
   Click unchanged vanilla Form USA decision; observe culture/ideas popups and
   five USA columns, absence of vanilla USA tree. Save. Failure: wrong tag,
   unavailable decision despite requirements, mixed/missing grid, wrong ownership.
   This fixture is not a natural colonial campaign.
2. **Liberty/compact — positive/enumerated choice verified, war refusal and alternate choice open.** Fresh USA; assert Liberty blocked at war then ready at
   peace; claim real button. Observe 100 reform progress/20 prestige and named
   temporary liberty bonus. Compact must unlock; set stability/technology/core
   requirements and claim, choose constitutional event. Save verifies completion
   once, base republic and exactly one permanent option modifier. Failure:
   parent bypass, absent/duplicate/wrong-duration reward, wrong government.
3. **Harbors/immigration/workshops — Harbors negative/positive and Doors verified; Workshops and same-campaign build transition open.** Capital without trade building must block
   Harbors; add marketplace then real claim. Verify permanent local +15% trade
   power, +50 DIP; immigration unlock after Compact and 3 developed cities;
   claim and verify +2 capital manpower/temporary settlement bonus. Workshops
   must remain blocked until five buildings; claim and observe permanent economic
   modifier. Failure: premature unlock, duplicated development or unrelated bonus.
4. **State and reload — verified bounded case; expiry/repeat-click open.** Save before/after claims, reload completed checkpoint
   through ordinary UI without setup replay; verify mission state, modifier
   permanence, option flag, capital development and downstream state retained.
   Failure: repeatable claim, lost choice/rewards, fixture rerun or wrong load.
5. **Natural colonial runway (open).** ENG 1444; colonize 3 then 5 cities in
   eastern America, confirm only appropriate additive decision/CN origin series;
   develop/market 10 cities, claim origin missions, sponsor assemblies. Release
   and play while peaceful, or play colony and win independence; form USA at ADM
   10. Verify flags/rewards survive, USA grid swaps. Also test non-British CN,
   another region, USA existing and non-core/capital/war formation refusal.
6. **Other slice roots/union (open).** Real claim continental foothold, Citizen
   Soldiers and Guard Coast; test region claims, exact military/naval temporary
   rewards and union's republic/tradition/stability gate. Reload/expiry and second
   compact choice need separate scenarios.

Affected files for scenarios 1–4: `missions/USA_Missions.txt`,
`missions/AMC_USA_Missions.txt`, `events/AMC_constitution.txt`,
`common/event_modifiers/AMC_modifiers.txt`, `common/scripted_triggers/AMC_triggers.txt`
and `localisation/english/amc_l_english.yml`, all under `mod/american_century/`.
Scenario 5 additionally covers `missions/AMC_colonial_origins.txt` and
`decisions/AMC_atlantic.txt`; scenario 6 covers the remaining USA entries and modifiers.
Starting conditions, steps, expected behavior and failure signs above remain the
scenario contract. Keep open items open until native evidence resolves them.

Next: validate actual ENG -> CN -> independent colony -> USA assignment/flag
persistence before expanding continental/native diplomacy and industrial branches.
Other DLC combinations, AI, scrolling/DPI layouts, complete campaign balance,
late branches and release/deployment descriptors remain unverified.
