@echo off
echo Cleaning project...
mvn clean
echo.
echo Building without tests...
mvn install -DskipTests
echo.
echo Starting application...
mvn spring-boot:run -DskipTests
pause
