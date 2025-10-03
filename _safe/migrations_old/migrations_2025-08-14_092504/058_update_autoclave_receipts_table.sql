-- =====================================================
-- UPDATE AUTOCLAVE RECEIPTS TABLE STRUCTURE
-- =====================================================

-- Add new columns to autoclave_receipts table to support image uploads
ALTER TABLE autoclave_receipts 
ADD COLUMN IF NOT EXISTS batch_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS cycle_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS photo_filename VARCHAR(255),
ADD COLUMN IF NOT EXISTS photo_size INTEGER,
ADD COLUMN IF NOT EXISTS temperature_evidence TEXT,
ADD COLUMN IF NOT EXISTS uploaded_by_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS retention_until TIMESTAMP WITH TIME ZONE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_batch_code ON autoclave_receipts(batch_code);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_cycle_number ON autoclave_receipts(cycle_number);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_photo_filename ON autoclave_receipts(photo_filename);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_retention_until ON autoclave_receipts(retention_until);

-- Update RLS policies to include new columns
DROP POLICY IF EXISTS "Users can view receipts for their facility" ON autoclave_receipts;
DROP POLICY IF EXISTS "Users can manage receipts for their facility" ON autoclave_receipts;

CREATE POLICY "Users can view receipts for their facility" ON autoclave_receipts
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND facility_id = autoclave_receipts.facility_id
  )
);

CREATE POLICY "Users can manage receipts for their facility" ON autoclave_receipts
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND facility_id = autoclave_receipts.facility_id
  )
);

-- Add comments for documentation
COMMENT ON COLUMN autoclave_receipts.batch_code IS 'Batch code for the sterilization cycle';
COMMENT ON COLUMN autoclave_receipts.cycle_number IS 'Autoclave cycle number from the receipt';
COMMENT ON COLUMN autoclave_receipts.photo_url IS 'URL to the uploaded receipt photo in Supabase storage';
COMMENT ON COLUMN autoclave_receipts.photo_filename IS 'Original filename of the uploaded photo';
COMMENT ON COLUMN autoclave_receipts.photo_size IS 'Size of the uploaded photo in bytes';
COMMENT ON COLUMN autoclave_receipts.temperature_evidence IS 'Temperature evidence from the receipt';
COMMENT ON COLUMN autoclave_receipts.uploaded_by_name IS 'Name of the operator who uploaded the receipt';
COMMENT ON COLUMN autoclave_receipts.retention_until IS 'Date until which the receipt should be retained'; 