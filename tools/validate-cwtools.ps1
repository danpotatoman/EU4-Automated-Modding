param(
    [string]$Mod = 'brittany_missions',
    [string]$Project,
    [string]$SourceMod,
    [string]$ReportKey,
    [ValidateSet('production','staged','fixture','synthetic','untracked','baseline')][string]$ArtifactKind,
    [string]$ProjectIdentity,
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
foreach ($pair in @(@('source-mod',$SourceMod), @('report-key',$ReportKey), @('artifact-kind',$ArtifactKind), @('project-identity',$ProjectIdentity))) {
    if ($pair[1]) { $validatorArgs += @(('--' + $pair[0]), $pair[1]) }
}
& $nodePath @validatorArgs
exit $LASTEXITCODE
