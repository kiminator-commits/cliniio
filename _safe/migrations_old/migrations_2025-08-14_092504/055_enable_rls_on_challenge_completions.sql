-- Migration: Enable RLS on home_challenge_completions table
-- This migration enables Row Level Security on the home_challenge_completions table
-- so the existing RLS policies can properly control access to the data

-- Enable RLS on home_challenge_completions table
ALTER TABLE home_challenge_completions ENABLE ROW LEVEL SECURITY;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'home_challenge_completions'; 