param(
    [string]$Mod = 'brittany_missions',
    [string]$Project,
    [switch]$RebuildCache
)
$ErrorActionPreference = 'Stop'
if (-not $Project) {
    $Project = Join-Path (Split-Path $PSScriptRoot -Parent) ('mod/' + $Mod)
}
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) {
    throw 'Node.js was not found. Install Node.js or make its node command available.'
}
$validatorArgs = @((Join-Path $PSScriptRoot 'cwtools/validate.mjs'), '--project', $Project)
if ($RebuildCache) { $validatorArgs += '--rebuild-cache' }
& $nodePath @validatorArgs
exit $LASTEXITCODE
