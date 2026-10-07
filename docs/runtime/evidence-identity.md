# Generated evidence identity and applicability

Owner: repository/framework tooling
Schema: 2; introduced 2026-10-06 in Phase 2B

New JSON results use the shared vocabulary in
[evidence-identity.mjs](../../tools/evidence-identity.mjs). Existing reports and
namespaces remain in place. Metadata describes evidence; it grants no process
cleanup authority and does not add gameplay coverage.

| Field | Meaning / requirement |
| --- | --- |
| `schemaVersion` | New full records: 2. Checks previously used 1; other historical formats had no version. Unknown versions are refused. |
| `sourceMod` | Explicit source-folder owner, or null when unknown/synthetic/untracked. It is never obtained from an arbitrary namespace or scenario. |
| `storageNamespace` | Report key/collector namespace. `brittany_runtime`, `american_runtime`, `brittany_nantes_manual` and synthetic aliases remain valid. |
| `artifactKind` | `production`, `staged`, `fixture`, `synthetic`, `untracked`, `baseline`. A source reference alone never makes an artifact production. |
| `contractId`, `suiteId`, `selectedMembers`, `claimMode` | Selected runtime contract and exact suite members/mode. Optional for other tools. `all` still means four Brittany members. |
| `coveredLayers`, `requestedLayers`, `declaredLayers` | Exercised layers versus planned runner layers or caller-declared collector layers. Collector exercised gameplay layers are empty. |
| `sourceBuild`, `stagedBuild`, `artifactBuild` | Relevant path/content identity; optional when evidence cannot establish it. Canonical path, algorithm, aggregate SHA-256 and full relative file manifest. |
| `projectPath`, `projectIdentity` | CWTools canonical real path and optional caller-supplied identity. Full path still distinguishes equal basenames. |
| `runId`, `attemptId` | Invocation ID and distinct native attempt ID (`runId/number`). Collector's own `id` remains its capture ID and may differ from supplied native `runId`. |
| `intendedEnvironment`, `actualEnvironment` | Prepared/required environment versus independently observed facts with sources. Omitted actual fields mean unknown, never implied activation. |
| `startedAtUtc`, `finishedAtUtc`, `timestamp` | Invocation start/completion; runtime timestamp is last record update. Running/starting records have no completed verdict. |
| `status`, `verdict`, `verdictSource`, `evidenceSource` | Tool state, scoped outcome and its authority. Sources include static, native, preparation, operator, deployment and replay. |
| `lifecycleOutcome`, `behavioralVerdict` | Operational reason/cleanup separately from the attempt's behavioral verdict before cleanup. Clean cleanup cannot establish gameplay PASS. |

Full new records require version, owner (including explicit null), namespace,
kind, evidence source and covered layers. Completed applicability also requires
valid start/completion times and a completed status. Contract, builds, actual
environment and attempt fields are required only when their producer can establish
them. Small active/latest/baseline pointers identify referenced records; they are
not standalone verdicts. The baseline pointer's `referenceSchemaVersion` preserves
whether its selected capture was historical.

The manifest algorithm is `sha256-path-manifest-v1`: recursively hash file bytes,
normalize relative separators to `/`, sort paths by ordinal comparison, then SHA-256
the UTF-8 JSON array of `{path,sha256}`. No timestamps participate. Symlink/junction
roots or entries are refused. Descriptor bytes participate without changing their
semantics. A build path identifies an artifact; the digest identifies its bytes.

Canonical production validation inspects `mod/<source-id>`. Native copies with
test hooks/fixtures are `fixture`; unchanged staged copies are `staged`. Deployment
records describe a staged copy with generated descriptor, not launcher activation.
Collector deployed captures default to staged, explicit production `-Mod` can
declare the source owner, and `-Untracked` defaults to null owner/untracked kind.
An explicit owner on a fixture is its source reference, not production coverage.

Layers retain `STATIC`, `LOGIC`, `EFFECT`, `WIRING`, `END-TO-END`. Existing registry
detail also uses `INPUT`, `SAVE`, `CALIBRATION`, `DIAGNOSTIC`. Cleanup is separate.
Runtime `coveredLayers` records evaluated layers; `requestedLayers` lists intended
ones when preparation or infrastructure fails. A successful click contract may
record bounded END-TO-END; refusal retains input/save layers, and suite/effect,
preparation/static/operator/replay evidence cannot gain END-TO-END by implication.

## Freshness, conflict and legacy rules

Consumers prefer explicit schema 2. `assertApplicable` rejects conflicting owner,
namespace, artifact kind, contract/run/attempt, evidence source, project path,
requested build algorithm/hash/path, layers and unsupported schema. Existing
`mod`, selection owner and test aliases must agree with explicit fields. Running,
starting, preparation/incomplete records and INCOMPLETE verdicts cannot satisfy
completed applicability. Both start and finish must be at/after the current
invocation's `notBefore`, with finish at/after start. Age alone is not a verdict:
reuse requires the consumer's requested build/path/scope and freshness boundary.
Replay can preserve a historical verdict but cannot satisfy a native-source request.

CWTools retains production/staged basename report locations and cache layout.
Optional `-SourceMod`, `-ReportKey`, `-ArtifactKind`, `-ProjectIdentity` supply owner,
storage and scope for arbitrary projects. Arbitrary `-Project` defaults to null
owner/untracked kind; basename is storage compatibility only. Equal basenames
still overwrite the same latest slot without an explicit separate report key;
full path/build/start/completion guards prevent accepting that other project.
Canonical production owner/kind contradictions fail clearly. Source changes during
validation fail; runner, checker and deployment check fresh full identity before reuse.

Finite legacy compatibility is resolution in memory, not rewriting history:

- Legacy CWTools may resolve its exact canonical production path to the two known
  owners. It lacks aggregate build/start identity and cannot satisfy the new
  invocation/build guard; revalidate before current acceptance.
- Legacy collector namespaces are limited to the two source IDs, `brittany_runtime`,
  `american_runtime`, `brittany_nantes_manual`. Resolution additionally requires a
  canonical deployment source and independently matching deployed bytes. Runtime
  aliases resolve as fixture, source namespaces as staged. Human scenario text is ignored.
- Historical runtime replay tests read their existing protocol/build/scenario
  evidence directly and retain original PASS/FAIL/PARTIAL/INCOMPLETE assertions.
  They do not become schema 2 records or fresh native evidence.
- Legacy deployment records remain readable through existing destination/file/hash
  checks. Unknown versions and explicit new owner/namespace/artifact contradictions
  fail in redeployment and combined-check preparation.
  Externally modified destinations remain protected.
- Checks schema 1 remains readable as a findings baseline; it supplies no new
  identity proof. New current CWTools/inspector acceptance requires schema 2.

Ambiguous legacy records cannot establish source ownership or close gameplay
coverage. Even a matching new collector build remains operator evidence with
activation/gameplay unverified. No historical verdict is reinterpreted.

## Runtime environment and retention

Native records distinguish installed launcher metadata and prepared profile intent
from `game.log` running version and nonce-scoped observed required DLC assertions.
When available, native save `savegame_versions`, `dlc_enabled`,
`mods_enabled_names` supply actual saved version, all activated DLC and mod display
names with save path/hash. `enabledModFiles` contains saved `filename` fields;
`enabledModNames` contains only saved `name` fields, never substrings of filename.
The [saved environment parser](../../tools/runtime-tests/environment-identity.mjs)
does not assign source ownership. Missing/duplicate/conflicting filename entries
leave `activationIdentityStatus=unknown` with issues. Consumers requesting
`requireActualActivation` refuse that ambiguity. Display names alone do not prove source path. Missing
save/extra-DLC evidence stays unknown. Preparation and collector logs manufacture
no actual environment.

The runner keeps each attempt in the existing `attempts/<number>/result.json`,
initially starting/running INCOMPLETE, then final with its run/attempt identity,
behavioral evidence and cleanup outcome. The aggregate keeps all attempt snapshots,
including failed/incomplete attempts before a retry PASS. Retry scheduling is
written back after existing policy evaluation. No lock, profile layout, timeout,
retry condition, protocol or cleanup authority changes.

The inspector self-test alone uses `reports/self-test-brittany/` with fixture
identity to protect production latest metadata. Phase 2C completes
[browser fixture isolation and configuration ownership](configuration-ownership.md)
without changing this evidence schema. Raw records/manifests, saves and original failures stay ignored; public
handoffs summarize reviewed evidence and do not copy game assets or private paths.
