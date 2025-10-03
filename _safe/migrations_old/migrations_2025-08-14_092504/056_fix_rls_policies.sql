-- Migration: Fix infinite recursion in RLS policies
-- This migration fixes the infinite recursion issue by simplifying the RLS policies

-- Drop existing policies that cause infinite recursion
DROP POLICY IF EXISTS "Users can view challenges for their facility" ON home_challenges;
DROP POLICY IF EXISTS "Users can create challenges for their facility" ON home_challenges;
DROP POLICY IF EXISTS "Users can update challenges for their facility" ON home_challenges;
DROP POLICY IF EXISTS "Users can delete challenges for their facility" ON home_challenges;

DROP POLICY IF EXISTS "Users can view their own challenge completions" ON home_challenge_completions;
DROP POLICY IF EXISTS "Users can create their own challenge completions" ON home_challenge_completions;
DROP POLICY IF EXISTS "Users can update their own challenge completions" ON home_challenge_completions;
DROP POLICY IF EXISTS "Users can delete their own challenge completions" ON home_challenge_completions;

-- Create simplified policies that don't cause infinite recursion
-- For home_challenges: Allow all authenticated users to view challenges
CREATE POLICY "Allow authenticated users to view challenges" ON home_challenges
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to create challenges" ON home_challenges
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update challenges" ON home_challenges
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete challenges" ON home_challenges
    FOR DELETE USING (auth.role() = 'authenticated');

-- For home_challenge_completions: Allow users to manage their own completions
CREATE POLICY "Allow users to view their own completions" ON home_challenge_completions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create their own completions" ON home_challenge_completions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own completions" ON home_challenge_completions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own completions" ON home_challenge_completions
    FOR DELETE USING (auth.uid() = user_id); 