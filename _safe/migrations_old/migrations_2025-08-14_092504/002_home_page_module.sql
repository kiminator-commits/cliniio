-- =====================================================
-- HOME PAGE MODULE MIGRATION
-- Dashboard metrics, user preferences, and analytics
-- =====================================================

-- =====================================================
-- HOME PAGE TABLES
-- =====================================================

-- Dashboard metrics for aggregated data from all modules
CREATE TABLE IF NOT EXISTS dashboard_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    metric_type VARCHAR(100) NOT NULL,
    metric_category VARCHAR(100) NOT NULL,
    metric_name VARCHAR(255) NOT NULL,
    value DECIMAL(15,4) NOT NULL,
    unit VARCHAR(50),
    comparison_value DECIMAL(15,4),
    comparison_period VARCHAR(50),
    trend_direction VARCHAR(20) CHECK (trend_direction IN ('up', 'down', 'stable', 'neutral')),
    trend_percentage DECIMAL(5,2),
    data_source VARCHAR(100),
    module VARCHAR(50),
    metadata JSONB DEFAULT '{}',
    calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences for dashboard customization
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    preference_type VARCHAR(100) NOT NULL,
    preference_key VARCHAR(255) NOT NULL,
    preference_value JSONB NOT NULL,
    is_global BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, preference_type, preference_key)
);

-- Dashboard widgets configuration
CREATE TABLE IF NOT EXISTS dashboard_widgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    widget_type VARCHAR(100) NOT NULL,
    widget_name VARCHAR(255) NOT NULL,
    widget_config JSONB NOT NULL,
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    width INTEGER DEFAULT 1,
    height INTEGER DEFAULT 1,
    is_visible BOOLEAN DEFAULT true,
    refresh_interval INTEGER DEFAULT 300, -- seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Quick actions for dashboard shortcuts
CREATE TABLE IF NOT EXISTS quick_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    action_name VARCHAR(255) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    action_target VARCHAR(255) NOT NULL,
    action_icon VARCHAR(100),
    action_color VARCHAR(7),
    position INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications and alerts
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    notification_type VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'success', 'critical')),
    module VARCHAR(50),
    action_url TEXT,
    action_data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity feed for recent actions
CREATE TABLE IF NOT EXISTS activity_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    activity_title VARCHAR(255) NOT NULL,
    activity_description TEXT,
    module VARCHAR(50),
    related_record_id UUID,
    related_record_type VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Dashboard metrics indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_facility_id ON dashboard_metrics(facility_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_type ON dashboard_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_category ON dashboard_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_module ON dashboard_metrics(module);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_calculated_at ON dashboard_metrics(calculated_at);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_facility_type ON dashboard_metrics(facility_id, metric_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_metrics_metadata_gin ON dashboard_metrics USING GIN (metadata);

-- User preferences indexes
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_facility_id ON user_preferences(facility_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_global ON user_preferences(is_global);
CREATE INDEX IF NOT EXISTS idx_user_preferences_value_gin ON user_preferences USING GIN (preference_value);

-- Dashboard widgets indexes
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_facility_id ON dashboard_widgets(facility_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_visible ON dashboard_widgets(is_visible);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_config_gin ON dashboard_widgets USING GIN (widget_config);

-- Quick actions indexes
CREATE INDEX IF NOT EXISTS idx_quick_actions_user_id ON quick_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_facility_id ON quick_actions(facility_id);
CREATE INDEX IF NOT EXISTS idx_quick_actions_type ON quick_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_quick_actions_active ON quick_actions(is_active);
CREATE INDEX IF NOT EXISTS idx_quick_actions_position ON quick_actions(position);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_facility_id ON notifications(facility_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_severity ON notifications(severity);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_expires_at ON notifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_notifications_action_data_gin ON notifications USING GIN (action_data);

-- Activity feed indexes
CREATE INDEX IF NOT EXISTS idx_activity_feed_user_id ON activity_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_facility_id ON activity_feed(facility_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_module ON activity_feed(module);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created_at ON activity_feed(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_feed_record ON activity_feed(related_record_id, related_record_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_metadata_gin ON activity_feed USING GIN (metadata);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE dashboard_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quick_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Dashboard metrics policies
CREATE POLICY "Users can view metrics for their facility" ON dashboard_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = dashboard_metrics.facility_id
        )
    );

CREATE POLICY "System can insert dashboard metrics" ON dashboard_metrics
    FOR INSERT WITH CHECK (true);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
    FOR ALL USING (auth.uid() = user_id);

-- Dashboard widgets policies
CREATE POLICY "Users can manage their own widgets" ON dashboard_widgets
    FOR ALL USING (auth.uid() = user_id);

-- Quick actions policies
CREATE POLICY "Users can manage their own quick actions" ON quick_actions
    FOR ALL USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- Activity feed policies
CREATE POLICY "Users can view activity feed for their facility" ON activity_feed
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = activity_feed.facility_id
        )
    );

CREATE POLICY "System can insert activity feed" ON activity_feed
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Apply updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at BEFORE UPDATE ON dashboard_widgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quick_actions_updated_at BEFORE UPDATE ON quick_actions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate dashboard metrics
CREATE OR REPLACE FUNCTION calculate_dashboard_metrics(
    p_facility_id UUID,
    p_metric_type VARCHAR(100) DEFAULT NULL,
    p_days INTEGER DEFAULT 30
)
RETURNS VOID AS $$
DECLARE
    metric_record RECORD;
BEGIN
    -- Clear existing metrics for the facility
    DELETE FROM dashboard_metrics 
    WHERE facility_id = p_facility_id 
    AND (p_metric_type IS NULL OR metric_type = p_metric_type);

    -- Calculate sterilization metrics
    INSERT INTO dashboard_metrics (facility_id, metric_type, metric_category, metric_name, value, unit, module)
    SELECT 
        p_facility_id,
        'sterilization',
        'cycles',
        'Total Cycles Today',
        COUNT(*),
        'cycles',
        'sterilization'
    FROM sterilization_cycles 
    WHERE facility_id = p_facility_id 
    AND DATE(created_at) = CURRENT_DATE;

    -- Calculate inventory metrics
    INSERT INTO dashboard_metrics (facility_id, metric_type, metric_category, metric_name, value, unit, module)
    SELECT 
        p_facility_id,
        'inventory',
        'items',
        'Low Stock Items',
        COUNT(*),
        'items',
        'inventory'
    FROM inventory_items 
    WHERE facility_id = p_facility_id 
    AND quantity <= min_quantity;

    -- Calculate environmental cleaning metrics
    INSERT INTO dashboard_metrics (facility_id, metric_type, metric_category, metric_name, value, unit, module)
    SELECT 
        p_facility_id,
        'environmental',
        'cleaning',
        'Rooms Cleaned Today',
        COUNT(*),
        'rooms',
        'environmental'
    FROM cleaning_logs 
    WHERE facility_id = p_facility_id 
    AND DATE(created_at) = CURRENT_DATE;

    -- Calculate user activity metrics
    INSERT INTO dashboard_metrics (facility_id, metric_type, metric_category, metric_name, value, unit, module)
    SELECT 
        p_facility_id,
        'users',
        'activity',
        'Active Users Today',
        COUNT(DISTINCT user_id),
        'users',
        'home'
    FROM audit_logs 
    WHERE facility_id = p_facility_id 
    AND DATE(created_at) = CURRENT_DATE;

    -- Calculate AI interaction metrics
    INSERT INTO dashboard_metrics (facility_id, metric_type, metric_category, metric_name, value, unit, module)
    SELECT 
        p_facility_id,
        'ai',
        'interactions',
        'AI Suggestions Accepted',
        COUNT(*),
        'suggestions',
        'ai'
    FROM ai_suggestions 
    WHERE facility_id = p_facility_id 
    AND status = 'accepted'
    AND created_at >= NOW() - INTERVAL '1 day' * p_days;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    metrics JSONB,
    widgets JSONB,
    quick_actions JSONB,
    notifications JSONB,
    recent_activity JSONB
) AS $$
DECLARE
    user_facility_id UUID;
    target_user_id UUID;
BEGIN
    target_user_id := COALESCE(p_user_id, auth.uid());
    
    -- Get user's facility
    SELECT facility_id INTO user_facility_id 
    FROM users WHERE id = target_user_id;

    RETURN QUERY
    SELECT 
        -- Metrics
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', metric_type,
                'category', metric_category,
                'name', metric_name,
                'value', value,
                'unit', unit,
                'trend', trend_direction,
                'trend_percentage', trend_percentage
            )
        ) FROM dashboard_metrics 
        WHERE facility_id = user_facility_id 
        AND calculated_at >= NOW() - INTERVAL '1 hour') as metrics,
        
        -- Widgets
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', widget_type,
                'name', widget_name,
                'config', widget_config,
                'position', jsonb_build_object('x', position_x, 'y', position_y),
                'size', jsonb_build_object('width', width, 'height', height),
                'visible', is_visible,
                'refresh_interval', refresh_interval
            )
        ) FROM dashboard_widgets 
        WHERE user_id = target_user_id 
        AND is_visible = true) as widgets,
        
        -- Quick actions
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'name', action_name,
                'type', action_type,
                'target', action_target,
                'icon', action_icon,
                'color', action_color,
                'position', position
            )
        ) FROM quick_actions 
        WHERE user_id = target_user_id 
        AND is_active = true 
        ORDER BY position) as quick_actions,
        
        -- Notifications
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', notification_type,
                'title', title,
                'message', message,
                'severity', severity,
                'module', module,
                'action_url', action_url,
                'is_read', is_read,
                'created_at', created_at
            )
        ) FROM notifications 
        WHERE user_id = target_user_id 
        AND (expires_at IS NULL OR expires_at > NOW())
        ORDER BY created_at DESC 
        LIMIT 10) as notifications,
        
        -- Recent activity
        (SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'type', activity_type,
                'title', activity_title,
                'description', activity_description,
                'module', module,
                'created_at', created_at
            )
        ) FROM activity_feed 
        WHERE facility_id = user_facility_id 
        ORDER BY created_at DESC 
        LIMIT 20) as recent_activity;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_facility_id UUID,
    p_type VARCHAR(100),
    p_title VARCHAR(255),
    p_message TEXT,
    p_severity VARCHAR(20) DEFAULT 'info',
    p_module VARCHAR(50) DEFAULT NULL,
    p_action_url TEXT DEFAULT NULL,
    p_action_data JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    notification_id UUID;
BEGIN
    INSERT INTO notifications (
        user_id, facility_id, notification_type, title, message, 
        severity, module, action_url, action_data
    ) VALUES (
        p_user_id, p_facility_id, p_type, p_title, p_message,
        p_severity, p_module, p_action_url, p_action_data
    ) RETURNING id INTO notification_id;
    
    RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert default user preferences
INSERT INTO user_preferences (user_id, facility_id, preference_type, preference_key, preference_value) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'dashboard', 'theme', '"light"'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'dashboard', 'refresh_interval', '300'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'notifications', 'email_enabled', 'true'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'notifications', 'push_enabled', 'true')
ON CONFLICT DO NOTHING;

-- Insert default dashboard widgets
INSERT INTO dashboard_widgets (user_id, facility_id, widget_type, widget_name, widget_config, position_x, position_y, width, height) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'metrics', 'Key Performance Indicators', '{"metrics": ["sterilization_cycles", "inventory_alerts", "cleaning_compliance"]}', 0, 0, 2, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'chart', 'Activity Overview', '{"chart_type": "line", "timeframe": "7d", "metrics": ["user_activity", "ai_interactions"]}', 2, 0, 2, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'list', 'Recent Notifications', '{"limit": 5, "show_read": false}', 0, 1, 1, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'list', 'Quick Actions', '{"actions": ["new_sterilization", "inventory_scan", "cleaning_schedule"]}', 1, 1, 1, 1)
ON CONFLICT DO NOTHING;

-- Insert default quick actions
INSERT INTO quick_actions (user_id, facility_id, action_name, action_type, action_target, action_icon, action_color, position) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'New Sterilization Cycle', 'navigation', '/sterilization/new', 'autoclave', '#3B82F6', 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Scan Inventory', 'action', 'inventory_scan', 'barcode-scan', '#10B981', 2),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Schedule Cleaning', 'navigation', '/environmental/schedule', 'calendar', '#F59E0B', 3),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'View Reports', 'navigation', '/reports', 'chart-bar', '#8B5CF6', 4)
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, facility_id, notification_type, title, message, severity, module) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'welcome', 'Welcome to Cliniio!', 'Your dashboard is ready. Start by exploring the different modules.', 'info', 'home'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'system', 'System Setup Complete', 'All core modules have been initialized successfully.', 'success', 'system')
ON CONFLICT DO NOTHING;

-- Insert sample activity feed
INSERT INTO activity_feed (user_id, facility_id, activity_type, activity_title, activity_description, module) VALUES
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'system', 'System Initialized', 'Cliniio platform has been successfully initialized', 'system'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'user', 'User Login', 'System administrator logged in', 'auth'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'setup', 'Dashboard Configured', 'Default dashboard widgets and preferences set up', 'home')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (module, action, table_name, metadata) VALUES (
    'migration',
    'CREATE',
    'home_page_module',
    '{"version": "002", "description": "Home page module with dashboard metrics, preferences, and analytics created"}'
); 