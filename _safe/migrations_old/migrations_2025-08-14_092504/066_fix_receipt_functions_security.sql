-- =====================================================
-- FIX RECEIPT FUNCTIONS SECURITY ISSUES
-- =====================================================

-- Fix the mark_expired_receipts function to have proper security settings
CREATE OR REPLACE FUNCTION mark_expired_receipts()
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Fix the get_facility_retention_settings function
CREATE OR REPLACE FUNCTION get_facility_retention_settings(facility_uuid UUID)
RETURNS TABLE(
    retention_months INTEGER,
    cleanup_enabled BOOLEAN,
    cleanup_frequency_days INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(fs.receipt_retention_months, 24) as retention_months,
        COALESCE(fs.receipt_cleanup_enabled, true) as cleanup_enabled,
        COALESCE(fs.receipt_cleanup_frequency_days, 30) as cleanup_frequency_days
    FROM facility_settings fs
    WHERE fs.facility_id = facility_uuid;
END;
$$;

-- Fix the calculate_retention_date function
CREATE OR REPLACE FUNCTION calculate_retention_date(facility_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    retention_months INTEGER;
BEGIN
    SELECT COALESCE(fs.receipt_retention_months, 24) INTO retention_months
    FROM facility_settings fs
    WHERE fs.facility_id = facility_uuid;
    
    RETURN NOW() + INTERVAL '1 month' * retention_months;
END;
$$;

-- Fix the set_receipt_retention_date function
CREATE OR REPLACE FUNCTION set_receipt_retention_date()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- If retention_until is not set, calculate it based on facility settings
    IF NEW.retention_until IS NULL THEN
        NEW.retention_until = calculate_retention_date(NEW.facility_id);
    END IF;
    
    RETURN NEW;
END;
$$;

-- Fix the get_receipt_storage_stats function
CREATE OR REPLACE FUNCTION get_receipt_storage_stats(facility_uuid UUID)
RETURNS TABLE(
    total_receipts BIGINT,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC,
    expired_receipts BIGINT,
    expired_size_bytes BIGINT,
    expired_size_mb NUMERIC,
    retention_months INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION mark_expired_receipts() TO authenticated;
GRANT EXECUTE ON FUNCTION get_facility_retention_settings(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_retention_date(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_receipt_storage_stats(UUID) TO authenticated; 