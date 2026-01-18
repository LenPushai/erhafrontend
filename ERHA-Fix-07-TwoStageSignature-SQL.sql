-- Add signature_stage column to signature_tokens table
ALTER TABLE signature_tokens 
ADD COLUMN IF NOT EXISTS signature_stage VARCHAR(20) DEFAULT 'client';

-- Add signature_stage column to quote_signatures table  
ALTER TABLE quote_signatures 
ADD COLUMN IF NOT EXISTS signature_stage VARCHAR(20) DEFAULT 'client';

-- Add manager signature tracking to rfqs table
ALTER TABLE rfqs 
ADD COLUMN IF NOT EXISTS manager_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS manager_signed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS client_signed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS client_signed_by VARCHAR(255);

-- Verify changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('signature_tokens', 'quote_signatures', 'rfqs')
AND column_name IN ('signature_stage', 'manager_signed_at', 'manager_signed_by', 'client_signed_at', 'client_signed_by')
ORDER BY table_name, column_name;
