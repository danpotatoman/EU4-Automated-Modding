$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Install Node.js 24 on PATH before committing.' }
& $nodePath (Join-Path $PSScriptRoot 'audit.mjs') --staged --history
exit $LASTEXITCODE
