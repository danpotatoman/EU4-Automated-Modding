# EU4 modding project

## Public-repository hygiene

Start at [README](README.md) for setup. Follow
[repository hygiene](docs/REPOSITORY_HYGIENE.md) before commits/publication.
Keep secrets, personal paths, real local config, profiles/logs/saves/dumps, screenshots,
downloaded vanilla excerpts/assets and staged game-history copies out of public Git.
Use ignored `config.local.json` or documented environment variables; retain portable
examples/defaults. Inspect new files and staged diffs; run the publication audit and
appropriate tests. Preserve failed verdicts and local raw evidence; public evidence
needs path/ownership review and separate provenance. Update status/coverage/plans
when capabilities change. Never alter unrelated EU4 sessions or clean unowned processes.
The original private history is archived locally; the active workspace has fresh Git
metadata documented in [PUBLICATION](docs/PUBLICATION.md). Keep that archive ignored;
no push is authorized by cleanup work.

This shared workspace currently develops `mod/brittany_missions/`. Verified native
evidence targets **EU4 1.37.5.0 Inca (491d)**; deployment metadata uses `1.37.*`.
Check the installed version and relevant DLC before reusing mechanics; broader
compatibility is not established.

## Durable context and plans

Start with [project](docs/PROJECT.md) and [current status](docs/STATUS.md).
[Design](docs/DESIGN.md) records supported intent; [roadmap](docs/ROADMAP.md)
records follow-up work; [decisions](docs/DECISIONS.md) records important choices;
[testing](docs/TESTING.md) explains validation and evidence limits.

Use [.agent/PLANS.md](.agent/PLANS.md) for any substantial feature, investigation,
migration or refactor beyond a small atomic change. Read applicable plans under
`.agent/plans/`, keep active plans updated during work and before handoff, and
propagate durable findings to the appropriate `docs/` files on completion.

Ideas and plans are not implementation authorization. Follow `.agent/PLANS.md`
for design adoption and execution authorization; once authorized, work autonomously
within the approved scope and repository rules without repeated routine confirmations.

## Integrity and implementation

- Each mod lives in `mod/<mod_name>/`. Keep shared tools, tests, instructions,
  documentation, reports and caches outside mod directories. Preserve existing
  script/localisation encoding. Treat installed vanilla game files as read only.
- Keep mod directories suitable for export as game content, but do not claim
  export readiness until required descriptors and in-game behavior are verified.
- Before designing a mechanic, consult [modding guides](docs/modding/README.md).
  Verify version/DLC applicability and uncertain behavior against current vanilla
  definitions and dependencies. If the guide is absent/incomplete/outdated,
  document the reusable pattern there **before implementing**: purpose, required
  files/scopes, minimal example, vanilla paths/version, localisation/dependencies,
  pitfalls and validation/playtests. Update findings afterward.
- Distinguish vanilla examples, static acceptance and in-game verification.
  Record untested assumptions explicitly. Flag uncertain IDs/effects, scopes,
  triggers, rewards, tree selection/swaps/refresh, persistence and DLC interactions
  in progress updates and shared documentation. Final handoffs must include a
  clearly labeled playtest list with affected files, evidence, starting conditions,
  steps, expected behavior and failure signs (or links to those scenarios).
  Keep items open until relevant evidence resolves them; continue independent work.

## Validation and runtime testing

After EU4 script or localisation changes, run from the project root:

```powershell
./tools/validate-cwtools.ps1
# Other mods: ./tools/validate-cwtools.ps1 -Mod other_mod
```

Read `tools/cwtools/reports/<mod>/latest.json` or `latest.txt`. Exit 0 means
completed without errors; 1 means completed with script errors; 2 means failed or
timed out. Warnings do not cause exit 1. Never report running/failed validation as
successful. Judge questionable findings against installed vanilla examples;
static validation does not establish gameplay. The helper uses
`tools/cwtools/config.json` and launches CWTools itself; VS Code need not be open.
Use `-RebuildCache` if vanilla was manually changed outside this workflow;
game/CWTools version changes invalidate the cache automatically. Restore missing
rules with `./tools/cwtools/install-rules.ps1` with network access.

Run relevant automated/tool checks from [TESTING.md](docs/TESTING.md). For covered
production behavior changes, run the named native contract; run `-Test all` after
shared trigger/effect/runner changes or before a broader handoff. Keep failures and
coverage boundaries visible; never weaken assertions just to obtain PASS.

Use [default test environment](docs/testing/environment.md) unless the user
specifies otherwise: its 18 DLC and only the mod under test. Confirm actual
launcher configuration before testing; preference is not activation evidence.
Keep scenarios, baseline references and playtest results in `docs/testing/`.
Follow [TESTING.md](docs/TESTING.md) for isolated profiles, manual gameplay,
owned-process cleanup and calibration limits. A clean log or effect PASS does
not establish normal mission completion or release readiness.
