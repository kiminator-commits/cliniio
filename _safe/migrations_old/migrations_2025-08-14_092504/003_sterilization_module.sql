-- =====================================================
-- STERILIZATION MODULE MIGRATION
-- Core sterilization tables and functionality
-- =====================================================

-- Autoclaves table for equipment management
CREATE TABLE IF NOT EXISTS autoclaves (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    autoclave_name VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    serial_number VARCHAR(100) UNIQUE,
    location VARCHAR(255),
    capacity VARCHAR(100),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive', 'retired')),
    last_maintenance DATE,
    next_maintenance DATE,
    calibration_due DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Core sterilization cycles table
CREATE TABLE IF NOT EXISTS sterilization_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    cycle_type VARCHAR(100) NOT NULL CHECK (cycle_type IN ('gravity', 'vacuum', 'flash', 'other')),
    cycle_name VARCHAR(255) NOT NULL,
    autoclave_id UUID REFERENCES autoclaves(id) ON DELETE SET NULL,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    temperature_celsius DECIMAL(5,2),
    pressure_psi DECIMAL(6,2),
    status VARCHAR(50) DEFAULT 'preparing' CHECK (status IN ('preparing', 'running', 'completed', 'failed', 'cancelled')),
    phase VARCHAR(50) DEFAULT 'preparing' CHECK (phase IN ('preparing', 'heating', 'sterilizing', 'drying', 'cooling', 'completed')),
    cycle_parameters JSONB DEFAULT '{}',
    cycle_results JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Biological indicators for sterilization validation
CREATE TABLE IF NOT EXISTS biological_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID NOT NULL REFERENCES sterilization_cycles(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    indicator_type VARCHAR(100) NOT NULL CHECK (indicator_type IN ('spore_strip', 'ampoule', 'self_contained', 'other')),
    lot_number VARCHAR(100),
    manufacturer VARCHAR(255),
    expiration_date DATE,
    test_type VARCHAR(100) NOT NULL CHECK (test_type IN ('daily', 'weekly', 'monthly', 'load_control', 'other')),
    incubation_start TIMESTAMP WITH TIME ZONE,
    incubation_end TIMESTAMP WITH TIME ZONE,
    result VARCHAR(20) CHECK (result IN ('pass', 'fail', 'pending', 'invalid')),
    result_notes TEXT,
    incubated_by UUID REFERENCES users(id) ON DELETE SET NULL,
    read_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI failures and resolution tracking
CREATE TABLE IF NOT EXISTS bi_failures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    indicator_id UUID NOT NULL REFERENCES biological_indicators(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    failure_type VARCHAR(100) NOT NULL CHECK (failure_type IN ('positive_bi', 'equipment_failure', 'process_failure', 'other')),
    failure_description TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    investigation_notes TEXT,
    root_cause TEXT,
    corrective_actions JSONB DEFAULT '[]',
    preventive_actions JSONB DEFAULT '[]',
    resolution_date TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Autoclave receipts and documentation
CREATE TABLE IF NOT EXISTS autoclave_receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID NOT NULL REFERENCES sterilization_cycles(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    receipt_type VARCHAR(50) NOT NULL CHECK (receipt_type IN ('print', 'digital', 'photo', 'other')),
    receipt_data JSONB NOT NULL,
    file_url TEXT,
    file_size INTEGER,
    file_type VARCHAR(50),
    uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    upload_verified BOOLEAN DEFAULT false,
    verification_notes TEXT,
    retention_expiry DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sterilization tools and instruments
CREATE TABLE IF NOT EXISTS sterilization_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    tool_name VARCHAR(255) NOT NULL,
    tool_type VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) UNIQUE,
    serial_number VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_cycle', 'quarantine', 'maintenance', 'retired')),
    current_cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE SET NULL,
    last_sterilized TIMESTAMP WITH TIME ZONE,
    sterilization_count INTEGER DEFAULT 0,
    maintenance_due_date DATE,
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sterilization batches for batch processing
CREATE TABLE IF NOT EXISTS sterilization_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    batch_name VARCHAR(255) NOT NULL,
    batch_type VARCHAR(100) NOT NULL CHECK (batch_type IN ('routine', 'emergency', 'special', 'other')),
    cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'preparing' CHECK (status IN ('preparing', 'packaged', 'in_cycle', 'completed', 'failed')),
    package_count INTEGER DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    requested_by UUID REFERENCES users(id) ON DELETE SET NULL,
    requested_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch items linking tools to batches
CREATE TABLE IF NOT EXISTS batch_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID NOT NULL REFERENCES sterilization_batches(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES sterilization_tools(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100),
    quantity INTEGER DEFAULT 1,
    package_type VARCHAR(100),
    package_configuration JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(batch_id, tool_id)
);

-- Sterilization cycle phases for detailed tracking
CREATE TABLE IF NOT EXISTS cycle_phases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cycle_id UUID NOT NULL REFERENCES sterilization_cycles(id) ON DELETE CASCADE,
    phase_name VARCHAR(100) NOT NULL,
    phase_order INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    target_temperature DECIMAL(5,2),
    actual_temperature DECIMAL(5,2),
    target_pressure DECIMAL(6,2),
    actual_pressure DECIMAL(6,2),
    phase_status VARCHAR(50) DEFAULT 'pending' CHECK (phase_status IN ('pending', 'running', 'completed', 'failed')),
    phase_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Sterilization cycles indexes
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_facility_id ON sterilization_cycles(facility_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_type ON sterilization_cycles(cycle_type);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_status ON sterilization_cycles(status);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_operator_id ON sterilization_cycles(operator_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_start_time ON sterilization_cycles(start_time);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_created_at ON sterilization_cycles(created_at);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_facility_status ON sterilization_cycles(facility_id, status);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_parameters_gin ON sterilization_cycles USING GIN (cycle_parameters);
CREATE INDEX IF NOT EXISTS idx_sterilization_cycles_results_gin ON sterilization_cycles USING GIN (cycle_results);

-- Biological indicators indexes
CREATE INDEX IF NOT EXISTS idx_biological_indicators_cycle_id ON biological_indicators(cycle_id);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_facility_id ON biological_indicators(facility_id);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_type ON biological_indicators(indicator_type);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_test_type ON biological_indicators(test_type);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_result ON biological_indicators(result);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_expiration ON biological_indicators(expiration_date);
CREATE INDEX IF NOT EXISTS idx_biological_indicators_incubation ON biological_indicators(incubation_start, incubation_end);

-- BI failures indexes
CREATE INDEX IF NOT EXISTS idx_bi_failures_indicator_id ON bi_failures(indicator_id);
CREATE INDEX IF NOT EXISTS idx_bi_failures_facility_id ON bi_failures(facility_id);
CREATE INDEX IF NOT EXISTS idx_bi_failures_type ON bi_failures(failure_type);
CREATE INDEX IF NOT EXISTS idx_bi_failures_severity ON bi_failures(severity);
CREATE INDEX IF NOT EXISTS idx_bi_failures_status ON bi_failures(status);
CREATE INDEX IF NOT EXISTS idx_bi_failures_assigned_to ON bi_failures(assigned_to);
CREATE INDEX IF NOT EXISTS idx_bi_failures_created_at ON bi_failures(created_at);
CREATE INDEX IF NOT EXISTS idx_bi_failures_corrective_actions_gin ON bi_failures USING GIN (corrective_actions);

-- Autoclave receipts indexes
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_cycle_id ON autoclave_receipts(cycle_id);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_facility_id ON autoclave_receipts(facility_id);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_type ON autoclave_receipts(receipt_type);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_uploaded_by ON autoclave_receipts(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_verified ON autoclave_receipts(upload_verified);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_retention ON autoclave_receipts(retention_expiry);
CREATE INDEX IF NOT EXISTS idx_autoclave_receipts_data_gin ON autoclave_receipts USING GIN (receipt_data);

-- Sterilization tools indexes
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_facility_id ON sterilization_tools(facility_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_type ON sterilization_tools(tool_type);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_barcode ON sterilization_tools(barcode);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_status ON sterilization_tools(status);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_cycle_id ON sterilization_tools(current_cycle_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_location ON sterilization_tools(location);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_maintenance ON sterilization_tools(maintenance_due_date);
CREATE INDEX IF NOT EXISTS idx_sterilization_tools_metadata_gin ON sterilization_tools USING GIN (metadata);

-- Sterilization batches indexes
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_facility_id ON sterilization_batches(facility_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_type ON sterilization_batches(batch_type);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_status ON sterilization_batches(status);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_cycle_id ON sterilization_batches(cycle_id);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_priority ON sterilization_batches(priority);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_requested_by ON sterilization_batches(requested_by);
CREATE INDEX IF NOT EXISTS idx_sterilization_batches_requested_for ON sterilization_batches(requested_for);

-- Batch items indexes
CREATE INDEX IF NOT EXISTS idx_batch_items_batch_id ON batch_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_tool_id ON batch_items(tool_id);
CREATE INDEX IF NOT EXISTS idx_batch_items_type ON batch_items(item_type);
CREATE INDEX IF NOT EXISTS idx_batch_items_configuration_gin ON batch_items USING GIN (package_configuration);

-- Cycle phases indexes
CREATE INDEX IF NOT EXISTS idx_cycle_phases_cycle_id ON cycle_phases(cycle_id);
CREATE INDEX IF NOT EXISTS idx_cycle_phases_name ON cycle_phases(phase_name);
CREATE INDEX IF NOT EXISTS idx_cycle_phases_order ON cycle_phases(phase_order);
CREATE INDEX IF NOT EXISTS idx_cycle_phases_status ON cycle_phases(phase_status);
CREATE INDEX IF NOT EXISTS idx_cycle_phases_start_time ON cycle_phases(start_time);
CREATE INDEX IF NOT EXISTS idx_cycle_phases_data_gin ON cycle_phases USING GIN (phase_data);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE sterilization_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE biological_indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_failures ENABLE ROW LEVEL SECURITY;
ALTER TABLE autoclave_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE sterilization_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycle_phases ENABLE ROW LEVEL SECURITY;

-- Sterilization cycles policies
CREATE POLICY "Users can view cycles for their facility" ON sterilization_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_cycles.facility_id
        )
    );

CREATE POLICY "Users can manage cycles for their facility" ON sterilization_cycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_cycles.facility_id
        )
    );

-- Biological indicators policies
CREATE POLICY "Users can view indicators for their facility" ON biological_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = biological_indicators.facility_id
        )
    );

CREATE POLICY "Users can manage indicators for their facility" ON biological_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = biological_indicators.facility_id
        )
    );

-- BI failures policies
CREATE POLICY "Users can view failures for their facility" ON bi_failures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = bi_failures.facility_id
        )
    );

CREATE POLICY "Users can manage failures for their facility" ON bi_failures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = bi_failures.facility_id
        )
    );

-- Autoclave receipts policies
CREATE POLICY "Users can view receipts for their facility" ON autoclave_receipts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = autoclave_receipts.facility_id
        )
    );

CREATE POLICY "Users can manage receipts for their facility" ON autoclave_receipts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = autoclave_receipts.facility_id
        )
    );

-- Sterilization tools policies
CREATE POLICY "Users can view tools for their facility" ON sterilization_tools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_tools.facility_id
        )
    );

CREATE POLICY "Users can manage tools for their facility" ON sterilization_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_tools.facility_id
        )
    );

-- Sterilization batches policies
CREATE POLICY "Users can view batches for their facility" ON sterilization_batches
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_batches.facility_id
        )
    );

CREATE POLICY "Users can manage batches for their facility" ON sterilization_batches
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = sterilization_batches.facility_id
        )
    );

-- Batch items policies
CREATE POLICY "Users can view batch items for their facility" ON batch_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sterilization_batches sb
            JOIN users u ON u.facility_id = sb.facility_id
            WHERE sb.id = batch_items.batch_id AND u.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage batch items for their facility" ON batch_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sterilization_batches sb
            JOIN users u ON u.facility_id = sb.facility_id
            WHERE sb.id = batch_items.batch_id AND u.id = auth.uid()
        )
    );

-- Cycle phases policies
CREATE POLICY "Users can view phases for their facility" ON cycle_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sterilization_cycles sc
            JOIN users u ON u.facility_id = sc.facility_id
            WHERE sc.id = cycle_phases.cycle_id AND u.id = auth.uid()
        )
    );

CREATE POLICY "Users can manage phases for their facility" ON cycle_phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sterilization_cycles sc
            JOIN users u ON u.facility_id = sc.facility_id
            WHERE sc.id = cycle_phases.cycle_id AND u.id = auth.uid()
        )
    );

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Apply updated_at triggers
CREATE TRIGGER update_sterilization_cycles_updated_at BEFORE UPDATE ON sterilization_cycles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_biological_indicators_updated_at BEFORE UPDATE ON biological_indicators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_failures_updated_at BEFORE UPDATE ON bi_failures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sterilization_tools_updated_at BEFORE UPDATE ON sterilization_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sterilization_batches_updated_at BEFORE UPDATE ON sterilization_batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update tool status when cycle status changes
CREATE OR REPLACE FUNCTION update_tool_status_on_cycle_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Update tool status based on cycle status
    IF NEW.status = 'running' THEN
        UPDATE sterilization_tools 
        SET status = 'in_cycle', current_cycle_id = NEW.id
        WHERE current_cycle_id = NEW.id;
    ELSIF NEW.status IN ('completed', 'failed', 'cancelled') THEN
        UPDATE sterilization_tools 
        SET status = 'available', 
            current_cycle_id = NULL,
            last_sterilized = CASE WHEN NEW.status = 'completed' THEN NEW.end_time ELSE last_sterilized END,
            sterilization_count = CASE WHEN NEW.status = 'completed' THEN sterilization_count + 1 ELSE sterilization_count END
        WHERE current_cycle_id = NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply tool status trigger
CREATE TRIGGER update_tool_status_trigger 
    AFTER UPDATE OF status ON sterilization_cycles
    FOR EACH ROW EXECUTE FUNCTION update_tool_status_on_cycle_change();

-- Function to create BI failure when indicator fails
CREATE OR REPLACE FUNCTION create_bi_failure_on_fail()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.result = 'fail' AND OLD.result != 'fail' THEN
        INSERT INTO bi_failures (
            indicator_id, facility_id, failure_type, failure_description, severity
        ) VALUES (
            NEW.id, NEW.facility_id, 'positive_bi', 
            'Biological indicator test failed - positive growth detected', 'high'
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply BI failure trigger
CREATE TRIGGER create_bi_failure_trigger 
    AFTER UPDATE OF result ON biological_indicators
    FOR EACH ROW EXECUTE FUNCTION create_bi_failure_on_fail();

-- Function to get sterilization analytics
CREATE OR REPLACE FUNCTION get_sterilization_analytics(
    p_facility_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_cycles INTEGER,
    successful_cycles INTEGER,
    failed_cycles INTEGER,
    avg_cycle_duration DECIMAL(5,2),
    bi_pass_rate DECIMAL(5,2),
    total_tools_sterilized INTEGER,
    most_common_cycle_type VARCHAR(100),
    avg_temperature DECIMAL(5,2),
    avg_pressure DECIMAL(6,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(sc.id)::INTEGER as total_cycles,
        COUNT(CASE WHEN sc.status = 'completed' THEN 1 END)::INTEGER as successful_cycles,
        COUNT(CASE WHEN sc.status = 'failed' THEN 1 END)::INTEGER as failed_cycles,
        AVG(sc.duration_minutes) as avg_cycle_duration,
        (COUNT(CASE WHEN bi.result = 'pass' THEN 1 END) * 100.0 / COUNT(bi.id)) as bi_pass_rate,
        COUNT(DISTINCT st.id)::INTEGER as total_tools_sterilized,
        (SELECT cycle_type FROM sterilization_cycles 
         WHERE facility_id = p_facility_id 
         AND (p_start_date IS NULL OR DATE(created_at) >= p_start_date)
         AND (p_end_date IS NULL OR DATE(created_at) <= p_end_date)
         GROUP BY cycle_type 
         ORDER BY COUNT(*) DESC 
         LIMIT 1) as most_common_cycle_type,
        AVG(sc.temperature_celsius) as avg_temperature,
        AVG(sc.pressure_psi) as avg_pressure
    FROM sterilization_cycles sc
    LEFT JOIN biological_indicators bi ON sc.id = bi.cycle_id
    LEFT JOIN sterilization_tools st ON sc.id = st.current_cycle_id
    WHERE sc.facility_id = p_facility_id
    AND (p_start_date IS NULL OR DATE(sc.created_at) >= p_start_date)
    AND (p_end_date IS NULL OR DATE(sc.created_at) <= p_end_date);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get cycle timeline
CREATE OR REPLACE FUNCTION get_cycle_timeline(
    p_cycle_id UUID
)
RETURNS TABLE (
    phase_name VARCHAR(100),
    phase_order INTEGER,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    target_temperature DECIMAL(5,2),
    actual_temperature DECIMAL(5,2),
    target_pressure DECIMAL(6,2),
    actual_pressure DECIMAL(6,2),
    phase_status VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cp.phase_name,
        cp.phase_order,
        cp.start_time,
        cp.end_time,
        cp.duration_minutes,
        cp.target_temperature,
        cp.actual_temperature,
        cp.target_pressure,
        cp.actual_pressure,
        cp.phase_status
    FROM cycle_phases cp
    WHERE cp.cycle_id = p_cycle_id
    ORDER BY cp.phase_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA
-- =====================================================

-- Insert sample autoclave
INSERT INTO autoclaves (id, facility_id, autoclave_name, model, manufacturer, serial_number, location, status) VALUES
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Main Autoclave', 'Class B', 'Tuttnauer', 'AC-001', 'Sterilization Room', 'active')
ON CONFLICT DO NOTHING;

-- Insert sample sterilization tools
INSERT INTO sterilization_tools (facility_id, tool_name, tool_type, barcode, manufacturer, model, location, status) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Surgical Scissors', 'instrument', 'SC001', 'Medline', 'Surgical Scissors 6.5"', 'OR Storage', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Hemostat Forceps', 'instrument', 'HF002', 'Medline', 'Hemostat 5"', 'OR Storage', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Surgical Tray', 'tray', 'ST003', 'Medline', 'Standard Surgical Tray', 'OR Storage', 'available'),
('550e8400-e29b-41d4-a716-446655440000', 'Endoscope', 'equipment', 'EN004', 'Olympus', 'GIF-H290', 'Endoscopy Suite', 'available')
ON CONFLICT DO NOTHING;

-- Insert sample sterilization cycle
INSERT INTO sterilization_cycles (facility_id, cycle_type, cycle_name, autoclave_id, operator_id, start_time, status, phase) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'gravity', 'Morning Routine Cycle', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', NOW() - INTERVAL '2 hours', 'completed', 'completed')
ON CONFLICT DO NOTHING;

-- Insert sample biological indicator
INSERT INTO biological_indicators (cycle_id, facility_id, indicator_type, lot_number, manufacturer, test_type, result, incubated_by) VALUES
((SELECT id FROM sterilization_cycles WHERE cycle_name = 'Morning Routine Cycle' LIMIT 1), '550e8400-e29b-41d4-a716-446655440000', 'spore_strip', 'BI-2024-001', '3M', 'daily', 'pass', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- Insert sample sterilization batch
INSERT INTO sterilization_batches (facility_id, batch_name, batch_type, cycle_id, status, package_count, total_items, priority, requested_by) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Morning OR Batch', 'routine', (SELECT id FROM sterilization_cycles WHERE cycle_name = 'Morning Routine Cycle' LIMIT 1), 'completed', 5, 25, 'normal', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (module, action, table_name, metadata) VALUES (
    'migration',
    'CREATE',
    'sterilization_module',
    '{"version": "003", "description": "Sterilization module with comprehensive workflow management created"}'
); 