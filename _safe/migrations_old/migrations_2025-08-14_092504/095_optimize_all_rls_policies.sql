-- =====================================================
-- OPTIMIZE ALL RLS POLICIES FOR PERFORMANCE
-- =====================================================
-- This migration optimizes all RLS policies that use auth.uid() 
-- by wrapping them in subqueries to prevent re-evaluation for each row

-- Users table policies
DROP POLICY IF EXISTS "Users can view their own data" ON users;
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own data" ON users;
CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (id = (SELECT auth.uid()));

-- Facilities table policies
DROP POLICY IF EXISTS "Users can view facilities for their facility" ON facilities;
CREATE POLICY "Users can view facilities for their facility" ON facilities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = facilities.id
        )
    );

-- Audit logs policies
DROP POLICY IF EXISTS "Users can view audit logs for their facility" ON audit_logs;
CREATE POLICY "Users can view audit logs for their facility" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = audit_logs.facility_id
        )
    );

-- AI events policies
DROP POLICY IF EXISTS "Users can view AI events for their facility" ON ai_events;
CREATE POLICY "Users can view AI events for their facility" ON ai_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = ai_events.facility_id
        )
    );

-- Dashboard metrics policies
DROP POLICY IF EXISTS "Users can view dashboard metrics for their facility" ON dashboard_metrics;
CREATE POLICY "Users can view dashboard metrics for their facility" ON dashboard_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = dashboard_metrics.facility_id
        )
    );

-- Activity feed policies
DROP POLICY IF EXISTS "Users can view activity feed for their facility" ON activity_feed;
CREATE POLICY "Users can view activity feed for their facility" ON activity_feed
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = activity_feed.facility_id
        )
    );

-- Inventory policies
DROP POLICY IF EXISTS "Users can view inventory items for their facility" ON inventory_items;
CREATE POLICY "Users can view inventory items for their facility" ON inventory_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = inventory_items.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage inventory items for their facility" ON inventory_items;
CREATE POLICY "Users can manage inventory items for their facility" ON inventory_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = inventory_items.facility_id
        )
    );

-- Sterilization policies
DROP POLICY IF EXISTS "Users can view sterilization cycles for their facility" ON sterilization_cycles;
CREATE POLICY "Users can view sterilization cycles for their facility" ON sterilization_cycles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = sterilization_cycles.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage sterilization cycles for their facility" ON sterilization_cycles;
CREATE POLICY "Users can manage sterilization cycles for their facility" ON sterilization_cycles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = sterilization_cycles.facility_id
        )
    );

-- Biological indicators policies
DROP POLICY IF EXISTS "Users can view biological indicators for their facility" ON biological_indicators;
CREATE POLICY "Users can view biological indicators for their facility" ON biological_indicators
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = biological_indicators.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage biological indicators for their facility" ON biological_indicators;
CREATE POLICY "Users can manage biological indicators for their facility" ON biological_indicators
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = biological_indicators.facility_id
        )
    );

-- BI Failures policies (this fixes your specific issue)
DROP POLICY IF EXISTS "Users can view failures for their facility" ON bi_failures;
CREATE POLICY "Users can view failures for their facility" ON bi_failures
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage failures for their facility" ON bi_failures;
CREATE POLICY "Users can manage failures for their facility" ON bi_failures
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failures.facility_id
        )
    );

-- Environmental cleaning policies
DROP POLICY IF EXISTS "Users can view cleaning schedules for their facility" ON cleaning_schedules;
CREATE POLICY "Users can view cleaning schedules for their facility" ON cleaning_schedules
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = cleaning_schedules.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage cleaning schedules for their facility" ON cleaning_schedules;
CREATE POLICY "Users can manage cleaning schedules for their facility" ON cleaning_schedules
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = cleaning_schedules.facility_id
        )
    );

-- Knowledge hub policies
DROP POLICY IF EXISTS "Users can view knowledge categories for their facility" ON knowledge_categories;
CREATE POLICY "Users can view knowledge categories for their facility" ON knowledge_categories
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = knowledge_categories.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage knowledge categories for their facility" ON knowledge_categories;
CREATE POLICY "Users can manage knowledge categories for their facility" ON knowledge_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = knowledge_categories.facility_id
        )
    );

-- Library policies
DROP POLICY IF EXISTS "Users can view library collections for their facility" ON library_collections;
CREATE POLICY "Users can view library collections for their facility" ON library_collections
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = library_collections.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage library collections for their facility" ON library_collections;
CREATE POLICY "Users can manage library collections for their facility" ON library_collections
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = library_collections.facility_id
        )
    );

-- BI failure incidents policies
DROP POLICY IF EXISTS "Users can view bi failure incidents for their facility" ON bi_failure_incidents;
CREATE POLICY "Users can view bi failure incidents for their facility" ON bi_failure_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failure_incidents.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage bi failure incidents for their facility" ON bi_failure_incidents;
CREATE POLICY "Users can manage bi failure incidents for their facility" ON bi_failure_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = bi_failure_incidents.facility_id
        )
    );

-- Home challenges policies
DROP POLICY IF EXISTS "Users can view challenges for their facility" ON home_challenges;
CREATE POLICY "Users can view challenges for their facility" ON home_challenges
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = home_challenges.facility_id
        )
    );

-- Home challenge completions policies
DROP POLICY IF EXISTS "Users can view their own challenge completions" ON home_challenge_completions;
CREATE POLICY "Users can view their own challenge completions" ON home_challenge_completions
    FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own challenge completions" ON home_challenge_completions;
CREATE POLICY "Users can manage their own challenge completions" ON home_challenge_completions
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Knowledge user progress policies
DROP POLICY IF EXISTS "Users can view their own learning progress" ON knowledge_user_progress;
CREATE POLICY "Users can view their own learning progress" ON knowledge_user_progress
    FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own learning progress" ON knowledge_user_progress;
CREATE POLICY "Users can manage their own learning progress" ON knowledge_user_progress
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Knowledge quiz attempts policies
DROP POLICY IF EXISTS "Users can view their own quiz attempts" ON knowledge_quiz_attempts;
CREATE POLICY "Users can view their own quiz attempts" ON knowledge_quiz_attempts
    FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own quiz attempts" ON knowledge_quiz_attempts;
CREATE POLICY "Users can manage their own quiz attempts" ON knowledge_quiz_attempts
    FOR ALL USING (user_id = (SELECT auth.uid()));

-- Knowledge feedback policies
DROP POLICY IF EXISTS "Users can view feedback for their facility" ON knowledge_feedback;
CREATE POLICY "Users can view feedback for their facility" ON knowledge_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = knowledge_feedback.facility_id
        )
    );

DROP POLICY IF EXISTS "Users can manage feedback for their facility" ON knowledge_feedback;
CREATE POLICY "Users can manage feedback for their facility" ON knowledge_feedback
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = (SELECT auth.uid()) AND facility_id = knowledge_feedback.facility_id
        )
    ); 