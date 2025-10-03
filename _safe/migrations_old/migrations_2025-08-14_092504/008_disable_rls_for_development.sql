-- =====================================================
-- TEMPORARILY DISABLE RLS FOR DEVELOPMENT
-- =====================================================
-- This migration disables RLS on all tables for development testing
-- Remove this migration when implementing authentication

-- Disable RLS on inventory tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_items') THEN
        ALTER TABLE inventory_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_transactions') THEN
        ALTER TABLE inventory_transactions DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_suppliers') THEN
        ALTER TABLE inventory_suppliers DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_categories') THEN
        ALTER TABLE inventory_categories DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_audits') THEN
        ALTER TABLE inventory_audits DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_audit_items') THEN
        ALTER TABLE inventory_audit_items DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_alerts') THEN
        ALTER TABLE inventory_alerts DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_reports') THEN
        ALTER TABLE inventory_reports DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Disable RLS on sterilization tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sterilization_cycles') THEN
        ALTER TABLE sterilization_cycles DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'biological_indicators') THEN
        ALTER TABLE biological_indicators DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Disable RLS on cleaning tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cleaning_schedules') THEN
        ALTER TABLE cleaning_schedules DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'cleaning_logs') THEN
        ALTER TABLE cleaning_logs DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Disable RLS on knowledge hub tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'knowledge_hub_content') THEN
        ALTER TABLE knowledge_hub_content DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'library_content') THEN
        ALTER TABLE library_content DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Disable RLS on user tables (only if they exist)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_preferences') THEN
        ALTER TABLE user_preferences DISABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'dashboard_widgets') THEN
        ALTER TABLE dashboard_widgets DISABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Add a default facility for development
INSERT INTO facilities (id, name, type, address, contact_info, settings, subscription_tier, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Development Facility',
    'hospital',
    '{"street": "123 Development St", "city": "Dev City", "state": "Dev State", "zip_code": "12345", "country": "Dev Country"}',
    '{"phone": "+1-555-123-4567", "email": "dev@facility.com", "website": "https://dev-facility.com"}',
    '{}',
    'basic',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Add a default user for development
INSERT INTO users (id, email, full_name, role, facility_id, department, position, phone, is_active, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'dev@user.com',
    'Development User',
    'admin',
    '00000000-0000-0000-0000-000000000001',
    'IT',
    'Developer',
    '+1-555-123-4567',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING; 