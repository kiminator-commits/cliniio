import { vi } from 'vitest';
import { AuthResponse } from '@supabase/supabase-js';

// Mock environment variables for testing
export const mockEnv = {
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key',
  VITE_APP_ENV: 'test',
};

// Mock the getEnvVar function
export const mockGetEnv = {
  getEnvVar: (key: string) => mockEnv[key as keyof typeof mockEnv] || '',
};

// Enhanced mock for the Supabase client with more realistic scenarios
export const createEnhancedMockSupabaseClient = () => {
  const mockFrom = vi.fn();
  const mockAuth = {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    updateUser: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  };
  const mockChannel = {
    on: vi.fn().mockReturnThis(),
    subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
  };

  return {
    from: mockFrom,
    auth: mockAuth,
    channel: vi.fn().mockReturnValue(mockChannel),
    removeAllChannels: vi.fn(),
  };
};

// Mock response factories
export const createMockAuthResponse = (
  user: Record<string, unknown> | null = null,
  session: Record<string, unknown> | null = null,
  error: string | null = null
): AuthResponse => ({
  user: user as User | null, // Type assertion to match AuthResponse interface
  session: session as Session | null, // Type assertion to match AuthResponse interface
  error,
});

export const createMockDatabaseResponse = (
  data: Record<string, unknown> | null = null,
  error: Record<string, unknown> | null = null,
  count?: number
) => ({
  data,
  error,
  count,
});

// Mock error factories
export const createMockNetworkError = (message: string = 'Network timeout') =>
  new Error(message);

export const createMockRateLimitError = () => ({
  user: null,
  session: null,
  error: 'Too many requests',
});

export const createMockLockoutError = () => ({
  user: null,
  session: null,
  error: 'Account temporarily locked',
});

export const createMockConnectionError = () => ({
  user: null,
  session: null,
  error: 'Connection to database failed',
});

export const createMockPermissionError = () => ({
  user: null,
  session: null,
  error: 'Permission denied',
});

export const createMockValidationError = (
  details: string = 'name cannot be empty'
) => ({
  user: null,
  session: null,
  error: `Validation failed: ${details}`,
});

// Mock query builder factories
export const createMockQueryBuilder = (response: Record<string, unknown>) => {
  const mockOrder = vi.fn().mockResolvedValue(response);
  const mockSelect = vi.fn().mockReturnValue({ order: mockOrder });
  const mockEq = vi.fn().mockReturnValue({ select: mockSelect });
  const mockOr = vi.fn().mockReturnValue({ order: mockOrder });
  const mockNot = vi.fn().mockResolvedValue(response);
  const mockSingle = vi.fn().mockResolvedValue(response);

  return {
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    or: mockOr,
    not: mockNot,
    single: mockSingle,
  };
};

// Mock table factory
export const createMockTable = (queryBuilder: Record<string, unknown>) => ({
  select: queryBuilder.select,
  insert: vi.fn().mockReturnValue({ select: queryBuilder.select }),
  update: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({ select: queryBuilder.select }),
  }),
  delete: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({ select: queryBuilder.select }),
  }),
});

// Mock subscription factory
export const createMockSubscription = () => ({
  on: vi.fn().mockReturnThis(),
  subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
});

// Setup Jest mocks
export const setupJestMocks = () => {
  // Mock the getEnvVar function
  vi.mock('@/lib/getEnv', () => ({
    getEnvVar: (key: string) => mockEnv[key as keyof typeof mockEnv] || '',
  }));

  // Mock the entire module to simulate missing env vars
  vi.doMock('@/lib/getEnv', () => ({
    getEnvVar: vi.fn().mockReturnValue(''),
  }));
};

// Test setup utilities
export const setupTestEnvironment = () => {
  process.env.NODE_ENV = 'test';
};

export const cleanupTestEnvironment = () => {
  vi.clearAllMocks();
};

// Performance testing utilities
export const measureExecutionTime = async (
  fn: () => Promise<Record<string, unknown>>
) => {
  const startTime = Date.now();
  const result = await fn();
  const endTime = Date.now();
  return {
    result,
    executionTime: endTime - startTime,
  };
};

// Data generation utilities
export const generateMockInventoryItem = (
  id: string,
  overrides: Record<string, unknown> = {}
) => ({
  id,
  name: `Item ${id}`,
  category: 'Test Category',
  location: 'Test Location',
  status: 'active',
  quantity: 10,
  unit_cost: 100.0,
  user_id: 'test-user-id',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  data: {
    // Runtime-only fields go here
    ...((overrides as Record<string, unknown>).data ?? {}),
  },
  ...overrides,
});

export const generateMockInventoryDataset = (
  count: number,
  overrides: Record<string, unknown> = {}
) =>
  Array.from({ length: count }, (_, i) =>
    generateMockInventoryItem(`item-${i}`, overrides)
  );

export const generateMockLargeDataset = (count: number) =>
  generateMockInventoryDataset(count);

// Mock service responses
export const createMockInventoryResponse = (
  data: Record<string, unknown>[] = [],
  count?: number
) =>
  createMockDatabaseResponse(
    data as unknown as Record<string, unknown>,
    undefined,
    count
  );

export const createMockAuthSuccessResponse = (
  user: Record<string, unknown> = { id: 'test-user' }
) => createMockAuthResponse(user, { access_token: 'test-token' }, null);

export const createMockAuthErrorResponse = (errorMessage: string) =>
  createMockAuthResponse(null, null, errorMessage);
