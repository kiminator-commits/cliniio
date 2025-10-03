-- =====================================================
-- ENVIRONMENTAL CLEANS ENHANCED TABLE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENVIRONMENTAL CLEANS ENHANCED TABLE
-- =====================================================

-- Enhanced environmental cleaning records table
CREATE TABLE IF NOT EXISTS environmental_cleans_enhanced (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
    room_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'verified', 'failed', 'cancelled')),
    cleaning_type VARCHAR(50) DEFAULT 'routine' CHECK (cleaning_type IN ('routine', 'deep', 'emergency', 'post_procedure', 'terminal')),
    scheduled_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    started_time TIMESTAMP WITH TIME ZONE,
    completed_time TIMESTAMP WITH TIME ZONE,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    compliance_score DECIMAL(3,2) CHECK (compliance_score >= 0 AND compliance_score <= 1),
    checklist_items JSONB DEFAULT '[]',
    completed_items JSONB DEFAULT '[]',
    failed_items JSONB DEFAULT '[]',
    notes TEXT,
    photos TEXT[],
    cleaner_id UUID REFERENCES users(id),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Environmental cleans enhanced indexes
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_room_id ON environmental_cleans_enhanced(room_id);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_status ON environmental_cleans_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_cleaning_type ON environmental_cleans_enhanced(cleaning_type);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_scheduled_time ON environmental_cleans_enhanced(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_completed_time ON environmental_cleans_enhanced(completed_time);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_cleaner_id ON environmental_cleans_enhanced(cleaner_id);
CREATE INDEX IF NOT EXISTS idx_environmental_cleans_enhanced_created_at ON environmental_cleans_enhanced(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on environmental_cleans_enhanced table
ALTER TABLE environmental_cleans_enhanced ENABLE ROW LEVEL SECURITY;

-- RLS Policies for environmental_cleans_enhanced
CREATE POLICY "Users can view all environmental cleans" ON environmental_cleans_enhanced
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert environmental cleans" ON environmental_cleans_enhanced
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update environmental cleans" ON environmental_cleans_enhanced
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete environmental cleans" ON environmental_cleans_enhanced
    FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_environmental_cleans_enhanced_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_environmental_cleans_enhanced_updated_at
    BEFORE UPDATE ON environmental_cleans_enhanced
    FOR EACH ROW
    EXECUTE FUNCTION update_environmental_cleans_enhanced_updated_at();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample environmental cleaning records for testing
INSERT INTO environmental_cleans_enhanced (room_id, room_name, status, cleaning_type, scheduled_time, completed_time, checklist_items, completed_items, failed_items) VALUES
    ((SELECT id FROM rooms WHERE barcode = 'ROOM-001' LIMIT 1), 'Operating Room 1', 'completed', 'routine', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour', '["Disinfect surfaces", "Clean equipment", "Restock supplies"]', '["Disinfect surfaces", "Clean equipment", "Restock supplies"]', '[]'),
    ((SELECT id FROM rooms WHERE barcode = 'ROOM-002' LIMIT 1), 'Operating Room 2', 'pending', 'routine', NOW() + INTERVAL '1 hour', NULL, '["Disinfect surfaces", "Clean equipment", "Restock supplies"]', '[]', '[]'),
    ((SELECT id FROM rooms WHERE barcode = 'ROOM-003' LIMIT 1), 'Recovery Room 1', 'in_progress', 'deep', NOW() - INTERVAL '30 minutes', NULL, '["Deep clean surfaces", "Sanitize equipment", "Replace linens"]', '["Deep clean surfaces"]', '[]'),
    ((SELECT id FROM rooms WHERE barcode = 'ROOM-004' LIMIT 1), 'Recovery Room 2', 'completed', 'routine', NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours', '["Disinfect surfaces", "Clean equipment", "Restock supplies"]', '["Disinfect surfaces", "Clean equipment", "Restock supplies"]', '[]'),
    ((SELECT id FROM rooms WHERE barcode = 'ROOM-005' LIMIT 1), 'ICU Room 1', 'completed', 'terminal', NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours', '["Terminal disinfection", "Equipment sterilization", "Room isolation"]', '["Terminal disinfection", "Equipment sterilization", "Room isolation"]', '[]')
ON CONFLICT DO NOTHING; 