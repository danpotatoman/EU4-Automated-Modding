# Execution plans

Create a plan in [plans/](plans/) before a substantial feature, investigation,
migration or refactor that cannot reasonably be completed as one small atomic
change. Small edits need no plan. Read relevant existing plans before starting;
continue an applicable active plan rather than creating competing execution state.

Use `YYYY-MM-DD-short-task-name.md`. Keep completed plans in place with status
`complete`; do not treat unfinished checkboxes in a completed plan as implemented
features. Record status (`active`, `blocked`, `complete`), last update and scope at
the top. A blocked plan must state the dependency and the next action needed.
Plans document execution; creating one does not authorize implementation or work
beyond the user's request.

Each plan must be usable without chat history. Include exact repository paths,
commands, evidence references, constraints and the next actionable step. Separate
observations from hypotheses and static checks from native or manual evidence.
Never include secrets or depend solely on ignored local reports.

Update an active plan during work: check off finished steps, record discoveries,
decisions, deviations, validation results and remaining work. Update it before
handoff or interruption. On completion, propagate durable facts to the relevant
`docs/` source; link that source from the plan instead of maintaining duplicate
project status. Do not silently close unresolved playtests.

## Design adoption and execution authorization

Brainstorming, speculative ideas, open design questions, roadmap entries and
conversational discussion are not implementation requirements merely because they
exist. A player-facing or otherwise design-sensitive idea becomes implementation
scope only after the user explicitly adopts or authorizes the relevant design or
task. Keep unadopted possibilities separate from approved requirements in the plan.

For substantial design-sensitive work, prefer this lifecycle:

1. Establish the goal/design with the user.
2. Create or update the execution plan with the agreed scope and constraints.
3. Review the plan when appropriate to resolve consequential design/scope choices.
4. Obtain authorization to execute.
5. Implement while maintaining the plan.
6. Validate and record actual results and limits.
7. Propagate durable findings to the appropriate repository documentation.
8. Mark the plan complete when its completion criteria are met.

Existing explicit user authorization counts; this lifecycle does not require a
new approval if the user has already authorized the relevant implementation.
Record the adopted scope and execution authorization in the plan's Goal or
Requirements so a fresh session can distinguish approved work from proposals.

Once implementation is explicitly authorized, work autonomously within the
approved plan and repository rules. Do not repeatedly request confirmation for
ordinary implementation choices. Escalate only genuine unresolved user/design
decisions, unsafe/destructive actions, or blockers outside the authorized scope.
Do not silently expand scope or adopt a new design through a plan edit; seek the
user's authorization for that change while continuing independent authorized work.

## Standard format

```markdown
# Task title

Status: active
Last updated: YYYY-MM-DD

## Goal
Concrete outcome and scope.

## Background / Context
Existing state, evidence and reason for this task; no chat dependency.

## Requirements
Observable requirements and constraints, including integrity rules.

## Non-goals
Explicit exclusions.

## Relevant Files / Systems
Source, guides, tools, evidence and dependencies with repository paths.

## Implementation Plan
Ordered, independently reviewable steps, with dependencies where relevant.

## Progress
- [ ] Step; current next action or blocker.

## Discoveries
Dated observations, evidence and unresolved hypotheses.

## Decisions
Choice, recoverable rationale and deviations; link durable decision entries.

## Validation
Commands/scenarios, actual results and evidence paths; mark not-run checks.

## Remaining Issues / Follow-up
Unresolved work, concrete playtest steps or links, ownership/dependencies.

## Completion Criteria
Measurable criteria; distinguish completion of this task from release readiness.
```

## Plan index

- [Publication preparation](plans/2026-10-05-publication-preparation.md): complete;
  reviewed staged source in clean ongoing Git; original history privately archived;
  no remote/push/commit.

- [American Century](plans/2026-10-04-american-century.md): active; user-authorized
  USA design, isolated real-button vertical slice and subsequent branch expansion.

- [Faithful mission automation](plans/2026-10-03-faithful-mission-automation.md):
  complete; bounded Codex-driven real Nantes claim, independent saved production
  rewards, fresh unready refusal and clean native suite verified. Further layouts
  and standalone UI driver remain proposals in the linked report.

- [Real native freeze validation](plans/2026-10-03-runtime-freeze-validation.md):
  authorized narrow follow-up to close the real after-BEGIN suspension gap.

- [Native lifecycle recovery](plans/2026-10-03-runtime-recovery.md): authorized
  crash/hang, owned-remnant cleanup and bounded retry extension of the runner.

- [Documentation bootstrap](plans/2026-10-03-documentation-bootstrap.md)
  captures this migration. Subsequent substantial tasks should add their plan here.
- [Nantes faithful readiness and completion](plans/2026-10-03-nantes-faithful-completion.md)
  complete: faithful ordinary Nantes behavior verified manually, including both
  permanent rewards, Textiles readiness, once-only action and save/reload.
  Execution was authorized on 2026-10-03; raw query FAILs remain retained.
  See the [final report](../docs/testing/runtime-nantes-market/faithful-completion-2026-10-03.md)
  and existing [roadmap](../docs/ROADMAP.md) for scope and remaining boundaries.
