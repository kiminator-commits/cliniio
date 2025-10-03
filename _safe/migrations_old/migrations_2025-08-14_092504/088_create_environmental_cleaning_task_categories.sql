-- =====================================================
-- ENVIRONMENTAL CLEANING TASK CATEGORIES MIGRATION
-- =====================================================

-- Add task categories and predefined tasks for environmental cleaning

-- =====================================================
-- CREATE TASK CATEGORIES TABLE
-- =====================================================

-- Table to define cleaning task categories
CREATE TABLE IF NOT EXISTS environmental_cleaning_task_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    icon VARCHAR(100), -- Icon identifier for UI
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREATE PREDEFINED TASKS TABLE
-- =====================================================

-- Table to store predefined tasks for each category
CREATE TABLE IF NOT EXISTS environmental_cleaning_predefined_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES environmental_cleaning_task_categories(id) ON DELETE CASCADE,
    task_name VARCHAR(255) NOT NULL,
    task_description TEXT,
    task_order INTEGER DEFAULT 0,
    is_required BOOLEAN DEFAULT true,
    estimated_duration_minutes INTEGER DEFAULT 15,
    required_supplies TEXT[], -- Array of required supply names
    required_equipment TEXT[], -- Array of required equipment names
    safety_notes TEXT,
    compliance_requirements TEXT[],
    quality_checkpoints TEXT[], -- Array of quality check items
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADD CATEGORY REFERENCE TO CLEANING TASKS
-- =====================================================

-- Add category reference to existing cleaning_tasks table
ALTER TABLE cleaning_tasks 
ADD COLUMN IF NOT EXISTS task_category_id UUID REFERENCES environmental_cleaning_task_categories(id);

-- =====================================================
-- INDEXES
-- =====================================================

-- Task categories indexes
CREATE INDEX IF NOT EXISTS idx_env_cleaning_task_categories_active ON environmental_cleaning_task_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_task_categories_sort_order ON environmental_cleaning_task_categories(sort_order);

-- Predefined tasks indexes
CREATE INDEX IF NOT EXISTS idx_env_cleaning_predefined_tasks_category_id ON environmental_cleaning_predefined_tasks(category_id);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_predefined_tasks_active ON environmental_cleaning_predefined_tasks(is_active);
CREATE INDEX IF NOT EXISTS idx_env_cleaning_predefined_tasks_order ON environmental_cleaning_predefined_tasks(task_order);

-- Cleaning tasks category index
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_category_id ON cleaning_tasks(task_category_id);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE environmental_cleaning_task_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_cleaning_predefined_tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for task categories
CREATE POLICY "Users can view task categories" ON environmental_cleaning_task_categories
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage task categories" ON environmental_cleaning_task_categories
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for predefined tasks
CREATE POLICY "Users can view predefined tasks" ON environmental_cleaning_predefined_tasks
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can manage predefined tasks" ON environmental_cleaning_predefined_tasks
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Function to update task category timestamps
CREATE OR REPLACE FUNCTION update_task_category_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update task category timestamps
CREATE TRIGGER trigger_update_task_category_timestamps
    BEFORE UPDATE ON environmental_cleaning_task_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_task_category_timestamps();

-- Function to update predefined task timestamps
CREATE OR REPLACE FUNCTION update_predefined_task_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update predefined task timestamps
CREATE TRIGGER trigger_update_predefined_task_timestamps
    BEFORE UPDATE ON environmental_cleaning_predefined_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_predefined_task_timestamps();

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert task categories
INSERT INTO environmental_cleaning_task_categories (name, description, color, icon, sort_order) VALUES
('Set up/take down', 'Tasks for setting up and taking down equipment, supplies, and work areas', '#10B981', 'mdi-setup', 1),
('Per patient', 'Patient-specific cleaning tasks and protocols', '#F59E0B', 'mdi-account', 2),
('Weekly', 'Weekly maintenance and deep cleaning tasks', '#3B82F6', 'mdi-calendar-week', 3),
('Public Spaces', 'Cleaning tasks for common areas and public spaces', '#8B5CF6', 'mdi-map-marker', 4),
('Deep clean', 'Comprehensive deep cleaning and sanitization tasks', '#EF4444', 'mdi-broom', 5)
ON CONFLICT (name) DO NOTHING;

-- Insert predefined tasks for Set up/take down
INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Prepare cleaning cart',
    'Set up cleaning cart with all necessary supplies and equipment',
    1,
    10,
    ARRAY['Disinfectant wipes', 'Paper towels', 'Trash bags', 'Gloves'],
    ARRAY['Cleaning cart', 'Spray bottles'],
    'Ensure all PPE is properly fitted before starting',
    ARRAY['All supplies are stocked', 'Equipment is clean and functional', 'Cart is organized']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Set up/take down'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Set up isolation barriers',
    'Install and secure isolation barriers for contaminated areas',
    2,
    15,
    ARRAY['Barrier tape', 'Warning signs', 'Zip ties'],
    ARRAY['Barrier stands', 'Ladder'],
    'Wear appropriate PPE when handling contaminated barriers',
    ARRAY['Barriers are properly secured', 'Warning signs are visible', 'Area is clearly marked']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Set up/take down'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Clean and store equipment',
    'Clean all used equipment and return to proper storage location',
    3,
    20,
    ARRAY['Disinfectant solution', 'Cleaning cloths', 'Storage labels'],
    ARRAY['Cleaning brushes', 'Storage containers'],
    'Follow manufacturer instructions for equipment cleaning',
    ARRAY['Equipment is thoroughly cleaned', 'All items are properly stored', 'Storage area is organized']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Set up/take down'
ON CONFLICT DO NOTHING;

-- Insert predefined tasks for Per patient
INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Disinfect patient room surfaces',
    'Clean and disinfect all high-touch surfaces in patient room',
    1,
    25,
    ARRAY['Hospital-grade disinfectant', 'Disposable wipes', 'Gloves', 'Face mask'],
    ARRAY['Cleaning cart', 'Microfiber cloths'],
    'Follow contact time requirements for disinfectant',
    ARRAY['All surfaces are visibly clean', 'Disinfectant contact time met', 'No visible residue']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Per patient'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Change bed linens',
    'Remove and replace all bed linens with clean ones',
    2,
    15,
    ARRAY['Clean linens', 'Pillowcases', 'Blankets', 'Mattress cover'],
    ARRAY['Linen cart', 'Gloves'],
    'Handle soiled linens with appropriate PPE',
    ARRAY['All linens are fresh and clean', 'Bed is properly made', 'Soiled linens are bagged']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Per patient'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Sanitize bathroom fixtures',
    'Clean and sanitize toilet, sink, shower, and bathroom surfaces',
    3,
    20,
    ARRAY['Bathroom cleaner', 'Toilet bowl cleaner', 'Disinfectant', 'Gloves'],
    ARRAY['Toilet brush', 'Scrub brushes', 'Microfiber cloths'],
    'Use appropriate cleaners for different surfaces',
    ARRAY['All fixtures are clean', 'No visible stains or residue', 'Bathroom smells fresh']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Per patient'
ON CONFLICT DO NOTHING;

-- Insert predefined tasks for Weekly
INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Deep clean floors',
    'Strip, clean, and refinish hard surface floors',
    1,
    120,
    ARRAY['Floor stripper', 'Floor finish', 'Neutral cleaner', 'Mop heads'],
    ARRAY['Floor machine', 'Wet/dry vacuum', 'Mop buckets'],
    'Ensure proper ventilation during floor work',
    ARRAY['Floors are stripped clean', 'Finish is evenly applied', 'No streaks or marks']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Weekly'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Clean air vents and ducts',
    'Vacuum and clean air vents, grilles, and accessible ductwork',
    2,
    60,
    ARRAY['Vent cleaning brushes', 'Vacuum attachments', 'Disinfectant spray'],
    ARRAY['HEPA vacuum', 'Extension poles', 'Ladder'],
    'Use appropriate PPE for dust and debris',
    ARRAY['Vents are free of dust', 'Grilles are clean', 'Airflow is unobstructed']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Weekly'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Sanitize medical equipment',
    'Deep clean and sanitize non-critical medical equipment',
    3,
    90,
    ARRAY['Equipment cleaner', 'Disinfectant wipes', 'Alcohol wipes', 'Gloves'],
    ARRAY['Cleaning brushes', 'Compressed air', 'Microfiber cloths'],
    'Follow manufacturer cleaning instructions',
    ARRAY['Equipment is thoroughly cleaned', 'All surfaces disinfected', 'No visible residue']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Weekly'
ON CONFLICT DO NOTHING;

-- Insert predefined tasks for Public Spaces
INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Clean waiting areas',
    'Clean and disinfect all surfaces in public waiting areas',
    1,
    45,
    ARRAY['Disinfectant spray', 'Disposable wipes', 'Glass cleaner', 'Gloves'],
    ARRAY['Cleaning cart', 'Microfiber cloths', 'Vacuum'],
    'Clean during low-traffic periods when possible',
    ARRAY['All surfaces are clean', 'Chairs are sanitized', 'Area is presentable']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Public Spaces'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Sanitize restrooms',
    'Clean and sanitize all public restroom facilities',
    2,
    60,
    ARRAY['Bathroom cleaner', 'Disinfectant', 'Toilet cleaner', 'Air freshener'],
    ARRAY['Toilet brush', 'Scrub brushes', 'Mop and bucket'],
    'Use appropriate signage during cleaning',
    ARRAY['All fixtures are clean', 'Floors are dry', 'Supplies are stocked']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Public Spaces'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Clean elevators',
    'Clean and disinfect elevator interiors and control panels',
    3,
    30,
    ARRAY['Disinfectant wipes', 'Glass cleaner', 'Stainless steel cleaner'],
    ARRAY['Cleaning cart', 'Microfiber cloths', 'Extension pole'],
    'Coordinate with facility management for access',
    ARRAY['Interior is clean', 'Control panel is sanitized', 'Mirrors are streak-free']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Public Spaces'
ON CONFLICT DO NOTHING;

-- Insert predefined tasks for Deep clean
INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Sterilize operating rooms',
    'Complete sterilization protocol for operating room environments',
    1,
    180,
    ARRAY['Sterilization solution', 'Disinfectant fogger', 'Sterile wipes', 'PPE'],
    ARRAY['Fogging machine', 'UV sterilization unit', 'HEPA filters'],
    'Follow strict sterilization protocols and PPE requirements',
    ARRAY['Room meets sterilization standards', 'All equipment sterilized', 'Air quality verified']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Deep clean'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Decontaminate isolation rooms',
    'Complete decontamination protocol for isolation and quarantine rooms',
    2,
    120,
    ARRAY['Decontamination solution', 'Biohazard bags', 'PPE', 'Disinfectant'],
    ARRAY['Decontamination unit', 'HEPA vacuum', 'Air scrubbers'],
    'Follow biohazard protocols and wear appropriate PPE',
    ARRAY['Room is decontaminated', 'All surfaces treated', 'Air quality cleared']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Deep clean'
ON CONFLICT DO NOTHING;

INSERT INTO environmental_cleaning_predefined_tasks (category_id, task_name, task_description, task_order, estimated_duration_minutes, required_supplies, required_equipment, safety_notes, quality_checkpoints) 
SELECT 
    c.id,
    'Clean HVAC systems',
    'Deep clean and sanitize HVAC ducts, filters, and components',
    3,
    240,
    ARRAY['Duct cleaning solution', 'Filter cleaner', 'Disinfectant', 'PPE'],
    ARRAY['Duct cleaning equipment', 'Inspection camera', 'Vacuum system'],
    'Ensure proper ventilation and use appropriate PPE',
    ARRAY['Ducts are clean', 'Filters replaced', 'System functioning properly']
FROM environmental_cleaning_task_categories c WHERE c.name = 'Deep clean'
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to get tasks by category
CREATE OR REPLACE FUNCTION get_environmental_cleaning_tasks_by_category(category_name VARCHAR)
RETURNS TABLE (
    task_id UUID,
    task_name VARCHAR,
    task_description TEXT,
    task_order INTEGER,
    estimated_duration_minutes INTEGER,
    required_supplies TEXT[],
    required_equipment TEXT[],
    safety_notes TEXT,
    quality_checkpoints TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pt.id,
        pt.task_name,
        pt.task_description,
        pt.task_order,
        pt.estimated_duration_minutes,
        pt.required_supplies,
        pt.required_equipment,
        pt.safety_notes,
        pt.quality_checkpoints
    FROM environmental_cleaning_predefined_tasks pt
    JOIN environmental_cleaning_task_categories tc ON pt.category_id = tc.id
    WHERE tc.name = category_name AND pt.is_active = true
    ORDER BY pt.task_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get all task categories
CREATE OR REPLACE FUNCTION get_environmental_cleaning_categories()
RETURNS TABLE (
    category_id UUID,
    category_name VARCHAR,
    description TEXT,
    color VARCHAR,
    icon VARCHAR,
    task_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        tc.id,
        tc.name,
        tc.description,
        tc.color,
        tc.icon,
        COUNT(pt.id)::BIGINT as task_count
    FROM environmental_cleaning_task_categories tc
    LEFT JOIN environmental_cleaning_predefined_tasks pt ON tc.id = pt.category_id AND pt.is_active = true
    WHERE tc.is_active = true
    GROUP BY tc.id, tc.name, tc.description, tc.color, tc.icon
    ORDER BY tc.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- ===================================================== 