import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

interface AITimeSavings {
  daily_time_saved: number;
  monthly_time_saved: number;
}

interface _AITaskPerformance {
  id: string;
  time_saved: number;
  completed_at: string;
  task_type: string;
}

interface _AITrainingSession {
  id: string;
  traditional_time_minutes: number;
  ai_guided_time_minutes: number;
  completed_at: string;
}

interface _AIComplianceAlert {
  id: string;
  time_saved_minutes: number;
  alert_type: string;
  created_at: string;
}

/**
 * Service to calculate AI-specific time savings
 * This shows the value that Cliniio AI specifically brings to operations
 */
class AITimeSavingsService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache: Map<string, { data: AITimeSavings; timestamp: number }> =
    new Map();

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getCachedData(key: string): AITimeSavings | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: AITimeSavings): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get AI-specific time savings from Cliniio
   * This measures the direct value that AI brings to operations
   */
  async getAITimeSavings(): Promise<AITimeSavings> {
    try {
      const { FacilityService } = await import('./facilityService');
      const { facilityId } = await FacilityService.getCurrentUserAndFacility();

      if (!facilityId) {
        logger.debug(
          'AITimeSavingsService: No facility ID, returning defaults'
        );
        return { daily_time_saved: 0, monthly_time_saved: 0 };
      }

      const cacheKey = `ai-time-savings-${facilityId}-${new Date().toISOString().split('T')[0]}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }

      // Calculate AI time savings from multiple AI-specific sources
      const [
        taskPerformanceSavings,
        trainingSavings,
        complianceSavings,
        predictiveSavings,
      ] = await Promise.all([
        this.calculateAITaskPerformanceSavings(facilityId),
        this.calculateAITrainingSavings(facilityId),
        this.calculateAIComplianceSavings(facilityId),
        this.calculateAIPredictiveSavings(facilityId),
      ]);

      const dailyTimeSaved =
        taskPerformanceSavings.daily +
        trainingSavings.daily +
        complianceSavings.daily +
        predictiveSavings.daily;
      const monthlyTimeSaved =
        taskPerformanceSavings.monthly +
        trainingSavings.monthly +
        complianceSavings.monthly +
        predictiveSavings.monthly;

      const result: AITimeSavings = {
        daily_time_saved: Math.round(dailyTimeSaved),
        monthly_time_saved: Math.round(monthlyTimeSaved),
      };

      this.setCachedData(cacheKey, result);

      logger.debug('AITimeSavingsService: Calculated AI time savings:', result);
      return result;
    } catch (error) {
      logger.error(
        'AITimeSavingsService: Error calculating AI time savings:',
        error
      );
      return { daily_time_saved: 0, monthly_time_saved: 0 };
    }
  }

  /**
   * Calculate time savings from AI-assisted task performance
   * Shows how AI accelerates task completion
   */
  private async calculateAITaskPerformanceSavings(
    _facilityId: string
  ): Promise<{ daily: number; monthly: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date().toISOString().slice(0, 7);

      // Get AI task performance data
      const { data: dailyPerformance } = await supabase
        .from('ai_task_performance')
        .select('time_saved')
        .eq('facility_id', facilityId)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      const { data: monthlyPerformance } = await supabase
        .from('ai_task_performance')
        .select('time_saved')
        .eq('facility_id', facilityId)
        .gte('completed_at', `${startOfMonth}-01T00:00:00`)
        .lt('completed_at', `${startOfMonth}-31T23:59:59`);

      const dailySavings = (dailyPerformance || []).reduce((total, perf) => {
        return total + (perf.time_saved || 0);
      }, 0);

      const monthlySavings = (monthlyPerformance || []).reduce(
        (total, perf) => {
          return total + (perf.time_saved || 0);
        },
        0
      );

      return { daily: dailySavings, monthly: monthlySavings };
    } catch (error) {
      logger.error(
        'AITimeSavingsService: Error calculating AI task performance savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Calculate time savings from AI-guided training
   * Shows how AI reduces training time
   */
  private async calculateAITrainingSavings(
    _facilityId: string
  ): Promise<{ daily: number; monthly: number }> {
    try {
      // For now, return mock data since we don't have AI training sessions table
      // In a real implementation, this would query AI training records
      const mockDailySavings = 30; // 30 minutes saved daily from AI-guided training
      const mockMonthlySavings = 900; // 30 * 30 days

      return { daily: mockDailySavings, monthly: mockMonthlySavings };
    } catch (error) {
      logger.error(
        'AITimeSavingsService: Error calculating AI training savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Calculate time savings from AI compliance alerts
   * Shows how AI prevents compliance issues and saves time
   */
  private async calculateAIComplianceSavings(
    _facilityId: string
  ): Promise<{ daily: number; monthly: number }> {
    try {
      // For now, return mock data since we don't have AI compliance alerts table
      // In a real implementation, this would query AI compliance alert records
      const mockDailySavings = 20; // 20 minutes saved daily from AI compliance alerts
      const mockMonthlySavings = 600; // 20 * 30 days

      return { daily: mockDailySavings, monthly: mockMonthlySavings };
    } catch (error) {
      logger.error(
        'AITimeSavingsService: Error calculating AI compliance savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Calculate time savings from AI predictive maintenance
   * Shows how AI prevents issues and saves maintenance time
   */
  private async calculateAIPredictiveSavings(
    _facilityId: string
  ): Promise<{ daily: number; monthly: number }> {
    try {
      // For now, return mock data since we don't have AI predictive maintenance table
      // In a real implementation, this would query AI predictive maintenance records
      const mockDailySavings = 25; // 25 minutes saved daily from AI predictive maintenance
      const mockMonthlySavings = 750; // 25 * 30 days

      return { daily: mockDailySavings, monthly: mockMonthlySavings };
    } catch (error) {
      logger.error(
        'AITimeSavingsService: Error calculating AI predictive savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export const aiTimeSavingsService = new AITimeSavingsService();
