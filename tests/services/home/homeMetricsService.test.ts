import { homeMetricsService } from '../../../src/services/home/homeMetricsService';

import { vi } from 'vitest';
// Mock the AI task performance service
vi.mock('../../../src/services/aiTaskPerformanceService', () => ({
  getTimeSavingsAggregates: vi.fn().mockResolvedValue({
    daily_time_saved: 120,
    monthly_time_saved: 3600,
  }),
  getCostSavingsAggregates: vi.fn().mockResolvedValue({
    monthly_cost_savings: 5000,
    annual_cost_savings: 60000,
  }),
  getTeamPerformanceAggregates: vi.fn().mockResolvedValue({
    skills: 85,
    inventory: 90,
    sterilization: 88,
  }),
}));

// Mock supabase client
vi.mock('../../../src/lib/supabaseClient', () => ({
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
        }),
      }),
    }),
  },
}));

describe('HomeMetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    homeMetricsService.clearCache();
  });

  describe('getHomeMetrics', () => {
    it('should return default metrics when no user is found', async () => {
      // Mock no user
      const { supabase } = await import('../../../src/lib/supabaseClient');
      supabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
      });

      const result = await homeMetricsService.getHomeMetrics();

      expect(result).toEqual({
        timeSaved: { daily: 0, monthly: 0 },
        aiTimeSaved: { daily: 0, monthly: 0 },
        costSavings: { monthly: 0, annual: 0 },
        aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
        teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
        gamificationStats: {
          totalTasks: 0,
          completedTasks: 0,
          perfectDays: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      });
    });

    it('should handle database errors and return default metrics', async () => {
      // Mock database error
      const { supabase } = await import('../../../src/lib/supabaseClient');
      supabase.from.mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockRejectedValue(new Error('Database error')),
          }),
        }),
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation();

      const result = await homeMetricsService.getHomeMetrics();

      expect(result).toEqual({
        timeSaved: { daily: 0, monthly: 0 },
        aiTimeSaved: { daily: 0, monthly: 0 },
        costSavings: { monthly: 0, annual: 0 },
        aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
        teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
        gamificationStats: {
          totalTasks: 0,
          completedTasks: 0,
          perfectDays: 0,
          currentStreak: 0,
          bestStreak: 0,
        },
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to fetch home metrics, using defaults:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      homeMetricsService.clearCache();
      const stats = homeMetricsService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      const stats = homeMetricsService.getCacheStats();
      expect(stats).toHaveProperty('size');
      expect(stats).toHaveProperty('keys');
      expect(Array.isArray(stats.keys)).toBe(true);
    });
  });
});
