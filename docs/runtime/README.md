# Shared EU4 runtime and tooling knowledge

Owner: shared EU4 runtime/tooling
Last updated: 2026-10-06

Current framework capabilities/results belong in [root status](../STATUS.md),
interfaces/exit semantics in [testing](../TESTING.md), prerequisites in
[setup](../SETUP.md), runtime choices in [decisions](DECISIONS.md), and reusable
mechanics in [modding guides](../modding/README.md). This index is knowledge, not
another status ledger or either mod's gameplay design.

## Evidence layers and source ownership

[Generated evidence schema 2](evidence-identity.md) defines source owner versus
storage namespace, production/staged/fixture/synthetic scope, build/run/attempt
identity, actual versus intended environment, finite legacy compatibility and
freshness/conflict guards. Historical records retain their bytes and verdicts.

STATIC checks syntax/references/layout; LOGIC and EFFECT exercise specific scripted
predicates/rewards; WIRING checks mission calls; END-TO-END requires actual dispatch,
independent rewards/readiness and, where claimed, saved persistence. Cleanup success
belongs to lifecycle evidence, not a gameplay verdict. Source/build/scenario/game
version/DLC/nonce/attempt must match before reusing a result. Offline replays only
exercise evaluators against retained observations.

## Mechanisms and known limits

| Knowledge | Supported observation / pitfall | Source |
| --- | --- | --- |
| Isolated native lifecycle | Identity-owned process/profile cleanup, one global lock, bounded fresh retries; unrelated EU4 refused. Native crash/freeze demonstrated with Brittany workload; unusual unidentifiable dialogs remain open. | [Runner interface](../../tools/runtime-tests/README.md), [historical recovery](../testing/runtime-recovery/README.md) |
| Startup and console batches | Profile-root plain UTF-8 effect files with CRLF run commands and auto_run; country/province nesting observed in BRI fixtures. Other lookup paths/extensions and arbitrary scopes not established. | [Console effects](../modding/console-run-effects.md), [assertions](../modding/runtime-script-assertions.md) |
| Mission completion commands | Nantes complete_mission/mission/tree candidates record completion without production rewards. Console completion query can remain false despite native saved/UI state. | [Completion knowledge](../modding/native-mission-completion.md), [dated Nantes investigation](../testing/runtime-mission-claim/README.md) |
| Numeric observations | Named province-modifier query can be false despite positive 0 -> 0.15 -> 0 values. Fixed deltas and 0.001 intervals are calibrated, not universal numerical guarantees. Helper max-stability branch remains open. | [Calibration workload](../testing/runtime-run-effects/README.md), [reward pattern](../modding/shared-mission-reward-effects.md) |
| Actual input and geometry | Owned-window lease/identity, screenshot inspection, GUI/mission-derived points; historical active Codex Windows adapter required. Known geometry only; accessibility/keyboard/general unattended bot not verified. | [Faithful input](../modding/faithful-mission-input.md), [manual fixture pattern](../modding/ordinary-mission-button-fixtures.md) |
| Native saves/provenance | Plaintext bounded-field oracles are scenario-specific. Nantes ordinary reload changed campaign_id despite load/state evidence; do not assume UUID stability generally. | [Nantes manual record](../testing/runtime-nantes-market/faithful-completion-2026-10-03.md) |
| Formation/CN/reload | USA fixture shows engine CN creation precedes console setup and startup hooks execute again on UI reload; saved identity/state guard prevents setup replay. A fixture does not prove natural colonial campaign assignment. | [Reusable colonial/formation pattern](../modding/american-colonial-missions.md), [dated USA workload](../testing/american-century/README.md) |

Recorded engine target is EU4 1.37.5.0 Inca (491d). The
[environment preference](../testing/environment.md) is separate from actual DLC
activation and from scenario-specific extra DLC. Installed definitions are read
only; cached rules/reference excerpts/raw saves/screenshots stay local. Public
evidence is separately reviewed under [hygiene](../REPOSITORY_HYGIENE.md).

## State and storage boundaries

Vanilla/CWTools caches are shared dependency state. Per-tool reports and deployment
records are already partitioned, but current runtime aliases such as brittany_runtime,
american_runtime and brittany_nantes_manual are storage namespaces, not independent
source mods. Flat timestamp/nonce work directories and active-lifecycle.json stay
unchanged; a public ownership excerpt must never authorize live cleanup.
[Historical evidence index](../testing/README.md) labels workload and owner without
rewriting bytes. [Per-mod testing](../mods/README.md) owns gameplay coverage and
playtests. [Phase 2A ownership](phase2a-ownership-2026-10-06.md) documents the
registry, adapters, shared helpers and compatible explicit selection. Phase 2B
adds report provenance under separate authorization; the
[Phase 2B handoff](phase2b-evidence-identity-2026-10-06.md) records completed
validation, parser correction, retained incomplete attempts and integrity limits.
Phase 2C separates [machine config and mod metadata](configuration-ownership.md)
and completes browser/self-test isolation. Its
[handoff](phase2c-configuration-ownership-2026-10-06.md) records descriptor/parity,
static checks, unchanged native scope and integrity. Remaining work belongs to the
[framework roadmap](../ROADMAP.md#deferred-ownership-refactor), without automatic authorization.

The separately authorized [Brittany deployment repair](brittany-deployment-repair-2026-10-07.md)
restored exactly a missing final LF, verified old owned content, and refreshed source
through normal validated deployment. It changed no Phase 2A/2B/2C semantics or
gameplay evidence. Broader destination edits continue to fail protection.
