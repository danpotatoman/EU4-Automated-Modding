# Persistent documentation bootstrap

Status: complete
Last updated: 2026-10-03

## Goal

Capture the repository as it exists and establish durable documentation and living
execution plans for future Codex work.

## Background / Context

The user requested a documentation-only migration. Existing context is distributed
across `AGENTS.md`, `PROJECT_STRUCTURE.md`, tool READMEs, mechanics guides and
portable playtest reports. The working tree already contains modified and
untracked runtime-testing and production reward-extraction work; preserve it.

## Requirements

- Create the requested six `docs/` overview files plus plan conventions/directory.
- Keep `AGENTS.md` concise and preserve its documentation-first, integrity,
  validation and uncertainty requirements through direct instructions and links.
- Recover runtime status from scripts, tests, JSON reports and native logs.
- Review contradictions, duplication, local links and scope of changed files.

## Non-goals

Gameplay, production scripts/localisation, test behavior, deployment, game launches,
roadmap implementation and an export-readiness certification.

## Relevant Files / Systems

`mod/brittany_missions/`; `tools/runtime-tests/`; all shared tool READMEs;
`docs/modding/`; `docs/testing/`; `tools/cwtools/config.json`;
`tools/deployment/config.json`; installed read-only `launcher-settings.json`.
The durable entry points will be `docs/PROJECT.md` and `.agent/PLANS.md`.

## Implementation Plan

1. Inventory existing instructions, scripts, tools, evidence and working-tree state.
2. Define document ownership and capture implementation/design/status separately.
3. Add plan convention; condense instructions and replace duplicate structure map
   with navigation. Annotate historical reports where their wording is now stale.
4. Check documentation links, diff integrity and existing evidence replay tests.
5. Publish findings and recommend the next substantive plan without starting it.

## Progress

- [x] Inspect existing instructions, content, tool code, tests and evidence.
- [x] Confirm installed version and production hashes against final suite evidence.
- [x] Establish plan convention and this migration record.
- [x] Write durable documents and annotate historical experiment context.
- [x] Finish contradiction/link review and confirm behavior files untouched.
- [x] Run all 17 existing runtime evaluator/wiring/evidence tests (PASS).
- [x] Complete plan; durable findings published and handoff prepared.

## Discoveries

- Installed metadata reports EU4 1.37.5.0 Inca (491d); deployment advertises
  `1.37.*`, which does not establish compatibility across that version family.
- Final native suite evidence matches all 11 current production file hashes.
- User-reported selector refresh/persistence passes exist, with environment and
  exact reward limits. Automated coverage has no end-to-end mission dispatch.
- `run-effects` prose predates custom production effects; early preview report
  describes console mechanisms as candidates that later work partially verified.
- Ignored combined check remains failed from an older build; later CWTools reports
  are complete with zero errors/58 warnings. Do not call the combined check passed.
- Git requires a per-command `-c safe.directory=...` for this session's ownership;
  no global configuration change is needed.
- Six mission series exclude random map setup, whereas slot 4 checks only BRI.
  Recorded as an open design/support question; no behavior change made.

## Decisions

Keep detailed workflows, scenarios and immutable raw evidence in their existing
locations. Overview documents link to them. Annotate historical prose without
rewriting raw results. Record unresolved behavior in status/roadmap with concrete
scenario links. See `docs/DECISIONS.md` for durable choices.

## Validation

All checks below completed on 2026-10-03:

- Existing Node fallback executable ran `--test` with
  `tools/runtime-tests/evaluate.test.mjs`, `wiring.test.mjs` and
  `regression-evidence.test.mjs`: **17 passed, 0 failed**, exit 0. These replay
  evidence/check wiring; they are not new native runs.
- In-memory Markdown sanity check covered 23 documentation files and 169 local
  links, including anchors: no missing targets/anchors or conflict markers.
  All 14 changed/new Markdown files passed trailing-whitespace/final-newline checks.
- `git -c safe.directory=X:/eu4-research
  diff --check -- AGENTS.md PROJECT_STRUCTURE.md docs .agent`: exit 0.
- Before/after SHA-256 inventory compared 274 pre-existing project source/docs/
  evidence files. Only six Markdown files changed: `AGENTS.md`,
  `PROJECT_STRUCTURE.md`, selector scenario and preview/Nantes/run-effects READMEs.
  Production, tooling, tests, configuration, `.gitignore` and raw evidence untouched.
  Six overview documents and two plan documents were added.
- No fresh native run, deployment, script/localisation change or CWTools run.
  Retained CWTools results are explicitly historical in `docs/STATUS.md`.

## Remaining Issues / Follow-up

See `docs/ROADMAP.md`; no roadmap item was started. `docs/STATUS.md` owns recovered
current evidence and conflicts, `docs/TESTING.md` owns validation workflow/limits,
and `docs/DECISIONS.md` owns durable choices. Recommended next substantive plan:
faithful Nantes readiness/completion investigation, when authorized. The user
request's documentation migration is complete; gameplay uncertainties remain open.

## Completion Criteria

All requested documents exist, have distinct responsibilities and working local
links; current implementation and evidence limits are accurately distinguished;
only documentation changes; checks reported truthfully; durable context linked
from `AGENTS.md`; migration marked complete with follow-up work still open.
