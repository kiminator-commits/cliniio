-- =====================================================
-- ROOMS TABLE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ROOMS TABLE
-- =====================================================

-- Rooms table for environmental cleaning
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    barcode VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(100),
    floor VARCHAR(50),
    building VARCHAR(100),
    room_type VARCHAR(100) DEFAULT 'general',
    capacity INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Rooms indexes
CREATE INDEX IF NOT EXISTS idx_rooms_barcode ON rooms(barcode);
CREATE INDEX IF NOT EXISTS idx_rooms_department ON rooms(department);
CREATE INDEX IF NOT EXISTS idx_rooms_floor ON rooms(floor);
CREATE INDEX IF NOT EXISTS idx_rooms_active ON rooms(is_active);
CREATE INDEX IF NOT EXISTS idx_rooms_room_type ON rooms(room_type);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on rooms table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- RLS Policies for rooms
CREATE POLICY "Users can view all rooms" ON rooms
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert rooms" ON rooms
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms" ON rooms
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rooms" ON rooms
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_rooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_rooms_updated_at();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample rooms for testing
INSERT INTO rooms (barcode, name, department, floor, building, room_type, capacity) VALUES
    ('ROOM-001', 'Operating Room 1', 'Surgery', '2nd Floor', 'Main Building', 'operating_room', 8),
    ('ROOM-002', 'Operating Room 2', 'Surgery', '2nd Floor', 'Main Building', 'operating_room', 8),
    ('ROOM-003', 'Recovery Room 1', 'Surgery', '2nd Floor', 'Main Building', 'recovery_room', 4),
    ('ROOM-004', 'Recovery Room 2', 'Surgery', '2nd Floor', 'Main Building', 'recovery_room', 4),
    ('ROOM-005', 'ICU Room 1', 'Intensive Care', '3rd Floor', 'Main Building', 'icu_room', 1),
    ('ROOM-006', 'ICU Room 2', 'Intensive Care', '3rd Floor', 'Main Building', 'icu_room', 1),
    ('ROOM-007', 'Emergency Room 1', 'Emergency', '1st Floor', 'Main Building', 'emergency_room', 2),
    ('ROOM-008', 'Emergency Room 2', 'Emergency', '1st Floor', 'Main Building', 'emergency_room', 2),
    ('ROOM-009', 'Patient Room 101', 'General Medicine', '1st Floor', 'Main Building', 'patient_room', 2),
    ('ROOM-010', 'Patient Room 102', 'General Medicine', '1st Floor', 'Main Building', 'patient_room', 2),
    ('ROOM-011', 'Laboratory 1', 'Laboratory', '1st Floor', 'Main Building', 'laboratory', 4),
    ('ROOM-012', 'Laboratory 2', 'Laboratory', '1st Floor', 'Main Building', 'laboratory', 4),
    ('ROOM-013', 'Waiting Room', 'Administration', '1st Floor', 'Main Building', 'waiting_area', 20),
    ('ROOM-014', 'Cafeteria', 'Administration', '1st Floor', 'Main Building', 'cafeteria', 50),
    ('ROOM-015', 'Lobby', 'Administration', '1st Floor', 'Main Building', 'lobby', 30)
ON CONFLICT (barcode) DO NOTHING; 