import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  AutoclaveCapacityForecast,
} from '../forecastingAnalyticsTypes';
import {
  AUTOCLAVE_CAPACITY_CONFIG,
  RECOMMENDED_ACTION_CONFIG,
  TIMELINE_CONFIG,
} from '../forecastingAnalyticsConfig';

export class AutoclaveCapacityForecastService {
  private static instance: AutoclaveCapacityForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): AutoclaveCapacityForecastService {
    if (!AutoclaveCapacityForecastService.instance) {
      AutoclaveCapacityForecastService.instance =
        new AutoclaveCapacityForecastService();
    }
    return AutoclaveCapacityForecastService.instance;
  }

  /**
   * ⏰ Autoclave Capacity Planning
   * Queue length trends, peak hours, overload predictions
   */
  async getAutoclaveCapacityForecast(
    filters: AnalyticsFilters = {}
  ): Promise<AutoclaveCapacityForecast[]> {
    try {
      const cacheKey = `autoclave_capacity_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<AutoclaveCapacityForecast[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for autoclave capacity forecast');
        return [];
      }

      // Get autoclave data from sterilization cycles
      const { data: autoclaveData, error: autoclaveError } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('facility_id', filters.facilityId as string)
        .not('autoclave_id', 'is', null)
        .gte(
          'created_at',
          new Date(
            Date.now() -
              AUTOCLAVE_CAPACITY_CONFIG.ANALYSIS_DAYS * 24 * 60 * 60 * 1000
          ).toISOString()
        )
        .order('created_at', { ascending: false });

      if (autoclaveError || !autoclaveData || autoclaveData.length === 0) {
        console.warn('No autoclave data found for capacity forecast');
        return [];
      }

      // Get recent cycles for queue analysis
      const { data: recentCycles, error: recentError } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('facility_id', filters.facilityId as string)
        .gte(
          'created_at',
          new Date(
            Date.now() -
              AUTOCLAVE_CAPACITY_CONFIG.RECENT_ANALYSIS_DAYS *
                24 *
                60 *
                60 *
                1000
          ).toISOString()
        )
        .order('created_at', { ascending: false });

      if (recentError) {
        console.warn(
          'Failed to fetch recent cycles for autoclave capacity forecast'
        );
        return [];
      }

      // Group by autoclave and analyze capacity
      const autoclaveGroups = (
        autoclaveData as _SterilizationCycleRow[]
      ).reduce(
        (
          acc: Record<string, _SterilizationCycleRow[]>,
          cycle: _SterilizationCycleRow
        ) => {
          const autoclaveId = cycle.autoclave_id ?? '';
          if (!autoclaveId) return acc;
          if (!acc[autoclaveId]) {
            acc[autoclaveId] = [];
          }
          acc[autoclaveId].push(cycle);
          return acc;
        },
        {} as Record<string, _SterilizationCycleRow[]>
      );

      const forecasts: AutoclaveCapacityForecast[] = Object.entries(
        autoclaveGroups
      ).map(([autoclaveId, cycles]) => {
        const totalCycles = cycles.length;
        const completedCycles = (cycles as _SterilizationCycleRow[]).filter(
          (cycle: _SterilizationCycleRow) => cycle.status === 'completed'
        ).length;
        const failedCycles = (cycles as _SterilizationCycleRow[]).filter(
          (cycle: _SterilizationCycleRow) => cycle.status === 'failed'
        ).length;

        // Calculate real load percentage based on actual cycle data
        const avgCyclesPerDay =
          totalCycles / AUTOCLAVE_CAPACITY_CONFIG.ANALYSIS_DAYS;
        const maxCapacityPerDay =
          AUTOCLAVE_CAPACITY_CONFIG.MAX_CAPACITY_PER_DAY;
        const currentLoadPercentage = Math.min(
          AUTOCLAVE_CAPACITY_CONFIG.MAX_LOAD_PERCENTAGE,
          Math.max(
            AUTOCLAVE_CAPACITY_CONFIG.MIN_LOAD_PERCENTAGE,
            Math.round((avgCyclesPerDay / maxCapacityPerDay) * 100)
          )
        );

        // Calculate queue length from recent cycles (last 7 days)
        const recentCyclesForQueue =
          (recentCycles as _SterilizationCycleRow[])?.filter(
            (cycle: _SterilizationCycleRow) =>
              (cycle.autoclave_id === autoclaveId &&
                cycle.status === 'pending') ||
              cycle.status === 'running'
          ) || [];
        const queueLength = recentCyclesForQueue.length;

        // Calculate overload prediction based on actual usage trends
        const usageTrend =
          avgCyclesPerDay > AUTOCLAVE_CAPACITY_CONFIG.HIGH_USAGE_THRESHOLD
            ? 'high'
            : avgCyclesPerDay > AUTOCLAVE_CAPACITY_CONFIG.MEDIUM_USAGE_THRESHOLD
              ? 'medium'
              : 'low';
        const daysUntilOverload =
          usageTrend === 'high'
            ? AUTOCLAVE_CAPACITY_CONFIG.HIGH_OVERLOAD_DAYS
            : usageTrend === 'medium'
              ? AUTOCLAVE_CAPACITY_CONFIG.MEDIUM_OVERLOAD_DAYS
              : AUTOCLAVE_CAPACITY_CONFIG.LOW_OVERLOAD_DAYS;
        const predictedOverloadDate = new Date(
          Date.now() + daysUntilOverload * 24 * 60 * 60 * 1000
        )
          .toISOString()
          .split('T')[0];

        // Determine recommended action based on actual metrics
        let recommendedAction:
          | 'add_autoclave'
          | 'extend_hours'
          | 'optimize_schedule';
        let timeline: string;

        if (
          currentLoadPercentage >
            AUTOCLAVE_CAPACITY_CONFIG.HIGH_LOAD_THRESHOLD ||
          failedCycles >
            totalCycles * AUTOCLAVE_CAPACITY_CONFIG.HIGH_FAILURE_RATE
        ) {
          recommendedAction = RECOMMENDED_ACTION_CONFIG.ADD_AUTOCLAVE;
          timeline = TIMELINE_CONFIG.IMMEDIATE;
        } else if (
          currentLoadPercentage >
            AUTOCLAVE_CAPACITY_CONFIG.MEDIUM_LOAD_THRESHOLD ||
          queueLength > AUTOCLAVE_CAPACITY_CONFIG.HIGH_QUEUE_THRESHOLD
        ) {
          recommendedAction = RECOMMENDED_ACTION_CONFIG.EXTEND_HOURS;
          timeline = TIMELINE_CONFIG.Q1_2025;
        } else if (
          currentLoadPercentage > AUTOCLAVE_CAPACITY_CONFIG.LOW_LOAD_THRESHOLD
        ) {
          recommendedAction = RECOMMENDED_ACTION_CONFIG.OPTIMIZE_SCHEDULE;
          timeline = TIMELINE_CONFIG.Q2_2025;
        } else {
          recommendedAction = RECOMMENDED_ACTION_CONFIG.OPTIMIZE_SCHEDULE;
          timeline = TIMELINE_CONFIG.Q3_2025;
        }

        return {
          autoclaveId,
          currentLoadPercentage,
          queueLength,
          predictedOverloadDate,
          recommendedAction,
          timeline,
          projectedPatientLoad: Math.round(
            completedCycles * AUTOCLAVE_CAPACITY_CONFIG.PATIENT_LOAD_MULTIPLIER
          ), // Based on actual completed cycles
        };
      });

      this.setCachedData(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error forecasting autoclave capacity:', error);
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

export default AutoclaveCapacityForecastService;
