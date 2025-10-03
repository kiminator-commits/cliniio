/**
 * Integration utilities for the type-safe Supabase mock client
 * Provides backward compatibility and easy migration from existing mocks
 */
import { vi } from 'vitest';

// Mock implementations since the actual modules don't exist
interface TypeSafeMockSupabaseClient {
  from: (table: string) => unknown;
  auth: unknown;
  storage: unknown;
  functions: unknown;
  channel: (name: string) => unknown;
  removeChannel: (subscription: unknown) => void;
  realtime: {
    removeAllChannels: () => void;
    removeChannel: (subscription: unknown) => void;
    channel: (name: string) => unknown;
    getChannels: () => unknown[];
  };
}

interface EnhancedMockConfig {
  enableLogging?: boolean;
  delay?: number;
  simulateErrors?: boolean;
  mockData?: Record<string, unknown>;
}

// Mock implementations
export function createTypeSafeMockSupabaseClient(
  _config: EnhancedMockConfig = {}
): TypeSafeMockSupabaseClient {
  return {
    from: vi.fn(),
    auth: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
    },
    storage: {
      from: vi.fn(),
      upload: vi.fn(),
      download: vi.fn(),
      list: vi.fn(),
      remove: vi.fn(),
      createSignedUrl: vi.fn(),
      getPublicUrl: vi.fn(),
    },
    functions: {
      invoke: vi.fn(),
    },
    channel: vi.fn(),
    removeChannel: vi.fn(),
    realtime: {
      removeAllChannels: vi.fn(),
      removeChannel: vi.fn(),
      channel: vi.fn(),
      getChannels: vi.fn(() => []),
    },
  };
}

export function createRealisticMockClient(
  config: EnhancedMockConfig = {}
): TypeSafeMockSupabaseClient {
  return createTypeSafeMockSupabaseClient(config);
}

export function createErrorTestingMockClient(
  config: EnhancedMockConfig = {}
): TypeSafeMockSupabaseClient {
  return createTypeSafeMockSupabaseClient(config);
}

function createPerformanceTestingMockClient(): TypeSafeMockSupabaseClient {
  return createTypeSafeMockSupabaseClient({});
}
import { Database } from '@/types/database.types';

// ============================================================================
// BACKWARD COMPATIBILITY LAYER
// ============================================================================

/**
 * Create a mock client that's compatible with existing Jest mocks
 * This maintains the same interface as the old mock factory
 */
export function createJestCompatibleMockClient(): TypeSafeMockSupabaseClient {
  const mockClient = createTypeSafeMockSupabaseClient({
    enableLogging: false, // Disable logging in tests
    delay: 0, // No delay in tests
    simulateErrors: false,
    mockData: {
      defaultListSize: 5,
      useRealisticData: false,
    },
  });

  // Wrap methods to be Vitest-compatible
  const wrappedClient = {
    ...mockClient,
    from: vi
      .fn()
      .mockImplementation(
        <T extends keyof Database['public']['Tables']>(table: T) =>
          mockClient.from(table as string)
      ),
    auth: {
      ...mockClient.auth,
      signInWithPassword: vi
        .fn()
        .mockImplementation((credentials) =>
          mockClient.auth.signIn(credentials)
        ),
      signUp: vi
        .fn()
        .mockImplementation((credentials) =>
          mockClient.auth.signUp(credentials)
        ),
      signOut: vi.fn().mockImplementation(() => mockClient.auth.signOut()),
      getUser: vi.fn().mockImplementation(() => mockClient.auth.getUser()),
      getSession: vi
        .fn()
        .mockImplementation(() => mockClient.auth.getSession()),
      onAuthStateChange: vi
        .fn()
        .mockImplementation((callback) =>
          mockClient.auth.onAuthStateChange(callback)
        ),
      updateUser: vi
        .fn()
        .mockImplementation((attributes) =>
          mockClient.auth.updateUser(attributes)
        ),
      resetPasswordForEmail: vi
        .fn()
        .mockImplementation((email) =>
          mockClient.auth.resetPasswordForEmail(email)
        ),
    },
    channel: vi
      .fn()
      .mockImplementation((name: string) => mockClient.channel(name)),
    removeAllChannels: vi
      .fn()
      .mockImplementation(() => mockClient.realtime.removeAllChannels()),
    // Add missing properties (using public accessor methods if available)
    removeChannel: vi
      .fn()
      .mockImplementation((subscription) =>
        mockClient.realtime.removeChannel(subscription)
      ),
  };

  return wrappedClient as unknown as TypeSafeMockSupabaseClient;
}

/**
 * Create a mock client with specific responses for testing
 */
export function createMockClientWithResponses(responses: {
  auth?: {
    getUser?: () => Promise<{ data: { user: unknown } | null; error: unknown }>;
    getSession?: () => Promise<{
      data: { session: unknown } | null;
      error: unknown;
    }>;
    signIn?: (credentials: {
      email: string;
      password: string;
    }) => Promise<{ data: unknown; error: unknown }>;
    signUp?: (credentials: {
      email: string;
      password: string;
    }) => Promise<{ data: unknown; error: unknown }>;
    signOut?: () => Promise<{ error: unknown }>;
  };
  database?: {
    select?: (
      query?: string
    ) => Promise<{ data: unknown[] | null; error: unknown }>;
    insert?: (
      data: unknown
    ) => Promise<{ data: unknown[] | null; error: unknown }>;
    update?: (
      data: unknown
    ) => Promise<{ data: unknown[] | null; error: unknown }>;
    delete?: () => Promise<{ data: unknown[] | null; error: unknown }>;
  };
}): TypeSafeMockSupabaseClient {
  const mockClient = createJestCompatibleMockClient();

  // Override auth responses if provided
  if (responses.auth) {
    if (responses.auth.getUser) {
      (
        mockClient.auth.getUser as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(responses.auth.getUser);
    }
    if (responses.auth.getSession) {
      (
        mockClient.auth.getSession as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(responses.auth.getSession);
    }
    if (responses.auth.signIn) {
      (
        mockClient.auth.signIn as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(responses.auth.signIn);
    }
    if (responses.auth.signUp) {
      (
        mockClient.auth.signUp as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(responses.auth.signUp);
    }
    if (responses.auth.signOut) {
      (
        mockClient.auth.signOut as {
          mockResolvedValue: (value: unknown) => void;
        }
      ).mockResolvedValue(responses.auth.signOut);
    }
  }

  // Override database responses if provided
  if (responses.database) {
    const originalFrom = mockClient.from;
    (
      mockClient.from as {
        mockImplementation: (fn: (table: string) => unknown) => void;
      }
    ).mockImplementation(
      <T extends keyof Database['public']['Tables']>(table: T) => {
        const tableBuilder = originalFrom(table as string);

        if (responses.database?.select) {
          const originalSelect = tableBuilder.select;
          tableBuilder.select = vi
            .fn()
            .mockImplementation((columns?: string) => {
              const selectBuilder = originalSelect(columns);
              selectBuilder.then = vi
                .fn()
                .mockResolvedValue(responses.database!.select);
              selectBuilder.single = vi
                .fn()
                .mockResolvedValue(responses.database!.select);
              return selectBuilder;
            });
        }

        if (responses.database?.insert) {
          const originalInsert = tableBuilder.insert;
          tableBuilder.insert = vi.fn().mockImplementation((data: unknown) => {
            const insertBuilder = originalInsert(data);
            insertBuilder.then = vi
              .fn()
              .mockResolvedValue(responses.database!.insert);
            insertBuilder.single = vi
              .fn()
              .mockResolvedValue(responses.database!.insert);
            return insertBuilder;
          });
        }

        if (responses.database?.update) {
          const originalUpdate = tableBuilder.update;
          tableBuilder.update = vi.fn().mockImplementation((data: unknown) => {
            const updateBuilder = originalUpdate(data as Partial<unknown>);
            updateBuilder.then = vi
              .fn()
              .mockResolvedValue(responses.database!.update);
            updateBuilder.single = vi
              .fn()
              .mockResolvedValue(responses.database!.update);
            return updateBuilder;
          });
        }

        if (responses.database?.delete) {
          const originalDelete = tableBuilder.delete;
          tableBuilder.delete = vi.fn().mockImplementation(() => {
            const deleteBuilder = originalDelete();
            deleteBuilder.then = vi
              .fn()
              .mockResolvedValue(responses.database!.delete);
            return deleteBuilder;
          });
        }

        return tableBuilder;
      }
    );
  }

  return mockClient;
}

// ============================================================================
// MIGRATION HELPERS
// ============================================================================

/**
 * Migrate existing Jest mocks to use the new type-safe mock
 * This function helps transition from old mock patterns
 */
export function migrateJestMocks(
  existingMocks: Record<string, unknown>,
  config?: Partial<EnhancedMockConfig>
): TypeSafeMockSupabaseClient {
  const mockClient = createTypeSafeMockSupabaseClient({
    enableLogging: false,
    delay: 0,
    simulateErrors: false,
    ...config,
  });

  // Apply existing mock behaviors
  Object.keys(existingMocks).forEach((key) => {
    if (key in mockClient) {
      (mockClient as unknown as Record<string, unknown>)[key] =
        existingMocks[key];
    }
  });

  return mockClient;
}

// ============================================================================
// TEST UTILITIES
// ============================================================================

/**
 * Create a mock client for specific test scenarios
 */
export const TestMockClients = {
  /**
   * Basic mock for simple tests
   */
  basic: () =>
    createTypeSafeMockSupabaseClient({
      enableLogging: false,
      delay: 0,
      simulateErrors: false,
    }),

  /**
   * Realistic mock for integration tests
   */
  realistic: () => createRealisticMockClient(),

  /**
   * Error testing mock
   */
  errorTesting: () => createErrorTestingMockClient(),

  /**
   * Performance testing mock
   */
  performance: () => createPerformanceTestingMockClient(),
};

/**
 * Common test response patterns
 */
export const TestResponses = {
  success: {
    data: { id: 'test-id', name: 'Test Item' },
    error: null,
  },
  error: {
    data: null,
    error: { message: 'Test error', code: 'TEST_ERROR' },
  },
  empty: {
    data: [],
    error: null,
  },
  authSuccess: {
    data: {
      user: { id: 'test-user', email: 'test@example.com' },
      session: { access_token: 'test-token' },
    },
    error: null,
  },
  authError: {
    data: { user: null, session: null },
    error: { message: 'Authentication failed' },
  },
};

// ============================================================================
// JEST INTEGRATION
// ============================================================================

/**
 * Setup Jest mocks for the new type-safe mock client
 * This replaces the old mock factory setup
 */
export function setupJestMocksForTypeSafeMock(): void {
  // Mock the supabase module
  vi.mock('@/lib/supabase', () => ({
    supabase: createJestCompatibleMockClient(),
    isSupabaseConfigured: vi.fn(() => true),
    getSupabaseUrl: vi.fn(() => 'https://test.supabase.co'),
    handleSupabaseError: vi.fn((error: unknown) => error),
  }));

  // Mock the supabaseClient module
  vi.mock('@/lib/supabaseClient', () => ({
    supabase: createJestCompatibleMockClient(),
  }));
}

/**
 * Reset all Jest mocks for the type-safe mock client
 */
export function resetJestMocksForTypeSafeMock(): void {
  vi.clearAllMocks();
  vi.resetAllMocks();
}
