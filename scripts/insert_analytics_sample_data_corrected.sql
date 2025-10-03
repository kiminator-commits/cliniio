-- =====================================================
-- INSERT ANALYTICS SAMPLE DATA (CORRECTED FOR ACTUAL SCHEMA)
-- =====================================================
-- This script populates key tables with realistic sample data
-- using the correct column names from the actual database schema

-- =====================================================
-- STERILIZATION CYCLES - Core data for tool turnover analysis
-- =====================================================

-- Clear existing data (if any)
DELETE FROM sterilization_cycles WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert comprehensive sterilization cycle data for the last 90 days
INSERT INTO sterilization_cycles (
    id,
    facility_id,
    cycle_type,
    cycle_number,
    operator_id,
    autoclave_id,
    tool_batch_id,
    start_time,
    end_time,
    duration_minutes,
    temperature_celsius,
    pressure_psi,
    status,
    parameters,
    results,
    notes,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'gravity'
        WHEN 1 THEN 'pre_vacuum'
        ELSE 'flash'
    END as cycle_type,
    'CYCLE-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0') as cycle_number,
    '64030f5e-593f-48e8-944e-10d50b4506b4'::uuid as operator_id,
    '550e8400-e29b-41d4-a716-446655440001'::uuid as autoclave_id,
    '550e8400-e29b-41d4-a716-446655440002'::uuid as tool_batch_id,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT as start_time,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 minute' * (RANDOM() * 30)::INT as end_time,
    FLOOR(RANDOM() * 45 + 15)::INT as duration_minutes, -- 15-60 minutes
    (RANDOM() * 5 + 130)::NUMERIC as temperature_celsius, -- 130-135°C
    (RANDOM() * 5 + 15)::NUMERIC as pressure_psi, -- 15-20 PSI
    'completed' as status,
    '{"load_size": "medium", "equipment_id": "AC001", "cycle_mode": "standard"}'::JSONB as parameters,
    '{"bi_test_passed": true, "ci_strip_passed": true, "quality_score": 95}'::JSONB as results,
    'Standard sterilization cycle completed successfully' as notes,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT as created_at
FROM generate_series(1, 150); -- 150 cycles over 90 days

-- =====================================================
-- INVENTORY ITEMS - For supply depletion forecasting
-- =====================================================

-- Clear existing data (if any)
DELETE FROM inventory_items WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert realistic inventory items with varying stock levels
INSERT INTO inventory_items (
    id,
    facility_id,
    name,
    category,
    quantity,
    reorder_point,
    unit_cost,
    data,
    created_at
)
VALUES
    -- Critical supplies (low stock)
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Sterile Pouches', 'Packaging', 1250, 2000, 89.99, '{"description": "Sterile packaging for instruments", "supplier": "Supplier A", "last_restocked": "' || (NOW() - INTERVAL '15 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '6 months')::text || '"}', NOW()),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'BI Test Strips', 'Testing', 450, 500, 125.00, '{"description": "Biological indicator test strips", "supplier": "Supplier B", "last_restocked": "' || (NOW() - INTERVAL '20 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '12 months')::text || '"}', NOW()),
    
    -- Medium stock items
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Surgical Gloves', 'PPE', 2500, 1000, 45.99, '{"description": "Latex-free surgical gloves", "supplier": "Supplier C", "last_restocked": "' || (NOW() - INTERVAL '10 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '18 months')::text || '"}', NOW()),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Cleaning Solution', 'Cleaning', 1800, 1200, 67.50, '{"description": "Hospital-grade disinfectant", "supplier": "Supplier D", "last_restocked": "' || (NOW() - INTERVAL '12 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}', NOW()),
    
    -- High stock items
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Paper Towels', 'Consumables', 5000, 800, 12.99, '{"description": "Disposable paper towels", "supplier": "Supplier E", "last_restocked": "' || (NOW() - INTERVAL '5 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '36 months')::text || '"}', NOW()),
    (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440000'::uuid, 'Alcohol Wipes', 'Disinfectants', 3500, 1000, 28.75, '{"description": "70% isopropyl alcohol wipes", "supplier": "Supplier F", "last_restocked": "' || (NOW() - INTERVAL '8 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}', NOW());

-- =====================================================
-- BI TEST RESULTS - For audit risk scoring
-- =====================================================

-- Clear existing data (if any)
DELETE FROM bi_test_results WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert BI test results with some failures to create audit risk
INSERT INTO bi_test_results (
    id,
    facility_id,
    cycle_id,
    test_type,
    result,
    incubation_time_minutes,
    incubation_temperature_celsius,
    operator_id,
    notes,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
    sc.id as cycle_id,
    'biological_indicator' as test_type,
    CASE 
        WHEN RANDOM() > 0.95 THEN 'failed' -- 5% failure rate
        ELSE 'passed'
    END as result,
    FLOOR(RANDOM() * 24 + 24)::INT as incubation_time_minutes, -- 24-48 hours
    (RANDOM() * 2 + 55)::NUMERIC as incubation_temperature_celsius, -- 55-57°C
    '64030f5e-593f-48e8-944e-10d50b4506b4'::uuid as operator_id,
    CASE 
        WHEN RANDOM() > 0.95 THEN 'Test failed - requires investigation'
        ELSE 'Test passed successfully'
    END as notes,
    sc.created_at + INTERVAL '1 day' as created_at
FROM sterilization_cycles sc
WHERE sc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND sc.status = 'completed'
LIMIT 100;

-- =====================================================
-- STERILIZATION BATCHES - For tool tracking
-- =====================================================

-- Clear existing data (if any)
DELETE FROM sterilization_batches WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sterilization batches with tools
INSERT INTO sterilization_batches (
    id,
    facility_id,
    cycle_id,
    batch_name,
    batch_type,
    package_type,
    package_size,
    total_items,
    package_count,
    status,
    notes,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
    sc.id as cycle_id,
    'BATCH-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0') as batch_name,
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'surgical'
        WHEN 1 THEN 'dental'
        ELSE 'general'
    END as batch_type,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'pouch'
        ELSE 'tray'
    END as package_type,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'small'
        WHEN 1 THEN 'medium'
        ELSE 'large'
    END as package_size,
    FLOOR(RANDOM() * 20 + 5)::INT as total_items,
    FLOOR(RANDOM() * 5 + 1)::INT as package_count,
    'completed' as status,
    'Standard sterilization batch' as notes,
    sc.created_at as created_at
FROM sterilization_cycles sc
WHERE sc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND sc.status = 'completed'
LIMIT 80;

-- =====================================================
-- ACTIVITY FEED - For task tracking and points
-- =====================================================

-- Clear existing data (if any)
DELETE FROM activity_feed WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert activity feed entries for task tracking
INSERT INTO activity_feed (
    id,
    user_id,
    facility_id,
    activity_type,
    activity_title,
    activity_description,
    module,
    metadata,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    '64030f5e-593f-48e8-944e-10d50b4506b4'::uuid as user_id,
    '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
    CASE (RANDOM() * 5)::INT 
        WHEN 0 THEN 'task_completed' 
        WHEN 1 THEN 'sterilization_completed' 
        WHEN 2 THEN 'inventory_checked' 
        WHEN 3 THEN 'challenge_completed' 
        ELSE 'daily_goal_met' 
    END as activity_type,
    CASE (RANDOM() * 5)::INT 
        WHEN 0 THEN 'Daily Task Completed'
        WHEN 1 THEN 'Sterilization Cycle Finished'
        WHEN 2 THEN 'Inventory Check Done'
        WHEN 3 THEN 'Challenge Completed'
        ELSE 'Daily Goal Achieved'
    END as activity_title,
    'Sample activity for cumulative stats tracking' as activity_description,
    CASE (RANDOM() * 3)::INT 
        WHEN 0 THEN 'sterilization'
        WHEN 1 THEN 'inventory'
        ELSE 'general'
    END as module,
    '{"points_earned": ' || FLOOR(RANDOM() * 50 + 10)::INT || ', "category": "general"}'::JSONB as metadata,
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT as created_at
FROM generate_series(1, 100);

-- =====================================================
-- STERILIZATION TOOLS - For tool tracking
-- =====================================================

-- Clear existing data (if any)
DELETE FROM sterilization_tools WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert sterilization tools with various sterilization counts
INSERT INTO sterilization_tools (
    id,
    facility_id,
    tool_name,
    tool_type,
    barcode,
    sterilization_count,
    last_sterilized,
    status,
    created_at
)
SELECT 
    gen_random_uuid() as id,
    '550e8400-e29b-41d4-a716-446655440000'::uuid as facility_id,
    'Tool-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 2, '0') as tool_name,
    CASE (RANDOM() * 3)::INT 
        WHEN 0 THEN 'forceps' 
        WHEN 1 THEN 'scissors' 
        ELSE 'clamp' 
    END as tool_type,
    'BC' || LPAD((ROW_NUMBER() OVER ())::TEXT, 6, '0') as barcode,
    FLOOR(RANDOM() * 50 + 1)::INT as sterilization_count,
    NOW() - INTERVAL '1 day' * (RANDOM() * 30)::INT as last_sterilized,
    CASE (RANDOM() * 2)::INT 
        WHEN 0 THEN 'active' 
        ELSE 'inactive' 
    END as status,
    NOW() - INTERVAL '1 day' * (RANDOM() * 60)::INT as created_at
FROM generate_series(1, 30);

-- =====================================================
-- VERIFY DATA INSERTION
-- =====================================================

-- Check counts
SELECT 
    'sterilization_cycles' as table_name,
    COUNT(*) as record_count
FROM sterilization_cycles 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'

UNION ALL

SELECT 
    'inventory_items' as table_name,
    COUNT(*) as record_count
FROM inventory_items 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'

UNION ALL

SELECT 
    'bi_test_results' as table_name,
    COUNT(*) as record_count
FROM bi_test_results 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'

UNION ALL

SELECT 
    'sterilization_batches' as table_name,
    COUNT(*) as record_count
FROM sterilization_batches 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'

UNION ALL

SELECT 
    'activity_feed' as table_name,
    COUNT(*) as record_count
FROM activity_feed 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'

UNION ALL

SELECT 
    'sterilization_tools' as table_name,
    COUNT(*) as record_count
FROM sterilization_tools 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';
