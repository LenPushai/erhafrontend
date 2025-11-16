@echo off
echo Setting up ERHA Job Service MySQL Database...
echo.
echo Please enter your MySQL root password when prompted
echo.
mysql -u root -p < job-service-mysql-schema.sql
echo.
echo Database setup complete!
echo.
echo You can now run: mvn clean test
echo Then run: mvn spring-boot:run
pause
