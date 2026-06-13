$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$python = Join-Path $root ".venv\Scripts\python.exe"

if (-not (Test-Path $python)) {
  throw "Ambiente virtual nao encontrado em .venv. Rode: python -m venv .venv; .\.venv\Scripts\python.exe -m pip install -r requirements.txt"
}

$ip = (
  Get-NetIPConfiguration |
    Where-Object { $_.IPv4DefaultGateway -and $_.NetAdapter.Status -eq "Up" -and $_.IPv4Address.IPAddress -notlike "169.254.*" } |
    Select-Object -First 1 -ExpandProperty IPv4Address
).IPAddress

if (-not $ip) {
  $ip = (
    Get-NetIPAddress -AddressFamily IPv4 |
      Where-Object { $_.IPAddress -notlike "127.*" -and $_.IPAddress -notlike "169.254.*" } |
      Select-Object -First 1 -ExpandProperty IPAddress
  )
}

if (-not $ip) {
  throw "Nao consegui detectar o IPv4 da rede local."
}

$env:HOST = "0.0.0.0"
$env:REACT_APP_API_URL = "http://$ip`:8000"
$env:REACT_APP_PUBLIC_BASE_URL = "http://$ip`:3000"

Write-Host ""
Write-Host "EH Brewing LAN"
Write-Host "Frontend: $env:REACT_APP_PUBLIC_BASE_URL"
Write-Host "Backend:  $env:REACT_APP_API_URL"
Write-Host "QR Codes vao apontar para: $env:REACT_APP_PUBLIC_BASE_URL/fermentacoes/:id"
Write-Host ""

$backend = Start-Process `
  -WindowStyle Hidden `
  -FilePath $python `
  -ArgumentList @("-m", "uvicorn", "app.main:app", "--app-dir", "backend", "--host", "0.0.0.0", "--port", "8000") `
  -WorkingDirectory $root `
  -PassThru

try {
  npm start
}
finally {
  if ($backend -and -not $backend.HasExited) {
    Stop-Process -Id $backend.Id
  }
}
