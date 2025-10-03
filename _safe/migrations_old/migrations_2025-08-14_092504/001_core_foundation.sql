-- =====================================================
-- CORE FOUNDATION MIGRATION
-- Comprehensive AI-Ready Schema for Cliniio Platform
-- =====================================================

-- Enable essential extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- =====================================================
-- CORE TABLES (All Modules Connect To)
-- =====================================================

-- Users table with comprehensive profile data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user', 'viewer')),
    facility_id UUID,
    department VARCHAR(100),
    position VARCHAR(100),
    phone VARCHAR(20),
    avatar_url TEXT,
    preferences JSONB DEFAULT '{}',
    last_login TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facilities table for multi-tenant support
CREATE TABLE IF NOT EXISTS facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL CHECK (type IN ('hospital', 'clinic', 'dental', 'veterinary', 'laboratory', 'other')),
    address JSONB NOT NULL,
    contact_info JSONB,
    settings JSONB DEFAULT '{}',
    subscription_tier VARCHAR(50) DEFAULT 'basic',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive audit logs for all activities
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI events for data collection and insights
CREATE TABLE IF NOT EXISTS ai_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL,
    ai_insights JSONB,
    confidence_score DECIMAL(3,2),
    model_version VARCHAR(50),
    processing_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI suggestions for user guidance
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
    module VARCHAR(50) NOT NULL,
    suggestion_type VARCHAR(100) NOT NULL,
    suggestion_data JSONB NOT NULL,
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'implemented')),
    accepted_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    feedback JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_facility_id ON users(facility_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Facilities indexes
CREATE INDEX IF NOT EXISTS idx_facilities_type ON facilities(type);
CREATE INDEX IF NOT EXISTS idx_facilities_active ON facilities(is_active);
CREATE INDEX IF NOT EXISTS idx_facilities_created_at ON facilities(created_at);

-- Audit logs indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_facility_id ON audit_logs(facility_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs(module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_action ON audit_logs(module, action);

-- AI events indexes
CREATE INDEX IF NOT EXISTS idx_ai_events_user_id ON ai_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_facility_id ON ai_events(facility_id);
CREATE INDEX IF NOT EXISTS idx_ai_events_module ON ai_events(module);
CREATE INDEX IF NOT EXISTS idx_ai_events_event_type ON ai_events(event_type);
CREATE INDEX IF NOT EXISTS idx_ai_events_created_at ON ai_events(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_events_module_type ON ai_events(module, event_type);

-- AI suggestions indexes
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_facility_id ON ai_suggestions(facility_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_module ON ai_suggestions(module);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_type ON ai_suggestions(suggestion_type);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_status ON ai_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_priority ON ai_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_created_at ON ai_suggestions(created_at);

-- JSONB indexes for flexible querying
CREATE INDEX IF NOT EXISTS idx_audit_logs_metadata_gin ON audit_logs USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_ai_events_event_data_gin ON ai_events USING GIN (event_data);
CREATE INDEX IF NOT EXISTS idx_ai_events_insights_gin ON ai_events USING GIN (ai_insights);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_data_gin ON ai_suggestions USING GIN (suggestion_data);
CREATE INDEX IF NOT EXISTS idx_users_preferences_gin ON users USING GIN (preferences);
CREATE INDEX IF NOT EXISTS idx_facilities_settings_gin ON facilities USING GIN (settings);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Facilities policies
CREATE POLICY "Users can view their facility" ON facilities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = facilities.id
        )
    );

CREATE POLICY "Admins can manage facilities" ON facilities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Audit logs policies
CREATE POLICY "Users can view audit logs for their facility" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = audit_logs.facility_id
        )
    );

CREATE POLICY "System can insert audit logs" ON audit_logs
    FOR INSERT WITH CHECK (true);

-- AI events policies
CREATE POLICY "Users can view AI events for their facility" ON ai_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = ai_events.facility_id
        )
    );

CREATE POLICY "System can insert AI events" ON ai_events
    FOR INSERT WITH CHECK (true);

-- AI suggestions policies
CREATE POLICY "Users can view their own suggestions" ON ai_suggestions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own suggestions" ON ai_suggestions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert AI suggestions" ON ai_suggestions
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_facilities_updated_at BEFORE UPDATE ON facilities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_suggestions_updated_at BEFORE UPDATE ON ai_suggestions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create audit log entry
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        facility_id,
        module,
        action,
        table_name,
        record_id,
        old_values,
        new_values,
        metadata
    ) VALUES (
        auth.uid(),
        (SELECT facility_id FROM users WHERE id = auth.uid()),
        TG_ARGV[0],
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP = 'DELETE' THEN to_jsonb(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN to_jsonb(NEW) ELSE NULL END,
        jsonb_build_object('session_id', gen_random_uuid())
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample facility
INSERT INTO facilities (id, name, type, address, contact_info, subscription_tier) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'Cliniio Demo Facility',
    'hospital',
    '{"street": "123 Medical Center Dr", "city": "Demo City", "state": "DC", "zip": "12345", "country": "USA"}',
    '{"phone": "+1-555-123-4567", "email": "contact@cliniiodemo.com"}',
    'premium'
) ON CONFLICT DO NOTHING;

-- Insert sample admin user
INSERT INTO users (id, email, full_name, role, facility_id, department, position) VALUES (
    '550e8400-e29b-41d4-a716-446655440001',
    'admin@cliniiodemo.com',
    'System Administrator',
    'admin',
    '550e8400-e29b-41d4-a716-446655440000',
    'IT',
    'System Administrator'
) ON CONFLICT DO NOTHING;

-- =====================================================
-- ANALYTICS FUNCTIONS
-- =====================================================

-- Function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
    p_user_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    user_id UUID,
    total_actions INTEGER,
    modules_used TEXT[],
    last_activity TIMESTAMP WITH TIME ZONE,
    ai_interactions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        COUNT(al.id)::INTEGER as total_actions,
        ARRAY_AGG(DISTINCT al.module) as modules_used,
        MAX(al.created_at) as last_activity,
        COUNT(ae.id)::INTEGER as ai_interactions
    FROM users u
    LEFT JOIN audit_logs al ON u.id = al.user_id 
        AND al.created_at >= NOW() - INTERVAL '1 day' * p_days
    LEFT JOIN ai_events ae ON u.id = ae.user_id 
        AND ae.created_at >= NOW() - INTERVAL '1 day' * p_days
    WHERE (p_user_id IS NULL OR u.id = p_user_id)
    GROUP BY u.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get facility performance metrics
CREATE OR REPLACE FUNCTION get_facility_performance_metrics(
    p_facility_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    facility_id UUID,
    total_users INTEGER,
    total_actions INTEGER,
    ai_suggestions_accepted INTEGER,
    ai_suggestions_rejected INTEGER,
    most_active_module VARCHAR(50),
    avg_ai_confidence DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        f.id,
        COUNT(DISTINCT u.id)::INTEGER as total_users,
        COUNT(al.id)::INTEGER as total_actions,
        COUNT(CASE WHEN ais.status = 'accepted' THEN 1 END)::INTEGER as ai_suggestions_accepted,
        COUNT(CASE WHEN ais.status = 'rejected' THEN 1 END)::INTEGER as ai_suggestions_rejected,
        (SELECT module FROM audit_logs 
         WHERE facility_id = f.id 
         AND created_at >= NOW() - INTERVAL '1 day' * p_days
         GROUP BY module 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_active_module,
        AVG(ae.confidence_score) as avg_ai_confidence
    FROM facilities f
    LEFT JOIN users u ON f.id = u.facility_id
    LEFT JOIN audit_logs al ON f.id = al.facility_id 
        AND al.created_at >= NOW() - INTERVAL '1 day' * p_days
    LEFT JOIN ai_suggestions ais ON f.id = ais.facility_id 
        AND ais.created_at >= NOW() - INTERVAL '1 day' * p_days
    LEFT JOIN ai_events ae ON f.id = ae.facility_id 
        AND ae.created_at >= NOW() - INTERVAL '1 day' * p_days
    WHERE (p_facility_id IS NULL OR f.id = p_facility_id)
    GROUP BY f.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (module, action, table_name, metadata) VALUES (
    'migration',
    'CREATE',
    'core_foundation',
    '{"version": "001", "description": "Core foundation tables and AI-ready schema created"}'
); 