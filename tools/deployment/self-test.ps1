$ErrorActionPreference = 'Stop'
$deploy = Join-Path (Split-Path $PSScriptRoot -Parent) 'deploy-mod.ps1'
$testRoot = Join-Path $PSScriptRoot ('test-work/' + [Guid]::NewGuid().ToString('N'))
function Invoke-TestDeploy {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $deploy -DestinationRoot $testRoot -SkipValidation @args | Out-Host
    return $LASTEXITCODE
}
if ((Invoke-TestDeploy -Preview) -ne 0 -or (Test-Path -LiteralPath $testRoot)) { throw 'Preview wrote files or failed.' }
New-Item -ItemType Directory -Path $testRoot -Force | Out-Null
$target = Join-Path $testRoot 'brittany_missions_dev'
New-Item -ItemType Directory -Path $target | Out-Null
$sentinel = Join-Path $target 'unowned.txt'
[IO.File]::WriteAllText($sentinel, 'leave alone')
if ((Invoke-TestDeploy) -eq 0 -or [IO.File]::ReadAllText($sentinel) -ne 'leave alone') { throw 'Unowned destination was overwritten.' }
# Remove only the empty fixture after its sentinel, within this unique test root.
Remove-Item -LiteralPath $sentinel
Remove-Item -LiteralPath $target
$unrelated = Join-Path $testRoot 'unrelated.mod'
[IO.File]::WriteAllText($unrelated, 'leave alone')
if ((Invoke-TestDeploy) -ne 0) { throw 'First deployment failed.' }
$hasher = [Security.Cryptography.SHA256]::Create()
try { $destinationKey = ([BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($target.ToLowerInvariant())))).Replace('-', '').Substring(0, 16) } finally { $hasher.Dispose() }
$recordPath = Join-Path $PSScriptRoot "state/brittany_missions/$destinationKey/latest.json"
$record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
if ($record.schemaVersion -ne 2 -or $record.sourceMod -ne 'brittany_missions' -or $record.storageNamespace -ne 'brittany_missions' -or $record.artifactKind -ne 'staged' -or -not $record.sourceBuild.sha256 -or -not $record.artifactBuild.sha256 -or $record.verdict -ne 'UNVERIFIED') { throw 'Deployment identity is missing or falsely promotes gameplay.' }
# Only this unique self-test destination: contradictory owner is rejected.
$record.sourceMod = 'american_century'
[IO.File]::WriteAllText($recordPath, ($record | ConvertTo-Json -Depth 10))
if ((Invoke-TestDeploy) -eq 0) { throw 'Conflicting deployment owner was accepted.' }
$record.sourceMod = 'brittany_missions'
$record.artifactKind = 'production'
[IO.File]::WriteAllText($recordPath, ($record | ConvertTo-Json -Depth 10))
if ((Invoke-TestDeploy) -eq 0) { throw 'Conflicting deployment artifact kind was accepted.' }
$record.artifactKind = 'staged'
# Legacy unversioned ownership remains readable; byte checks still apply.
$record.PSObject.Properties.Remove('schemaVersion')
$record.PSObject.Properties.Remove('sourceMod')
[IO.File]::WriteAllText($recordPath, ($record | ConvertTo-Json -Depth 10))
if (-not (Test-Path -LiteralPath (Join-Path $target 'descriptor.mod'))) { throw 'Internal descriptor missing.' }
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$sourceScript = Join-Path $projectRoot 'mod/brittany_missions/localisation/english/bri_missions_l_english.yml'
$copiedScript = Join-Path $target 'localisation/english/bri_missions_l_english.yml'
if ((Get-FileHash -LiteralPath $sourceScript).Hash -ne (Get-FileHash -LiteralPath $copiedScript).Hash) { throw 'Localisation bytes changed.' }
if ((Invoke-TestDeploy) -ne 0) { throw 'Repeat deployment failed.' }
$script = Join-Path $target 'missions/Custom_Breton_Missions.txt'
[IO.File]::AppendAllText($script, 'external change')
if ((Invoke-TestDeploy) -eq 0) { throw 'Modified deployment was overwritten.' }
if (-not ([IO.File]::ReadAllText($script).EndsWith('external change'))) { throw 'Modified file was not preserved.' }
if ([IO.File]::ReadAllText($unrelated) -ne 'leave alone') { throw 'Unrelated mod changed.' }
Write-Host 'PASS: preview, unowned destination protection, descriptors, encoding preservation, repeated deployment, modification protection, unrelated-file preservation.'
