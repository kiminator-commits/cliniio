-- =====================================================
-- SAMPLE COMPLIANCE ISSUES FOR AUDIT FLAGS TABLE
-- =====================================================
-- This script inserts realistic compliance issues that would be detected
-- by AI or validation logic in a healthcare sterilization facility

-- Insert sample compliance issues with specific requirements
INSERT INTO audit_flags (
  id,
  facility_id,
  related_table,
  related_id,
  severity,
  description,
  resolved,
  created_at,
  compliance_standard,
  regulation_reference,
  requirement_description,
  corrective_action,
  due_date,
  responsible_party
) VALUES
-- HIGH SEVERITY ISSUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'sterilization_cycles',
  gen_random_uuid(),
  'high',
  'BI test failure detected in sterilization cycle - immediate investigation required',
  false,
  NOW() - INTERVAL '2 hours',
  'AAMI ST79:2017',
  'AAMI ST79:2017 Section 3.3.2.1',
  'Biological indicators must show complete kill of test organisms. Any BI failure requires immediate investigation and corrective action.',
  '1. Quarantine all items from failed cycle\n2. Investigate cause of failure\n3. Re-sterilize items using validated parameters\n4. Document investigation and corrective actions',
  NOW() + INTERVAL '24 hours',
  'Sterilization Supervisor'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'sterilization_tools',
  gen_random_uuid(),
  'high',
  'Critical surgical instrument found in quarantine for 48+ hours - potential patient safety risk',
  false,
  NOW() - INTERVAL '1 day',
  'FDA 21 CFR 820',
  'FDA 21 CFR 820.30 Design Controls',
  'Critical devices must be properly tracked and not remain in quarantine beyond acceptable timeframes to prevent patient safety risks.',
  '1. Immediately assess instrument condition\n2. Determine if instrument can be salvaged\n3. If salvageable, complete proper sterilization\n4. If not salvageable, remove from service\n5. Update tracking system',
  NOW() + INTERVAL '4 hours',
  'Sterilization Manager'
),

-- MEDIUM SEVERITY ISSUES  
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'autoclave_equipment',
  gen_random_uuid(),
  'medium',
  'Autoclave maintenance overdue by 5 days - may impact sterilization effectiveness',
  false,
  NOW() - INTERVAL '3 days',
  'AAMI ST79:2017',
  'AAMI ST79:2017 Section 3.2.1',
  'Sterilization equipment must be maintained according to manufacturer specifications and facility maintenance schedule.',
  '1. Schedule immediate maintenance appointment\n2. Perform interim safety checks\n3. Document maintenance delay and justification\n4. Update maintenance schedule',
  NOW() + INTERVAL '48 hours',
  'Biomedical Engineering'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'inventory_items',
  gen_random_uuid(),
  'medium',
  'Critical sterilization supplies below reorder point - risk of stockout',
  false,
  NOW() - INTERVAL '1 day',
  'Joint Commission Standards',
  'EC.02.02.01',
  'Facilities must maintain adequate supplies of critical items to ensure uninterrupted patient care.',
  '1. Place emergency order for critical supplies\n2. Implement inventory monitoring system\n3. Adjust reorder points based on usage patterns\n4. Establish backup supplier relationships',
  NOW() + INTERVAL '24 hours',
  'Materials Management'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'user_training',
  gen_random_uuid(),
  'medium',
  'Staff member has incomplete sterilization training - compliance requirement not met',
  false,
  NOW() - INTERVAL '2 days',
  'AAMI ST79:2017',
  'AAMI ST79:2017 Section 2.1',
  'All personnel involved in sterilization processes must complete initial and ongoing competency training.',
  '1. Schedule immediate training completion\n2. Assess competency through testing\n3. Provide hands-on training if needed\n4. Document training completion',
  NOW() + INTERVAL '72 hours',
  'Education Department'
),

-- LOW SEVERITY ISSUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'environmental_cleaning',
  gen_random_uuid(),
  'low',
  'Room cleaning schedule deviation - minor protocol variance detected',
  false,
  NOW() - INTERVAL '4 hours',
  'CDC Guidelines',
  'CDC Guidelines for Environmental Infection Control',
  'Environmental cleaning schedules must be followed to maintain infection control standards.',
  '1. Complete missed cleaning tasks\n2. Review cleaning schedule adherence\n3. Provide refresher training if needed\n4. Implement monitoring system',
  NOW() + INTERVAL '1 week',
  'Environmental Services'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'sterilization_cycles',
  gen_random_uuid(),
  'low',
  'Cycle duration exceeded recommended parameters - efficiency optimization opportunity',
  false,
  NOW() - INTERVAL '6 hours',
  'AAMI ST79:2017',
  'AAMI ST79:2017 Section 3.3.1',
  'Sterilization cycles should operate within validated parameters for optimal efficiency and effectiveness.',
  '1. Review cycle parameters and validation data\n2. Investigate cause of extended duration\n3. Optimize loading procedures\n4. Update cycle parameters if validated',
  NOW() + INTERVAL '2 weeks',
  'Sterilization Supervisor'
);

-- Add some resolved issues for context
INSERT INTO audit_flags (
  id,
  facility_id,
  related_table,
  related_id,
  severity,
  description,
  resolved,
  created_at
) VALUES
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'sterilization_tools',
  gen_random_uuid(),
  'medium',
  'Tool inspection overdue - resolved by completing inspection',
  true,
  NOW() - INTERVAL '1 week'
),
(
  gen_random_uuid(),
  '550e8400-e29b-41d4-a716-446655440000',
  'inventory_items',
  gen_random_uuid(),
  'low',
  'Minor inventory discrepancy - resolved by recount',
  true,
  NOW() - INTERVAL '3 days'
);
