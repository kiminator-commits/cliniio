-- =====================================================
-- Add Timer Events Table for Audit/Recovery
-- =====================================================

-- Timer events table for logging timer actions without interfering with existing timer logic
CREATE TABLE IF NOT EXISTS timer_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    cycle_id UUID REFERENCES sterilization_cycles(id) ON DELETE CASCADE,
    phase_name VARCHAR(100) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('start', 'pause', 'resume', 'complete', 'reset', 'overexposure_start', 'overexposure_end')),
    event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    duration_minutes INTEGER,
    elapsed_seconds INTEGER,
    remaining_seconds INTEGER,
    temperature_celsius DECIMAL(5,2),
    pressure_psi DECIMAL(6,2),
    metadata JSONB DEFAULT '{}',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_timer_events_facility_id ON timer_events(facility_id);
CREATE INDEX IF NOT EXISTS idx_timer_events_cycle_id ON timer_events(cycle_id);
CREATE INDEX IF NOT EXISTS idx_timer_events_phase_name ON timer_events(phase_name);
CREATE INDEX IF NOT EXISTS idx_timer_events_event_type ON timer_events(event_type);
CREATE INDEX IF NOT EXISTS idx_timer_events_timestamp ON timer_events(event_timestamp);

-- RLS policies
ALTER TABLE timer_events ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view timer events from their facility" ON timer_events;
DROP POLICY IF EXISTS "Users can insert timer events for their facility" ON timer_events;
DROP POLICY IF EXISTS "Users can update timer events from their facility" ON timer_events;

-- Users can only see timer events from their facility
CREATE POLICY "Users can view timer events from their facility" ON timer_events
    FOR SELECT USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Users can insert timer events for their facility
CREATE POLICY "Users can insert timer events for their facility" ON timer_events
    FOR INSERT WITH CHECK (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Users can update timer events from their facility
CREATE POLICY "Users can update timer events from their facility" ON timer_events
    FOR UPDATE USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_timer_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_timer_events_updated_at ON timer_events;
CREATE TRIGGER trigger_update_timer_events_updated_at
    BEFORE UPDATE ON timer_events
    FOR EACH ROW
    EXECUTE FUNCTION update_timer_events_updated_at();

-- Function to log timer events (safe to call from anywhere)
CREATE OR REPLACE FUNCTION log_timer_event(
    p_cycle_id UUID,
    p_phase_name VARCHAR(100),
    p_event_type VARCHAR(50),
    p_duration_minutes INTEGER DEFAULT NULL,
    p_elapsed_seconds INTEGER DEFAULT NULL,
    p_remaining_seconds INTEGER DEFAULT NULL,
    p_temperature_celsius DECIMAL(5,2) DEFAULT NULL,
    p_pressure_psi DECIMAL(6,2) DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}',
    p_notes TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_facility_id UUID;
    v_user_id UUID;
    v_event_id UUID;
BEGIN
    -- Get current user and facility
    v_user_id := auth.uid();
    
    -- Get facility ID from cycle or user
    IF p_cycle_id IS NOT NULL THEN
        SELECT facility_id INTO v_facility_id 
        FROM sterilization_cycles 
        WHERE id = p_cycle_id;
    ELSE
        SELECT facility_id INTO v_facility_id 
        FROM users 
        WHERE id = v_user_id;
    END IF;
    
    -- Insert timer event
    INSERT INTO timer_events (
        facility_id,
        user_id,
        cycle_id,
        phase_name,
        event_type,
        duration_minutes,
        elapsed_seconds,
        remaining_seconds,
        temperature_celsius,
        pressure_psi,
        metadata,
        notes
    ) VALUES (
        v_facility_id,
        v_user_id,
        p_cycle_id,
        p_phase_name,
        p_event_type,
        p_duration_minutes,
        p_elapsed_seconds,
        p_remaining_seconds,
        p_temperature_celsius,
        p_pressure_psi,
        p_metadata,
        p_notes
    ) RETURNING id INTO v_event_id;
    
    RETURN v_event_id;
END;
$$; 