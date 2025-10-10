import { homeMetricsService } from './homeMetricsService';
import { vi } from 'vitest';
// import * as aiTaskPerformanceService from '../aiTaskPerformanceService';
import { supabase } from '../../lib/supabaseClient';

// Mock external dependencies
vi.mock('../aiTaskPerformanceService', () => ({
  getTimeSavingsAggregates: vi.fn(() => ({
    daily_time_saved: 120,
    monthly_time_saved: 3600,
  })),
  getCostSavingsAggregates: vi.fn(() => ({
    monthly_cost_savings: 5000,
    annual_cost_savings: 60000,
  })),
  getTeamPerformanceAggregates: vi.fn(() => ({
    skills: 85,
    inventory: 90,
    sterilization: 88,
  })),
}));

// Mock supabase client
vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}));

describe('HomeMetricsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    homeMetricsService.clearCache();
  });

  describe('getHomeMetrics', () => {
    it('should return default metrics when no user is found', async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: null },
      });

      const result = await homeMetricsService.getHomeMetrics();
      expect(result).toEqual(
        expect.objectContaining({
          timeSaved: expect.objectContaining({
            daily: expect.any(Number),
            monthly: expect.any(Number),
          }),
          aiTimeSaved: expect.objectContaining({
            daily: expect.any(Number),
            monthly: expect.any(Number),
          }),
          costSavings: expect.objectContaining({
            monthly: expect.any(Number),
            annual: expect.any(Number),
          }),
          aiEfficiency: expect.objectContaining({
            timeSavings: expect.any(Number),
            proactiveMgmt: expect.any(Number),
          }),
          teamPerformance: expect.objectContaining({
            skills: expect.anything(),
            inventory: expect.anything(),
            sterilization: expect.anything(),
          }),
          gamificationStats: expect.objectContaining({
            totalTasks: expect.any(Number),
            completedTasks: expect.any(Number),
            perfectDays: expect.any(Number),
            currentStreak: expect.any(Number),
            bestStreak: expect.any(Number),
          }),
        })
      );
    });

    it('should handle database errors and return default metrics', async () => {
      (supabase.auth.getUser as vi.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
      });
      (supabase.from as vi.Mock).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { message: 'Database error' },
            }),
          }),
        }),
      });

      const result = await homeMetricsService.getHomeMetrics();
      expect(result).toEqual(
        expect.objectContaining({
          timeSaved: expect.objectContaining({
            daily: expect.any(Number),
            monthly: expect.any(Number),
          }),
          aiTimeSaved: expect.objectContaining({
            daily: expect.any(Number),
            monthly: expect.any(Number),
          }),
          costSavings: expect.objectContaining({
            monthly: expect.any(Number),
            annual: expect.any(Number),
          }),
          aiEfficiency: expect.objectContaining({
            timeSavings: expect.any(Number),
            proactiveMgmt: expect.any(Number),
          }),
          teamPerformance: expect.objectContaining({
            skills: expect.anything(),
            inventory: expect.anything(),
            sterilization: expect.anything(),
          }),
          gamificationStats: expect.objectContaining({
            totalTasks: expect.any(Number),
            completedTasks: expect.any(Number),
            perfectDays: expect.any(Number),
            currentStreak: expect.any(Number),
            bestStreak: expect.any(Number),
          }),
        })
      );
    });
  });

  describe('Cache Management', () => {
    it('should clear cache', () => {
      homeMetricsService.clearCache();
      const stats = homeMetricsService.getCacheStats();
      expect(stats.size).toBe(0);
    });

    it('should return cache statistics', () => {
      homeMetricsService.clearCache();
      homeMetricsService['cache'].set('key1', {
        data: {} as any,
        timestamp: Date.now(),
      });
      const stats = homeMetricsService.getCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toEqual(['key1']);
    });
  });
});
