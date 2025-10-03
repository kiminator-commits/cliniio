-- Fix RLS policies for login-related operations
-- This migration addresses 403 errors during authentication

-- 1. Fix login_attempts table RLS policies
-- The current policy tries to match auth.uid() with id, but id is a UUID and auth.uid() is the user's ID
-- We need to allow authenticated users to insert login attempts for rate limiting

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own login attempts" ON login_attempts;

-- Create a better policy that allows users to view their own attempts by email
CREATE POLICY "Users can view their own login attempts" ON login_attempts
  FOR SELECT USING (
    auth.uid() IN (
      SELECT id FROM users WHERE email = login_attempts.email
    )
  );

-- Ensure anonymous users can still insert for rate limiting
-- (This policy should already exist, but let's make sure)
DROP POLICY IF EXISTS "Anonymous users can insert login attempts" ON login_attempts;
CREATE POLICY "Anonymous users can insert login attempts" ON login_attempts
  FOR INSERT WITH CHECK (true);

-- 2. Fix users table RLS policies for authentication
-- Allow service role to manage user profiles during authentication
CREATE POLICY "Service role can manage user profiles" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Allow users to update their own profile during login
-- The existing policy should work, but let's ensure it's correct
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 3. Ensure the monitoring_events table has proper RLS for service operations
-- Allow service role to insert monitoring events
CREATE POLICY "Service role can insert monitoring events" ON monitoring_events
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- Allow service role to read monitoring events
CREATE POLICY "Service role can read monitoring events" ON monitoring_events
  FOR SELECT USING (auth.role() = 'service_role');
