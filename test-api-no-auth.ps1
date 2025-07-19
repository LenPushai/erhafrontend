# Quick API Test - No Authentication Required
$baseUrl = "http://localhost:8082/api/v1/quotes"
$headers = @{"Content-Type" = "application/json"}

Write-Host "🧪 Testing ERHA OPS API (No Auth Required)..." -ForegroundColor Cyan

# Test 1: Health Check
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8082/api/v1/actuator/health" -Method GET
    Write-Host "✅ Health Check: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: List Quotes
try {
    $response = Invoke-WebRequest -Uri "$baseUrl?page=0&size=5" -Method GET -Headers $headers
    Write-Host "✅ List Quotes: Status $($response.StatusCode)" -ForegroundColor Green
    $data = $response.Content | ConvertFrom-Json
    Write-Host "📊 Found $($data.totalElements) quotes" -ForegroundColor Cyan
} catch {
    Write-Host "❌ List Quotes Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Dashboard
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/dashboard" -Method GET -Headers $headers
    Write-Host "✅ Dashboard: Status $($response.StatusCode)" -ForegroundColor Green
    $dashboard = $response.Content | ConvertFrom-Json
    Write-Host "💰 Total Value: R$($dashboard.totalValue)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Dashboard Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Green
Write-Host "🌐 Swagger UI: http://localhost:8082/api/v1/swagger-ui.html" -ForegroundColor Yellow
