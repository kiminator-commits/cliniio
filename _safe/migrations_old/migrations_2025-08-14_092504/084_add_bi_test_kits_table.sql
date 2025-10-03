-- Migration: Add bi_test_kits table for BI test kit inventory management
-- This table stores BI test kit information for proper lot tracking and expiry management

CREATE TABLE IF NOT EXISTS bi_test_kits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    lot_number VARCHAR(100) NOT NULL,
    serial_number VARCHAR(100) UNIQUE,
    barcode VARCHAR(100) UNIQUE,
    expiry_date DATE NOT NULL,
    incubation_time_minutes INTEGER DEFAULT 1440, -- 24 hours default
    incubation_temperature_celsius DECIMAL(5,2) DEFAULT 55.0, -- 55°C default
    quantity INTEGER DEFAULT 0,
    min_quantity INTEGER DEFAULT 0,
    max_quantity INTEGER DEFAULT 0,
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired', 'quarantine')),
    supplier VARCHAR(255),
    cost DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bi_test_kits_facility_id ON bi_test_kits(facility_id);
CREATE INDEX IF NOT EXISTS idx_bi_test_kits_lot_number ON bi_test_kits(lot_number);
CREATE INDEX IF NOT EXISTS idx_bi_test_kits_expiry_date ON bi_test_kits(expiry_date);
CREATE INDEX IF NOT EXISTS idx_bi_test_kits_status ON bi_test_kits(status);
CREATE INDEX IF NOT EXISTS idx_bi_test_kits_quantity ON bi_test_kits(quantity);

-- Add updated_at trigger
CREATE TRIGGER update_bi_test_kits_updated_at 
    BEFORE UPDATE ON bi_test_kits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE bi_test_kits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see BI test kits from their facility
CREATE POLICY "Users can view BI test kits from their facility" ON bi_test_kits
    FOR SELECT USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Users can insert BI test kits for their facility
CREATE POLICY "Users can insert BI test kits for their facility" ON bi_test_kits
    FOR INSERT WITH CHECK (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Users can update BI test kits from their facility
CREATE POLICY "Users can update BI test kits from their facility" ON bi_test_kits
    FOR UPDATE USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Policy: Users can delete BI test kits from their facility
CREATE POLICY "Users can delete BI test kits from their facility" ON bi_test_kits
    FOR DELETE USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Add function to automatically update status to expired
CREATE OR REPLACE FUNCTION update_bi_test_kit_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update status to expired if expiry date has passed
    IF NEW.expiry_date <= CURRENT_DATE THEN
        NEW.status = 'expired';
    END IF;
    
    -- Update status to active if expiry date is in the future and status was expired
    IF NEW.expiry_date > CURRENT_DATE AND OLD.status = 'expired' THEN
        NEW.status = 'active';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update status based on expiry date
CREATE TRIGGER trigger_update_bi_test_kit_status
    BEFORE INSERT OR UPDATE ON bi_test_kits
    FOR EACH ROW EXECUTE FUNCTION update_bi_test_kit_status();

-- Add function to get available BI test kits
CREATE OR REPLACE FUNCTION get_available_bi_test_kits(facility_id_param UUID)
RETURNS TABLE (
    id UUID,
    name VARCHAR(255),
    manufacturer VARCHAR(255),
    lot_number VARCHAR(100),
    serial_number VARCHAR(100),
    barcode VARCHAR(100),
    expiry_date DATE,
    incubation_time_minutes INTEGER,
    incubation_temperature_celsius DECIMAL(5,2),
    quantity INTEGER,
    location VARCHAR(255),
    status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        btk.id,
        btk.name,
        btk.manufacturer,
        btk.lot_number,
        btk.serial_number,
        btk.barcode,
        btk.expiry_date,
        btk.incubation_time_minutes,
        btk.incubation_temperature_celsius,
        btk.quantity,
        btk.location,
        btk.status
    FROM bi_test_kits btk
    WHERE btk.facility_id = facility_id_param
        AND btk.status = 'active'
        AND btk.quantity > 0
        AND btk.expiry_date > CURRENT_DATE
    ORDER BY btk.expiry_date ASC;
END;
$$ LANGUAGE plpgsql; 