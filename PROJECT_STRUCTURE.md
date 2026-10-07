# EU4 modding workspace map

Owner: repository/framework navigation
Last updated: 2026-10-06

[README](README.md), [setup](docs/SETUP.md), [contributing](CONTRIBUTING.md),
[hygiene](docs/REPOSITORY_HYGIENE.md) and [AGENTS](AGENTS.md) define repository work.
Production lives in `mod/<source-id>/`; shared development material stays outside.

| Task owner | Canonical reading path |
| --- | --- |
| Framework/tooling | [PROJECT](docs/PROJECT.md) -> [STATUS](docs/STATUS.md) -> [DESIGN](docs/DESIGN.md)/[ROADMAP](docs/ROADMAP.md) -> [TESTING](docs/TESTING.md)/[runtime knowledge](docs/runtime/README.md) -> relevant tool README and plan |
| Brittany Missions | [PROJECT](docs/mods/brittany_missions/PROJECT.md) -> [STATUS](docs/mods/brittany_missions/STATUS.md) -> [DESIGN](docs/mods/brittany_missions/DESIGN.md)/[ROADMAP](docs/mods/brittany_missions/ROADMAP.md) -> [testing/coverage](docs/mods/brittany_missions/testing/README.md) -> shared guide and owning plan |
| American Century | [PROJECT](docs/mods/american_century/PROJECT.md) -> [STATUS](docs/mods/american_century/STATUS.md) -> [DESIGN](docs/mods/american_century/DESIGN.md)/[ROADMAP](docs/mods/american_century/ROADMAP.md) -> [testing/coverage](docs/mods/american_century/testing/README.md) -> shared guide and active plan |

[Mod registry](docs/mods/README.md) indexes independent projects;
[shared modding knowledge](docs/modding/README.md) records reusable mechanics;
[plans](.agent/PLANS.md) record task scope/authorization/progress;
[historical evidence index](docs/testing/README.md) records unchanged bundle owners.
Generated state/raw evidence/configuration/private history remain ignored.

Phase 1 separated documentation owners; Phase 2A adds owner-specific runtime
adapters, shared helpers and explicit native -Mod/-ListTests. Both mods share one
runner/global lock; native all remains Brittany's four-case regression.
[Deferred config/report work](docs/ROADMAP.md#deferred-ownership-refactor) requires
separate authorization. No release or broader compatibility follows from
static acceptance, development deployment or this organization change.
