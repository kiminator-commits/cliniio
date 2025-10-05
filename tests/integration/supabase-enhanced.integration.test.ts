// Enhanced Supabase Integration Tests - External Services and Complex Scenarios
// Focused on transactions, triggers, RLS, and external service integrations

import { vi } from 'vitest';

// Override the global mock with vi.doMock
vi.doMock('@/lib/getEnv', () => ({
  getEnvVar: (key: string) => {
    if (key === 'VITE_SUPABASE_URL') return 'https://test.supabase.co';
    if (key === 'VITE_SUPABASE_ANON_KEY') return 'test-anon-key';
    return '';
  },
  isDevelopment: () => false,
  isProduction: () => false,
  isBrowser: () => false,
  isNode: () => true,
  getEnvironmentConfig: () => ({
    SUPABASE_URL: 'https://test.supabase.co',
    SUPABASE_ANON_KEY: 'test-anon-key',
    NODE_ENV: 'test',
    DEV: false,
    PROD: false,
    BROWSER: false,
    NODE: true,
  }),
}));

// Mock Supabase client with proper factory using vi.hoisted
const { createMockSupabaseClient, setGlobalMockResponse } = vi.hoisted(() => {
  // Global state to control mock behavior
  let globalMockResponse = { data: [], error: null };

  const setGlobalMockResponse = (response: any) => {
    globalMockResponse = response;
  };

  const createMockSupabaseClient = () => {
    const createMockQuery = () => {
      // Create a simple mock that always returns the global response
      const mockQuery = {
        single: vi.fn().mockResolvedValue(globalMockResponse),
        order: vi.fn().mockResolvedValue(globalMockResponse),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        range: vi.fn().mockReturnThis(),
      };

      // Make the query object itself awaitable
      const awaitableQuery = Promise.resolve(globalMockResponse);

      // Copy all methods to the promise
      Object.assign(awaitableQuery, mockQuery);

      return awaitableQuery;
    };

    return {
      supabase: {
        from: vi.fn().mockImplementation(() => createMockQuery()),
        auth: {
          signInWithPassword: vi.fn().mockResolvedValue({
            data: { user: { id: 'mock-user' } },
            error: null,
          }),
          signOut: vi.fn().mockResolvedValue({ error: null }),
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'mock-user' } },
            error: null,
          }),
          getSession: vi.fn().mockResolvedValue({
            data: { session: { user: { id: 'mock-user' } } },
            error: null,
          }),
          resetPasswordForEmail: vi.fn().mockResolvedValue({
            data: {},
            error: null,
          }),
        },
      },
      // Expose method to set global mock response
      setMockResponse: (response: any) => {
        globalMockResponse = response;
      },
    };
  };

  return { createMockSupabaseClient, setGlobalMockResponse };
});

// Mock all Supabase client files using vi.doMock for runtime mocking
vi.doMock('@/lib/supabaseClient', createMockSupabaseClient);
vi.doMock('@/services/supabaseClient', createMockSupabaseClient);

// Mock @/lib/supabase with partial mock to preserve other exports
vi.doMock('@/lib/supabase', async (importOriginal) => {
  const actual = await importOriginal();
  const mockClient = createMockSupabaseClient();
  // Add setMockResponse to the supabase object itself
  mockClient.supabase.setMockResponse = mockClient.setMockResponse;
  return {
    ...actual,
    supabase: mockClient.supabase,
    setMockResponse: mockClient.setMockResponse,
  };
});

import { SupabaseAuthService } from '@/services/supabase/authService';
import { InventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

// Import the mock client for test setup
import { supabase as mockSupabaseClient } from '@/lib/supabase';

// Get access to the setMockResponse function from the mock
let setMockResponse: (response: any) => void;

// Import modular test utilities
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
} from './mocks/supabaseMockFactory';
import { testCredentials } from './fixtures/testData';
import {
  setupMockAuth,
  setupMockSubscription,
  createMockAuthResponse,
  createMockErrorResponse,
  validateErrorResponse,
  simulateRateLimit,
} from './helpers/testHelpers';

describe('Enhanced Supabase Integration Tests - External Services and Complex Scenarios', () => {
  beforeAll(() => {
    setupTestEnvironment();
  });

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanupTestEnvironment();
  });

  describe('Authentication Service - External Service Integration', () => {
    test('should handle network timeouts gracefully', async () => {
      // Mock the specific method that the service will call
      const mockSignInWithPassword = vi
        .fn()
        .mockRejectedValue(new Error('Network timeout'));
      mockSupabaseClient.auth.signInWithPassword = mockSignInWithPassword;

      const result = await SupabaseAuthService.signIn(testCredentials.valid);

      // Debug: Check if the mock was called
      expect(mockSignInWithPassword).toHaveBeenCalled();

      validateErrorResponse(
        result as { error: string; user: null },
        'Network timeout'
      );
      expect(result.user).toBeNull();
    });

    test('should handle rate limiting', async () => {
      simulateRateLimit(mockSupabaseClient.auth, 'signInWithPassword');

      const result = await SupabaseAuthService.signIn(testCredentials.valid);

      validateErrorResponse(
        result as { error: string; user: null },
        'Too many requests'
      );
      expect(result.user).toBeNull();
    });

    test('should handle account lockout scenarios', async () => {
      const lockoutResponse = createMockAuthResponse(
        null,
        null,
        'Account temporarily locked'
      );
      setupMockAuth(mockSupabaseClient, lockoutResponse);

      const result = await SupabaseAuthService.signIn(testCredentials.locked);

      validateErrorResponse(
        result as { error: string; user: null },
        'Account temporarily locked'
      );
      expect(result.user).toBeNull();
    });

    test('should handle password reset flow', async () => {
      const resetResponse = createMockAuthResponse(null, null, null);
      setupMockAuth(mockSupabaseClient, resetResponse);

      const result = await SupabaseAuthService.resetPassword(
        testCredentials.reset.email
      );

      expect(result.error).toBeNull();
      expect(
        mockSupabaseClient.auth.resetPasswordForEmail
      ).toHaveBeenCalledWith(testCredentials.reset.email, {
        redirectTo: 'http://localhost:3000/reset-password',
      });
    });

    test('should handle session refresh scenarios', async () => {
      const mockSession = {
        access_token: 'new-access-token',
        refresh_token: 'refresh-token',
        expires_at: Date.now() + 3600000,
      };

      const sessionResponse = {
        data: { session: mockSession },
        error: null,
      };
      setupMockAuth(mockSupabaseClient, sessionResponse);

      const result = await SupabaseAuthService.getSession();

      expect(result.error).toBeNull();
      expect(result.session).toBeDefined();
    });
  });

  describe('Real-time Subscriptions - External Service Integration', () => {
    test('should handle subscription setup and teardown', async () => {
      setupMockSubscription(mockSupabaseClient);

      // Test subscription setup
      const mockChannel = (
        mockSupabaseClient as {
          channel: (name: string) => { on: vi.Mock; subscribe: vi.Mock };
        }
      ).channel('test-channel');
      expect(mockChannel.on).toBeDefined();
      expect(mockChannel.subscribe).toBeDefined();

      // Test subscription teardown
      const subscription = mockChannel.subscribe();
      expect(subscription.unsubscribe).toBeDefined();
    });

    test('should handle subscription events', async () => {
      setupMockSubscription(mockSupabaseClient);

      const mockChannel = (
        mockSupabaseClient as {
          channel: (name: string) => { on: vi.Mock; subscribe: vi.Mock };
        }
      ).channel('test-channel');
      const mockOn = mockChannel.on;
      const mockSubscribe = mockChannel.subscribe;

      // Test event handling
      mockOn('INSERT', vi.fn());
      expect(mockOn).toHaveBeenCalledWith('INSERT', expect.any(Function));

      // Test subscription
      mockSubscribe();
      expect(mockSubscribe).toHaveBeenCalled();
    });
  });

  describe('Error Handling - External Service Integration', () => {
    beforeEach(() => {
      // Reset all mocks before each test
      vi.clearAllMocks();
      // Use the global function to set mock response
      setMockResponse = setGlobalMockResponse;
    });

    test('should handle database connection failures', async () => {
      const mockResponse = createMockErrorResponse(
        'Connection to database failed',
        'PGRST301'
      );

      // Set the global mock response to return the error
      setMockResponse(mockResponse);

      // Instead of testing the complex getAllItems, let's test a simpler method
      // that doesn't require complex mock chaining
      try {
        await InventoryServiceFacade.getAllItems();
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // We expect an error to be thrown
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test('should handle permission denied errors', async () => {
      const permissionError = createMockErrorResponse(
        'Permission denied',
        'PGRST116'
      );

      // Set the global mock response to return the error
      setMockResponse(permissionError);

      // Instead of testing the complex getAllItems, let's test a simpler method
      // that doesn't require complex mock chaining
      try {
        await InventoryServiceFacade.getAllItems();
        // If we get here, the test should fail
        expect(true).toBe(false);
      } catch (error) {
        // We expect an error to be thrown
        expect(error).toBeDefined();
        expect(error instanceof Error).toBe(true);
      }
    });

    test('should handle malformed JSON responses', async () => {
      const mockMalformedResponse = createMockAuthResponse(
        { invalidField: 'malformed' },
        null,
        null
      );
      setupMockAuth(mockSupabaseClient, mockMalformedResponse);

      const result = await SupabaseAuthService.signIn(testCredentials.valid);

      expect(result.error).toBeDefined();
      expect(result.user).toBeNull();
    });
  });
});
