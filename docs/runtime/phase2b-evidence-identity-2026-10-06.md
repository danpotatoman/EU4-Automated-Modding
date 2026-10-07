# Phase 2B evidence identity and reuse handoff

Owner: repository/framework tooling
Date: 2026-10-06
Scope: authorized evidence identity, report provenance and result-reuse safety
Current state: [framework status](../STATUS.md), [schema](evidence-identity.md),
[governing plan](../../.agent/plans/2026-10-06-project-state-ownership.md)

Phase 2B implementation and required validation are complete. Gameplay, native
contract/protocol meanings, Phase 2A registry/selection/adapters, timeout/retry
policy, lifecycle/input code and existing operational layouts are preserved.
No commit or push was made. Phase 2C remains unauthorized; work stops here.

## Existing state and resumption

The inherited dirty worktree contains Phase 1/2A work. The Phase 2B pre-change
snapshot and original public candidates remain ignored under
`.local/project-state-phase2b/`; they are the comparison baseline, not Git HEAD.
Before resumption the shared identity model, producer metadata and consumer guards
already existed. Initial offline validation passed 74 tests plus four self-tests;
later additions reached 75. Deployment and collector wrappers passed. Windows
adapter execution first failed because restricted CIM access was denied, then
passed 2/2 with normal access. Both observations remain retained. Brittany all
and its staged negative control had completed; Nantes/USA UI acceptance was pending.

Resumption checked actual worktree, lifecycle ownership/lock and live processes.
No EU4 session or owned remnant required cleanup; historical namespaces were never
used as process ownership. The supported computer-use driver was available.
Resumption extracted the corrected saved-environment parser, added three focused
regressions, finished the four fresh UI contracts, strengthened identity conflict
checks and completed installed-tool, integrity and publication review. Final
consumer review additionally corrected combined deployment preparation to reject
schema-2 owner/namespace/artifact conflicts and unsupported versions; redeployment
now also rejects contradictory artifact kind. Focused self-test cases reproduce
these failures while preserving legacy and destination-byte protections.

The original parser collected every quoted value in `mods_enabled_names`, mixing
filenames with display names; a loose `name=` match could also match `filename=`.
The fix parses each saved entry's boundary-delimited `filename` and `name` fields
separately into `enabledModFiles` and `enabledModNames`. Neither assigns `sourceMod`.
Missing, duplicate, unexpected or ambiguous filenames leave actual activation
unknown with issues; `requireActualActivation` rejects that ambiguity. Regression
tests cover arbitrary display text, absent/multiple/conflicting filename entries,
missing blocks and a valid filename without a display name.

Two earlier Nantes records are independently preserved:

| Run ID | Original outcome and evidence |
| --- | --- |
| `20261006T225412743Z_41e5238796440641` | INCOMPLETE; deliberately stopped after the parser defect was found, before any UI input. No `ui-actions.jsonl`; operator abort and clean cleanup retained. |
| `20261006T225634777Z_f671b215064dd5c7` | INCOMPLETE during the interruption; three navigation inputs, no saves or mission input. Recorded lifecycle reason is `unexpected-exit`, with clean cleanup; exit cause is unestablished. |

The user's resumption description mentioned the first attempt; the actual state
also contained the second. An earlier progress inference called the second a
timeout; its record does not establish that. Both result/attempt/action/abort
files were hash-checked at resumption and after final validation, without rewriting
either verdict. Passing reruns do not supersede their evidence.

## Changed tools and formats

| Producer/consumer | Additive Phase 2B change |
| --- | --- |
| Shared `tools/evidence-identity.mjs`, `tools/evidence-record.mjs` | Bounded vocabulary, deterministic path/byte manifests, applicability/finite legacy rules and PowerShell bridge. |
| Native `tools/runtime-tests/run.mjs` | Root result and individual `attempts/<n>/result.json` identity, requested versus exercised layers, intended/observed environment, immutable aggregate attempt snapshots and cleanup separate from behavior. |
| Nantes preparation adapter | Preparation-only fixture/source/build identity; no actual activation or END-TO-END claim. |
| Saved environment module/tests | Pure filename/display-name separation and ambiguity reporting, used by native result producer. |
| Collector `collector.mjs`, `test-run.ps1` | Optional source/artifact/contract/provenance inputs; run/report/pointer schema identity. Existing `mod` remains storage namespace, capture ID and baseline semantics remain intact. |
| CWTools `validate.mjs`, wrapper | Optional source/report-key/kind/project identity, canonical production recognition, arbitrary-project null owner, running/failed/complete identities and source-change/freshness guards. |
| Combined `checks/check.mjs` | Schema 2 static results; fresh CWTools/inspector build/path/owner guards; strict collector applicability and legacy findings comparison. |
| Mission inspector generator | Schema 2 STATIC-only reports with full source manifest and timestamps. Only the self-test writes a separate fixture namespace (`self-test-brittany`) to preserve production latest provenance. |
| Deployment wrapper | Future schema 2 records with source/deployed build and run/time identity; fresh validation bridge, source-change detection and explicit owner/schema conflicts. Existing destination/hash protections and descriptor semantics retained. |
| Tests/docs | Nine identity/collector tests, three parser tests, affected self-test assertions and current framework/tool/mod interpretation documentation. |

Full generated records use schema **2**; checks formerly used 1, other historical
formats were unversioned. Fields are additive and producer-specific. The detailed
[semantic model](evidence-identity.md) owns required/optional fields and compatibility:

- `sourceMod` is the explicitly selected source owner or null; `storageNamespace`
  is independent. Existing runtime/manual/synthetic aliases remain valid storage.
- `artifactKind` is bounded to production, staged, fixture, synthetic, untracked
  or baseline. Native hook/history copies are fixture, deployment copies staged;
  a production source reference does not change artifact kind.
- Contract/suite/member/mode fields identify the exact selection. `coveredLayers`
  records exercised layers; `requestedLayers` and collector `declaredLayers`
  describe intent or declarations. STATIC/LOGIC/EFFECT/WIRING/END-TO-END remain
  distinct, with INPUT/SAVE/CALIBRATION/DIAGNOSTIC detail. Cleanup is operational.
- `sourceBuild`, `stagedBuild`, `artifactBuild` use `sha256-path-manifest-v1`:
  ordinally sorted normalized relative paths and byte hashes, aggregate JSON hash
  and canonical real project path. Symlink/junction identities are refused.
- `runId` identifies invocation, `attemptId` its individual attempt. Collector
  capture ID remains separate. `startedAtUtc`/`finishedAtUtc`, status/verdict and
  verdict/evidence source scope the observation. Installed/profile intent never
  substitutes for native logs, nonce-scoped DLC assertions or saved activation.

Attempt files begin INCOMPLETE, then retain their own behavioral evidence and
lifecycle outcome. Aggregate snapshots are cloned; a retry PASS cannot mutate a
prior attempt. Retry scheduling follows existing policy. Offline retry regression
demonstrates earlier INCOMPLETE retention; no lifecycle semantic change required
new crash/freeze diagnostics. Lifecycle/input sources are byte-identical.

## Reuse, freshness and compatibility

Current consumers reject unsupported schema, missing identity, owner/storage/
artifact/contract/suite/member/mode/run/attempt conflicts, aliased-field conflicts,
requested project/build algorithm/hash/path mismatch, missing layers, running/
prepared/INCOMPLETE states, invalid completion times and native PASS without
behavioral PASS. Both invocation start and finish must meet a consumer's freshness
boundary. Replay cannot satisfy a native request; clean cleanup cannot promote PASS.

CWTools basename fallback and existing production/runtime report/cache locations
remain unchanged. Arbitrary equal-basename projects still share a latest slot
unless callers supply distinct report keys. Full project/build/freshness checks
reject the other project; explicit keys permit independent slots. Arbitrary
projects default to null owner/untracked kind, not a source owner from basename.

Finite legacy compatibility resolves records in memory:

- CWTools canonical production paths can identify the two known owners, but old
  records lack full build/start proof and cannot satisfy current invocation guards.
- Collector compatibility requires one of the five documented known namespaces,
  canonical deployment source and independently matching deployed bytes. Scenario
  text supplies no owner. Runtime aliases remain fixture, source namespaces staged.
- Checks schema 1 is a findings baseline, not current validation identity.
- Deployment legacy records retain existing destination/file/hash protections;
  unknown schemas and explicit new ownership conflicts are refused.
- Historical protocol/save replays retain their original assertions and verdicts;
  they are not migrated or treated as fresh native evidence.

Collector layers remain empty and outcomes operator-declared even with matched
deployment hashes. Ambiguous/untracked/conflicting captures cannot close gameplay
coverage. Baseline/latest pointers reference records and are not standalone verdicts.

## Validation results

Local original output is retained in `.local/project-state-phase2b/` and existing
ignored tool output. Public handoff prose contains no raw game saves, logs, screenshots
or machine paths. No historical evidence/public-copy hash was rewritten.

| Check | Result |
| --- | --- |
| Final offline aggregate | **78/78 Node tests + four tool self-tests PASS** (inspector, collector, combined checks, vanilla reference); Phase 2A registry/wrapper/replay tests preserved. |
| Windows process adapter | **2/2 PASS** with normal CIM access; original restricted-CIM failure retained. |
| Installed CWTools integration self-test | PASS: valid fixture exit 0, invalid fixture exit 1 with three errors, empty fixture exit 2 invalidating latest; schema/path/build/start/finish freshness checked. |
| Collector PowerShell wrapper/self-test | PASS, including independent USA source owner versus synthetic fixture namespace, empty exercised gameplay layers, capture/baseline/legacy behavior. |
| Deployment self-test | PASS: preview no writes, unowned/externally modified destination refusal, descriptors/encoding, repeat/legacy records, new owner/artifact conflicts, unrelated sentinel preservation. |
| Validated deployment integration | Both mods PASS to a new ignored self-test destination, including fresh CWTools bridge, source/deployed identity and byte-preserving copies. Ordinary deployment remains untouched. |
| Actual combined checks | USA PASS/0; Brittany completed FAILED/1 solely for existing modified-destination protection. CWTools 0 errors (Brittany 58 warnings; USA 0), inspector 0 errors (6/2 warnings), file checks 0 errors. No assertion relaxed. |
| Native identity acceptance review | Six completed records and four independent saved activation/hash observations accepted; both earlier INCOMPLETE records rejected; cross-owner, fixture/production and stale invocation requests rejected. Retained aggregate/attempt records match exactly. |
| Publication/links/whitespace | PASS: 805 publication candidates/0 findings, 729 local links/0 issues; tracked diff and all seven new Phase 2B files pass whitespace review. Scanner limits remain those in repository hygiene. |

Native target: installed **EU4 1.37.5.0 Inca (491d)**; game logs show
`EU4 v1.37.5.0 Inca`, saves show `1.37.5.0`. Six required runs each had one
attempt, no retries and clean cleanup. Source/fixture CWTools validation preceded
every native run, with zero errors. All native records keep production and fixture
manifests separately.

| Owner/contract | Run ID | Native result / bounded evidence |
| --- | --- | --- |
| Brittany all | `20261006T224853127Z_ad924fb60796a755` | PASS/0, four LOGIC/EFFECT/WIRING members plus STATIC; no ordinary mission claim. Source 11 files/58 warnings; fixture 13/62. |
| Brittany staged negative control | `20261006T225153483Z_3d6b356f83b64008` | Expected FAIL/1: preview, shipbuilding, borders FAIL; Textiles PASS. Same file/warning counts. |
| Nantes click | `20261006T230353856Z_5271f4e3ba59e8da` | PASS/0, 13 save checks, one actual mission-entry input, both permanent rewards once, immediate Textiles readiness. Source 11/58; fixture 13/58. |
| Nantes refusal | `20261006T231042406Z_d9bf99174493af64` | PASS/0, 13 checks; missing-marketplace prerequisite inspected, no entry input, completion/rewards remain absent. Same validation counts. |
| USA click | `20261006T231445477Z_c87158e9f1747920` | PASS/0, real vanilla formation/ideas, four actual claims, constitutional choice and 31 save/input checks. Source 8/0; fixture 12/0. |
| USA refusal | `20261006T232211624Z_a26184c2eb401db2` | PASS/0, real formation/ideas, missing-marketplace prerequisite and eight save/input checks; no mission input or rewards. Same validation counts. |

Every fresh UI save establishes only `mod/runtime_test.mod`, with display names
stored separately. All four UI runs saved 21 activated DLC: required 18 plus Art
of War, Common Sense and Rights of Man. Non-UI all/control establish the required
18 individually, with extra DLC/activation unsaved and unknown. Exactly-18-only
support and broader compatibility are unverified. Intended isolated environment
and ordinary launcher configuration remain separately labelled.

Source manifests are unchanged: Brittany
`0e73280b84ba52ca13f979eca6978fc12e8fe068dc0993228ccdfeb6c8c17818`;
American Century
`06ec36a619307e88a9e277f074317245350f6d7516cfd5c6d0563a621da2d6cd`.
Fixture hashes differ by run/nonce and never replace these production identities.

## Protected state and remaining limits

The initial 1,713 hash records represent **1,075 distinct normalized paths**;
duplicate separator spellings caused repeated entries. Final allowlisted comparison
found no unexpected change. Unchanged captured groups include:

- 20 production files; 738 historical evidence files including Phase 1 provenance;
- Phase 2A handoff; 10 runtime fixture text/GUI files; three lifecycle/input sources;
- six configuration/helper files; 121 existing deployment-state files;
- eight external files (ordinary launcher/settings/database/deployment and selected
  installed references). Installed vanilla was only read.

Two ignored overrides (`tools/cwtools/config.local.json` and
`tools/deployment/config.local.json`) were omitted from the pre-task snapshot.
Their modification times predate Phase 2B, used code paths read them only, and
late-captured hashes match final hashes. **Pre-task byte equality cannot be certified
for these two files.** No configuration edit was performed. This evidence gap is
retained, rather than inflating the protected-file claim. Final process inspection
found no EU4/crash reporter or active lifecycle lock; retained isolated profiles
and raw evidence remain ignored.

Other limits: equal-basename fallback still shares latest storage; optional caller
owner/contract declarations do not independently authenticate gameplay; saved
filename identity refers to the isolated descriptor and is tied to recorded staged
hashes rather than inferred from display text. Legacy ambiguity remains unknown.
The existing Brittany descriptor/destination mismatch remains protected for separate
reconciliation. The second interrupted Nantes exit cause remains unestablished.

## Playtest list and deferred work

The affected gameplay files are unchanged. Reproducible native conditions/actions,
expected results and failure signs remain in the owning runbooks:

| Scenario / affected files | Starting conditions, steps and expected evidence | Failure signs / remaining scope |
| --- | --- | --- |
| Brittany suite; production triggers/effects/missions | [Suite playtests](../testing/runtime-regression-suite/README.md#playtest-list): fresh BRI fixture, required DLC, named all contracts and staged control | Wrong predicate/delta/wiring or promoted suite END-TO-END; ordinary reward dispatch/selector/expiry remains open. |
| Nantes; `missions/Custom_Breton_Missions.txt`, shared effects | [Brittany runbook](../mods/brittany_missions/testing/README.md): ready/unready fresh BRI fixtures, inspected derived input, independent before/after saves | Missing/duplicate reward, wrong readiness, input despite refusal or mismatched nonce/save/activation. No new reload/numeric probe added. |
| USA; `missions/AMC_USA_Missions.txt`, constitution event, triggers/modifiers | [USA runbook](../mods/american_century/testing/README.md): overseas ENG fixture, actual vanilla formation/ideas, four claims/choice, separate missing-marketplace refusal and native saves | Wrong formation/tree/reward/duration/delta, refusal input or mismatched save/provenance. Natural CN campaigns, other roots/choices/war/time expiry remain open. |

These acceptance reruns establish provenance compatibility for the same bounded
contracts; they add no campaign, balance, AI, multiplayer or export-readiness claim.
Historical ordinary reload scenarios remain separate and are not repeated here.

Exactly deferred to Phase 2C: `tools/mods/<id>/config.json`, mod config readers,
per-mod display names/supported versions, generic deployment configuration changes,
mission-inspector scenario/state-rule configuration migration and general inspector/
browser output isolation. The minimal self-test namespace separation already done
is the authorized provenance fix. Further gameplay, lifecycle redesign, concurrent
EU4 support and publication require their own scope/authorization.
