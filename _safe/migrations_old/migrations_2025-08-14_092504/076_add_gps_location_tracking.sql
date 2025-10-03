-- =====================================================
-- ADD GPS LOCATION TRACKING FOR AI AND GEOFENCING
-- =====================================================

-- Add GPS coordinates to inventory_items table
ALTER TABLE inventory_items 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Add GPS coordinates to sterilization_tools table
ALTER TABLE sterilization_tools 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Add GPS coordinates to cleaning_equipment table
ALTER TABLE cleaning_equipment 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(5, 2),
ADD COLUMN IF NOT EXISTS location_timestamp TIMESTAMP WITH TIME ZONE;

-- Add GPS coordinates to environmental_monitoring table
ALTER TABLE environmental_monitoring 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(5, 2);

-- Create indexes for GPS coordinates for efficient geospatial queries
CREATE INDEX IF NOT EXISTS idx_inventory_items_gps ON inventory_items(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sterilization_tools_gps ON sterilization_tools(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cleaning_equipment_gps ON cleaning_equipment(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_gps ON environmental_monitoring(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create a function to calculate distance between two GPS coordinates (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
    lat1 DECIMAL(10, 8),
    lon1 DECIMAL(11, 8),
    lat2 DECIMAL(10, 8),
    lon2 DECIMAL(11, 8)
)
RETURNS DECIMAL(10, 2)
LANGUAGE plpgsql
AS $$
DECLARE
    R DECIMAL(10, 2) := 6371; -- Earth's radius in kilometers
    dlat DECIMAL(10, 8);
    dlon DECIMAL(11, 8);
    a DECIMAL(20, 10);
    c DECIMAL(20, 10);
BEGIN
    -- Convert to radians
    dlat := RADIANS(lat2 - lat1);
    dlon := RADIANS(lon2 - lon1);
    
    -- Haversine formula
    a := SIN(dlat/2) * SIN(dlat/2) + 
         COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * 
         SIN(dlon/2) * SIN(dlon/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    
    RETURN R * c;
END;
$$;

-- Create a function to find items within a certain radius
CREATE OR REPLACE FUNCTION find_items_within_radius(
    p_facility_id UUID,
    p_latitude DECIMAL(10, 8),
    p_longitude DECIMAL(11, 8),
    p_radius_km DECIMAL(5, 2) DEFAULT 1.0
)
RETURNS TABLE(
    item_id UUID,
    item_name VARCHAR(255),
    item_type VARCHAR(50),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    distance_km DECIMAL(10, 2),
    location VARCHAR(255),
    room VARCHAR(100)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id as item_id,
        i.name as item_name,
        'inventory' as item_type,
        i.latitude,
        i.longitude,
        calculate_distance(p_latitude, p_longitude, i.latitude, i.longitude) as distance_km,
        i.location,
        i.room
    FROM inventory_items i
    WHERE i.facility_id = p_facility_id
    AND i.latitude IS NOT NULL 
    AND i.longitude IS NOT NULL
    AND calculate_distance(p_latitude, p_longitude, i.latitude, i.longitude) <= p_radius_km
    
    UNION ALL
    
    SELECT 
        st.id as item_id,
        st.tool_name as item_name,
        'sterilization' as item_type,
        st.latitude,
        st.longitude,
        calculate_distance(p_latitude, p_longitude, st.latitude, st.longitude) as distance_km,
        st.location,
        NULL as room
    FROM sterilization_tools st
    WHERE st.facility_id = p_facility_id
    AND st.latitude IS NOT NULL 
    AND st.longitude IS NOT NULL
    AND calculate_distance(p_latitude, p_longitude, st.latitude, st.longitude) <= p_radius_km
    
    UNION ALL
    
    SELECT 
        ce.id as item_id,
        ce.name as item_name,
        'cleaning_equipment' as item_type,
        ce.latitude,
        ce.longitude,
        calculate_distance(p_latitude, p_longitude, ce.latitude, ce.longitude) as distance_km,
        ce.location,
        NULL as room
    FROM cleaning_equipment ce
    WHERE ce.facility_id = p_facility_id
    AND ce.latitude IS NOT NULL 
    AND ce.longitude IS NOT NULL
    AND calculate_distance(p_latitude, p_longitude, ce.latitude, ce.longitude) <= p_radius_km
    
    ORDER BY distance_km;
END;
$$;

-- Create a function to update GPS location for an item
CREATE OR REPLACE FUNCTION update_item_gps_location(
    p_item_id UUID,
    p_item_type VARCHAR(50),
    p_latitude DECIMAL(10, 8),
    p_longitude DECIMAL(11, 8),
    p_accuracy DECIMAL(5, 2) DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    CASE p_item_type
        WHEN 'inventory' THEN
            UPDATE inventory_items 
            SET 
                latitude = p_latitude,
                longitude = p_longitude,
                gps_accuracy = p_accuracy,
                location_timestamp = NOW(),
                updated_at = NOW()
            WHERE id = p_item_id;
        WHEN 'sterilization' THEN
            UPDATE sterilization_tools 
            SET 
                latitude = p_latitude,
                longitude = p_longitude,
                gps_accuracy = p_accuracy,
                location_timestamp = NOW(),
                updated_at = NOW()
            WHERE id = p_item_id;
        WHEN 'cleaning_equipment' THEN
            UPDATE cleaning_equipment 
            SET 
                latitude = p_latitude,
                longitude = p_longitude,
                gps_accuracy = p_accuracy,
                location_timestamp = NOW(),
                updated_at = NOW()
            WHERE id = p_item_id;
        ELSE
            RETURN FALSE;
    END CASE;
    
    RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION calculate_distance(DECIMAL(10, 8), DECIMAL(11, 8), DECIMAL(10, 8), DECIMAL(11, 8)) TO authenticated;
GRANT EXECUTE ON FUNCTION find_items_within_radius(UUID, DECIMAL(10, 8), DECIMAL(11, 8), DECIMAL(5, 2)) TO authenticated;
GRANT EXECUTE ON FUNCTION update_item_gps_location(UUID, VARCHAR(50), DECIMAL(10, 8), DECIMAL(11, 8), DECIMAL(5, 2)) TO authenticated;

-- Add comments for documentation
COMMENT ON COLUMN inventory_items.latitude IS 'GPS latitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN inventory_items.longitude IS 'GPS longitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN inventory_items.gps_accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN inventory_items.location_timestamp IS 'Timestamp when GPS location was last updated';

COMMENT ON COLUMN sterilization_tools.latitude IS 'GPS latitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN sterilization_tools.longitude IS 'GPS longitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN sterilization_tools.gps_accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN sterilization_tools.location_timestamp IS 'Timestamp when GPS location was last updated';

COMMENT ON COLUMN cleaning_equipment.latitude IS 'GPS latitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN cleaning_equipment.longitude IS 'GPS longitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN cleaning_equipment.gps_accuracy IS 'GPS accuracy in meters';
COMMENT ON COLUMN cleaning_equipment.location_timestamp IS 'Timestamp when GPS location was last updated';

COMMENT ON COLUMN environmental_monitoring.latitude IS 'GPS latitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN environmental_monitoring.longitude IS 'GPS longitude coordinate for location tracking and geofencing';
COMMENT ON COLUMN environmental_monitoring.gps_accuracy IS 'GPS accuracy in meters'; 