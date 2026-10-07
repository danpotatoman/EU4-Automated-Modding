# Framework design and ownership

Owner: repository/framework
Last updated: 2026-10-06

## Ownership hierarchy

Repository state owns policy, architecture, shared-tool capability status and
development boundaries. Shared runtime/modding knowledge owns reusable mechanics,
protocols, dependencies and limitations. Each independent mod owns its adopted
gameplay design, implementation state, roadmap and coverage. Task plans own
authorization/progress; generated evidence owns a specific run/build/scenario.
The [project map](PROJECT.md) gives canonical locations.

## Validation architecture

Production source -> static validation and hashed staging -> owned isolated native
process -> assertions/actual input -> independent save checks -> scoped verdict.
Static acceptance, scripted effect PASS, real-button completion, reward values,
persistence and lifecycle cleanup are separate evidence dimensions. A framework
experiment names its mod workload; a mod result never becomes another mod's PASS.
Public replays test retained evaluators, not a new game session.

## Safety and evidence boundaries

One shared runner owns bounded attempts, a global lifecycle lock and identity-based
cleanup. Native game files and ordinary profiles remain read only to the harness;
test-only hooks/history copies live in ignored isolated profiles. Mod directories
contain exportable game content only. Deployment records protect destination/hash
ownership separately from runtime test profiles. Configuration and raw evidence
remain local; public evidence is separately reviewed and has its own provenance.

## Current interfaces and deferred implementation

Documentation owners are explicit after Phase 1. Phase 2A adds an owner/test
registry, canonical owner adapters, shared geometry/AST/save-block/protocol helpers,
and explicit native `-Mod`/non-launching `-ListTests`. The runner validates selection
before reading configuration or creating profiles/reports. Legacy omitted-Mod
routing remains available; `-Test all` stays the four Brittany regressions only.
Phase 2B adds [evidence/report identity and applicability](runtime/evidence-identity.md)
under separate authorization. Operational storage, deployment protections and
lifecycle/input semantics stay intact. Phase 2C separates shared machine settings
from [canonical owner metadata](runtime/configuration-ownership.md), with equivalent
Node/PowerShell descriptor resolution and isolated source-backed QA. Config identity
does not register native contracts or replace evidence identity. See
[framework roadmap](ROADMAP.md#deferred-ownership-refactor) and the
[governing plan](../.agent/plans/2026-10-06-project-state-ownership.md).

## Mod design compatibility

The former root gameplay design belongs to [Brittany](mods/brittany_missions/DESIGN.md).
American Century has its own [adopted design](mods/american_century/DESIGN.md).
Old root anchors below remain for historical references and route to Brittany.

<a id="established-design-and-open-questions"></a>
<a id="diplomatic-choice"></a>
<a id="homeland-and-maritime-development"></a>
<a id="presentation-conventions-evidenced-in-content"></a>
<a id="open-design-questions"></a>
