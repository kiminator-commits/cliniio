-- Insert sample challenges for the Today's Challenge Modal
-- Run this script in the Supabase SQL Editor

-- Sample challenges based on the original mock data
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
),
(
    'Safety First',
    'Complete a safety checklist for your work area',
    'quality',
    'easy',
    30,
    '3 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
),
(
    'Mentor Moment',
    'Help train a new team member on a process',
    'collaboration',
    'medium',
    80,
    '20 minutes',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000'
); 