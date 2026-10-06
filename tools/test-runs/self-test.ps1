$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
& $nodePath (Join-Path $PSScriptRoot 'self-test.mjs')
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
# Exercise the PowerShell argument forwarding as well as the JS core.
$testRoot = Join-Path $PSScriptRoot ('test-work/wrapper-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
[IO.File]::WriteAllText((Join-Path $testRoot 'error.log'), '')
$fixtureMod = 'collector_wrapper_' + [Guid]::NewGuid().ToString('N')
$wrapper = Join-Path (Split-Path $PSScriptRoot -Parent) 'test-run.ps1'
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $wrapper -Action begin -Mod $fixtureMod -Untracked -LogsDirectory $testRoot -Scenario 'Wrapper test with spaces'
if ($LASTEXITCODE -ne 0) { throw 'Wrapper begin failed.' }
[IO.File]::WriteAllText((Join-Path $testRoot 'error.log'), '[12:00:00][test.cpp:1]: fixture issue')
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $wrapper -Action finish -Mod $fixtureMod -Outcome failed -Notes 'Fixture outcome with spaces'
if ($LASTEXITCODE -ne 0) { throw 'Wrapper finish failed.' }
$latest = Get-Content -LiteralPath (Join-Path $PSScriptRoot "reports/$fixtureMod/latest.json") -Raw | ConvertFrom-Json
$report = Get-Content -LiteralPath $latest.report -Raw | ConvertFrom-Json
if ($report.scenario -ne 'Wrapper test with spaces' -or $report.notes -ne 'Fixture outcome with spaces' -or $report.outcome -ne 'failed' -or @($report.newErrorMessages).Count -ne 1) { throw 'Wrapper arguments or reporting failed.' }
Write-Host 'PASS: PowerShell begin/finish argument forwarding and generated reports.'
