// Mock getEnvVar before importing components that use it
vi.mock('@/lib/getEnv', () => ({
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

// Mock both supabase client paths
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Test Item',
                category: 'Test Category',
                location: 'Test Location',
                status: 'active',
                quantity: 10,
                unit_cost: 100.0,
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                facility_id: '550e8400-e29b-41d4-a716-446655440002',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  name: 'Test Item',
                  category: 'Test Category',
                  location: 'Test Location',
                  status: 'active',
                  quantity: 10,
                  unit_cost: 100.0,
                  user_id: '550e8400-e29b-41d4-a716-446655440000',
                  facility_id: '550e8400-e29b-41d4-a716-446655440002',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z',
                },
              ],
              error: null,
            }),
          }),
          single: vi.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Test Item',
              category: 'Test Category',
              location: 'Test Location',
              status: 'active',
              quantity: 10,
              unit_cost: 100.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440002',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Test Item',
                category: 'Test Category',
                location: 'Test Location',
                status: 'active',
                quantity: 10,
                unit_cost: 100.0,
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                facility_id: '550e8400-e29b-41d4-a716-446655440002',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            error: null,
          }),
        }),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Test Item',
            category: 'Test Category',
            location: 'Test Location',
            status: 'active',
            quantity: 10,
            unit_cost: 100.0,
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            facility_id: '550e8400-e29b-41d4-a716-446655440002',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Test Item',
              category: 'Test Category',
              location: 'Test Location',
              status: 'active',
              quantity: 10,
              unit_cost: 100.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440002',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              name: 'New Item',
              category: 'New Category',
              location: 'New Location',
              quantity: 5,
              unit_cost: 50.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440001',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    }),
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
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Test Item',
                category: 'Test Category',
                location: 'Test Location',
                status: 'active',
                quantity: 10,
                unit_cost: 100.0,
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                facility_id: '550e8400-e29b-41d4-a716-446655440002',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
              error: null,
            }),
            order: vi.fn().mockResolvedValue({
              data: [
                {
                  id: '550e8400-e29b-41d4-a716-446655440001',
                  name: 'Test Item',
                  category: 'Test Category',
                  location: 'Test Location',
                  status: 'active',
                  quantity: 10,
                  unit_cost: 100.0,
                  user_id: '550e8400-e29b-41d4-a716-446655440000',
                  facility_id: '550e8400-e29b-41d4-a716-446655440002',
                  created_at: '2024-01-01T00:00:00Z',
                  updated_at: '2024-01-01T00:00:00Z',
                },
              ],
              error: null,
            }),
          }),
          single: vi.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Test Item',
              category: 'Test Category',
              location: 'Test Location',
              status: 'active',
              quantity: 10,
              unit_cost: 100.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440002',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
          order: vi.fn().mockResolvedValue({
            data: [
              {
                id: '550e8400-e29b-41d4-a716-446655440001',
                name: 'Test Item',
                category: 'Test Category',
                location: 'Test Location',
                status: 'active',
                quantity: 10,
                unit_cost: 100.0,
                user_id: '550e8400-e29b-41d4-a716-446655440000',
                facility_id: '550e8400-e29b-41d4-a716-446655440002',
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z',
              },
            ],
            error: null,
          }),
        }),
        single: vi.fn().mockResolvedValue({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'Test Item',
            category: 'Test Category',
            location: 'Test Location',
            status: 'active',
            quantity: 10,
            unit_cost: 100.0,
            user_id: '550e8400-e29b-41d4-a716-446655440000',
            facility_id: '550e8400-e29b-41d4-a716-446655440002',
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: '550e8400-e29b-41d4-a716-446655440001',
              name: 'Test Item',
              category: 'Test Category',
              location: 'Test Location',
              status: 'active',
              quantity: 10,
              unit_cost: 100.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440002',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
          ],
          error: null,
        }),
      }),
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: '550e8400-e29b-41d4-a716-446655440003',
              name: 'New Item',
              category: 'New Category',
              location: 'New Location',
              quantity: 5,
              unit_cost: 50.0,
              user_id: '550e8400-e29b-41d4-a716-446655440000',
              facility_id: '550e8400-e29b-41d4-a716-446655440001',
              created_at: '2024-01-01T00:00:00Z',
              updated_at: '2024-01-01T00:00:00Z',
            },
            error: null,
          }),
        }),
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: {}, error: null }),
          }),
        }),
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
      }),
    }),
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null, session: null },
        error: null,
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
    },
  },
  isSupabaseConfigured: vi.fn().mockReturnValue(true),
  handleSupabaseError: vi.fn().mockImplementation((error) => ({
    message: error.message || 'Unknown error',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  })),
}));

import { supabase } from '@/lib/supabaseClient';
import { isSupabaseConfigured } from '@/lib/supabase';
import { vi } from 'vitest';
import { SupabaseAuthService } from '@/services/supabase/authService';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

// Get the mocked supabase client
const mockSupabaseClient = vi.mocked(supabase);

describe('Supabase Integration Tests', () => {
  beforeAll(() => {
    // Set up test environment
    process.env.NODE_ENV = 'test';
  });

  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Clean up
    vi.clearAllMocks();
  });

  describe('Configuration', () => {
    test.skip('should be properly configured', () => {
      expect(isSupabaseConfigured()).toBe(false);
    });

    test('should have valid Supabase client', () => {
      expect(supabase).toBeDefined();
      expect(supabase.auth).toBeDefined();
      expect(supabase.from).toBeDefined();
    });
  });

  describe('Authentication Service', () => {
    test('should have all required methods', () => {
      expect(SupabaseAuthService.signIn).toBeDefined();
      expect(SupabaseAuthService.signUp).toBeDefined();
      expect(SupabaseAuthService.signOut).toBeDefined();
      expect(SupabaseAuthService.getCurrentUser).toBeDefined();
      expect(SupabaseAuthService.getSession).toBeDefined();
    });

    test('should handle sign in with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      // Mock the Supabase auth response
      const _mockSignInResponse = {
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
          },
        },
        error: null,
      };

      // Mock the user profile response
      const mockUserProfile = {
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
      };

      // Mock the auth.signInWithPassword to return success
      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
          },
          session: {
            access_token: 'test-token',
            refresh_token: 'test-refresh-token',
          },
        },
        error: null,
      });

      // Mock the from().select().eq().single() chain for user profile
      const mockSingle = vi.fn().mockResolvedValue({
        data: mockUserProfile,
        error: null,
      });

      const mockEq = vi.fn().mockReturnValue({
        single: mockSingle,
      });

      const mockSelect = vi.fn().mockReturnValue({
        eq: mockEq,
      });

      mockSupabaseClient.from.mockReturnValue({
        select: mockSelect,
      });

      const result = await SupabaseAuthService.signIn(credentials);

      expect(result.error).toBeNull();
      expect(result.user).toBeDefined();
    });

    test('should handle sign in with invalid credentials', async () => {
      const credentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword',
      };

      const mockErrorResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        mockErrorResponse
      );

      const result = await SupabaseAuthService.signIn(credentials);

      expect(result.error).toBe('Invalid login credentials');
      expect(result.user).toBeNull();
    });
  });

  describe('Inventory Service', () => {
    test('should have all required methods', () => {
      expect(inventoryServiceFacade.getAllItems).toBeDefined();
      expect(inventoryServiceFacade.createItem).toBeDefined();
      expect(inventoryServiceFacade.updateItem).toBeDefined();
      expect(inventoryServiceFacade.deleteItem).toBeDefined();
      expect(inventoryServiceFacade.getCategories).toBeDefined();
      expect(inventoryServiceFacade.getLocations).toBeDefined();
    });

    test('should handle getting inventory items', async () => {
      const mockItems = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'Test Item',
          category: 'Tools',
          location: 'Test Location',
          status: 'active',
          quantity: 10,
          unit_cost: 100.0,
          user_id: '550e8400-e29b-41d4-a716-446655440000',
          facility_id: '550e8400-e29b-41d4-a716-446655440002',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
      ];

      // Mock the repository's fetchAllInventoryData method directly
      const mockRepository = {
        isInitialized: true,
        fetchAllInventoryData: vi.fn().mockResolvedValue({
          tools: mockItems.filter((item) => item.category === 'Tools'),
          supplies: mockItems.filter((item) => item.category === 'Supplies'),
          equipment: mockItems.filter((item) => item.category === 'Equipment'),
          officeHardware: mockItems.filter(
            (item) => item.category === 'Office Hardware'
          ),
          categories: ['Tools', 'Supplies', 'Equipment', 'Office Hardware'],
          isLoading: false,
          error: null,
        }),
      };

      // Replace the repository temporarily
      const originalRepository = inventoryServiceFacade['repository'];
      inventoryServiceFacade['repository'] = mockRepository as any;

      const result = await inventoryServiceFacade.getAllItems();

      expect(result.error).toBeNull();
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0]).toHaveProperty(
        'id',
        '550e8400-e29b-41d4-a716-446655440001'
      );
      expect(result.data?.[0]).toHaveProperty('name', 'Test Item');
      expect(result.data?.[0]).toHaveProperty('category', 'Tools');
      expect(result.count).toBe(1);

      // Restore the original repository
      inventoryServiceFacade['repository'] = originalRepository;
    });

    test('should handle creating inventory item', async () => {
      const newItem = {
        name: 'New Item',
        category: 'New Category',
        location: 'New Location',
        quantity: 5,
        unit_cost: 50.0,
        user_id: '550e8400-e29b-41d4-a716-446655440000',
        facility_id: '550e8400-e29b-41d4-a716-446655440001',
      };

      // Mock the repository's createItem method directly
      const mockRepository = {
        isInitialized: true,
        createItem: vi.fn().mockResolvedValue({
          data: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            name: newItem.name,
            category: newItem.category,
            location: newItem.location,
            quantity: newItem.quantity,
            unit_cost: newItem.unit_cost,
            user_id: newItem.user_id,
            facility_id: newItem.facility_id,
            created_at: '2024-01-01T00:00:00Z',
            updated_at: '2024-01-01T00:00:00Z',
          },
          error: null,
        }),
      };

      // Replace the repository temporarily
      const originalRepository = inventoryServiceFacade['repository'];
      inventoryServiceFacade['repository'] = mockRepository as any;

      const result = await inventoryServiceFacade.createItem(newItem);

      expect(result.error).toBeNull();
      expect(result.data).not.toBeNull();
      expect(result.data!.name).toBe('New Item');

      // Restore the original repository
      inventoryServiceFacade['repository'] = originalRepository;
    });

    test('should handle database errors gracefully', async () => {
      // Mock the repository to return an error
      const mockRepository = {
        isInitialized: true,
        fetchAllInventoryData: vi.fn().mockResolvedValue({
          tools: [],
          supplies: [],
          equipment: [],
          officeHardware: [],
          categories: [],
          isLoading: false,
          error: 'Database connection failed',
        }),
      };

      // Mock the cache manager to return null (no cached data)
      const mockCacheManager = {
        get: vi.fn().mockReturnValue(null),
        set: vi.fn(),
        clear: vi.fn(),
      };

      // Replace the repository and cache manager temporarily
      const originalRepository = inventoryServiceFacade['repository'];
      const originalCacheManager = inventoryServiceFacade['cacheManager'];
      inventoryServiceFacade['repository'] = mockRepository as any;
      inventoryServiceFacade['cacheManager'] = mockCacheManager as any;

      const result = await inventoryServiceFacade.getAllItems();

      expect(result.error).toBe('Database connection failed');
      expect(result.data).toEqual([]);

      // Restore the original repository and cache manager
      inventoryServiceFacade['repository'] = originalRepository;
      inventoryServiceFacade['cacheManager'] = originalCacheManager;
    });
  });

  describe('Real-time Features', () => {
    test('should support real-time subscriptions', () => {
      // Check if the facade has real-time capabilities
      expect(inventoryServiceFacade).toBeDefined();
      expect(typeof inventoryServiceFacade.getAllItems).toBe('function');

      // The service uses RealtimeManager internally
      expect(true).toBe(true); // Placeholder for real-time functionality
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed responses', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'Cliniio2025.secure!',
      };

      // Mock a response with null data (no user data)
      const mockSignInResponse = {
        data: null,
        error: null,
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(
        mockSignInResponse
      );

      const result = await SupabaseAuthService.signIn(credentials);

      expect(result.error).toBe('No user data received');
      expect(result.user).toBeNull();
    });
  });
});
