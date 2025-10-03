// Realistic Data Generators
import { TableName, TableRow } from '../types/supabaseMockTypes';

/**
 * Generate realistic UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate realistic timestamp
 */
export function generateTimestamp(daysAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
}

/**
 * Generate realistic email
 */
export function generateEmail(domain = 'example.com'): string {
  const names = [
    'john',
    'jane',
    'bob',
    'alice',
    'charlie',
    'diana',
    'eve',
    'frank',
  ];
  const name = names[Math.floor(Math.random() * names.length)];
  const number = Math.floor(Math.random() * 1000);
  return `${name}${number}@${domain}`;
}

/**
 * Generate realistic facility data
 */
export function generateFacilityData(
  overrides?: Partial<TableRow<'facilities'>>
): TableRow<'facilities'> {
  const facilityTypes = [
    'hospital',
    'clinic',
    'laboratory',
    'pharmacy',
    'research_center',
  ];
  const facilityNames = [
    'General Hospital',
    'City Medical Center',
    'Regional Clinic',
    'University Hospital',
    'Community Health Center',
    'Specialty Medical Center',
    'Emergency Care Facility',
  ];

  return {
    id: generateUUID(),
    name: facilityNames[Math.floor(Math.random() * facilityNames.length)],
    type: facilityTypes[Math.floor(Math.random() * facilityTypes.length)] as
      | 'hospital'
      | 'clinic'
      | 'laboratory'
      | 'pharmacy'
      | 'research_center',
    facility_type: facilityTypes[
      Math.floor(Math.random() * facilityTypes.length)
    ] as 'hospital' | 'clinic' | 'laboratory' | 'pharmacy' | 'research_center',
    address: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'ST',
      zip: '12345',
    },
    contact_info: { phone: '555-0123', email: 'contact@facility.com' },
    hourly_rate: Math.floor(Math.random() * 200) + 50,
    settings: { notifications: true, theme: 'light' },
    staff_count: Math.floor(Math.random() * 100) + 10,
    subscription_tier: 'premium',
    is_active: true,
    created_at: generateTimestamp(30),
    updated_at: generateTimestamp(1),
    ...overrides,
  };
}

/**
 * Generate realistic user data
 */
export function generateUserData(
  overrides?: Partial<TableRow<'users'>>
): TableRow<'users'> {
  const roles = [
    'admin',
    'manager',
    'technician',
    'nurse',
    'doctor',
    'supervisor',
  ];
  const departments = [
    'sterilization',
    'inventory',
    'environmental',
    'maintenance',
    'quality',
  ];

  return {
    id: generateUUID(),
    email: generateEmail(),
    role: roles[Math.floor(Math.random() * roles.length)] as
      | 'admin'
      | 'manager'
      | 'technician'
      | 'nurse'
      | 'doctor'
      | 'supervisor',
    department: departments[Math.floor(Math.random() * departments.length)] as
      | 'sterilization'
      | 'inventory'
      | 'environmental'
      | 'maintenance'
      | 'quality',
    facility_id: generateUUID(),
    active_sessions: Math.floor(Math.random() * 3),
    avatar_url: null,
    bio: null,
    date_of_birth: null,
    work_schedule: {
      hours: '9-5',
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    },
    emergency_contact: {
      name: 'Emergency Contact',
      phone: '555-9999',
      relationship: 'Spouse',
    },
    first_name: 'John',
    last_name: 'Doe',
    full_name: 'John Doe',
    mobile_shortcuts: { quick_actions: ['sterilize', 'inventory', 'reports'] },
    phone: '555-0123',
    position: 'Technician',
    preferences: { theme: 'light', notifications: true },
    preferred_language: 'en',
    timezone: 'UTC',
    total_points: Math.floor(Math.random() * 1000),
    is_active: true,
    created_at: generateTimestamp(60),
    updated_at: generateTimestamp(1),
    last_login: generateTimestamp(Math.floor(Math.random() * 7)),
    ...overrides,
  };
}

/**
 * Generate realistic inventory item data
 */
export function generateInventoryItemData(
  overrides?: Partial<TableRow<'inventory_items'>>
): TableRow<'inventory_items'> {
  const categories = [
    'sterilization_tools',
    'surgical_instruments',
    'cleaning_supplies',
    'protective_equipment',
    'maintenance_tools',
    'testing_equipment',
    'disposables',
    'reusable_items',
  ];

  const itemNames = [
    'Autoclave Tray',
    'Surgical Scissors',
    'Disinfectant Spray',
    'N95 Masks',
    'Sterilization Pouches',
    'Temperature Probe',
    'Pressure Gauge',
    'Sterilization Tape',
    'Biological Indicators',
    'Chemical Indicators',
    'Sterilization Logs',
    'Maintenance Kit',
  ];

  const baseQuantity = Math.floor(Math.random() * 100) + 1;
  const reorderPoint = Math.floor(baseQuantity * 0.2);
  const unitCost = Math.round((Math.random() * 500 + 10) * 100) / 100;

  return {
    id: generateUUID(),
    name: itemNames[Math.floor(Math.random() * itemNames.length)],
    category: categories[Math.floor(Math.random() * categories.length)],
    quantity: baseQuantity,
    reorder_point: reorderPoint,
    unit_cost: unitCost,
    facility_id: generateUUID(),
    expiration_date: generateTimestamp(-Math.floor(Math.random() * 365)),
    data: {
      supplier: `Supplier ${Math.floor(Math.random() * 10) + 1}`,
      batch_number: `BATCH-${Math.floor(Math.random() * 10000)}`,
      location: `Room ${Math.floor(Math.random() * 20) + 1}`,
      condition: 'good',
      last_inspected: generateTimestamp(Math.floor(Math.random() * 30)),
    },
    created_at: generateTimestamp(90),
    updated_at: generateTimestamp(Math.floor(Math.random() * 7)),
    ...overrides,
  };
}

/**
 * Generate realistic activity feed data
 */
export function generateActivityFeedData(
  overrides?: Partial<TableRow<'activity_feed'>>
): TableRow<'activity_feed'> {
  const activityTypes = [
    'sterilization_cycle',
    'inventory_update',
    'maintenance_performed',
    'user_login',
    'data_export',
    'report_generated',
    'alert_triggered',
    'system_update',
  ];

  const modules = [
    'sterilization',
    'inventory',
    'environmental',
    'maintenance',
    'reports',
    'settings',
  ];

  const activityTitles = [
    'Sterilization Cycle Completed',
    'Inventory Item Updated',
    'Maintenance Performed',
    'User Logged In',
    'Data Export Generated',
    'Report Created',
    'Alert Triggered',
    'System Configuration Updated',
  ];

  return {
    id: generateUUID(),
    activity_title:
      activityTitles[Math.floor(Math.random() * activityTitles.length)],
    activity_type:
      activityTypes[Math.floor(Math.random() * activityTypes.length)],
    activity_description: `Activity performed in ${modules[Math.floor(Math.random() * modules.length)]} module`,
    module: modules[Math.floor(Math.random() * modules.length)],
    facility_id: generateUUID(),
    user_id: generateUUID(),
    related_record_id: generateUUID(),
    related_record_type: 'inventory_item',
    metadata: {
      duration: Math.floor(Math.random() * 300) + 60,
      success: Math.random() > 0.1,
      details: 'Mock activity details',
    },
    created_at: generateTimestamp(Math.floor(Math.random() * 7)),
    updated_at: generateTimestamp(Math.floor(Math.random() * 7)),
    ...overrides,
  };
}

/**
 * Generate realistic AI challenge completion data
 */
export function generateAIChallengeCompletionData(
  overrides?: Partial<TableRow<'ai_challenge_completions'>>
): TableRow<'ai_challenge_completions'> {
  const challengeTypes = [
    'sterilization_quiz',
    'inventory_management',
    'safety_protocols',
    'equipment_handling',
    'compliance_training',
    'emergency_procedures',
    'quality_control',
    'maintenance_procedures',
  ];

  const score = Math.floor(Math.random() * 40) + 60; // 60-100 range
  const timeTaken = Math.floor(Math.random() * 300000) + 30000; // 30s to 5min in ms

  return {
    id: generateUUID(),
    challenge_id: generateUUID(),
    challenge_type:
      challengeTypes[Math.floor(Math.random() * challengeTypes.length)],
    user_id: generateUUID(),
    facility_id: generateUUID(),
    score,
    time_taken_ms: timeTaken,
    completed_at: generateTimestamp(Math.floor(Math.random() * 30)),
    data: {
      questions_answered: Math.floor(Math.random() * 20) + 10,
      correct_answers: Math.floor(
        (score / 100) * (Math.floor(Math.random() * 20) + 10)
      ),
      difficulty_level: Math.floor(Math.random() * 3) + 1,
      topics_covered: challengeTypes.slice(
        0,
        Math.floor(Math.random() * 3) + 1
      ),
    },
    rewards: {
      points_earned: Math.floor(score / 10),
      badges_unlocked:
        score > 90
          ? ['expert', 'perfectionist']
          : score > 80
            ? ['advanced']
            : [],
      streak_bonus: Math.floor(Math.random() * 5),
    },
    created_at: generateTimestamp(30),
    updated_at: generateTimestamp(Math.floor(Math.random() * 7)),
    ...overrides,
  };
}

/**
 * Generate realistic sterilization cycle data
 */
export function generateSterilizationCycleData(
  overrides?: Partial<TableRow<'sterilization_cycles'>>
): TableRow<'sterilization_cycles'> {
  const cycleTypes = ['gravity', 'pre-vacuum', 'flash', 'immediate_use'];
  const statuses = ['completed', 'failed', 'in_progress', 'cancelled'];
  // const _equipmentTypes = ['autoclave', 'sterilizer', 'washer_disinfector'];

  const startTime = generateTimestamp(Math.floor(Math.random() * 7));
  const duration = Math.floor(Math.random() * 60) + 15; // 15-75 minutes
  const endTime = new Date(
    new Date(startTime).getTime() + duration * 60000
  ).toISOString();

  return {
    id: generateUUID(),
    cycle_type: cycleTypes[Math.floor(Math.random() * cycleTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)] as
      | 'completed'
      | 'failed'
      | 'in_progress'
      | 'cancelled',
    facility_id: generateUUID(),
    autoclave_id: generateUUID(),
    cycle_number: `CYC-${Math.floor(Math.random() * 10000)}`,
    cycle_time: duration,
    start_time: startTime,
    end_time: endTime,
    duration_minutes: duration,
    notes: `Cycle ${Math.floor(Math.random() * 1000)} completed`,
    operator_id: generateUUID(),
    parameters: { temperature: 250, pressure: 15, time: 30 },
    pressure_psi: Math.round((Math.random() * 5 + 15) * 100) / 100,
    results: { passed: true, quality_score: 95 },
    temperature_celsius: Math.floor(Math.random() * 20) + 250,
    tool_batch_id: generateUUID(),
    tools: { count: 5, types: ['scalpel', 'forceps', 'scissors'] },
    created_at: generateTimestamp(7),
    updated_at: generateTimestamp(Math.floor(Math.random() * 7)),
    ...overrides,
  };
}

// ============================================================================
// SCHEMA-AWARE DATA GENERATORS
// ============================================================================

/**
 * Generate realistic data for any table based on schema
 */
export function generateTableData<T extends TableName>(
  tableName: T,
  overrides?: Partial<TableRow<T>>
): TableRow<T> {
  const generators: Record<string, () => Record<string, unknown>> = {
    facilities: () => generateFacilityData(),
    users: () => generateUserData(),
    inventory_items: () => generateInventoryItemData(),
    activity_feed: () => generateActivityFeedData(),
    ai_challenge_completions: () => generateAIChallengeCompletionData(),
    sterilization_cycles: () => generateSterilizationCycleData(),
  };

  const generator = generators[tableName];
  if (generator) {
    return {
      ...(generator() as Record<string, unknown>),
      ...overrides,
    } as TableRow<T>;
  }

  // Fallback: generate basic data structure
  return {
    id: generateUUID(),
    created_at: generateTimestamp(30),
    updated_at: generateTimestamp(1),
    ...overrides,
  } as TableRow<T>;
}

/**
 * Generate multiple records for a table
 */
export function generateTableDataList<T extends TableName>(
  tableName: T,
  count: number,
  overrides?: Partial<TableRow<T>>
): TableRow<T>[] {
  return Array.from({ length: count }, () =>
    generateTableData(tableName, {
      ...overrides,
      id: generateUUID(),
    } as Partial<TableRow<T>>)
  );
}
