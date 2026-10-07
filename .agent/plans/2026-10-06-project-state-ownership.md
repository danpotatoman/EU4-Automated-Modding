# Multi-mod project-state ownership review and proposed migration

Status: complete for authorized Phase 1/2A/2B/2C
Last updated: 2026-10-06
Owner: repository/framework
Affected mods: brittany_missions, american_century (documentation, runtime adapters and report provenance)
Current state: [framework status](../../docs/STATUS.md), [independent mod index](../../docs/mods/README.md)
Review: complete
Completed scope: review, Phase 1 documentation/state ownership; Phase 2A runtime ownership/selection; Phase 2B evidence identity/reuse; Phase 2C configuration/QA ownership
Migration execution: Phase 1/2A/2B/2C complete; stopped after Phase 2C handoff
Phase 2C: authorized 2026-10-06 by attached user request; no gameplay/reconciliation/commit/push.

## Phase 2C execution

Owner: repository/framework configuration and tooling; both supported mods.
Authorization: canonical per-mod metadata/readers and source-backed QA isolation;
preserve effective names/version, machine precedence/legacy overrides, descriptor
bytes, Phase 2A contracts and Phase 2B schema/guards. Ordinary Brittany destination
mismatch remains protected. Prior sections/handoffs are retained historical scope.

- [x] Read authorization/governing/current owners; inspect inherited dirty worktree.
- [x] Capture 2,139 distinct pre-task paths and 805 public candidate originals in
  ignored `.local/project-state-phase2c/`, including both ignored local overrides,
  external references, production report pointers/baselines, deployment state,
  native records and prior Phase 2B local evidence. Save effective descriptors and
  inspector scenario results before editing. Snapshot must not be overwritten.
- [x] Implement canonical mod configs and Node/PowerShell parity/legacy readers.
- [x] Migrate deployment/check/inspector consumers and remove shared ownership data.
- [x] Isolate browser/self-test fixtures and prove production pointers unchanged.
- [x] Run required offline/Windows/tool/static checks and exact descriptor parity.
- [x] Inspect runtime diff; run justified native regression only if preparation,
  source/descriptor/launcher/activation paths are affected.
- [x] Verify protected hashes; update owner docs/handoff and stop.

Current decision: native fixture names and aliases are registry/contract bindings,
not shared configuration defaults. Preserve them and all native code bytes where
possible; metadata configuration owns development descriptors and inspector state.
Legacy deployment displayName remains Brittany-scoped; supportedVersion remains
a generic compatibility override for every selected mod, with scoped notices.
No real ignored override is edited. Unknown mods retain explicit generic fallbacks.

Final acceptance: 89/89 tests plus four self-tests PASS; Windows adapter 2/2 PASS;
installed CWTools/deployment/collector wrappers and normal-access browser QA PASS.
Restricted browser failure and initial focused-test error-text mismatch retained.
Both source validators complete without errors; combined USA PASS, Brittany retains
only existing modified-destination FAIL. Fifteen production pointers/baselines were
unchanged through testing; ordinary source checks deliberately updated eight JSON
records afterward. Inspector scenario/results and development descriptor bytes match
pre-task values. Native code/fixtures/records and both staged descriptors remain
byte-identical; shared profile path is equivalent, so no native rerun was warranted
or claimed. Protected groups, including actual ignored overrides and prior handoffs,
are unchanged. Canonical details, exact inventory and limitations are in
[Phase 2C handoff](../../docs/runtime/phase2c-configuration-ownership-2026-10-06.md) and
[configuration model](../../docs/runtime/configuration-ownership.md). No further
architecture/gameplay/reconciliation/publication action is authorized by completion.

## Phase 2B execution

Authorization: evidence identity, report provenance and safe reuse only; preserve
Phase 2A runtime behavior, gameplay, storage, lifecycle and input protocols. No commit/push.

- [x] Read governing sources; capture 1,713 file hashes and 798 candidate originals
  in ignored `.local/project-state-phase2b/` before implementation. Existing dirty
  working tree is the Phase 1/2A baseline; no unrelated edits are reverted.
- [x] Shared bounded identity vocabulary and finite legacy/applicability guards.
- [x] Runtime attempts, collector, CWTools, checks/inspector/deployment metadata.
- [x] Focused automated/self-tests, Windows adapter and source/staged validation.
- [x] Brittany all/control/click/refusal and independent USA click/refusal native checks.
- [x] Integrity verification, owner documentation, dated handoff and stop.

Final results and limits: [Phase 2B handoff](../../docs/runtime/phase2b-evidence-identity-2026-10-06.md),
[schema semantics](../../docs/runtime/evidence-identity.md),
[framework status](../../docs/STATUS.md). Next action requires separate Phase 2C
authorization; do not start configuration migration automatically.

Earlier 2026-10-06 progress: 75 offline tests and four self-tests PASS; Windows adapter
2/2 PASS with normal CIM (sandbox-denied failure preserved); deployment and collector
PowerShell self-tests PASS. Brittany all PASS and expected staged negative-control
FAIL/FAIL/FAIL/PASS; source/fixture CWTools zero errors. Native UI driver available.
First Nantes attempt deliberately aborted before UI input after correcting saved
mod environment field separation; retain INCOMPLETE and clean cleanup. Final
Nantes click is in progress; independent refusal/USA acceptance remains pending.
CWTools integration self-test, final code review/checks/integrity and handoff remain.

Resumption 2026-10-06: re-read governing docs/worktree and live ownership state.
No EU4/owned remnant or lock remains. The newer Nantes click attempt
`20261006T225634777Z_f671b215064dd5c7` ended during the usage interruption
after exactly three navigation inputs, with no saves/claim; keep INCOMPLETE.
The original `20261006T225412743Z_41e5238796440641` has no UI-actions file,
INCOMPLETE verdict and clean cleanup. Neither is reused or rewritten.
Added pure saved-environment parser and three regression tests for filename/name
separation, no manufactured source owner and unknown/conflicting activation refusal.
Offline 78/78 plus four self-tests PASS; installed CWTools integration self-test
PASS including valid/error/empty fixture semantics and identity freshness assertions.
Fresh Nantes click `20261006T230353856Z_5271f4e3ba59e8da` is in preparation.

Fresh Nantes click completed PASS/0: one real entry, two permanent cloth rewards,
immediate Textiles readiness, 13 save checks; saved activation established with
distinct mod filename/display name and 21 DLC (required 18 included), clean cleanup.
Refusal run `20261006T231042406Z_d9bf99174493af64` is in progress. Final code
offline check still 78/78 plus four self-tests PASS after stronger suite/mode/member,
native PASS/behavior consistency, freshness-boundary and deployment-provenance guards.

Evidence correction: the interrupted second Nantes attempt records lifecycle
`unexpected-exit`, not an established timeout; earlier progress wording inferred
timeout incorrectly. Its exit cause is unestablished. Both prior attempts are
INCOMPLETE with clean cleanup and zero mission inputs, individually preserved.
The snapshot's 1,713 records cover 1,075 distinct normalized paths, including 20
production files and 738 historical-evidence files; duplicate separators caused
repeated hash records. Two ignored local config overrides were omitted from the
pre-task hash manifest. Their current modification times predate the task and all
code paths used read them only; no pre-task byte-equality claim is possible for
those two overrides. Late-captured hashes match final hashes; retain this limit.

Final acceptance: 78/78 offline tests plus four self-tests PASS; Windows adapter
2/2 PASS with normal CIM; installed CWTools and deployment/collector wrappers PASS.
Both source/fixture owners validate without CWTools errors. Six required native
runs completed in one attempt each with clean cleanup: Brittany all PASS, expected
negative-control FAIL pattern, Nantes click/refusal PASS (13 checks each), USA
click/refusal PASS (31/eight checks). All four UI saves establish 21 DLC and only
the isolated runtime mod filename, separately from display names/source ownership.
Both earlier Nantes attempts remain byte-preserved INCOMPLETE. Final acceptance
guards reject cross-owner/build/artifact/stale and incomplete reuse. Actual combined
USA check PASS; Brittany FAILED solely for its existing modified-destination guard,
without changes to ordinary deployment. Both validated test-destination deployments
PASS. Protected captured groups unchanged; no unexpected hash changes. Publication,
local links and whitespace reviewed. No commit/push or Phase 2C work performed.

## Phase 2A authorization and execution (2026-10-06)

The user's attached request explicitly authorizes proposal step 4: owner adapters,
contract registry, genuinely shared helpers, explicit native -Mod/-ListTests,
legacy routing/wrappers, regression tests, source/staged/native validation and
owner documentation updates. No gameplay, config/deployment, generalized report
schema/collector identity, lifecycle redesign or operational relocation is authorized.
Phase 1's restrictions below are historical and superseded only within Phase 2A.
Record minimal runtime selection metadata only; keep existing report semantics.

- [x] Read authorization/current owner documents and capture 905 protected files,
  source/runtime originals and current launcher/version in ignored Phase 2A storage.
- [x] Confirm installed 1.37.5.0 Inca (491d), ordinary launcher Brittany-only/no
  disabled DLC, Steam present and no existing EU4; supported sky adapter imports
  and window enumeration works. No native pass inferred from this preflight.
- [x] Extract shared helpers/move adapters and fixtures with compatibility wrappers.
- [x] Registry/selection validation and non-mutating -ListTests; delegate runner logic.
- [x] Automated regression, source/staged validation and both-owner native contracts.
- [x] Document outcomes/integrity/pending evidence, update owner state and stop.

Current complete implementation inventory, registry matrix, CLI examples, native
run IDs, preserved failures and playtest boundaries are in the
[Phase 2A handoff](../../docs/runtime/phase2a-ownership-2026-10-06.md).

## Phase 1 authorization boundary (2026-10-06)

This is the historical Phase 1 boundary, not a denial of the separately authorized
Phase 2A section above. See the final Phase 2A handoff appended below for current
execution and remaining unauthorized work.

The user explicitly authorized only documentation/state ownership and compatibility
work in proposed file-migration steps 1 and 2, plus applicable documentation checks
and provenance/byte verification. This supersedes the original proposal-only scope
below for Phase 1. Production and historical evidence bytes must remain unchanged.
The original inventory and larger proposal remain below as dated review material.

No per-mod tool config/readers, runtime module/fixture moves, contract registry,
new CLI flags, report/collector schema changes, deployment/configuration changes,
lifecycle/process changes or operational evidence relocation are authorized.
Commands containing native `-Mod`/`-ListTests` in the deferred proposal are future
examples, not supported commands. Current native ownership is documented without
changing CLI behavior. Stop after Phase 1 handoff; do not start Phase 2.

Phase 1 progress:

- [x] Capture production, historical evidence, tool behavior/configuration and
  existing provenance hashes in ignored local review storage.
- [x] Establish canonical framework/shared-runtime and independent mod documents.
- [x] Update navigation and owner-labelled plans; retain compatibility paths.
- [x] Finish migration provenance and protected-byte checks.
- [x] Run link/publication/whitespace/scope checks and protected-byte verification.
- [x] Complete Phase 1 handoff with reading paths and deferred ambiguity.

## Original review goal and authorization

These paragraphs record the initial review-only scope before the user's Phase 1
authorization above. Their "no migration" statements describe proposal delivery,
not the now-authorized documentation migration.

The user authorized a repository architecture review and creation of this proposal.
The user explicitly prohibited implementing the migration until separately authorized.
Only this plan and its navigation entry in `.agent/PLANS.md` are changed by the review.
No production, tool behavior, existing documentation ownership, deployment, evidence,
Git configuration, commit, remote, or game session is changed.

Propose the smallest migration that lets a fresh agent independently establish:

1. Repository/framework state and policies.
2. Shared EU4 tooling/runtime knowledge, capabilities, dependencies, and limits.
3. One mod's adopted design, implementation state, roadmap, and testing coverage.
4. A task's authorization, progress, and next action.
5. The owner, tested build, scenario, environment, and verdict of local/generated evidence.

This plan is a proposal, not adoption of its design or authorization to execute it.
The immediate next action is explicit user authorization or revision of the proposal.
American Century's earlier gameplay authorization does not authorize this migration.

## Background and review method

Read `README.md`, `AGENTS.md`, `PROJECT_STRUCTURE.md`, `CONTRIBUTING.md`, root
project/state/design/roadmap/decision/testing/setup/hygiene documents, the plan
convention and existing plans, modding guides, USA design/provenance and testing
report, tool READMEs/configuration, command wrappers, runtime modules/tests,
publication checks, ignore rules, and CI configuration. Searched public source
for mod names, tags, mission identifiers, runtime contract names, and evidence paths.
Inspected selected ignored report metadata and storage namespaces without launching
tools that validate game content or operate EU4.

The initial tracked working tree was clean. Git required a command-scoped
`safe.directory` override because the sandbox and workspace owner differ; no
persistent Git configuration was edited.

Observed local report state, not new validation:

| Report | Observation |
| --- | --- |
| `tools/cwtools/reports/brittany_missions/latest.json` | complete, 0 errors / 58 warnings, timestamp `2026-10-05T23:02:30.667Z` |
| `tools/cwtools/reports/american_century/latest.json` | complete, 0 errors / 0 warnings, timestamp `2026-10-05T23:02:09.758Z` |
| `tools/checks/reports/brittany_missions/latest.json` | failed, timestamp `2026-10-02T03:28:47.210Z`; later CWTools is a different check, not a replacement combined PASS |
| `tools/checks/reports/american_century/latest.json` | absent |

Both CWTools reports identify the project path but have no explicit `mod` field.
Ignored runtime work contains 57 directories at inspection; they are not 57 PASSes.
The installed version/DLC were not rechecked in a new native run during this review.
Existing evidence is bounded to its recorded EU4 1.37.5.0 Inca (491d), source hashes,
actual activation, geometry, and scenario. `1.37.*` remains descriptor metadata.

## Findings: where ownership is mixed

Mixed placement is not always a defect. A reusable guide can legitimately cite a
mod example; a framework recovery experiment can legitimately use Brittany as its
workload. The defect is treating that workload's results as framework-wide or
other-mod coverage, or requiring its gameplay documentation to discover tool state.

### A. Repository entry points and current-state documents

| Exact location | Current mixture / consequence | Proposed owner/action |
| --- | --- | --- |
| `AGENTS.md` | Says the shared workspace develops only Brittany. Startup navigation points at root Brittany design/state. Default CWTools is Brittany; instruction to run `-Test all` after shared changes sounds universal. | Repository instructions; list independent mod entry points, require owner selection, explain scoped regression matrix. |
| `README.md` | Framework title, architecture, CI and setup interleave Brittany warning counts, Nantes completion, USA mission counts/campaign work, native contracts, and unqualified `all`. | Framework overview with explicitly attributed examples; current mod facts belong in per-mod status. |
| `PROJECT_STRUCTURE.md` | Useful navigation, but durable state links lead to mixed root documents; USA is an appended special case. | Ownership map and equal mod entries. |
| `CONTRIBUTING.md` | Shared workflow uses Brittany-default commands and root state/coverage sources for all development. | Repository workflow with explicit `-Mod`, mod-specific tests, framework checks. |
| `docs/PROJECT.md` | Project identity/architecture and machine/tool context share a file with Brittany file inventory/branch design and USA slice inventory. | Repository map; move inventories to each mod's `PROJECT.md`. |
| `docs/STATUS.md` | Publication/CI/configuration/lifecycle/input-adapter state share a current-state surface with Brittany script warnings, rewards, historical snapshots and USA implementation/PASS summaries. Multiple dated updates/test counts are easy to read as one current verdict. | Framework current state only, with dated tool evidence and links to independent mod status. |
| `docs/DESIGN.md` | Despite the root title, almost all design is Brittany; USA is a link at the top. | Framework architecture/ownership design; move Brittany design intact to its own directory. |
| `docs/ROADMAP.md` | Brittany gameplay/balance/export/descriptor work, generic input/lifecycle/calibration ideas, and USA expansion share a backlog. | Framework follow-up only; per-mod roadmap for gameplay work. |
| `docs/DECISIONS.md` | D001/D002/D009/D013 are repository policy; D005/D006/D008/D010 and parts of D011 are shared-runtime choices; D004/D007 are Brittany; D012 combines USA design and shared-runner choices. D003 names Brittany as deployment architecture. | Preserve IDs/history, route choices to their owners, leave root index/compatibility anchors. |
| `docs/TESTING.md` | Shared tool exit semantics/manual procedure sit beside BRI start/tag/flags, four Brittany required contracts, Nantes oracle/calibration, a USA appendix and unqualified broader-handoff `all`. | Framework testing procedure and selection matrix; move per-mod contract instructions to mod testing entry points. |
| `docs/SETUP.md` | Machine setup mixes launcher requirement for `brittany_missions_dev.mod`, Brittany deployment examples and unqualified native `all`; USA appears as a special supported input case. | Shared prerequisites/configuration; scoped examples and mod links. |
| `docs/REPOSITORY_HYGIENE.md` | Correct repository policy, but `docs/testing/` and claim retention examples also encode historical layout/naming. | Keep policy; describe historical versus new owner-labelled evidence locations. |
| `docs/PUBLICATION.md`, `docs/publication-snapshot.md` | Dated repository publication evidence also records mod counts/CWTools/native suites and historical tool test counts. | Retain as dated repository records, add navigation/context only; do not promote to living mod or tool status. |

### B. Existing mod documentation and shared knowledge

| Exact location | Current mixture / consequence | Proposed owner/action |
| --- | --- | --- |
| `docs/usa/DESIGN.md` | Adopted USA design includes implemented-slice markers, phases and tool/test references; not a complete mod status/roadmap entry point. Country-based path differs from source ID. | `docs/mods/american_century/DESIGN.md`; retain adoption and distinguish designed versus implemented rows. |
| `docs/usa/vanilla-provenance.json` | USA-selected reference hashes stored as a country-level resource, not common verified mechanics knowledge. | `docs/mods/american_century/vanilla-provenance.json`; preserve bytes and reference scope. |
| `docs/testing/american-century/README.md` | Current USA implementation/status/next work, reproduction, playtests, evidence, 51 'shared' Node tests, and a Brittany regression result in one report. | Preserve dated report/evidence; establish independent USA status/roadmap/testing documents. Brittany regression is a framework-change check, not USA coverage. |
| `docs/testing/american-century/changed-files.md`, `protected-before.json`, `protection-check.json` | USA task/change history contains Brittany production protection and shared-runner files. | Retain dated USA task evidence; protection establishes no unintended writes, not gameplay verification. |
| `docs/testing/american-century/evidence/brittany-regression/` | Brittany native evidence lives inside USA evidence bundle. | Keep historical bytes/path; evidence index states source owner Brittany, originating task USA. |
| `docs/testing/runtime-coverage.md` | Generic-looking runtime coverage path/title references actually mean Brittany coverage only. | Move editable coverage to Brittany; keep old file as labelled compatibility pointer, not aggregate coverage. |
| `docs/testing/brittany-diplomatic-selector.md` | Correct Brittany scenario under shared testing root; root testing treats it as default/current scenario. | Move editable scenario to Brittany testing; retain an old-path stub/anchor bridge. |
| `docs/testing/runtime-preview-gate/`, `runtime-regression-suite/`, `runtime-nantes-market/`, `runtime-mission-claim/` | Names appear framework-oriented but reports/assertions/save oracles are Brittany. Nantes directory also has manual-session/final report history. | Keep as historical Brittany evidence bundles, owner-index them; future/current scenarios go to Brittany testing. |
| `docs/testing/runtime-run-effects/` | Shared engine calibration uses BRI/Nantes/province IDs and a production stability helper. | Shared knowledge evidence with explicitly identified Brittany fixture; no other-mod mission claim. |
| `docs/testing/runtime-recovery/` | Framework lifecycle/crash/freeze results use Brittany `all` and carry its gameplay/CWTools results. | Shared framework evidence; workload=Brittany and recovery capability versus mod gameplay verdicts separately labelled. |
| `docs/testing/environment.md` | Shared 18-DLC preference embeds Brittany deployment name/current selector scenario. The runner parses Markdown bullets and hard-codes exactly 18; enabled extras differ in USA saves. | Keep as shared human-readable preference; remove current-mod selection, separate intended/required DLC from observed activation. No extra machine-readable environment rewrite in this migration. |
| `docs/testing/publication-redactions.json` | Cross-owner historical provenance references paths/hashes of reports, plans and evidence; moves/rewrites can invalidate public-copy identity claims. | Preserve as a dated manifest; record later documentation moves in a separate migration manifest. |
| `docs/modding/README.md` | Shared knowledge navigation cites Brittany and USA scenarios/coverage as verification sources. | Keep; label example owner and evidence scope, link current owners. |
| `docs/modding/country-flag-mission-gates.md`, `runtime-script-assertions.md`, `console-run-effects.md`, `native-mission-completion.md`, `ordinary-mission-button-fixtures.md`, `faithful-mission-input.md`, `shared-mission-reward-effects.md` | Reusable patterns also contain current Brittany/Nantes results, specific IDs, commands, open playtests and shared-driver constraints. 'Shared reward' means reuse inside Brittany, not across mods. | Keep reusable purpose/example/vanilla/version/scopes; attribute examples, transfer living coverage/backlog to owner docs and link it. |
| `docs/modding/american-colonial-missions.md` | Shared vanilla/CN/formation/reload pattern mixed with USA-specific decisions, identifiers, reward choice and slice/campaign coverage. | Keep reusable mechanics under modding; USA intent/state belongs in USA docs, with attributed verification links. |

### C. Plans and authorization state

All plans stay under `.agent/plans/`; moving them by mod is unnecessary. They need
an explicit primary owner, affected mods, and durable source links. Completed plans
are historical task records, never the current tool/mod status.

| Exact plan | Ownership / mixture |
| --- | --- |
| `.agent/PLANS.md` | Flat index lacks owner labels; freeze/recovery entries still say 'authorized' even though the plan files are complete. Does not distinguish mod expansion from shared runner tasks. |
| `2026-10-03-documentation-bootstrap.md` | Repository documentation task bootstrapped Brittany and shared-tool state together. |
| `2026-10-03-nantes-faithful-completion.md` | Brittany task plus mechanism research and save-parser correction; its manual-script runtime path/command names are historical. |
| `2026-10-03-runtime-recovery.md` | Framework lifecycle task using Brittany fixture/regression; broader tool findings must not live only in Brittany status. |
| `2026-10-03-runtime-freeze-validation.md` | Framework follow-up using Brittany `all`; same ownership distinction. |
| `2026-10-03-faithful-mission-automation.md` | Shared input investigation with one Brittany end-to-end acceptance workload; no general mod-claim certification. |
| `2026-10-04-american-century.md` | Active USA task also records shared timeout/input/fixture changes and Brittany protection/regression. Its initial slice checkboxes are complete while broader development remains active. |
| `2026-10-05-publication-preparation.md` | Repository task includes both mods' regression evidence. |
| This plan | Repository/framework proposal; affects documentation/adapters for both mods, with execution authorization pending. |

### D. Commands, configuration, implementation and tests

| Exact files | Current mixture / consequence |
| --- | --- |
| `tools/validate-cwtools.ps1`, `tools/cwtools/validate.mjs` | Omitted mod defaults to Brittany. `-Project` can name arbitrary/staged projects, but report key is directory basename; equal basenames can collide. Cache/rules are genuinely shared vanilla/tool state. |
| `tools/check-project.ps1`, `tools/inspect-missions.ps1`, `tools/mission-inspector/generate.mjs`, `tools/test-run.ps1`, `tools/test-runs/collector.mjs`, `tools/deploy-mod.ps1` | All public wrapper/default selection favors Brittany. Collector's `mod` is also a storage namespace, including runtime pseudo-mods; scope cannot be recovered from that field alone. |
| `tools/deployment/config.json`, `config.example.json` | Shared machine/destination defaults contain Brittany `displayName` and game-content `supportedVersion`. |
| `tools/config.mjs`, `tools/config.ps1`, `tools/checks/check.mjs`, `tools/deploy-mod.ps1` | Shared config loader carries that metadata; descriptor generation special-cases Brittany in both Node and PowerShell, then uses folder-name fallback for other mods. Two implementations must remain byte-consistent. |
| `tools/mission-inspector/scenarios.json`, `state-rules.json` | Shared tool config contains BRI flags/branch assumptions and USA/ENG/C00 states. Already keyed by mod, but game-specific ownership is mixed into shared defaults. |
| `tools/run-eu4-test.ps1` | Flat ValidateSet, default `preview-gate`, no `-Mod` selector. `-Test all` is four Brittany contracts, excludes Nantes claims/diagnostics and USA entirely. |
| `tools/runtime-tests/run.mjs` | `test === 'usa-slice'` chooses source mod, runtime namespace, descriptor title, ENG versus BRI, fixture, oracle and verdict. Brittany-only launcher preflight; USA reads launcher config but does not apply that same gate. Inline/negative/freeze options are Brittany-suite-specific. Relevant-error regex contains both mods; claim-count logic names `bri_nantes_market`; USA wiring is a passed object explaining CWTools/layout/tree membership, not the same named-wiring contract. |
| `tools/runtime-tests/behaviors.mjs` | Generic name exports Brittany behaviors, `requiredTests`, and two BRI extraction mappings. |
| `tools/runtime-tests/wiring.mjs`, `refactor-compare.mjs` | Specific Breton filenames, six branch missions, reward effects and parent/province IDs alongside reusable AST canonical/unique helpers. |
| `tools/runtime-tests/evaluate.mjs` | Generic name, but knows Brittany test names, diagnostic branches/check offsets and fixed 1444 date; imports Brittany required tests. |
| `tools/runtime-tests/mission-claim.mjs` | Nantes fixture/checks/modes/staging plus reusable mission geometry; geometry defaults to `bri_nantes_market` and imports generic `unique` from Brittany wiring. |
| `tools/runtime-tests/claim-save.mjs` | Nantes-specific plaintext-save/date/BRI/province/modifier oracle plus generic `block` helper. |
| `tools/runtime-tests/usa-slice.mjs` | Explicit USA fixture/oracle; imports generic geometry from Nantes module and generic save block from Brittany oracle. USA-specific staging rewrites local copies of installed history; no production or vanilla writes. |
| `tools/runtime-tests/preview-gate.on_actions.txt`, `behavior-fixture.on_actions.txt`, `nantes-market.on_actions.txt`, `run-effects.on_actions.txt`, `run-effects.run.txt`, `run-effects.after.txt`, `shipbuilding-reward.run.txt`, `borders-reward.run.txt`, `textiles-upgrade.run.txt` | Brittany fixtures/effects or shared engine probes calibrated in BRI; all look like peer files of the shared lifecycle. |
| `tools/runtime-tests/prepare-nantes-manual.mjs` | Separate Brittany manual profile/launcher path using `brittany_nantes_manual`; not the automatic suite or general runner. |
| `tools/runtime-tests/retain-claim.mjs` | Generic-sounding retention helper accepts only Nantes claim or Brittany `all`; local evidence path named for claim experiment, not source owner. |
| `tools/runtime-tests/evaluate.test.mjs`, `wiring.test.mjs`, `regression-evidence.test.mjs`, `mission-claim.test.mjs`, `claim-evidence.test.mjs` | Brittany protocol/production assertions and evidence replays in shared test directory. Mission-claim test includes generic geometry/lease tests alongside Nantes checks. |
| `tools/runtime-tests/usa-slice.test.mjs` | USA protocol/save/UI tests plus generic geometry through Nantes module. |
| `tools/runtime-tests/recovery-evidence.test.mjs` | Shared recovery replay also calls Brittany transcript evaluator for workload success. |
| `tools/runtime-tests/lifecycle.mjs`, `lifecycle.test.mjs`, `processes.ps1`, `windows-adapter.test.mjs`, `codex-input.mjs` | Predominantly properly shared. Lifecycle scan assumes flat work directories and one global lock; do not move local runs or replace global lock with per-mod locks. Input leases are generic; geometry/driver tests do not certify arbitrary layouts. |
| `tools/mission-inspector/self-test.mjs`, `browser-test.mjs` | Synthetic tool checks mixed with actual Brittany tree counts/flags/IDs. Self-test generates normal Brittany reports; browser QA reads `reports/brittany_missions/index.html`, so stale/generated source reports affect tool QA. |
| `tools/deployment/self-test.ps1` | Uses actual Brittany localisation/default deployment as integrity fixture. |
| `tools/test-runs/self-test.mjs` | Synthetic collector fixture still uses Brittany default/namespace. |
| `tools/checks/self-test.mjs`, `tools/config.test.mjs`, `tools/cwtools/self-test.mjs`, `tools/vanilla-reference/self-test.mjs`, `tools/publication/audit.test.mjs` | Mostly correctly synthetic/shared; update dependencies if config/metadata/report contracts change, and retain explicit fixture owners. |
| `tools/test-offline.mjs`, `.github/workflows/offline.yml` | Offline aggregate auto-discovers top-level runtime tests and publication tests, then four self-tests. 'Shared Node tests' includes mod contracts/replays/source geometry; PASS is offline checks, not either mod's new native PASS. |
| `tools/{cwtools,deployment,checks,mission-inspector,test-runs,runtime-tests,vanilla-reference}/README.md` | Shared implementation instructions also embed Brittany default/examples, required-suite/scenario semantics, USA appendix, or source-tree test expectations. Runtime README contains dated manual statements plus later capabilities. Keep technical interfaces shared, scoped contract runbooks per mod. |
| `tools/vanilla-reference/lookup.mjs`, `tools/vanilla-reference.ps1` | Knowledge search correctly targets `docs/modding/`; keep shared. README's Breton vanilla examples are legitimate examples, not current mod status. |
| `tools/publication/audit.mjs`, `audit.test.mjs`, `check-links.mjs`, `sanitize.mjs`, `export-snapshot.mjs`, `.gitignore`, `.gitattributes` | Ownership boundary infrastructure; current exclusions/public-log exceptions and provenance paths depend on layout. Preserved-native evidence and scripts must not be rewritten/renormalized during organization changes. |

### E. Reports, deployment records, runtime evidence and naming

| Exact storage / naming | Finding and preservation rule |
| --- | --- |
| `tools/cwtools/.cache/`, `rules-download/`, `rules.zip`, reference/cache metadata | Framework-local EU4/tool dependency state, not a mod result. Keep shared; do not duplicate per mod or publish. |
| `tools/cwtools/reports/<basename>/` | Production namespaces `brittany_missions`, `american_century`; staged `brittany_runtime`, `american_runtime`, manual `brittany_nantes_manual`; also self-test namespaces. Latest is per basename, not globally current or source-owner-explicit. Preserve layout; add report identity/freshness checks. |
| `tools/checks/reports/<mod>/` | Already mod-partitioned latest/archive/last-complete/active lock. Old Brittany combined FAIL is not superseded by fresh single-tool PASS; no USA combined report exists at review. Keep layout/baselines. |
| `tools/mission-inspector/reports/<mod>/` | Already partitioned, but self-test/browser coupling can replace/read real mod latest. Isolate test output under ignored test-work. |
| `tools/deployment/state/<mod>/<destination-key>/` | Already correct owner/destination hierarchy. Existing local state only lists Brittany. Records encode absolute destination identity, launcher hash, file hashes/backups; do not relocate/rekey or repair external edits as part of migration. Add owner metadata only to future records. |
| `tools/test-runs/reports/<namespace>/` | Correct storage isolation, but `mod` means both source mod and pseudo-mod. Current namespaces include Brittany production/runtime/manual, American runtime and synthetic collector-wrapper IDs. Active/latest/baseline are namespace-scoped. Keep namespace IDs, distinguish storage namespace from source owner. |
| `tools/runtime-tests/work/<timestamp_nonce>/` | Run-local profiles, attempts, staged source, result/ownership/UI leases and logs; flat directories lack visible owner, result lacks explicit sourceMod. Existing global `active-lifecycle.json` protects framework process ownership across mods. Keep flat paths and lock; add identity to future results, never infer cleanup ownership from a mod name. |
| `.local/evidence/runtime-mission-claim/`, other `.local/evidence/`, ignored tool test-work, `docs/modding/examples/`, `tools/vanilla-reference/examples/` | Local raw evidence/reference/tool fixtures. Keep untouched and ignored; future retention can use source-owner nesting without relocating old records. |
| `.local/private-history/`, publication snapshots/audit originals, `*.local.json` | Repository-private history/machine/audit state, not production or published evidence; no migration or new publication implied. |
| `docs/testing/**/evidence/` | Deliberately reviewed public copies, not live operational state or byte-identical local originals. Paths/hashes/nonce relationships support offline replay. Preserve bytes and historical ownership; annotate through a separate index. |
| `docs/usa`, `american-century`, `american_century`, `american_runtime`, 'American Runtime Test'; Brittany analogues; generic `requiredTests`, `all`, `mission-claim`, `runtime-coverage` | Multiple semantic identities currently require prior knowledge. Canonical source/document owner IDs will be folder IDs; country tags, historic protocol/namespace names and player-facing identifiers stay unchanged. |

## Proposed ownership hierarchy and reading paths

| Layer | Canonical state / knowledge | Boundary |
| --- | --- | --- |
| Repository/framework | Root `AGENTS.md`, `README.md`, `PROJECT_STRUCTURE.md`; `docs/PROJECT.md`, `DESIGN.md`, `STATUS.md`, `ROADMAP.md`, `DECISIONS.md`; hygiene/publication/CI | Repository identity, tool capability status, architecture, policy, tool work. Root status can cite mod workloads with owners but never adopt their gameplay status. |
| Shared EU4 tooling/runtime knowledge | `docs/TESTING.md`, `SETUP.md`, new `docs/runtime/README.md`, `DECISIONS.md`; existing `docs/modding/`; `docs/testing/environment.md`; per-tool READMEs | Test protocol, supported mechanisms/scopes/version/DLC/input dependencies, common pitfalls. These are sufficient to understand tooling without reading a mod design/status. |
| Per-mod state | New `docs/mods/<source-id>/{PROJECT,DESIGN,STATUS,ROADMAP,DECISIONS}.md`, `testing/README.md`, `testing/coverage.md`; adapter metadata under `tools/mods/<source-id>/` | That mod's adopted intent, implemented bytes, static/gameplay evidence and open scenarios. No framework capability claimed from another mod's success. |
| Task execution | Existing `.agent/PLANS.md` and `.agent/plans/YYYY-MM-DD-name.md` | Primary owner, affected mods, authorization, progress, source links, next action. A task may affect several owners; facts go back to the respective owners. |
| Generated/local runtime evidence | Existing ignored caches/reports/state/work/.local; preserved reviewed historical evidence under `docs/testing/` | Build/owner/scenario/environment/attempt/verdict identity, privacy and retention. Historical public excerpts are reference inputs, not live ownership instructions. |

Fresh agent, framework task: `README.md` -> `docs/PROJECT.md` -> root `STATUS.md`
and `ROADMAP.md` -> `docs/TESTING.md` / `docs/runtime/README.md` -> relevant tool
README and owner-labelled task plan. No mod documentation required to know current
tool capabilities, native evidence limits, unresolved driver/cleanup work, or CI scope.

Fresh agent, mod task: repository rules/map -> `docs/mods/<id>/PROJECT.md` and
`STATUS.md` -> that mod's `DESIGN.md`, `ROADMAP.md`, `testing/README.md` and
`testing/coverage.md` -> applicable plan/shared guide. Every cited native result
must carry source owner/build, contract/layer and environment; cross-mod regression
appears as dependency protection rather than that mod's coverage.

Root status is the single current framework status. Do not add a competing
`docs/runtime/STATUS.md`. Likewise, reports and plans link status rather than
duplicating an independent current-state ledger. Date historical test counts.

## Exact proposed file migration

Paths in this section are proposals; backticks intentionally avoid links to files
that do not exist yet. Existing evidence bundles stay in place to minimize churn.

### 1. Create per-mod documents; split root state

Create for **each** `brittany_missions` and `american_century`:

- `docs/mods/<id>/PROJECT.md`
- `docs/mods/<id>/STATUS.md`
- `docs/mods/<id>/ROADMAP.md`
- `docs/mods/<id>/DECISIONS.md`
- `docs/mods/<id>/testing/README.md`
- `docs/mods/<id>/testing/coverage.md`

Exact moves/splits:

| Existing file | Proposed move/create/edit |
| --- | --- |
| `docs/DESIGN.md` | Move Brittany body to `docs/mods/brittany_missions/DESIGN.md`; replace root file with framework design plus compatibility links/old heading anchors. |
| `docs/usa/DESIGN.md` | Move authored design to `docs/mods/american_century/DESIGN.md`; leave old-path stub with retained heading anchors, adoption provenance and new source link. |
| `docs/usa/vanilla-provenance.json` | Move byte-for-byte to `docs/mods/american_century/vanilla-provenance.json`; update editable consumers. Old JSON path is referenced in dated USA task provenance, so record relocation in migration manifest rather than rewriting historical observations. |
| `docs/PROJECT.md` | Keep repository/tool architecture; split Brittany and USA content inventories into their respective `PROJECT.md`. |
| `docs/STATUS.md` | Keep publication/tool versions, CI/offline results, runner/recovery/adapter capability and limitations with dated evidence references. Transfer each mod's current implementation/static/gameplay facts into its `STATUS.md`. Preserve historical 2026-10-03 snapshot and superseded checks as dated references, not current frameworks verdicts. |
| `docs/ROADMAP.md` | Keep framework input/lifecycle/query-observation tooling work and general development blockers; transfer Brittany and USA gameplay/balance/export/campaign backlogs to corresponding `ROADMAP.md`. Cross-owner descriptor reconciliation gets framework safety issue plus Brittany affected-deployment issue linked together. |
| `docs/DECISIONS.md` | Keep D001/D002/D009/D013 repository decisions; D003 generalizes existing dev-destination policy with Brittany example. Move shared-runtime content D005/D006/D008/D010 and shared parts of D011/D012 to new `docs/runtime/DECISIONS.md`; move D004/D007 and Nantes acceptance detail to Brittany decisions, USA design detail from D012 to USA decisions. Retain original IDs/date/context and root heading anchors with routed links; mark splits, do not invent new historical rationale. |
| `docs/TESTING.md` | Keep shared validation/exit semantics/evidence discipline/manual protocol; replace gameplay sections with explicit mod/test matrix and links. Populate each mod's testing README with current command selection, dependencies, scenario links and native evidence limits. |
| `docs/testing/runtime-coverage.md` | Move coverage body to `docs/mods/brittany_missions/testing/coverage.md`; leave old-path compatibility pointer explicitly titled Brittany legacy coverage. |
| `docs/testing/brittany-diplomatic-selector.md` | Move editable scenario to `docs/mods/brittany_missions/testing/diplomatic-selector.md`; leave old-path stub with existing anchors. |
| `docs/testing/american-century/README.md` | Keep dated report/evidence/reproduction/playtests intact, add current-document navigation only. Extract living USA status/roadmap/coverage into new owner docs; keep 31/12/eight-check result limits, 21 actual DLC versus 18 required, nine USA plus three origin missions versus 55 designed, and source-descriptor caveat. |

Create `docs/mods/README.md` as the mod registry/navigation table, with folder ID,
human name, source path and current-state/test links. No duplicated warning counts,
mission totals or PASS summaries in that registry.

Create `docs/runtime/README.md` as shared runtime knowledge index: lifecycle ownership,
protocol/evidence layers, actual-input adapter availability, save/provenance limits,
calibration, fixture/reload semantics and explicitly attributed historical workloads.
Create `docs/runtime/DECISIONS.md` as above; current capability status stays at root.

Create `docs/testing/README.md` as historical/public evidence index. Map every bundle
in section B to primary owner, workload owner and evidence layers. Future reviewed
bundles go under `docs/testing/framework/<scenario>/` or
`docs/testing/mods/<id>/<scenario>/`; raw evidence stays ignored. Per-mod
`testing/` documents hold narratives/coverage, not raw saves or public log dumps.

Create `docs/testing/project-state-migration.json` only when executing: old/new
document paths, pre-migration public hashes, new hashes for edited docs and a note
that native evidence bytes/verdicts are unchanged. Keep
`docs/testing/publication-redactions.json` unchanged as dated provenance.

Edit navigation/policy links in these exact files after creating the new owners:
`AGENTS.md`, `README.md`, `PROJECT_STRUCTURE.md`, `CONTRIBUTING.md`,
`docs/SETUP.md`, `docs/REPOSITORY_HYGIENE.md`, `docs/modding/README.md`, all eight
mechanic guides listed in section B, `docs/testing/environment.md`, and the seven
tool READMEs listed in section D. `docs/PUBLICATION.md` and
`docs/publication-snapshot.md` receive historical-context/navigation notes only if
their existing status links would otherwise imply a current mod verdict.

For completed historical reports/plans, retain old relative links through stubs
where practical; do not bulk rewrite evidence JSON/text or dated test counts.
This avoids moving evidence trees, replay URLs and ignore/publication exceptions.

### 2. Label plans; retain their locations and historical state

Edit `.agent/PLANS.md`: add owner/affected-mod/current-state-source fields to the
convention and owner labels to its index. Fix freeze/recovery index entries to
reflect their complete plan status. Add the ownership reading order and rule that
a plan does not replace framework/per-mod state.

Edit all seven existing plan files listed in section C: add owner/affected-mod
metadata and current canonical links. Preserve dated progress/results, authorizations,
scope and unresolved issues. Update the active American Century plan's live
source-of-truth/next-phase links to USA docs; framework discoveries link to root
status/shared runtime docs. Do not mark it complete or expand its adopted design.
Record any edited historical public-plan hash in the separate migration manifest.

### 3. Move mod-specific tool metadata out of shared defaults

Authorization: **not authorized**. Phase 1 changes no configuration or readers.

Create:

- `tools/mods/brittany_missions/config.json`
- `tools/mods/american_century/config.json`
- `tools/mod-config.mjs`
- `tools/mod-config.ps1`
- `tools/mod-config.test.mjs`

The two JSON files own source ID, human name, deployment descriptor metadata,
existing runtime/manual storage aliases and mission-inspector scenario/state rules.
Transfer keyed scenarios/rules from `tools/mission-inspector/scenarios.json` and
`state-rules.json`; retain those old files as labelled transitional compatibility
data only until both consumers use the new source, then remove them in the same
authorized change. Do not maintain two writable configuration sources.

Transfer `displayName` and each mod's `supportedVersion` from shared deployment
metadata into per-mod config. Preserve **exact current effective values**:
Brittany `Brittany Missions (Development)`, American Century
`american_century (Development)` fallback, and `1.37.*` for both. A nicer USA
launcher name is a separate behavior change, not part of this migration.

Edit `tools/deployment/config.json` and `config.example.json` to contain shared
destination/machine options only; `tools/config.mjs` and `config.ps1` stay machine
config loaders. Edit `tools/deploy-mod.ps1`, `tools/checks/check.mjs` and
`tools/mission-inspector/generate.mjs` to consume owner metadata identically.
Preserve config precedence, Node/PowerShell descriptor bytes and generic unknown-mod
fallbacks. Native contracts require registered owners; generic validation/deployment
must not require every future mod to have a native contract.

Existing ignored local overrides may contain legacy displayName/supportedVersion.
Read/normalize them compatibly at runtime, issue a scoped deprecation notice and
document the mapping; do not edit real local config in the migration or let a
Brittany legacy display name apply to every mod. Preserve generic supportedVersion
override behavior until explicitly migrated to owner-specific overrides.

### 4. Establish contract owners inside the existing runtime system

Authorization: runtime ownership/selection is **authorized as Phase 2A** by the
attached request and execution section above. Inspector output isolation and
config/deployment/collector redesign included later in this proposed step remain
unauthorized for Phase 2A. Phase 1 alone authorized no modules/fixtures or CLI.

Keep one runner, lifecycle/process supervisor, input driver, parser and work root.
Create `tools/runtime-tests/contracts.mjs` as a small explicit owner/test registry;
each adapter exports test IDs, required regression members (if any), allowed modes,
staging/start conditions, expected markers, relevant-error identifiers, oracle and
coverage scope. Keep EU4 assertion bodies and protocol identifiers unchanged.

Exact contract moves, retaining old import/CLI paths as thin deprecated wrappers
where they are documented or externally imported:

| Existing path under `tools/runtime-tests/` | New canonical path under the same root |
| --- | --- |
| `behaviors.mjs`, `wiring.mjs`, `refactor-compare.mjs`, `evaluate.mjs`, `mission-claim.mjs`, `claim-save.mjs` | Same basenames under `contracts/brittany_missions/` after shared helpers are extracted |
| `preview-gate.on_actions.txt`, `behavior-fixture.on_actions.txt`, `nantes-market.on_actions.txt`, `run-effects.on_actions.txt`, `run-effects.run.txt`, `run-effects.after.txt`, `shipbuilding-reward.run.txt`, `borders-reward.run.txt`, `textiles-upgrade.run.txt` | Same basenames under `contracts/brittany_missions/`; keep bytes/encodings |
| `usa-slice.mjs` | `contracts/american_century/usa-slice.mjs` |
| `prepare-nantes-manual.mjs`, `retain-claim.mjs` | Same basenames under `contracts/brittany_missions/`; old executable paths delegate to them |

Create `contracts/brittany_missions/index.mjs` and
`contracts/american_century/index.mjs` as adapter entry points. Extract only already
shared helpers to new `script-ast.mjs` (canonical/unique), `mission-geometry.mjs`
(require explicit mission ID), `save-blocks.mjs` (balanced plaintext block lookup),
and `protocol.mjs` (ordered marker/date/version comparison). They must import no
mod adapter. Do not generalize a complete save oracle or arbitrary GUI support.
American Century then imports those helpers directly rather than Nantes modules.

Edit `run.mjs` to resolve owner/contract explicitly and delegate existing
mod-specific staging, wiring, negative controls, verdicts, relevant-error filters,
claim-count checks and fixture options to the owner adapter. Preserve shared
error identifiers and each active adapter's existing identifiers; scope the filter
without dropping applicable production-helper or fixture errors. USA must not
acquire a fictional named-wiring PASS: retain its actual CWTools/layout/native tree
membership scope and indicate named wiring as not applicable/unimplemented.

Edit `tools/run-eu4-test.ps1`: add explicit `-Mod` and a non-launching `-ListTests`
mode backed by the same registry. Validate unsupported mod/test/mode/diagnostic
combinations before reading game config, creating profiles or changing reports.
The documented preferred forms after migration are:

```powershell
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test all -TimeoutSeconds 150
./tools/run-eu4-test.ps1 -Mod brittany_missions -Test nantes-claim -ClaimMode click -TimeoutSeconds 600 -ProgressTimeoutSeconds 600 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode click -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -Mod american_century -Test usa-slice -ClaimMode negative -TimeoutSeconds 1200 -ProgressTimeoutSeconds 1200 -Retries 0
./tools/run-eu4-test.ps1 -ListTests
```

`all` remains a compatibility name for Brittany's four required logic/effect/wiring
regressions. Print and record the owner and selected case IDs. It does **not** mean
all mods, all Brittany missions, every diagnostic, or end-to-end campaign testing.
An explicit `-Mod american_century -Test all` must fail clearly: no corresponding
required suite exists; do not silently substitute four Brittany effects or start a
supervised USA GUI contract. No repository-wide native `all` command is introduced.

Legacy invocations without `-Mod` keep their historical mapping (usa-slice -> USA;
all and other old test IDs/default preview-gate -> Brittany), but emit a notice
with the resolved owner. New root/mod documentation always specifies `-Mod`.
Keep current names/marker strings, exit codes, retry bounds, diagnostic gates,
native timeout defaults and ordinary-profile preflight semantics. Document the
Brittany/USA launcher-check difference; harmonizing that policy requires separate
design/evidence, not an incidental migration edit.

For shared runtime changes, root testing lists **separate** requirements: offline
framework and affected-adapter tests; Brittany's four regressions; Nantes/USA
click and refusal when changes affect UI/save/formation interfaces. Required
native tests not run remain explicitly pending; a Brittany PASS cannot substitute
for an affected USA adapter contract.

Keep top-level `*.test.mjs` entry points so existing Node/glob/CI discovery works.
Edit the six mod-adapter/replay tests listed in section D plus
`recovery-evidence.test.mjs` to use canonical imports and explicit owner labels;
split generic helper test sections into new `shared-helpers.test.mjs` where needed.
Create `contracts.test.mjs` for owner routing/all semantics/refusal/mode validation.
Do not rename historic evidence or weaken assertions. Add owner labels to offline
suite output in `tools/test-offline.mjs`; preserve its aggregate behavior and CI.

Edit `tools/mission-inspector/generate.mjs` to accept an optional isolated output
root for tests while preserving normal output paths. Update
`tools/mission-inspector/self-test.mjs` and `browser-test.mjs` so source-backed
Brittany fixture tests are explicitly labelled and write/read only their own
ignored test-work, not real mod latest reports. Update
`tools/deployment/self-test.ps1` to specify its Brittany fixture explicitly and
add the second owner metadata case; `tools/test-runs/self-test.mjs` uses an
explicit synthetic namespace. Retain source-backed checks as attributed tests,
not 'generic framework tests' or new native mod evidence.

### 5. Add evidence identity; preserve storage and historical bytes

Authorization: this original proposal was unauthorized during Phase 1/2A.
The separate Phase 2B execution section above now authorizes additive report
identity/reuse only; operational relocation and lifecycle redesign remain excluded.

Edit `tools/runtime-tests/run.mjs`, `tools/cwtools/validate.mjs`,
`tools/validate-cwtools.ps1`, `tools/test-runs/collector.mjs`, `tools/test-run.ps1`,
`tools/checks/check.mjs`, `tools/mission-inspector/generate.mjs` and
`tools/deploy-mod.ps1` to expose additive identity fields appropriate to each
report: `sourceMod`, `storageNamespace`, `artifactKind` (production/staged/fixture),
contract/test/suite ID and covered layers, source/staged build identity, run/attempt
ID, actual versus intended environment, timestamp/status/verdict source.
Use a schema version for newly changed report contracts; retain existing fields.
Do not claim actual native version/DLC from static/preparation or operator logs.

Use optional explicit owner/report-key inputs for arbitrary CWTools `-Project`
validation; check canonical project path, report start/completion freshness and
ownership before accepting copied results. Preserve existing production/staged
report paths and basename fallback for compatibility; document basename collision
limits and allow an explicit unique report key for arbitrary same-name projects.
No destructive report relocation or cache reset is needed.

Collector gets optional source-owner/contract metadata distinct from its existing
`--mod` storage namespace, passed by the runtime runner. Manual production runs
default source owner to the selected production mod; synthetic/untracked runs can
declare fixture/unknown ownership without manufacturing a verified build.
Keep existing active/latest/baseline records and aliases. New report consumers must
reject conflicting owners; legacy records are accepted only through explicit
mapping plus existing source/build checks, never guessed from human scenario text.
A bare collector outcome without owner/build evidence cannot close mod coverage.

For native results, separate framework lifecycle/cleanup outcome from per-contract
behavioral verdicts. A successful retry does not rewrite an earlier incomplete
attempt. Mod status records applicable contract result, source hashes, layers and
environment; framework status records exercised capability/workload and its limits.

Keep `tools/deployment/state/<mod>/<destination-key>/`, all report namespaces,
`tools/runtime-tests/work/`, `active-lifecycle.json`, actual destinations and
existing runtime descriptor/collector aliases unchanged. No live operational
record is rekeyed, sanitized or repaired. Extend the local retention helper only
for new calls to `.local/evidence/mods/brittany_missions/<label>/`; preserve old
label/path lookup compatibility. A generic other-mod retention system is deferred.

Edit `tools/config.test.mjs`, `tools/checks/self-test.mjs`,
`tools/test-runs/self-test.mjs`, `tools/cwtools/self-test.mjs`, and the new metadata/
registry tests for changed contracts. Existing `lifecycle.mjs`, `processes.ps1`,
`codex-input.mjs`, vanilla lookup implementation and CI need no architectural
change; modify only if an import/guard regression actually requires it.

## Compatibility, risks and non-goals

- Production `mod/` files, descriptors, mission IDs, localisation, rewards and
  encodings stay byte-identical. Source AMC descriptor is not certified by the
  rewritten runtime descriptor. No gameplay fixes/balance work in this migration.
- Preserve D001-D013 IDs, adoption history and plan authorizations. Root compatibility
  stubs/anchors must satisfy old report/plan links; no invented retroactive PASS.
- Keep root STATUS/DESIGN names as useful framework sources, not mod-only redirects.
  This intentionally changes their ownership; prominent owner headings and new
  AGENTS startup instructions prevent fresh-agent confusion.
- Do not move public evidence trees. Relative replay URLs, original/public hashes,
  `.gitignore` exceptions, audit rules and dated redaction manifest stay stable.
  Moving authored provenance JSON is recorded separately; no hash recalculation
  masquerading as the original publication hash.
- Keep local config precedence (environment -> ignored override -> shared defaults),
  legacy overrides and exact descriptor bytes. Node and PowerShell metadata readers
  must agree; a metadata move must not bypass externally modified deployment guards.
- Existing runtime namespace names remain aliases, not new source-mod IDs. Old native
  results lack explicit sourceMod; any read compatibility needs a finite documented
  mapping and build/scenario validation, rather than arbitrary inference.
- Rebase moved modules' imports, `import.meta.url` root calculations, template paths,
  executable-entry guards and replay-resource URLs. Thin command wrappers must
  dispatch once with unchanged arguments and exit codes; importing a moved adapter
  must not execute a CLI. Retain top-level test entry points so glob discovery does
  not omit relocated tests or accidentally run a suite twice.
- Global lifecycle lock/flat ownership scan intentionally remain shared across mods.
  Per-mod locks or nested work directories could break stale ownership recovery or
  permit concurrent native games; neither is needed to clarify state ownership.
- Source-backed tests can remain valuable framework workloads. Attribute them and
  isolate their output; do not erase assertions or declare them universal coverage.
- Keep bounded active Codex driver dependency, known geometry, DLC/version limits,
  manual/native distinctions, failed combined checks and query discrepancies visible.
- No new dependencies, second runner, automatic documentation generator, dashboard,
  wholesale testing-framework redesign, deployment, package export, license change,
  archived-history cleanup, commit or push is proposed.

## Historical proposal implementation sequence (authorization updated above)

1. Capture candidate-file and protected production/evidence hashes; record current
   framework/mod check state and plan statuses. Resolve no deployment mismatch.
2. Create owner documents and shared knowledge index; transfer current facts and
   backlogs with dated evidence scopes. Add old-path stubs/anchors and migration
   provenance manifest. Update navigation and owner metadata in plans.
3. Migrate mod metadata/readers with exact output compatibility; isolate
   inspector/browser test reports. Keep generic tool behavior and storage.
4. Extract shared helpers and owner adapters mechanically; add explicit registry,
   -Mod/-ListTests and legacy routing. Keep old import/command wrappers where needed.
5. Add report identity/read compatibility and explicit test selection/runbook matrix.
   Retain all history, local evidence, locks, failed verdicts and source bytes.
6. Run the relevant checks and native contracts below, update each affected owner's
   actual status/coverage and this plan, then perform hygiene/link/byte review.
7. Mark migration complete only when ownership acceptance criteria are satisfied;
   leave missing native evidence as pending, never translate static/offline PASS
   into gameplay verification. No commit/publication without separate scope.

## Validation and clearly labelled playtest list

### Proposal-only checks (this review)

Check local Markdown links/anchors, publication audit, changed-file scope and
whitespace. No CWTools, self-test, deployment or native run is necessary for this
proposal-only change. Record results below before handoff.

### Larger migration checks (tooling/runtime checks unauthorized in Phase 1)

Phase 1 performed the applicable documentation/navigation/protection checks only.
The new registry/helper/metadata/CLI/schema/native checks below belong to the
unapproved tooling/runtime proposal; they are not Phase 1 completion requirements.

1. **Navigation/ownership acceptance:** a fresh reader can identify framework status
   and tests using only root/shared docs. For each mod, owner docs enumerate current
   implementation, adopted versus proposed design, source hashes/evidence limits,
   roadmap and playtests without borrowing another mod's verdicts. Search residual
   root/tool references to bri_/amc_/Nantes/USA/all and classify every occurrence as
   explicitly scoped example, adapter, historical compatibility or misplaced state.
2. **Links/hygiene/bytes:** `node tools/publication/check-links.mjs`,
   `node tools/publication/audit.mjs`, `git diff --check`; inspect new files and
   diffs. Compare protected `mod/` and historical evidence hashes before/after.
   Check old anchors, provenance JSON relocation, stubs, ignore status, and that no
   raw/local paths/assets are exposed. Do not stage/commit as part of validation.
3. **Offline contracts:** `node tools/test-offline.mjs`; registry/helper tests must
   reject owner/test/mode mismatches, distinguish Brittany all from USA, retain
   negative/refusal oracles, and prove no other-mod native result is accepted.
   Legacy commands/import shims and existing replay verdicts remain compatible.
   Tests must demonstrate inspector QA leaves production latest reports untouched.
4. **Metadata/deployment integrity:** run `./tools/deployment/self-test.ps1` in its
   isolated fixture; Node/PowerShell descriptor bytes remain equal for both owners,
   local/env precedence remains valid, unrelated/unowned/externally modified
   destinations remain protected. `-Preview -Mod <id>` is safe path inspection,
   not a deployment or native verification. Do not reconcile existing Brittany
   descriptor mismatch in order to pass.
5. **Static coverage:** after runtime script fixture changes, run source
   `./tools/validate-cwtools.ps1 -Mod brittany_missions` and
   `./tools/validate-cwtools.ps1 -Mod american_century`; run staged validation via
   preparation/runtime paths as appropriate. Read status/identity/errors/warnings;
   preserve 58 Brittany warnings unless independently resolved. Run owner-qualified
   inspector/combined check if those consumers changed, preserving old failed
   reports/archives and recording any new failure. Source-backed test regeneration
   is not a normal native mod playtest.
6. **Windows lifecycle adapter:** `node --test tools/runtime-tests/windows-adapter.test.mjs`
   when native process/runner interactions are changed or for the migration handoff.
   Explicit -ListTests and invalid-selection cases must not launch EU4 or mutate
   profiles/reports. Preparation-only confirms staging/static ownership, not PASS.

Native scenarios after authorized runner/adapter changes:

| Playtest | Affected files / evidence | Starting conditions and steps | Expected result / failure signs |
| --- | --- | --- | --- |
| Brittany required regression | `run.mjs`, registry, Brittany adapter/index/fixtures/wiring/protocol; reference `docs/testing/runtime-regression-suite/README.md` | Verified installed 1.37.5.0 and actual DLC/playset, no unrelated EU4; isolated fresh BRI 1444.11.11; `-Mod brittany_missions -Test all -TimeoutSeconds 150` | Exactly preview/shipbuilding/borders/textiles cases, scoped LOGIC/EFFECT/WIRING verdicts, source/staged owner hashes and clean owned cleanup. Failure: USA selected, missing/extra case, false mission-dispatch claim, stale report accepted. |
| Staged negative control | Brittany adapter/fixtures and runner option routing; same suite reference | Same isolated baseline; `-Mod brittany_missions -Test all -NegativeControl -TimeoutSeconds 150` | Expected exit 1, preview/shipbuilding/borders FAIL, textiles PASS; production hashes unchanged. Failure: mutation leaks to source, suite PASS or wrong owner. |
| Nantes click and refusal | Brittany mission-claim/save adapter, shared geometry/block/protocol/input handoff; reference `docs/testing/runtime-mission-claim/README.md#playtest-list` | Fresh Nantes ready and separate missing-building fixture, recorded 1280x720/scale 1/top scroll, active supported Codex driver; run explicit Brittany nantes-claim click and negative commands with 600-second total/progress bounds/retries 0 | Actual one button/input action and saved permanent rewards for click; no entry/completion/reward for refusal; scoped UI/save PASS and cleanup. Failure: state-only completion accepted, wrong mission/geometry/nonce/owner, cross-mod saved oracle. Additional numeric/reload dimensions retain their existing manual evidence limits. |
| USA click and refusal | USA adapter/fixture/oracle, shared helpers, metadata/runner; reference `docs/testing/american-century/README.md#playtest-list` | Verified runtime activation including actual enabled DLC; fresh ENG overseas deterministic fixture, active supported driver; explicit USA usa-slice click/negative commands, 1200-second bounds/retries 0 | Real vanilla formation, four production claims and specified constitution choice, exact 31 save/input checks, 12 ordinary reload comparisons; separate eight-check refusal. Failure: Brittany oracle/suite used, setup replay on reload, wrong owner/build or extra rewards. Natural colonial campaign, alternate choice and full tree remain open. |
| Lifecycle ownership/recovery boundary | `run.mjs`, registry/report identity; reference `docs/testing/runtime-recovery/README.md` | Global lock in place, owned isolated profiles, no unrelated EU4; choose the existing documented controlled-exit/crash/freeze exercise if lifecycle-affecting changes occurred | Same cleanup-before-retry, fresh attempts, earlier incomplete verdicts preserved, cross-mod live lock refusal. Failure: concurrent games, name-only cleanup, old ownership missed, invalid record authorizes cleanup. Do not repeat destructive native diagnostics solely for documentation moves. |

If the historical UI adapter is unavailable in the execution environment, preserve
affected UI contracts as pending/INCOMPLETE and use the documented manual scenarios
where authorized; offline replay is not replacement native evidence. Implementation
completion and verified native compatibility must be reported separately.

## Progress, decisions and remaining issues

- [x] Inventory public documentation, plans, commands, adapters, tests, naming and
  local storage/report identity boundaries.
- [x] Distinguish actual architectural mixture from legitimate attributed examples
  and already-correct deployment/report/cache separation.
- [x] Specify ownership hierarchy, exact proposed moves/creates/edits, compatibility,
  sequence, acceptance criteria and validation/playtests.
- [x] Record proposal-only link/audit/diff validation results below.
- [x] Obtain explicit Phase 1 documentation/state ownership authorization.
- [x] Implement documentation file-migration steps 1 and 2, with navigation.
- [x] Complete Phase 1 checks/provenance/handoff.
- [ ] Proposed file-migration step 3: unauthorized; no per-mod tool config/readers.
- [x] Proposed file-migration step 4 runtime ownership/API portion: Phase 2A authorized
  and complete with both-owner native validation. Its inspector output-isolation
  and config/deployment/collector fixture extensions remain unauthorized (Phase 2C/2B).
- [ ] Proposed file-migration step 5: unauthorized; no schema/collector/deployment/lifecycle changes.

Dated Phase 1 snapshot (runtime restrictions superseded by Phase 2A above):
root state is framework state; per-mod documents use source
IDs; plans label owners; historical evidence/commands/names/storage are preserved.
Current static/deployment/collector commands document existing -Mod interfaces;
native all is labelled Brittany-only and native -Mod/-ListTests do not exist.
One-runner owner adapters, a registry, per-mod tool config and future explicit
native selection/report identities remain unadopted implementation proposals.

At that Phase 1 handoff, Phase 2 concerns (then unauthorized) were local override/config migration,
adapter extraction/native validation, explicit selection and schema regression.
Other gameplay/design roadmap items retain their existing owners/authorization.
Do not begin them as a continuation of this Phase 1 documentation task.

## Validation results for this proposal

- Local link/anchor check: PASS, 433 public links, zero issues.
- Publication candidate audit: PASS, 757 files, zero scanner findings. This is the
  existing bounded scanner, not new ownership/licensing certification.
- Tracked `git diff --check` and new-plan `git diff --no-index --check`: no whitespace
  findings. New file was checked explicitly because ordinary diff excludes it.
- Changed-file scope: only this new plan and four navigation lines in
  `.agent/PLANS.md`; no tracked mod/tool/evidence changes and no staging/commit.
- Initial bare `node` invocations could not start because Node is absent from PATH.
  Both checks were rerun successfully through the repository-documented Codex Node
  fallback, without editing shared configuration or exposing its machine path here.
- No CWTools, tool self-test, native EU4, deployment or migration verification ran.
  Those prospective checks/playtests remain in the authorized-migration list above.

## Completion criteria

Review delivery: this standalone plan inventories the mixed ownership surfaces and
provides a concrete minimal proposal with exact paths, compatibility and checks;
only plan/navigation files changed and proposal-only checks reported.

Phase 1 completion: framework state is readable without mod documentation; each
mod owns current project/design/status/roadmap/testing; task plans label owners;
historical bundles and production/tool bytes are preserved; compatibility links,
provenance and applicable documentation checks pass. Deliver reading paths and
deferred ambiguity, then stop with no remaining authorized migration work.

Larger migration proposal (steps 3-5 require separate authorization): framework state is readable without
mod documentation; each mod has independent current state/design/roadmap/testing;
tasks name owners and authorization; commands/reports identify source owner and
coverage; legacy behavior/storage/evidence integrity remain compatible; relevant
checks actually pass and missing native evidence stays clearly open. No whole-mod
release, other-version/DLC, AI or campaign certification follows from reorganization.

## Phase 1 completion and handoff (2026-10-06)

Completed the authorized documentation file-migration steps 1 and 2 and applicable
documentation/provenance validation. The plan is complete for review plus Phase 1;
unchecked Phase 2 boxes above are unapproved proposals, not active execution work.
No remaining migration work is authorized. Stop here; do not start Phase 2.

Canonical reading paths:

- Framework/tooling: `README.md` / `AGENTS.md` -> `docs/PROJECT.md` ->
  `docs/STATUS.md` -> root DESIGN/ROADMAP/DECISIONS -> `docs/TESTING.md`,
  `docs/runtime/README.md` / shared guides -> relevant tool README and owner plan.
- Brittany: repository instructions -> `docs/mods/brittany_missions/PROJECT.md`
  and `STATUS.md` -> its DESIGN/ROADMAP/DECISIONS -> `testing/README.md` and
  `testing/coverage.md` -> owning plan and shared mechanic guide.
- American Century: repository instructions -> `docs/mods/american_century/PROJECT.md`
  and `STATUS.md` -> its DESIGN/ROADMAP/DECISIONS -> `testing/README.md` and
  `testing/coverage.md` -> active American Century plan and shared mechanic guide.

Actual compatibility choices: preserve the historical selector scenario/results
at their original path and create a separately rebased canonical scenario; keep
the old USA provenance JSON byte-identical as a bounded historical compatibility
copy alongside the canonical copy. Keep all historical reports, including USA
README/protection/change records, completely unchanged. Evidence-index navigation
supplies their current owner; old raw/public hashes remain in the original redaction
manifest. These choices prioritize the user's stricter historical-byte requirement
over the proposal's optional navigation edits inside old reports.

Validation:

- Public Markdown links/anchors: PASS, 679 local public links and zero issues.
- Publication candidate audit: PASS, 779 candidate files and zero scanner findings
  within its stated limits.
- Tracked diff and every new public file: no whitespace diagnostics.
- Owner/navigation acceptance: PASS for root/current mod documents and every task
  plan; legacy heading anchors retained; no unsupported native -Mod/-ListTests
  commands introduced into current runbooks.
- Shared environment's parser input: all 18 DLC names/order/indented bullet format
  unchanged. No machine/configuration or activation state changed.
- Protected-byte checks: **20 production files**, **734 historical evidence files**
  (including original report narratives and locally retained captures), **79 tool
  code/configuration/CI/ignore-policy files**, and the original USA provenance JSON
  all unchanged. Complete local inventories/results stay ignored; category counts,
  inventory digests, old/new public document hashes and relocations are recorded in
  `docs/testing/project-state-migration.json`. That manifest excludes its own hash
  to avoid circular provenance.
- New-file whitespace checker initially interpreted Git --no-index's ordinary
  difference exit 1 as failure. Clean and fault controls calibrated 1/no diagnostics
  versus 3/trailing-whitespace diagnostics; corrected checker passes. Initial local
  report retained as `acceptance-initial-exit-semantics.json` in ignored review
  storage. This was a diagnostic wrapper correction, not a weakened product test.
- No CWTools/native run, offline tool self-test, deployment, staging, commit or push.
  Those checks are unnecessary for unchanged game/tool content; no new gameplay
  verification or renamed historical verdict is claimed.

Remaining ambiguity at the Phase 1 handoff required then-unauthorized proposed steps 3-5: shared deployment
metadata and inspector scenarios still mix mod configuration; generic runtime
module names and helper imports still carry Brittany coupling; native test names
infer ownership/all remains Brittany-scoped; collector mod can mean source or
storage alias; CWTools reports use basenames and lack explicit source owner;
source-backed inspector QA still uses normal Brittany report paths. Documentation
labels these limitations but does not enforce new identities in unchanged tools.
Operational evidence/report namespaces and lifecycle/process ownership are intact.

## Phase 2A completion and handoff (2026-10-06)

Phase 2A is complete. The attached authorization covered the runtime ownership/API
portion of proposed step 4 only. Canonical adapters/fixtures, shared helpers and
registry selection now separate source ownership; one runner, global lifecycle
lock, work root, input driver, old storage aliases and protocol/oracle meanings
remain compatible. Runtime reports add only selection owner/member metadata.

Exact moved/new/wrapped paths, supported owner/test/mode matrix, preferred commands,
legacy routing, shared-helper dependency removal, retained failures and run IDs are
recorded in `docs/runtime/phase2a-ownership-2026-10-06.md` (linked above).

Validation:

- Offline aggregate PASS: 66 Node tests and four tool self-tests. Final targeted
  registry/PowerShell checks PASS 9/9 after the last empty-owner/geometry-default
  assertions. Original replay verdicts/assertions preserved; one new helper test's
  initial scalar expectation was corrected, with its failed output retained.
- Windows adapter PASS 2/2 with normal CIM access. Initial restricted run's access
  denial remains retained; no process-policy redesign. Final read-only process
  inspection found zero EU4, crash reporter and idle dummy processes.
- Six explicit native runs completed in one attempt each with clean owned cleanup
  and no retry. Brittany all executes exactly four members/PASS. Staged negative
  control remains FAIL/exit 1 with preview/shipbuilding/borders FAIL and Textiles
  PASS. Nantes click/refusal PASS (13 native save checks each); USA click PASS
  (31 save checks) and fresh refusal PASS (8). No Brittany result substitutes for USA.
- All six source/staged CWTools checks complete with zero errors. Brittany source
  11 files/58 warnings, all/control stage 13/62, Nantes stage 13/58; USA source
  8 files/0 warnings and stage 12/0. Warnings are not discarded.
- Native version 1.37.5.0 Inca (491d); all four UI saves identify only the isolated
  runtime mod and 21 DLC, including required 18 plus Art of War/Common Sense/Rights
  of Man; American Dream absent. Exactly-18-only compatibility remains unverified.
- Protected integrity PASS: 905 files unchanged from the pre-runtime snapshot,
  including production, all docs/testing history and Phase 1 provenance, configuration,
  deployment/collector code/state, lifecycle/input, ordinary launcher/settings/database
  and selected installed references. Nine moved fixtures match original bytes.
- Final local-link/publication audit and tracked/new-file whitespace/scope review
  PASS. New files are checked explicitly; the nine pure fixture moves are compared
  against original bytes. Three inherited EOF blank lines remain preserved; one
  newly extracted helper's trailing blank was removed. Raw initial check output
  stays local. No private configuration/game assets/raw evidence were published.

No required Phase 2A contract remains pending. No fresh reload/expiry/natural campaign
or alternate-choice verification is claimed; the owner playtest lists remain open
where previously bounded. Crash/freeze game diagnostics were not repeated because
lifecycle behavior/code did not change. Historical results/provenance remain dated;
the Phase 1 migration manifest was not regenerated.

Canonical reading paths remain root PROJECT/STATUS/TESTING/runtime knowledge for
tooling, then `docs/mods/brittany_missions/` or `docs/mods/american_century/` for
the selected gameplay owner and its coverage. New native usage specifies -Mod;
legacy inference/import/manual-command wrappers remain available.

Historical Phase 2A boundary (Phase 2B items superseded by authorization/completion above):

1. Proposed step 3 / Phase 2C: per-mod tool configuration/readers, display names,
   version/deployment metadata moves and local override migration.
2. Proposed step 5 / Phase 2B: report/source/storage/artifact identity/schema,
   collector provenance, CWTools report keys/freshness, deployment-state schema,
   operational evidence relocation and generalized retention.
3. Output-isolation/config/deployment/collector fixture extensions mentioned within
   proposed step 4: deferred to Phase 2C/2B; inspector tests still use Brittany's
   normal report outputs. Runtime owner extraction does not resolve that coupling.
4. Lifecycle redesign/concurrent EU4 and either mod's gameplay/campaign expansion
   remain outside this ownership task and retain their separate scope/authorization.

No commit, staging or push performed. Stop after Phase 2A; do not start 2B/2C.
