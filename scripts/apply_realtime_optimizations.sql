-- Direct SQL Script to Apply Realtime Performance Optimizations
-- Run this script directly in your database to get the performance benefits

-- 1. Create monitoring views for realtime performance analysis
CREATE OR REPLACE VIEW public.realtime_performance_monitor AS
SELECT 
    'subscription_count' as metric,
    COUNT(*) as value,
    NOW() as timestamp
FROM realtime.subscription
UNION ALL
SELECT 
    'unique_subscribers' as metric,
    COUNT(DISTINCT subscription_id) as value,
    NOW() as timestamp
FROM realtime.subscription
UNION ALL
SELECT 
    'active_entities' as metric,
    COUNT(DISTINCT entity) as value,
    NOW() as timestamp
FROM realtime.subscription;

-- 2. Create view for subscription analytics
CREATE OR REPLACE VIEW public.realtime_subscription_analytics AS
SELECT 
    entity,
    COUNT(*) as subscription_count,
    COUNT(DISTINCT subscription_id) as unique_subscribers,
    MAX(created_at) as last_activity,
    MIN(created_at) as first_activity
FROM realtime.subscription 
GROUP BY entity
ORDER BY subscription_count DESC;

-- 3. Create function to analyze realtime performance
CREATE OR REPLACE FUNCTION public.analyze_realtime_performance()
RETURNS TABLE(
    metric_name text,
    metric_value bigint,
    status text,
    recommendation text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'total_subscriptions'::text,
        COUNT(*)::bigint,
        CASE 
            WHEN COUNT(*) > 100 THEN 'critical'::text
            WHEN COUNT(*) > 50 THEN 'warning'::text
            ELSE 'healthy'::text
        END,
        CASE 
            WHEN COUNT(*) > 100 THEN 'Immediate cleanup required'::text
            WHEN COUNT(*) > 50 THEN 'Consider reducing subscriptions'::text
            ELSE 'Performance is good'::text
        END
    FROM realtime.subscription
    
    UNION ALL
    
    SELECT 
        'unique_subscribers'::text,
        COUNT(DISTINCT subscription_id)::bigint,
        CASE 
            WHEN COUNT(DISTINCT subscription_id) > 50 THEN 'critical'::text
            WHEN COUNT(DISTINCT subscription_id) > 25 THEN 'warning'::text
            ELSE 'healthy'::text
        END,
        CASE 
            WHEN COUNT(DISTINCT subscription_id) > 50 THEN 'Too many active users'::text
            WHEN COUNT(DISTINCT subscription_id) > 25 THEN 'Monitor user activity'::text
            ELSE 'User count is optimal'::text
        END
    FROM realtime.subscription
    
    UNION ALL
    
    SELECT 
        'active_entities'::text,
        COUNT(DISTINCT entity)::bigint,
        CASE 
            WHEN COUNT(DISTINCT entity) > 20 THEN 'critical'::text
            WHEN COUNT(DISTINCT entity) > 10 THEN 'warning'::text
            ELSE 'healthy'::text
        END,
        CASE 
            WHEN COUNT(DISTINCT entity) > 20 THEN 'Too many monitored tables'::text
            WHEN COUNT(DISTINCT entity) > 10 THEN 'Review table subscriptions'::text
            ELSE 'Table count is optimal'::text
        END
    FROM realtime.subscription;
END;
$$;

-- 4. Create function to get high-usage tables
CREATE OR REPLACE FUNCTION public.get_high_usage_realtime_tables(threshold integer DEFAULT 5)
RETURNS TABLE(
    table_name text,
    subscription_count bigint,
    unique_subscribers bigint,
    status text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        entity::text,
        COUNT(*)::bigint,
        COUNT(DISTINCT subscription_id)::bigint,
        CASE 
            WHEN COUNT(*) > threshold * 2 THEN 'critical'::text
            WHEN COUNT(*) > threshold THEN 'warning'::text
            ELSE 'normal'::text
        END
    FROM realtime.subscription 
    GROUP BY entity
    HAVING COUNT(*) > threshold
    ORDER BY COUNT(*) DESC;
END;
$$;

-- 5. Grant necessary permissions
GRANT SELECT ON public.realtime_performance_monitor TO authenticated;
GRANT SELECT ON public.realtime_subscription_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.analyze_realtime_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_high_usage_realtime_tables(integer) TO authenticated;

-- 6. Add comments for documentation
COMMENT ON VIEW public.realtime_performance_monitor IS 'Monitoring view for realtime performance metrics';
COMMENT ON VIEW public.realtime_subscription_analytics IS 'Analytics view for realtime subscription patterns';
COMMENT ON FUNCTION public.analyze_realtime_performance() IS 'Function to analyze realtime performance health';
COMMENT ON FUNCTION public.get_high_usage_realtime_tables(integer) IS 'Function to identify tables with high subscription counts';

-- 7. Test the functions
SELECT 'Testing realtime performance analysis...' as status;
SELECT * FROM public.analyze_realtime_performance();

SELECT 'Testing high usage tables...' as status;
SELECT * FROM public.get_high_usage_realtime_tables(3);

SELECT 'Testing performance monitor...' as status;
SELECT * FROM public.realtime_performance_monitor;

SELECT 'Realtime optimizations applied successfully!' as result;
