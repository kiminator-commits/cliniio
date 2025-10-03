-- Migration: Optimize existing RLS policies for better performance
-- Description: Replace expensive EXISTS subqueries with optimized facility access checks
-- NOTE: This migration is commented out because it references tables that don't exist
-- It can be re-enabled once all referenced tables are created

/*
-- 1. Drop existing expensive RLS policies from inventory module
DROP POLICY IF EXISTS "Users can view inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can insert inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can update inventory items in their facilities" ON inventory_items;
DROP POLICY IF EXISTS "Users can delete inventory items in their facilities" ON inventory_items;

DROP POLICY IF EXISTS "Users can view inventory transactions in their facilities" ON inventory_transactions;
DROP POLICY IF EXISTS "Users can insert inventory transactions in their facilities" ON inventory_transactions;

DROP POLICY IF EXISTS "Users can view inventory suppliers in their facilities" ON inventory_suppliers;
DROP POLICY IF EXISTS "Users can manage inventory suppliers in their facilities" ON inventory_suppliers;

DROP POLICY IF EXISTS "Users can view inventory categories in their facilities" ON inventory_categories;
DROP POLICY IF EXISTS "Users can manage inventory categories in their facilities" ON inventory_categories;

DROP POLICY IF EXISTS "Users can view inventory audits in their facilities" ON inventory_audits;
DROP POLICY IF EXISTS "Users can manage inventory audits in their facilities" ON inventory_audits;

DROP POLICY IF EXISTS "Users can view inventory alerts in their facilities" ON inventory_alerts;
DROP POLICY IF EXISTS "Users can manage inventory alerts in their facilities" ON inventory_alerts;

DROP POLICY IF EXISTS "Users can view inventory reports in their facilities" ON inventory_reports;
DROP POLICY IF EXISTS "Users can manage inventory reports in their facilities" ON inventory_reports;

-- 2. Create optimized RLS policies for inventory module using cached functions
CREATE POLICY "Users can view inventory items in their facilities" ON inventory_items
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can insert inventory items in their facilities" ON inventory_items
    FOR INSERT WITH CHECK (check_facility_access(facility_id));

CREATE POLICY "Users can update inventory items in their facilities" ON inventory_items
    FOR UPDATE USING (check_facility_access(facility_id));

CREATE POLICY "Users can delete inventory items in their facilities" ON inventory_items
    FOR DELETE USING (check_facility_access(facility_id));

-- Inventory transactions policies
CREATE POLICY "Users can view inventory transactions in their facilities" ON inventory_transactions
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can insert inventory transactions in their facilities" ON inventory_transactions
    FOR INSERT WITH CHECK (check_facility_access(facility_id));

-- Inventory suppliers policies
CREATE POLICY "Users can view inventory suppliers in their facilities" ON inventory_suppliers
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage inventory suppliers in their facilities" ON inventory_suppliers
    FOR ALL USING (check_facility_access(facility_id));

-- Inventory categories policies
CREATE POLICY "Users can view inventory categories in their facilities" ON inventory_categories
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage inventory categories in their facilities" ON inventory_categories
    FOR ALL USING (check_facility_access(facility_id));

-- Inventory audits policies
CREATE POLICY "Users can view inventory audits in their facilities" ON inventory_audits
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage inventory audits in their facilities" ON inventory_audits
    FOR ALL USING (check_facility_access(facility_id));

-- Inventory alerts policies
CREATE POLICY "Users can view inventory alerts in their facilities" ON inventory_alerts
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage inventory alerts in their facilities" ON inventory_alerts
    FOR ALL USING (check_facility_access(facility_id));

-- Inventory reports policies
CREATE POLICY "Users can view inventory reports in their facilities" ON inventory_reports
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage inventory reports in their facilities" ON inventory_reports
    FOR ALL USING (check_facility_access(facility_id));

-- 3. Drop existing expensive RLS policies from sterilization module
DROP POLICY IF EXISTS "Users can view sterilization cycles in their facilities" ON sterilization_cycles;
DROP POLICY IF EXISTS "Users can manage sterilization cycles in their facilities" ON sterilization_cycles;

DROP POLICY IF EXISTS "Users can view biological indicators in their facilities" ON biological_indicators;
DROP POLICY IF EXISTS "Users can manage biological indicators in their facilities" ON biological_indicators;

DROP POLICY IF EXISTS "Users can view bi failures in their facilities" ON bi_failures;
DROP POLICY IF EXISTS "Users can manage bi failures in their facilities" ON bi_failures;

DROP POLICY IF EXISTS "Users can view autoclave receipts in their facilities" ON autoclave_receipts;
DROP POLICY IF EXISTS "Users can manage autoclave receipts in their facilities" ON autoclave_receipts;

DROP POLICY IF EXISTS "Users can view sterilization tools in their facilities" ON sterilization_tools;
DROP POLICY IF EXISTS "Users can manage sterilization tools in their facilities" ON sterilization_tools;

DROP POLICY IF EXISTS "Users can view sterilization batches in their facilities" ON sterilization_batches;
DROP POLICY IF EXISTS "Users can manage sterilization batches in their facilities" ON sterilization_batches;

DROP POLICY IF EXISTS "Users can view batch items in their facilities" ON batch_items;
DROP POLICY IF EXISTS "Users can manage batch items in their facilities" ON batch_items;

DROP POLICY IF EXISTS "Users can view cycle phases in their facilities" ON cycle_phases;
DROP POLICY IF EXISTS "Users can manage cycle phases in their facilities" ON cycle_phases;

-- 4. Create optimized RLS policies for sterilization module
CREATE POLICY "Users can view sterilization cycles in their facilities" ON sterilization_cycles
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage sterilization cycles in their facilities" ON sterilization_cycles
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view biological indicators in their facilities" ON biological_indicators
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage biological indicators in their facilities" ON biological_indicators
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view bi failures in their facilities" ON bi_failures
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage bi failures in their facilities" ON bi_failures
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view autoclave receipts in their facilities" ON autoclave_receipts
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage autoclave receipts in their facilities" ON autoclave_receipts
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view sterilization tools in their facilities" ON sterilization_tools
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage sterilization tools in their facilities" ON sterilization_tools
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view sterilization batches in their facilities" ON sterilization_batches
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage sterilization batches in their facilities" ON sterilization_batches
    FOR ALL USING (check_facility_access(facility_id));

-- Batch items and cycle phases use JOIN-based policies for better performance
CREATE POLICY "Users can view batch items in their facilities" ON batch_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sterilization_batches sb
            WHERE sb.id = batch_items.batch_id 
            AND check_facility_access(sb.facility_id)
        )
    );

CREATE POLICY "Users can manage batch items in their facilities" ON batch_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sterilization_batches sb
            WHERE sb.id = batch_items.batch_id 
            AND check_facility_access(sb.facility_id)
        )
    );

CREATE POLICY "Users can view cycle phases in their facilities" ON cycle_phases
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM sterilization_cycles sc
            WHERE sc.id = cycle_phases.cycle_id 
            AND check_facility_access(sc.facility_id)
        )
    );

CREATE POLICY "Users can manage cycle phases in their facilities" ON cycle_phases
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM sterilization_cycles sc
            WHERE sc.id = cycle_phases.cycle_id 
            AND check_facility_access(sc.facility_id)
        )
    );

-- 5. Drop existing expensive RLS policies from environmental cleaning module
DROP POLICY IF EXISTS "Users can view cleaning schedules in their facilities" ON cleaning_schedules;
DROP POLICY IF EXISTS "Users can manage cleaning schedules in their facilities" ON cleaning_schedules;

DROP POLICY IF EXISTS "Users can view cleaning tasks in their facilities" ON cleaning_tasks;
DROP POLICY IF EXISTS "Users can manage cleaning tasks in their facilities" ON cleaning_tasks;

DROP POLICY IF EXISTS "Users can view cleaning supplies in their facilities" ON cleaning_supplies;
DROP POLICY IF EXISTS "Users can manage cleaning supplies in their facilities" ON cleaning_supplies;

DROP POLICY IF EXISTS "Users can view cleaning equipment in their facilities" ON cleaning_equipment;
DROP POLICY IF EXISTS "Users can manage cleaning equipment in their facilities" ON cleaning_equipment;

DROP POLICY IF EXISTS "Users can view environmental monitoring in their facilities" ON environmental_monitoring;
DROP POLICY IF EXISTS "Users can manage environmental monitoring in their facilities" ON environmental_monitoring;

DROP POLICY IF EXISTS "Users can view cleaning compliance records in their facilities" ON cleaning_compliance_records;
DROP POLICY IF EXISTS "Users can manage cleaning compliance records in their facilities" ON cleaning_compliance_records;

DROP POLICY IF EXISTS "Users can view cleaning incidents in their facilities" ON cleaning_incidents;
DROP POLICY IF EXISTS "Users can manage cleaning incidents in their facilities" ON cleaning_incidents;

DROP POLICY IF EXISTS "Users can view cleaning training records in their facilities" ON cleaning_training_records;
DROP POLICY IF EXISTS "Users can manage cleaning training records in their facilities" ON cleaning_training_records;

-- 6. Create optimized RLS policies for environmental cleaning module
CREATE POLICY "Users can view cleaning schedules in their facilities" ON cleaning_schedules
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning schedules in their facilities" ON cleaning_schedules
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning tasks in their facilities" ON cleaning_tasks
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning tasks in their facilities" ON cleaning_tasks
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning supplies in their facilities" ON cleaning_supplies
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning supplies in their facilities" ON cleaning_supplies
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning equipment in their facilities" ON cleaning_equipment
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning equipment in their facilities" ON cleaning_equipment
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view environmental monitoring in their facilities" ON environmental_monitoring
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage environmental monitoring in their facilities" ON environmental_monitoring
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning compliance records in their facilities" ON cleaning_compliance_records
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning compliance records in their facilities" ON cleaning_compliance_records
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning incidents in their facilities" ON cleaning_incidents
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning incidents in their facilities" ON cleaning_incidents
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view cleaning training records in their facilities" ON cleaning_training_records
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage cleaning training records in their facilities" ON cleaning_training_records
    FOR ALL USING (check_facility_access(facility_id));

-- 7. Drop existing expensive RLS policies from knowledge hub module
DROP POLICY IF EXISTS "Users can view knowledge categories in their facilities" ON knowledge_categories;
DROP POLICY IF EXISTS "Users can manage knowledge categories in their facilities" ON knowledge_categories;

DROP POLICY IF EXISTS "Users can view knowledge articles in their facilities" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can manage knowledge articles in their facilities" ON knowledge_articles;
DROP POLICY IF EXISTS "Users can delete knowledge articles in their facilities" ON knowledge_articles;

DROP POLICY IF EXISTS "Users can view knowledge learning paths in their facilities" ON knowledge_learning_paths;
DROP POLICY IF EXISTS "Users can manage knowledge learning paths in their facilities" ON knowledge_learning_paths;

DROP POLICY IF EXISTS "Users can view knowledge quizzes in their facilities" ON knowledge_quizzes;
DROP POLICY IF EXISTS "Users can manage knowledge quizzes in their facilities" ON knowledge_quizzes;

DROP POLICY IF EXISTS "Users can view knowledge feedback in their facilities" ON knowledge_feedback;
DROP POLICY IF EXISTS "Users can manage knowledge feedback in their facilities" ON knowledge_feedback;

-- 8. Create optimized RLS policies for knowledge hub module
CREATE POLICY "Users can view knowledge categories in their facilities" ON knowledge_categories
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage knowledge categories in their facilities" ON knowledge_categories
    FOR ALL USING (check_facility_access(facility_id));

-- Knowledge articles have complex visibility rules - keep optimized version
CREATE POLICY "Users can view knowledge articles in their facilities" ON knowledge_articles
    FOR SELECT USING (
        check_facility_access(facility_id) AND
        (visibility = 'public' OR 
         visibility = 'private' AND author_id = auth.uid())
    );

CREATE POLICY "Users can manage knowledge articles in their facilities" ON knowledge_articles
    FOR ALL USING (
        check_facility_access(facility_id) AND
        (visibility = 'public' OR 
         visibility = 'private' AND author_id = auth.uid())
    );

CREATE POLICY "Users can delete knowledge articles in their facilities" ON knowledge_articles
    FOR DELETE USING (
        check_facility_access(facility_id) AND
        (visibility = 'public' OR 
         visibility = 'private' AND author_id = auth.uid())
    );

CREATE POLICY "Users can view knowledge learning paths in their facilities" ON knowledge_learning_paths
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage knowledge learning paths in their facilities" ON knowledge_learning_paths
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view knowledge quizzes in their facilities" ON knowledge_quizzes
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage knowledge quizzes in their facilities" ON knowledge_quizzes
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view knowledge feedback in their facilities" ON knowledge_feedback
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage knowledge feedback in their facilities" ON knowledge_feedback
    FOR ALL USING (check_facility_access(facility_id));

-- 9. Drop existing expensive RLS policies from home module
DROP POLICY IF EXISTS "Users can view dashboard metrics in their facilities" ON dashboard_metrics;

DROP POLICY IF EXISTS "Users can manage their own tasks" ON user_tasks;
DROP POLICY IF EXISTS "Users can view their own tasks" ON user_tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON user_tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON user_tasks;

-- 10. Create optimized RLS policies for home module
CREATE POLICY "Users can view dashboard metrics in their facilities" ON dashboard_metrics
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage their own tasks" ON user_tasks
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own tasks" ON user_tasks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tasks" ON user_tasks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" ON user_tasks
    FOR UPDATE USING (auth.uid() = user_id);

-- 11. Drop existing expensive RLS policies from library module
DROP POLICY IF EXISTS "Users can view library collections in their facilities" ON library_collections;
DROP POLICY IF EXISTS "Users can manage library collections in their facilities" ON library_collections;

DROP POLICY IF EXISTS "Users can view library assets in their facilities" ON library_assets;
DROP POLICY IF EXISTS "Users can manage library assets in their facilities" ON library_assets;
DROP POLICY IF EXISTS "Users can delete library assets in their facilities" ON library_assets;

-- 12. Create optimized RLS policies for library module
CREATE POLICY "Users can view library collections in their facilities" ON library_collections
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage library collections in their facilities" ON library_collections
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can view library assets in their facilities" ON library_assets
    FOR SELECT USING (check_facility_access(facility_id));

CREATE POLICY "Users can manage library assets in their facilities" ON library_assets
    FOR ALL USING (check_facility_access(facility_id));

CREATE POLICY "Users can delete library assets in their facilities" ON library_assets
    FOR DELETE USING (check_facility_access(facility_id));

-- 13. Drop existing expensive RLS policies from BI failure workflow module
DROP POLICY IF EXISTS "Users can view bi failure incidents in their facilities" ON bi_failure_incidents;
DROP POLICY IF EXISTS "Users can manage bi failure incidents in their facilities" ON bi_failure_incidents;

DROP POLICY IF EXISTS "Users can view bi resolution workflows in their facilities" ON bi_resolution_workflows;
DROP POLICY IF EXISTS "Users can manage bi resolution workflows in their facilities" ON bi_resolution_workflows;

DROP POLICY IF EXISTS "Users can view quarantined tools in their facilities" ON quarantined_tools;
DROP POLICY IF EXISTS "Users can manage quarantined tools in their facilities" ON quarantined_tools;

-- 14. Create optimized RLS policies for BI failure workflow module
CREATE POLICY "Users can view bi failure incidents in their facilities" ON bi_failure_incidents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND check_facility_access(bi_failure_incidents.facility_id)
        )
    );

CREATE POLICY "Users can manage bi failure incidents in their facilities" ON bi_failure_incidents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.id = auth.uid() AND check_facility_access(bi_failure_incidents.facility_id)
        )
    );

CREATE POLICY "Users can view bi resolution workflows in their facilities" ON bi_resolution_workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u, bi_failure_incidents bi
            WHERE u.id = auth.uid() AND bi.id = bi_resolution_workflows.bi_failure_incident_id
            AND check_facility_access(bi.facility_id)
        )
    );

CREATE POLICY "Users can manage bi resolution workflows in their facilities" ON bi_resolution_workflows
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u, bi_failure_incidents bi
            WHERE u.id = auth.uid() AND bi.id = bi_resolution_workflows.bi_failure_incident_id
            AND check_facility_access(bi.facility_id)
        )
    );

CREATE POLICY "Users can view quarantined tools in their facilities" ON quarantined_tools
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u, bi_failure_incidents bi
            WHERE u.id = auth.uid() AND bi.id = quarantined_tools.bi_failure_incident_id
            AND check_facility_access(bi.facility_id)
        )
    );

CREATE POLICY "Users can manage quarantined tools in their facilities" ON quarantined_tools
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u, bi_failure_incidents bi
            WHERE u.id = auth.uid() AND bi.id = quarantined_tools.bi_failure_incident_id
            AND check_facility_access(bi.facility_id)
        )
    );

-- 15. Create a function to verify all policies have been optimized
CREATE OR REPLACE FUNCTION verify_rls_optimization()
RETURNS TABLE(
    table_name TEXT,
    total_policies INTEGER,
    optimized_policies INTEGER,
    remaining_expensive_policies INTEGER,
    optimization_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH policy_analysis AS (
        SELECT 
            tablename,
            COUNT(*) as total_policies,
            COUNT(CASE WHEN qual::text LIKE '%check_facility_access%' THEN 1 END) as optimized,
            COUNT(CASE WHEN qual::text LIKE '%EXISTS%' AND qual::text NOT LIKE '%check_facility_access%' THEN 1 END) as expensive
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename
    )
    SELECT 
        pa.tablename::TEXT,
        pa.total_policies,
        pa.optimized,
        pa.expensive,
        CASE 
            WHEN pa.expensive = 0 THEN 'FULLY_OPTIMIZED'
            WHEN pa.optimized > pa.expensive THEN 'PARTIALLY_OPTIMIZED'
            ELSE 'NEEDS_OPTIMIZATION'
        END::TEXT as optimization_status
    FROM policy_analysis pa
    ORDER BY optimization_status, tablename;
END;
$$;

GRANT EXECUTE ON FUNCTION verify_rls_optimization() TO authenticated;

-- 16. Add performance improvement comments
COMMENT ON FUNCTION verify_rls_optimization() IS 'Verify that RLS policies have been optimized with cached functions';
COMMENT ON TABLE inventory_items IS 'RLS policies optimized - replaced EXISTS subqueries with check_facility_access()';
COMMENT ON TABLE sterilization_cycles IS 'RLS policies optimized - replaced EXISTS subqueries with check_facility_access()';
COMMENT ON TABLE cleaning_schedules IS 'RLS policies optimized - replaced EXISTS subqueries with check_facility_access()';
COMMENT ON TABLE knowledge_articles IS 'RLS policies optimized - replaced EXISTS subqueries with check_facility_access()';
*/
