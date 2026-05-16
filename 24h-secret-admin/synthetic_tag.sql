-- Run once in Supabase SQL editor
-- https://supabase.com/dashboard/project/jghtqgsnevtzxhscfirg/sql/new

ALTER TABLE secrets ADD COLUMN IF NOT EXISTS is_synthetic boolean DEFAULT false;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_synthetic boolean DEFAULT false;

-- Mark any existing secrets as synthetic (they're all test data)
-- Remove this line once real users start posting
-- UPDATE secrets SET is_synthetic = true WHERE is_synthetic IS NULL;
