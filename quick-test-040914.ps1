# ================================================================
# QUICK ENDPOINT VALIDATION AFTER FIX
# ================================================================

Write-Host "?? Testing corrected endpoints..." -ForegroundColor Cyan

$baseUrl = "http://localhost:8082"
$endpoints = @(
    "/api/v1/quotes/health",
    "/api/v1/quotes/dashboard", 
    "/api/v1/quotes/stats",
    "/api/v1/quotes/analytics"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$endpoint" -TimeoutSec 10
        Write-Host "? $endpoint : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "? $endpoint : FAILED" -ForegroundColor Red
    }
}

Write-Host "
?? Test completed!" -ForegroundColor Green
