-- =====================================================
-- SEPARATE ITEM ID FROM BARCODE ID
-- =====================================================

-- This migration separates the internal item ID (source of truth) 
-- from the external barcode ID (customer-facing identifier)

-- Add item_id column to barcode_counts table to link barcodes to items
ALTER TABLE barcode_counts 
ADD COLUMN item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_barcode_counts_item_id ON barcode_counts(item_id);

-- Update barcode_counts table to make item_id the primary reference
-- while keeping barcode for backward compatibility
ALTER TABLE barcode_counts 
ADD CONSTRAINT unique_item_barcode_facility 
UNIQUE (item_id, barcode, facility_id);

-- Create a new table for barcode-to-item mappings
CREATE TABLE IF NOT EXISTS item_barcode_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    barcode_id VARCHAR(100) NOT NULL,
    barcode_type VARCHAR(50) DEFAULT 'external' CHECK (barcode_type IN ('external', 'internal', 'product')),
    is_active BOOLEAN DEFAULT true,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barcode_id, facility_id),
    UNIQUE(item_id, barcode_id, facility_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_item_barcode_mappings_item_id ON item_barcode_mappings(item_id);
CREATE INDEX IF NOT EXISTS idx_item_barcode_mappings_barcode_id ON item_barcode_mappings(barcode_id);
CREATE INDEX IF NOT EXISTS idx_item_barcode_mappings_facility_id ON item_barcode_mappings(facility_id);
CREATE INDEX IF NOT EXISTS idx_item_barcode_mappings_active ON item_barcode_mappings(is_active);

-- Add comments for documentation
COMMENT ON TABLE item_barcode_mappings IS 'Maps external barcode IDs to internal item IDs. Item ID is the source of truth.';
COMMENT ON COLUMN item_barcode_mappings.item_id IS 'Internal Cliniio item ID (source of truth)';
COMMENT ON COLUMN item_barcode_mappings.barcode_id IS 'External barcode ID that customers buy';
COMMENT ON COLUMN item_barcode_mappings.barcode_type IS 'Type of barcode: external (sold), internal (system), product (manufacturer)';

-- Enable RLS
ALTER TABLE item_barcode_mappings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view barcode mappings for their facility" ON item_barcode_mappings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = item_barcode_mappings.facility_id
        )
    );

CREATE POLICY "Users can manage barcode mappings for their facility" ON item_barcode_mappings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = item_barcode_mappings.facility_id
        )
    );

-- Create trigger to update updated_at
CREATE TRIGGER update_item_barcode_mappings_updated_at BEFORE UPDATE ON item_barcode_mappings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to link barcode to item
CREATE OR REPLACE FUNCTION link_barcode_to_item(
    p_item_id UUID,
    p_barcode_id VARCHAR(100),
    p_facility_id UUID,
    p_user_id UUID,
    p_barcode_type VARCHAR(50) DEFAULT 'external'
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    mapping_id UUID
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_mapping_id UUID;
BEGIN
    -- Check if item exists
    IF NOT EXISTS (SELECT 1 FROM inventory_items WHERE id = p_item_id) THEN
        RETURN QUERY SELECT 
            false,
            'Item with ID ' || p_item_id || ' does not exist',
            NULL::UUID;
        RETURN;
    END IF;
    
    -- Check if barcode is already assigned to another item in this facility
    IF EXISTS (
        SELECT 1 FROM item_barcode_mappings 
        WHERE barcode_id = p_barcode_id 
        AND facility_id = p_facility_id 
        AND item_id != p_item_id
        AND is_active = true
    ) THEN
        RETURN QUERY SELECT 
            false,
            'Barcode ' || p_barcode_id || ' is already assigned to another item in this facility',
            NULL::UUID;
        RETURN;
    END IF;
    
    -- Create or update mapping
    INSERT INTO item_barcode_mappings (
        item_id, 
        barcode_id, 
        barcode_type, 
        facility_id, 
        assigned_by
    )
    VALUES (
        p_item_id, 
        p_barcode_id, 
        p_barcode_type, 
        p_facility_id, 
        p_user_id
    )
    ON CONFLICT (item_id, barcode_id, facility_id)
    DO UPDATE SET 
        is_active = true,
        assigned_by = p_user_id,
        updated_at = NOW()
    RETURNING id INTO new_mapping_id;
    
    RETURN QUERY SELECT 
        true,
        'Barcode ' || p_barcode_id || ' successfully linked to item ' || p_item_id,
        new_mapping_id;
END;
$$;

-- Function to unlink barcode from item
CREATE OR REPLACE FUNCTION unlink_barcode_from_item(
    p_item_id UUID,
    p_barcode_id VARCHAR(100),
    p_facility_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Soft delete the mapping
    UPDATE item_barcode_mappings 
    SET is_active = false, updated_at = NOW()
    WHERE item_id = p_item_id 
    AND barcode_id = p_barcode_id 
    AND facility_id = p_facility_id;
    
    IF FOUND THEN
        RETURN QUERY SELECT 
            true,
            'Barcode ' || p_barcode_id || ' successfully unlinked from item ' || p_item_id;
    ELSE
        RETURN QUERY SELECT 
            false,
            'No active mapping found for barcode ' || p_barcode_id || ' and item ' || p_item_id;
    END IF;
END;
$$;

-- Function to get item by barcode
CREATE OR REPLACE FUNCTION get_item_by_barcode(
    p_barcode_id VARCHAR(100),
    p_facility_id UUID
)
RETURNS TABLE(
    item_id UUID,
    item_name VARCHAR(255),
    category VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50)
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.name,
        i.category,
        i.location,
        i.status
    FROM inventory_items i
    INNER JOIN item_barcode_mappings ibm ON i.id = ibm.item_id
    WHERE ibm.barcode_id = p_barcode_id
    AND ibm.facility_id = p_facility_id
    AND ibm.is_active = true;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION link_barcode_to_item(UUID, VARCHAR(100), UUID, UUID, VARCHAR(50)) TO authenticated;
GRANT EXECUTE ON FUNCTION unlink_barcode_from_item(UUID, VARCHAR(100), UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_item_by_barcode(VARCHAR(100), UUID) TO authenticated; 