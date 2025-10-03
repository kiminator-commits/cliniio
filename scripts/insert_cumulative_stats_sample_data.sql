-- Create tables and insert sample data for cumulative stats
-- Run this in Supabase SQL Editor

-- First, create the home_challenges table if it doesn't exist
CREATE TABLE IF NOT EXISTS home_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('knowledge', 'process', 'quality', 'collaboration', 'daily', 'team')),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER NOT NULL DEFAULT 0,
    time_estimate VARCHAR(100) NOT NULL,
    facility_id UUID NOT NULL,
    created_by UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT true
);

-- Create the home_challenge_completions table if it doesn't exist
CREATE TABLE IF NOT EXISTS home_challenge_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    challenge_id UUID NOT NULL,
    user_id UUID NOT NULL,
    facility_id UUID NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    points_earned INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(challenge_id, user_id)
);

-- Create the sterilization_cycles table if it doesn't exist
CREATE TABLE IF NOT EXISTS sterilization_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL,
    cycle_type VARCHAR(50),
    cycle_number VARCHAR(100),
    operator_id UUID,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    temperature_celsius NUMERIC(5,2),
    pressure_psi NUMERIC(6,2),
    status VARCHAR(50),
    parameters JSONB,
    results JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the sterilization_tools table if it doesn't exist
CREATE TABLE IF NOT EXISTS sterilization_tools (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    facility_id UUID NOT NULL,
    name VARCHAR(255),
    barcode VARCHAR(100) UNIQUE,
    status VARCHAR(50),
    sterilization_count INTEGER DEFAULT 0,
    last_sterilized_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample home challenges
INSERT INTO home_challenges (
    title,
    description,
    category,
    difficulty,
    points,
    time_estimate,
    facility_id,
    created_by
) VALUES 
(
    'Complete Daily Tasks',
    'Complete all assigned tasks for the day',
    'daily',
    'easy',
    50,
    '2 hours',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Team Collaboration',
    'Participate in team meetings and discussions',
    'team',
    'medium',
    100,
    '4 hours',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Sterilization Sprint',
    'Complete sterilization for 10 tools',
    'process',
    'easy',
    50,
    '5 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Inventory Master',
    'Update inventory counts for 5 high-priority items',
    'quality',
    'medium',
    75,
    '10 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Deep Clean Champion',
    'Complete a thorough cleaning of the sterilization area',
    'collaboration',
    'easy',
    50,
    '5 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Process Optimization',
    'Identify and implement one process improvement',
    'process',
    'hard',
    100,
    '15 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Knowledge Sharing',
    'Share a best practice with a colleague',
    'knowledge',
    'easy',
    25,
    '5 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Quality Check',
    'Perform a thorough quality check on completed work',
    'quality',
    'medium',
    75,
    '10 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
)
ON CONFLICT DO NOTHING;

-- Insert sample challenge completions
INSERT INTO home_challenge_completions (
    challenge_id,
    user_id,
    facility_id,
    completed_at,
    points_earned
) 
SELECT 
    hc.id,
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT,
    hc.points
FROM home_challenges hc
WHERE hc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 15
ON CONFLICT DO NOTHING;

-- Insert sample sterilization cycles
INSERT INTO sterilization_cycles (
    facility_id,
    cycle_type,
    cycle_number,
    operator_id,
    start_time,
    end_time,
    duration_minutes,
    temperature_celsius,
    pressure_psi,
    status,
    parameters,
    results,
    notes
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    CASE (RANDOM() * 2)::INT WHEN 0 THEN 'gravity' WHEN 1 THEN 'pre_vacuum' ELSE 'flash' END,
    'CYCLE-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    '550e8400-e29b-41d4-a716-446655440001',
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 minute' * (RANDOM() * 30)::INT,
    FLOOR(RANDOM() * 45 + 15)::INT,
    (RANDOM() * 5 + 130)::NUMERIC(5,2),
    (RANDOM() * 5 + 15)::NUMERIC(6,2),
    'completed',
    '{"load_size": "medium", "equipment_id": "AC001"}'::JSONB,
    '{"bi_test_passed": true, "quality_score": 95}'::JSONB,
    'Standard sterilization cycle'
FROM generate_series(1, 50)
ON CONFLICT DO NOTHING;

-- Insert sample sterilization tools
INSERT INTO sterilization_tools (
    facility_id,
    name,
    barcode,
    status,
    sterilization_count,
    last_sterilized_at,
    created_at
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    'Tool-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 3, '0'),
    'BC' || LPAD((ROW_NUMBER() OVER ())::TEXT, 6, '0'),
    'available',
    FLOOR(RANDOM() * 20 + 1)::INT,
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::INT,
    NOW() - INTERVAL '1 day' * (RANDOM() * 60)::INT
FROM generate_series(1, 100)
ON CONFLICT DO NOTHING;
