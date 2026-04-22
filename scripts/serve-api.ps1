$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

if (Test-Path ".env") {
  Get-Content ".env" | ForEach-Object {
    if (-not $_ -or $_ -match "^\s*#" -or $_ -notmatch "=") {
      return
    }

    $name, $value = $_.Split("=", 2)
    [Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
  }
}

if (-not $env:PORT) {
  $env:PORT = "8080"
}

& node ".\artifacts\api-server\dist\index.mjs"
