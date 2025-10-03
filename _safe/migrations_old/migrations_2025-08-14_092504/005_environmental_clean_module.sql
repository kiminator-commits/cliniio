-- =====================================================
-- ENVIRONMENTAL CLEAN MODULE MIGRATION
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENVIRONMENTAL CLEAN CORE TABLES
-- =====================================================

-- Cleaning schedules table
CREATE TABLE IF NOT EXISTS cleaning_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule_type VARCHAR(50) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom')),
    frequency INTEGER DEFAULT 1,
    frequency_unit VARCHAR(20) DEFAULT 'days' CHECK (frequency_unit IN ('hours', 'days', 'weeks', 'months', 'years')),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    estimated_duration_minutes INTEGER,
    required_equipment TEXT[],
    required_supplies TEXT[],
    safety_notes TEXT,
    compliance_requirements TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cleaning tasks table
CREATE TABLE IF NOT EXISTS cleaning_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    schedule_id UUID REFERENCES cleaning_schedules(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    room VARCHAR(100),
    area VARCHAR(100),
    task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('routine', 'deep_clean', 'disinfection', 'sanitization', 'maintenance', 'emergency')),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled', 'overdue')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    assigned_to UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id),
    actual_duration_minutes INTEGER,
    estimated_duration_minutes INTEGER,
    checklist_items JSONB,
    notes TEXT,
    photos TEXT[],
    compliance_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cleaning supplies table
CREATE TABLE IF NOT EXISTS cleaning_supplies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    sku VARCHAR(100),
    unit_of_measure VARCHAR(50) DEFAULT 'piece',
    current_quantity DECIMAL(10,2) DEFAULT 0,
    minimum_quantity DECIMAL(10,2) DEFAULT 0,
    reorder_point DECIMAL(10,2) DEFAULT 0,
    unit_cost DECIMAL(10,2) DEFAULT 0,
    expiration_date DATE,
    storage_location VARCHAR(255),
    safety_data_sheet_url TEXT,
    msds_number VARCHAR(100),
    chemical_classification VARCHAR(100),
    hazard_level VARCHAR(20) CHECK (hazard_level IN ('low', 'medium', 'high', 'extreme')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cleaning equipment table
CREATE TABLE IF NOT EXISTS cleaning_equipment (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    manufacturer VARCHAR(255),
    model VARCHAR(255),
    serial_number VARCHAR(255),
    asset_tag VARCHAR(100),
    location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'out_of_service', 'retired')),
    condition_status VARCHAR(50) DEFAULT 'good' CHECK (condition_status IN ('excellent', 'good', 'fair', 'poor', 'damaged')),
    last_maintenance_date DATE,
    next_maintenance_date DATE,
    maintenance_interval_days INTEGER,
    purchase_date DATE,
    warranty_expiry_date DATE,
    cost DECIMAL(12,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Environmental monitoring table
CREATE TABLE IF NOT EXISTS environmental_monitoring (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    location VARCHAR(255) NOT NULL,
    room VARCHAR(100),
    monitoring_type VARCHAR(50) NOT NULL CHECK (monitoring_type IN ('temperature', 'humidity', 'air_quality', 'particle_count', 'bacterial_count', 'chemical_level', 'noise_level')),
    parameter_name VARCHAR(100) NOT NULL,
    parameter_value DECIMAL(10,4) NOT NULL,
    unit_of_measure VARCHAR(50),
    acceptable_min DECIMAL(10,4),
    acceptable_max DECIMAL(10,4),
    critical_min DECIMAL(10,4),
    critical_max DECIMAL(10,4),
    reading_status VARCHAR(20) DEFAULT 'normal' CHECK (reading_status IN ('normal', 'warning', 'critical', 'error')),
    equipment_used VARCHAR(255),
    calibration_date DATE,
    next_calibration_date DATE,
    notes TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id)
);

-- Cleaning compliance records table
CREATE TABLE IF NOT EXISTS cleaning_compliance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    task_id UUID REFERENCES cleaning_tasks(id) ON DELETE CASCADE,
    compliance_type VARCHAR(50) NOT NULL CHECK (compliance_type IN ('regulatory', 'internal', 'certification', 'audit')),
    standard_name VARCHAR(255) NOT NULL,
    requirement_description TEXT,
    compliance_status VARCHAR(50) NOT NULL CHECK (compliance_status IN ('compliant', 'non_compliant', 'partial', 'pending_review')),
    evidence_description TEXT,
    evidence_files TEXT[],
    audit_date DATE,
    next_audit_date DATE,
    auditor_name VARCHAR(255),
    auditor_credentials VARCHAR(255),
    findings TEXT,
    corrective_actions TEXT,
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cleaning incidents table
CREATE TABLE IF NOT EXISTS cleaning_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    task_id UUID REFERENCES cleaning_tasks(id) ON DELETE CASCADE,
    incident_type VARCHAR(50) NOT NULL CHECK (incident_type IN ('spill', 'equipment_failure', 'chemical_exposure', 'slip_fall', 'injury', 'contamination', 'other')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    location VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reported_by UUID REFERENCES users(id),
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    incident_date TIMESTAMP WITH TIME ZONE,
    affected_persons INTEGER DEFAULT 0,
    injuries_reported BOOLEAN DEFAULT false,
    medical_attention_required BOOLEAN DEFAULT false,
    equipment_damaged BOOLEAN DEFAULT false,
    property_damage BOOLEAN DEFAULT false,
    immediate_actions_taken TEXT,
    root_cause_analysis TEXT,
    corrective_actions TEXT,
    preventive_measures TEXT,
    investigation_completed BOOLEAN DEFAULT false,
    investigation_completed_by UUID REFERENCES users(id),
    investigation_completed_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- Cleaning training records table
CREATE TABLE IF NOT EXISTS cleaning_training_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    training_type VARCHAR(100) NOT NULL,
    training_name VARCHAR(255) NOT NULL,
    training_provider VARCHAR(255),
    training_date DATE NOT NULL,
    completion_date DATE,
    expiry_date DATE,
    certification_number VARCHAR(255),
    training_hours DECIMAL(5,2),
    score_percentage DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'expired')),
    notes TEXT,
    certificate_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Cleaning schedules indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_facility_id ON cleaning_schedules(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_type ON cleaning_schedules(schedule_type);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_active ON cleaning_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_cleaning_schedules_dates ON cleaning_schedules(start_date, end_date);

-- Cleaning tasks indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_facility_id ON cleaning_tasks(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_schedule_id ON cleaning_tasks(schedule_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_status ON cleaning_tasks(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_type ON cleaning_tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_assigned_to ON cleaning_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_due_date ON cleaning_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_completed_at ON cleaning_tasks(completed_at);
CREATE INDEX IF NOT EXISTS idx_cleaning_tasks_location ON cleaning_tasks(location);

-- Cleaning supplies indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_supplies_facility_id ON cleaning_supplies(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_supplies_category ON cleaning_supplies(category);
CREATE INDEX IF NOT EXISTS idx_cleaning_supplies_active ON cleaning_supplies(is_active);
CREATE INDEX IF NOT EXISTS idx_cleaning_supplies_expiration ON cleaning_supplies(expiration_date);

-- Cleaning equipment indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_equipment_facility_id ON cleaning_equipment(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_equipment_status ON cleaning_equipment(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_equipment_category ON cleaning_equipment(category);
CREATE INDEX IF NOT EXISTS idx_cleaning_equipment_maintenance ON cleaning_equipment(next_maintenance_date);

-- Environmental monitoring indexes
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_facility_id ON environmental_monitoring(facility_id);
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_type ON environmental_monitoring(monitoring_type);
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_location ON environmental_monitoring(location);
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_status ON environmental_monitoring(reading_status);
CREATE INDEX IF NOT EXISTS idx_environmental_monitoring_recorded_at ON environmental_monitoring(recorded_at);

-- Cleaning compliance records indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_compliance_facility_id ON cleaning_compliance_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_compliance_task_id ON cleaning_compliance_records(task_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_compliance_type ON cleaning_compliance_records(compliance_type);
CREATE INDEX IF NOT EXISTS idx_cleaning_compliance_status ON cleaning_compliance_records(compliance_status);
CREATE INDEX IF NOT EXISTS idx_cleaning_compliance_audit_date ON cleaning_compliance_records(audit_date);

-- Cleaning incidents indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_facility_id ON cleaning_incidents(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_task_id ON cleaning_incidents(task_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_type ON cleaning_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_severity ON cleaning_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_status ON cleaning_incidents(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_incidents_reported_at ON cleaning_incidents(reported_at);

-- Cleaning training records indexes
CREATE INDEX IF NOT EXISTS idx_cleaning_training_facility_id ON cleaning_training_records(facility_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_training_user_id ON cleaning_training_records(user_id);
CREATE INDEX IF NOT EXISTS idx_cleaning_training_type ON cleaning_training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_cleaning_training_status ON cleaning_training_records(status);
CREATE INDEX IF NOT EXISTS idx_cleaning_training_expiry ON cleaning_training_records(expiry_date);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE cleaning_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE environmental_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_compliance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE cleaning_training_records ENABLE ROW LEVEL SECURITY;

-- Cleaning schedules policies
CREATE POLICY "Users can view cleaning schedules in their facilities" ON cleaning_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_schedules.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning schedules in their facilities" ON cleaning_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_schedules.facility_id
        )
    );

-- Cleaning tasks policies
CREATE POLICY "Users can view cleaning tasks in their facilities" ON cleaning_tasks
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_tasks.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning tasks in their facilities" ON cleaning_tasks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_tasks.facility_id
        )
    );

-- Cleaning supplies policies
CREATE POLICY "Users can view cleaning supplies in their facilities" ON cleaning_supplies
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_supplies.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning supplies in their facilities" ON cleaning_supplies
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_supplies.facility_id
        )
    );

-- Cleaning equipment policies
CREATE POLICY "Users can view cleaning equipment in their facilities" ON cleaning_equipment
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_equipment.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning equipment in their facilities" ON cleaning_equipment
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_equipment.facility_id
        )
    );

-- Environmental monitoring policies
CREATE POLICY "Users can view environmental monitoring in their facilities" ON environmental_monitoring
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = environmental_monitoring.facility_id
        )
    );

CREATE POLICY "Users can manage environmental monitoring in their facilities" ON environmental_monitoring
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = environmental_monitoring.facility_id
        )
    );

-- Cleaning compliance records policies
CREATE POLICY "Users can view cleaning compliance records in their facilities" ON cleaning_compliance_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_compliance_records.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning compliance records in their facilities" ON cleaning_compliance_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_compliance_records.facility_id
        )
    );

-- Cleaning incidents policies
CREATE POLICY "Users can view cleaning incidents in their facilities" ON cleaning_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_incidents.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning incidents in their facilities" ON cleaning_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_incidents.facility_id
        )
    );

-- Cleaning training records policies
CREATE POLICY "Users can view cleaning training records in their facilities" ON cleaning_training_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_training_records.facility_id
        )
    );

CREATE POLICY "Users can manage cleaning training records in their facilities" ON cleaning_training_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = cleaning_training_records.facility_id
        )
    );

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Create cleaning tasks from schedules
CREATE OR REPLACE FUNCTION create_cleaning_tasks_from_schedule()
RETURNS TRIGGER AS $$
BEGIN
    -- This function would be called by a scheduled job to create tasks from active schedules
    -- For now, we'll create a placeholder function
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update task status when completed
CREATE OR REPLACE FUNCTION update_task_completion()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        NEW.completed_at = NOW();
        NEW.completed_by = auth.uid();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_task_completion
    BEFORE UPDATE ON cleaning_tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_task_completion();

-- Create incident alert
CREATE OR REPLACE FUNCTION create_incident_alert()
RETURNS TRIGGER AS $$
BEGIN
    -- Create alert for critical incidents
    IF NEW.severity IN ('high', 'critical') THEN
        INSERT INTO notifications (
            facility_id, user_id, title, message, type, priority, created_by
        ) VALUES (
            NEW.facility_id, NEW.reported_by, 
            'Cleaning Incident: ' || NEW.incident_type,
            'A ' || NEW.severity || ' severity incident has been reported: ' || NEW.description,
            'incident', NEW.severity, NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_incident_alert
    AFTER INSERT ON cleaning_incidents
    FOR EACH ROW
    EXECUTE FUNCTION create_incident_alert();

-- Check environmental monitoring alerts
CREATE OR REPLACE FUNCTION check_environmental_alerts()
RETURNS TRIGGER AS $$
BEGIN
    -- Create alert for out-of-range readings
    IF NEW.reading_status IN ('warning', 'critical') THEN
        INSERT INTO notifications (
            facility_id, user_id, title, message, type, priority, created_by
        ) VALUES (
            NEW.facility_id, NEW.created_by,
            'Environmental Alert: ' || NEW.monitoring_type,
            NEW.parameter_name || ' reading is ' || NEW.reading_status || ': ' || NEW.parameter_value || ' ' || COALESCE(NEW.unit_of_measure, ''),
            'environmental', NEW.reading_status, NEW.created_by
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_environmental_alerts
    AFTER INSERT ON environmental_monitoring
    FOR EACH ROW
    EXECUTE FUNCTION check_environmental_alerts();

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Get cleaning analytics
CREATE OR REPLACE FUNCTION get_cleaning_analytics(facility_uuid UUID, start_date DATE, end_date DATE)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_tasks', COUNT(*),
        'completed_tasks', COUNT(*) FILTER (WHERE status = 'completed'),
        'overdue_tasks', COUNT(*) FILTER (WHERE status = 'overdue'),
        'pending_tasks', COUNT(*) FILTER (WHERE status = 'pending'),
        'completion_rate', CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE status = 'completed')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END,
        'average_completion_time', AVG(EXTRACT(EPOCH FROM (completed_at - assigned_at))/3600) FILTER (WHERE status = 'completed'),
        'tasks_by_type', (
            SELECT jsonb_object_agg(task_type, count)
            FROM (
                SELECT task_type, COUNT(*) as count
                FROM cleaning_tasks
                WHERE facility_id = facility_uuid 
                    AND due_date::DATE BETWEEN start_date AND end_date
                GROUP BY task_type
            ) subq
        ),
        'tasks_by_priority', (
            SELECT jsonb_object_agg(priority, count)
            FROM (
                SELECT priority, COUNT(*) as count
                FROM cleaning_tasks
                WHERE facility_id = facility_uuid 
                    AND due_date::DATE BETWEEN start_date AND end_date
                GROUP BY priority
            ) subq
        )
    ) INTO result
    FROM cleaning_tasks
    WHERE facility_id = facility_uuid 
        AND due_date::DATE BETWEEN start_date AND end_date;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get environmental monitoring summary
CREATE OR REPLACE FUNCTION get_environmental_summary(facility_uuid UUID, days INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_readings', COUNT(*),
        'normal_readings', COUNT(*) FILTER (WHERE reading_status = 'normal'),
        'warning_readings', COUNT(*) FILTER (WHERE reading_status = 'warning'),
        'critical_readings', COUNT(*) FILTER (WHERE reading_status = 'critical'),
        'readings_by_type', (
            SELECT jsonb_object_agg(monitoring_type, jsonb_build_object(
                'total', count,
                'normal', normal_count,
                'warning', warning_count,
                'critical', critical_count
            ))
            FROM (
                SELECT 
                    monitoring_type,
                    COUNT(*) as count,
                    COUNT(*) FILTER (WHERE reading_status = 'normal') as normal_count,
                    COUNT(*) FILTER (WHERE reading_status = 'warning') as warning_count,
                    COUNT(*) FILTER (WHERE reading_status = 'critical') as critical_count
                FROM environmental_monitoring
                WHERE facility_id = facility_uuid 
                    AND recorded_at >= CURRENT_DATE - (days || ' days')::INTERVAL
                GROUP BY monitoring_type
            ) subq
        ),
        'recent_alerts', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'location', location,
                'monitoring_type', monitoring_type,
                'parameter_name', parameter_name,
                'parameter_value', parameter_value,
                'reading_status', reading_status,
                'recorded_at', recorded_at
            ))
            FROM (
                SELECT id, location, monitoring_type, parameter_name, parameter_value, reading_status, recorded_at
                FROM environmental_monitoring
                WHERE facility_id = facility_uuid 
                    AND reading_status IN ('warning', 'critical')
                    AND recorded_at >= CURRENT_DATE - (days || ' days')::INTERVAL
                ORDER BY recorded_at DESC
                LIMIT 10
            ) subq
        )
    ) INTO result
    FROM environmental_monitoring
    WHERE facility_id = facility_uuid 
        AND recorded_at >= CURRENT_DATE - (days || ' days')::INTERVAL;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get compliance summary
CREATE OR REPLACE FUNCTION get_compliance_summary(facility_uuid UUID)
RETURNS JSONB AS $$
DECLARE
    result JSONB;
BEGIN
    SELECT jsonb_build_object(
        'total_records', COUNT(*),
        'compliant_records', COUNT(*) FILTER (WHERE compliance_status = 'compliant'),
        'non_compliant_records', COUNT(*) FILTER (WHERE compliance_status = 'non_compliant'),
        'partial_compliant_records', COUNT(*) FILTER (WHERE compliance_status = 'partial'),
        'compliance_rate', CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE compliance_status = 'compliant')::DECIMAL / COUNT(*)) * 100, 2)
            ELSE 0
        END,
        'compliance_by_type', (
            SELECT jsonb_object_agg(compliance_type, jsonb_build_object(
                'total', count,
                'compliant', compliant_count,
                'non_compliant', non_compliant_count
            ))
            FROM (
                SELECT 
                    compliance_type,
                    COUNT(*) as count,
                    COUNT(*) FILTER (WHERE compliance_status = 'compliant') as compliant_count,
                    COUNT(*) FILTER (WHERE compliance_status = 'non_compliant') as non_compliant_count
                FROM cleaning_compliance_records
                WHERE facility_id = facility_uuid
                GROUP BY compliance_type
            ) subq
        ),
        'upcoming_audits', (
            SELECT jsonb_agg(jsonb_build_object(
                'id', id,
                'standard_name', standard_name,
                'next_audit_date', next_audit_date,
                'days_until_audit', next_audit_date - CURRENT_DATE
            ))
            FROM (
                SELECT id, standard_name, next_audit_date
                FROM cleaning_compliance_records
                WHERE facility_id = facility_uuid 
                    AND next_audit_date IS NOT NULL
                    AND next_audit_date >= CURRENT_DATE
                ORDER BY next_audit_date
                LIMIT 10
            ) subq
        )
    ) INTO result
    FROM cleaning_compliance_records
    WHERE facility_id = facility_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SAMPLE DATA (COMMENTED OUT - REQUIRES FACILITIES TO BE CREATED FIRST)
-- =====================================================

-- Sample data will be inserted after facilities are created
-- This ensures foreign key constraints are satisfied

-- =====================================================
-- MIGRATION COMPLETE
-- ===================================================== 