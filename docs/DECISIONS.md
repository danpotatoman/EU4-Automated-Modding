# Decision log

Dates refer to evidence records, not inferred dates of original design intent.
Record only recoverable choices and context. Status and future work belong in
[STATUS.md](STATUS.md) and [ROADMAP.md](ROADMAP.md).

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

**Decision:** Permit branch inspection/switching through the review decision, then
lock the current choice and remove the normal review route.
**Context:** Player-facing event/decision/tooltips explicitly offer temporary previews
and permanent adoption; no additional historical/balance rationale was recovered.
**Consequence:** Branch completion gates depend on preview state. Forced event or
console actions bypass ordinary selection rules and cannot validate that flow.
See [DESIGN.md](DESIGN.md) and [selector scenario](testing/brittany-diplomatic-selector.md).

## D005 — Bounded isolated native assertions (2026-10-03 evidence)

**Decision:** Run actual production predicates/effects in a hashed staged mod,
fresh `-userdir` profile and owned bounded EU4 process; evaluate native nonce/date/
version-qualified markers and unchanged fixture files.
**Context:** [Preview evidence](testing/runtime-preview-gate/README.md) demonstrates
startup assertions; later run-file calibration demonstrates automatic console
dispatch. Isolation avoids writes to the ordinary profile/production/game files.
**Consequence:** Steam/graphics access remains necessary; cleanup targets only the
owned process. Missing/stale/crashed evidence stays incomplete; no headless or
general gameplay automation capability is implied.

## D006 — Separate effect coverage from mission dispatch (2026-10-03)

**Decision:** Report STATIC/LOGIC/EFFECT/WIRING separately from END-TO-END. Keep
Nantes completion and run-effects calibration diagnostics outside required `all`.
**Context:** `complete_mission` recorded state without reward; a native `mission`
candidate remained incomplete; positive numerical calibration contradicted named
province-modifier queries. See [coverage](testing/runtime-coverage.md).
**Consequence:** Effect PASS cannot become mission PASS; failed presence probes
retain their verdicts. Use independent numerical apply/remove contracts and record
false ID queries as unresolved observations, not proof that the reward is absent.

## D007 — Conditional reward ownership and equivalence (2026-10-03)

**Decision:** Extract only shipbuilding and borders conditional rewards into named
production scripted effects; leave trivial Nantes inline and use the real installed
textiles helper. Compare exact original inline adapters before extraction and actual
production calls afterward; retain full ordered AST-equivalence evidence.
**Context:** [Mechanics guide](modding/shared-mission-reward-effects.md) identifies
conditional ownership/direct testability and rejects extraction just for test count.
**Consequence:** Static wiring and native before/after tests support equivalence;
comparison adapters are historical test-only infrastructure, not reward dispatch.

## D008 — Fixed observations, constant logs and negative controls (2026-10-03)

**Decision:** Use fixed expected deltas and 0.001-wide intervals, constant assertion
markers, safe resource baselines and staged-only behavioral faults.
**Context:** Narrower intervals falsely failed original rewards; extreme negative
DIP reset was discarded. A stack-overflow crash followed dynamic log expressions,
whose causation is unconfirmed; constant-marker runs succeeded. Valid-script
mutations demonstrated behavior failure beyond CWTools. [Suite evidence](testing/runtime-regression-suite/README.md).
**Consequence:** Do not reintroduce dynamic expressions to this suite, weaken
expectations to pass mutations, or count crashes as behavior evidence.

## D009 — Persistent documentation ownership (2026-10-03 bootstrap)

**Decision:** Use concise `AGENTS.md`, distinct project/design/status/roadmap/
decision/testing documents and living substantial-task plans in `.agent/plans/`.
**Context:** The user's documentation-only migration requested durable context
without inventing intent or modifying behavior.
**Consequence:** Tool READMEs and scenario reports remain detailed sources;
historical prose receives current-context notes, raw evidence stays unchanged,
and completed plans propagate durable facts to the relevant documents.

## D010 — Recovery belongs to the native lifecycle (2026-10-03)

**Decision:** Extend `runtime-tests/run.mjs` through internal lifecycle/process
components, retaining preparation, validation, collector and contract evaluation.
Use fresh profiles per bounded attempt; default one retry after verified cleanup.
Track current-nonce progress within the existing total deadline. Never retry
assertion/integrity failures or kill ambiguous/ordinary sessions by name.
**Context:** The user explicitly authorized crash/hang/reporter resilience within
the existing infrastructure. Native crash simulation observed an owned reporter
with an isolated `--crashdir`, and both crash/termination exercises recovered.
**Consequence:** Failed attempts remain incomplete with raw diagnostics; final
success belongs to a separate fresh attempt. PID/creation/executable identity,
recorded ancestry and isolated-path evidence bound stale cleanup. See the
[recovery report](testing/runtime-recovery/README.md) for evidence, the subsequent
verified real-freeze playtest and remaining unidentifiable-dialog playtests.
Manual Nantes automation is unchanged.

## D011 — Faithful claims require actual dispatch evidence (2026-10-03)

**Decision:** Add a bounded `nantes-claim` case within the existing native runner.
Use supported Codex window/screenshot-scoped input, GUI/mission-derived geometry,
fresh original-owned PID/creation/executable/userdir/HWND checks before every
action, independent native saves and explicit refusal for the unready fixture.
Do not copy rewards, inject processes or create a primary sidecar architecture.
**Context:** Fresh native `mission`, `complete_mission` and `mission_tree` save
completion without cloth rewards. Their query-only historical conclusions are
superseded by saved/UI state, with raw failures preserved. Available accessibility
has no mission controls; keyboard/shortcut dispatch was not established.
**Consequence:** One Codex-operated real Nantes claim, reward/dialog/save/downstream
contract and negative refusal are verified; required `all` retains its narrower
coverage. Active Codex and the verified layout are dependencies; standalone use,
other geometry and UI-stage crash/locked-desktop cases remain open. See the
[report and playtest list](testing/runtime-mission-claim/README.md).

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
and the [full proposed design](usa/DESIGN.md) have separate evidence boundaries;
see the [native report](testing/american-century/README.md).
