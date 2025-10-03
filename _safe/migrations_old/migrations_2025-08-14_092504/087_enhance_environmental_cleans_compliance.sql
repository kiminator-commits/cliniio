-- =====================================================
-- ENHANCE ENVIRONMENTAL CLEANS COMPLIANCE MIGRATION
-- =====================================================

-- Add inventory integration and compliance tracking to environmental_cleans_enhanced

-- =====================================================
-- ADD INVENTORY USAGE TRACKING
-- =====================================================

-- Add inventory usage tracking columns
ALTER TABLE environmental_cleans_enhanced 
ADD COLUMN IF NOT EXISTS inventory_usage JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS supplies_consumed JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS equipment_used JSONB DEFAULT '[]';

-- Add detailed task completion tracking
ALTER TABLE environmental_cleans_enhanced 
ADD COLUMN IF NOT EXISTS task_completion_details JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS compliance_notes TEXT,
ADD COLUMN IF NOT EXISTS quality_issues JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS corrective_actions JSONB DEFAULT '[]';

-- Add time tracking for compliance
ALTER TABLE environmental_cleans_enhanced 
ADD COLUMN IF NOT EXISTS task_start_times JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS task_end_times JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS task_durations JSONB DEFAULT '[]';

-- Add user activity tracking
ALTER TABLE environmental_cleans_enhanced 
ADD COLUMN IF NOT EXISTS user_activities JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS supervisor_review_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS supervisor_review_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS supervisor_notes TEXT;

-- =====================================================
-- CREATE INVENTORY USAGE TRACKING TABLE
-- =====================================================

-- Table to track inventory items used during cleaning tasks
CREATE TABLE IF NOT EXISTS environmental_cleaning_inventory_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    environmental_clean_id UUID NOT NULL REFERENCES environmental_cleans_enhanced(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
    quantity_used DECIMAL(10,2) NOT NULL,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    usage_reason VARCHAR(255),
    task_step VARCHAR(255),
    used_by UUID REFERENCES users(id),
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE TASK COMPLETION DETAILS TABLE
-- =====================================================

-- Table to track detailed task completion for compliance
CREATE TABLE IF NOT EXISTS environmental_cleaning_task_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    environmental_clean_id UUID NOT NULL REFERENCES environmental_cleans_enhanced(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    is_completed BOOLEAN DEFAULT false,
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    quality_score DECIMAL(3,2) CHECK (quality_score >= 0 AND quality_score <= 1),
    compliance_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    photos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Inventory usage indexes
CREATE INDEX IF NOT EXISTS idx_env_cleaning_inventory_usage_clean_id ON environmental_cleaning_inventory_usage(environmental_clean_id);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_inventory_usage_item_id ON environmental_cleaning_inventory_usage(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_inventory_usage_used_at ON environmental_cleaning_inventory_usage(used_at);

-- Task details indexes
CREATE INDEX IF NOT EXISTS idx_env_cleaning_task_details_clean_id ON environmental_cleaning_task_details(environmental_clean_id);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_task_details_completed ON environmental_cleaning_task_details(is_completed);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_task_details_verified ON environmental_cleaning_task_details(compliance_verified);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE environmental_cleaning_inventory_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_cleaning_task_details ENABLE ROW LEVEL SECURITY;

-- RLS Policies for environmental_cleaning_inventory_usage
CREATE POLICY "Users can view inventory usage" ON environmental_cleaning_inventory_usage
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert inventory usage" ON environmental_cleaning_inventory_usage
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inventory usage" ON environmental_cleaning_inventory_usage
    FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for environmental_cleaning_task_details
CREATE POLICY "Users can view task details" ON environmental_cleaning_task_details
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert task details" ON environmental_cleaning_task_details
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update task details" ON environmental_cleaning_task_details
    FOR UPDATE USING (auth.role() = 'authenticated');

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update inventory when cleaning tasks use supplies
CREATE OR REPLACE FUNCTION update_inventory_from_cleaning_usage()
RETURNS TRIGGER AS $$
BEGIN
    -- Create inventory transaction for the used item
    INSERT INTO inventory_transactions (
        facility_id,
        item_id,
        transaction_type,
        quantity,
        unit_cost,
        total_cost,
        reference_type,
        reference_id,
        reason,
        notes,
        created_by
    ) VALUES (
        (SELECT facility_id FROM inventory_items WHERE id = NEW.inventory_item_id),
        NEW.inventory_item_id,
        'out',
        NEW.quantity_used,
        NEW.unit_cost,
        NEW.total_cost,
        'environmental_cleaning',
        NEW.environmental_clean_id,
        'Cleaning task usage',
        'Used during environmental cleaning task',
        NEW.used_by
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically create inventory transactions
CREATE TRIGGER trigger_update_inventory_from_cleaning_usage
    AFTER INSERT ON environmental_cleaning_inventory_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_from_cleaning_usage();

-- Function to update task completion timestamps
CREATE OR REPLACE FUNCTION update_task_completion_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_completed = true AND OLD.is_completed = false THEN
        NEW.completed_at = NOW();
        NEW.duration_minutes = EXTRACT(EPOCH FROM (NEW.end_time - NEW.start_time)) / 60;
    END IF;
    
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task completion timestamps
CREATE TRIGGER trigger_update_task_completion_timestamps
    BEFORE UPDATE ON environmental_cleaning_task_details
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completion_timestamps();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample inventory usage for existing cleaning records
INSERT INTO environmental_cleaning_inventory_usage (environmental_clean_id, inventory_item_id, quantity_used, unit_cost, total_cost, usage_reason, task_step) 
SELECT 
    ece.id,
    ii.id,
    2.0,
    ii.unit_cost,
    ii.unit_cost * 2.0,
    'Surface disinfection',
    'Disinfect surfaces'
FROM environmental_cleans_enhanced ece
CROSS JOIN inventory_items ii
WHERE ece.status = 'completed' 
AND ii.category = 'Cleaning Supplies'
AND ii.name ILIKE '%disinfectant%'
LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert sample task details for existing cleaning records
INSERT INTO environmental_cleaning_task_details (environmental_clean_id, task_name, task_description, task_order, is_required, is_completed, start_time, end_time, duration_minutes)
SELECT 
    ece.id,
    'Disinfect surfaces',
    'Apply disinfectant to all high-touch surfaces',
    1,
    true,
    true,
    ece.completed_time - INTERVAL '30 minutes',
    ece.completed_time - INTERVAL '20 minutes',
    10
FROM environmental_cleans_enhanced ece
WHERE ece.status = 'completed'
LIMIT 5
ON CONFLICT DO NOTHING; 