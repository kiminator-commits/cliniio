-- =====================================================
-- ADD PACKAGE ID TO STERILIZATION BATCHES
-- =====================================================

-- Add unique package ID field to sterilization_batches table
ALTER TABLE sterilization_batches 
ADD COLUMN IF NOT EXISTS package_id VARCHAR(100) UNIQUE,
ADD COLUMN IF NOT EXISTS package_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS package_size VARCHAR(50),
ADD COLUMN IF NOT EXISTS chemical_indicator_added BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS packaged_by UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS packaged_at TIMESTAMP WITH TIME ZONE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_package_id ON sterilization_batches(package_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_package_type ON sterilization_batches(package_type);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_packaged_by ON sterilization_batches(packaged_by);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_packaged_at ON sterilization_batches(packaged_at);

-- Add comments for documentation
COMMENT ON COLUMN sterilization_batches.package_id IS 'Unique identifier for the packaged tool kit';
COMMENT ON COLUMN sterilization_batches.package_type IS 'Type of packaging (pouch, wrap, container, tray)';
COMMENT ON COLUMN sterilization_batches.package_size IS 'Size of the package';
COMMENT ON COLUMN sterilization_batches.chemical_indicator_added IS 'Whether chemical indicator was added to package';
COMMENT ON COLUMN sterilization_batches.packaged_by IS 'User who created the package';
COMMENT ON COLUMN sterilization_batches.packaged_at IS 'When the package was created';

-- Function to generate unique package ID
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

-- Function to get tools ready for packaging (in complete phase)
CREATE OR REPLACE FUNCTION get_tools_ready_for_packaging(facility_uuid UUID)
RETURNS TABLE(
    tool_id UUID,
    tool_name VARCHAR(255),
    barcode VARCHAR(100),
    tool_type VARCHAR(100),
    current_phase VARCHAR(50),
    last_sterilized TIMESTAMP WITH TIME ZONE,
    sterilization_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        st.id,
        st.tool_name,
        st.barcode,
        st.tool_type,
        st.status as current_phase,
        st.last_sterilized,
        st.sterilization_count
    FROM sterilization_tools st
    WHERE st.facility_id = facility_uuid
    AND st.status = 'available'  -- Tools that have completed sterilization
    AND st.current_cycle_id IS NOT NULL  -- Have been through a cycle
    ORDER BY st.tool_name;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION generate_package_id() TO authenticated;
GRANT EXECUTE ON FUNCTION get_tools_ready_for_packaging(UUID) TO authenticated; 