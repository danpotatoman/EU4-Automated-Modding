param(
    [string]$Mod = 'brittany_missions',
    [switch]$Open,
    [switch]$NoVanilla
)
$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
$inspectorArgs = @((Join-Path $PSScriptRoot 'mission-inspector/generate.mjs'), '--mod', $Mod)
if ($NoVanilla) { $inspectorArgs += '--no-vanilla' }
& $nodePath @inspectorArgs
$result = $LASTEXITCODE
if ($Open -and $result -ne 2) {
    Start-Process -FilePath (Join-Path $PSScriptRoot "mission-inspector/reports/$Mod/index.html")
}
exit $result
