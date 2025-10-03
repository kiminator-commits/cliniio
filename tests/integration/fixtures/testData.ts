// Test data and fixtures for Supabase integration tests

export const testCredentials = {
  valid: {
    email: 'test@example.com',
    password: 'Cliniio2025.secure!',
  },
  invalid: {
    email: 'invalid@example.com',
    password: 'wrongpassword',
  },
  locked: {
    email: 'locked@example.com',
    password: 'Cliniio2025.secure!',
  },
  reset: {
    email: 'reset@example.com',
  },
};

export const testUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'test@example.com',
  name: 'Test User',
  role: 'operator',
  facility_id: '550e8400-e29b-41d4-a716-446655440001',
};

export const testSession = {
  access_token: 'test-access-token',
  refresh_token: 'test-refresh-token',
  expires_at: Date.now() + 3600000,
  user: testUser,
};

export const testInventoryItem = {
  id: '550e8400-e29b-41d4-a716-446655440002',
  name: 'Test Item',
  category: 'Test Category',
  location: 'Test Location',
  status: 'active',
  quantity: 10,
  unit_cost: 100.0,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  facility_id: '550e8400-e29b-41d4-a716-446655440001',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const testInventoryItems = [
  testInventoryItem,
  {
    ...testInventoryItem,
    id: 'item-124',
    name: 'Test Item 2',
    quantity: 5,
  },
  {
    ...testInventoryItem,
    id: 'item-125',
    name: 'Test Item 3',
    category: 'Different Category',
    quantity: 15,
  },
];

export const testCategories = ['Category 1', 'Category 2', 'Category 3'];
export const testLocations = ['Location A', 'Location B', 'Location C'];

export const testCategoriesData = testCategories.map((cat) => ({
  category: cat,
}));
export const testLocationsData = testLocations.map((loc) => ({
  location: loc,
}));

export const testIncidentDetails = {
  incidentNumber: 'INC-2024-001',
  failureDate: '2024-01-15T10:30:00Z',
  affectedToolsCount: 5,
  failureReason: 'Temperature deviation',
  operatorName: 'John Doe',
};

export const testManagerDetails = {
  managerId: 'manager-123',
  managerName: 'Jane Smith',
  managerEmail: 'jane.smith@clinic.com',
};

export const testRegulatoryContacts = [
  'regulatory@health.gov',
  'compliance@health.gov',
];

export const testLargeDataset = Array.from({ length: 1000 }, (_, i) => ({
  id: `item-${i}`,
  name: `Item ${i}`,
  category: 'Test Category',
  location: 'Test Location',
  status: 'active',
  quantity: 10,
  unit_cost: 100.0,
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}));

export const testBulkItems = Array.from({ length: 100 }, (_, i) => ({
  name: `Bulk Item ${i}`,
  category: 'Bulk Category',
  location: 'Bulk Location',
  quantity: 1,
  cost: 10.0,
  user_id: '550e8400-e29b-41d4-a716-446655440000',
  facility_id: '550e8400-e29b-41d4-a716-446655440001',
}));

export const testInvalidItem = {
  name: '', // Invalid: empty name
  category: 'Test Category',
  quantity: -1, // Invalid: negative quantity
  facility_id: '550e8400-e29b-41d4-a716-446655440001',
};

export const testUpdateData = {
  quantity: 5,
  cost: 150.0,
  status: 'inactive',
};

export const testSearchQueries = [
  'test',
  'item',
  'category',
  'special@#$%^&*()',
  'test with spaces',
  'TEST UPPERCASE',
  'test123',
];

export const testPaginationParams = {
  page: 1,
  limit: 50,
  offset: 0,
};

export const testFilterParams = {
  category: 'Test Category',
  location: 'Test Location',
  status: 'active',
  minQuantity: 5,
  maxQuantity: 20,
  minCost: 50,
  maxCost: 200,
};

export const testSortParams = {
  field: 'name',
  direction: 'asc' as 'asc' | 'desc',
};

export const testRealTimeEvents = [
  {
    type: 'INSERT',
    table: 'inventory_items',
    record: testInventoryItem,
  },
  {
    type: 'UPDATE',
    table: 'inventory_items',
    record: { ...testInventoryItem, quantity: 15 },
  },
  {
    type: 'DELETE',
    table: 'inventory_items',
    record: testInventoryItem,
  },
];

export const testErrorScenarios = {
  networkTimeout: {
    message: 'Network timeout',
    code: 'NETWORK_ERROR',
  },
  rateLimit: {
    message: 'Too many requests',
    status: 429,
  },
  accountLockout: {
    message: 'Account temporarily locked',
    status: 423,
  },
  connectionFailure: {
    message: 'Connection to database failed',
    code: 'PGRST301',
  },
  permissionDenied: {
    message: 'Permission denied',
    code: 'PGRST116',
  },
  validationError: {
    message: 'Validation failed',
    details: 'name cannot be empty',
  },
  malformedResponse: {
    message: 'Malformed response',
    data: { invalidField: 'malformed' },
  },
};

export const testPerformanceMetrics = {
  maxExecutionTime: 1000, // 1 second
  maxMemoryUsage: 50 * 1024 * 1024, // 50MB
  maxResponseSize: 1024 * 1024, // 1MB
  acceptableLatency: 500, // 500ms
};

export const testTransactionScenarios = {
  successful: {
    create: { success: true, data: testInventoryItem },
    update: { success: true, data: { ...testInventoryItem, quantity: 5 } },
    delete: { success: true, data: null },
  },
  failed: {
    create: { success: false, error: 'Validation failed' },
    update: { success: false, error: 'Transaction failed' },
    delete: { success: false, error: 'Permission denied' },
  },
  rollback: {
    create: { success: true, data: testInventoryItem },
    update: { success: false, error: 'Transaction failed' },
    expectedState: 'rolled back',
  },
};

export const testConcurrencyScenarios = {
  simultaneousUpdates: [
    { id: 'item-123', quantity: 5 },
    { id: 'item-123', quantity: 3 },
    { id: 'item-123', quantity: 7 },
  ],
  conflictingOperations: [
    { operation: 'create', data: testInventoryItem },
    { operation: 'update', data: { id: 'item-123', quantity: 5 } },
    { operation: 'delete', data: { id: 'item-123' } },
  ],
};

export const testDataIntegrityScenarios = {
  consistency: {
    initial: testInventoryItem,
    updated: { ...testInventoryItem, quantity: 5, cost: 150.0 },
    expected: { ...testInventoryItem, quantity: 5, cost: 150.0 },
  },
  validation: {
    valid: testInventoryItem,
    invalid: testInvalidItem,
    boundary: {
      ...testInventoryItem,
      quantity: 0, // Boundary case
      cost: 0, // Boundary case
    },
  },
};

export const testEnvironmentConfigs = {
  development: {
    VITE_SUPABASE_URL: 'https://dev.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'dev-anon-key',
    NODE_ENV: 'development',
  },
  test: {
    VITE_SUPABASE_URL: 'https://test.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
  },
  production: {
    VITE_SUPABASE_URL: 'https://prod.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'prod-anon-key',
    NODE_ENV: 'production',
  },
  missing: {
    VITE_SUPABASE_URL: '',
    VITE_SUPABASE_ANON_KEY: '',
    NODE_ENV: 'test',
  },
};
