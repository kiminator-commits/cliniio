-- Insert test data into home_daily_operations_tasks table
INSERT INTO home_daily_operations_tasks (
    facility_id,
    title,
    description,
    completed,
    points,
    type,
    category,
    priority,
    due_date,
    status,
    created_by
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Prepare training materials for Environmental Cleaning Standards',
    'Update and prepare training materials for the new environmental cleaning standards',
    false,
    61,
    'Training Task',
    'Policy Updates',
    'high',
    '2024-01-16',
    'pending',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Environmental Cleaning Standards: Update cleaning checklists and logs',
    'Review and update all cleaning checklists and log forms',
    false,
    93,
    'Required Task',
    'Policy Updates',
    'medium',
    '2024-01-21',
    'pending',
    '550e8400-e29b-41d4-a716-446655440001'
),
(
    '550e8400-e29b-41d4-a716-446655440000',
    'Patient Privacy Guidelines: Update privacy notice signage',
    'Update all privacy notice signage throughout the facility',
    false,
    147,
    'Required Task',
    'Policy Updates',
    'urgent',
    '2024-01-24',
    'pending',
    '550e8400-e29b-41d4-a716-446655440001'
); 