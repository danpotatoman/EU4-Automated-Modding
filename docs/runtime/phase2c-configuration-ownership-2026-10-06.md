# Phase 2C configuration ownership and QA isolation handoff

Owner: repository/framework configuration and tooling
Date: 2026-10-06
Scope: authorized mod metadata/readers, legacy compatibility and tool-output isolation
Current state: [framework status](../STATUS.md),
[configuration model](configuration-ownership.md),
[governing plan](../../.agent/plans/2026-10-06-project-state-ownership.md)

Phase 2C implementation and acceptance are complete. Both mods now own development
and inspector configuration independently. Node/PowerShell resolve equivalent
metadata and descriptor bytes. Source-backed self-tests/browser QA have explicit
fixture output and do not use production reports as input. Phase 2A contracts and
Phase 2B evidence semantics remain intact. No gameplay, ordinary deployment,
historical evidence, local user override, commit or push was changed. Work stops
after this handoff; remaining work is not automatically authorized.

## Exact implementation inventory

Paths below are repository-relative. Existing Phase 1/2A/2B worktree edits were
the compatibility baseline; comparison used the Phase 2C snapshot rather than HEAD.

| Operation | Paths |
| --- | --- |
| Create canonical metadata | `tools/mods/brittany_missions/config.json`, `tools/mods/american_century/config.json` |
| Create readers/tests | `tools/mod-config.mjs`, `tools/mod-config.ps1`, `tools/mod-config.test.mjs` |
| Create isolated browser input helper | `tools/mission-inspector/browser-fixture.mjs` |
| Edit machine readers/defaults | `tools/config.mjs`, `tools/config.ps1`, `tools/deployment/config.json`, `tools/deployment/config.example.json` |
| Migrate consumers | `tools/deploy-mod.ps1`, `tools/checks/check.mjs`, `tools/mission-inspector/generate.mjs` |
| Isolate/protect QA | `tools/mission-inspector/browser-test.mjs`, `tools/mission-inspector/self-test.mjs` |
| Discover new test suite | `tools/test-offline.mjs` |
| Remove former canonical owner data | `tools/mission-inspector/scenarios.json`, `tools/mission-inspector/state-rules.json`; exact values moved into the two mod configs |
| Create current guides/handoff | `tools/mods/README.md`, `docs/runtime/configuration-ownership.md`, this handoff |
| Update current documentation | Root `README.md`; `docs/{PROJECT,DESIGN,STATUS,ROADMAP,TESTING,SETUP}.md`; `docs/runtime/{README,evidence-identity}.md`; `tools/{deployment,checks,mission-inspector}/README.md`; both `docs/mods/<id>/PROJECT.md` and `testing/README.md`; `.agent/PLANS.md` and governing ownership plan |

Native runner/wrappers, contracts/adapters/manual preparation, shared AST/geometry/
save/protocol helpers, lifecycle/input, collector and CWTools implementations were
not edited. The shared config reader refactor preserves every machine field used
by those consumers. Prior handoffs remain byte-identical; the current evidence
guide only links completed config/QA ownership, without changing schema meaning.

## Final ownership, schema and compatibility

Configuration schema **1** is distinct from unchanged evidence schema **2**.
Canonical `tools/mods/<id>/config.json` owns `sourceMod` (exact folder ID),
`developmentDisplayName`, `supportedVersion`, and `missionInspector` containing
scenarios/exclusion groups. Owner/name/version/scenario/rule shapes are validated;
wrong owner, malformed values and unsupported schema fail clearly. The
[configuration model](configuration-ownership.md) gives the full example and API.

Shared CWTools configuration retains game/extension/rules/tool settings. Shared
deployment configuration now contains only destination discovery (`gameModDirectory`).
Environment > ignored local > committed machine defaults remains unchanged;
deployment's explicit destination override remains highest. No new metadata
environment variables, per-mod machine paths, caches or operational state were added.

| Owner | Effective development descriptor metadata | Inspector configuration |
| --- | --- | --- |
| Brittany | `Brittany Missions (Development)`, `1.37.*` | Four unchanged initial/French/autonomous/diagnostic scenarios; one mutually exclusive flag pair |
| American Century | `american_century (Development)`, `1.37.*` | Three unchanged USA/ENG/C00 predicate-review scenarios; empty exclusion list |
| Unknown source without metadata | `<id> (Development)`, generic `1.37.*`; `registered=false`, source owner null and scoped notice | Unknown-country scenario with null flags; no rules |

The American Century name deliberately preserves its previous fallback. Descriptor
version remains metadata, not broader game compatibility. Exact Node descriptor/
launcher strings for both mods and generic fallback match the captured pre-task
effective strings. Actual PowerShell copies in synthetic workspaces also match
Node preparation bytes after changing owner-specific metadata; this proves both
consumers read the canonical source rather than hardcoded defaults.

Legacy ignored overrides are not rewritten or copied into public metadata:

- Exact `displayName` applies only to Brittany; other owners get an ignored-field
  notice and their own name. It cannot leak into American Century or future mods.
- Exact `supportedVersion` retains its prior generic override scope across all
  selected mods, including future/unknown sources, with a scoped deprecation notice.
- Noncanonical legacy capitalization had different old Node/PowerShell behavior.
  Both metadata readers now ignore that ambiguous spelling with a scoped notice;
  machine output omits it. Canonical JSON spelling is required. Invalid effective
  legacy values fail. Raw local files remain unchanged.

Effective descriptor precedence is legacy local compatibility override > per-mod
metadata > labelled generic fallback. One committed writable source owns each
setting; deleted shared inspector files and removed descriptor defaults no longer
compete. Existing local legacy fields are an explicit deprecated compatibility
exception, not a second committed canonical source. Node/PowerShell parity covers
defaults, actual local config, scoped overrides, generic version, environment path
precedence, unknown source, malformed fields and notices.

A future mod can add its own config without a native runtime contract. Generic
inspection/deployment still works without metadata, with no Brittany borrowing.
An invalid existing metadata file does not silently fall back. Arbitrary CWTools
projects retain their existing owner/path/report-key behavior. Metadata registration
does not change Phase 2B's finite evidence-owner recognition or register native
contracts; future evidence can remain untracked/unknown until explicitly scoped.

Native runtime/manual labels and aliases remain intrinsic contract bindings in
their owner adapters, not configuration inherited through shared defaults. Their
code is unchanged and tests verify it agrees with selected owners. Development
metadata cannot change native fixture labels, aliases, supported-version template,
contract registry/routing, `all`, retries, input or activation.

## Inspector and output isolation

The former shared scenario/rule JSON values were moved exactly into their owners'
`missionInspector` blocks. Current generated scenario results, findings and counts
match the pre-task production reports for both mods, not merely array lengths.
No predicate-language, layout, gameplay or diagnostic-verdict expansion occurred.
Normal production report paths remain `reports/<source-id>/`.

Phase 2B's dedicated self-test fixture output `reports/self-test-brittany/` remains.
The self-test checks production latest/text/HTML bytes before and after. Browser QA
always regenerates input under a unique ignored
`test-work/browser-<id>/reports/browser-brittany/`, with schema-2 fixture/STATIC
identity, then uses its own headless profile/rendered DOM/screenshot. It never reads
production latest/HTML or stale self-test output as its fixture. The generator's
optional synthetic root/output parameters do not alter normal CLI selection.

All **15 captured production report pointers/baselines** were byte-identical after
offline/tool/browser testing and before deliberate source checks. Ordinary checks
then intentionally refreshed eight JSON records in production CWTools/check/inspector
namespaces, including last-complete baselines. Those updates are fresh source
validation, not QA posing as validation. Collector production pointers are unchanged.

## Validation and retained failures

Original output is local in `.local/project-state-phase2c/` and existing ignored
tool fixtures. No raw game captures, screenshots or machine paths are published.

| Check | Result |
| --- | --- |
| Final offline aggregate | **89/89 Node tests + four tool self-tests PASS**, no skips on this Windows environment. Eleven new metadata/parity/descriptor/isolation tests; all prior registry/replay/schema assertions retained. Two parity tests explicitly skip when PowerShell is unavailable elsewhere. |
| Node/PowerShell parity | PASS for canonical/effective metadata, notices, malformed cases, actual legacy config and machine environment precedence; exact UTF-8 descriptor and launcher bytes match. Actual synthetic deployments cover both owners plus unknown future source without contracts. |
| Windows process adapter | **2/2 PASS** with normal CIM access; owned dummy processes and unrelated-tree preservation only. |
| Deployment self-test | PASS: preview no writes, strict unowned/modified destination refusal, descriptors/encoding, repeat/legacy records, owner/artifact conflicts and unrelated sentinel preserved. Normal Brittany destination untouched. |
| Collector PowerShell wrapper | PASS begin/finish forwarding and reports; Node collector regression also included in aggregate. |
| Installed CWTools self-test | PASS: valid fixture zero errors, deliberately invalid fixture three errors/exit 1, empty fixture failure/exit 2; fixture report namespaces remain separate. |
| Inspector/check self-tests | PASS in aggregate, including fresh owner scenario configuration and explicit production-output protection. |
| Headless browser QA | PASS with normal access: scenario switching, overlap/finding selection, details, search, zoom and diagnostic warning. Initial restricted run failed before rendering with GPU/process access errors and exit `2147483651`; retained unchanged. No assertions weakened. |
| Both source CWTools validations | Complete/0: Brittany 11 files, 0 errors/58 warnings; USA 8 files, 0 errors/0 warnings. Executed by the ordinary combined-check wrappers. |
| Combined source checks | USA PASS/0; Brittany completed FAILED/1 solely for existing `modified-destination`. Inspector 0 errors with unchanged six/two warnings; file checks 0 errors. Both finding comparisons show no new findings. |
| Static identity/scenario acceptance | Both owners' current CWTools/check/inspector schema-2 records meet fresh path/build/owner/artifact/layer guards; all inspector scenario results match pre-task output. |
| Links/publication/whitespace | PASS: 770 local links/0 issues, 812 publication candidates/0 findings, tracked diffs and all nine new files pass whitespace review; repository scanner limits remain. |

An initial focused test run had nine passes and one failure because its new assertion
expected `Unsupported` where the unchanged registry actually says `Unknown runtime
owner: future_mod`. The expectation was corrected to that precise refusal; the
original failure output is retained. Production behavior/assertions were not weakened.
Earlier Phase 2B restricted-CIM failure and both Nantes INCOMPLETE records remain
unchanged with their original evidence and verdicts.

## Native validation decision and protected state

**No new EU4/native runs were performed or claimed.** This scope is sufficient
because every native runner/contract/fixture/launcher-selection/input/lifecycle
source byte remains unchanged. Runtime preparation does not consume development
metadata; its shared machine dependency resolves the same ordinary profile path.
Selected owners/fixture labels/aliases and schema-2 fixture identity remain correct
in regression tests. Existing Brittany/USA staged descriptor bytes exactly match
the unchanged generator/registry template and their recorded manifest hashes.
Development descriptor bytes and actual PowerShell/Node outputs are independently
compatible. No preparation-only output is promoted to native PASS.

The pre-edit snapshot contains **2,139 distinct normalized paths** and 805 public
candidate originals, captured before implementation. Final allowlisted comparison
found no unexpected change. Unchanged captured groups include:

- 20 production files and 618 unignored historical/public evidence files, including
  Phase 1 provenance;
- both Phase 2A/2B handoffs; 180 native code/fixture/result/action records;
- both evidence identity/bridge sources; both actual ignored local overrides;
- all 306 pre-existing deployment-state files; 857 prior Phase 2B local evidence/
  original files; eight selected external ordinary-profile/deployment/installed references.

An additional comparison against the retained **older Phase 2B baseline** verifies
all 738 historical evidence paths, including excluded local history logs. This
supplement is explicitly an older anchored comparison, not a newly captured Phase
2C pre-task hash. Native raw profiles/saves and entire installed/cache trees are
outside the enumerated snapshot claim and were not launched or rewritten. Unlike
Phase 2B, both ignored config overrides have an actual Phase 2C pre-task capture;
their final bytes match it. The earlier Phase 2B capture limitation remains history.

The changed source/config/docs are the authorized inventory above; generated fixture
records and deliberate fresh production check records are separately allowlisted.
Existing destination hierarchy/hash protections, descriptor semantics, source/deployed
manifest algorithm and evidence schema remain unchanged. Source release descriptors
are not certified by this tooling refactor.
Final read-only inspection found no remaining processes for either launched Phase
2C headless browser profile and no active native lifecycle lock.

## Playtest list and remaining architecture debt

Gameplay files/coverage are unchanged. Existing [Brittany runbook](../mods/brittany_missions/testing/README.md#playtest-list)
and [USA runbook](../mods/american_century/testing/README.md#playtest-list) retain their
starting conditions, actions, expectations and failure signs for open gameplay.

| Affected interface | Reproduction / expected evidence | Failure signs / open boundary |
| --- | --- | --- |
| Owner config/readers and development descriptors | Run `node tools/test-offline.mjs`; select each owner with machine/default/legacy metadata in isolated fixtures; exact Node/PowerShell descriptor parity and independent owner values | Wrong owner/name/version, Brittany leakage, silently guessed legacy spelling or ordinary destination writes |
| Inspector config/self-test/browser | Run inspector self-test and optional browser QA; fresh unique fixture input, unchanged branch/scenario counts, production pointers unchanged | Reused production latest, wrong scenario/rule, fixture labelled production/native or changed ordinary baseline |
| Native contracts/descriptors | Existing bounded Phase 2A/2B evidence remains; a later preparation/activation change needs representative native contracts for affected owners | Changed aliases/fixture bytes/owner identity or preparation promoted to native PASS; no fresh game behavior is claimed here |

Remaining debt is explicit: deprecated local metadata compatibility needs a separately
authorized user-override migration; arbitrary CWTools equal-basename fallback can
still share latest slots without explicit keys; evidence-owner/native registry
extensions for future mods require explicit scope; native GUI/version/DLC/save
limits and open gameplay scenarios remain. The known Brittany descriptor/destination
mismatch stays failed and protected until separately authorized reconciliation.
No further architecture phase, gameplay expansion, deployment reconciliation or
publication begins automatically.
