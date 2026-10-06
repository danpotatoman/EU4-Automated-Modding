param(
    [string]$Mod = 'brittany_missions',
    [string]$DestinationRoot,
    [switch]$AllowValidationErrors,
    [switch]$SkipValidation,
    [switch]$Preview
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
. (Join-Path $PSScriptRoot 'config.ps1')
$config = Get-DeploymentConfig
if ($Mod -notmatch '^[a-zA-Z0-9_-]+$') { throw 'Mod must be a simple folder name.' }
if (-not $DestinationRoot) { $DestinationRoot = $config.gameModDirectory }
$source = [IO.Path]::GetFullPath((Join-Path $projectRoot "mod/$Mod"))
$destinationRootPath = [IO.Path]::GetFullPath($DestinationRoot).TrimEnd('\', '/')
$deploymentName = "${Mod}_dev"
$target = [IO.Path]::GetFullPath((Join-Path $destinationRootPath $deploymentName))
$launcher = Join-Path $destinationRootPath "$deploymentName.mod"
$hasher = [Security.Cryptography.SHA256]::Create()
try { $destinationKey = ([BitConverter]::ToString($hasher.ComputeHash([Text.Encoding]::UTF8.GetBytes($target.ToLowerInvariant())))).Replace('-', '').Substring(0, 16) } finally { $hasher.Dispose() }
$stateRoot = Join-Path $PSScriptRoot "deployment/state/$Mod/$destinationKey"
$recordPath = Join-Path $stateRoot 'latest.json'
if (-not (Test-Path -LiteralPath $source -PathType Container)) { throw "Missing source: $source" }
if (-not $target.StartsWith($destinationRootPath + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Destination escaped its root.' }
if ($destinationRootPath.StartsWith($source, [StringComparison]::OrdinalIgnoreCase) -or $source.StartsWith($destinationRootPath + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Source and destination must be separate.' }
$sourceItems = @(Get-ChildItem -LiteralPath $source -Recurse -Force)
if (@($sourceItems | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Source contains a symlink or junction.' }
Write-Host "Source: $source"
Write-Host "Destination: $target"
Write-Host "Launcher descriptor: $launcher"
if ($Preview) { Write-Host 'Preview only; no files changed and validation not run.'; return }
if ((Test-Path -LiteralPath $target) -or (Test-Path -LiteralPath $launcher)) {
    if (-not (Test-Path -LiteralPath $recordPath)) { throw 'Destination already exists without a deployment record. Refusing to overwrite it.' }
    $previous = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
    if ($previous.target -ne $target -or $previous.launcher -ne $launcher) { throw 'Existing deployment record belongs to a different destination.' }
    if (-not (Test-Path -LiteralPath $target -PathType Container) -or -not (Test-Path -LiteralPath $launcher -PathType Leaf)) { throw 'Existing deployment is incomplete; restore or move it before redeploying.' }
    $targetItems = @(Get-Item -LiteralPath $target) + @(Get-ChildItem -LiteralPath $target -Recurse -Force)
    if (@($targetItems | Where-Object { $_.Attributes -band [IO.FileAttributes]::ReparsePoint }).Count) { throw 'Existing deployment contains a symlink or junction.' }
    if ((Get-FileHash -LiteralPath $launcher -Algorithm SHA256).Hash -ne $previous.launcherSha256) { throw 'Launcher descriptor changed outside deployment. Refusing to overwrite.' }
    $existingFiles = @(Get-ChildItem -LiteralPath $target -Recurse -File -Force)
    if ($existingFiles.Count -ne @($previous.files).Count) { throw 'Deployed file list changed outside deployment. Refusing to overwrite.' }
    foreach ($entry in $previous.files) {
        $file = [IO.Path]::GetFullPath((Join-Path $target $entry.path))
        if (-not $file.StartsWith($target + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid recorded file path.' }
        if (-not (Test-Path -LiteralPath $file -PathType Leaf) -or (Get-FileHash -LiteralPath $file -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Deployed file changed outside deployment: $($entry.path)" }
    }
}
$validation = 'skipped'
if (-not $SkipValidation) {
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'validate-cwtools.ps1') -Mod $Mod
    $validationExit = $LASTEXITCODE
    if ($validationExit -eq 2 -or $validationExit -notin @(0, 1)) { throw 'CWTools validation failed to complete. Deployment stopped.' }
    if ($validationExit -eq 1 -and -not $AllowValidationErrors) { throw 'CWTools found errors. Fix them or explicitly use -AllowValidationErrors for development testing.' }
    $validation = if ($validationExit -eq 0) { 'passed' } else { 'errors-allowed' }
}
$stamp = [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssfffZ')
$runRoot = Join-Path $stateRoot $stamp
$stage = Join-Path $runRoot 'staged'
New-Item -ItemType Directory -Path $stage -Force | Out-Null
foreach ($item in (Get-ChildItem -LiteralPath $source -Force)) { Copy-Item -LiteralPath $item.FullName -Destination $stage -Recurse -Force }
$displayName = if ($Mod -eq 'brittany_missions') { $config.displayName } else { "$Mod (Development)" }
if ($displayName -match '["\r\n]' -or $config.supportedVersion -notmatch '^[0-9.*]+$') { throw 'Invalid descriptor metadata.' }
$descriptor = "name=`"$displayName`"`nsupported_version=`"$($config.supportedVersion)`"`n"
$utf8 = New-Object Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $stage 'descriptor.mod'), $descriptor, $utf8)
$launcherText = $descriptor + "path=`"$($target.Replace('\', '/'))`"`n"
if ($target -match '["\r\n]') { throw 'Invalid destination path for descriptor.' }
$files = @(Get-ChildItem -LiteralPath $stage -Recurse -File -Force | ForEach-Object {
    [ordered]@{ path = $_.FullName.Substring($stage.Length + 1); sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }
})
New-Item -ItemType Directory -Path $destinationRootPath -Force | Out-Null
if (Test-Path -LiteralPath $target) {
    Copy-Item -LiteralPath $target -Destination (Join-Path $runRoot 'previous') -Recurse
    Copy-Item -LiteralPath $launcher -Destination (Join-Path $runRoot 'previous.mod')
}
try {
    if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Recurse -Force }
    Copy-Item -LiteralPath $stage -Destination $target -Recurse
    [IO.File]::WriteAllText($launcher, $launcherText, $utf8)
    foreach ($entry in $files) {
        if ((Get-FileHash -LiteralPath (Join-Path $target $entry.path) -Algorithm SHA256).Hash -ne $entry.sha256) { throw "Copy verification failed: $($entry.path)" }
    }
    $record = [ordered]@{ deployedAtUtc = $stamp; source = $source; target = $target; launcher = $launcher; validation = $validation; launcherSha256 = (Get-FileHash -LiteralPath $launcher -Algorithm SHA256).Hash; files = $files; backupDirectory = $runRoot }
    $recordJson = $record | ConvertTo-Json -Depth 6
    [IO.File]::WriteAllText((Join-Path $runRoot 'deployment.json'), $recordJson, $utf8)
    [IO.File]::WriteAllText($recordPath, $recordJson, $utf8)
} catch {
    if (Test-Path -LiteralPath $target) { Remove-Item -LiteralPath $target -Recurse -Force }
    if (Test-Path -LiteralPath (Join-Path $runRoot 'previous')) {
        Copy-Item -LiteralPath (Join-Path $runRoot 'previous') -Destination $target -Recurse
        Copy-Item -LiteralPath (Join-Path $runRoot 'previous.mod') -Destination $launcher -Force
    } elseif (Test-Path -LiteralPath $launcher) { Remove-Item -LiteralPath $launcher -Force }
    throw
}
Write-Host "Deployed $($files.Count) files; validation: $validation."
Write-Host "Enable '$displayName' in the EU4 launcher and disable other copies of this mod."
