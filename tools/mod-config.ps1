# Matching metadata reader; machine paths and native contract registration stay separate.
function Test-ModStringArray {
    param($Value)
    if ($Value -isnot [array]) { return $false }
    foreach ($item in $Value) { if ($item -isnot [string]) { return $false } }
    return $true
}
function Test-ModMetadata {
    param($Metadata, [string]$Mod)
    if ($null -eq $Metadata -or $Metadata.PSObject.Properties.Name -cnotcontains 'schemaVersion' -or $Metadata.schemaVersion -is [string] -or $Metadata.schemaVersion -is [bool] -or $Metadata.schemaVersion -ne 1) { throw 'Unsupported mod metadata schema version.' }
    if ($Metadata.PSObject.Properties.Name -cnotcontains 'sourceMod' -or $Metadata.sourceMod -cne $Mod) { throw 'Mod metadata source owner conflicts with selected mod.' }
    if ($Metadata.PSObject.Properties.Name -cnotcontains 'developmentDisplayName' -or $Metadata.developmentDisplayName -isnot [string] -or -not $Metadata.developmentDisplayName.Trim() -or $Metadata.developmentDisplayName -match '["\r\n]') { throw 'Invalid developmentDisplayName.' }
    if ($Metadata.PSObject.Properties.Name -cnotcontains 'supportedVersion' -or $Metadata.supportedVersion -isnot [string] -or $Metadata.supportedVersion -notmatch '^[0-9.*]+$') { throw 'Invalid supportedVersion.' }
    $inspector = $Metadata.missionInspector
    if ($Metadata.PSObject.Properties.Name -cnotcontains 'missionInspector' -or $null -eq $inspector -or $inspector.PSObject.Properties.Name -cnotcontains 'scenarios' -or $inspector.scenarios -isnot [array] -or $inspector.scenarios.Count -eq 0) { throw 'Invalid missionInspector scenarios.' }
    foreach ($scenario in $inspector.scenarios) {
        if ($null -eq $scenario -or $scenario.PSObject.Properties.Name -cnotcontains 'name' -or $scenario.name -isnot [string] -or -not $scenario.name.Trim()) { throw 'Invalid missionInspector scenarios.' }
        if ($scenario.PSObject.Properties.Name -cnotcontains 'flags' -or ($null -ne $scenario.flags -and -not (Test-ModStringArray $scenario.flags))) { throw 'Invalid missionInspector scenarios.' }
        if ($scenario.PSObject.Properties.Name -ccontains 'tag' -and $scenario.tag -isnot [string]) { throw 'Invalid missionInspector scenarios.' }
        if ($scenario.PSObject.Properties.Name -ccontains 'mapSetup' -and $scenario.mapSetup -isnot [string]) { throw 'Invalid missionInspector scenarios.' }
        if ($scenario.PSObject.Properties.Name -ccontains 'diagnostic' -and $scenario.diagnostic -isnot [bool]) { throw 'Invalid missionInspector scenarios.' }
    }
    if ($inspector.PSObject.Properties.Name -cnotcontains 'mutuallyExclusiveFlags' -or $inspector.mutuallyExclusiveFlags -isnot [array]) { throw 'Invalid missionInspector state rules.' }
    foreach ($rule in $inspector.mutuallyExclusiveFlags) {
        if (-not (Test-ModStringArray $rule) -or $rule.Count -lt 2) { throw 'Invalid missionInspector state rules.' }
    }
}
function Get-ModConfig {
    param([string]$Mod, [string]$Root = (Split-Path $PSScriptRoot -Parent), [switch]$EmitNotice)
    if (-not $Mod -or $Mod -notmatch '^[a-zA-Z0-9_-]+$') { throw 'Mod must be a simple source-folder ID.' }
    $file = Join-Path $Root "tools/mods/$Mod/config.json"
    $registered = Test-Path -LiteralPath $file
    if ($registered) { $metadata = Get-Content -LiteralPath $file -Raw -Encoding UTF8 | ConvertFrom-Json }
    else {
        $metadata = [pscustomobject]@{ schemaVersion = 1; sourceMod = $Mod; developmentDisplayName = "$Mod (Development)"; supportedVersion = '1.37.*';
            missionInspector = [pscustomobject]@{ scenarios = @([pscustomobject]@{ name = "Unknown country state $([char]0x2014) review series selection"; flags = $null }); mutuallyExclusiveFlags = @() } }
    }
    Test-ModMetadata $metadata $Mod
    $notices = New-Object 'System.Collections.Generic.List[string]'
    if (-not $registered) { $notices.Add("No metadata for $Mod; using generic development/inspector defaults, with source ownership unknown.") }
    $local = Join-Path $Root 'tools/deployment/config.local.json'
    if (Test-Path -LiteralPath $local) {
        $legacy = Get-Content -LiteralPath $local -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($field in $legacy.PSObject.Properties.Name) {
            if ($field.ToLowerInvariant() -in @('displayname','supportedversion') -and $field -cnotin @('displayName','supportedVersion')) {
                $notices.Add("Legacy deployment metadata field $field ignored for $Mod; use exact displayName/supportedVersion casing.")
            }
        }
        if ($legacy.PSObject.Properties.Name -ccontains 'displayName') {
            if ($Mod -ceq 'brittany_missions') {
                $metadata.developmentDisplayName = $legacy.displayName
                $notices.Add('Legacy deployment displayName applies only to brittany_missions; deprecated, use tools/mods/brittany_missions/config.json.')
            } else { $notices.Add("Legacy deployment displayName ignored for $Mod; scoped only to brittany_missions.") }
        }
        if ($legacy.PSObject.Properties.Name -ccontains 'supportedVersion') {
            $metadata.supportedVersion = $legacy.supportedVersion
            $notices.Add("Legacy deployment supportedVersion compatibility override applies to $Mod; deprecated, use its tools/mods metadata when registered.")
        }
    }
    Test-ModMetadata $metadata $Mod
    if ($EmitNotice) { foreach ($notice in $notices) { Write-Warning $notice } }
    $metadata | Add-Member -NotePropertyName sourceId -NotePropertyValue $Mod -Force
    $metadata | Add-Member -NotePropertyName registered -NotePropertyValue ([bool]$registered) -Force
    $metadata | Add-Member -NotePropertyName compatibilityNotices -NotePropertyValue @($notices.ToArray()) -Force
    if (-not $registered) { $metadata.sourceMod = $null }
    return $metadata
}
function Get-DevelopmentDescriptor {
    param($Metadata)
    return "name=`"$($Metadata.developmentDisplayName)`"`nsupported_version=`"$($Metadata.supportedVersion)`"`n"
}
