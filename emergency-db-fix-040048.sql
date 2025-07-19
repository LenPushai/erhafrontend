-- ================================================================
-- EMERGENCY DATABASE FIXES FOR QUOTE MANAGEMENT
-- Execute immediately to resolve schema conflicts
-- ================================================================

-- Step 1: Backup existing data
CREATE TABLE quotes_backup AS SELECT * FROM quotes;

-- Step 2: Fix JSONB issue - convert to TEXT for MySQL compatibility
ALTER TABLE quotes DROP COLUMN IF EXISTS metadata;
ALTER TABLE quotes ADD COLUMN metadata TEXT;

-- Step 3: Clean up ENUM conflicts
-- First, check what invalid data exists
SELECT id, status, quality_level FROM quotes 
WHERE status NOT IN ('DRAFT','PENDING_REVIEW','PENDING_QUALITY_REVIEW','PENDING_SAFETY_REVIEW','PENDING_APPROVAL','APPROVED','SENT','SENT_TO_CLIENT','VIEWED','UNDER_NEGOTIATION','ACCEPTED','REJECTED','EXPIRED','CONVERTED_TO_CONTRACT','CANCELLED')
OR quality_level NOT IN ('STANDARD','ENHANCED','PREMIUM');

-- Step 4: Fix invalid status values
UPDATE quotes SET status = 'DRAFT' 
WHERE status NOT IN ('DRAFT','PENDING_REVIEW','PENDING_QUALITY_REVIEW','PENDING_SAFETY_REVIEW','PENDING_APPROVAL','APPROVED','SENT','SENT_TO_CLIENT','VIEWED','UNDER_NEGOTIATION','ACCEPTED','REJECTED','EXPIRED','CONVERTED_TO_CONTRACT','CANCELLED');

-- Step 5: Fix invalid quality_level values
UPDATE quotes SET quality_level = 'STANDARD' 
WHERE quality_level NOT IN ('STANDARD','ENHANCED','PREMIUM') OR quality_level IS NULL;

-- Step 6: Ensure all required fields have defaults
UPDATE quotes SET 
    status = 'DRAFT' WHERE status IS NULL,
    quality_level = 'STANDARD' WHERE quality_level IS NULL,
    total_amount = 0.00 WHERE total_amount IS NULL,
    quality_cost = 0.00 WHERE quality_cost IS NULL,
    safety_cost = 0.00 WHERE safety_cost IS NULL,
    risk_factor = 1.00 WHERE risk_factor IS NULL,
    iso9001_required = false WHERE iso9001_required IS NULL,
    created_at = NOW() WHERE created_at IS NULL;

-- Step 7: Create sample data for testing
INSERT INTO quotes (
    quote_number, client_name, client_email, project_description, 
    status, quality_level, total_amount, quality_cost, safety_cost, 
    risk_factor, created_by, created_at, valid_until
) VALUES 
('QTE-2025-001', 'ACME Construction', 'contact@acme.com', 'Steel framework fabrication for warehouse project', 'DRAFT', 'STANDARD', 125000.00, 5000.00, 3000.00, 1.2, 'system', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('QTE-2025-002', 'BuildTech Ltd', 'admin@buildtech.com', 'Custom pipe welding for industrial plant', 'PENDING_REVIEW', 'ENHANCED', 75000.00, 7500.00, 4000.00, 1.5, 'system', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('QTE-2025-003', 'Metro Infrastructure', 'procurement@metro.com', 'Bridge component manufacturing', 'APPROVED', 'PREMIUM', 250000.00, 15000.00, 8000.00, 1.8, 'system', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('QTE-2025-004', 'Industrial Solutions', 'quotes@industrial.com', 'Safety equipment fabrication', 'SENT_TO_CLIENT', 'ENHANCED', 95000.00, 9500.00, 6000.00, 1.3, 'system', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('QTE-2025-005', 'Construction Partners', 'info@partners.com', 'Structural steel for office building', 'UNDER_NEGOTIATION', 'STANDARD', 180000.00, 8000.00, 5000.00, 1.4, 'system', NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY));

-- Step 8: Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quality_level ON quotes(quality_level);
CREATE INDEX IF NOT EXISTS idx_quotes_client_name ON quotes(client_name);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_total_amount ON quotes(total_amount);

-- Verification
SELECT 'Quote count' as metric, COUNT(*) as value FROM quotes
UNION ALL
SELECT 'Status distribution', CONCAT(status, ': ', COUNT(*)) FROM quotes GROUP BY status
UNION ALL
SELECT 'Quality levels', CONCAT(quality_level, ': ', COUNT(*)) FROM quotes GROUP BY quality_level;
