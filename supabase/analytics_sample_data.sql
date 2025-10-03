-- Analytics Dashboard Sample Data
-- This script populates the necessary tables with realistic data for the Analytics dashboard

-- First, let's add some sample sterilization cycles data
INSERT INTO sterilization_cycles (
  id,
  facility_id,
  autoclave_id,
  cycle_type,
  start_time,
  end_time,
  duration_minutes,
  temperature_celsius,
  pressure_psi,
  bi_indicator_result,
  cycle_status,
  created_at,
  updated_at,
  operator_id,
  notes
) VALUES
-- Recent cycles for analytics
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'gravity',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour 45 minutes',
  75,
  121,
  15,
  'pass',
  'completed',
  NOW() - INTERVAL '2 hours',
  NOW() - INTERVAL '1 hour 45 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Standard sterilization cycle completed successfully'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'prevacuum',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '3 hours 30 minutes',
  90,
  134,
  30,
  'pass',
  'completed',
  NOW() - INTERVAL '4 hours',
  NOW() - INTERVAL '3 hours 30 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Prevacuum cycle for surgical instruments'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-002',
  'gravity',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '5 hours 15 minutes',
  45,
  121,
  15,
  'pass',
  'completed',
  NOW() - INTERVAL '6 hours',
  NOW() - INTERVAL '5 hours 15 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Quick cycle for small items'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'gravity',
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '7 hours 20 minutes',
  80,
  121,
  15,
  'fail',
  'completed',
  NOW() - INTERVAL '8 hours',
  NOW() - INTERVAL '7 hours 20 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'BI test failed - requires investigation'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-002',
  'prevacuum',
  NOW() - INTERVAL '10 hours',
  NOW() - INTERVAL '9 hours 10 minutes',
  110,
  134,
  30,
  'pass',
  'completed',
  NOW() - INTERVAL '10 hours',
  NOW() - INTERVAL '9 hours 10 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Extended cycle for complex instruments'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'gravity',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '11 hours 30 minutes',
  60,
  121,
  15,
  'pass',
  'completed',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '11 hours 30 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Standard cycle for routine items'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-002',
  'gravity',
  NOW() - INTERVAL '24 hours',
  NOW() - INTERVAL '23 hours 15 minutes',
  75,
  121,
  15,
  'pass',
  'completed',
  NOW() - INTERVAL '24 hours',
  NOW() - INTERVAL '23 hours 15 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Yesterday cycle completed successfully'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'prevacuum',
  NOW() - INTERVAL '48 hours',
  NOW() - INTERVAL '47 hours 5 minutes',
  95,
  134,
  30,
  'pass',
  'completed',
  NOW() - INTERVAL '48 hours',
  NOW() - INTERVAL '47 hours 5 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Two days ago cycle for surgical items'
);

-- Now let's add some inventory items for supply depletion forecasting
INSERT INTO inventory_items (
  id,
  facility_id,
  item_name,
  category,
  current_stock,
  reorder_level,
  max_stock,
  unit_cost,
  supplier,
  last_restocked,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Surgical Scissors',
  'Surgical Instruments',
  15,
  20,
  100,
  45.99,
  'MedSupply Co',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'BI Test Strips',
  'Testing Supplies',
  8,
  25,
  200,
  12.50,
  'TestKit Solutions',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '45 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Sterilization Pouches',
  'Packaging',
  120,
  150,
  1000,
  0.85,
  'Packaging Plus',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '120 days',
  NOW() - INTERVAL '15 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Autoclave Tape',
  'Indicators',
  45,
  50,
  500,
  8.99,
  'Indicator Corp',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '20 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Forceps',
  'Surgical Instruments',
  22,
  25,
  150,
  32.50,
  'MedSupply Co',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '75 days',
  NOW() - INTERVAL '25 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Sterilization Wraps',
  'Packaging',
  85,
  100,
  800,
  1.25,
  'Packaging Plus',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '10 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'CI Test Strips',
  'Testing Supplies',
  12,
  30,
  250,
  15.75,
  'TestKit Solutions',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '100 days',
  NOW() - INTERVAL '40 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'Scalpel Blades',
  'Surgical Instruments',
  180,
  200,
  1000,
  2.99,
  'MedSupply Co',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '5 days'
);

-- Let's also add some autoclave equipment data if the table exists
-- (This might need to be created first)
INSERT INTO autoclave_equipment (
  id,
  facility_id,
  autoclave_id,
  model,
  capacity_liters,
  status,
  last_maintenance,
  created_at,
  updated_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'SteriMax Pro 2000',
  200,
  'operational',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '180 days',
  NOW() - INTERVAL '15 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-002',
  'SteriMax Pro 1500',
  150,
  'operational',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '200 days',
  NOW() - INTERVAL '20 days'
);

-- Add some user training data if the table exists
-- (This might need to be created first)
INSERT INTO user_training (
  id,
  user_id,
  facility_id,
  training_module,
  completion_status,
  score,
  completed_at,
  created_at
) VALUES
(
  gen_random_uuid(),
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  '550e8400-e29b-41d4-a716-446655440000',
  'Sterilization Basics',
  'completed',
  85,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '45 days'
),
(
  gen_random_uuid(),
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  '550e8400-e29b-41d4-a716-446655440000',
  'BI Testing Procedures',
  'completed',
  92,
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '40 days'
),
(
  gen_random_uuid(),
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  '550e8400-e29b-41d4-a716-446655440000',
  'Autoclave Maintenance',
  'in_progress',
  65,
  NULL,
  NOW() - INTERVAL '20 days'
);

-- Add some audit log entries for risk assessment
INSERT INTO audit_logs (
  id,
  facility_id,
  user_id,
  action_type,
  action_details,
  risk_level,
  created_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'sterilization_cycle',
  'BI test failed - cycle completed without proper validation',
  'high',
  NOW() - INTERVAL '8 hours'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'inventory_check',
  'Low stock alert for BI Test Strips',
  'medium',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'maintenance_skipped',
  'Autoclave maintenance overdue by 5 days',
  'medium',
  NOW() - INTERVAL '5 days'
);

-- Update some inventory items to show depletion scenarios
UPDATE inventory_items 
SET current_stock = 5, 
    updated_at = NOW() 
WHERE item_name = 'BI Test Strips';

UPDATE inventory_items 
SET current_stock = 8, 
    updated_at = NOW() 
WHERE item_name = 'CI Test Strips';

UPDATE inventory_items 
SET current_stock = 3, 
    updated_at = NOW() 
WHERE item_name = 'Autoclave Tape';

-- Add some historical price data for inflation tracking
INSERT INTO inventory_price_history (
  id,
  inventory_item_id,
  price,
  effective_date,
  created_at
) VALUES
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'BI Test Strips' LIMIT 1),
  11.50,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '90 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'BI Test Strips' LIMIT 1),
  12.00,
  NOW() - INTERVAL '60 days',
  NOW() - INTERVAL '60 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'BI Test Strips' LIMIT 1),
  12.50,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'Surgical Scissors' LIMIT 1),
  42.99,
  NOW() - INTERVAL '120 days',
  NOW() - INTERVAL '120 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'Surgical Scissors' LIMIT 1),
  44.50,
  NOW() - INTERVAL '90 days',
  NOW() - INTERVAL '90 days'
),
(
  gen_random_uuid(),
  (SELECT id FROM inventory_items WHERE item_name = 'Surgical Scissors' LIMIT 1),
  45.99,
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
);

-- Add some efficiency tracking data
INSERT INTO efficiency_metrics (
  id,
  facility_id,
  metric_type,
  metric_value,
  time_saved_minutes,
  cost_savings,
  recorded_at,
  created_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'automated_cycle_tracking',
  95.5,
  15,
  25.50,
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'inventory_automation',
  88.2,
  30,
  45.00,
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'ai_recommendations',
  92.1,
  20,
  35.75,
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days'
);

-- Add some tool usage tracking data
INSERT INTO tool_usage_logs (
  id,
  facility_id,
  tool_batch_id,
  tool_name,
  usage_count,
  sterilization_cycle_id,
  created_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'batch-001',
  'Surgical Scissors',
  1,
  (SELECT id FROM sterilization_cycles LIMIT 1),
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'batch-002',
  'Forceps',
  2,
  (SELECT id FROM sterilization_cycles LIMIT 1),
  NOW() - INTERVAL '2 hours'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'batch-003',
  'Scalpel Blades',
  5,
  (SELECT id FROM sterilization_cycles LIMIT 1),
  NOW() - INTERVAL '2 hours'
);

-- Finally, let's add some recent activity to make the dashboard feel current
INSERT INTO sterilization_cycles (
  id,
  facility_id,
  autoclave_id,
  cycle_type,
  start_time,
  end_time,
  duration_minutes,
  temperature_celsius,
  pressure_psi,
  bi_indicator_result,
  cycle_status,
  created_at,
  updated_at,
  operator_id,
  notes
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'gravity',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '15 minutes',
  45,
  121,
  15,
  'pass',
  'completed',
  NOW() - INTERVAL '30 minutes',
  NOW() - INTERVAL '15 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Recent cycle for emergency items'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-002',
  'prevacuum',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes',
  90,
  134,
  30,
  'pass',
  'completed',
  NOW() - INTERVAL '1 hour',
  NOW() - INTERVAL '30 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Complex instrument sterilization'
);

-- Update some inventory to show real-time changes
UPDATE inventory_items 
SET current_stock = current_stock - 2,
    updated_at = NOW()
WHERE item_name IN ('Sterilization Pouches', 'Autoclave Tape');

-- Add a critical stock alert
UPDATE inventory_items 
SET current_stock = 2,
    updated_at = NOW()
WHERE item_name = 'BI Test Strips';

-- Add some failed cycles for risk assessment
INSERT INTO sterilization_cycles (
  id,
  facility_id,
  autoclave_id,
  cycle_type,
  start_time,
  end_time,
  duration_minutes,
  temperature_celsius,
  pressure_psi,
  bi_indicator_result,
  cycle_status,
  created_at,
  updated_at,
  operator_id,
  notes
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave-001',
  'gravity',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '11 hours 30 minutes',
  60,
  121,
  15,
  'fail',
  'completed',
  NOW() - INTERVAL '12 hours',
  NOW() - INTERVAL '11 hours 30 minutes',
  '64030f5e-593f-48e8-944e-10d50b4506b4',
  'Temperature fluctuation detected - BI test failed'
);

COMMIT;

-- Display summary of what was added
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
  'autoclave_equipment' as table_name,
  COUNT(*) as record_count
FROM autoclave_equipment
WHERE facility_id = '550e8400-e29b-41d4-a716-446655440000';
