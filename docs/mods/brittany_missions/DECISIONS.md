# Brittany Missions decisions

Owner: mod/brittany_missions
Documentation ownership updated: 2026-10-06

Original decision IDs/dates/rationale are preserved. Mod examples identify the
workload; they do not establish cross-mod verification. Current status and next
work belong in the owner's status/roadmap, not this historical decision log.

## D004 — Preview before irreversible diplomatic commitment (documented content)

**Decision:** Permit branch inspection/switching through the review decision, then
lock the current choice and remove the normal review route.
**Context:** Player-facing event/decision/tooltips explicitly offer temporary previews
and permanent adoption; no additional historical/balance rationale was recovered.
**Consequence:** Branch completion gates depend on preview state. Forced event or
console actions bypass ordinary selection rules and cannot validate that flow.
See [DESIGN.md](DESIGN.md) and [selector scenario](testing/diplomatic-selector.md).


## D007 — Conditional reward ownership and equivalence (2026-10-03)

**Decision:** Extract only shipbuilding and borders conditional rewards into named
production scripted effects; leave trivial Nantes inline and use the real installed
textiles helper. Compare exact original inline adapters before extraction and actual
production calls afterward; retain full ordered AST-equivalence evidence.
**Context:** [Mechanics guide](../../modding/shared-mission-reward-effects.md) identifies
conditional ownership/direct testability and rejects extraction just for test count.
**Consequence:** Static wiring and native before/after tests support equivalence;
comparison adapters are historical test-only infrastructure, not reward dispatch.


## Nantes dispatch acceptance

[D011 shared input/evidence choice](../../runtime/DECISIONS.md) is exercised by the
Brittany Nantes claim/refusal. Its scoped gameplay result belongs in
[status](STATUS.md) and [coverage](testing/coverage.md); neither effect-only all
nor another mod's input success closes Brittany's remaining mission tests.
