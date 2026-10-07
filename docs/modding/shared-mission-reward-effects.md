# Named mission reward effects and behavioral regression

Owner: shared EU4 mechanics/tooling knowledge

The Brittany/Nantes examples/results below are attributed workloads, not general mod coverage.
Current framework capability lives in [framework status](../STATUS.md) and
[runtime knowledge](../runtime/README.md); gameplay state/playtests belong to
[the mod owners](../mods/README.md). Dated verification and unresolved assumptions
remain scoped to their recorded versions, dependencies and fixtures.


Applicable version: installed EU4 1.37.5.0, checked 2026-10-03. Native evidence
already establishes country/province scripted-effect invocation through isolated
console run files. This pattern gives LOGIC/EFFECT/WIRING coverage, not normal
mission-button completion or reward dispatch.

## Pattern and dependencies

Keep a nontrivial conditional reward in `common/scripted_effects/`, and let the
mission's country-scope `effect` call it by name. Preserve ordered effects,
tooltip/hidden-effect wrappers, country/province scopes and all dependencies.
Example:

```text
# common/scripted_effects/example_rewards.txt
example_reward_effect = {
    if = { limit = { NOT = { alliance_with = FRA } } add_dip_power = 50 }
}
# mission definition
effect = { example_reward_effect = yes }
```

Installed vanilla `common/scripted_effects/03_scripted_effects_for_mission_rewards.txt`
defines conditional `BYZ_upgrade_theodosian_if_possible` around line 602;
event `events/flavorBYZ.txt:956` calls it. Mission
`missions/African_Missions.txt:77` calls `add_innovativeness_big_effect`, another
named helper. The production helper
`add_or_upgrade_production_building` is defined in
`common/scripted_effects/00_scripted_effects.txt:5094`: no building -> workshop,
workshop -> counting house, counting house -> +2 base production. Follow its
tooltip/localisation and building dependencies; the helper itself is not DLC gated.
The surrounding Brittany missions retain their existing DLC requirements.

Selected extraction candidates: Brest's shipbuilding reward combines a
conditional building grant and provincial modifier; Secure the Borders combines
a country modifier, tooltip and alliance-dependent DIP bonus. These deserve
named ownership of conditional behavior. Do not extract trivial one-line rewards
solely for coverage. Keep existing modifier IDs and localisation, including known
missing-description warnings; no new gameplay text is needed for effect names.

## Equivalence and tests

Before editing production, validate it and run the selected fixtures. Since the
original inline rewards are not independently callable, baseline staging may
generate adapters from the exact parsed source blocks. Those adapters are solely
refactor comparison evidence, not proof of normal production dispatch and not
copies of an existing production scripted effect. Record their provenance and
AST identity. After extraction, tests must invoke the real production definitions,
and verify missions reference them.

Expand the two new calls statically and compare the complete ordered mission AST
with the original; preserve the original byte encoding and newline convention.
Then run CWTools and the same native fixtures after extraction. Observe concrete
building state, modifier-derived value deltas and DIP values, rather than named
modifier presence. Exact expected numerical assertions must be independent of
the implementation and must not adapt themselves to a mutated reward value.
Use staged-only production mutations to show valid scripts can fail behavioral
checks; never mutate installed vanilla or the real mod for negative controls.

All fixtures, adapters, reports and evidence belong under shared tools/docs.
Bound and close owned native sessions. Test-specific nonces isolate transcripts;
missing, duplicated, wrong-date or stale evidence must not pass. Native mission
dispatch, UI/tooltips, modifier expiry, save/reload and tree refresh remain manual
boundaries.

## Verification and reusable assertion details

Verified natively on 2026-10-03: the original parsed inline comparison adapters
and the extracted production effects passed the same building, numerical modifier
and alliance-branch assertions. The complete ordered mission AST is equivalent
when both new calls are expanded; UTF-8 without BOM/LF were preserved. Production
CWTools before/after: zero errors, 58 warnings; staged final: zero errors, 62
warnings. Preview and all three real production behavior fixtures passed; staged
always-open gate, wrong building and 49-DIP faults were accepted statically but
failed the appropriate native tests. Final clean suite: PASS, 92.40 seconds total,
41.16 seconds native including cleanup. [Evidence and playtest boundaries](../testing/runtime-regression-suite/README.md).

Export a baseline, then an after value and subtract in the same scope. Installed
`events/ConsortEvents.txt:1783` demonstrates subtraction between variables using
two `which` fields; the native suite confirms it:

```text
export_to_variable = { which = dip_before value = trigger_value:dip_power }
# invoke actual reward here
export_to_variable = { which = dip_delta value = trigger_value:dip_power }
subtract_variable = { which = dip_delta which = dip_before }
if = {
    limit = {
        check_variable = { which = dip_delta value = 50 }
        NOT = { check_variable = { which = dip_delta value = 50.001 } }
    }
    log = "TEST: expected DIP delta"
}
```

Use observable fixed deltas and verify the baseline is away from resource caps.
`modifier:local_ship_cost`, `modifier:local_ship_repair`, and
`modifier:diplomatic_reputation` exported expected native changes in this suite.
Ranges narrower than 0.001 produced false failures; use `[expected, expected+0.001)`
for these values. A prior dynamic `Root/This.variable.GetValue` logging attempt
crashed at load with stack overflow; causation was not isolated. Constant markers
with state predicates work and are the supported harness pattern. Annual modifier
effects, duration expiry, tooltips, mission dispatch and persistence remain open.

Current example coverage: [Brittany/Nantes owner runbook](../mods/brittany_missions/testing/README.md).
