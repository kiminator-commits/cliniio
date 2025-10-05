import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  AdminStaffingForecast,
} from '../forecastingAnalyticsTypes';
import {
  ADMIN_STAFFING_CONFIG,
  PRIORITY_CONFIG,
} from '../forecastingAnalyticsConfig';

export class AdminStaffingForecastService {
  private static instance: AdminStaffingForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): AdminStaffingForecastService {
    if (!AdminStaffingForecastService.instance) {
      AdminStaffingForecastService.instance =
        new AdminStaffingForecastService();
    }
    return AdminStaffingForecastService.instance;
  }

  /**
   * 📊 Admin Staffing Forecast
   * Audit log volume, expired tasks, user onboarding errors
   */
  async getAdminStaffingForecast(
    filters: AnalyticsFilters = {}
  ): Promise<AdminStaffingForecast[]> {
    try {
      const cacheKey = `admin_staffing_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<AdminStaffingForecast[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for admin staffing forecast');
        return [];
      }

      // Get sterilization data for admin workload analysis
      const { data: sterilizationData, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('facility_id', filters.facilityId as string)
          .gte(
            'created_at',
            new Date(
              Date.now() -
                ADMIN_STAFFING_CONFIG.ANALYSIS_DAYS * 24 * 60 * 60 * 1000
            ).toISOString()
          )
          .order('created_at', { ascending: false });

      if (
        sterilizationError ||
        !sterilizationData ||
        sterilizationData.length === 0
      ) {
        console.warn('No sterilization data found for admin staffing forecast');
        return [];
      }

      // Calculate workload metrics based on actual data
      const totalCycles = sterilizationData.length;
      const incompleteCycles = (
        sterilizationData as _SterilizationCycleRow[]
      ).filter(
        (cycle: _SterilizationCycleRow) =>
          cycle.status !== 'completed' && cycle.status !== 'failed'
      ).length;

      const currentWorkload = totalCycles;
      const projectedWorkload = Math.round(
        totalCycles * ADMIN_STAFFING_CONFIG.GROWTH_RATE
      ); // 10% growth projection
      const workloadExcess = Math.max(0, projectedWorkload - currentWorkload);
      const qualityIncidents = Math.floor(
        incompleteCycles * ADMIN_STAFFING_CONFIG.INCIDENT_RATE
      ); // Estimate based on incomplete cycles
      const resolutionLag =
        incompleteCycles > 0
          ? Math.max(1, Math.floor(incompleteCycles / 2))
          : 0;

      let priority: 'low' | 'medium' | 'high';
      if (workloadExcess > ADMIN_STAFFING_CONFIG.HIGH_WORKLOAD_THRESHOLD)
        priority = PRIORITY_CONFIG.HIGH;
      else if (workloadExcess > ADMIN_STAFFING_CONFIG.MEDIUM_WORKLOAD_THRESHOLD)
        priority = PRIORITY_CONFIG.MEDIUM;
      else priority = PRIORITY_CONFIG.LOW;

      const forecasts: AdminStaffingForecast[] = [
        {
          currentWorkload,
          projectedWorkload,
          workloadExcess,
          recommendedCoverage:
            workloadExcess > ADMIN_STAFFING_CONFIG.HIGH_COVERAGE_THRESHOLD
              ? 'Additional 0.5 FTE admin support'
              : 'Current staffing adequate',
          qualityIncidents,
          resolutionLag,
          priority,
        },
      ];

      this.setCachedData(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error forecasting admin staffing:', error);
      return [];
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export default AdminStaffingForecastService;
