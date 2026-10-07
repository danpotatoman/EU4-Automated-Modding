# Matching deployment adapter for the PowerShell entry point (no Node required).
function Get-DeploymentConfig {
    param([string]$Root = (Split-Path $PSScriptRoot -Parent))
    $config = Get-Content -LiteralPath (Join-Path $Root 'tools/deployment/config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
    $localConfig = Join-Path $Root 'tools/deployment/config.local.json'
    if (Test-Path -LiteralPath $localConfig) {
        $overrides = Get-Content -LiteralPath $localConfig -Raw -Encoding UTF8 | ConvertFrom-Json
        foreach ($property in $overrides.PSObject.Properties) {
            $config | Add-Member -NotePropertyName $property.Name -NotePropertyValue $property.Value -Force
        }
    }
    # Descriptor compatibility fields are owned/interpreted by Get-ModConfig only.
    $config.PSObject.Properties.Remove('displayName')
    $config.PSObject.Properties.Remove('supportedVersion')
    if ($env:EU4_USER_DIR) { $config.gameModDirectory = Join-Path $env:EU4_USER_DIR 'mod' }
    if (-not $config.gameModDirectory) {
        $documents = [Environment]::GetFolderPath('MyDocuments')
        $config.gameModDirectory = Join-Path $documents 'Paradox Interactive/Europa Universalis IV/mod'
    }
    return $config
}
