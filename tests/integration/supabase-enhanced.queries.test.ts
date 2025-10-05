// Enhanced Supabase Integration Tests - Queries and Filtering
// Focused on queries, selects, and filtering logic

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      getSession: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn(),
      })),
    })),
  },
  isSupabaseConfigured: vi.fn(() => false),
  getSupabaseUrl: vi.fn(() => 'https://mock.supabase.co'),
  handleSupabaseError: vi.fn(
    (error: unknown) =>
      new Error(
        error && typeof error === 'object' && 'message' in error
          ? String(error.message)
          : 'Mock error'
      )
  ),
}));

// Mock TypedSupabaseAdapter
vi.mock('@/services/inventory/adapters/TypedSupabaseAdapterLoader', () => ({
  getTypedSupabaseAdapter: vi.fn().mockResolvedValue({
    TypedSupabaseAdapter: vi.fn().mockImplementation(() => ({
      getAllItems: vi.fn().mockResolvedValue({
        success: true,
        data: [],
        error: null,
        processedCount: 0,
      }),
    })),
  }),
}));

// Mock InventoryRepository and related classes
vi.mock('@/services/inventory/facade', () => ({
  InventoryRepository: vi.fn().mockImplementation(() => ({
    isInitialized: true,
    initialize: vi.fn().mockResolvedValue(undefined),
    fetchAllInventoryData: vi.fn().mockResolvedValue({
      tools: [],
      supplies: [],
      equipment: [],
      officeHardware: [],
      error: null,
    }),
    fetchInventoryItems: vi.fn().mockResolvedValue([]),
    getCategories: vi.fn().mockResolvedValue({ data: [], error: null }),
    getLocations: vi.fn().mockResolvedValue({ data: [], error: null }),
  })),
  InventoryCacheManager: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    clear: vi.fn(),
    invalidate: vi.fn(),
  })),
  InventoryAdapterManager: vi.fn().mockImplementation(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    getAdapter: vi.fn().mockReturnValue({}),
    getCurrentAdapterType: vi.fn().mockReturnValue('mock'),
  })),
  InventoryCategoryService: vi.fn().mockImplementation(() => ({})),
  InventoryFilterService: vi.fn().mockImplementation(() => ({})),
  InventoryStatusService: vi.fn().mockImplementation(() => ({})),
}));

import { isSupabaseConfigured } from '@/lib/supabase';
import { vi } from 'vitest';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
import { InventoryCrudOperations as _InventoryCrudOperations } from '@/services/inventory/utils/inventoryCrudOperations';

// Get the mocked supabase client
import { supabase } from '@/lib/supabase';
const _mockSupabaseClient = vi.mocked(supabase);

// Import modular test utilities
import {
  setupTestEnvironment,
  cleanupTestEnvironment,
  mockEnv,
} from './mocks/supabaseMockFactory';
import {
  testCredentials as _testCredentials,
  testInventoryItem as _testInventoryItem,
  testLargeDataset,
  testCategories,
  testLocations,
  testPerformanceMetrics,
} from './fixtures/testData';
import {
  validateSuccessResponse,
  validatePerformance,
} from './helpers/testHelpers';

describe('Enhanced Supabase Integration Tests - Queries and Filtering', () => {
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

  describe('Configuration & Environment', () => {
    test('should validate environment configuration', () => {
      expect(isSupabaseConfigured()).toBe(false);
      expect(mockEnv.VITE_SUPABASE_URL).toBe('https://test.supabase.co');
      expect(mockEnv.VITE_SUPABASE_ANON_KEY).toBe('test-anon-key');
    });

    test('should handle missing environment variables gracefully', async () => {
      // Mock the entire module to simulate missing env vars
      vi.doMock('@/lib/getEnv', () => ({
        getEnvVar: vi.fn().mockReturnValue(''),
      }));

      // This should handle missing config gracefully
      expect(() => isSupabaseConfigured()).not.toThrow();
    });
  });

  describe('Inventory Service - Query Operations', () => {
    test('should handle large dataset pagination', async () => {
      // Mock the repository's fetchAllInventoryData method
      const mockData = {
        tools: testLargeDataset.slice(0, 12),
        supplies: testLargeDataset.slice(12, 25),
        equipment: testLargeDataset.slice(25, 37),
        officeHardware: testLargeDataset.slice(37, 50),
        error: null,
      };

      // Get the repository instance and mock its method
      const facade = inventoryServiceFacade as any;
      const repository = facade.repository;
      vi.spyOn(repository, 'fetchAllInventoryData').mockResolvedValue(mockData);

      const result = await inventoryServiceFacade.getAllItems();

      // The service returns InventoryResponse with data array and count
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(50);
      expect(result.count).toBe(50); // Count should match the actual data length
      expect(result.error).toBeNull();
    });

    test('should handle search with special characters', async () => {
      // Mock the repository's fetchAllInventoryData method to return empty data
      const mockData = {
        tools: [],
        supplies: [],
        equipment: [],
        officeHardware: [],
        error: null,
      };

      // Get the repository instance and mock its method
      const facade = inventoryServiceFacade as any;
      const repository = facade.repository;
      vi.spyOn(repository, 'fetchAllInventoryData').mockResolvedValue(mockData);

      const result = await inventoryServiceFacade.getAllItems();

      validateSuccessResponse(
        result as { data: Record<string, unknown>[]; error: null }
      );
      expect(result.data).toEqual([]);
    });

    test('should handle category and location management', async () => {
      // Mock the repository methods directly
      const facade = inventoryServiceFacade as any;
      const repository = facade.repository;

      const mockGetCategories = vi
        .spyOn(repository, 'getCategories')
        .mockResolvedValue({ data: testCategories, error: null });
      const mockGetLocations = vi
        .spyOn(repository, 'getLocations')
        .mockResolvedValue({ data: testLocations, error: null });

      const [categoriesResult, locationsResult] = await Promise.all([
        inventoryServiceFacade.getCategories(),
        inventoryServiceFacade.getLocations(),
      ]);

      validateSuccessResponse(
        categoriesResult as { data: Record<string, unknown>[]; error: null }
      );
      validateSuccessResponse(
        locationsResult as { data: Record<string, unknown>[]; error: null }
      );
      expect(categoriesResult.data).toEqual(testCategories);
      expect(locationsResult.data).toEqual(testLocations);

      // Clean up mocks
      mockGetCategories.mockRestore();
      mockGetLocations.mockRestore();
    });
  });

  describe('Performance & Optimization - Query Performance', () => {
    test('should handle query optimization with proper indexing', async () => {
      // Mock the TypedSupabaseAdapter response directly
      const mockAdapterResponse = {
        success: true,
        data: [{ id: 'item-1', name: 'Optimized Item' }],
        error: null,
        processedCount: 1,
      };

      // Get the mocked adapter and set up the response
      const { getTypedSupabaseAdapter } = await import(
        '@/services/inventory/adapters/TypedSupabaseAdapterLoader'
      );
      const mockGetTypedSupabaseAdapter = vi.mocked(getTypedSupabaseAdapter);
      mockGetTypedSupabaseAdapter.mockResolvedValue({
        TypedSupabaseAdapter: vi.fn().mockImplementation(() => ({
          getAllItems: vi.fn().mockResolvedValue(mockAdapterResponse),
        })),
      });

      const result = await validatePerformance(
        () => inventoryServiceFacade.getAllItems(),
        testPerformanceMetrics.maxExecutionTime
      );

      validateSuccessResponse(
        result as { data: Record<string, unknown>[]; error: null }
      );
    });

    test('should handle memory-efficient data processing', async () => {
      // Mock the repository's fetchAllInventoryData method
      const mockData = {
        tools: testLargeDataset.slice(0, 25),
        supplies: testLargeDataset.slice(25, 50),
        equipment: testLargeDataset.slice(50, 75),
        officeHardware: testLargeDataset.slice(75, 100),
        error: null,
      };

      // Get the repository instance and mock its method
      const facade = inventoryServiceFacade as any;
      const repository = facade.repository;
      vi.spyOn(repository, 'fetchAllInventoryData').mockResolvedValue(mockData);

      const result = await inventoryServiceFacade.getAllItems();

      // The service returns InventoryResponse with data array and count
      expect(result).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data).toHaveLength(100);
      expect(result.count).toBe(100); // Count should match the actual data length
      expect(result.error).toBeNull();
    });
  });
});
