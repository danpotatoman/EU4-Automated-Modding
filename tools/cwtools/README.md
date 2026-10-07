# Local CWTools validator

Owner: shared EU4 tooling interface

[Framework status](../../docs/STATUS.md) owns tool capability state;
[mod runbooks](../../docs/mods/README.md) own gameplay state/coverage and
[evidence index](../../docs/testing/README.md) labels historical workloads.

These existing tools accept their documented -Mod and default to Brittany.
Brittany examples/source-backed tests do not establish another mod's gameplay.
Shared configuration remains unchanged; schema 2 semantics above apply to new reports.


Run from the shared `eu4-modding` project folder:

```powershell
./tools/validate-cwtools.ps1
# Validate another mod under mod/:
./tools/validate-cwtools.ps1 -Mod other_mod
# Or specify an explicit mod directory:
./tools/validate-cwtools.ps1 -Project 'C:/path/to/a/mod'
```

This is a small Node.js LSP client for the server bundled with the installed
`tboby.cwtools-vscode` extension. It needs no npm packages and works without opening
VS Code. It validates saved files, not unsaved editor changes.

## Configuration and results

New reports use [evidence schema 2](../../docs/runtime/evidence-identity.md),
including explicit source owner (null for arbitrary projects), storage namespace,
artifact kind, canonical project path, byte manifest/hash, run ID and start/finish
times. `-SourceMod`, `-ReportKey`, `-ArtifactKind`, `-ProjectIdentity` are optional
on the PowerShell wrapper (`--source-mod`, `--report-key`, `--artifact-kind`,
`--project-identity` in Node). Canonical production owner/kind contradictions fail.
Basename fallback and existing production/runtime namespaces/cache paths remain;
use separate report keys for arbitrary same-basename projects. Reuse requires
matching path/owner/kind/build and a fresh completed report. STATIC only; no runtime
activation is claimed. Historical reports remain unchanged and require documented
legacy compatibility or revalidation.

`config.json` records portable defaults for the EU4 installation, local rules folder, localisation
languages, experimental checks, and timeout. The newest installed CWTools extension
is discovered automatically; set `extensionPath` to select one explicitly.

Use ignored `config.local.json` or the documented environment variables for real
machine paths; copy/edit `config.example.json` as needed. The rule installer writes
its downloaded location to the local override. See [setup](../../docs/SETUP.md).

The detected installation is EU4 1.37.5.0. CWTools caches its vanilla files under
`.cache/`, leaving the installation and VS Code configuration unchanged. The initial
cache build can take several minutes and use several GB of memory. Subsequent runs
reuse it. `-RebuildCache` forces a rebuild. Game version, launcher-settings timestamp,
installation path, or extension version changes invalidate it automatically.

Reports go to `reports/<mod_name>/latest.json` and `latest.txt`; server logging goes to
`reports/<mod_name>/server.log`. The report records the rules fingerprint and game/server
versions. All project scripts and localisation must appear in CWTools' loaded-file
list before the helper accepts completion. Startup parser diagnostics are retained
alongside scope, reference, and localisation diagnostics. Reports start as `running`
and become `complete` or `failed`, preventing old results from appearing current.

Exit codes: **0** completed without errors, **1** completed with errors, **2** failed
to validate. Warnings are listed but do not cause a failing exit code.

## Rules and checks

Rules were downloaded from [CWTools' EU4 rules repository](https://github.com/cwtools/cwtools-eu4-config).
Validation uses that local snapshot and does not update or download anything.
Rules and generated caches/reports are ignored by Git. Restore or update the rules
with `./tools/cwtools/install-rules.ps1` when network access is available.

To test the integration against valid scripts, broken braces, incorrect scopes,
and undefined references:

```powershell
node tools/cwtools/self-test.mjs
./tools/validate-cwtools.ps1
```

Fixture reports are separate from actual mod reports. The second command validates
the current Brittany mod.
Only saved scripts are validated. CWTools is a static checker: a clean report does
not establish that missions appear correctly or rewards behave correctly in game.

The helper is Windows-specific and uses CWTools' current initialization protocol.
An incompatible future extension update may require adjusting the helper; errors
are reported instead of silently treating an incomplete run as a pass.
