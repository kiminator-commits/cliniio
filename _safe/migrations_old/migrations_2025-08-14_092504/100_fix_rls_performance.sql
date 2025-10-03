-- =====================================================
-- FIX RLS PERFORMANCE ISSUES
-- =====================================================
-- This migration fixes the auth_rls_initplan warnings by wrapping
-- auth.uid() calls in subqueries to prevent re-evaluation for each row

-- =====================================================
-- BI FAILURES TABLE - Fix the specific issue mentioned
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view bi failures" ON bi_failures;
DROP POLICY IF EXISTS "Users can insert bi failures" ON bi_failures;

-- Create optimized policies with subqueries
CREATE POLICY "Users can view bi failures" ON bi_failures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    );

CREATE POLICY "Users can insert bi failures" ON bi_failures
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    );

-- =====================================================
-- USERS TABLE - Fix auth.uid() performance issues
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;

-- Create optimized policies
CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (
        id = (SELECT auth.uid())
    );

CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (
        id = (SELECT auth.uid())
    );

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (
        id = (SELECT auth.uid())
    );

-- =====================================================
-- HOME CHALLENGE COMPLETIONS - Fix auth.uid() performance
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON home_challenge_completions;
DROP POLICY IF EXISTS "Users can manage their own challenge completions" ON home_challenge_completions;

-- Create optimized policies
CREATE POLICY "Users can view their own challenge completions" ON home_challenge_completions
    FOR SELECT USING (
        user_id = (SELECT auth.uid())
    );

CREATE POLICY "Users can manage their own challenge completions" ON home_challenge_completions
    FOR ALL USING (
        user_id = (SELECT auth.uid())
    );

-- =====================================================
-- KNOWLEDGE USER PROGRESS - Fix auth.uid() performance
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own learning progress" ON knowledge_user_progress;
DROP POLICY IF EXISTS "Users can manage their own learning progress" ON knowledge_user_progress;

-- Create optimized policies
CREATE POLICY "Users can view their own learning progress" ON knowledge_user_progress
    FOR SELECT USING (
        user_id = (SELECT auth.uid())
    );

CREATE POLICY "Users can manage their own learning progress" ON knowledge_user_progress
    FOR ALL USING (
        user_id = (SELECT auth.uid())
    );

-- =====================================================
-- KNOWLEDGE QUIZ ATTEMPTS - Fix auth.uid() performance
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON knowledge_quiz_attempts;
DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON knowledge_quiz_attempts;

-- Create optimized policies
CREATE POLICY "Users can view their own quiz attempts" ON knowledge_quiz_attempts
    FOR SELECT USING (
        user_id = (SELECT auth.uid())
    );

CREATE POLICY "Users can manage their own quiz attempts" ON knowledge_quiz_attempts
    FOR ALL USING (
        user_id = (SELECT auth.uid())
    );

-- =====================================================
-- FACILITY-BASED TABLES - Fix auth.uid() performance
-- =====================================================

-- Facilities table
DROP POLICY IF EXISTS "Users can view facilities for their facility" ON facilities;
CREATE POLICY "Users can view facilities for their facility" ON facilities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = facilities.id
        )
    );

-- Audit logs
DROP POLICY IF EXISTS "Users can view audit logs for their facility" ON audit_logs;
CREATE POLICY "Users can view audit logs for their facility" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = audit_logs.facility_id
        )
    );

-- AI events
DROP POLICY IF EXISTS "Users can view AI events for their facility" ON ai_events;
CREATE POLICY "Users can view AI events for their facility" ON ai_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = ai_events.facility_id
        )
    );

-- Dashboard metrics
DROP POLICY IF EXISTS "Users can view dashboard metrics for their facility" ON dashboard_metrics;
CREATE POLICY "Users can view dashboard metrics for their facility" ON dashboard_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = dashboard_metrics.facility_id
        )
    );

-- Activity feed
DROP POLICY IF EXISTS "Users can view activity feed for their facility" ON activity_feed;
CREATE POLICY "Users can view activity feed for their facility" ON activity_feed
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = activity_feed.facility_id
        )
    );

-- Inventory items
DROP POLICY IF EXISTS "Users can view inventory items for their facility" ON inventory_items;
CREATE POLICY "Users can view inventory items for their facility" ON inventory_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = inventory_items.facility_id
        )
    );

-- Sterilization cycles
DROP POLICY IF EXISTS "Users can view sterilization cycles for their facility" ON sterilization_cycles;
CREATE POLICY "Users can view sterilization cycles for their facility" ON sterilization_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = sterilization_cycles.facility_id
        )
    );

-- Biological indicators
DROP POLICY IF EXISTS "Users can view biological indicators for their facility" ON biological_indicators;
CREATE POLICY "Users can view biological indicators for their facility" ON biological_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = biological_indicators.facility_id
        )
    );

-- Home challenges
DROP POLICY IF EXISTS "Users can view challenges for their facility" ON home_challenges;
CREATE POLICY "Users can view challenges for their facility" ON home_challenges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = home_challenges.facility_id
        )
    );

-- Knowledge feedback
DROP POLICY IF EXISTS "Users can view feedback for their facility" ON knowledge_feedback;
CREATE POLICY "Users can view feedback for their facility" ON knowledge_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = knowledge_feedback.facility_id
        )
    );

-- =====================================================
-- VERIFICATION
-- =====================================================
-- This migration fixes the auth_rls_initplan warnings by:
-- 1. Wrapping all auth.uid() calls in (SELECT auth.uid()) subqueries
-- 2. Using EXISTS clauses with subqueries for facility-based access control
-- 3. Preventing re-evaluation of auth functions for each row
-- 4. Improving query performance at scale 