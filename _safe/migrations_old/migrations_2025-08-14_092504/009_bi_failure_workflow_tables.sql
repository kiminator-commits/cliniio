-- Migration: Add BI Failure Workflow Tables
-- This migration adds the missing tables for BI failure incident management and workflow resolution

-- BI Failure Incidents table (main incidents table)
CREATE TABLE IF NOT EXISTS bi_failure_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    incident_number VARCHAR(100) UNIQUE NOT NULL,
    incident_type VARCHAR(100) NOT NULL CHECK (incident_type IN ('positive_bi', 'equipment_failure', 'process_failure', 'quarantine_breach', 'other')),
    severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'closed', 'cancelled')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    affected_cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE SET NULL,
    affected_batch_id UUID REFERENCES sterilization_batches(id) ON DELETE SET NULL,
    affected_tools JSONB DEFAULT '[]',
    patient_impact_assessment JSONB DEFAULT '{}',
    risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
    assigned_operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    investigation_notes TEXT,
    root_cause_analysis TEXT,
    corrective_actions JSONB DEFAULT '[]',
    preventive_measures JSONB DEFAULT '[]',
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- BI Resolution Workflows table (workflow steps for incident resolution)
CREATE TABLE IF NOT EXISTS bi_resolution_workflows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bi_failure_incident_id UUID NOT NULL REFERENCES bi_failure_incidents(id) ON DELETE CASCADE,
    step_id VARCHAR(100) NOT NULL,
    workflow_step VARCHAR(255) NOT NULL,
    step_status VARCHAR(50) DEFAULT 'pending' CHECK (step_status IN ('pending', 'in_progress', 'completed', 'failed', 'skipped')),
    step_order INTEGER NOT NULL,
    assigned_operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    step_notes TEXT,
    step_data JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(bi_failure_incident_id, step_id)
);

-- Quarantined Tools table (tools quarantined due to BI failures)
CREATE TABLE IF NOT EXISTS quarantined_tools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bi_failure_incident_id UUID NOT NULL REFERENCES bi_failure_incidents(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES sterilization_tools(id) ON DELETE CASCADE,
    tool_name VARCHAR(255) NOT NULL,
    batch_id UUID REFERENCES sterilization_batches(id) ON DELETE SET NULL,
    sterilization_cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE SET NULL,
    quarantine_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    quarantine_location VARCHAR(255),
    quarantine_reason TEXT NOT NULL,
    quarantine_notes TEXT,
    risk_assessment VARCHAR(20) DEFAULT 'medium' CHECK (risk_assessment IN ('low', 'medium', 'high', 'critical')),
    release_criteria JSONB DEFAULT '[]',
    released_at TIMESTAMP WITH TIME ZONE,
    released_by UUID REFERENCES users(id) ON DELETE SET NULL,
    release_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(tool_id, bi_failure_incident_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_facility_id ON bi_failure_incidents(facility_id);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_incident_number ON bi_failure_incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_type ON bi_failure_incidents(incident_type);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_status ON bi_failure_incidents(status);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_severity ON bi_failure_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_assigned_operator ON bi_failure_incidents(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_created_at ON bi_failure_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_cycle_id ON bi_failure_incidents(affected_cycle_id);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_batch_id ON bi_failure_incidents(affected_batch_id);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_tools_gin ON bi_failure_incidents USING GIN (affected_tools);
CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_patient_impact_gin ON bi_failure_incidents USING GIN (patient_impact_assessment);

CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_incident_id ON bi_resolution_workflows(bi_failure_incident_id);
CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_step_id ON bi_resolution_workflows(step_id);
CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_status ON bi_resolution_workflows(step_status);
CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_order ON bi_resolution_workflows(step_order);
CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_assigned_operator ON bi_resolution_workflows(assigned_operator_id);
CREATE INDEX IF NOT EXISTS idx_bi_resolution_workflows_data_gin ON bi_resolution_workflows USING GIN (step_data);

CREATE INDEX IF NOT EXISTS idx_quarantined_tools_incident_id ON quarantined_tools(bi_failure_incident_id);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_tool_id ON quarantined_tools(tool_id);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_batch_id ON quarantined_tools(batch_id);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_cycle_id ON quarantined_tools(sterilization_cycle_id);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_quarantine_date ON quarantined_tools(quarantine_date);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_released_at ON quarantined_tools(released_at);
CREATE INDEX IF NOT EXISTS idx_quarantined_tools_release_criteria_gin ON quarantined_tools USING GIN (release_criteria);

-- Enable Row Level Security
ALTER TABLE bi_failure_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE bi_resolution_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarantined_tools ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for bi_failure_incidents
CREATE POLICY "Users can view incidents for their facility" ON bi_failure_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = bi_failure_incidents.facility_id
        )
    );

CREATE POLICY "Users can manage incidents for their facility" ON bi_failure_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND facility_id = bi_failure_incidents.facility_id
        )
    );

-- Create RLS policies for bi_resolution_workflows
CREATE POLICY "Users can view workflows for their facility" ON bi_resolution_workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bi_failure_incidents bi
            JOIN users u ON u.facility_id = bi.facility_id
            WHERE u.id = auth.uid() AND bi.id = bi_resolution_workflows.bi_failure_incident_id
        )
    );

CREATE POLICY "Users can manage workflows for their facility" ON bi_resolution_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bi_failure_incidents bi
            JOIN users u ON u.facility_id = bi.facility_id
            WHERE u.id = auth.uid() AND bi.id = bi_resolution_workflows.bi_failure_incident_id
        )
    );

-- Create RLS policies for quarantined_tools
CREATE POLICY "Users can view quarantined tools for their facility" ON quarantined_tools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bi_failure_incidents bi
            JOIN users u ON u.facility_id = bi.facility_id
            WHERE u.id = auth.uid() AND bi.id = quarantined_tools.bi_failure_incident_id
        )
    );

CREATE POLICY "Users can manage quarantined tools for their facility" ON quarantined_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM bi_failure_incidents bi
            JOIN users u ON u.facility_id = bi.facility_id
            WHERE u.id = auth.uid() AND bi.id = quarantined_tools.bi_failure_incident_id
        )
    );

-- Create triggers for updated_at columns
CREATE TRIGGER update_bi_failure_incidents_updated_at BEFORE UPDATE ON bi_failure_incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bi_resolution_workflows_updated_at BEFORE UPDATE ON bi_resolution_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quarantined_tools_updated_at BEFORE UPDATE ON quarantined_tools
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate incident numbers
CREATE OR REPLACE FUNCTION generate_incident_number()
RETURNS TRIGGER AS $$
DECLARE
    next_number INTEGER;
    facility_code VARCHAR(10);
BEGIN
    -- Get facility code (first 3 letters of facility name or 'FAC' as default)
    SELECT COALESCE(UPPER(LEFT(name, 3)), 'FAC') INTO facility_code
    FROM facilities WHERE id = NEW.facility_id;
    
    -- Get next number for this facility
    SELECT COALESCE(MAX(CAST(SUBSTRING(incident_number FROM LENGTH(facility_code) + 2) AS INTEGER)), 0) + 1
    INTO next_number
    FROM bi_failure_incidents
    WHERE facility_id = NEW.facility_id;
    
    -- Set the incident number
    NEW.incident_number := facility_code || '-' || LPAD(next_number::TEXT, 6, '0');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate incident numbers
CREATE TRIGGER generate_incident_number_trigger
    BEFORE INSERT ON bi_failure_incidents
    FOR EACH ROW
    WHEN (NEW.incident_number IS NULL OR NEW.incident_number = '')
    EXECUTE FUNCTION generate_incident_number();

-- Create function to release tools from quarantine
CREATE OR REPLACE FUNCTION release_tools_from_quarantine(
    p_incident_id UUID,
    p_tool_ids UUID[],
    p_released_by_operator_id UUID,
    p_release_notes TEXT DEFAULT ''
)
RETURNS INTEGER AS $$
DECLARE
    released_count INTEGER := 0;
    tool_id UUID;
BEGIN
    -- Release each tool
    FOREACH tool_id IN ARRAY p_tool_ids
    LOOP
        UPDATE quarantined_tools
        SET 
            released_at = NOW(),
            released_by = p_released_by_operator_id,
            release_notes = p_release_notes,
            updated_at = NOW()
        WHERE 
            bi_failure_incident_id = p_incident_id 
            AND tool_id = tool_id
            AND released_at IS NULL;
        
        IF FOUND THEN
            released_count := released_count + 1;
            
            -- Update tool status back to available
            UPDATE sterilization_tools
            SET 
                status = 'available',
                updated_at = NOW()
            WHERE id = tool_id;
        END IF;
    END LOOP;
    
    RETURN released_count;
END;
$$ LANGUAGE plpgsql; 