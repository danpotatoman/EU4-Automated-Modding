# Test-run log collector

Run commands from the project root. Game logs are read only; snapshots and reports
stay under ignored `tools/test-runs/reports/<mod>/<run-id>/` directories.
The logs path defaults to the sibling `logs/` directory of the game mod directory
in `tools/deployment/config.json`.

## Testing a deployed mod

Deploy first, then begin before launching EU4 or performing your scenario:

```powershell
./tools/test-run.ps1 -Action begin -Scenario 'Load Brittany and check the first mission prerequisites'
# Launch EU4, enable the development mod, and perform the scenario.
# Close EU4 before collecting for the most consistent snapshots.
./tools/test-run.ps1 -Action finish -Outcome passed -Notes 'Mission visible; unavailable at stability zero'
./tools/test-run.ps1 -Action status
```

Begin verifies the latest deployment record for the configured destination and
copies that record into run metadata. It refuses a modified or missing deployed
build. Finish checks the same build again and reports changes during the test.
This identifies the deployed files but does not prove that the launcher enabled
them. `-DeploymentRecord` selects a different deployment's `latest.json`.

Only one unfinished run per mod is allowed. Finish defaults to the active run;
`-Run <id>` selects a run explicitly. Outcomes are `passed`, `failed`,
`not-completed`, and the default `unverified`. These are operator assessments,
not conclusions inferred from logs. Use `not-completed` to close an abandoned run.
Errors in the collector exit 2; successful collection exits 0 even if game errors
are present or the supplied gameplay outcome is failed.

## Establishing a baseline

Use a comparable startup/scenario with the development mod disabled. The collector
does not operate the launcher or verify vanilla status:

```powershell
./tools/test-run.ps1 -Action begin -Untracked -Scenario 'Vanilla Brittany startup baseline'
# Launch without the mod, load Brittany, then exit.
./tools/test-run.ps1 -Action finish -Outcome unverified
./tools/test-run.ps1 -Action baseline -Run <id-from-begin>
```

Baseline selection is explicit and applies to subsequent finishes for this mod.
An untracked run has no verified deployment identity. Use the same game version,
DLC, other mods and scenario for meaningful comparison. Baseline messages remain
in JSON; matching messages are omitted from the new-message section of the text
report. Increased occurrence counts still appear. Without a baseline, error
messages are listed as unbaselined rather than attributed to your mod.

## Reports and limits

Each run contains `run.json`, byte-preserving `before/` and `after/` snapshots,
`delta/` files, and `report.json`/`report.txt`. The per-mod `latest.json` points
to the most recently finished report. All current `.log` files are captured;
rotated `_old` logs are excluded. The error summary uses `error.log` and
`setup_error.log`; the other logs are available as context.

When a log retains its old byte prefix, only appended bytes are analyzed. If it
was reset or replaced, its entire new contents are analyzed. Exact clock prefixes
such as `[12:34:56]` are removed for comparison; source line numbers and IDs are
preserved. Changed source line numbers may therefore appear as new findings.
For baseline comparison, use comparable full startups or comparable in-session
actions: a whole startup log and an appended action log represent different scopes.

Missing logs and files that changed during capture are flagged. No changed logs
does not establish that a game run happened. Clean logs do not verify mission
availability, rewards, balance or successful loading. Screenshots and save-state
checks remain separate evidence. Game-version metadata, when available, comes
from the latest CWTools report and is explicitly not a running-game measurement.

Override paths with `-LogsDirectory`, or select another mod with `-Mod`.
Integration checks: `./tools/test-runs/self-test.ps1` (includes Node core tests
and PowerShell command checks, with the same Node fallback as the collector); fixtures remain under
ignored `tools/test-runs/test-work/`, never in actual mods or game directories.
