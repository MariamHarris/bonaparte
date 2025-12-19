$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:3001'

Write-Host '1) Health'
$health = Invoke-RestMethod -Method Get -Uri "$base/api/health"
$health | ConvertTo-Json -Depth 5

Write-Host "`n2) Crear empresa (x-role: empresa)"
$companyResp = Invoke-RestMethod -Method Post -Uri "$base/api/companies" -Headers @{ 'x-role' = 'empresa' } -ContentType 'application/json' -Body (@{
  name = 'Empresa Demo'
  type = 'private'
} | ConvertTo-Json)
$companyId = $companyResp.company.id
Write-Host "companyId=$companyId"

Write-Host "`n3) Crear vacante (x-role: empresa)"
$vacancy = Invoke-RestMethod -Method Post -Uri "$base/api/vacancies" -Headers @{ 'x-role' = 'empresa' } -ContentType 'application/json' -Body (@{
  companyId = $companyId
  title = 'Vacante Demo'
} | ConvertTo-Json)
$vacancyId = $vacancy.id
Write-Host "vacancyId=$vacancyId"

Write-Host "`n4) Ver vacante (registra interacción)"
$vacancyRead = Invoke-RestMethod -Method Get -Uri "$base/api/vacancies/$vacancyId"
$vacancyRead | ConvertTo-Json -Depth 5

Write-Host "`n5) Ver interacciones (x-role: consultora)"
$interactions = Invoke-RestMethod -Method Get -Uri "$base/api/interactions" -Headers @{ 'x-role' = 'consultora' }
$interactions | ConvertTo-Json -Depth 5

Write-Host "`n6) Generar factura (x-role: consultora)"
$invoice = Invoke-RestMethod -Method Post -Uri "$base/api/invoices/generate" -Headers @{ 'x-role' = 'consultora' } -ContentType 'application/json' -Body (@{
  companyId = $companyId
  periodStart = '2025-01-01T00:00:00.000Z'
  periodEnd   = '2025-12-31T23:59:59.000Z'
  tollPerInteraction = 0.25
} | ConvertTo-Json)
$invoice | ConvertTo-Json -Depth 8

Write-Host "`nOK: Smoke test completado."