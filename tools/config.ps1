# Matching deployment adapter for the PowerShell entry point (no Node required).
function Get-DeploymentConfig {
    $config = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'deployment/config.json') -Raw | ConvertFrom-Json
    $localConfig = Join-Path $PSScriptRoot 'deployment/config.local.json'
    if (Test-Path -LiteralPath $localConfig) {
        $overrides = Get-Content -LiteralPath $localConfig -Raw | ConvertFrom-Json
        foreach ($property in $overrides.PSObject.Properties) {
            $config | Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value -Force
        }
    }
    if ($env:EU4_USER_DIR) { $config.gameModDirectory = Join-Path $env:EU4_USER_DIR 'mod' }
    if (-not $config.gameModDirectory) {
        $documents = [Environment]::GetFolderPath('MyDocuments')
        $config.gameModDirectory = Join-Path $documents 'Paradox Interactive/Europa Universalis IV/mod'
    }
    return $config
}
