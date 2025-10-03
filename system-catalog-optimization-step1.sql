-- System Catalog Analysis and Optimization
-- Step 1: Analyze system catalogs to update statistics
-- This will improve query planning for schema introspection

-- Analyze system catalogs to update statistics
ANALYZE pg_namespace;
ANALYZE pg_class; 
ANALYZE pg_attribute;
ANALYZE pg_index;
ANALYZE pg_constraint;

-- Verify the analysis completed successfully
SELECT 
    schemaname,
    tablename,
    last_analyzed,
    n_tup_ins + n_tup_upd + n_tup_del as total_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY n_tup_ins + n_tup_upd + n_tup_del DESC
LIMIT 10;
