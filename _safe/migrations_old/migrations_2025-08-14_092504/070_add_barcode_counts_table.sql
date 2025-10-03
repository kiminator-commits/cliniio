-- =====================================================
-- ADD BARCODE COUNTS TABLE
-- =====================================================

-- Create barcode_counts table to track scan counts
CREATE TABLE IF NOT EXISTS barcode_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode VARCHAR(100) NOT NULL,
    count INTEGER NOT NULL DEFAULT 0 CHECK (count >= 0 AND count <= 200),
    last_scanned TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(barcode, facility_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_barcode_counts_barcode ON barcode_counts(barcode);
CREATE INDEX IF NOT EXISTS idx_barcode_counts_facility_id ON barcode_counts(facility_id);
CREATE INDEX IF NOT EXISTS idx_barcode_counts_count ON barcode_counts(count);
CREATE INDEX IF NOT EXISTS idx_barcode_counts_last_scanned ON barcode_counts(last_scanned);
CREATE INDEX IF NOT EXISTS idx_barcode_counts_facility_barcode ON barcode_counts(facility_id, barcode);

-- Add comments for documentation
COMMENT ON TABLE barcode_counts IS 'Tracks the number of times each barcode has been scanned, with a maximum of 200 scans per barcode';
COMMENT ON COLUMN barcode_counts.barcode IS 'The barcode being tracked';
COMMENT ON COLUMN barcode_counts.count IS 'Number of times the barcode has been scanned (max 200)';
COMMENT ON COLUMN barcode_counts.last_scanned IS 'When the barcode was last scanned';
COMMENT ON COLUMN barcode_counts.facility_id IS 'Facility where the barcode is being tracked';

-- Enable RLS
ALTER TABLE barcode_counts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view barcode counts for their facility" ON barcode_counts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = barcode_counts.facility_id
        )
    );

CREATE POLICY "Users can manage barcode counts for their facility" ON barcode_counts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = barcode_counts.facility_id
        )
    );

-- Create trigger to update updated_at
CREATE TRIGGER update_barcode_counts_updated_at BEFORE UPDATE ON barcode_counts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to safely increment barcode count
CREATE OR REPLACE FUNCTION increment_barcode_count(
    p_barcode VARCHAR(100),
    p_facility_id UUID,
    p_user_id UUID
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    new_count INTEGER,
    is_max_reached BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    current_count INTEGER;
    max_scans INTEGER := 200;
BEGIN
    -- Get current count
    SELECT count INTO current_count
    FROM barcode_counts
    WHERE barcode = p_barcode AND facility_id = p_facility_id;
    
    -- If no record exists, start with 0
    IF current_count IS NULL THEN
        current_count := 0;
    END IF;
    
    -- Check if max reached
    IF current_count >= max_scans THEN
        RETURN QUERY SELECT 
            false,
            'Maximum scan count (200) reached for barcode ' || p_barcode,
            current_count,
            true;
        RETURN;
    END IF;
    
    -- Increment count
    INSERT INTO barcode_counts (barcode, count, last_scanned, facility_id, user_id)
    VALUES (p_barcode, current_count + 1, NOW(), p_facility_id, p_user_id)
    ON CONFLICT (barcode, facility_id)
    DO UPDATE SET 
        count = EXCLUDED.count,
        last_scanned = EXCLUDED.last_scanned,
        user_id = EXCLUDED.user_id,
        updated_at = NOW();
    
    RETURN QUERY SELECT 
        true,
        'Barcode ' || p_barcode || ' scanned. Count: ' || (current_count + 1) || '/200',
        current_count + 1,
        (current_count + 1) >= max_scans;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_barcode_count(VARCHAR(100), UUID, UUID) TO authenticated; 