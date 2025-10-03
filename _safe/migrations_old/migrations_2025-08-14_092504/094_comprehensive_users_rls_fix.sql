-- =====================================================
-- COMPREHENSIVE USERS TABLE RLS FIX
-- =====================================================
-- This migration completely replaces all RLS policies for the users table
-- to ensure users can create, view, and update their own profiles

-- First, drop all existing policies on the users table
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create comprehensive policies for the users table
-- Policy for users to insert their own profile
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (
        auth.uid() = id
    );

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        auth.uid() = id
    );

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        auth.uid() = id
    );

-- Policy for admins to view all users (using JWT role)
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    );

-- Policy for admins to manage all users
CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'service_role'
    ); 