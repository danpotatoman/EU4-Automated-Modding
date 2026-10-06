# Optional recovery/update command. Normal validation never accesses the network.
$ErrorActionPreference = 'Stop'
$archive = Join-Path $PSScriptRoot 'rules.zip'
$destination = Join-Path $PSScriptRoot ('rules-download/snapshot-' + [guid]::NewGuid().ToString('N'))
Invoke-WebRequest -Uri 'https://codeload.github.com/cwtools/cwtools-eu4-config/zip/refs/heads/master' -OutFile $archive
Expand-Archive -LiteralPath $archive -DestinationPath $destination -Force
$rules = Join-Path $destination 'cwtools-eu4-config-master'
if (-not (Test-Path -LiteralPath (Join-Path $rules 'effects.cwt'))) {
    throw 'The downloaded EU4 rule snapshot is incomplete; configuration was not changed.'
}
$configPath = Join-Path $PSScriptRoot 'config.local.json'
$config = if (Test-Path -LiteralPath $configPath) { Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json } else { [pscustomobject]@{} }
$config | Add-Member -NotePropertyName rulesPath -NotePropertyValue $rules -Force
[System.IO.File]::WriteAllText($configPath, ($config | ConvertTo-Json -Depth 10), [System.Text.UTF8Encoding]::new($false))
Write-Output 'CWTools EU4 rules downloaded. You can now run tools/validate-cwtools.ps1.'
