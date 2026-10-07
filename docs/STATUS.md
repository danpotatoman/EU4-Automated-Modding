# Framework/tooling state

Owner: repository/framework
Last updated: 2026-10-07 (Brittany deployment repair)

Root state describes shared tools and repository work. Independent gameplay state
belongs to [Brittany](mods/brittany_missions/STATUS.md) and
[American Century](mods/american_century/STATUS.md). Historical reports retain
their recorded verdicts/builds in the [evidence index](testing/README.md).

## Current capabilities and evidence limits

| Framework capability | Retained evidence / workload | Practical limit |
| --- | --- | --- |
| Static validation | CWTools 0.10.31, EU4 1.37.5.0; saved-file completeness, source/staged checks, versions/rules fingerprint | Static acceptance is not gameplay; warnings/failed/running reports remain visible |
| Project checks/inspection/deployment | Per-mod reports, last-complete finding baseline, hashes/descriptor ownership, byte-preserving source copies | Inspector supports a narrow predicate subset; descriptor preparation/copy is not activation or release proof |
| Offline regression / CI | 2026-10-06: 89 Node tests plus four tool self-tests PASS; two real Windows adapter tests separately PASS with normal CIM access | Includes owner metadata/parity, mod-specific protocols/source-backed checks and evidence replays; two parity tests skip without PowerShell; CI launches neither EU4 nor installed CWTools |
| Native isolation and supervision | Hashed staging, isolated userdir, bounded attempts, global lifecycle lock, owned process identity; no ordinary/vanilla writes | Windows Steam/graphics/interactive desktop required; not headless, unrelated sessions refused |
| Runtime ownership/selection | Phase 2A registry, Brittany/USA adapters, four shared helpers, explicit -Mod/non-mutating -ListTests, legacy routing/import wrappers | Preserved Phase 2A behavior. [Fresh refactor validation](runtime/phase2a-ownership-2026-10-06.md) |
| Evidence identity / reuse | Phase 2B [schema 2](runtime/evidence-identity.md), explicit source/storage/artifact/build/run/attempt/layer identity; [completed acceptance](runtime/phase2b-evidence-identity-2026-10-06.md) | Six required native runs completed; two earlier Nantes INCOMPLETE attempts preserved; ambiguous legacy/operator results cannot close gameplay coverage |
| Configuration ownership / QA | Phase 2C [canonical owner metadata](runtime/configuration-ownership.md), Node/PowerShell descriptor parity and fresh isolated browser/self-test fixtures; [handoff](runtime/phase2c-configuration-ownership-2026-10-06.md) | Existing local overrides remain unchanged with scoped compatibility notices; metadata never registers native contracts or certifies activation |
| Crash/exit/freeze recovery | 2026-10-03 [recovery evidence](testing/runtime-recovery/README.md), workload Brittany four-case regression; controlled exit, crash reporter and after-BEGIN suspension recovered before fresh retry | Unusual unidentifiable dialogs/denied cleanup/locked desktop require further evidence; assertion or integrity failures do not retry |
| Faithful input/save oracle | 2026-10-03 Nantes and 2026-10-04 USA fixture workload demonstrate real button actions, scoped native save checks, refusal; current shared input geometry is derived | Active historical Codex Windows adapter required; bounded 1280x720/scale-1/top-scroll conditions, no standalone/scheduled GUI service or arbitrary mission coverage |
| Engine calibration | BRI run-file effects and Nantes console/UI/save comparisons; USA paused ordinary reload demonstrates startup replay risk and fixture guard | Commands recording completion can omit rewards; false ID/completion queries, narrow save/provenance patterns and helper branches remain unresolved |

Native evidence targets **1.37.5.0 Inca (491d)**. `1.37.*` is metadata, not broader
compatibility. Shared preference requires 18 DLC; actual USA evidence activated 21,
so exactly-18-only/minimal-DLC support is unverified. Read [runtime knowledge](runtime/README.md)
for mechanisms/dependencies without needing a mod's gameplay design.

## Current command ownership

The separately authorized [Brittany deployment repair](runtime/brittany-deployment-repair-2026-10-07.md)
restored a single missing launcher final LF, then used the unchanged strict validated
deployer to refresh old owned content from canonical source. Brittany combined check
now PASS/0: CWTools 0 errors/58 warnings, inspector 0 errors/6 warnings, file and
deployment checks clean. Deployment self-test and 89 offline tests/four tool
self-tests PASS. Repair refuses any broader modification and leaves ownership
unchanged during restoration; normal deployment writes fresh schema-2 UNVERIFIED
ownership. Phase 2A/2B/2C architecture, production and retained native evidence are
unchanged. No fresh native gameplay result or release readiness is claimed. Earlier
Phase 2B/2C failed deployment results below remain dated historical evidence.

The native wrapper supports explicit `-Mod` ownership and non-launching,
non-mutating `-ListTests`. Unsupported selections fail before game configuration
or preparation. Legacy omitted-Mod `usa-slice` selects American Century;
all other current tests/default `preview-gate` select Brittany, with a scoped notice.
`-Test all` means four Brittany LOGIC/EFFECT/WIRING regressions only. It does not
test all mods or ordinary claims. Named Nantes and USA input/save contracts are
separate supervised scenarios. Static/deployment/collector tools accept their
documented `-Mod`, usually defaulting to Brittany. [Testing](TESTING.md) gives the
current command matrix, exit semantics and regression requirements.

## Repository and Phase 1 state

2026-10-05 publication preparation records clean active Git metadata, ignored private
original history, reviewed/redacted public evidence, portable shared defaults/local
overrides, publication hook and zero known scanner findings within its limits.
Its [dated validation](PUBLICATION.md) is retained; license/public identity remain
owner decisions, with no commit/remote/push authorized by this work.

Phase 1 establishes framework, shared-runtime, mod and task documentation ownership.
Production/historical evidence are protected by [migration provenance](testing/project-state-migration.json).
That phase changed no tool behavior. Separately authorized Phase 2A adds runtime
registry/adapters/shared helpers and compatible explicit CLI selection, retaining
one runner/global lock, protocol/oracle meanings and existing namespaces. Phase 2A
recorded minimal selection owner/member metadata; Phase 2B adds explicit provenance. The
[Phase 2A handoff](runtime/phase2a-ownership-2026-10-06.md) records exact inventory,
fresh validation and protected integrity. [Remaining config/report coupling](ROADMAP.md#deferred-ownership-refactor)
is addressed by authorized Phase 2C; remaining follow-up does not start automatically.

Phase 2A refactor acceptance: Brittany all PASS (four cases), expected staged control
FAIL pattern retained, Nantes click/refusal PASS and independent USA click/refusal
PASS; all source/staged CWTools checks completed without errors. All six native
runs cleaned their owned processes without retries. No required native check is
pending; all four UI saves activated 21 DLC, including the required 18. Ordinary
reload and broader mod scenarios remain separate coverage. Production/historical
evidence and the 905-file protected baseline remain byte-identical.

Phase 2B provenance acceptance: fresh Brittany all PASS, expected staged negative
control FAIL pattern, Nantes click/refusal PASS and USA click/refusal PASS. All
source/fixture CWTools checks have zero errors. Each of the six completed runs
has one attempt, no retry and clean cleanup; the two earlier Nantes INCOMPLETE
records retain their original evidence. Native UI saves establish 21 DLC and only
the isolated runtime mod filename, separately from display names and source owner.
The final combined USA check passed; Brittany completed with its known strict
modified-destination failure, leaving the ordinary deployment unchanged.
All captured protected groups match the pre-task baseline. The 1,713 hash records
represent 1,075 distinct paths; two ignored local overrides were omitted, limiting
pre-task byte-equality claims. Exact results and limits are in the
[Phase 2B handoff](runtime/phase2b-evidence-identity-2026-10-06.md).

Phase 2C acceptance: both owner configs retain the previous development descriptor
bytes/version and inspector scenarios/rules. Browser QA passed with normal access;
its restricted-access failure is retained. Production pointers/baselines stayed
unchanged during tests; deliberate source checks updated normal reports afterward.
USA combined check PASS; Brittany retains only the known modified-destination FAIL.
CWTools remains zero errors, Brittany 58 warnings/USA zero; inspector warnings stay
six/two. No new EU4 runs were warranted: native preparation/selection/descriptors,
contract/identity/lifecycle/input code and retained native records are byte-identical,
and the shared ordinary-profile path is equivalent. No fresh native PASS is claimed.
The 2,139-path pre-task comparison includes both ignored overrides and selected
external references; protected groups remain unchanged within its documented scope.
No normal deployment, historical evidence, prior handoff, commit or push changed.

## Historical status navigation

Old reports linking this root path now reach framework state. Their Brittany/USA
gameplay observations remain in the respective current status and unchanged dated
reports. The former root gameplay headings are retained as compatibility anchors:

<a id="current-state"></a>
<a id="implemented"></a>
<a id="verified-with-bounded-scope"></a>
<a id="partially-verified"></a>
<a id="known-findings-and-unresolved-behavior"></a>
<a id="testing-infrastructure-and-evidence-conflicts"></a>
<a id="native-lifecycle-recovery-2026-10-03"></a>
<a id="real-after-begin-freeze-follow-up-2026-10-03"></a>
<a id="faithful-mission-automation-2026-10-03"></a>
