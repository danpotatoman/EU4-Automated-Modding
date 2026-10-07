# Brittany Missions design

Owner: mod/brittany_missions
Documentation ownership updated: 2026-10-06

These statements are supported by player-facing localisation and documented
scenarios. Script/tests establish implementation, not a broader design mandate.
This is a record of existing intent, not a new balance or feature specification.

## Diplomatic choice

The player can examine French-sphere and autonomous diplomatic paths before
committing. Preview choices are explicitly temporary; the review decision permits
switching; the lock tooltip explicitly describes an irreversible adoption. Only
the selected branch should appear, and branch completion is blocked until the
Question of France is resolved. This is supported by the selector event text,
decision description and [selector scenario](testing/diplomatic-selector.md).
AI selection clears preview automatically in source; there is no documented AI
playtest or broader AI design policy.

The French text describes security through cooperation and shared interests;
the autonomous text describes freedom of action and an independent alliance
network. These are alternative paths, not evidence of a required relationship
to France throughout every campaign or a claimed balance between their rewards.

## Homeland and maritime development

Mission descriptions emphasize investment in Breton commerce, cloth production,
ports/naval construction, urban development and Renaissance institutions. Metropole
text explicitly describes concentrated homeland investment; its compactness
tooltip requires fewer than ten owned European provinces, with the tier-three
exception after No Rivals Remain. This supports the existing compact-homeland
mechanic, not a claim that all territorial expansion is discouraged: overseas
and colonial content also exists.

The constitutional settlement text describes reconciling estate rights and crown
authority while preventing any one estate from dominating. It supports that
mission's theme, not a prescribed historical simulation or an independently
validated reform balance.

## Presentation conventions evidenced in content

Mission titles/descriptions, highlight predicates and custom trigger/reward
tooltips explain goals and conditional rewards. Metropole reward comments explicitly
separate clean player-facing summaries from multi-province hidden effects.
Preserve understandable tooltip meaning when changing an existing mechanic;
technical test state belongs in shared tools/docs rather than the mission UI.

Evidence: `mod/brittany_missions/localisation/english/bri_missions_l_english.yml`,
`missions/Custom_Breton_Missions.txt`, `events/Custom_Breton_Events.txt` and
`decisions/Custom_Breton_Decisions.txt` within that mod. No independent overall
design specification or comprehensive balance targets were found.

## Open design questions

- Intended difficulty, pacing and numerical balance across the whole tree.
- Minimum supported DLC set and whether fallback behavior must cover absent DLC.
- Intended AI behavior beyond the implemented selector options; multiplayer scope.

Answer these only when needed for an authorized change. They are not committed
roadmap requirements. See [ROADMAP.md](ROADMAP.md) for evidence-backed follow-up.
