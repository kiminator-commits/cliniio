-- Insert sample BI test results and activity log data for analytics
-- Using the facility ID that the system expects: '550e8400-e29b-41d4-a716-446655440000'

-- Insert sample BI test results
INSERT INTO bi_test_results (
    facility_id,
    test_date,
    test_type,
    result,
    operator_id,
    notes,
    created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '1 day',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '2 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '3 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '4 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '5 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '6 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    NOW() - INTERVAL '7 days',
    'daily',
    'pass',
    '550e8400-e29b-41d4-a716-446655440001',
    'Daily BI test completed successfully',
    NOW()
);

-- Insert sample sterilization cycles for analytics
INSERT INTO sterilization_cycles (
    facility_id,
    cycle_type,
    cycle_name,
    status,
    start_time,
    end_time,
    temperature_celsius,
    pressure_psi,
    duration_minutes,
    operator_id,
    notes,
    created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'standard',
    'Cycle 2024-001',
    'completed',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '1 hour',
    121.0,
    15.0,
    45,
    '550e8400-e29b-41d4-a716-446655440001',
    'Standard sterilization cycle for surgical instruments',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'standard',
    'Cycle 2024-002',
    'completed',
    NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '3 hours',
    121.0,
    15.0,
    45,
    '550e8400-e29b-41d4-a716-446655440001',
    'Standard sterilization cycle for endoscopes',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'standard',
    'Cycle 2024-003',
    'completed',
    NOW() - INTERVAL '6 hours',
    NOW() - INTERVAL '5 hours',
    121.0,
    15.0,
    45,
    '550e8400-e29b-41d4-a716-446655440001',
    'Standard sterilization cycle for power tools',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'standard',
    'Cycle 2024-004',
    'completed',
    NOW() - INTERVAL '8 hours',
    NOW() - INTERVAL '7 hours',
    121.0,
    15.0,
    45,
    '550e8400-e29b-41d4-a716-446655440001',
    'Standard sterilization cycle for specialty instruments',
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'standard',
    'Cycle 2024-005',
    'completed',
    NOW() - INTERVAL '10 hours',
    NOW() - INTERVAL '9 hours',
    121.0,
    15.0,
    45,
    '550e8400-e29b-41d4-a716-446655440001',
    'Standard sterilization cycle for surgical trays',
    NOW()
);

-- Insert sample activity log entries
INSERT INTO activity_logs (
    user_id,
    facility_id,
    module,
    action,
    table_name,
    record_id,
    old_values,
    new_values,
    metadata,
    created_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sterilization',
    'cycle_started',
    'sterilization_cycles',
    (SELECT id FROM sterilization_cycles WHERE cycle_name = 'Cycle 2024-001' LIMIT 1),
    '{}',
    '{"status": "in_progress", "start_time": "2024-08-15T14:00:00Z"}',
    '{"cycle_type": "standard", "operator": "John Doe", "tool_count": 15}',
    NOW() - INTERVAL '2 hours'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sterilization',
    'cycle_completed',
    'sterilization_cycles',
    (SELECT id FROM sterilization_cycles WHERE cycle_name = 'Cycle 2024-001' LIMIT 1),
    '{"status": "in_progress"}',
    '{"status": "completed", "end_time": "2024-08-15T14:45:00Z"}',
    '{"cycle_type": "standard", "operator": "John Doe", "tool_count": 15, "duration_minutes": 45}',
    NOW() - INTERVAL '1 hour'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sterilization',
    'bi_test_completed',
    'bi_test_results',
    (SELECT id FROM bi_test_results WHERE test_date = NOW() - INTERVAL '1 day' LIMIT 1),
    '{}',
    '{"result": "pass", "test_type": "daily"}',
    '{"test_type": "daily", "operator": "John Doe", "test_date": "2024-08-14"}',
    NOW() - INTERVAL '1 day'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sterilization',
    'tool_scanned',
    'sterilization_tools',
    (SELECT id FROM sterilization_tools WHERE barcode = 'SCAL001' LIMIT 1),
    '{"status": "available"}',
    '{"status": "in_cycle"}',
    '{"barcode": "SCAL001", "operator": "John Doe", "workflow": "clean"}',
    NOW() - INTERVAL '30 minutes'
),
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440000',
    'sterilization',
    'tool_sterilized',
    'sterilization_tools',
    (SELECT id FROM sterilization_tools WHERE barcode = 'HEMO001' LIMIT 1),
    '{"status": "in_cycle", "sterilization_count": 21}',
    '{"status": "available", "sterilization_count": 22, "last_sterilized": "2024-08-15T14:45:00Z"}',
    '{"barcode": "HEMO001", "operator": "John Doe", "cycle_id": "2024-001"}',
    NOW() - INTERVAL '1 hour'
);
