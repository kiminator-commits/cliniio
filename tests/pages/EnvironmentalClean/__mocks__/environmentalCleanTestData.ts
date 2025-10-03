// Test data for Environmental Clean tests
// This data matches the structure from the environmental_cleans_enhanced table

export const testRooms = [
  {
    id: 'room-001',
    name: 'Operating Room 1',
    status: 'clean' as const,
    metadata: {
      cleaningType: 'terminal',
      qualityScore: 0.95,
      complianceScore: 0.98,
      scheduledTime: '2024-01-15T10:00:00Z',
      completedTime: '2024-01-15T11:30:00Z',
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T11:30:00Z',
  },
  {
    id: 'room-002',
    name: 'Operating Room 2',
    status: 'dirty' as const,
    metadata: {
      cleaningType: 'daily',
      qualityScore: null,
      complianceScore: null,
      scheduledTime: '2024-01-15T15:30:00Z',
      completedTime: null,
    },
    createdAt: '2024-01-15T15:30:00Z',
    updatedAt: '2024-01-15T15:30:00Z',
  },
  {
    id: 'room-003',
    name: 'Recovery Room',
    status: 'clean' as const,
    metadata: {
      cleaningType: 'daily',
      qualityScore: 0.92,
      complianceScore: 0.95,
      scheduledTime: '2024-01-15T08:00:00Z',
      completedTime: '2024-01-15T09:15:00Z',
    },
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T09:15:00Z',
  },
];

export const testAnalytics = {
  totalRooms: 3,
  cleanRooms: 2,
  dirtyRooms: 1,
  inProgressRooms: 0,
  cleaningEfficiency: 85,
  averageCleaningTime: 45,
  lastUpdated: '2024-01-15T12:00:00Z',
  monthlyStats: {
    totalCleanings: 45,
    onTimeCleanings: 42,
    delayedCleanings: 3,
  },
};

export const testChecklists = [
  {
    id: 'checklist-001',
    name: 'Daily Cleaning Checklist',
    items: [
      { id: 'item-001', description: 'Wipe down surfaces', completed: true },
      { id: 'item-002', description: 'Mop floors', completed: true },
      { id: 'item-003', description: 'Empty trash', completed: false },
    ],
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'checklist-002',
    name: 'Terminal Cleaning Checklist',
    items: [
      {
        id: 'item-004',
        description: 'Deep clean all surfaces',
        completed: true,
      },
      { id: 'item-005', description: 'Sanitize equipment', completed: true },
      { id: 'item-006', description: 'Replace filters', completed: true },
    ],
    isActive: true,
    createdAt: '2024-01-15T16:00:00Z',
    updatedAt: '2024-01-15T16:00:00Z',
  },
];

// Supabase database format test data
export const testSupabaseRooms = [
  {
    id: 'clean-001',
    room_id: 'room-001',
    room_name: 'Operating Room 1',
    status: 'completed',
    cleaning_type: 'terminal',
    scheduled_time: '2024-01-15T10:00:00Z',
    completed_time: '2024-01-15T11:30:00Z',
    quality_score: 0.95,
    compliance_score: 0.98,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T11:30:00Z',
  },
  {
    id: 'clean-002',
    room_id: 'room-002',
    room_name: 'Operating Room 2',
    status: 'pending',
    cleaning_type: 'daily',
    scheduled_time: '2024-01-15T15:30:00Z',
    completed_time: null,
    quality_score: null,
    compliance_score: null,
    created_at: '2024-01-15T15:30:00Z',
    updated_at: '2024-01-15T15:30:00Z',
  },
  {
    id: 'clean-003',
    room_id: 'room-003',
    room_name: 'Recovery Room',
    status: 'completed',
    cleaning_type: 'daily',
    scheduled_time: '2024-01-15T08:00:00Z',
    completed_time: '2024-01-15T09:15:00Z',
    quality_score: 0.92,
    compliance_score: 0.95,
    created_at: '2024-01-15T08:00:00Z',
    updated_at: '2024-01-15T09:15:00Z',
  },
];

export const testSupabaseChecklists = [
  {
    id: 'clean-001',
    checklist_items: [
      { id: 'item-001', description: 'Wipe down surfaces' },
      { id: 'item-002', description: 'Mop floors' },
      { id: 'item-003', description: 'Empty trash' },
    ],
    completed_items: ['item-001', 'item-002'],
    failed_items: [],
    cleaning_type: 'daily',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'clean-002',
    checklist_items: [
      { id: 'item-004', description: 'Deep clean all surfaces' },
      { id: 'item-005', description: 'Sanitize equipment' },
      { id: 'item-006', description: 'Replace filters' },
    ],
    completed_items: ['item-004', 'item-005', 'item-006'],
    failed_items: [],
    cleaning_type: 'terminal',
    created_at: '2024-01-15T16:00:00Z',
    updated_at: '2024-01-15T16:00:00Z',
  },
];
