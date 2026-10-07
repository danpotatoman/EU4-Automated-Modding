# American colonial runway and USA tree selection

Owner: shared EU4 mechanics/tooling knowledge

The American Century examples/results below are attributed workloads, not general mod coverage.
Current framework capability lives in [framework status](../STATUS.md) and
[runtime knowledge](../runtime/README.md); gameplay state/playtests belong to
[the mod owners](../mods/README.md). Dated verification and unresolved assumptions
remain scoped to their recorded versions, dependencies and fixtures.


Purpose: add English preparation without replacing England's DLC mission trees;
give eastern-American British CNs a short origin tree and replace USA's missions
upon vanilla formation. Read-only sources reviewed 2026-10-04 in EU4 1.37.5.0:
`decisions/USANation.txt`, `decisions/ColonialNations.txt`,
`missions/USA_Missions.txt`, `missions/English_Missions.txt`,
`missions/RB_English_Missions.txt`, `events/AmericanRevolution.txt`,
`events/USADLC.txt`, `common/government_reforms/02_government_reforms_republics.txt`,
`common/scripted_functions/00_scripted_functions.txt`, `map/{area,region}.txt`,
`common/colonial_regions/00_colonial_regions.txt`.

## Files, scopes and minimum pattern

Mission files contain country-scoped series, explicit `slot` and `position`,
`generic = no`, `ai = yes` and `potential` tag/colonial predicates.
An identically named comment-only `USA_Missions.txt` overrides that loose vanilla
file; never edit the installed file. Add country decisions/events, modifiers,
reusable scripted triggers and BOM-prefixed English localization under the mod.

```text
amc_state = {
 slot = 3 generic = no ai = yes
 potential = { tag = USA NOT = { map_setup = map_setup_random } }
 amc_liberty_at_last = {
  icon = mission_assemble_an_army position = 1
  trigger = { is_subject = no is_at_war = no }
  effect = { change_government_reform_progress = 100 }
 }
}
```

Country formation uses vanilla `change_tag = USA`,
`swap_non_generic_missions = yes` and `on_change_tag_effect`. Its allow requires
ADM 10, free-or-tributary status, peace, eastern-American core capital, ten cities,
and no USA. A British culture changes to American. Independence comes **before**
this decision, not from a USA mission. Vanilla release-CN scripted function requires
peace; actual subject release/play behavior is a separate runtime test.

Country `any_subject_country` scopes to CN; `is_colonial_nation_of = ROOT`
identifies parent; count cities using `num_of_owned_provinces_with` in the CN scope.
Do not confuse parent's ROOT with colony in nested rewards: `capital_scope` of
the current subject is appropriate; own-province filters use current country via
`is_core = PREV` only when scope has changed and that relationship is verified.

American Dream gates both `american_republic`/`federal_republic` and `usa_dlc`
events. For the default 18 DLC, conversion can use verified `change_government =
republic` plus base `oligarchy_reform`, as an explicit gameplay approximation.
Trigger-only custom constitution event options set exclusive country flags and
one permanent modifier. Localisation must distinguish this from a custom reform.

## Pitfalls and validation

CN mission potentials can collide with generic/other colonial missions or change
after independence. `potential_on_load`/refresh semantics must not be invented;
prove initialization and formation swap natively. Five USA columns suppress
generic grid content only if observed in runtime; static layout isn't that proof.
Territory counts should require cities/cores for state-building, not occupied
provinces, subjects or colonies unless explicitly intended. Local modifier identity
queries are not reliable alone; inspect native saves and numeric values.

Run CWTools/layout on source and CWTools staged wrappers. Playtest independent
formation via actual decision, core/culture/rank/mission swap, false->ready->real
mission click, event option and named rewards/expiry, dependency unlock, unrelated
rewards absent and reload. Separately test natural ENG CN creation, release/play,
colonial rewards/flags and independence. Current results are tracked in the
[USA report](../testing/american-century/README.md); before production implementation,
this guide records vanilla patterns and untested adaptation, not native success.

## Native findings, 2026-10-04

An initial overseas fixture capital must be written in staged country history:
the engine creates CNs before auto_run, so moving the capital afterward is too
late to retain direct English ownership. Actual vanilla formation swaps to all
five custom USA series and American culture; the vanilla USA series is absent.
Liberty -> Compact and Harbors + Compact -> Open Doors unlock correctly through
real mission buttons. Native save/export probes corroborate named permanent
modifiers and their numeric values; ordinary UI reload preserves observed state.
See the linked report for full outcome qualifications and retained failed runs.

Startup actions run again on ordinary reload, including for a former tag. Test
hooks must require the initial fixture's capital/city count and a once-only flag;
do not tolerate duplicate markers in the evaluator. Save parsers must handle bare
core tags and bounded native fields; whole-country script parsing fails on estate
privilege tuples. Static layout flags the same-row Compact/Doors link, but native
UI renders its routed arrow and enforces both prerequisites. Natural CN origin
assignment, release/play, the second constitution choice and remaining roots are
still open scenarios.

Current example coverage: [American Century owner runbook](../mods/american_century/testing/README.md).

## Constitutional modifier observations (2026-10-07)

Before testing alternate rewards, separate conversion, option and prerequisite
effects. Country-scope `export_to_variable = { which = test_unrest value =
modifier:global_unrest }` observes engine totals; it is not just the named event
modifier. Installed 1.37.5.0 `common/static_modifiers/00_static_modifiers.txt`
(`republican_tradition`) supplies unrest -2 and reform progress growth +1 scaled
by tradition. A +10 tradition step therefore changes those totals by -0.2/+0.10.
Observe both the 50 -> 60 option step and the reward-free 60 -> 70 fixture step:
subtract the latter unrest delta to isolate Local Guarantees' permanent -1.
Accepted-culture capacity should separately rise by exactly 1. Hold tradition at
70 across the Union button to isolate yearly tradition +0.3/growth +0.10.

Required files/scopes: existing staged observation decision, production country
event/modifiers/missions and native country save fields. Test-only setup must not
add the production modifier or complete a mission. Observation localisation stays
in the staged test namespace. Base oligarchy needs no American Dream; actual DLC
activation still requires save evidence. Verify source/staged CWTools, real option
and mission input, exclusive flags, expiry `-1.1.1`, independent paused checkpoints
and reload. Native saves may order completed IDs differently from claim order and
omit untouched zero reform progress; compare unique membership/count and interpret
only that documented omitted-zero pool as zero, keeping missing probes invalid.
The first alternate attempt is retained INCOMPLETE for oracle calibration;
acceptance/current limits remain in the owner's coverage, not inferred here.
