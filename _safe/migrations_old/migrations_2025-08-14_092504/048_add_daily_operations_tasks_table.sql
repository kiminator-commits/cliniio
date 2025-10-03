-- =====================================================
-- DAILY OPERATIONS TASKS TABLE MIGRATION
-- Table for managing daily operations tasks on the Home page
-- =====================================================

-- Home daily operations tasks table
CREATE TABLE IF NOT EXISTS home_daily_operations_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT false,
    points INTEGER DEFAULT 0,
    type VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    assigned_to UUID REFERENCES users(id),
    completed_by UUID REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Home daily operations tasks indexes
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_facility_id ON home_daily_operations_tasks(facility_id);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_status ON home_daily_operations_tasks(status);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_type ON home_daily_operations_tasks(type);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_category ON home_daily_operations_tasks(category);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_priority ON home_daily_operations_tasks(priority);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_due_date ON home_daily_operations_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_assigned_to ON home_daily_operations_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_completed ON home_daily_operations_tasks(completed);
CREATE INDEX IF NOT EXISTS idx_home_daily_operations_tasks_created_at ON home_daily_operations_tasks(created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on home_daily_operations_tasks table
ALTER TABLE home_daily_operations_tasks ENABLE ROW LEVEL SECURITY;

-- Home daily operations tasks policies
CREATE POLICY "Users can view home daily operations tasks in their facilities" ON home_daily_operations_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = home_daily_operations_tasks.facility_id
        )
    );

CREATE POLICY "Users can manage home daily operations tasks in their facilities" ON home_daily_operations_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = home_daily_operations_tasks.facility_id
        )
    );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Apply updated_at trigger
CREATE TRIGGER update_home_daily_operations_tasks_updated_at BEFORE UPDATE ON home_daily_operations_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (module, action, table_name, metadata) VALUES (
    'migration',
    'CREATE',
    'home_daily_operations_tasks',
    '{"version": "048", "description": "Home daily operations tasks table created for Home page"}'
); 