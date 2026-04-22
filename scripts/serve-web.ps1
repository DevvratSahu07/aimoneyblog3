$root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Set-Location $root

if (-not $env:PORT) {
  $env:PORT = "5173"
}

if (-not $env:API_PORT) {
  $env:API_PORT = "8080"
}

$vitePath = ".\node_modules\.pnpm\vite@7.3.2_@types+node@25.3_d5269a53d302b42e602832b0eaecec0c\node_modules\vite\bin\vite.js"

& node $vitePath --config ".\artifacts\ai-money-blog\vite.config.ts" --host 0.0.0.0
