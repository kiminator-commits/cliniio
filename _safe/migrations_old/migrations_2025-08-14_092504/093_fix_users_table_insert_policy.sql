-- =====================================================
-- FIX USERS TABLE INSERT POLICY
-- =====================================================
-- This migration adds an INSERT policy for the users table
-- so authenticated users can create their own profile

-- Add policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id
    ); 