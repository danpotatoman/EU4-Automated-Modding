# Publication audit and proposed snapshot

Audit date: 2026-10-05. This task prepares continuing development for public review;
it does not end the project, certify mod releases or authorize publication.
No commit, remote or push has been made. Existing user changes were retained.

Readiness: no known privacy, credential or unintended game-asset redistribution
blocker remains in the reviewed **756-file staged set**. The current workspace is
the clean ongoing repository. Choose a public Git identity and license policy before
the initial commit; publication itself still requires explicit approval.

## Findings and disposition

| Category | Finding / action |
| --- | --- |
| Whole local inventory | Initial recursive scan: 21,844 files, 6,188,153,053 bytes excluding `.git` and audit originals; 14,663 text files scanned, 7,181 binary files inventoried. Most bytes were already ignored runtime profiles/saves/cache/reports |
| Public source | Both project mods, Node/PowerShell implementations, synthetic fixtures and durable docs/plans retained. Production mod bytes preserved |
| Private machine information | 2,565 personal-path matches across 169 initial candidates; tracked deployment config made portable, actual settings preserved in ignored local overrides, public evidence paths redacted to synthetic roots |
| Credentials | No known credential patterns matched in candidate, reachable history or local text scans. Two email matches were in ignored upstream CWTools rule CI configuration; not personal project credentials. Binary content and unknown secret formats remain outside scanner coverage |
| Original history | 72 reachable file blobs scanned; one older deployment-config blob contains a private home path. Preserved the full original Git directory (159 hash-verified files) and a verified complete-history bundle locally; active Git has no inherited commits or objects |
| Copyright uncertainty / unnecessary diagnostics | Game screenshots, bulk engine setup dumps and downloaded game-reference captures remain local and ignored. Complete saves, crash dumps, hardware-diagnostic logs/crash metadata, game-derived CWTools cache, rules and staged vanilla country history are excluded |
| Large/duplicate evidence | Two collector JSON reports above 1 MiB replaced by explicit metadata/count/hash summaries. Original reports retained locally. Duplicate before/after/attempt text needed by evidence tests retained; bulk duplicates stay ignored |
| Paths and dependencies | Central environment/local-override adapter; standard Steam default plus explicit custom-library config; Windows Documents discovery; Node on PATH with optional existing fallback. Examples committed, real overrides ignored |
| Future hygiene | Ignore rules, worktree/staged/history audit, configured pre-commit hook, offline CI, contribution/agent policy and evidence-selection rules added |

Original docs and modified-file backups are under ignored `.local/publication/`;
existing runtime work was not deleted. Public copies retain result status, assertions,
PIDs/nonces/timing and identity relationships. [Redaction manifest](testing/publication-redactions.json)
records original/public hashes; original hashes refer to local originals, not sanitized
copies. Assertions and script-error filters were not weakened. Source/reward hashes
still describe their original source bytes. Screenshot observation claims remain scoped
historical operator evidence; the public snapshot does not contain the visual assets.

Installed vanilla references are read-only, outside the repo. USA staging reads and
adapts installed English history only into an ignored owned test profile. No substantial
vanilla source or game binary was found in the proposed public source. The comment-only
`Breton_Missions.txt` and `USA_Missions.txt` suppress vanilla trees without copying them.
Guides reference relative filenames, identifiers and minimal project adaptations.
Generated native save excerpts are bounded behavioral observations, not full game saves.

Additional ownership screening compared candidates against 8,900 installed loose
text definitions: no nonempty identical files, and no matches of twenty contiguous
significant source lines in production scripts/localisation. This is a useful bounded
screen, not proof of independent authorship or redistribution rights. DLC archives
were not inspected by this comparison.

## Licensing review

Recommend **MIT for confirmed project-owned tooling/mod code and its documentation**:
it is a small permissive standard license that supports reuse with attribution.
[OSI's MIT text](https://opensource.org/license/mit) explains its grant and notice requirement.
No LICENSE was added: confirm authorship/rights and the intended copyright holder before
applying a grant. Do not include EU4/DLC assets, downloaded dependencies, raw game UI
or uncertain excerpts in that grant. Keep runtime observations/provenance separately
identified; license selection alone does not establish rights to captured third-party
material. The owner can approve a scoped MIT notice after reviewing this inventory.

This is an independent project, unaffiliated with Paradox. EU4 and its trademarks/assets
remain their owners' property. Exclusion is a conservative publication choice, not a
claim that every screenshot or factual observation is legally restricted.

## Clean ongoing development repository

The current workspace is now the normal ongoing development repository. Its original
`.git` was moved to ignored `.local/private-history/2026-10-05/original.git` after
creating/verifying `history.bundle` and saving pre-migration refs, status and diff.
All 159 archived Git files match their pre-move SHA-256s; the original index, config,
refs, objects and reflogs are retained. No worktree or ignored runtime files were moved
or discarded. The old repository remains private; do not push or reattach its objects.

Fresh Git metadata at the same root uses branch `main`, has no commits/remotes and
does not inherit the older personal path or commit identity. The reviewed initial
files are staged for review. Local author name/email are intentionally empty so Git
cannot silently reuse a private global identity. Choose your public identity before
the initial commit. No permission to publish follows from this preparation.

The configured `core.hooksPath` is `tools/publication/hooks`. Its pre-commit hook
scans **index bytes**, including force-added ignored artifacts, plus active history.
A negative control staged a fake credential in an ignored fixture, then replaced its
worktree with harmless text: the actual hook rejected it; the fixture was removed
from the index and disk afterward. This protects ordinary ongoing commits, rather
than requiring repeated sanitized exports. New clones should enable the same hook
with the command in [setup](SETUP.md).

`export-snapshot.mjs` remains an optional review/backup utility. Future work, native
profiles and local overrides stay here; develop and commit normally after choosing
the public identity. Before any later push, review the staged/history audits and
explicitly authorize publication. See [next steps](publication-snapshot.md).

Candidate categories are root README/contribution/agent/config/ignore files,
`.github/workflows/`, `.agent/`, `docs/`, `mod/` and reproducible `tools/` source.
The export excludes `.git` from the original, `.local`, real overrides, generated
tool outputs, game captures/bulk dumps, caches, saves, binaries and IDE state.

## Validation and remaining limits

Completed in this environment:

| Check | Result |
| --- | --- |
| Offline regression | Final 53 Node tests PASS plus four synthetic tool self-test programs PASS; adds staged-byte scanner coverage |
| Windows process adapter | Both real dummy-tree/suspension integration tests PASS outside sandbox; initial restricted attempt failed CIM access and remains recorded locally |
| Deployment and collector | PowerShell self-tests PASS; ownership/external-change protection, byte preservation and argument forwarding retained |
| Production CWTools | Brittany: 11 files, 0 errors / 58 warnings; USA: 8 files, 0 errors / 0 warnings; CWTools 0.10.31, EU4 v1.37.5.0 |
| Fresh native Brittany `all` | PASS/exit 0, four contracts, one attempt, 166.12 seconds total / 108.88 native; nonce `576ee0373b7914f0`; clean owned cleanup, no mission-completion claim |
| Staged Brittany CWTools | 13 files, 0 errors / 62 warnings |
| Production integrity | All 20 source-mod files match the pre-task hashes, including USA descriptor |
| Post-run inventory | No EU4/reporter/WER or dummy/runtime Node process remained; native result cleanup empty/clean |
| Publication scan | Worktree and staged candidates: no known secret/private-path/oversize/generated-artifact findings. Fresh active history has no reachable commits or historical findings; old private history is excluded |
| Public-copy reproduction | 53 Node tests and all four tool self-tests PASS in an isolated review copy without local overrides and with the game path deliberately nonexistent; native replays use retained public text |
| Syntax / links | All 44 public JavaScript files parsed; local public links/anchors pass |
| Whitespace | Final full-index diagnostic exit 2: 1,546 formatting findings (1,541 captured-evidence lines, two production lines, three native fixtures). CRLF is explicitly recognized; original evidence/production bytes are preserved rather than reporting this check as PASS |

[Fresh native result](testing/publication-checks/evidence/result.json),
[assertion transcript](testing/publication-checks/evidence/game.log) and
[production CWTools](testing/publication-checks/evidence/cwtools-production.json)
retain reviewed textual proof. Final snapshot/link/whitespace review and export checks
are recorded in [snapshot review](publication-snapshot.md).

The newly added GitHub workflow has not run on GitHub; only its constituent local
commands have been exercised. Linux CI portability is proposed and must be confirmed
by the first hosted run. Rule installation/network download was not rerun because
the existing rule snapshot was present; the installer was statically reviewed.
Faithful UI and USA native contracts were not repeated: no production/UI logic changed;
current publication validation adds a fresh shared Brittany suite only.
Existing scoped native reports remain linked from [STATUS](STATUS.md) and
[TESTING](TESTING.md). This publication work must not be mistaken for a fresh UI,
whole-campaign or release certification.

## Playtest list

Production files were not changed. Configuration affects validation, deployment,
reference lookup and the shared runner, so verify source/staged loading and a clean
native suite. Existing scenarios provide required starting states, steps, expected
behavior, evidence and failure signs:

- [Brittany suite](testing/runtime-regression-suite/README.md#playtest-list): fresh
  independent BRI, recorded DLC, only isolated mod; `-Test all` checks four contracts.
- [Nantes bounded input](testing/runtime-mission-claim/README.md#playtest-list): known
  1280×720/scale-1/top-scroll window, active external driver, real claim and fresh refusal.
- [USA slice](testing/american-century/README.md#playtest-list): deterministic English
  formation, four real claims, exact save/reward and ordinary reload checks.
- [Owned recovery](testing/runtime-recovery/README.md#playtest-list-and-coverage-limits): identity/refusal,
  controlled crash/freeze, cleanup and fresh attempts; unusual dialogs remain open.

Public-preparation checks do not close these remaining gameplay boundaries.
