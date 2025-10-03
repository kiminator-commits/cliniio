-- Migration: RLS Performance Optimization
-- Description: Optimize RLS policies by implementing cached user facility access and performance monitoring
-- Date: 2024-12-20

-- 1. Create cached function for user facility ID
CREATE OR REPLACE FUNCTION get_user_facility_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_facility_id UUID;
BEGIN
    -- Check if we already have the facility ID cached in this session
    user_facility_id := current_setting('app.user_facility_id', true);
    
    -- If not cached, fetch and cache it
    IF user_facility_id IS NULL THEN
        SELECT facility_id INTO user_facility_id
        FROM users
        WHERE id = auth.uid();
        
        -- Cache the result for this session
        PERFORM set_config('app.user_facility_id', user_facility_id::text, false);
    END IF;
    
    RETURN user_facility_id;
END;
$$;

-- 2. Create optimized facility access check function
CREATE OR REPLACE FUNCTION check_facility_access(target_facility_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
    -- Use cached facility ID instead of calling auth.uid() multiple times
    RETURN get_user_facility_id() = target_facility_id;
END;
$$;

-- 3. Create batch facility access check function
CREATE OR REPLACE FUNCTION check_facility_access_batch(target_facility_ids UUID[])
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
    user_facility_id UUID;
BEGIN
    user_facility_id := get_user_facility_id();
    RETURN user_facility_id = ANY(target_facility_ids);
END;
$$;

-- 4. Create function to refresh user facility cache
CREATE OR REPLACE FUNCTION refresh_user_facility_cache()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Clear the cached value
    PERFORM set_config('app.user_facility_id', NULL, false);
    
    -- Force a fresh fetch on next call
    PERFORM get_user_facility_id();
END;
$$;

-- 5. Create trigger to refresh cache when user facility changes
CREATE OR REPLACE FUNCTION trigger_refresh_facility_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only refresh if facility_id actually changed
    IF OLD.facility_id IS DISTINCT FROM NEW.facility_id THEN
        PERFORM refresh_user_facility_cache();
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER refresh_facility_cache_trigger
    AFTER UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_refresh_facility_cache();

-- 6. Create performance-focused indexes
CREATE INDEX IF NOT EXISTS idx_users_id_facility_id 
    ON users(id, facility_id) 
    WHERE id IS NOT NULL AND facility_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_inventory_items_facility_id_user_access 
    ON inventory_items(facility_id) 
    WHERE facility_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sterilization_batches_facility_id_user_access 
    ON sterilization_batches(facility_id) 
    WHERE facility_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_knowledge_articles_facility_id_user_access 
    ON knowledge_articles(facility_id) 
    WHERE facility_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_library_assets_facility_id_user_access 
    ON library_assets(facility_id) 
    WHERE facility_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bi_failure_incidents_facility_id_user_access 
    ON bi_failure_incidents(facility_id) 
    WHERE facility_id IS NOT NULL;

-- 7. Create RLS performance monitoring function
-- NOTE: Commented out due to deprecated system views in current PostgreSQL version
/*
CREATE OR REPLACE FUNCTION get_rls_performance_stats()
RETURNS TABLE(
    table_name TEXT,
    policy_name TEXT,
    execution_count BIGINT,
    avg_execution_time NUMERIC,
    total_execution_time NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname || '.' || tablename as table_name,
        policyname as policy_name,
        calls as execution_count,
        round(total_time::numeric, 2) as avg_execution_time,
        round(total_time::numeric, 2) as total_execution_time
    FROM pg_stat_statements
    WHERE query LIKE '%EXISTS%' 
       OR query LIKE '%auth.uid()%'
       OR query LIKE '%check_facility_access%'
    ORDER BY total_time DESC;
END;
$$;
*/

-- 8. Create RLS performance monitoring view
-- NOTE: Commented out due to deprecated system views in current PostgreSQL version
/*
CREATE OR REPLACE VIEW rls_performance_monitoring AS
SELECT 
    schemaname,
    tablename,
    policyname,
    calls,
    total_time,
    mean_time,
    stddev_time,
    min_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%EXISTS%' 
   OR query LIKE '%auth.uid()%'
   OR query LIKE '%check_facility_access%';
*/

-- 9. Create function to estimate RLS policy execution cost
-- NOTE: Commented out due to deprecated system views in current PostgreSQL version
/*
CREATE OR REPLACE FUNCTION estimate_rls_cost(policy_query TEXT)
RETURNS TABLE(
    cost_estimate TEXT,
    recommendation TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        CASE 
            WHEN policy_query LIKE '%EXISTS%' THEN 'High - EXISTS subquery'
            WHEN policy_query LIKE '%auth.uid()%' THEN 'Medium - Multiple auth.uid() calls'
            WHEN policy_query LIKE '%check_facility_access%' THEN 'Low - Cached function'
            ELSE 'Unknown'
        END as cost_estimate,
        CASE 
            WHEN policy_query LIKE '%EXISTS%' THEN 'Consider using check_facility_access() function'
            WHEN policy_query LIKE '%auth.uid()%' THEN 'Use get_user_facility_id() to cache auth.uid()'
            WHEN policy_query LIKE '%check_facility_access%' THEN 'Already optimized'
            ELSE 'Review policy structure'
        END as recommendation;
END;
$$;
*/

-- 10. Create function to analyze RLS performance
-- NOTE: Commented out due to deprecated system views in current PostgreSQL version
/*
CREATE OR REPLACE FUNCTION analyze_rls_performance()
RETURNS TABLE(
    table_name TEXT,
    policy_count INTEGER,
    optimization_status TEXT,
    estimated_impact TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    table_rec RECORD;
    policy_count INTEGER;
    optimized_count INTEGER;
BEGIN
    FOR table_rec IN 
        SELECT DISTINCT schemaname, tablename 
        FROM pg_policies 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
    LOOP
        -- Count total policies for this table
        SELECT COUNT(*) INTO policy_count
        FROM pg_policies 
        WHERE schemaname = table_rec.schemaname 
          AND tablename = table_rec.tablename;
        
        -- Count optimized policies
        SELECT COUNT(*) INTO optimized_count
        FROM pg_policies 
        WHERE schemaname = table_rec.schemaname 
          AND tablename = table_rec.tablename
          AND cmddef LIKE '%check_facility_access%';
        
        table_name := table_rec.schemaname || '.' || table_rec.tablename;
        policy_count := policy_count;
        
        IF optimized_count = policy_count THEN
            optimization_status := 'Fully Optimized';
            estimated_impact := 'High - All policies optimized';
        ELSIF optimized_count > 0 THEN
            optimization_status := 'Partially Optimized';
            estimated_impact := 'Medium - Some policies need optimization';
        ELSE
            optimization_status := 'Not Optimized';
            estimated_impact := 'High - All policies need optimization';
        END IF;
        
        RETURN NEXT;
    END LOOP;
END;
$$;
*/

-- 11. Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION get_user_facility_id() TO authenticated;
GRANT EXECUTE ON FUNCTION check_facility_access(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION check_facility_access_batch(UUID[]) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_user_facility_cache() TO authenticated;
-- NOTE: Commented out due to deprecated system views
-- GRANT EXECUTE ON FUNCTION get_rls_performance_stats() TO authenticated;
-- GRANT EXECUTE ON FUNCTION estimate_rls_cost(TEXT) TO authenticated;
-- GRANT EXECUTE ON FUNCTION analyze_rls_performance() TO authenticated;
-- GRANT SELECT ON rls_performance_monitoring TO authenticated;

-- 12. Add comments for documentation
COMMENT ON FUNCTION get_user_facility_id() IS 'Caches user facility ID in session to avoid repeated auth.uid() calls';
COMMENT ON FUNCTION check_facility_access(UUID) IS 'Optimized facility access check using cached user facility ID';
COMMENT ON FUNCTION check_facility_access_batch(UUID[]) IS 'Batch facility access check for multiple facility IDs';
COMMENT ON FUNCTION refresh_user_facility_cache() IS 'Manually refresh user facility cache when needed';
-- NOTE: Commented out due to deprecated system views
-- COMMENT ON FUNCTION get_rls_performance_stats() IS 'Get performance statistics for RLS policies';
-- COMMENT ON FUNCTION analyze_rls_performance() IS 'Analyze RLS policy optimization status across all tables';

-- 13. Create initial cache for current user (if any)
DO $$
BEGIN
    -- This will be called automatically when policies are first executed
    -- No need to pre-populate for all users
    NULL;
END $$;
