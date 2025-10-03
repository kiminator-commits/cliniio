-- Migration: Add home_challenges table for Today's Challenge functionality
-- This table stores challenges that appear in the Today's Challenge Modal

-- Create the home_challenges table
CREATE TABLE IF NOT EXISTS home_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('knowledge', 'process', 'quality', 'collaboration', 'daily', 'team')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER NOT NULL DEFAULT 0,
    time_estimate VARCHAR(100) NOT NULL,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_home_challenges_facility_id ON home_challenges(facility_id);
CREATE INDEX IF NOT EXISTS idx_home_challenges_category ON home_challenges(category);
CREATE INDEX IF NOT EXISTS idx_home_challenges_difficulty ON home_challenges(difficulty);
CREATE INDEX IF NOT EXISTS idx_home_challenges_is_active ON home_challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_home_challenges_created_at ON home_challenges(created_at);

-- Create a table to track user challenge completions
CREATE TABLE IF NOT EXISTS home_challenge_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL REFERENCES home_challenges(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create indexes for challenge completions
CREATE INDEX IF NOT EXISTS idx_home_challenge_completions_user_id ON home_challenge_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_challenge_completions_facility_id ON home_challenge_completions(facility_id);
CREATE INDEX IF NOT EXISTS idx_home_challenge_completions_completed_at ON home_challenge_completions(completed_at);

-- Enable Row Level Security (RLS)
ALTER TABLE home_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE home_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for home_challenges
CREATE POLICY "Users can view challenges for their facility" ON home_challenges
    FOR SELECT USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create challenges for their facility" ON home_challenges
    FOR INSERT WITH CHECK (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        ) AND
        created_by = auth.uid()
    );

CREATE POLICY "Users can update challenges for their facility" ON home_challenges
    FOR UPDATE USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete challenges for their facility" ON home_challenges
    FOR DELETE USING (
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Create RLS policies for home_challenge_completions
CREATE POLICY "Users can view their own challenge completions" ON home_challenge_completions
    FOR SELECT USING (
        user_id = auth.uid() AND
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can create their own challenge completions" ON home_challenge_completions
    FOR INSERT WITH CHECK (
        user_id = auth.uid() AND
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own challenge completions" ON home_challenge_completions
    FOR UPDATE USING (
        user_id = auth.uid() AND
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can delete their own challenge completions" ON home_challenge_completions
    FOR DELETE USING (
        user_id = auth.uid() AND
        facility_id IN (
            SELECT facility_id FROM users WHERE id = auth.uid()
        )
    );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_home_challenges_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_home_challenges_updated_at
    BEFORE UPDATE ON home_challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_home_challenges_updated_at();

-- Create function to log challenge completions
CREATE OR REPLACE FUNCTION log_challenge_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Log the completion in audit_logs
    INSERT INTO audit_logs (
        module,
        table_name,
        record_id,
        action,
        user_id,
        facility_id,
        old_values,
        new_values,
        ip_address
    ) VALUES (
        'home',
        'home_challenge_completions',
        NEW.id,
        'INSERT',
        NEW.user_id,
        NEW.facility_id,
        NULL,
        jsonb_build_object(
            'challenge_id', NEW.challenge_id,
            'points_earned', NEW.points_earned,
            'completed_at', NEW.completed_at
        ),
        NULL
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to log challenge completions
CREATE TRIGGER trigger_log_challenge_completion
    AFTER INSERT ON home_challenge_completions
    FOR EACH ROW
    EXECUTE FUNCTION log_challenge_completion();

-- Create function to get user's completed challenges
CREATE OR REPLACE FUNCTION get_user_completed_challenges(user_uuid UUID)
RETURNS TABLE (
    challenge_id UUID,
    title VARCHAR(255),
    description TEXT,
    category VARCHAR(50),
    difficulty VARCHAR(20),
    points INTEGER,
    completed_at TIMESTAMP WITH TIME ZONE,
    points_earned INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        hc.id as challenge_id,
        hc.title,
        hc.description,
        hc.category,
        hc.difficulty,
        hc.points,
        hcc.completed_at,
        hcc.points_earned
    FROM home_challenges hc
    INNER JOIN home_challenge_completions hcc ON hc.id = hcc.challenge_id
    WHERE hcc.user_id = user_uuid
    ORDER BY hcc.completed_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON home_challenges TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON home_challenge_completions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_completed_challenges(UUID) TO authenticated; 