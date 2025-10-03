-- =====================================================
-- INSERT SAMPLE PACKAGE DATA
-- =====================================================

-- Insert sample packages with different types and configurations
INSERT INTO sterilization_batches (
    facility_id,
    batch_name,
    batch_type,
    status,
    package_id,
    package_type,
    package_size,
    chemical_indicator_added,
    packaged_by,
    packaged_at,
    total_items,
    notes,
    created_at,
    updated_at
) VALUES 
-- Today's packages
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-001',
    'routine',
    'packaged',
    'PKG-001',
    'pouch',
    'large',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '2 hours',
    3,
    'Surgical instrument package - Forceps, Scalpel, Retractor',
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
),
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-002',
    'routine',
    'packaged',
    'PKG-002',
    'wrap',
    'medium',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '1 hour',
    2,
    'Endoscope package - Flexible scope and light source',
    NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '1 hour'
),
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-003',
    'emergency',
    'packaged',
    'PKG-003',
    'container',
    'small',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '30 minutes',
    1,
    'Emergency dental drill package',
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
),
-- Yesterday's packages (to show daily reset)
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-001',
    'routine',
    'packaged',
    'PKG-001',
    'tray',
    'large',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '1 day',
    4,
    'Yesterday package - Multiple surgical tools',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
),
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-002',
    'routine',
    'packaged',
    'PKG-002',
    'pouch',
    'medium',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
    2,
    'Yesterday package - Basic instruments',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours',
    NOW() - INTERVAL '1 day' + INTERVAL '2 hours'
),
-- Day before yesterday
(
    (SELECT id FROM facilities LIMIT 1),
    'Package PKG-001',
    'routine',
    'packaged',
    'PKG-001',
    'wrap',
    'small',
    true,
    (SELECT id FROM users LIMIT 1),
    NOW() - INTERVAL '2 days',
    1,
    'Day before yesterday package - Single tool',
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT (package_id) DO NOTHING;

-- Insert sample batch items linking tools to packages
INSERT INTO batch_items (
    batch_id,
    tool_id,
    item_name,
    item_type,
    quantity,
    package_type,
    package_configuration,
    notes,
    created_at
) 
SELECT 
    sb.id as batch_id,
    st.id as tool_id,
    st.tool_name as item_name,
    'sterilization_tool' as item_type,
    1 as quantity,
    sb.package_type,
    jsonb_build_object(
        'package_size', sb.package_size,
        'chemical_indicator', sb.chemical_indicator_added,
        'package_id', sb.package_id
    ) as package_configuration,
    'Sample batch item' as notes,
    sb.created_at
FROM sterilization_batches sb
CROSS JOIN LATERAL (
    SELECT id, tool_name 
    FROM sterilization_tools 
    WHERE facility_id = sb.facility_id 
    LIMIT sb.total_items
) st
WHERE sb.package_id IS NOT NULL
ON CONFLICT (batch_id, tool_id) DO NOTHING;

-- Update some tools to show they're in packages
UPDATE sterilization_tools 
SET 
    status = 'in_cycle',
    current_cycle_id = (
        SELECT id FROM sterilization_cycles 
        WHERE facility_id = (SELECT id FROM facilities LIMIT 1)
        LIMIT 1
    ),
    updated_at = NOW()
WHERE id IN (
    SELECT DISTINCT bi.tool_id 
    FROM batch_items bi 
    JOIN sterilization_batches sb ON bi.batch_id = sb.id 
    WHERE sb.package_id IS NOT NULL
    LIMIT 10
);

-- Create sample audit logs for package creation
INSERT INTO audit_logs (
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
)
SELECT 
    sb.packaged_by as user_id,
    sb.facility_id,
    'sterilization' as module,
    'package_created' as action,
    'sterilization_batches' as table_name,
    sb.id as record_id,
    '{}'::jsonb as old_values,
    jsonb_build_object(
        'package_id', sb.package_id,
        'package_type', sb.package_type,
        'total_items', sb.total_items,
        'status', sb.status
    ) as new_values,
    jsonb_build_object(
        'package_id', sb.package_id,
        'tool_count', sb.total_items,
        'operator_name', 'Sample Operator',
        'package_info', jsonb_build_object(
            'type', sb.package_type,
            'size', sb.package_size,
            'ci_added', sb.chemical_indicator_added
        )
    ) as metadata,
    sb.created_at
FROM sterilization_batches sb
WHERE sb.package_id IS NOT NULL
ON CONFLICT DO NOTHING; 