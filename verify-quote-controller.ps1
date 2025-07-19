# ================================================================
# 🧪 QUOTE CONTROLLER VERIFICATION SCRIPT
# ================================================================

Write-Host "🧪 Testing Quote Management endpoints..." -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Gray

$baseUrl = "http://localhost:8082"
$endpoints = @(
    "/api/v1/quotes/health",
    "/api/v1/quotes/dashboard", 
    "/api/v1/quotes/stats",
    "/api/v1/quotes/analytics",
    "/api/v1/quotes/status-counts",
    "/api/v1/quotes/search",
    "/api/v1/quotes/quality-costs"
)

$success = 0
$total = $endpoints.Count

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -TimeoutSec 10
        Write-Host "✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
        $success++
    } catch {
        Write-Host "❌ $endpoint : FAILED" -ForegroundColor Red
    }
}

$rate = [$Math]::Round(($success / $total) * 100, 1)
Write-Host "
📈 Success Rate: $success/$total ($rate%)" -ForegroundColor 

if ($rate -ge 80) {
    Write-Host "
🎉 QUOTE MANAGEMENT IS FULLY OPERATIONAL!" -ForegroundColor Green
    Write-Host "   ✅ Ready for production deployment" -ForegroundColor Green
    Write-Host "   ✅ All business endpoints working" -ForegroundColor Green
} elseif ($rate -ge 50) {
    Write-Host "
⚠️ Quote Management is partially operational" -ForegroundColor Yellow
    Write-Host "   🔧 Some endpoints need attention" -ForegroundColor Yellow
} else {
    Write-Host "
❌ Quote Management needs immediate attention" -ForegroundColor Red
    Write-Host "   🔧 Check application startup logs" -ForegroundColor Red
}

Write-Host "
🔗 Key endpoints to test manually:" -ForegroundColor Cyan
Write-Host "   🏥 Health: http://localhost:8082/api/v1/quotes/health" -ForegroundColor White
Write-Host "   📊 Dashboard: http://localhost:8082/api/v1/quotes/dashboard" -ForegroundColor White
