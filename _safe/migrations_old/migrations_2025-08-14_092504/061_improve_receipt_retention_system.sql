-- =====================================================
-- IMPROVE RECEIPT RETENTION SYSTEM
-- =====================================================

-- Add is_expired column to autoclave_receipts if it doesn't exist
ALTER TABLE autoclave_receipts 
ADD COLUMN IF NOT EXISTS is_expired BOOLEAN DEFAULT false;

-- Create index for expired receipts
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_expired ON autoclave_receipts(is_expired, retention_until);

-- Function to mark receipts as expired
CREATE OR REPLACE FUNCTION mark_expired_receipts()
RETURNS INTEGER AS $$
DECLARE
    expired_count INTEGER;
BEGIN
    -- Mark receipts as expired where retention_until has passed
    UPDATE autoclave_receipts 
    SET is_expired = true
    WHERE retention_until < NOW() 
    AND is_expired = false;
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get facility retention settings
CREATE OR REPLACE FUNCTION get_facility_retention_settings(facility_uuid UUID)
RETURNS TABLE(
    retention_months INTEGER,
    cleanup_enabled BOOLEAN,
    cleanup_frequency_days INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(fs.receipt_retention_months, 24) as retention_months,
        COALESCE(fs.receipt_cleanup_enabled, true) as cleanup_enabled,
        COALESCE(fs.receipt_cleanup_frequency_days, 30) as cleanup_frequency_days
    FROM facility_settings fs
    WHERE fs.facility_id = facility_uuid;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate retention date based on facility settings
CREATE OR REPLACE FUNCTION calculate_retention_date(facility_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
    retention_months INTEGER;
BEGIN
    SELECT COALESCE(fs.receipt_retention_months, 24) INTO retention_months
    FROM facility_settings fs
    WHERE fs.facility_id = facility_uuid;
    
    RETURN NOW() + INTERVAL '1 month' * retention_months;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to automatically set retention_until when receipt is created
CREATE OR REPLACE FUNCTION set_receipt_retention_date()
RETURNS TRIGGER AS $$
BEGIN
    -- If retention_until is not set, calculate it based on facility settings
    IF NEW.retention_until IS NULL THEN
        NEW.retention_until = calculate_retention_date(NEW.facility_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set retention date
DROP TRIGGER IF EXISTS set_receipt_retention_trigger ON autoclave_receipts;
CREATE TRIGGER set_receipt_retention_trigger
    BEFORE INSERT ON autoclave_receipts
    FOR EACH ROW EXECUTE FUNCTION set_receipt_retention_date();

-- Function to get storage usage statistics
CREATE OR REPLACE FUNCTION get_receipt_storage_stats(facility_uuid UUID)
RETURNS TABLE(
    total_receipts BIGINT,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC,
    expired_receipts BIGINT,
    expired_size_bytes BIGINT,
    expired_size_mb NUMERIC,
    retention_months INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_receipts,
        COALESCE(SUM(photo_size), 0) as total_size_bytes,
        ROUND(COALESCE(SUM(photo_size), 0) / 1024.0 / 1024.0, 2) as total_size_mb,
        COUNT(*) FILTER (WHERE is_expired = true) as expired_receipts,
        COALESCE(SUM(photo_size) FILTER (WHERE is_expired = true), 0) as expired_size_bytes,
        ROUND(COALESCE(SUM(photo_size) FILTER (WHERE is_expired = true), 0) / 1024.0 / 1024.0, 2) as expired_size_mb,
        COALESCE(fs.receipt_retention_months, 24) as retention_months
    FROM autoclave_receipts ar
    LEFT JOIN facility_settings fs ON ar.facility_id = fs.facility_id
    WHERE ar.facility_id = facility_uuid;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_expired_receipts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_facility_retention_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_retention_date(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_receipt_storage_stats(UUID) TO authenticated; 