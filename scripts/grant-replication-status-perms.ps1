$ErrorActionPreference = 'Stop'

function Get-DotEnvValue([string]$Path, [string]$Key) {
  if (-not (Test-Path $Path)) { return $null }
  $line = Get-Content $Path | Where-Object { $_ -match "^\s*$Key\s*=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -split '=', 2)[1].Trim()
}

$envPath = Join-Path $PSScriptRoot '..' '.env'
$mysqlUser = Get-DotEnvValue $envPath 'MYSQL_USER'
$mysqlPassword = Get-DotEnvValue $envPath 'MYSQL_PASSWORD'

if (-not $mysqlUser) { throw "MYSQL_USER not found in $envPath" }
if (-not $mysqlPassword) { throw "MYSQL_PASSWORD not found in $envPath" }

$containers = @('bonaparte-mysql-external', 'bonaparte-mysql-internal')
$sql = "GRANT REPLICATION CLIENT ON *.* TO '$mysqlUser'@'%'; FLUSH PRIVILEGES;"

foreach ($c in $containers) {
  Write-Host "Granting REPLICATION CLIENT on $c for user '$mysqlUser'..."
  docker exec -i $c mysql -uroot -p$mysqlPassword -e $sql | Out-Host
}

Write-Host 'OK: permisos aplicados. Ahora /api/replication/status debe mostrar lag/IO/SQL.'
