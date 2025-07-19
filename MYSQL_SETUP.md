# ERHA OPS v7.0 - MySQL Database Setup Instructions

## 1. Create Database
Connect to MySQL as root and create the database:

```sql
CREATE DATABASE erha_ops_v7 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON erha_ops_v7.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

## 2. Run Initialization Script
Execute the initialization script:

```bash
mysql -u root -pSpeedy01 erha_ops_v7 < scripts/mysql_init.sql
```

## 3. Verify Setup
Check that tables were created:

```sql
USE erha_ops_v7;
SHOW TABLES;
```

## 4. Start Application
```bash
mvn spring-boot:run
```

## 5. Test Endpoints
- Health Check: http://localhost:8082/api/v1/actuator/health
- Quotes API: http://localhost:8082/api/v1/quotes

## Database Connection Details
- Host: localhost:3306
- Database: erha_ops_v7
- Username: root
- Password: Speedy01
- Timezone: Africa/Johannesburg
