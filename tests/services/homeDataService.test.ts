import { homeDataService } from '../../src/services/homeDataService';

import { vi } from 'vitest';
// Mock the logger
vi.mock('../../src/utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock the getEnv utility
vi.mock('../../src/lib/getEnv', () => ({
  isDevelopment: vi.fn().mockReturnValue(true),
}));

// Mock supabase client
vi.mock('../../src/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-123' } },
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { facility_id: 'facility-123' },
          }),
          order: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      }),
    }),
  },
}));

describe('HomeDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    homeDataService.clearCache();
  });

  describe('fetchHomePageData', () => {
    it('should handle user not found', async () => {
      // Mock no user
      const { supabase } = await import('../../src/lib/supabaseClient');
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await homeDataService.fetchHomePageData();

      expect(result).toEqual({
        tasks: [],
        availablePoints: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
      });
    });

    it('should handle challenges fetch error gracefully', async () => {
      // Clear cache first
      homeDataService.clearCache();

      // Mock user with facility_id
      const { supabase } = await import('../../src/lib/supabaseClient');
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: { id: 'user-123' } },
      });

      // Mock facility lookup success
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { facility_id: 'facility-123' },
            }),
          }),
        }),
      });

      // Mock challenges fetch error
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Database error' },
              }),
            }),
          }),
        }),
      });

      // The service should handle the error gracefully and return empty data
      const result = await homeDataService.fetchHomePageData();
      expect(result).toEqual({
        tasks: [],
        availablePoints: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
      });
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      homeDataService.clearCache();
      const cachedData = homeDataService.getCachedData();
      expect(cachedData).toBeNull();
    });

    it('should return cached data', () => {
      const cachedData = homeDataService.getCachedData();
      expect(cachedData).toBeNull();
    });
  });
});
