-- Quick database status check
SELECT 'quotes_table_exists' as check_name, 
       CASE WHEN COUNT(*) > 0 THEN 'EXISTS' ELSE 'MISSING' END as status
FROM information_schema.tables 
WHERE table_name = 'quotes';

SELECT 'quote_count' as check_name, COUNT(*) as status FROM quotes;

SELECT 'status_values' as check_name, 
       GROUP_CONCAT(DISTINCT status) as status 
FROM quotes;

SELECT 'quality_levels' as check_name, 
       GROUP_CONCAT(DISTINCT quality_level) as status 
FROM quotes;
