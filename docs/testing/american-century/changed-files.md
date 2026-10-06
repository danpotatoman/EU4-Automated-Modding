# Files created or changed by the American Century run

This list describes this run, not all dirty/untracked files in the shared workspace.
Pre-existing Brittany and other work was preserved. No commit/deployment was made.

## Production created

All under `mod/american_century/`:

- `descriptor.mod`
- `missions/USA_Missions.txt` (comment-only vanilla USA override)
- `missions/AMC_USA_Missions.txt`
- `missions/AMC_colonial_origins.txt`
- `common/scripted_triggers/AMC_triggers.txt`
- `common/event_modifiers/AMC_modifiers.txt`
- `events/AMC_constitution.txt`
- `decisions/AMC_atlantic.txt`
- `localisation/english/amc_l_english.yml` (UTF-8 BOM)

## Shared tools

- `tools/run-eu4-test.ps1`: USA case and finite UI timeout range.
- `tools/runtime-tests/run.mjs`: stage/validate/own/inspect USA through existing lifecycle.
- `tools/runtime-tests/mission-claim.mjs`: identified mission geometry across files.
- `tools/runtime-tests/codex-input.mjs`: generic identified mission entry and explicit abort.
- `tools/runtime-tests/usa-slice.mjs`, `usa-slice.test.mjs`: fixtures/protocol/save oracle/negative controls.
- `tools/runtime-tests/README.md`: reproduction and UI evidence boundaries.
- `tools/mission-inspector/scenarios.json`: USA, England and colonial diagnostic scenarios.

## Durable documentation and evidence

- `.agent/PLANS.md`, `.agent/plans/2026-10-04-american-century.md`.
- `docs/usa/DESIGN.md`, `vanilla-provenance.json`.
- `docs/modding/american-colonial-missions.md`, `docs/modding/README.md`.
- `docs/PROJECT.md`, `STATUS.md`, `DESIGN.md`, `ROADMAP.md`, `DECISIONS.md`, `TESTING.md`.
- `PROJECT_STRUCTURE.md` adds the USA documentation map.
- `docs/testing/american-century/README.md`, this list, protection snapshots/audit
  and `evidence/` contain raw results, save excerpts/hashes, logs, input and selected screenshots.

Ignored artifacts remain outside mod directories under `tools/runtime-tests/work/`,
`tools/cwtools/reports/`, `tools/mission-inspector/reports/` and the existing collector.
The protection audit confirms eleven Brittany production files, three ordinary
profile configurations and fourteen installed vanilla reference files unchanged.
