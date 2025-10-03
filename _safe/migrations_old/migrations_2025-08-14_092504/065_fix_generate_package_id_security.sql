-- =====================================================
-- FIX GENERATE_PACKAGE_ID SECURITY ISSUE
-- =====================================================

-- Fix the generate_package_id function to have proper security settings
CREATE OR REPLACE FUNCTION generate_package_id()
RETURNS VARCHAR(100) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    package_id VARCHAR(100);
    today_date DATE := CURRENT_DATE;
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate simple package ID: PKG-001, PKG-002, etc. (resets daily)
        package_id := 'PKG-' || LPAD(counter::TEXT, 3, '0');
        
        -- Check if package ID already exists for today
        IF NOT EXISTS (
            SELECT 1 FROM sterilization_batches 
            WHERE package_id = package_id 
            AND DATE(packaged_at) = today_date
        ) THEN
            RETURN package_id;
        END IF;
        
        counter := counter + 1;
        IF counter > 999 THEN
            RAISE EXCEPTION 'Unable to generate unique package ID after 999 attempts';
        END IF;
    END LOOP;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_package_id() TO authenticated; 