$ErrorActionPreference = 'Stop'

$base = 'http://127.0.0.1:3001'
$suffix = [guid]::NewGuid().ToString('N').Substring(0,8)
$consultoraUsername = "consultora_demo_$suffix"
$empresaUsername = "empresa_demo_$suffix"

Write-Host '1) Health'
$health = Invoke-RestMethod -Method Get -Uri "$base/api/health"
$health | ConvertTo-Json -Depth 5

Write-Host "`n2) Registrar consultora (JWT)"
$consultora = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register/consultora" -ContentType 'application/json' -Body (@{
  username = $consultoraUsername
  password = 'demo123'
} | ConvertTo-Json)
$consultoraToken = $consultora.token
Write-Host "consultoraToken=OK"

Write-Host "`n3) Registrar empresa + compañía (JWT)"
$companyResp = Invoke-RestMethod -Method Post -Uri "$base/api/auth/register/company" -ContentType 'application/json' -Body (@{
  username = $empresaUsername
  password = 'demo123'
  company = @{
    name = 'Empresa Demo'
    type = 'private'
    email = 'demo@empresa.com'
    phone = '0000-0000'
    address = 'Chiriquí'
  }
} | ConvertTo-Json -Depth 6)
$empresaToken = $companyResp.token
$companyId = $companyResp.company.id
Write-Host "companyId=$companyId"

Write-Host "`n4) Crear vacante (JWT empresa)"
$vacancy = Invoke-RestMethod -Method Post -Uri "$base/api/vacancies" -Headers @{ 'Authorization' = "Bearer $empresaToken" } -ContentType 'application/json' -Body (@{
  companyId = $companyId
  title = 'Vacante Demo'
  description = 'Demo'
  location = 'Chiriquí'
  salary = 'N/A'
} | ConvertTo-Json)
$vacancyId = $vacancy.id
Write-Host "vacancyId=$vacancyId"

Write-Host "`n5) Ver vacante (registra interacción)"
$vacancyRead = Invoke-RestMethod -Method Get -Uri "$base/api/vacancies/$vacancyId"
$vacancyRead | ConvertTo-Json -Depth 5

Write-Host "`n5.1) Chatbot (registra interacción por chat)"
$chat = Invoke-RestMethod -Method Post -Uri "$base/api/chatbot/ask" -ContentType 'application/json' -Body (@{
  message = '¿Qué es el peaje y cómo se factura?'
  vacancyId = $vacancyId
} | ConvertTo-Json)
$chat | ConvertTo-Json -Depth 6

Write-Host "`n6) Ver interacciones (JWT consultora)"
$interactions = Invoke-RestMethod -Method Get -Uri "$base/api/interactions" -Headers @{ 'Authorization' = "Bearer $consultoraToken" }
$interactions | ConvertTo-Json -Depth 5

Write-Host "`n6.1) Estadísticas (consultora -> empresa)"
$statsCompany = Invoke-RestMethod -Method Get -Uri "$base/api/stats/consultora?companyId=$companyId" -Headers @{ 'Authorization' = "Bearer $consultoraToken" }
$statsCompany | ConvertTo-Json -Depth 7

Write-Host "`n7) Generar factura (JWT consultora)"
$invoice = Invoke-RestMethod -Method Post -Uri "$base/api/invoices/generate" -Headers @{ 'Authorization' = "Bearer $consultoraToken" } -ContentType 'application/json' -Body (@{
  companyId = $companyId
  periodStart = '2025-01-01T00:00:00.000Z'
  periodEnd   = '2025-12-31T23:59:59.000Z'
  tollPerInteraction = 0.25
} | ConvertTo-Json)
$invoice | ConvertTo-Json -Depth 8

if (-not $invoice.file.publicUrl) {
  throw 'No se devolvió publicUrl de factura'
}
Write-Host "Factura URL: $($invoice.file.publicUrl)"

Write-Host "`nOK: Smoke test completado."