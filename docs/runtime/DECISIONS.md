# Shared EU4 runtime decisions

Owner: shared EU4 runtime/tooling
Documentation ownership updated: 2026-10-06

Original decision IDs/dates/rationale are preserved. Mod examples identify the
workload; they do not establish cross-mod verification. Current status and next
work belong in the owner's status/roadmap, not this historical decision log.

## D005 — Bounded isolated native assertions (2026-10-03 evidence)

**Decision:** Run actual production predicates/effects in a hashed staged mod,
fresh `-userdir` profile and owned bounded EU4 process; evaluate native nonce/date/
version-qualified markers and unchanged fixture files.
**Context:** [Preview evidence](../testing/runtime-preview-gate/README.md) demonstrates
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
province-modifier queries. See [coverage](../mods/brittany_missions/testing/coverage.md).
**Consequence:** Effect PASS cannot become mission PASS; failed presence probes
retain their verdicts. Use independent numerical apply/remove contracts and record
false ID queries as unresolved observations, not proof that the reward is absent.


## D008 — Fixed observations, constant logs and negative controls (2026-10-03)

**Decision:** Use fixed expected deltas and 0.001-wide intervals, constant assertion
markers, safe resource baselines and staged-only behavioral faults.
**Context:** Narrower intervals falsely failed original rewards; extreme negative
DIP reset was discarded. A stack-overflow crash followed dynamic log expressions,
whose causation is unconfirmed; constant-marker runs succeeded. Valid-script
mutations demonstrated behavior failure beyond CWTools. [Suite evidence](../testing/runtime-regression-suite/README.md).
**Consequence:** Do not reintroduce dynamic expressions to this suite, weaken
expectations to pass mutations, or count crashes as behavior evidence.


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
[recovery report](../testing/runtime-recovery/README.md) for evidence, the subsequent
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
[report and playtest list](../testing/runtime-mission-claim/README.md).


## American Century workload adaptation

The shared-runner/timeout/startup-identity parts of [D012](../mods/american_century/DECISIONS.md)
are a dependency choice demonstrated using a USA fixture. They do not adopt USA
gameplay as a framework requirement or certify other mods.
