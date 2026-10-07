param(
    [ValidateSet('preview-gate','nantes-market','nantes-claim','run-effects','shipbuilding-reward','borders-reward','textiles-upgrade','usa-slice','all')][string]$Test = 'preview-gate',
    [ValidateSet('click','mission','scripted','tree','shortcut','negative')][string]$ClaimMode = 'click',
    [ValidateRange(30,1800)][int]$TimeoutSeconds = 120,
    [ValidateRange(0,2)][int]$Retries = 1,
    [ValidateRange(5,1800)][int]$ProgressTimeoutSeconds = 30,
    [switch]$PrepareOnly,
    [switch]$InlineBaseline,
    [switch]$NegativeControl,
    [switch]$ExerciseTerminateFirst,
    [switch]$ExerciseNativeCrash,
    [switch]$ExerciseFreezeFirst,
    [string]$Mod,
    [switch]$ListTests
)
$ErrorActionPreference = 'Stop'
if ($PSBoundParameters.ContainsKey('Mod') -and [string]::IsNullOrWhiteSpace($Mod)) {
    throw 'Mod requires a source owner; use ListTests to list supported owners.'
}
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else {
    Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe'
}
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
$runnerArgs = @((Join-Path $PSScriptRoot 'runtime-tests/run.mjs'))
if ($Mod) { $runnerArgs += @('--mod', $Mod) }
if ($ListTests) {
    if (@($PSBoundParameters.Keys | Where-Object { $_ -notin @('Mod','ListTests') }).Count) {
        throw 'ListTests accepts only an optional Mod filter.'
    }
    $runnerArgs += '--list-tests'
    & $nodePath @runnerArgs
    exit $LASTEXITCODE
}
$runnerArgs += @('--test', $Test, '--timeout', $TimeoutSeconds,
    '--retries', $Retries, '--progress-timeout', $ProgressTimeoutSeconds, '--claim-mode', $ClaimMode)
if ($PrepareOnly) { $runnerArgs += '--prepare-only' }
if ($InlineBaseline) { $runnerArgs += '--inline-baseline' }
if ($NegativeControl) { $runnerArgs += '--negative-control' }
if ($ExerciseTerminateFirst) { $runnerArgs += '--exercise-terminate-first' }
if ($ExerciseNativeCrash) { $runnerArgs += '--exercise-native-crash' }
if ($ExerciseFreezeFirst) { $runnerArgs += '--exercise-freeze-first' }
& $nodePath @runnerArgs
exit $LASTEXITCODE
