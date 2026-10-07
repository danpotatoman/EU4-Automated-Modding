param(
    [string]$Mod = 'brittany_missions',
    [string]$DestinationRoot,
    [switch]$Preview
)
# Restore only the exact recorded/canonical launcher bytes after a final LF loss.
# This does not reset ownership or accept arbitrary external modifications.
$ErrorActionPreference = 'Stop'
$toolsRoot = Split-Path $PSScriptRoot -Parent
$projectRoot = Split-Path $toolsRoot -Parent
. (Join-Path $toolsRoot 'config.ps1')
. (Join-Path $toolsRoot 'mod-config.ps1')
if ($Mod -notmatch '^[a-zA-Z0-9_-]+$') { throw 'Mod must be a simple folder name.' }
if (-not $DestinationRoot) { $DestinationRoot = (Get-DeploymentConfig).gameModDirectory }
$root = [IO.Path]::GetFullPath($DestinationRoot).TrimEnd('\', '/')
$target = [IO.Path]::GetFullPath((Join-Path $root "${Mod}_dev"))
$launcher = "$target.mod"
$source = [IO.Path]::GetFullPath((Join-Path $projectRoot "mod/$Mod"))
if (-not $target.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase) -or $root.StartsWith($source, [StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($root + '\', [StringComparison]::OrdinalIgnoreCase) -or $target -match '["\r\n]') { throw 'Invalid or overlapping destination.' }
function Get-BytesHash {
    param([byte[]]$Bytes)
    $hasher = [Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($hasher.ComputeHash($Bytes))).Replace('-', '') } finally { $hasher.Dispose() }
}
$utf8 = New-Object Text.UTF8Encoding($false)
$key = (Get-BytesHash $utf8.GetBytes($target.ToLowerInvariant())).Substring(0, 16)
$state = Join-Path $PSScriptRoot "state/$Mod/$key"
$recordPath = Join-Path $state 'latest.json'
foreach ($file in @($recordPath, $launcher)) {
    if (-not (Test-Path -LiteralPath $file -PathType Leaf) -or (Get-Item -LiteralPath $file).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Missing or linked ownership record/launcher.' }
}
# Refuse linked parents too; no repair through a redirected destination or state.
foreach ($start in @($target, $state)) {
    $current = $start
    while ($current) {
        # OneDrive ancestor placeholders can carry ReparsePoint without redirecting
        # the path. Reject actual directory links; content itself stays strict.
        if (-not (Test-Path -LiteralPath $current -PathType Container) -or (Get-Item -LiteralPath $current).LinkType -in @('Junction', 'SymbolicLink')) { throw 'Missing or linked destination/state directory.' }
        $parent = [IO.Directory]::GetParent($current)
        $current = if ($parent) { $parent.FullName } else { $null }
    }
}
$recordBytes = [IO.File]::ReadAllBytes($recordPath)
$record = $utf8.GetString($recordBytes).TrimStart([char]0xFEFF) | ConvertFrom-Json
$owner = if ($Mod -in @('brittany_missions', 'american_century')) { $Mod } else { $null }
if ($null -ne $record.schemaVersion -and $record.schemaVersion -ne 2) { throw 'Unsupported deployment schema version.' }
if ($record.schemaVersion -eq 2 -and ($record.sourceMod -ne $owner -or $record.storageNamespace -ne $Mod -or $record.artifactKind -ne 'staged' -or $record.status -ne 'complete')) { throw 'Deployment identity conflict.' }
if ($record.source -ne $source -or $record.target -ne $target -or $record.launcher -ne $launcher) { throw 'Ownership record source/destination conflict.' }
$metadata = Get-ModConfig -Mod $Mod -Root $projectRoot -EmitNotice
$descriptor = Get-DevelopmentDescriptor $metadata
$expected = $utf8.GetBytes($descriptor + "path=`"$($target.Replace('\', '/'))`"`n")
if ((Get-BytesHash $expected) -ne $record.launcherSha256) { throw 'Canonical launcher does not match recorded ownership; no newline repair is safe.' }
$actual = [IO.File]::ReadAllBytes($launcher)
if ($actual.Length -ne $expected.Length - 1 -or $expected[-1] -ne 10 -or (Get-BytesHash $actual) -ne (Get-BytesHash ([byte[]]$expected[0..($expected.Length - 2)]))) { throw 'Launcher differs by more than the final LF; refusing repair.' }
function Assert-OwnedContent {
    $items = @(Get-ChildItem -LiteralPath $target -Recurse -Force)
    if (@($items | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Linked deployed content; refusing repair.' }
    $files = @($items | Where-Object { -not $_.PSIsContainer })
    if ($files.Count -ne @($record.files).Count) { throw 'Deployed file list changed; refusing repair.' }
    $seen = @{}
    foreach ($entry in $record.files) {
        $file = [IO.Path]::GetFullPath((Join-Path $target $entry.path))
        if (-not $file.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase) -or $seen.ContainsKey($file)) { throw 'Invalid or duplicate recorded file path.' }
        $seen[$file] = $true
        if (-not (Test-Path -LiteralPath $file -PathType Leaf) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Deployed content changed: $($entry.path); refusing repair." }
    }
    $internal = @($record.files | Where-Object { $_.path -eq 'descriptor.mod' })
    if ($internal.Count -ne 1 -or $internal[0].sha256 -ne (Get-BytesHash $utf8.GetBytes($descriptor))) { throw 'Canonical internal descriptor does not match ownership.' }
}
Assert-OwnedContent
Write-Host "Verified final-LF-only loss: $launcher"
if ($Preview) { Write-Host 'Preview: exact recorded/canonical launcher can be restored; no files changed.'; return }
$audit = Join-Path $state ('repair-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ'))
New-Item -ItemType Directory -Path $audit | Out-Null
[IO.File]::WriteAllBytes((Join-Path $audit 'launcher-before.mod'), $actual)
[IO.File]::WriteAllBytes((Join-Path $audit 'ownership-before.json'), $recordBytes)
# Recheck immediately before writing. No concurrency/atomicity guarantee is made.
Assert-OwnedContent
if ((Get-FileHash -LiteralPath $recordPath).Hash -ne (Get-BytesHash $recordBytes) -or (Get-FileHash -LiteralPath $launcher).Hash -ne (Get-BytesHash $actual)) { throw 'Ownership/launcher changed during repair preparation.' }
[IO.File]::WriteAllBytes($launcher, $expected)
if ((Get-FileHash -LiteralPath $launcher).Hash -ne $record.launcherSha256) { throw 'Launcher restoration verification failed; preserved original is in repair audit.' }
Assert-OwnedContent
$summary = [ordered]@{ repairedAtUtc = [DateTime]::UtcNow.ToString('o'); operation = 'restore recorded canonical launcher final LF'; target = $target; launcher = $launcher; beforeSha256 = (Get-BytesHash $actual); afterSha256 = (Get-BytesHash $expected); ownershipSha256 = (Get-BytesHash $recordBytes); ownershipChanged = $false; gameplay = 'unverified' }
[IO.File]::WriteAllText((Join-Path $audit 'repair.json'), ($summary | ConvertTo-Json), $utf8)
Write-Host "Restored one final LF; ownership unchanged. Audit: $audit"
