# Repository and framework project

Owner: repository/framework
Last updated: 2026-10-06

This repository develops a shared EU4 automation/testing framework and independent
mod projects. Production game content lives under `mod/<source-id>/`; tools,
instructions, documentation, tests and generated state stay outside those folders.
The [mod index](mods/README.md) identifies each project's canonical documents.

## Repository organization

| Location | Responsibility |
| --- | --- |
| `AGENTS.md`, root README/map/contributing | Repository instructions and navigation |
| `docs/{PROJECT,DESIGN,STATUS,ROADMAP,DECISIONS,TESTING}.md` | Framework identity, architecture, current capability evidence, next work, choices and validation |
| `docs/SETUP.md`, `docs/runtime/`, `docs/modding/` | Shared setup, runtime/tooling knowledge and reusable mechanics |
| `docs/mods/<source-id>/` | Each mod's design/state/roadmap/decisions/testing |
| `.agent/PLANS.md`, `.agent/plans/` | Owner-labelled task authorization and execution state |
| `tools/` | Shared implementations, current mod-specific adapters/configuration, fixtures and tool READMEs |
| `docs/testing/` | Shared environment preference and indexed, preserved historical/public evidence |
| Ignored tool output and `.local/` | Machine configuration, caches, reports, deployment ownership, profiles and raw evidence |

## Technical context

Recorded native evidence targets EU4 **1.37.5.0 Inca (491d)**. Descriptor metadata
uses `1.37.*` and does not establish other-version compatibility. CWTools retained
reports identify 0.10.31; the 2026-10-05 offline validation used Node 24.19.0.
The [shared environment](testing/environment.md) records the required/default 18
DLC preference; each native result must separately record actual activation.

PowerShell entry points call Node implementations (deployment has a PowerShell
adapter). Tools stage byte-preserving source copies, validate saved files, collect
logs, derive mission geometry and supervise identity-owned native processes. They
do not establish gameplay from clean logs or completion flags alone. See
[framework design](DESIGN.md), [status](STATUS.md) and [testing](TESTING.md).

Phase 1 separated documentation owners. Phase 2A adds canonical runtime adapters
under `tools/runtime-tests/contracts/<source-id>/`, shared helpers, a registry and
explicit native -Mod/-ListTests. Legacy inference remains compatible. Brittany
operational namespaces remain unchanged; Phase 2B adds
[explicit report provenance and applicability](runtime/evidence-identity.md);
Phase 2C separates [machine settings and owner metadata](runtime/configuration-ownership.md)
and isolates source-backed browser/self-test output. Native fixture/registry
bindings remain independent of development metadata. [Remaining debt](ROADMAP.md#deferred-ownership-refactor)
is documented without authorizing further work.
Setup uses ignored local overrides/environment variables; [hygiene](REPOSITORY_HYGIENE.md)
and [publication history](PUBLICATION.md) govern evidence/privacy/ownership.

## Existing content

The former root mod inventory is now owned by
[Brittany](mods/brittany_missions/PROJECT.md) and
[American Century](mods/american_century/PROJECT.md).
