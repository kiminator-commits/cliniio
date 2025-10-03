-- Migration: Insert test challenge completions for cumulative stats testing
-- This migration adds sample challenge completions to demonstrate the stats functionality

-- Insert test challenge completions for the existing test user
INSERT INTO home_challenge_completions (
    challenge_id,
    user_id,
    facility_id,
    points_earned,
    completed_at
) VALUES 
-- Complete some challenges from yesterday
(
    (SELECT id FROM home_challenges WHERE title = 'Complete Daily Tasks' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    50,
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM home_challenges WHERE title = 'Sterilization Sprint' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    50,
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM home_challenges WHERE title = 'Inventory Master' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    75,
    NOW() - INTERVAL '1 day'
),
-- Complete some challenges from 2 days ago
(
    (SELECT id FROM home_challenges WHERE title = 'Team Collaboration' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    100,
    NOW() - INTERVAL '2 days'
),
(
    (SELECT id FROM home_challenges WHERE title = 'Deep Clean Champion' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    50,
    NOW() - INTERVAL '2 days'
),
-- Complete some challenges from 3 days ago
(
    (SELECT id FROM home_challenges WHERE title = 'Knowledge Sharing' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    25,
    NOW() - INTERVAL '3 days'
),
(
    (SELECT id FROM home_challenges WHERE title = 'Quality Check' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    75,
    NOW() - INTERVAL '3 days'
),
-- Complete some challenges from 4 days ago
(
    (SELECT id FROM home_challenges WHERE title = 'Safety First' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    30,
    NOW() - INTERVAL '4 days'
),
-- Complete some challenges from 5 days ago
(
    (SELECT id FROM home_challenges WHERE title = 'Mentor Moment' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    80,
    NOW() - INTERVAL '5 days'
),
-- Complete one challenge from today
(
    (SELECT id FROM home_challenges WHERE title = 'Process Optimization' LIMIT 1),
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    100,
    NOW()
); 