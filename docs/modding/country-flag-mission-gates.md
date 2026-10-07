# Country-flag gates for preview missions

Owner: shared EU4 mechanics/tooling knowledge

The Brittany/Nantes examples/results below are attributed workloads, not general mod coverage.
Current framework capability lives in [framework status](../STATUS.md) and
[runtime knowledge](../runtime/README.md); gameplay state/playtests belong to
[the mod owners](../mods/README.md). Dated verification and unresolved assumptions
remain scoped to their recorded versions, dependencies and fixtures.


Applicable reference: installed EU4 v1.37.5.0. The gate itself has no DLC
predicate; availability of the surrounding missions must be checked separately.

Vanilla `common/scripted_triggers/00_scripted_triggers_estates.txt`, around
lines 748–753, uses `custom_trigger_tooltip` with a `tooltip` key and a negated
`has_country_flag` condition. This demonstrates country-scope gating with a
localized explanation; it does not prove our selector works in game.

Define a named trigger in `common/scripted_triggers/`, call it from the mission's
country-scope `trigger`, and define its tooltip key in English localisation:

```text
example_preview_finished = {
    custom_trigger_tooltip = {
        tooltip = example_preview_finished_tt
        NOT = { has_country_flag = example_preview_active }
    }
}
```

Set the preview flag before selecting a branch; preserve it while switching
previews; clear it when committing. Other mission prerequisites and conditions
remain necessary. Localisation supplies text, not a trigger definition.

For Brittany, The Question of France sets `bri_diplomacy_preview`, both human
preview choices retain it, and the lock option clears it. AI choices also clear
it. Therefore the inferred gate is absence of that flag. Use the existing
`bri_diplomacy_preview_trigger` localisation inside the custom tooltip.

Validation: run `./tools/validate-cwtools.ps1` and the project checker. Playtest
with all ordinary requirements satisfied: preview must block completion, locking
must release only that restriction, and save/load must preserve the state.
See `docs/testing/brittany-diplomatic-selector.md` for selector checks.

Verification: vanilla pattern inspected; CWTools 0.10.31 completed for EU4
v1.37.5.0 on 2026-10-02 with 10 project files, zero errors and 58 warnings;
user playtesting on 2026-10-02 confirmed the tooltip, its removal on locking,
post-lock completion, immediate branch swapping and preview/lock save persistence
in Brittany. Preview missions were reported unavailable, but a controlled test
with every other condition satisfied during preview is not explicitly recorded.
Reward correctness is observational; exact effects were not separately audited.

On 2026-10-03 an [automated native runtime test](../testing/runtime-preview-gate/README.md)
invoked the unchanged production `bri_diplomacy_preview_trigger` in EU4 1.37.5.0.
The gate returned allowed with preview absent, blocked for French and autonomous
preview flags, and allowed after clearing preview while retaining autonomous
selection. All 18 required DLC were verified in game. This resolves the predicate's
true/false behavior, but does not replace the controlled mission-completion UI,
prerequisite, reward, selector-event or save/load checks above.

Current example coverage: [Brittany/Nantes owner runbook](../mods/brittany_missions/testing/README.md).
