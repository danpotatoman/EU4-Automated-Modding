param(
    [ValidateSet('search','show','links','save','verify','list','docs')][string]$Action = 'search',
    [string]$Query,
    [string]$Folder,
    [string]$File,
    [int]$Line = 1,
    [int]$Limit = 12,
    [int]$Context = 3,
    [string]$Name,
    [string]$Notes,
    [switch]$DefinitionsOnly,
    [switch]$Json
)
$ErrorActionPreference = 'Stop'
$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = if ($nodeCommand) { $nodeCommand.Source } else { Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $nodePath)) { throw 'Node.js was not found.' }
$lookupArgs = @((Join-Path $PSScriptRoot 'vanilla-reference/lookup.mjs'), $Action, '--line', "$Line", '--limit', "$Limit", '--context', "$Context")
foreach ($pair in @(@('query',$Query), @('folder',$Folder), @('file',$File), @('name',$Name), @('notes',$Notes))) { if ($pair[1]) { $lookupArgs += @(('--' + $pair[0]), $pair[1]) } }
if ($DefinitionsOnly) { $lookupArgs += '--definitions-only' }
if ($Json) { $lookupArgs += '--json' }
& $nodePath @lookupArgs
exit $LASTEXITCODE
