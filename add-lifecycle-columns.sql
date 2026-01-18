-- Run this in Supabase SQL Editor to add any missing columns
-- PUSH AI Foundation - Proverbs 16:3

-- Quote fields
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS quote_number VARCHAR(50);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS quote_value_excl_vat DECIMAL(15,2);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS quote_status VARCHAR(50);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS valid_until DATE;

-- Order fields
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS order_date DATE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS po_number VARCHAR(50);

-- Invoice fields
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS invoice_date DATE;
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS invoice_value DECIMAL(15,2);
ALTER TABLE rfqs ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50);

-- Verify
SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'rfqs' ORDER BY ordinal_position;