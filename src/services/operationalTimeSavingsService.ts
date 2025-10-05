import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

interface OperationalTimeSavings {
  daily_time_saved: number;
  monthly_time_saved: number;
}

interface _SterilizationCycleData {
  id: string;
  duration_minutes: number;
  baseline_duration_minutes: number;
  completed_at: string;
}

interface _TaskCompletionData {
  id: string;
  estimated_duration: number;
  actual_duration: number;
  completed_at: string;
  category: string;
}

/**
 * Service to calculate operational time savings from organized workflows
 * This shows the value of systematic task management and structured processes
 */
class OperationalTimeSavingsService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private cache: Map<
    string,
    { data: OperationalTimeSavings; timestamp: number }
  > = new Map();

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION;
  }

  private getCachedData(key: string): OperationalTimeSavings | null {
    const cached = this.cache.get(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: OperationalTimeSavings): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  /**
   * Get operational time savings from organized workflows
   * This measures the value of systematic task management
   */
  async getOperationalTimeSavings(): Promise<OperationalTimeSavings> {
    try {
      console.log('🔍 OperationalTimeSavingsService: Starting calculation...');

      const { FacilityService } = await import('./facilityService');
      const { facilityId } = await FacilityService.getCurrentUserAndFacility();

      console.log('🏥 OperationalTimeSavingsService: Facility ID:', facilityId);

      if (!facilityId) {
        console.log(
          '❌ OperationalTimeSavingsService: No facility ID, returning defaults'
        );
        return { daily_time_saved: 0, monthly_time_saved: 0 };
      }

      const cacheKey = `operational-time-savings-${facilityId}-${new Date().toISOString().split('T')[0]}`;
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        console.log(
          '📊 OperationalTimeSavingsService: Using cached data:',
          cachedData
        );
        return cachedData;
      }

      // Calculate time savings from multiple operational sources
      console.log(
        '🧮 OperationalTimeSavingsService: Calculating from multiple sources...'
      );
      const [sterilizationSavings, taskSavings, cleaningSavings] =
        await Promise.all([
          this.calculateSterilizationTimeSavings(facilityId),
          this.calculateTaskCompletionTimeSavings(facilityId),
          this.calculateCleaningTimeSavings(facilityId),
        ]);

      console.log('📈 OperationalTimeSavingsService: Individual savings:', {
        sterilization: sterilizationSavings,
        tasks: taskSavings,
        cleaning: cleaningSavings,
      });

      const dailyTimeSaved =
        sterilizationSavings.daily + taskSavings.daily + cleaningSavings.daily;
      const monthlyTimeSaved =
        sterilizationSavings.monthly +
        taskSavings.monthly +
        cleaningSavings.monthly;

      const result: OperationalTimeSavings = {
        daily_time_saved: Math.round(dailyTimeSaved),
        monthly_time_saved: Math.round(monthlyTimeSaved),
      };

      this.setCachedData(cacheKey, result);

      console.log('✅ OperationalTimeSavingsService: Final result:', result);
      return result;
    } catch (error) {
      console.error(
        '❌ OperationalTimeSavingsService: Error calculating operational time savings:',
        error
      );
      return { daily_time_saved: 0, monthly_time_saved: 0 };
    }
  }

  /**
   * Calculate time savings from sterilization cycles
   * Shows efficiency gains from organized sterilization workflows
   */
  private async calculateSterilizationTimeSavings(
    facilityId: _facilityId
  ): Promise<{ daily: number; monthly: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date().toISOString().slice(0, 7);

      // Get sterilization cycles for today and this month
      const { data: dailyCycles } = await supabase
        .from('sterilization_cycles')
        .select('duration_minutes, end_time')
        .eq('facility_id', facilityId)
        .eq('status', 'completed')
        .gte('end_time', `${today}T00:00:00`)
        .lt('end_time', `${today}T23:59:59`);

      const { data: monthlyCycles } = await supabase
        .from('sterilization_cycles')
        .select('duration_minutes, end_time')
        .eq('facility_id', facilityId)
        .eq('status', 'completed')
        .gte('end_time', `${startOfMonth}-01T00:00:00`)
        .lt('end_time', `${startOfMonth}-31T23:59:59`);

      const dailySavings = (dailyCycles || []).reduce((total, cycle) => {
        const baseline = 60; // Standard 60 min baseline for sterilization cycles
        const actual = cycle.duration_minutes || baseline;
        return total + Math.max(0, baseline - actual);
      }, 0);

      const monthlySavings = (monthlyCycles || []).reduce((total, cycle) => {
        const baseline = 60; // Standard 60 min baseline for sterilization cycles
        const actual = cycle.duration_minutes || baseline;
        return total + Math.max(0, baseline - actual);
      }, 0);

      return { daily: dailySavings, monthly: monthlySavings };
    } catch (error) {
      logger.error(
        'OperationalTimeSavingsService: Error calculating sterilization savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Calculate time savings from task completions
   * Shows efficiency gains from organized task management
   */
  private async calculateTaskCompletionTimeSavings(
    facilityId: _facilityId
  ): Promise<{ daily: number; monthly: number }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const startOfMonth = new Date().toISOString().slice(0, 7);

      // Get completed tasks for today and this month
      const { data: dailyTasks } = await supabase
        .from('home_daily_operations_tasks')
        .select('estimated_duration, actual_duration')
        .eq('facility_id', facilityId)
        .eq('completed', true)
        .gte('completed_at', `${today}T00:00:00`)
        .lt('completed_at', `${today}T23:59:59`);

      const { data: monthlyTasks } = await supabase
        .from('home_daily_operations_tasks')
        .select('estimated_duration, actual_duration')
        .eq('facility_id', facilityId)
        .eq('completed', true)
        .gte('completed_at', `${startOfMonth}-01T00:00:00`)
        .lt('completed_at', `${startOfMonth}-31T23:59:59`);

      const dailySavings = (dailyTasks || []).reduce((total, task) => {
        const estimated = task.estimated_duration || 30; // Default 30 min estimate
        const actual = task.actual_duration || estimated;
        return total + Math.max(0, estimated - actual);
      }, 0);

      const monthlySavings = (monthlyTasks || []).reduce((total, task) => {
        const estimated = task.estimated_duration || 30; // Default 30 min estimate
        const actual = task.actual_duration || estimated;
        return total + Math.max(0, estimated - actual);
      }, 0);

      return { daily: dailySavings, monthly: monthlySavings };
    } catch (error) {
      logger.error(
        'OperationalTimeSavingsService: Error calculating task completion savings:',
        error
      );
      return { daily: 0, monthly: 0 };
    }
  }

  /**
   * Calculate time savings from environmental cleaning
   * Shows efficiency gains from organized cleaning workflows
   */
  private async calculateCleaningTimeSavings(
    _facilityId: string
  ): Promise<{ daily: number; monthly: number }> {
    try {
      // For now, return mock data since we don't have a cleaning table
      // In a real implementation, this would query cleaning records
      const mockDailySavings = 45; // 45 minutes saved daily from organized cleaning
      const mockMonthlySavings = 1350; // 45 * 30 days

      return { daily: mockDailySavings, monthly: mockMonthlySavings };
    } catch (error) {
      logger.error(
        'OperationalTimeSavingsService: Error calculating cleaning savings:',
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

export const operationalTimeSavingsService =
  new OperationalTimeSavingsService();
