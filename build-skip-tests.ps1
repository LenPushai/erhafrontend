# ERHA OPS - Build without running tests
Write-Host "?? Building ERHA OPS without running tests..." -ForegroundColor Yellow

# Skip tests during build
mvn clean compile -DskipTests

# Or if you want to compile tests but not run them
# mvn clean test-compile -DskipTests

Write-Host "? Build completed (tests skipped)" -ForegroundColor Green
Write-Host "?? Now you can run: mvn spring-boot:run" -ForegroundColor Cyan