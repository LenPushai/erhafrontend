-- ================================================================
-- ERHA OPS DATABASE SCHEMA FIXES
-- Generated: 2025-07-20 03:54:36
-- ================================================================

-- Fix 1: Clean up existing data that conflicts with ENUM changes
-- ================================================================
-- Step 1: Check current data in quotes table
SELECT id, status, quality_level FROM quotes WHERE status NOT IN (
    'DRAFT', 'PENDING_REVIEW', 'PENDING_QUALITY_REVIEW', 'PENDING_SAFETY_REVIEW', 
    'PENDING_APPROVAL', 'APPROVED', 'SENT', 'SENT_TO_CLIENT', 'VIEWED', 
    'UNDER_NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 
    'CONVERTED_TO_CONTRACT', 'CANCELLED'
);

-- Step 2: Update invalid status values to DRAFT
UPDATE quotes SET status = 'DRAFT' WHERE status NOT IN (
    'DRAFT', 'PENDING_REVIEW', 'PENDING_QUALITY_REVIEW', 'PENDING_SAFETY_REVIEW', 
    'PENDING_APPROVAL', 'APPROVED', 'SENT', 'SENT_TO_CLIENT', 'VIEWED', 
    'UNDER_NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 
    'CONVERTED_TO_CONTRACT', 'CANCELLED'
);

-- Step 3: Update invalid quality_level values to STANDARD
UPDATE quotes SET quality_level = 'STANDARD' WHERE quality_level NOT IN (
    'STANDARD', 'ENHANCED', 'PREMIUM'
);

-- Fix 2: Alternative MySQL-compatible schema modifications
-- ================================================================
-- Instead of JSONB (PostgreSQL), use TEXT for JSON data
ALTER TABLE quotes MODIFY COLUMN quality_requirements TEXT;
ALTER TABLE quotes MODIFY COLUMN safety_considerations TEXT;
ALTER TABLE quotes MODIFY COLUMN compliance_notes TEXT;
ALTER TABLE quotes MODIFY COLUMN risk_assessment TEXT;

-- Fix 3: Ensure proper ENUM definitions (run after data cleanup)
-- ================================================================
-- These should be run AFTER the data cleanup above
-- ALTER TABLE quotes MODIFY COLUMN status ENUM(
--     'DRAFT', 'PENDING_REVIEW', 'PENDING_QUALITY_REVIEW', 'PENDING_SAFETY_REVIEW', 
--     'PENDING_APPROVAL', 'APPROVED', 'SENT', 'SENT_TO_CLIENT', 'VIEWED', 
--     'UNDER_NEGOTIATION', 'ACCEPTED', 'REJECTED', 'EXPIRED', 
--     'CONVERTED_TO_CONTRACT', 'CANCELLED'
-- ) NOT NULL DEFAULT 'DRAFT';

-- ALTER TABLE quotes MODIFY COLUMN quality_level ENUM(
--     'STANDARD', 'ENHANCED', 'PREMIUM'
-- ) DEFAULT 'STANDARD';

-- Fix 4: Add indexes for better performance
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_quality_level ON quotes(quality_level);
CREATE INDEX IF NOT EXISTS idx_quotes_client_name ON quotes(client_name);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);

-- Verification queries
-- ================================================================
SELECT 'Status distribution' as info, status, COUNT(*) as count FROM quotes GROUP BY status;
SELECT 'Quality level distribution' as info, quality_level, COUNT(*) as count FROM quotes GROUP BY quality_level;
SELECT 'Total quotes' as info, COUNT(*) as count FROM quotes;
