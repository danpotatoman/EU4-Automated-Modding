# EU4 modding workspace

[README.md](README.md) is the public entry point; [setup](docs/SETUP.md),
[contributing](CONTRIBUTING.md), [publication audit](docs/PUBLICATION.md) and
[repository hygiene](docs/REPOSITORY_HYGIENE.md) cover reproducibility and future
development. Public textual evidence is reviewed/redacted; raw game captures and
machine configuration remain ignored locally.

Open `eu4-modding` as the project folder in Codex or VS Code. Each source mod lives
under `mod/<mod_name>/`; shared development material stays outside mod content.

The durable project map is [docs/PROJECT.md](docs/PROJECT.md). Start with
[current status](docs/STATUS.md) for implementation and verification boundaries,
[design](docs/DESIGN.md) for established intent, [roadmap](docs/ROADMAP.md) for
follow-up work, and [decisions](docs/DECISIONS.md) for important choices.

[AGENTS.md](AGENTS.md) defines working instructions;
[.agent/PLANS.md](.agent/PLANS.md) defines living execution plans.
[docs/TESTING.md](docs/TESTING.md) indexes static/tool/native validation and the
manual test workflow, with links to the detailed tool READMEs and scenarios.

Reusable mechanic guides remain in [docs/modding/](docs/modding/README.md).
The [default environment](docs/testing/environment.md) and
[runtime coverage](docs/testing/runtime-coverage.md) retain their specific roles.
Production content, static acceptance, deployment and scoped runtime passes do
not establish whole-mod export readiness.

The USA project lives in `mod/american_century/`, with its adopted source of truth
in [docs/usa/DESIGN.md](docs/usa/DESIGN.md), active execution plan under
`.agent/plans/`, reusable colonial mechanic guide under `docs/modding/`, and
[bounded native evidence/playtests](docs/testing/american-century/README.md).
It shares `tools/runtime-tests/` with Brittany; no second runtime system is used.
