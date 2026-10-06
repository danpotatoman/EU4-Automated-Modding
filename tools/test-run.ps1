param(
    [Parameter(Mandatory=$true)][ValidateSet('begin','finish','baseline','status')][string]$Action,
    [string]$Mod = 'brittany_missions',
    [string]$Scenario,
    [string]$Run,
    [string]$LogsDirectory,
    [string]$DeploymentRecord,
    [ValidateSet('passed','failed','not-completed','unverified')][string]$Outcome = 'unverified',
    [string]$Notes,
    [switch]$Untracked
)
$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
$collectorArgs = @((Join-Path $PSScriptRoot 'test-runs/collector.mjs'), $Action, '--mod', $Mod, '--outcome', $Outcome)
foreach ($pair in @(@('scenario',$Scenario), @('run',$Run), @('logs',$LogsDirectory), @('deployment',$DeploymentRecord), @('notes',$Notes))) {
    if ($pair[1]) { $collectorArgs += @(('--' + $pair[0]), $pair[1]) }
}
if ($Untracked) { $collectorArgs += '--untracked' }
& $nodePath @collectorArgs
exit $LASTEXITCODE
