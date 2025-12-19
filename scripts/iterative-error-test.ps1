param(
  [int]$Iterations = 25,
  [string]$BaseUrl = "http://127.0.0.1:3001"
)

$ErrorActionPreference = 'Stop'

function Invoke-Json {
  param(
    [Parameter(Mandatory=$true)][ValidateSet('GET','POST','PUT','DELETE')][string]$Method,
    [Parameter(Mandatory=$true)][string]$Url,
    [object]$Body = $null,
    [hashtable]$Headers = @{}
  )

  $params = @{
    Method = $Method
    Uri = $Url
    Headers = $Headers
    TimeoutSec = 10
  }

  if ($Body -ne $null) {
    $params['ContentType'] = 'application/json'
    $params['Body'] = ($Body | ConvertTo-Json -Depth 8)
  }

  try {
    $resp = Invoke-RestMethod @params
    return [pscustomobject]@{ ok=$true; status=200; body=$resp }
  } catch {
    $status = $null
    $respBody = $null

    try {
      if ($_.Exception.Response) {
        $status = [int]$_.Exception.Response.StatusCode
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $respBody = $reader.ReadToEnd()
      }
    } catch {}

    return [pscustomobject]@{ ok=$false; status=$status; body=$respBody; error=$_.Exception.Message }
  }
}

Write-Host "--- Iterative Error Test ---"
Write-Host "BaseUrl: $BaseUrl"
Write-Host "Iterations: $Iterations"

$failures = @()

for ($i = 1; $i -le $Iterations; $i++) {
  Write-Host "\n[$i/$Iterations]" -ForegroundColor Cyan

  # 1) Health should be OK
  $h = Invoke-Json -Method GET -Url "$BaseUrl/api/health"
  if (-not $h.ok) {
    $failures += "health failed (status=$($h.status))"
    Write-Host "health: FAIL status=$($h.status)" -ForegroundColor Red
  } else {
    Write-Host "health: OK" -ForegroundColor Green
  }

  # 2) Login missing fields => 400
  $lm = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/login" -Body @{}
  if ($lm.status -ne 400) {
    $failures += "login missing fields expected 400 got $($lm.status)"
    Write-Host "login missing fields: FAIL got=$($lm.status)" -ForegroundColor Red
  } else {
    Write-Host "login missing fields: OK (400)" -ForegroundColor Green
  }

  # 3) Login wrong password => 401
  $lw = Invoke-Json -Method POST -Url "$BaseUrl/api/auth/login" -Body @{ username='consultora_demo'; password='wrong' }
  if ($lw.status -ne 401) {
    $failures += "login wrong password expected 401 got $($lw.status)"
    Write-Host "login wrong password: FAIL got=$($lw.status)" -ForegroundColor Red
  } else {
    Write-Host "login wrong password: OK (401)" -ForegroundColor Green
  }

  # 4) Vacancies list should return array (200)
  $v = Invoke-Json -Method GET -Url "$BaseUrl/api/vacancies"
  if (-not $v.ok) {
    $failures += "vacancies list failed (status=$($v.status))"
    Write-Host "vacancies list: FAIL status=$($v.status)" -ForegroundColor Red
  } else {
    $count = 0
    try { $count = @($v.body).Count } catch {}
    Write-Host "vacancies list: OK (count=$count)" -ForegroundColor Green
  }

  # 5) Vacancy detail invalid id should be 404 (or at least not 500)
  $vd = Invoke-Json -Method GET -Url "$BaseUrl/api/vacancies/not-a-real-id"
  if ($vd.status -eq 500 -or $vd.status -eq 0 -or $vd.status -eq $null) {
    $failures += "vacancy detail invalid id returned $($vd.status)"
    Write-Host "vacancy detail invalid id: FAIL status=$($vd.status)" -ForegroundColor Red
  } else {
    Write-Host "vacancy detail invalid id: OK (status=$($vd.status))" -ForegroundColor Green
  }

  Start-Sleep -Milliseconds 150
}

Write-Host "\n--- Summary ---" -ForegroundColor Yellow
if ($failures.Count -eq 0) {
  Write-Host "All checks passed." -ForegroundColor Green
  exit 0
}

$failures | Group-Object | Sort-Object Count -Descending | ForEach-Object {
  Write-Host ("{0}x {1}" -f $_.Count, $_.Name) -ForegroundColor Red
}

exit 1
