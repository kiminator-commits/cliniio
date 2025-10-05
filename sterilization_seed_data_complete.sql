INSERT INTO sterilization_cycles (
    id,
    facility_id,
    operator_id,
    autoclave_id,
    tool_batch_id,
    cycle_type,
    cycle_number,
    status,
    start_time,
    end_time,
    notes,
    created_at,
    updated_at
) VALUES 
    -- Completed cycles
    ('12345678-1234-1234-1234-123456789001', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'standard', 'SC-2024-001', 'completed', '2024-01-15 09:30:00+00', '2024-01-15 10:15:00+00', 'Regular sterilization cycle completed successfully', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    ('12345678-1234-1234-1234-123456789002', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'express', 'SC-2024-002', 'completed', '2024-01-14 14:20:00+00', '2024-01-14 15:10:00+00', 'Express cycle for urgent instruments', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    ('12345678-1234-12341-1341-123456789003', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'standard', 'SC-2024-003', 'completed', '2024-01-13 08:45:00+00', '2024-01-13 09:30:00+00', 'Morning sterilization batch', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),
    
    -- Failed cycles  
    ('12345678-1234-1234-1234-123456789004', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'standard', 'SC-2024-004', 'failed', '2024-01-12 11:00:00+00', NULL, 'Cycle failed during heating phase - temperature insufficient', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('12345678-1234-1234-1234-123456789005', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'custom', 'SC-2024-005', 'failed', '2024-01-11 16:30:00+00', NULL, 'Custom cycle settings caused sterilization failure', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
    
    -- In progress cycles
    ('12345678-1234-1234-1234-123456789006', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'standard', 'SC-2024-006', 'in_progress', '2024-01-10 13:15:00+00', NULL, 'Currently running sterilization cycle', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days'),
    ('12345678-1234-1234-1234-123456789007', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'express', 'SC-2024-007', 'in_progress', '2024-01-09 10:45:00+00', NULL, 'Express cycle in progress', NOW() - INTERVAL '8 days', NOW() - INTERVAL '8 days'),
    
    -- Pending cycles
    ('12345678-1234-1234-1234-123456789008', '550e8400-e29b-41d4-a716-446655440000', '6ba7b810-9dad-11d1-80b4-00c04fd430c8', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'standard', 'SC-2024-008', 'pending', '2024-01-08 09:00:00+00', NULL, 'Waiting to start sterilization cycle', NOW() - INTERVAL '9 days', NOW() - INTERVAL '9 days');
