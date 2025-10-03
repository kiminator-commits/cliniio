import { supabase } from '../../lib/supabaseClient';
import {
  getTimeSavingsAggregates,
  getCostSavingsAggregates,
  getTeamPerformanceAggregates,
} from '../aiTaskPerformanceService';

export interface HomePerformanceMetrics {
  timeSaved: {
    daily: number;
    monthly: number;
  };
  costSavings: {
    monthly: number;
    annual: number;
  };
  aiEfficiency: {
    timeSavings: number;
    proactiveMgmt: number;
  };
  teamPerformance: {
    skills: number;
    inventory: number;
    sterilization: number;
  };
  gamificationStats: {
    totalTasks: number;
    completedTasks: number;
    perfectDays: number;
    currentStreak: number;
    bestStreak: number;
  };
}

interface PerformanceMetric {
  metric_type: string;
  daily_time_saved?: number;
  monthly_time_saved?: number;
  monthly_cost_savings?: number;
  annual_cost_savings?: number;
  [key: string]: unknown;
}

interface GamificationStat {
  total_tasks?: number;
  completed_tasks?: number;
  current_streak?: number;
  best_streak?: number;
  [key: string]: unknown;
}

/**
 * Lightweight service for home page performance metrics
 * Only contains essential functionality to avoid bundle bloat
 */
class HomeMetricsService {
  private cache: Map<
    string,
    { data: HomePerformanceMetrics; timestamp: number }
  > = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_TTL;
  }

  private getCachedData(key: string): HomePerformanceMetrics | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: HomePerformanceMetrics): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Clear the cache (useful for testing or when data changes)
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics for debugging
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
  /**
   * Get current performance metrics for the home dashboard
   * Optimized for minimal bundle size and fast loading with caching
   */
  async getHomeMetrics(): Promise<HomePerformanceMetrics> {
    try {
      // Create cache key based on current date (changes daily)
      const today = new Date().toISOString().split('T')[0];
      const cacheKey = `home-metrics-${today}`;

      // Check cache first
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Get user's facility ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { data: userProfile } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      const facilityId =
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000';

      // const startOfMonth = new Date().toISOString().slice(0, 7); // Removed unused variable

      // Fetch metrics in parallel for better performance
      const [
        timeSavingsData,
        costSavingsData,
        teamPerformanceData,
        dailyMetrics,
        gamificationStats,
      ] = await Promise.all([
        getTimeSavingsAggregates(),
        getCostSavingsAggregates(),
        getTeamPerformanceAggregates(),
        this.getDailyMetrics(today, facilityId),
        this.getGamificationStats(today, facilityId),
      ]);

      const result = {
        timeSaved: {
          daily: timeSavingsData.daily_time_saved,
          monthly: timeSavingsData.monthly_time_saved,
        },
        costSavings: {
          monthly: costSavingsData.monthly_cost_savings,
          annual: costSavingsData.annual_cost_savings,
        },
        aiEfficiency: {
          timeSavings: this.extractAIEfficiency(dailyMetrics, 'time_savings'),
          proactiveMgmt: this.extractAIEfficiency(
            dailyMetrics,
            'proactive_mgmt'
          ),
        },
        teamPerformance: {
          skills: teamPerformanceData.skills,
          inventory: teamPerformanceData.inventory,
          sterilization: teamPerformanceData.sterilization,
        },
        gamificationStats: {
          totalTasks: this.calculateTotalTasks(gamificationStats),
          completedTasks: this.calculateCompletedTasks(gamificationStats),
          perfectDays: this.calculatePerfectDays(gamificationStats),
          currentStreak: this.calculateCurrentStreak(gamificationStats),
          bestStreak: this.calculateBestStreak(gamificationStats),
        },
      };

      // Cache the result
      this.setCachedData(cacheKey, result);
      return result;
    } catch (error) {
      console.warn('Failed to fetch home metrics, using defaults:', error);
      return this.getDefaultMetrics();
    }
  }

  private async getDailyMetrics(
    date: string,
    facilityId: string
  ): Promise<PerformanceMetric[]> {
    const { data } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('date', date)
      .eq('facility_id', facilityId);
    return (data || []) as PerformanceMetric[];
  }

  private async getMonthlyMetrics(
    month: string,
    facilityId: string
  ): Promise<PerformanceMetric[]> {
    const { data } = await supabase
      .from('performance_metrics')
      .select('*')
      .like('month', month)
      .eq('facility_id', facilityId);
    return (data || []) as PerformanceMetric[];
  }

  private async getGamificationStats(date: string, facilityId: string) {
    // Use a simple query with facility filtering for home page
    const { data } = await supabase
      .from('user_gamification_stats')
      .select('*')
      .eq('date', date)
      .eq('facility_id', facilityId)
      .limit(10); // Limit results for performance
    return data || [];
  }

  private extractTimeSaved(
    metrics: PerformanceMetric[],
    type: 'daily' | 'monthly'
  ): number {
    const metric = metrics.find((m) => m.metric_type === 'time_saved');
    return type === 'daily'
      ? (metric?.daily_time_saved as number) || 0
      : (metric?.monthly_time_saved as number) || 0;
  }

  private extractCostSavings(
    metrics: PerformanceMetric[],
    type: 'monthly' | 'annual'
  ): number {
    const metric = metrics.find((m) => m.metric_type === 'cost_savings');
    return type === 'monthly'
      ? (metric?.monthly_cost_savings as number) || 0
      : (metric?.annual_cost_savings as number) || 0;
  }

  private extractAIEfficiency(
    metrics: PerformanceMetric[],
    field: string
  ): number {
    const metric = metrics.find((m) => m.metric_type === 'ai_efficiency');
    return (metric?.[field] as number) || 0;
  }

  private extractTeamPerformance(
    metrics: PerformanceMetric[],
    field: string
  ): number {
    const metric = metrics.find((m) => m.metric_type === 'team_performance');
    return (metric?.[field] as number) || 0;
  }

  private calculateTotalTasks(stats: GamificationStat[]): number {
    return stats.reduce(
      (sum, stat) => sum + ((stat.total_tasks as number) || 0),
      0
    );
  }

  private calculateCompletedTasks(stats: GamificationStat[]): number {
    return stats.reduce(
      (sum, stat) => sum + ((stat.completed_tasks as number) || 0),
      0
    );
  }

  private calculatePerfectDays(stats: GamificationStat[]): number {
    return stats.filter(
      (stat) =>
        ((stat.completed_tasks as number) || 0) ===
        ((stat.total_tasks as number) || 0)
    ).length;
  }

  private calculateCurrentStreak(stats: GamificationStat[]): number {
    return stats.reduce(
      (max, stat) => Math.max(max, (stat.current_streak as number) || 0),
      0
    );
  }

  private calculateBestStreak(stats: GamificationStat[]): number {
    return stats.reduce(
      (max, stat) => Math.max(max, (stat.best_streak as number) || 0),
      0
    );
  }

  private getDefaultMetrics(): HomePerformanceMetrics {
    return {
      timeSaved: { daily: 0, monthly: 0 },
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
    };
  }
}

export const homeMetricsService = new HomeMetricsService();
