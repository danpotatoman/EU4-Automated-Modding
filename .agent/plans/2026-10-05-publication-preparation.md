# Public repository preparation

Status: complete
Last updated: 2026-10-05

## Goal and authorization

The user authorized a recursive audit, local hardening, portable configuration,
documentation and validation for a proposed public GitHub snapshot. Preserve active
development and existing uncommitted work. No remote, push or commit is authorized
by this task. Uncertain ownership material is retained locally and excluded.

Continuation authorization: preserve the original Git directory/history locally
and make this same workspace the clean ongoing development repository, rather than
requiring recurring sanitized exports. Initialize new Git metadata without inherited
objects, remotes or commits. Protect future staging/commits with ignore rules and a
staged-content audit hook. The owner chooses the public commit identity before the
first commit; no push is authorized.

## Requirements and non-goals

Preserve production script/localisation bytes, native evidence verdicts and owned
process safety. Audit current candidates, ignored runtime trees and all reachable
Git history. Do not rewrite history or delete evidence. Recommend a license only
after ownership review. This is publication preparation, not mod release certification
or continuation of the active American Century gameplay plan.

## Relevant systems

`AGENTS.md`, `.agent/PLANS.md`, `docs/{PROJECT,STATUS,DESIGN,ROADMAP,DECISIONS,TESTING}.md`,
`PROJECT_STRUCTURE.md`, `.gitignore`, all `tools/`, `docs/testing/` and `mod/`.
Existing native playtests remain in `docs/testing/runtime-mission-claim/README.md`,
`docs/testing/runtime-regression-suite/README.md` and
`docs/testing/american-century/README.md`.

## Progress

- [x] Read request, project/status/testing and active USA plan; inspect Git status.
- [x] Inventory and classify source, dependencies, evidence and history risks.
- [x] Preserve local originals; harden ignore rules, config and evidence publication.
- [x] Create README/setup/hygiene/audit documentation and appropriate offline CI.
- [x] Review functionality/evidence integrity; preserve old Git and initialize clean
  ongoing Git metadata at the same workspace root.
- [x] Run final offline/staged/history/link checks and snapshot clone verification.
- [x] Record actual results, history isolation, limitations and handoff.

## Discoveries

2026-10-05: Git exists; tracked deployment configuration contains a personal Documents
path, and public-candidate evidence contains original machine paths. Current Git
ownership needs a per-command `safe.directory` override in the sandbox. Initial
worktree has modified and untracked source/docs/tools from prior tasks; retain them.
USA report records 51 shared Node tests and 21 actual DLC (18 required plus three).

## Validation

Final offline command: 53 Node tests and four synthetic tool self-tests PASS; deployment
and collector PowerShell tests PASS. Both real Windows adapter tests PASS outside
sandbox after initial restricted CIM failures (kept locally). Fresh source CWTools:
Brittany 0 errors/58 warnings, USA 0/0. Native Brittany `all` nonce
`576ee0373b7914f0` PASS/0, four contracts/one attempt/clean cleanup, 166.12s total,
108.88s native; staged 0 errors/62 warnings. All 20 mod files hash-identical to
pre-task baseline. Post-test process inventory has no game/reporters/dummy harness.
Links and current candidate audit pass. Original Git directory preserved under
`.local/private-history/2026-10-05/original.git`: 159 files hash-verified, history
bundle verified, original Git fsck clean. Fresh root Git has no inherited commits/
objects/remotes; public identity fields intentionally empty and pre-commit hook
configured. Real hook negative control rejects ignored/staged fake credentials
even with harmless worktree bytes; fixture removed. Initial control harness used
the wrong output stream and omitted force on index cleanup; corrected rerun PASS,
original failure logs kept locally. Final reviewed set has 756 files; staged bytes
match the worktree exactly after refreshing five earlier newline-normalized documents.
Durable details in `docs/PUBLICATION.md` and `docs/publication-snapshot.md`.

Unused hardware logs/crash metadata (22 files) excluded from tracking, preserved
locally; public replay tests still pass. CRLF is explicitly recognized by Git while
all raw source/fixture bytes are preserved across checkout. Whole initial-index
whitespace check retains legacy trailing spaces/blank EOF lines; not reported PASS.
The only newly introduced EOF blank in split lifecycle tests was removed.
Both initial and final isolated public review copies passed 53 tests/four self-tests
with a missing game path and no local overrides. Final public links: 432 checked,
zero issues. Worktree/staged/history audits clean; public source contains no binary
game assets, full saves, private config or archived Git objects. Exact staged status
and manifest are in ignored `.local/publication/` for owner review. Ongoing work
continues in this workspace, without recurring exports. Gameplay plan stays active.

## Remaining decisions and playtests

Owner chooses public author identity and whether to apply scoped MIT; no LICENSE
grant, remote, commit or push was created. Hosted Linux/Windows CI remains unrun
until publication. Native UI/USA/recovery extension scenarios remain open at the
linked `docs/PUBLICATION.md` playtest list; this task does not close them.

## Completion criteria

Reviewable candidate snapshot and explicit blockers; no known private paths/secrets
in public candidates, generated/game-owned material excluded, portable offline tests
and setup documented, future hygiene enforced without weakening native contracts.
