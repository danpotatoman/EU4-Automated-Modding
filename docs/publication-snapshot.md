# Proposed public snapshot review

This captures publication preparation on 2026-10-05, including existing uncommitted
development. Original Git metadata/history remains in ignored private local storage.
Fresh Git at this same workspace root is the ongoing development repository, with
no inherited objects. No commit, remote or push was made.
See [audit/validation](PUBLICATION.md) and [hygiene](REPOSITORY_HYGIENE.md).

## Proposed structure

```text
README.md                 Public entry point
CONTRIBUTING.md           Continuing development workflow
AGENTS.md                 Codex integrity/public hygiene
.agent/                   Active and historical execution plans
.github/workflows/        Game-independent CI
.editorconfig, .gitignore
mod/
  brittany_missions/      Eleven unchanged production files
  american_century/       Nine unchanged files including descriptor
tools/
  config.*                Portable adapters and tests
  test-offline.mjs
  publication/            Audit, redaction, link checks and review export
  cwtools/, deployment/, checks/, mission-inspector/
  test-runs/, vanilla-reference/, runtime-tests/
docs/
  PROJECT, DESIGN, STATUS, ROADMAP, DECISIONS, TESTING
  SETUP, PUBLICATION, REPOSITORY_HYGIENE
  modding/, usa/, testing/ Reviewed guides/scenarios/textual evidence
```

Excluded: original `.git`, `.local`, actual `*.local.json`, caches/downloaded rules,
tool work/test-work/reports/deployment state, IDE state, native saves/crash dumps,
game screenshots, bulk setup dumps, generated operator launchers and captured vanilla
examples. All are preserved locally. Existing repeated textual inputs remain where
independent runs/negative controls/replay tests rely on them. No LICENSE is included
pending owner review of the proposed scoped MIT grant.

## What would be committed

The candidate inventory is tracked files plus unignored untracked files, excluding
worktree deletions. It includes prior authorized source/test changes already present
at the start; this task did not modify production bytes. The fresh export's adjacent
manifest lists each proposed file, byte count and SHA-256. No ignored runtime material
or inherited Git objects are copied. Reviewed current content is staged in the fresh active repository;
the original index/status/diff remain in the private archive.

## Final review

The proposed initial set contains **756 files**, about 9.9 MB, with no individual
candidate over 1 MiB. Every file is staged as an addition; no commits or remotes exist.
Worktree and staged scans are clean. The active history is empty; the older private
path/identity exists only in the ignored archive, not the proposed public Git objects.
All production source bytes and all 176 recorded redaction hashes were verified
(including sanitized copies subsequently excluded from public tracking).
The reviewed native Brittany result completed successfully before interruption;
it was inspected rather than unnecessarily rerun. See [validation](PUBLICATION.md).

The final isolated copy also passed all 53 offline tests/four self-tests with a
deliberately missing game path and no local overrides. All 432 public local links/
anchors pass. Exact index bytes match worktree bytes; original source/evidence
newlines/encodings survive Git staging/checkout. Full initial-index whitespace
diagnostics still flag preserved native evidence and legacy source formatting;
that check is not reported as a pass.

Material changes: root README/contribution/setup/publication/hygiene docs; agent/plan
policy; ignore/byte-preservation attributes; shared config adapters/examples and their
consumers; offline runner/CI; synthetic GUI geometry fixture; split Windows adapter
tests; staged audit/commit hook; reviewed evidence copies/summary/hash manifest.
Production mods were not changed. Existing USA/Brittany source and active USA plans
remain present; original pre-task Git status/diff are preserved privately.

The full exact staged status and filename/byte/SHA-256 manifest are retained locally
at `.local/publication/final-status.txt` and `.local/publication/final-manifest.json`.
These are review artifacts, not another development repository. Every proposed file
is staged as an addition because this is a new initial history; original modified/
untracked status remains in `.local/private-history/2026-10-05/`.

## Next steps for publication (not executed)

Choose the public Git author identity and settle whether to add the proposed scoped
MIT license before the first commit. Configure this repository, not global identity:

```shell
git config --local user.name "YOUR_PUBLIC_NAME"
git config --local user.email "YOUR_GITHUB_NOREPLY_ADDRESS"
git diff --cached --stat
node tools/publication/audit.mjs --staged --history
git commit -m "Initial public modding and verification research source"
```

After explicit publication approval, create an empty public repository on GitHub
without generating a README/license/gitignore there. Authenticate normally, then:

```shell
git remote add origin https://github.com/OWNER/REPOSITORY.git
git remote -v
git push -u origin main
```

These follow [GitHub's local-repository import instructions](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).
GitHub documents [commit email and noreply privacy](https://docs.github.com/en/account-and-profile/how-tos/email-preferences/setting-your-commit-email-address).
Verify the hosted offline workflow on its first run; it cannot validate native EU4.

Continue normal development in this same workspace: change source, run the appropriate
tests, select/sanitize bounded public evidence, update docs, inspect/stage/commit and
push when authorized. The local hook checks index bytes automatically. New clones
need Node 24 and `git config core.hooksPath tools/publication/hooks`; they recreate
local path overrides and generated profiles, rather than receiving private ones.
