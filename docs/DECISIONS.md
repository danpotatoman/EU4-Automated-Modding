# Repository/framework decisions

Owner: repository/framework
Documentation ownership updated: 2026-10-06

Original decision IDs/dates/rationale are preserved. Mod examples identify the
workload; they do not establish cross-mod verification. Current status and next
work belong in the owner's status/roadmap, not this historical decision log.

## D013 — Preserve local originals and publish reviewed evidence copies (2026-10-05)

**Decision:** Keep runtime saves/profiles/game screenshots/bulk dumps and real config
local. Public textual evidence uses stable synthetic paths, original/public hashes
and explicit collector summaries; failed verdicts and replay assertions are retained.
Shared defaults plus ignored overrides/environment variables preserve development.
**Context:** Publication audit found personal paths in candidates and existing Git
history, large generated output and captured third-party UI. Current-file cleanup
does not repair history or establish redistribution rights.
**Consequence:** Preserve original Git metadata/bundle in ignored local storage and
initialize clean Git at the same workspace root. Future development continues here
with a configured staged-byte audit hook; exports are optional. Make no commit/remote/
push and leave public identity/license decisions with the owner. Future work follows
[hygiene](REPOSITORY_HYGIENE.md).
See [audit and validation](PUBLICATION.md); gameplay certification is unchanged.


## D001 — Shared workspace, exportable mod boundaries (existing convention)

**Decision:** Keep each mod in `mod/<mod_name>/`; tools, tests, caches, instructions
and documentation stay outside. Preserve game-text encoding and treat installed
vanilla as read only.

**Context:** Existing repository instructions and tool workflows explicitly require
this separation to keep mod folders suitable for export as game content.
**Consequence:** Runtime hooks/wrappers and fixtures are staged under shared tools;
their existence never makes them production content or certifies export readiness.
See [PROJECT.md](PROJECT.md) and [modding workflow](modding/README.md).


## D002 — Documentation before implementing a new mechanic (existing convention)

**Decision:** Check reusable guides/version/DLC and follow current vanilla
definitions/dependencies; document missing/outdated patterns before implementing.
**Context:** Existing `AGENTS.md` established this incremental knowledge workflow.
**Consequence:** Guides preserve scopes, dependencies, pitfalls and verification
status; matching snippets/static acceptance do not replace playtests.


## D003 — Separate owned development deployment (existing tool design)

**Decision:** Use `brittany_missions_dev` and generated descriptors rather than
overwriting the existing Brittany installation; copy source bytes and retain
deployment hashes, ownership records and backups.
**Context:** [Deployment tool](../tools/deployment/README.md) explicitly preserves
the other installation and blocks externally changed/unowned destinations.
**Consequence:** Launcher selection is still required; deployment is not atomic
or proof of behavior. A harmless-looking descriptor edit still requires deliberate
reconciliation rather than silently rewriting the ownership record.


## D004 — Preview before irreversible diplomatic commitment (documented content)

Canonical owner: [decision record](mods/brittany_missions/DECISIONS.md#d004--preview-before-irreversible-diplomatic-commitment-documented-content).

## D005 — Bounded isolated native assertions (2026-10-03 evidence)

Canonical owner: [decision record](runtime/DECISIONS.md#d005--bounded-isolated-native-assertions-2026-10-03-evidence).

## D006 — Separate effect coverage from mission dispatch (2026-10-03)

Canonical owner: [decision record](runtime/DECISIONS.md#d006--separate-effect-coverage-from-mission-dispatch-2026-10-03).

## D007 — Conditional reward ownership and equivalence (2026-10-03)

Canonical owner: [decision record](mods/brittany_missions/DECISIONS.md#d007--conditional-reward-ownership-and-equivalence-2026-10-03).

## D008 — Fixed observations, constant logs and negative controls (2026-10-03)

Canonical owner: [decision record](runtime/DECISIONS.md#d008--fixed-observations-constant-logs-and-negative-controls-2026-10-03).

## D009 — Persistent documentation ownership (2026-10-03 bootstrap)

**Decision:** Use concise `AGENTS.md`, distinct project/design/status/roadmap/
decision/testing documents and living substantial-task plans in `.agent/plans/`.
**Context:** The user's documentation-only migration requested durable context
without inventing intent or modifying behavior.
**Consequence:** Tool READMEs and scenario reports remain detailed sources;
historical prose receives current-context notes, raw evidence stays unchanged,
and completed plans propagate durable facts to the relevant documents.


## D010 — Recovery belongs to the native lifecycle (2026-10-03)

Canonical owner: [decision record](runtime/DECISIONS.md#d010--recovery-belongs-to-the-native-lifecycle-2026-10-03).

## D011 — Faithful claims require actual dispatch evidence (2026-10-03)

Canonical owner: [decision record](runtime/DECISIONS.md#d011--faithful-claims-require-actual-dispatch-evidence-2026-10-03).

## D012 — American Century uses vanilla formation and the shared native lifecycle (2026-10-04)

Canonical owner: [decision record](mods/american_century/DECISIONS.md#d012--american-century-uses-vanilla-formation-and-the-shared-native-lifecycle-2026-10-04).

## D014 — Independent documentation owners (2026-10-06)

The user authorized documentation-only Phase 1: framework root state, shared EU4
knowledge, per-mod state, owner-labelled task plans and indexed byte-preserved
history. This describes the Phase 1 boundary; the separately authorized Phase 2A
runtime ownership/CLI changes are recorded below. See the
[governing plan](../.agent/plans/2026-10-06-project-state-ownership.md) and
[migration provenance](testing/project-state-migration.json).

## D015 — Explicit runtime contract owners with compatible selection (2026-10-06)

Phase 2A adopts owner adapters and genuinely shared helpers behind one registry
and one existing runner/lifecycle. Explicit -Mod is preferred; omitted-Mod routing
and protocol/oracle semantics remain compatible. all retains exactly four Brittany
regressions. Generalized report/collector identity and per-mod configuration remain
deferred. See [runtime handoff](runtime/phase2a-ownership-2026-10-06.md).
