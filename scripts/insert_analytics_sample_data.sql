-- =====================================================
-- INSERT ANALYTICS SAMPLE DATA
-- =====================================================
-- This script populates key tables with realistic sample data
-- so the Analytics page can pull real data instead of mock data

-- =====================================================
-- STERILIZATION CYCLES - Core data for tool turnover analysis
-- =====================================================

-- Clear existing data (if any)
DELETE FROM sterilization_cycles WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert comprehensive sterilization cycle data for the last 90 days
INSERT INTO sterilization_cycles (
    facility_id,
    cycle_type,
    cycle_number,
    operator_id,
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
    '550e8400-e29b-41d4-a716-446655440000' as facility_id,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'gravity'
        WHEN 1 THEN 'pre_vacuum'
        ELSE 'flash'
    END as cycle_type,
    'CYCLE-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0') as cycle_number,
    '64030f5e-593f-48e8-944e-10d50b4506b4' as operator_id,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 hour' * (RANDOM() * 24)::INT as start_time,
    NOW() - INTERVAL '1 day' * (RANDOM() * 90)::INT - INTERVAL '1 minute' * (RANDOM() * 30)::INT as end_time,
    FLOOR(RANDOM() * 45 + 15)::INT as duration_minutes, -- 15-60 minutes
    (RANDOM() * 5 + 130)::NUMERIC(5,2) as temperature_celsius, -- 130-135°C
    (RANDOM() * 5 + 15)::NUMERIC(6,2) as pressure_psi, -- 15-20 PSI
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
    facility_id,
    name,
    category,
    quantity,
    reorder_point,
    unit_cost,
    status,
    created_at,
    data
)
VALUES
    -- Critical supplies (low stock)
    ('550e8400-e29b-41d4-a716-446655440000', 'Sterile Pouches', 'Packaging', 1250, 2000, 89.99, 'active', NOW(), '{"description": "Sterile packaging for instruments", "supplier": "Supplier A", "last_restocked": "' || (NOW() - INTERVAL '15 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '6 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'BI Test Strips', 'Testing', 450, 500, 125.00, 'active', NOW(), '{"description": "Biological indicator test strips", "supplier": "Supplier B", "last_restocked": "' || (NOW() - INTERVAL '20 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '12 months')::text || '"}'),
    
    -- Medium stock items
    ('550e8400-e29b-41d4-a716-446655440000', 'Surgical Gloves', 'PPE', 2500, 1000, 45.99, 'active', NOW(), '{"description": "Latex-free surgical gloves", "supplier": "Supplier C", "last_restocked": "' || (NOW() - INTERVAL '10 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '18 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Cleaning Solution', 'Cleaning', 1800, 1200, 67.50, 'active', NOW(), '{"description": "Hospital-grade disinfectant", "supplier": "Supplier D", "last_restocked": "' || (NOW() - INTERVAL '12 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}'),
    
    -- High stock items
    ('550e8400-e29b-41d4-a716-446655440000', 'Paper Towels', 'Consumables', 5000, 800, 12.99, 'active', NOW(), '{"description": "Disposable paper towels", "supplier": "Supplier E", "last_restocked": "' || (NOW() - INTERVAL '5 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '36 months')::text || '"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'Alcohol Wipes', 'Disinfectants', 3500, 1000, 28.75, 'active', NOW(), '{"description": "70% isopropyl alcohol wipes", "supplier": "Supplier F", "last_restocked": "' || (NOW() - INTERVAL '8 days')::text || '", "expiry_date": "' || (NOW() + INTERVAL '24 months')::text || '"}');

-- =====================================================
-- BI TEST RESULTS - For audit risk scoring
-- =====================================================

-- Clear existing data (if any)
DELETE FROM bi_test_results WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert BI test results with some failures to create audit risk
INSERT INTO bi_test_results (
    facility_id,
    cycle_id,
    test_type,
    result,
    incubation_time_hours,
    temperature_celsius,
    operator_id,
    notes,
    created_at
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as facility_id,
    sc.id as cycle_id,
    'biological_indicator' as test_type,
    CASE 
        WHEN RANDOM() > 0.95 THEN 'failed' -- 5% failure rate
        ELSE 'passed'
    END as result,
    FLOOR(RANDOM() * 24 + 24)::INT as incubation_time_hours, -- 24-48 hours
    (RANDOM() * 2 + 55)::NUMERIC(5,2) as temperature_celsius, -- 55-57°C
    '64030f5e-593f-48e8-944e-10d50b4506b4' as operator_id,
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
    facility_id,
    cycle_id,
    batch_name,
    contents,
    load_size,
    sterilization_parameters,
    created_at
)
SELECT 
    '550e8400-e29b-41d4-a716-446655440000' as facility_id,
    sc.id as cycle_id,
    'BATCH-' || LPAD((ROW_NUMBER() OVER ())::TEXT, 4, '0') as batch_name,
    CASE (RANDOM() * 3)::INT
        WHEN 0 THEN 'Surgical Scissors Set A, Forceps Collection B'
        WHEN 1 THEN 'Scalpel Handle Collection, Retractor Set'
        ELSE 'Surgical Instruments Kit C, Specialty Tools'
    END as contents,
    CASE (RANDOM() * 2)::INT
        WHEN 0 THEN 'small'
        WHEN 1 THEN 'medium'
        ELSE 'large'
    END as load_size,
    '{"temperature": 134, "pressure": 18, "duration": 30}'::JSONB as sterilization_parameters,
    sc.created_at as created_at
FROM sterilization_cycles sc
WHERE sc.facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND sc.status = 'completed'
LIMIT 80;

-- =====================================================
-- QUALITY INCIDENTS - For risk assessment
-- =====================================================

-- Clear existing data (if any)
DELETE FROM quality_incidents WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert quality incidents with varying severity
INSERT INTO quality_incidents (
    facility_id,
    incident_type,
    severity,
    description,
    cost_impact,
    reported_by,
    status,
    created_at,
    resolved_at,
    metadata
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'equipment_failure', 'medium', 'Autoclave temperature sensor calibration drift detected', 1500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', '{"equipment_id": "AC001", "resolution": "Sensor recalibrated"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'protocol_violation', 'high', 'BI test skipped for 3 consecutive cycles', 2500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'investigating', NOW() - INTERVAL '2 days', NULL, '{"cycles_affected": 3, "risk_level": "high"}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'supply_contamination', 'critical', 'Sterile pouch batch potentially compromised', 5000.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day', '{"batch_number": "SP-2024-089", "items_affected": 500}'),
    ('550e8400-e29b-41d4-a716-446655440000', 'documentation_error', 'low', 'Cycle log incomplete - missing operator signature', 500.00, '64030f5e-593f-48e8-944e-10d50b4506b4', 'resolved', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', '{"cycle_id": "CYCLE-0123", "missing_field": "operator_signature"}');

-- =====================================================
-- USER TRAINING RECORDS - For knowledge gap analysis
-- =====================================================

-- Clear existing data (if any)
DELETE FROM user_training_records WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert training records with some gaps
INSERT INTO user_training_records (
    facility_id,
    user_id,
    training_type,
    completion_status,
    score,
    completion_date,
    expiry_date,
    notes,
    created_at
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', '64030f5e-593f-48e8-944e-10d50b4506b4', 'sterilization_protocols', 'completed', 95, NOW() - INTERVAL '30 days', NOW() + INTERVAL '11 months', 'Excellent understanding of protocols', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', '64030f5e-593f-48e8-944e-10d50b4506b4', 'bi_testing_procedures', 'incomplete', 65, NULL, NOW() + INTERVAL '2 months', 'Failed final assessment - requires retraining', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', '64030f5e-593f-48e8-944e-10d50b4506b4', 'equipment_maintenance', 'not_started', NULL, NULL, NOW() + INTERVAL '6 months', 'Training not yet scheduled', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', '64030f5e-593f-48e8-944e-10d50b4506b4', 'safety_protocols', 'completed', 88, NOW() - INTERVAL '45 days', NOW() + INTERVAL '10 months', 'Good understanding with room for improvement', NOW());

-- =====================================================
-- EQUIPMENT MAINTENANCE - For capacity planning
-- =====================================================

-- Clear existing data (if any)
DELETE FROM equipment_maintenance WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert maintenance records
INSERT INTO equipment_maintenance (
    facility_id,
    equipment_id,
    maintenance_type,
    description,
    scheduled_date,
    completed_date,
    technician,
    cost,
    status,
    created_at
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'AC001', 'preventive', 'Annual calibration and inspection', NOW() + INTERVAL '15 days', NULL, 'Tech Team A', 2500.00, 'scheduled', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'AC001', 'repair', 'Temperature sensor replacement', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', 'Tech Team B', 1500.00, 'completed', NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'AC002', 'preventive', 'Quarterly maintenance check', NOW() + INTERVAL '30 days', NULL, 'Tech Team A', 1800.00, 'scheduled', NOW());

-- =====================================================
-- SUPPLIER PERFORMANCE - For inflation tracking
-- =====================================================

-- Clear existing data (if any)
DELETE FROM supplier_performance WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- Insert supplier performance data
INSERT INTO supplier_performance (
    facility_id,
    supplier_name,
    category,
    performance_score,
    delivery_time_days,
    quality_rating,
    cost_trend,
    last_order_date,
    total_orders,
    created_at
)
VALUES
    ('550e8400-e29b-41d4-a716-446655440000', 'Supplier A', 'Packaging', 92, 3, 4.8, 'increasing', NOW() - INTERVAL '15 days', 45, NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Supplier B', 'Testing', 88, 5, 4.6, 'stable', NOW() - INTERVAL '20 days', 32, NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Supplier C', 'PPE', 95, 2, 4.9, 'increasing', NOW() - INTERVAL '10 days', 67, NOW()),
    ('550e8400-e29b-41d4-a716-446655440000', 'Supplier D', 'Cleaning', 85, 7, 4.3, 'stable', NOW() - INTERVAL '25 days', 28, NOW());

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
    'quality_incidents' as table_name,
    COUNT(*) as record_count
FROM quality_incidents 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';

-- =====================================================
-- SAMPLE QUERIES FOR TESTING
-- =====================================================

-- Test tool turnover analysis
SELECT 
    DATE(created_at) as cycle_date,
    COUNT(*) as daily_cycles,
    AVG(duration_minutes) as avg_duration
FROM sterilization_cycles 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY cycle_date DESC
LIMIT 10;

-- Test supply depletion forecasting
SELECT 
    name,
    quantity,
    reorder_point,
    CASE 
        WHEN quantity <= reorder_point THEN 'REORDER NOW'
        WHEN quantity <= reorder_point * 1.5 THEN 'LOW STOCK'
        ELSE 'OK'
    END as stock_status
FROM inventory_items 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
ORDER BY quantity ASC;

-- Test audit risk scoring
SELECT 
    COUNT(*) as total_bi_tests,
    COUNT(CASE WHEN result = 'failed' THEN 1 END) as failed_tests,
    ROUND(COUNT(CASE WHEN result = 'failed' THEN 1 END) * 100.0 / COUNT(*), 2) as failure_rate
FROM bi_test_results 
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000'
AND created_at >= NOW() - INTERVAL '30 days';
