# Developer setup

Start at [README](../README.md), [testing](TESTING.md) and [current status](STATUS.md).
Offline tests require Git and Node.js 24 only. Native tools were verified on Windows
with Windows PowerShell 5.1 and EU4 1.37.5.0 Inca (491d), CWTools 0.10.31 and the
[documented DLC assumptions](testing/environment.md). Other platforms for native
testing and other game versions are not established.

## Configure local paths

Enable the staged-content publication check after cloning:

```shell
git config core.hooksPath tools/publication/hooks
```

It is already enabled in the prepared local workspace. Before its first commit,
set repository-local `user.name` and `user.email` to your chosen public identity;
those fields were intentionally cleared to prevent inherited private attribution.
Use a GitHub-provided noreply address if that is your preference. Normal edits,
native test profiles and ignored machine settings stay in this same repository.

Precedence is environment variables, ignored local override, committed defaults.
The config readers are `tools/config.mjs` and `tools/config.ps1` (deployment only).

| Setting | Default / override |
| --- | --- |
| Installed game | Standard Steam `steamapps/common/Europa Universalis IV` under Program Files (x86); set `EU4_GAME_PATH` for other libraries |
| Ordinary user data | Windows Documents known folder plus `Paradox Interactive/Europa Universalis IV`; set `EU4_USER_DIR` to the directory containing `settings.txt` and `dlc_load.json` |
| CWTools extension | Newest `tboby.cwtools-vscode-*` under the current user's `.vscode/extensions`; override `EU4_CWTOOLS_EXTENSION` with the extension directory |
| Rules | `tools/cwtools/rules-download/cwtools-eu4-config-master`; override `EU4_CWTOOLS_RULES` or install rules |
| Node | PATH; PowerShell wrappers retain an optional user-relative Codex runtime fallback. Install Node on PATH for normal reproducible use |
| Native work / evidence | Project-relative `tools/runtime-tests/work/` and `tools/test-runs/reports/`; intentionally ignored |

Game installation discovery is deliberately limited to the standard Steam path;
custom Steam libraries/other distributions need explicit configuration. Windows
Documents discovery handles redirected Documents folders; a local override is
preferable when several EU4 profiles exist. No production writes follow from config
discovery. Inspect your chosen paths before deployment or native tests.

```powershell
$env:EU4_GAME_PATH = 'D:/SteamLibrary/steamapps/common/Europa Universalis IV'
$env:EU4_USER_DIR = 'D:/EU4-user-data'
# Alternatively copy examples and edit the copies:
Copy-Item tools/cwtools/config.example.json tools/cwtools/config.local.json
Copy-Item tools/deployment/config.example.json tools/deployment/config.local.json
```

Remove example `extensionPath` unless you actually use that custom location.
The rule installer writes only the local override; shared configuration is unchanged.
The original workstation configuration was preserved locally during publication work.
`-DestinationRoot` on deployment overrides the configured mod destination for that
invocation. Other CLI overrides remain documented in each tool README.

## Static checks

Install VS Code's `tboby.cwtools-vscode` extension locally. Obtain the EU4 rules:

```powershell
./tools/cwtools/install-rules.ps1
./tools/validate-cwtools.ps1
./tools/validate-cwtools.ps1 -Mod american_century
./tools/inspect-missions.ps1
```

Normal validation is offline once rules/server/game references are installed. Read
`tools/cwtools/reports/<mod>/latest.json`: exit 0 complete without errors, 1 complete
with script errors, 2 failed/timed out. Warnings do not fail. Rules are downloaded
from upstream master; retained reports identify the validated version, but a bit-for-bit
reproduction of an old rules snapshot is not guaranteed. Do not redistribute cached
game data or the installed extension binary.

If PowerShell policy blocks scripts, use process-local bypass:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File tools/validate-cwtools.ps1
```

## Native tests and deployment

Read [TESTING](TESTING.md) before launching. Steam must be usable, graphics and an
interactive desktop available, no unrelated EU4 session running. The Brittany runner
requires ordinary launcher `enabled_mods` to contain only
`mod/brittany_missions_dev.mod` and no disabled DLC. A configured preference is not
activation evidence. Development deployment is a separate operation:

```powershell
./tools/deploy-mod.ps1 -Preview
# With EU4 closed, validation completed and destination ownership understood:
./tools/deploy-mod.ps1
# Select the matching launcher playset yourself before testing.
./tools/run-eu4-test.ps1 -Test all -TimeoutSeconds 150
```

Deployment refuses unowned or externally changed destinations; do not bypass this
to repair a historical mismatch. The runner stages its own copy and does not require
the ordinary deployed bytes to be current, but verifies launcher configuration.
Preparation-only is not a native pass. Retry/cleanup uses fresh attempt profiles;
assertion or integrity failures and failed cleanup stop automatically.

`nantes-claim` and `usa-slice` require the external active Codex input adapter described
in the runner README. This API is not a public npm dependency or guaranteed capability
of every Codex environment. If absent, use documented manual playtests or retain the
UI result as INCOMPLETE. No generic headless or scheduled UI support is claimed.

The optional mission-viewer browser QA takes an installed Chromium path as its first
argument; it defaults to the standard Chrome location. It is separate from offline CI.
