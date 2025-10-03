-- Migration: Add bi_test_results table for BI workflow service
-- This table matches the BIWorkflowService expectations

CREATE TABLE IF NOT EXISTS bi_test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE SET NULL,
    test_number VARCHAR(100) UNIQUE,
    test_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    result VARCHAR(20) NOT NULL CHECK (result IN ('pass', 'fail', 'skip')),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    bi_lot_number VARCHAR(100),
    bi_expiry_date DATE,
    incubation_time_minutes INTEGER,
    incubation_temperature_celsius DECIMAL(5,2),
    test_conditions JSONB DEFAULT '{}',
    failure_reason TEXT,
    skip_reason TEXT,
    compliance_notes TEXT,
    audit_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bi_test_results_facility_id ON bi_test_results(facility_id);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_operator_id ON bi_test_results(operator_id);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_cycle_id ON bi_test_results(cycle_id);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_test_date ON bi_test_results(test_date);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_result ON bi_test_results(result);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_status ON bi_test_results(status);
CREATE INDEX IF NOT EXISTS idx_bi_test_results_test_number ON bi_test_results(test_number);

-- Add updated_at trigger
CREATE TRIGGER update_bi_test_results_updated_at 
    BEFORE UPDATE ON bi_test_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE bi_test_results ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their facility's BI test results
CREATE POLICY "Users can view BI test results from their facility" ON bi_test_results
    FOR SELECT USING (
        facility_id = (
            SELECT facility_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Policy for users to insert BI test results for their facility
CREATE POLICY "Users can insert BI test results for their facility" ON bi_test_results
    FOR INSERT WITH CHECK (
        facility_id = (
            SELECT facility_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Policy for users to update BI test results from their facility
CREATE POLICY "Users can update BI test results from their facility" ON bi_test_results
    FOR UPDATE USING (
        facility_id = (
            SELECT facility_id FROM users 
            WHERE id = auth.uid()
        )
    );

-- Policy for users to delete BI test results from their facility
CREATE POLICY "Users can delete BI test results from their facility" ON bi_test_results
    FOR DELETE USING (
        facility_id = (
            SELECT facility_id FROM users 
            WHERE id = auth.uid()
        )
    ); 