# American Century: USA mission project

Status: active
Last updated: 2026-10-04

## Goal and authorization

The user explicitly authorized autonomous design, implementation and isolated native
playtesting of a substantial USA tree, beginning with reconnaissance, a durable
design and a validated vertical slice. Design choices within that direction require
no repeated approval. This run establishes the architecture; it does not promise a
fully implemented late-game tree before validating the slice.

Source of truth: [USA design](../../docs/usa/DESIGN.md). Production source:
`mod/american_century/`. Shared infrastructure remains under `tools/`.

## Requirements

Preserve Brittany, installed vanilla and the ordinary EU4 profile. Use installed
1.37.5.0/required 18 DLC in isolated profiles, unique `amc_` identifiers. Native
saves recorded 21 enabled DLC; exactly-18-only compatibility remains open. Read vanilla
definitions before adapting mechanics; document patterns before implementing.
Distinguish static, fixture, real UI dispatch, save state and campaign verification.
Never substitute console mission completion for reward-bearing button input.

## Background and systems

Read PROJECT/STATUS/DESIGN/ROADMAP/DECISIONS/TESTING, plans and modding guides.
Existing `runtime-tests/run.mjs` owns staged validation, profiles, collector,
process identity, retries/crash cleanup and UI leases. `codex-input.mjs` supports
real Nantes input; `claim-save.mjs` is scenario-specific. Extend these systems
without introducing a second runner. Native `all` remains Brittany's regression.

## Implementation plan and progress

- [x] Repository and installed-game reconnaissance; actual launcher configuration read.
- [x] Document adopted direction, complete proposed tree and implementation phases.
- [x] Add colonial runway and connected USA slice with localisation and modifiers.
- [x] Generalize mission geometry/input for identified staged missions; add USA contract.
- [x] Static validation/layout and shared tool regression tests (51 Node tests pass;
  source/staged CWTools zero errors and warnings; four native Brittany contracts pass).
- [x] Native formation/tree-selection and real-button slice tests, negative readiness,
  exact rewards/unrelated state, save/reload where practical.
- [x] Retain portable evidence, update status/testing/project documents and handoff.

## Discoveries

Installed launcher metadata: 1.37.5.0 Inca (491d). Normal launcher currently enables
only Brittany development and disables no DLC; isolated USA activation will be
explicit and must be evidenced from native logs/saves. Vanilla `USANation.txt`
requires ADM 10, peace, independence, eastern-American core capital and ten cities;
it swaps non-generic missions. The historical revolution starts after 1750.
`american_republic` and `federal_republic` require American Dream, absent from the
documented default 18: avoid those reforms in production.

## Validation

Completed source/staged CWTools and layout checks, 51 shared Node tests and all
four required Brittany native contracts. Positive USA run
`20261004T105823451Z_470def8e14de1db9`: PASS/exit 0, four actual claims, 31 exact
save/input checks and twelve ordinary reload comparisons. Negative USA run
`20261004T110948651Z_65dcd99511bff1c2`: PASS/exit 0, eight refusal/save checks.
All owned cleanup clean. Eight earlier failures remain INCOMPLETE with raw
results retained: initialization/CN timing, parser investigation, rejected driver
argument, paused progress timeout, reload setup replay and UI lifetime deadlines.
Startup now has a saved identity guard; shared timeouts permit 1800 seconds with
defaults unchanged. Use 1200 for this supervised UI contract. Fourteen protected
files and fourteen vanilla references match their before hashes. Eight gameplay/
localisation files match staged hashes; runtime descriptor is intentionally rewritten.
Evidence/results and exact playtests: `docs/testing/american-century/README.md`.

## Next authorized phase

Prove natural ENG -> British eastern CN -> independent CN -> USA assignment,
origin rewards and flag persistence; test the alternate compact choice/remaining
slice roots. Then expand continental/native diplomacy and industry branch by
branch, with real-input contracts and regression. The 55-mission tree remains
design beyond the twelve currently implemented USA/colonial missions. No export,
whole-campaign or AI readiness claim is made. Broader plan stays active.

## Completion criteria and follow-up

A concrete large-tree design; playable bounded slice; static checks completed;
strongest feasible native evidence with failures retained and owned cleanup;
documented branch expansion and explicit campaign/reload/AI coverage limits.
Keep the broader plan active until the designed tree and integrated campaign exist.
