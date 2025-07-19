-- ERHA OPS - MySQL Schema Fix Script
-- Option 2: Update database to match application expectations

USE erha_ops_v7;

-- Check current column type
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    CHARACTER_MAXIMUM_LENGTH,
    COLUMN_TYPE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_SCHEMA = 'erha_ops_v7' 
  AND TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'id';

-- If you want to change database to match application (OPTIONAL):
-- ALTER TABLE users MODIFY COLUMN id VARCHAR(36) NOT NULL;

-- Verify the change (if you ran the ALTER statement):
-- SELECT 
--     COLUMN_NAME, 
--     DATA_TYPE, 
--     CHARACTER_MAXIMUM_LENGTH,
--     COLUMN_TYPE
-- FROM INFORMATION_SCHEMA.COLUMNS 
-- WHERE TABLE_SCHEMA = 'erha_ops_v7' 
--   AND TABLE_NAME = 'users' 
--   AND COLUMN_NAME = 'id';