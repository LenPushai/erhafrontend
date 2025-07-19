# ERHA OPS - Test Authentication System
Write-Host "?? ERHA OPS - Testing Authentication System" -ForegroundColor Green

Write-Host "1. Testing basic connectivity..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/test" -Method GET
    Write-Host "  ? API Test: $response" -ForegroundColor Green
} catch {
    Write-Host "  ? API Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "2. Testing admin login..." -ForegroundColor Cyan
$loginBody = @{
    username = "admin"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "  ? Admin Login Success!" -ForegroundColor Green
    Write-Host "  ?? Token: $($loginResponse.token.Substring(0,20))..." -ForegroundColor Gray
    Write-Host "  ?? User ID: $($loginResponse.id)" -ForegroundColor Gray
    Write-Host "  ?? Role: $($loginResponse.role)" -ForegroundColor Gray
} catch {
    Write-Host "  ? Admin Login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "  ?? Make sure admin user is created in database" -ForegroundColor Yellow
}

Write-Host "3. Testing user registration..." -ForegroundColor Cyan
$registerBody = @{
    username = "testuser"
    email = "test@erha-ops.com"
    password = "testpass123"
    firstName = "Test"
    lastName = "User"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "  ? User Registration Success!" -ForegroundColor Green
    Write-Host "  ?? New User ID: $($registerResponse.id)" -ForegroundColor Gray
} catch {
    Write-Host "  ? User Registration failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "?? Test completed!" -ForegroundColor Green