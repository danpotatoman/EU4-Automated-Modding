# Public repository hygiene

Public candidates are reproducible project source, synthetic test fixtures, portable
config defaults/examples, guides/plans and deliberately reviewed small evidence.
Ignore rules are guardrails; already tracked files still need review.

## Before committing or publishing

1. Inspect `git status --short`, `git diff`, `git diff --cached` and every new file.
2. Run `node tools/publication/audit.mjs`. It scans tracked plus unignored untracked
   worktree files, flags private user paths/common credentials/binaries/generated
   directories/email addresses and files over 1 MiB, and reports duplicate text files.
   Matches print only location/rule. A nonzero exit needs review and correction.
3. Run `node tools/publication/audit.mjs --history` before first publication or after
   suspect commits. Cleaning the worktree cannot clean old blobs. Review author and
   committer identities privately as well. Do not push history containing private data.
   For exact commit contents run `node tools/publication/audit.mjs --staged --history`.
   The local pre-commit hook runs this automatically; enable it in new clones with
   `git config core.hooksPath tools/publication/hooks`. It checks the index even if
   the worktree has subsequently changed. Do not bypass a rejected audit to commit.
4. Confirm no unintentionally copied EU4/DLC source, assets, binaries or cached game
   data. Vanilla lookup captures are local-only in ignored `docs/modding/examples/`.
   Public guides use identifiers, installed relative paths, source hashes and small
   project-authored adaptations. Uncertain ownership stays local pending review.
5. Run the test level in [TESTING](TESTING.md), then
   `node tools/publication/check-links.mjs` and `git diff --check`. Record limitations.
6. Update status/coverage/guide/plan when behavior changes; stage explicit reviewed
   paths and inspect the staged diff. Do not use `git add -f` to bypass these exclusions.

The lightweight audit is not a complete secret detector or legal analysis. It does
not meaningfully inspect binary contents, unknown token formats, arbitrary personal
names or ownership. Do not paste secrets into reports; audit JSON belongs in ignored
`.local/`. Rotate any exposed real credential before deciding how to repair history.

## Evidence policy

Raw profiles, saves, logs, screenshots, crash dumps and staged game-history copies
remain in ignored tool output or `.local/evidence/`. `retain-claim.mjs` now copies
only into `.local/evidence/runtime-mission-claim/`. Reproduce runs on demand rather
than growing Git history indefinitely.

For a significant result, first write a small scenario report: source files/hash,
actual version/DLC/activation, initial state, actions, observations, verdict, failure
signs and open playtests. Keep FAIL/INCOMPLETE evidence when it explains a correction.
Retain the minimum adjacent text needed by regression replays; prefer bounded state
fields, assertion transcripts and result metadata. Native save excerpts here are
generated observations, not complete saves or redistributed game definitions.

Before copying evidence into `docs/testing/`, review its ownership and redact machine
paths in a separate public copy using `tools/publication/sanitize.mjs` helpers. Use
stable synthetic `X:/eu4-research`, `X:/eu4-game`, `X:/eu4-user-data` and
`X:/developer-home` roots so identity/profile relationships remain comparable.
Never run a published ownership record against live processes. Preserve original
hashes for local provenance and record public-copy hashes separately. Summarize bulk
collector arrays explicitly; do not silently change verdicts or claim public copies
are byte-identical originals. See [redaction manifest](testing/publication-redactions.json).

Game screenshots and bulk engine definition dumps are currently excluded pending
ownership review. Reports retain operator observations, with local-only references
clearly labeled. Synthetic fixtures may be public; do not replace missing native
evidence with fabricated success. Each new evidence bundle must have a reason to
keep it, bounded size and a reviewer; avoid duplicate snapshots except where an
independent attempt or before/after comparison depends on them.

Keep unused hardware/system diagnostic logs and raw crash metadata local as well.
Whitespace checks may flag preserved native log/save bytes; report those findings
and maintain evidence hashes instead of silently reformatting captures. Preserve
mod/fixture encodings and CRLF; `.gitattributes` prevents checkout conversion.

## Ongoing Git and archived history

This workspace now has clean Git metadata for ongoing development. Original history
is preserved in ignored `.local/private-history/2026-10-05/`; leave it local. Select
a public commit identity, review/commit the staged initial content, and continue in
this repository. Local configs/profiles/evidence remain in place and ignored. No
recurring export is needed. See [publication report](PUBLICATION.md).

`node tools/publication/export-snapshot.mjs` optionally creates a new ignored, history-free
review repository from audited candidates, with a file/hash manifest. It initializes
a fresh local Git directory, never copies original `.git`, config overrides or
ignored runtime data, and never commits or pushes. Review
the export before any later publication instruction. Do not copy archived Git objects
back into the active repository or add a remote automatically.
