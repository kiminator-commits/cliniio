import { FacilityService, Facility } from '@/services/facilityService';
import { vi, describe, test, expect, beforeEach, afterEach, it, fail, type Mock } from 'vitest';
import { supabase } from '@/lib/supabaseClient';
import { isDevelopment } from '@/lib/getEnv';
import { distributedFacilityCache } from '@/services/cache/DistributedFacilityCache';
import { QueryOptions } from '@/types/QueryOptions';

// Mock dependencies
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

vi.mock('@/lib/getEnv', () => ({
  isDevelopment: vi.fn(),
}));

vi.mock('@/services/cache/DistributedFacilityCache', () => ({
  distributedFacilityCache: {
    getFacility: vi.fn(),
    setFacility: vi.fn(),
    clearAll: vi.fn(),
    invalidateFacility: vi.fn(),
  },
}));

const mockSupabase = supabase as vi.Mocked<typeof supabase>;
const mockIsDevelopment = isDevelopment as vi.MockedFunction<
  typeof isDevelopment
>;
const mockDistributedFacilityCache = distributedFacilityCache as vi.Mocked<
  typeof distributedFacilityCache
>;

// Mock console methods
const mockConsoleError = vi.fn();
const originalConsoleError = console.error;

describe('FacilityService - Updates and State Changes', () => {
  const mockFacility: Facility = {
    id: 'facility-123',
    name: 'Test Facility',
    type: 'hospital',
    isActive: true,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockConsoleError.mockClear();
    console.error = mockConsoleError;
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  describe('getAllFacilities - Facility Updates and Pagination', () => {
    it('should return paginated facilities with default options', async () => {
      const mockData = [
        {
          id: 'facility-1',
          name: 'Facility 1',
          type: 'hospital',
          is_active: true,
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ];

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: mockData,
              error: null,
              count: 1,
            }),
          }),
        }),
      } as any);

      const result = await FacilityService.getAllFacilities();

      expect(result).toEqual({
        data: [
          {
            id: 'facility-1',
            name: 'Facility 1',
            type: 'hospital',
            isActive: true,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should return paginated facilities with custom options', async () => {
      const options: QueryOptions = {
        page: 2,
        limit: 10,
        orderBy: 'type',
        orderDirection: 'desc',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: vi.fn().mockResolvedValue({
              data: [],
              error: null,
              count: 25,
            }),
          }),
        }),
      } as any);

      const result = await FacilityService.getAllFacilities(options);

      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.hasNext).toBe(true);
      expect(result.hasPrev).toBe(true);
    });

    it('should handle database errors', async () => {
      const mockError = { message: 'Database error' };

      // Mock the entire chain
      const mockRange = vi.fn().mockResolvedValue({
        data: null,
        error: mockError,
        count: 0,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockReturnValue({
            range: mockRange,
          }),
        }),
      } as any);

      // Test that the function throws an error
      try {
        await FacilityService.getAllFacilities();
        // If we get here, the function didn't throw
        fail('Expected function to throw an error');
      } catch (error) {
        expect(error).toEqual(mockError);
      }

      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to get all facilities:',
        mockError
      );
    });
  });

  describe('getCurrentFacilityId - State Management and Updates', () => {
    it('should return facility ID from cache when available', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });
      mockDistributedFacilityCache.getFacility.mockResolvedValue(mockFacility);

      const result = await FacilityService.getCurrentFacilityId();

      expect(result).toBe('facility-123');
      expect(mockDistributedFacilityCache.getFacility).toHaveBeenCalledWith(
        'facility:user-123'
      );
    });

    it('should fetch from database when not in cache', async () => {
      mockDistributedFacilityCache.getFacility.mockResolvedValue(null);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
              error: null,
            }),
          }),
        }),
      } as any);

      // Mock getFacilityById to return the facility
      vi.spyOn(FacilityService, 'getFacilityById').mockResolvedValue(
        mockFacility
      );

      const result = await FacilityService.getCurrentFacilityId();

      expect(result).toBe('facility-123');
      expect(mockDistributedFacilityCache.setFacility).toHaveBeenCalledWith(
        'facility:user-123',
        mockFacility
      );
    });

    it('should fallback to development facility when user has no facility_id', async () => {
      mockIsDevelopment.mockReturnValue(true);
      mockDistributedFacilityCache.getFacility.mockResolvedValue(null);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'No facility_id' },
            }),
          }),
        }),
      } as any);

      const result = await FacilityService.getCurrentFacilityId();

      expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(mockDistributedFacilityCache.setFacility).toHaveBeenCalledWith(
        'facility:user-123',
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Development Facility',
          type: 'hospital',
        })
      );
    });

    it('should fallback to development facility when facility not found in database', async () => {
      mockIsDevelopment.mockReturnValue(true);
      mockDistributedFacilityCache.getFacility.mockResolvedValue(null);
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
              error: null,
            }),
          }),
        }),
      } as any);

      vi.spyOn(FacilityService, 'getFacilityById').mockRejectedValue(
        new Error('Facility not found')
      );

      const result = await FacilityService.getCurrentFacilityId();

      expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
    });

    it('should handle errors and fallback to development facility', async () => {
      mockIsDevelopment.mockReturnValue(true);
      mockDistributedFacilityCache.getFacility.mockRejectedValue(
        new Error('Cache error')
      );

      const result = await FacilityService.getCurrentFacilityId();

      expect(result).toBe('550e8400-e29b-41d4-a716-446655440000');
      expect(mockConsoleError).toHaveBeenCalledWith(
        'Failed to get current facility ID:',
        expect.any(Error)
      );
    });
  });
});
