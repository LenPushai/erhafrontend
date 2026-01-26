-- Run this in Supabase SQL Editor to add missing Job Card columns
-- ================================================================

-- Add missing columns to jobs table if they don't exist
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assigned_employee_id UUID REFERENCES workers(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assigned_employee_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assigned_supervisor_id UUID REFERENCES workers(id);
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS assigned_supervisor_name TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS site_req TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS has_drawing BOOLEAN DEFAULT false;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS attached_documents TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS supervisor_signature TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS supervisor_signed_at TIMESTAMPTZ;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employee_signature TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS employee_signed_at TIMESTAMPTZ;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'jobs' 
AND column_name IN ('assigned_employee_id', 'site_req', 'has_drawing', 'attached_documents', 'supervisor_signature');