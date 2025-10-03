import { homeDataService } from './homeDataService';
import { vi } from 'vitest';
import { supabase } from '../lib/supabaseClient';
// import { logger } from '../utils/logger';

// Mock the getEnv utility
vi.mock('../lib/getEnv', () => ({
  isDevelopment: vi.fn().mockReturnValue(true),
}));

// Mock logger
vi.mock('../utils/logger', () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock supabase client
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('HomeDataService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    homeDataService.clearCache();
  });

  describe('fetchHomePageData', () => {
    it('should return empty data if no user is found', async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
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
      const { supabase } = await import('../lib/supabaseClient');
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
      expect(homeDataService.getCachedData()).toBeNull();
    });

    it('should return cached data', () => {
      const mockData = {
        tasks: [],
        availablePoints: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
      };

      // Set some cached data through the cache provider
      homeDataService['cacheProvider'].setCachedData(mockData);

      expect(homeDataService.getCachedData()).toEqual(mockData);
    });
  });
});
