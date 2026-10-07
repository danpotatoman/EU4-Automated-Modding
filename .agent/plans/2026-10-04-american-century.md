# American Century: USA mission project

Status: active
Last updated: 2026-10-07
Owner: mod/american_century
Affected mods: american_century; Brittany protected; shared runtime dependency
Documentation ownership updated: 2026-10-06
Current state: [canonical owner status](../../docs/mods/american_century/STATUS.md)
Shared knowledge: [runtime index](../../docs/runtime/README.md)

## Goal and authorization

The user explicitly authorized autonomous design, implementation and isolated native
playtesting of a substantial USA tree, beginning with reconnaissance, a durable
design and a validated vertical slice. Design choices within that direction require
no repeated approval. This run establishes the architecture; it does not promise a
fully implemented late-game tree before validating the slice.

Source of truth: [USA design](../../docs/mods/american_century/DESIGN.md). Production source:
`mod/american_century/`. Shared infrastructure remains under `tools/`.

## Requirements

Preserve Brittany, installed vanilla and the ordinary EU4 profile. Use installed
1.37.5.0/required 18 DLC in isolated profiles, unique `amc_` identifiers. Native
saves recorded 21 enabled DLC; exactly-18-only compatibility remains open. Read vanilla
definitions before adapting mechanics; document patterns before implementing.
Distinguish static, fixture, real UI dispatch, save state and campaign verification.
Never substitute console mission completion for reward-bearing button input.

## Background and systems

Read the framework PROJECT/STATUS/TESTING and USA PROJECT/STATUS/DESIGN/ROADMAP/
DECISIONS/testing, the owner-labelled plans and relevant shared modding guides.
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

### Bounded 2026-10-07 authorization (current session)

The user explicitly selected Local Guarantees -> A More Perfect Union evidence.
Reuse the existing isolated USA fixture, runner, real mission/event input, collector,
save oracle and cleanup. No natural ENG/CN campaign, tree expansion, broad balance/
AI/DLC claims, commit or push. Production behavior and protected files stay intact.

- [x] Read authoritative owner/framework documents; snapshot 36 protected source,
  ordinary-profile and installed-reference files locally.
- [x] Preflight source/combined static, serial offline (90 tests/four self-tests)
  and unsandboxed process-adapter regressions (2/2).
- [x] Add a named bounded contract in the existing USA adapter, numerical probes
  and intermediate save checks; never grant mission rewards in setup.
- [x] Real Liberty/Compact buttons, Local Guarantees event option, minimum Union
  setup, real Union button; verify exclusive flags, republic/reform, +10 tradition,
  permanent +1 culture/-1 unrest and +0.3 annual tradition/+10% reform growth.
- [x] One ordinary paused reload, fresh observation/save and persistence checks.
- [x] Small sufficient regressions including Brittany dependency protection;
  preserve every failed attempt; protection/audit, owner docs and handoff.

Local evidence root: `.local/evidence/american-constitution-2026-10-07/`.
Initial shell attempts lacked Node PATH/execution-policy setup; sandbox process
tests failed CIM access. Use the installed Node runtime and process-local script
bypass; process ownership checks require unsandboxed execution. Assertions remain
unchanged. Preflight combined USA check PASS: zero CWTools errors/warnings, zero
structural errors, two layout warnings. Serial offline aggregate passed 90 tests
and four tool self-tests; targeted USA/selection tests passed 15/15. The initial
offline report-stability failure overlapped a static report write; its raw log
remains `.local/preflight-american-constitution-offline.txt`.

First Brittany preflight native run `20261007T193724265Z_a987c1e22ce27676`
is INCOMPLETE/exit 2, lifetime timeout at the Steam-not-running dialog; owned
cleanup is clean. Starting Steam exposed sign-in; automatic approval review
rejected the retry while unauthenticated. The user manually signed in and replied
“Steam ready”; retry `20261007T200129243Z_5ed7ea6bcad1bbc0` passed all four
Brittany contracts, exit 0, one attempt and clean cleanup. Source/staged CWTools
zero errors with 58/62 warnings. These are dependency protection, not USA evidence.
No authentication was automated. Preserve both run directories/verdicts.
USA calibration `20261007T200421644Z_f5d4b7b380413e23` is INCOMPLETE/exit 2,
explicit driver abort after real Liberty/Compact/Local Guarantees and three saves;
owned cleanup clean. Preserved save evidence exposed mission ordering, omitted
zero reform pool and vanilla tradition contributions. No Union/reload in this run.
The oracle now compares exact membership/count, parses omitted zero progress and
requires unrest/growth contribution checks (not weakened reward expectations).
Installed static modifiers corroborate -0.2/+0.10 per +10 tradition. Targeted
tests after corrections passed 15/15. Fresh acceptance
`20261007T201607449Z_bf7181bbc16ae60e` passed/exit 0, one attempt, clean cleanup:
65 native input/save checks across six paused checkpoints, including 13 reload
comparisons. Source/staged CWTools 8/12 files, zero errors/warnings. Collector
`american_runtime/20261007T201657172Z_7efb3a` completed, outcome passed. All 36
protected files match. Source gameplay/localisation staged hashes match; rewritten
runtime descriptor is still not source release evidence.

Current authoritative findings and public/original provenance:
[bounded report](../../docs/testing/mods/american_century/local-guarantees-2026-10-07/README.md),
[owner status](../../docs/mods/american_century/STATUS.md),
[coverage](../../docs/mods/american_century/testing/coverage.md). The bounded slice
is complete. Final publication audit passed (819 candidates, zero findings), link
check passed (812 links, zero issues), and whitespace/scope review passed. No production
bug was found; local oracle corrections preserve exact reward assertions. Shared
runner/lease/driver/cleanup and Brittany code are unchanged. Existing USA click/
refusal regressions passed offline; their interface semantics were not changed, so
no fresh Nantes/original-USA native contract was substituted for this new scenario.

Prove natural ENG -> British eastern CN -> independent CN -> USA assignment,
origin rewards and flag persistence; test remaining slice roots. Then expand
continental/native diplomacy and industry branch by
branch, with real-input contracts and regression. The 55-mission tree remains
design beyond the twelve currently implemented USA/colonial missions. No export,
whole-campaign or AI readiness claim is made. Broader plan stays active.

## Completion criteria and follow-up

A concrete large-tree design; playable bounded slice; static checks completed;
strongest feasible native evidence with failures retained and owned cleanup;
documented branch expansion and explicit campaign/reload/AI coverage limits.
Keep the broader plan active until the designed tree and integrated campaign exist.
The 2026-10-07 session stops after the bounded slice and handoff. The next logical
bounded task is same-campaign Harbors/Doors -> Workshop Republic building/readiness/
reward evidence; natural campaign/tree expansion were not begun here. Elapsed
tradition accrual, repeat-click/refusal, expiry, already-republic bypass and broader
environment/release checks remain open in owner docs.
