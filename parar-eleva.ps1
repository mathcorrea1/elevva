$ErrorActionPreference = 'Stop'
$workspace = [IO.Path]::GetFullPath($PSScriptRoot)
$statePath = Join-Path $workspace '.eleva-local\processos.json'
if (-not (Test-Path -LiteralPath $statePath)) { Write-Host 'Nenhum processo registrado pelo iniciador.'; exit 0 }
function Expand-ProcessRecords($record) {
  if ($null -eq $record) { return }
  if ($record -is [Array]) { foreach ($item in $record) { Expand-ProcessRecords $item }; return }
  if ($record.PSObject.Properties['value'] -and -not $record.PSObject.Properties['name']) { Expand-ProcessRecords $record.value; return }
  if ($record.PSObject.Properties['name'] -and $record.PSObject.Properties['pid']) { $record }
}
$entries = @(Expand-ProcessRecords (Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json))
function Stop-TrackedTree([int]$processId) {
  $children = @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$processId" -ErrorAction SilentlyContinue)
  foreach ($child in $children) { Stop-TrackedTree ([int]$child.ProcessId) }
  Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
}
foreach ($entry in $entries) {
  if (-not $entry.name -or -not $entry.start -or [int]$entry.pid -le 0) { continue }
  $process = Get-Process -Id $entry.pid -ErrorAction SilentlyContinue
  if (-not $process) { continue }
  $command = Get-CimInstance Win32_Process -Filter "ProcessId=$($entry.pid)"
  if (-not $process.StartTime -or -not $command.CommandLine -or $process.StartTime.ToUniversalTime().ToString('o') -ne $entry.start -or -not $command.CommandLine.Contains($workspace)) {
    Write-Host "Processo $($entry.pid) nao corresponde ao Eleva registrado; preservado."
    continue
  }
  Stop-TrackedTree ([int]$entry.pid)
  Write-Host "$($entry.name) encerrado."
}
