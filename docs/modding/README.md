# Modding knowledge collection

Consult relevant guides before implementing a mechanic. Check their game version
and DLC assumptions against the current installation. The lookup commands are
documented in `tools/vanilla-reference/README.md`.

Keep reviewed implementation guides here, and local-only vanilla source examples
with provenance under ignored `examples/`. Do not stage downloaded game excerpts;
public guides use relative source paths/hashes and minimal project adaptations.
A captured example is a documentation draft:
it is not evidence that an adapted implementation has passed validation or works
in game. Build this collection as mechanics are encountered.

Each guide should record purpose, applicable game version, source examples and
dependencies, required files/scopes/localisation, a minimal adapted example,
pitfalls, validation steps, concrete playtests, unresolved assumptions and results.
Distinguish vanilla evidence, static validation and actual in-game verification.

Before reusing examples run `./tools/vanilla-reference.ps1 -Action verify`.
Matching version and source hashes support freshness, but do not prove behavior.
Link additional dependency examples when they matter to the mechanic.

Native test scripting: [runtime script assertions](runtime-script-assertions.md),
with [actual preview-gate execution evidence](../testing/runtime-preview-gate/README.md).
Mission automation: [native mission completion](native-mission-completion.md),
with [historical state-only diagnostic](../testing/runtime-nantes-market/README.md).
American transitions: [colonial origins, vanilla formation and republic choices](american-colonial-missions.md),
with [USA slice evidence and open campaign scenarios](../testing/american-century/README.md).
Faithful input: [owned Codex driver and deterministic GUI geometry](faithful-mission-input.md),
with [verified real Nantes claim, fresh commands and playtest limits](../testing/runtime-mission-claim/README.md).
Console effect probes: [run-file dispatch, scope and observability](console-run-effects.md).
Conditional reward extraction: [named mission rewards and native regressions](shared-mission-reward-effects.md),
with [coverage manifest](../testing/runtime-coverage.md).

Ordinary mission-button investigations: [bounded manual fixtures](ordinary-mission-button-fixtures.md),
with [current Nantes handoff](../testing/runtime-nantes-market/manual-session.md).
