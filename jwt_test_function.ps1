function Test-JWTLogin {
    try {
        $body = '{"username":"jwttest3","password":"password"}'
        $response = Invoke-RestMethod -Uri "https://erhauatdev7000.onrender.com/api/auth/login" -Method POST -Body $body -ContentType "application/json"
        Write-Host "🎉 SUCCESS! JWT TOKEN ACQUIRED!" -ForegroundColor Green
        Write-Host "Token: $($response.token)" -ForegroundColor Yellow
        return $true
    } catch {
        Write-Host "❌ Still failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}