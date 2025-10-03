-- =====================================================
-- CREATE FACILITY SETTINGS TABLE
-- =====================================================

-- Facility settings for autoclave receipts and other configurations
CREATE TABLE IF NOT EXISTS facility_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    autoclave_has_printer BOOLEAN DEFAULT true,
    receipt_retention_months INTEGER DEFAULT 24, -- 2 years default for images
    receipt_compression_enabled BOOLEAN DEFAULT true,
    receipt_max_file_size_mb INTEGER DEFAULT 10,
    receipt_cleanup_enabled BOOLEAN DEFAULT true,
    receipt_cleanup_frequency_days INTEGER DEFAULT 30, -- Run cleanup monthly
    last_cleanup_run TIMESTAMP WITH TIME ZONE,
    cleanup_notification_email VARCHAR(255),
    compliance_contact_email VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(facility_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_facility_settings_facility_id ON facility_settings(facility_id);
CREATE INDEX IF NOT EXISTS idx_facility_settings_cleanup ON facility_settings(last_cleanup_run);

-- Enable RLS
ALTER TABLE facility_settings ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view settings for their facility" ON facility_settings
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND facility_id = facility_settings.facility_id
  )
);

CREATE POLICY "Users can manage settings for their facility" ON facility_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND facility_id = facility_settings.facility_id
  )
);

-- Add comments
COMMENT ON COLUMN facility_settings.receipt_retention_months IS 'Number of months to retain autoclave receipt images (default 24 = 2 years)';
COMMENT ON COLUMN facility_settings.receipt_cleanup_enabled IS 'Whether automatic cleanup of expired receipt images is enabled';
COMMENT ON COLUMN facility_settings.receipt_cleanup_frequency_days IS 'How often to run cleanup (in days)';
COMMENT ON COLUMN facility_settings.last_cleanup_run IS 'Last time the cleanup job was run';

-- Create trigger for updated_at
CREATE TRIGGER update_facility_settings_updated_at 
    BEFORE UPDATE ON facility_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 