@echo off
echo Running Maven build without tests...
mvn clean install -DskipTests
echo.
echo Build complete! Now you can run the application:
echo mvn spring-boot:run
pause
