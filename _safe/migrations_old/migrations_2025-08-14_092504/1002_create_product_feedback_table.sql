-- =====================================================
-- PRODUCT FEEDBACK TABLE MIGRATION
-- Stores user feedback, bug reports, and feature requests
-- =====================================================

-- Create product_feedback table
CREATE TABLE IF NOT EXISTS product_feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Feedback content
    type VARCHAR(50) NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'other')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    
    -- User information
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE SET NULL,
    contact_email VARCHAR(255),
    
    -- Status tracking
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Additional context
    page_url VARCHAR(500),
    user_agent TEXT,
    browser_info JSONB DEFAULT '{}',
    
    -- Internal notes
    internal_notes TEXT,
    resolution_notes TEXT,
    estimated_effort VARCHAR(50),
    target_version VARCHAR(50)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_feedback_type ON product_feedback(type);
CREATE INDEX IF NOT EXISTS idx_product_feedback_priority ON product_feedback(priority);
CREATE INDEX IF NOT EXISTS idx_product_feedback_status ON product_feedback(status);
CREATE INDEX IF NOT EXISTS idx_product_feedback_created_at ON product_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_product_feedback_user_id ON product_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_product_feedback_facility_id ON product_feedback(facility_id);

-- Enable Row Level Security
ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view their own feedback
CREATE POLICY "Users can view own feedback" ON product_feedback
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own feedback
CREATE POLICY "Users can insert own feedback" ON product_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own feedback (if status allows)
CREATE POLICY "Users can update own feedback" ON product_feedback
    FOR UPDATE USING (auth.uid() = user_id AND status = 'new');

-- Facility admins can view all feedback from their facility
CREATE POLICY "Facility admins can view facility feedback" ON product_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM facilities f
            WHERE f.id = product_feedback.facility_id
            AND f.admin_user_id = auth.uid()
        )
    );

-- System admins can view all feedback
CREATE POLICY "System admins can view all feedback" ON product_feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            WHERE ur.user_id = auth.uid()
            AND ur.role = 'system_admin'
        )
    );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_product_feedback_updated_at 
    BEFORE UPDATE ON product_feedback 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (optional)
-- INSERT INTO product_feedback (type, title, description, priority, user_id, facility_id) VALUES
-- ('feature', 'Dark Mode Support', 'Would love to have a dark mode option for better visibility in low-light environments', 'medium', NULL, NULL),
-- ('bug', 'Task Completion Not Saving', 'Sometimes when I complete a task, it doesn\'t save properly and I have to do it again', 'high', NULL, NULL),
-- ('improvement', 'Better Mobile Experience', 'The mobile interface could be improved for better usability on small screens', 'low', NULL, NULL);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON product_feedback TO authenticated;
GRANT ALL ON product_feedback TO service_role;
