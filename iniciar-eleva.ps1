[CmdletBinding()]
param([switch]$SemSeed)
$ErrorActionPreference = 'Stop'
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
$workspace = $PSScriptRoot
$runtimeDir = Join-Path $workspace '.eleva-local'
New-Item -ItemType Directory -Path $runtimeDir -Force | Out-Null
$statePath = Join-Path $runtimeDir 'processos.json'
$tracked = @()
function Expand-ProcessRecords($record) {
  if ($null -eq $record) { return }
  if ($record -is [Array]) { foreach ($item in $record) { Expand-ProcessRecords $item }; return }
  if ($record.PSObject.Properties['value'] -and -not $record.PSObject.Properties['name']) { Expand-ProcessRecords $record.value; return }
  if ($record.PSObject.Properties['name'] -and $record.PSObject.Properties['pid']) { $record }
}
if (Test-Path -LiteralPath $statePath) { $tracked = @(Expand-ProcessRecords (Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json)) }
$pythonExe = Join-Path $workspace 'backend\.venv\Scripts\python.exe'
$nodeExe = (Get-Command node -ErrorAction Stop).Source
foreach ($relative in @('backend\.venv\Scripts\python.exe', 'identity\node_modules\better-auth', 'alfabeta\node_modules\expo\bin\cli')) {
  if (-not (Test-Path -LiteralPath (Join-Path $workspace $relative))) {
    throw "Dependencia ausente: $relative. Consulte DESENVOLVIMENTO.md para instalar."
  }
}
$identityEnv = Join-Path $workspace 'identity\.env'
if (-not (Test-Path -LiteralPath $identityEnv)) {
  $bytes = New-Object byte[] 48
  $rng = [Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  $identityTemplate = Get-Content -LiteralPath (Join-Path $workspace 'identity\.env.example') -Raw
  $identityTemplate.Replace('BETTER_AUTH_SECRET=', ('BETTER_AUTH_SECRET=' + [Convert]::ToBase64String($bytes))) | Set-Content -LiteralPath $identityEnv -Encoding UTF8
}
if (-not (Test-Path -LiteralPath (Join-Path $workspace 'backend\.env'))) {
  Copy-Item -LiteralPath (Join-Path $workspace 'backend\.env.example') -Destination (Join-Path $workspace 'backend\.env')
}
if (-not (Test-Path -LiteralPath (Join-Path $workspace 'alfabeta\.env.local'))) {
  @('EXPO_PUBLIC_API_URL=http://localhost:8100', 'EXPO_PUBLIC_AUTH_URL=http://localhost:3001') | Set-Content -LiteralPath (Join-Path $workspace 'alfabeta\.env.local') -Encoding UTF8
}
function Run-Checked([string]$directory, [string]$program, [string[]]$arguments) {
  Push-Location $directory
  try { & $program @arguments; if ($LASTEXITCODE -ne 0) { throw "Falhou em $directory. Codigo: $LASTEXITCODE" } }
  finally { Pop-Location }
}
function Read-Health([string]$url) {
  try { return Invoke-RestMethod -Uri $url -TimeoutSec 3 } catch { return $null }
}
function Start-ElevaService([string]$name, [int]$port, [string]$url, [string]$marker, [string]$directory, [string]$program, [string[]]$arguments) {
  $healthy = Read-Health $url
  if ($healthy -and $healthy.service -eq $marker) {
    if ($name -ne 'web' -and ($healthy.database -ne 'sqlite' -or $healthy.environment -ne 'development')) {
      throw "O servico $name nao e o ambiente local de desenvolvimento. Nenhum seed foi aplicado."
    }
    Write-Host "$name ja esta pronto na porta $port."
    return
  }
  if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
    throw "Porta $port ocupada por outro servico. Nenhum processo alheio foi encerrado."
  }
  $stamp = Get-Date -Format 'yyyyMMdd-HHmmss-fff'
  $log = Join-Path $runtimeDir "$name-$stamp"
  $process = Start-Process -FilePath $program -ArgumentList $arguments -WorkingDirectory $directory -WindowStyle Hidden -PassThru -RedirectStandardOutput "$log.out.log" -RedirectStandardError "$log.err.log"
  $script:tracked = @($script:tracked | Where-Object { $_.name -ne $name }) + @([pscustomobject]@{name=$name; pid=$process.Id; start=$process.StartTime.ToUniversalTime().ToString('o'); log=$log})
  $script:tracked | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath $statePath -Encoding UTF8
  for ($attempt=0; $attempt -lt 90; $attempt++) {
    $healthy = Read-Health $url
    if ($healthy -and $healthy.service -eq $marker) { Write-Host "$name pronto na porta $port."; return }
    if ($process.HasExited) { throw "$name encerrou. Consulte $log.err.log" }
    Start-Sleep -Seconds 1
  }
  throw "$name ainda nao respondeu. Consulte $log.err.log"
}
Write-Host 'Preparando Eleva local. Nenhuma nuvem ou banco remoto sera alterado.'
Run-Checked (Join-Path $workspace 'backend') $pythonExe @('-m','scripts.prepare_local')
Run-Checked (Join-Path $workspace 'identity') 'npm.cmd' @('run','migrate:local')
$identityScript = '"' + (Join-Path $workspace 'identity\server.mjs') + '"'
Start-ElevaService 'identity' 3001 'http://localhost:3001/__eleva/health' 'eleva-identity' (Join-Path $workspace 'identity') $nodeExe @('--env-file-if-exists=.env',$identityScript)
Start-ElevaService 'api' 8100 'http://localhost:8100/health/ready' 'eleva-api' (Join-Path $workspace 'backend') $pythonExe @('-m','uvicorn','app.main:app','--host','127.0.0.1','--port','8100','--reload','--reload-dir','app')
if (-not $SemSeed) { Run-Checked (Join-Path $workspace 'backend') $pythonExe @('-m','scripts.seed_review','--local-development') }
$expoCli = '"' + (Join-Path $workspace 'alfabeta\node_modules\expo\bin\cli') + '"'
Start-ElevaService 'web' 8081 'http://localhost:8081/eleva-runtime.json' 'eleva-web' (Join-Path $workspace 'alfabeta') $nodeExe @($expoCli,'start','--web','--port','8081','--localhost')
Write-Host ''
Write-Host 'Eleva pronto: http://localhost:8081' -ForegroundColor Green
Write-Host 'Acessos: identity\ACESSOS-TESTE.local.md'
Write-Host 'Logs: .eleva-local. Para parar: .\parar-eleva.ps1'
