# One-command project check

Owner: shared EU4 tooling interface

Reports use [evidence schema 2](../../docs/runtime/evidence-identity.md), with
owner/namespace/artifact/source-build/run identity and STATIC-only verdicts.
Current CWTools/inspector acceptance checks path, owner, namespace, artifact/build,
start/completion freshness and completed status. Legacy findings baselines remain
readable; ambiguous collector records are unavailable. A matched deployed build
is operator evidence with gameplay/activation unverified, never automatic coverage.

[Framework status](../../docs/STATUS.md) owns tool capability state;
[mod runbooks](../../docs/mods/README.md) own gameplay state/coverage and
[evidence index](../../docs/testing/README.md) labels historical workloads.

These existing tools accept their documented -Mod and default to Brittany.
Brittany examples/source-backed tests do not establish another mod's gameplay.
Shared machine configuration is separate from [mod metadata](../mods/README.md);
schema 2 semantics above apply to new reports.


From the project root:

```powershell
./tools/check-project.ps1
./tools/check-project.ps1 -Open
./tools/check-project.ps1 -Mod other_mod
```

The command runs fresh CWTools validation, regenerates mission inspection reports,
checks mod files and prepares deployment descriptors in memory. It never deploys,
launches EU4, edits scripts or probes the game directory by writing to it.
Generated output stays under ignored `tools/checks/reports/<mod>/`.

## Results

- **Passed / exit 0:** every required check completed and has no errors. Warnings
  remain visible and do not fail the check.
- **Failed / exit 1:** every check completed, but one or more reported errors.
- **Incomplete / exit 2:** a checker failed, timed out, produced a stale report,
  or source files changed during the check. This takes precedence over errors.

`latest.html`, `latest.txt` and `latest.json` contain the combined result. Each
finished run also has a timestamped JSON/HTML archive. Reports start as running,
replacing the previous latest result before checks execute. A stopped process may
leave a running report: it must not be interpreted as a completed check.

CWTools runs through the existing validator and must return 0/1 with a newly
completed report for this mod. Exit/report disagreement is incomplete. The
validator's game version and CWTools version are recorded. Its console output
is saved as `cwtools-output.txt`. The configured CWTools timeout is given an
additional 60 seconds before the wrapper stops its subprocess tree.

Mission findings are collected across normal configured scenarios. Identical
findings shared by scenarios count once in the mission summary, retaining all
scenario occurrences. Intentionally invalid diagnostic scenarios are excluded.
The full interactive grid remains in `tools/mission-inspector/reports/<mod>/`.

File checks require UTF-8 BOMs and matching language headers/names for localisation,
reject UTF-16/NUL-bearing game text, and flag symlinks, development tooling, tests,
caches and temporary output inside mod content. Legacy script encodings are not
converted or blanket-rejected. The checks do not replace CWTools parsing.

Deployment preparation validates destination and descriptor metadata, computes
the same descriptor bytes as the deployment command, and checks ownership and
external modifications if a development destination exists. Missing source
descriptors are allowed because deployment generates them. No write-permission
probe is performed; passing preparation is not a guarantee that a subsequent
copy will be authorized or writable.

Development descriptor/scenario values come from the selected owner's
`tools/mods/<id>/config.json`, through the same effective metadata rules as
PowerShell deployment. Shared/local machine path precedence and strict known
Brittany destination failure remain unchanged. Synthetic fixtures/unknown mods
use explicit generic metadata without borrowing Brittany's name or scenarios.

## New, existing and resolved findings

Comparison uses the last **completed** check (passed or failed), never an
incomplete run. Findings are grouped within each tool by severity, code, source
file, message and affected mission IDs. Line numbers and scenario names are
retained as occurrences but do not change identity, avoiding false new/resolved
claims when lines shift. Occurrence-count changes are recorded separately.
Message changes can legitimately create a new/resolved pair.

If a tool is incomplete, its absent old findings are **deferred**, not resolved.
Successful tools can show resolved findings even while the overall check is
incomplete; that run does not advance the baseline. First-run findings are new.
Cross-tool findings remain separate because their rules and meanings can differ.
CWTools summary counts are raw diagnostics; mission counts are unique across
scenarios; comparison counts are grouped findings, so totals can differ.

The source inventory stores file hashes and a build fingerprint. Changes during
the check invalidate the result. A per-mod lock prevents concurrent checks from
corrupting the baseline. If an interrupted process leaves `active.lock`, verify
that its recorded PID is no longer running, then remove that specific lock before
retrying. Generated reports and source files need not be deleted.

## In-game evidence

When available, the latest finished log-collector run is attached separately as
`matching-build`, `stale`, `untracked`, or `unavailable` evidence. Prepared source
hashes, the generated internal descriptor, and launcher descriptor must match the
tested deployment; reported build changes during the test make it stale. Outcome
is supplied by the operator, not inferred from clean logs. Missing test evidence
does not fail static checks, and matching evidence for one scenario does not
establish all mission behavior, correct playset loading or release readiness.

Run integration fixtures with `./tools/checks/self-test.ps1`. They exercise file
encoding, deployment preparation, failure/stale-report handling, comparison
history, source changes and concurrency without writing to real game folders.
