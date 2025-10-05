import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  ClinicalStaffingForecast,
} from '../forecastingAnalyticsTypes';
import {
  CLINICAL_STAFFING_CONFIG,
  TIMELINE_CONFIG,
} from '../forecastingAnalyticsConfig';

export class ClinicalStaffingForecastService {
  private static instance: ClinicalStaffingForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): ClinicalStaffingForecastService {
    if (!ClinicalStaffingForecastService.instance) {
      ClinicalStaffingForecastService.instance =
        new ClinicalStaffingForecastService();
    }
    return ClinicalStaffingForecastService.instance;
  }

  /**
   * 👩‍⚕️ Clinical Staffing Forecast
   * Missed cleanings, time-to-task trends, tool backlog after hours
   */
  async getClinicalStaffingForecast(
    filters: AnalyticsFilters = {}
  ): Promise<ClinicalStaffingForecast[]> {
    try {
      const cacheKey = `clinical_staffing_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<ClinicalStaffingForecast[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for clinical staffing forecast');
        return [];
      }

      // Get sterilization data for staffing analysis
      const { data: sterilizationData, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('facility_id', filters.facilityId as string)
          .gte(
            'created_at',
            new Date(
              Date.now() -
                CLINICAL_STAFFING_CONFIG.ANALYSIS_DAYS * 24 * 60 * 60 * 1000
            ).toISOString()
          )
          .order('created_at', { ascending: false });

      if (
        sterilizationError ||
        !sterilizationData ||
        sterilizationData.length === 0
      ) {
        console.warn(
          'No sterilization data found for clinical staffing forecast'
        );
        return [];
      }

      // Analyze workload patterns
      const totalCycles = sterilizationData.length;
      const incompleteCycles = (
        sterilizationData as _SterilizationCycleRow[]
      ).filter(
        (cycle: _SterilizationCycleRow) =>
          cycle.status !== 'completed' && cycle.status !== 'failed'
      ).length;

      const currentFTE = CLINICAL_STAFFING_CONFIG.DEFAULT_FTE; // This should come from actual staffing data
      const workloadIncrease = Math.max(
        0,
        (incompleteCycles / totalCycles) * 100
      );
      const recommendedFTE =
        workloadIncrease > CLINICAL_STAFFING_CONFIG.WORKLOAD_INCREASE_THRESHOLD
          ? currentFTE + CLINICAL_STAFFING_CONFIG.FTE_INCREASE
          : currentFTE;

      const forecasts: ClinicalStaffingForecast[] = [
        {
          currentFTE,
          recommendedFTE,
          timeline:
            workloadIncrease >
            CLINICAL_STAFFING_CONFIG.WORKLOAD_INCREASE_THRESHOLD
              ? TIMELINE_CONFIG.NEXT_QUARTER
              : TIMELINE_CONFIG.MONITOR_3_MONTHS,
          workloadIncrease,
          skillsetGaps: [], // This should come from training/competency data
          trainingRecommendations: [], // This should come from training gap analysis
          estimatedCost: Math.round(
            (recommendedFTE - currentFTE) *
              CLINICAL_STAFFING_CONFIG.COST_PER_FTE
          ), // Rough estimate
        },
      ];

      this.setCachedData(cacheKey, forecasts);
      return forecasts;
    } catch (error) {
      console.error('Error forecasting clinical staffing:', error);
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

export default ClinicalStaffingForecastService;
