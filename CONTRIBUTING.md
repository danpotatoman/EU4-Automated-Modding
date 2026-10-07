# Development workflow

Owner: repository/framework workflow


This remains an active research/modding workspace. Read [setup](docs/SETUP.md),
[current status](docs/STATUS.md) and [testing](docs/TESTING.md) before changing behavior.
Codex sessions also follow [AGENTS.md](AGENTS.md) and [.agent/PLANS.md](.agent/PLANS.md).
Then select [the owning mod](docs/mods/README.md) for its current state/design/tests,
or [shared runtime knowledge](docs/runtime/README.md) for a framework task. Keep
design proposals separate from authorized implementation.

Keep each mod in `mod/<name>/`; tooling, fixtures and documentation belong outside it.
Preserve game-script/localisation encoding and installed game files. Consult the
relevant mechanic guide and installed version/DLC definitions before implementing
uncertain scopes/effects. Document reusable patterns and actual evidence boundaries.

Run `node tools/test-offline.mjs` for tooling changes. Script/localisation changes
require CWTools. Covered behavior needs its named native contract; shared native
runner changes need Brittany `-Test all` plus affected mod/input/save contracts.
That all suite is four Brittany logic/effect/wiring cases, not cross-mod coverage;
prefer explicit native `-Mod <source-id>` and inspect `-ListTests` for supported contracts. UI/persistence claims require the corresponding
ordinary-button/save scenarios. Record failures without changing assertions to pass.
Only clean identity-verified processes owned by the harness.

Before committing, follow [repository hygiene](docs/REPOSITORY_HYGIENE.md): inspect
new files/diffs, audit paths/secrets/size/ownership, keep raw runtime material local
and update the appropriate framework/per-mod status/coverage/plan when capabilities change. Small reviewed evidence may be retained;
bulk logs/saves/screenshots do not belong in Git. Never force-add an ignored game
reference without resolving its provenance and redistribution status.

License selection is pending the repository owner's review. Contributions should
identify their origin and any third-party material so a future project-code license
can be scoped accurately. No game files, credentials or personal configuration.

For documentation-only work, run link/publication/whitespace/scope checks; preserve
protected production/historical evidence bytes. Do not run source-backed tool
self-tests merely to check prose or rewrite old results into new verdicts.
