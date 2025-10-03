-- =====================================================
-- DISABLE RLS FOR DEVELOPMENT TESTING
-- =====================================================

-- Disable RLS on home_daily_operations_tasks table for development
ALTER TABLE home_daily_operations_tasks DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log migration completion
INSERT INTO audit_logs (module, action, table_name, metadata) VALUES (
    'migration',
    'UPDATE',
    'home_daily_operations_tasks',
    '{"version": "049", "description": "RLS disabled for development testing"}'
); 