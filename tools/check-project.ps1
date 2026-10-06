param([string]$Mod = 'brittany_missions', [switch]$Open)
$ErrorActionPreference = 'Stop'
if ($Mod -notmatch '^[a-zA-Z0-9_-]+$') { throw 'Mod must be a simple folder name.' }
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
$startedAtUtc = [DateTime]::UtcNow
& $nodePath (Join-Path $PSScriptRoot 'checks/check.mjs') --mod $Mod
$result = $LASTEXITCODE
$reportPath = Join-Path $PSScriptRoot "checks/reports/$Mod/latest.html"
if ($Open -and (Test-Path -LiteralPath $reportPath) -and (Get-Item -LiteralPath $reportPath).LastWriteTimeUtc -ge $startedAtUtc) {
    Start-Process -FilePath $reportPath
}
exit $result
