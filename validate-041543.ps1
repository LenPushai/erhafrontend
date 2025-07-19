# ================================================================
# VALIDATION SCRIPT - Run after deployment
# ================================================================

Write-Host "?? Testing Quote Management endpoints..." -ForegroundColor Cyan

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
        Write-Host "? $endpoint : $($response.StatusCode)" -ForegroundColor Green
        $success++
    } catch {
        Write-Host "? $endpoint : FAILED" -ForegroundColor Red
    }
}

$rate = ($success / $total) * 100
Write-Host "
?? Success Rate: $success/$total ($rate%)" -ForegroundColor 

if ($rate -ge 90) {
    Write-Host "?? QUOTE MANAGEMENT IS FULLY OPERATIONAL!" -ForegroundColor Green
} else {
    Write-Host "?? Some endpoints still need attention" -ForegroundColor Yellow
}
