-- =====================================================
-- FIX USERS RLS INFINITE RECURSION
-- =====================================================

-- Drop the problematic policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Create a simpler policy that doesn't cause infinite recursion
-- Instead of checking the users table within the users table policy,
-- we'll use a more direct approach
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Also fix the facilities policy that has the same issue
DROP POLICY IF EXISTS "Admins can manage facilities" ON facilities;

CREATE POLICY "Admins can manage facilities" ON facilities
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Fix audit logs policy that references users table
DROP POLICY IF EXISTS "Users can view audit logs for their facility" ON audit_logs;

CREATE POLICY "Users can view audit logs for their facility" ON audit_logs
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Fix AI events policy that references users table
DROP POLICY IF EXISTS "Users can view AI events for their facility" ON ai_events;

CREATE POLICY "Users can view AI events for their facility" ON ai_events
    FOR SELECT USING (
        auth.uid() = user_id OR
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Add a simple policy for inventory_items to allow authenticated users to access
DROP POLICY IF EXISTS "Users can view inventory items" ON inventory_items;
DROP POLICY IF EXISTS "Users can manage inventory items" ON inventory_items;

CREATE POLICY "Users can view inventory items" ON inventory_items
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage inventory items" ON inventory_items
    FOR ALL USING (auth.role() = 'authenticated'); 