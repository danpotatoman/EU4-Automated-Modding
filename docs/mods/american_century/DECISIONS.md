# American Century decisions

Owner: mod/american_century
Documentation ownership updated: 2026-10-06

Original decision IDs/dates/rationale are preserved. Mod examples identify the
workload; they do not establish cross-mod verification. Current status and next
work belong in the owner's status/roadmap, not this historical decision log.

## D012 — American Century uses vanilla formation and the shared native lifecycle (2026-10-04)

**Decision:** Develop `mod/american_century/` independently of Brittany. Preserve
England's DLC mission grids and the vanilla USA formation decision; use additive
English preparation decisions, colonial origin missions and five custom USA
columns. The adopted 55-mission design explicitly permits escalating permanent
power, earned by branch-specific accomplishments. Implement and verify slices.
**Context:** American Dream is absent from the required environment; its republic
reforms cannot be assumed. A constitutional choice uses a base republic reform
and distinct institutional modifiers. Native initialization creates CNs before
console setup, and startup hooks execute again on ordinary reload.
**Consequence:** The fixture sets an overseas English capital in staged history,
guards startup with saved identity/state, and forms USA through the real decision.
Production rewards are tested through real buttons and native saves, including
numerical modifier deltas. Reuse ownership, collector, CWTools and recovery; allow
bounded UI deadlines up to 1800 seconds without changing defaults. The first slice
and the [full proposed design](DESIGN.md) have separate evidence boundaries;
see the [native report](../../testing/american-century/README.md).
