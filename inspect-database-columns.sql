-- ERHA OPS - Database Column Inspection
-- Check all columns in users table to see their actual types

USE erha_ops_v7;

SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    COLUMN_TYPE,
    IS_NULLABLE,
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'erha_ops_v7' 
  AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;