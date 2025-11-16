Write-Host "Running Spring Boot Diagnostics..." -ForegroundColor Cyan
Write-Host ""

# Check Java version
Write-Host "Java Version:" -ForegroundColor Yellow
java -version
Write-Host ""

# Check Maven version
Write-Host "Maven Version:" -ForegroundColor Yellow
mvn -version
Write-Host ""

# Check if MySQL is running
Write-Host "Checking MySQL service..." -ForegroundColor Yellow
$mysqlService = Get-Service -Name "MySQL*" -ErrorAction SilentlyContinue
if ($mysqlService) {
    Write-Host "  MySQL Service Status: $($mysqlService.Status)" -ForegroundColor Green
} else {
    Write-Host "  MySQL Service not found!" -ForegroundColor Red
}
Write-Host ""

# Check project structure
Write-Host "Project Structure:" -ForegroundColor Yellow
Write-Host "  Main Java: $(Test-Path 'src\main\java')" -ForegroundColor White
Write-Host "  Test Java: $(Test-Path 'src\test\java')" -ForegroundColor White
Write-Host "  Main Resources: $(Test-Path 'src\main\resources')" -ForegroundColor White
Write-Host "  Test Resources: $(Test-Path 'src\test\resources')" -ForegroundColor White
Write-Host "  pom.xml: $(Test-Path 'pom.xml')" -ForegroundColor White
Write-Host ""

# Check for application properties
Write-Host "Configuration Files:" -ForegroundColor Yellow
if (Test-Path "src\main\resources\application.properties") {
    Write-Host "  ✓ Main application.properties found" -ForegroundColor Green
} elseif (Test-Path "src\main\resources\application.yml") {
    Write-Host "  ✓ Main application.yml found" -ForegroundColor Green
} else {
    Write-Host "  ✗ No main application configuration found!" -ForegroundColor Red
}

if (Test-Path "src\test\resources\application.properties") {
    Write-Host "  ✓ Test application.properties found" -ForegroundColor Green
} else {
    Write-Host "  ✗ No test configuration found" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "Diagnostics complete!" -ForegroundColor Green
