-- =====================================================
-- POPULATE ANALYTICS TABLES WITH SAMPLE DATA
-- =====================================================
-- Run this in Supabase SQL Editor to populate tables for Analytics page

-- 1. INSERT STERILIZATION CYCLES (150 cycles over 90 days)
INSERT INTO sterilization_cycles (
    facility_id, cycle_type, cycle_number, operator_id, start_time, end_time, 
    duration_minutes, temperature_celsius, pressure_psi, status, parameters, results, notes
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    CASE (RANDOM() * 2)::INT WHEN 0 THEN 'gravity' WHEN 1 THEN 'pre_vacuum' ELSE 'flash' END,
    'CYCLE-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    '64030f5e-593f-48e8-944e-10d50b4506b4',
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 minute' * (RANDOM() * 30)::INT,
    FLOOR(RANDOM() * 45 + 15)::INT,
    (RANDOM() * 5 + 130)::NUMERIC(5,2),
    (RANDOM() * 5 + 15)::NUMERIC(6,2),
    'completed',
    '{"load_size": "medium", "equipment_id": "AC001"}'::JSONB,
    '{"bi_test_passed": true, "quality_score": 95}'::JSONB,
    'Standard sterilization cycle'
FROM generate_series(1, 150);

-- 2. INSERT INVENTORY ITEMS (6 items with varying stock levels)
INSERT INTO inventory_items (
    facility_id, name, category, quantity, reorder_point, 
    unit_cost, status, data
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Sterile Pouches', 'Packaging', 1250, 2000, 89.99, 'active', '{"description": "Sterile packaging", "supplier": "Supplier A", "last_restocked": "' || (NOW() - INTERVAL '15 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '6 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'BI Test Strips', 'Testing', 450, 500, 125.00, 'active', '{"description": "Biological indicators", "supplier": "Supplier B", "last_restocked": "' || (NOW() - INTERVAL '20 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '12 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Surgical Gloves', 'PPE', 2500, 1000, 45.99, 'active', '{"description": "Latex-free gloves", "supplier": "Supplier C", "last_restocked": "' || (NOW() - INTERVAL '10 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '18 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Cleaning Solution', 'Cleaning', 1800, 1200, 67.50, 'active', '{"description": "Disinfectant", "supplier": "Supplier D", "last_restocked": "' || (NOW() - INTERVAL '12 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Paper Towels', 'Consumables', 5000, 800, 12.99, 'active', '{"description": "Disposable towels", "supplier": "Supplier E", "last_restocked": "' || (NOW() - INTERVAL '5 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '36 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Alcohol Wipes', 'Disinfectants', 3500, 1000, 28.75, 'active', '{"description": "70% isopropyl wipes", "supplier": "Supplier F", "last_restocked": "' || (NOW() - INTERVAL '8 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}');

-- 3. INSERT BI TEST RESULTS (100 tests with 5% failure rate)
INSERT INTO bi_test_results (
    facility_id, cycle_id, test_type, result, incubation_time_hours, 
    temperature_celsius, operator_id, notes
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    sc.id,
    'biological_indicator',
    CASE WHEN RANDOM() > 0.95 THEN 'failed' ELSE 'passed' END,
    FLOOR(RANDOM() * 24 + 24)::INT,
    (RANDOM() * 2 + 55)::NUMERIC(5,2),
    '64030f5e-593f-48e8-944e-10d50b4506b4',
    CASE WHEN RANDOM() > 0.95 THEN 'Test failed - investigate' ELSE 'Test passed' END
FROM sterilization_cycles sc
WHERE sc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 100;

-- 4. INSERT STERILIZATION BATCHES (80 batches with tools)
INSERT INTO sterilization_batches (
    facility_id, cycle_id, batch_name, contents, load_size, sterilization_parameters
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000',
    sc.id,
    'BATCH-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0'),
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'Surgical Scissors Set A, Forceps Collection B'
        WHEN 1 THEN 'Scalpel Handle Collection, Retractor Set'
        ELSE 'Surgical Instruments Kit C, Specialty Tools'
    END,
    CASE (RANDOM() * 2)::INT WHEN 0 THEN 'small' WHEN 1 THEN 'medium' ELSE 'large' END,
    '{"temperature": 134, "pressure": 18, "duration": 30}'::JSONB
FROM sterilization_cycles sc
WHERE sc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
LIMIT 80;

-- 5. INSERT QUALITY INCIDENTS (4 incidents with varying severity)
INSERT INTO quality_incidents (
    facility_id, incident_type, severity, description, cost_impact, 
    reported_by, status, created_at, resolved_at
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'equipment_failure', 'medium', 'Autoclave sensor calibration drift', 1500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),
    ('550e8400-e29b-41d4-a716-446655440000', 'protocol_violation', 'high', 'BI test skipped for 3 cycles', 2500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'investigating', NOW() - INTERVAL '2 days', NULL),
    ('550e8400-e29b-41d4-a716-446655440000', 'supply_contamination', 'critical', 'Sterile pouch batch compromised', 5000.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
    ('550e8400-e29b-41d4-a716-446655440000', 'documentation_error', 'low', 'Cycle log incomplete', 500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days');

-- VERIFY DATA INSERTION
SELECT 'sterilization_cycles' as table_name, COUNT(*) as record_count FROM sterilization_cycles WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'inventory_items' as table_name, COUNT(*) as record_count FROM inventory_items WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'bi_test_results' as table_name, COUNT(*) as record_count FROM bi_test_results WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'sterilization_batches' as table_name, COUNT(*) as record_count FROM sterilization_batches WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
UNION ALL
SELECT 'quality_incidents' as table_name, COUNT(*) as record_count FROM quality_incidents WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';
