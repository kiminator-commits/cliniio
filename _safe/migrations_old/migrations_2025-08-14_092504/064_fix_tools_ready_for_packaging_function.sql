-- =====================================================
-- FIX TOOLS READY FOR PACKAGING FUNCTION
-- =====================================================

-- Update the function to be more flexible with tool status
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
    AND st.status = 'available'  -- Tools that are available for use
    AND st.barcode IS NOT NULL   -- Must have a barcode for scanning
    AND st.sterilization_count > 0  -- Must have been sterilized at least once
    ORDER BY st.tool_name;
END;
$$;

-- Update some sample tools to have current_cycle_id for testing
UPDATE sterilization_tools 
SET 
    current_cycle_id = (
        SELECT id FROM sterilization_cycles 
        WHERE facility_id = sterilization_tools.facility_id 
        LIMIT 1
    )
WHERE status = 'available' 
AND current_cycle_id IS NULL
AND id IN (
    SELECT id FROM sterilization_tools 
    WHERE status = 'available' 
    AND current_cycle_id IS NULL
    LIMIT 10
);

-- If no sterilization cycles exist, create a sample one
INSERT INTO sterilization_cycles (
    facility_id,
    cycle_type,
    cycle_name,
    status,
    start_time,
    end_time,
    temperature_celsius,
    pressure_psi,
    duration_minutes,
    operator_id,
    notes
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    'gravity',
    'Sample Cycle',
    'completed',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    121.0,
    15.0,
    30,
    (SELECT id FROM users LIMIT 1),
    'Sample sterilization cycle for testing'
WHERE NOT EXISTS (
    SELECT 1 FROM sterilization_cycles 
    WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
    LIMIT 1
);

-- Update tools to reference the sample cycle
UPDATE sterilization_tools 
SET 
    current_cycle_id = (
        SELECT id FROM sterilization_cycles 
        WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
        ORDER BY created_at DESC
        LIMIT 1
    )
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND status = 'available' 
AND current_cycle_id IS NULL
AND id IN (
    SELECT id FROM sterilization_tools 
    WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
    AND status = 'available' 
    AND current_cycle_id IS NULL
    LIMIT 10
); 