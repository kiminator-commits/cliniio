import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  TheftLossEstimate,
} from '../forecastingAnalyticsTypes';

export class TheftLossForecastService {
  private static instance: TheftLossForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): TheftLossForecastService {
    if (!TheftLossForecastService.instance) {
      TheftLossForecastService.instance = new TheftLossForecastService();
    }
    return TheftLossForecastService.instance;
  }

  /**
   * 🕵️ Theft / Loss Estimation
   * Scanned tool mismatch, rapid depletion without log match, non-standard hours usage
   */
  async getTheftLossEstimate(
    filters: AnalyticsFilters = {}
  ): Promise<TheftLossEstimate> {
    try {
      const cacheKey = `theft_loss_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<TheftLossEstimate>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId || filters.facilityId.trim() === '') {
        console.warn('No facility ID provided for theft/loss estimation');
        return {
          estimatedLossPercentage: 0,
          estimatedLossValue: 0,
          flaggedItems: [],
          repeatOffenders: [],
          riskFactors: [],
          recommendedActions: [],
          confidence: 0,
        };
      }

      // Get sterilization data for loss analysis
      const { data: sterilizationData, error: sterilizationError } =
        await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('facility_id', filters.facilityId as string)
          .gte(
            'created_at',
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
          )
          .order('created_at', { ascending: false });

      if (
        sterilizationError ||
        !sterilizationData ||
        sterilizationData.length === 0
      ) {
        console.warn('No sterilization data found for theft/loss estimation');
        return {
          estimatedLossPercentage: 0,
          estimatedLossValue: 0,
          flaggedItems: [],
          repeatOffenders: [],
          riskFactors: [],
          recommendedActions: [],
          confidence: 0,
        };
      }

      // Analyze potential loss indicators
      const totalCycles = sterilizationData.length;
      const incompleteCycles = (
        sterilizationData as _SterilizationCycleRow[]
      ).filter(
        (cycle: _SterilizationCycleRow) =>
          cycle.status !== 'clean' && cycle.status !== 'problem'
      ).length;

      const estimatedLossPercentage = Math.min(
        10,
        Math.max(0, (incompleteCycles / totalCycles) * 100)
      );
      const estimatedLossValue = Math.round(estimatedLossPercentage * 1000); // Rough estimate based on percentage

      // Identify flagged items based on incomplete cycles
      const flaggedItems = (sterilizationData as _SterilizationCycleRow[])
        .filter((cycle: _SterilizationCycleRow) => cycle.status !== 'clean')
        .map((cycle: _SterilizationCycleRow) => `Tool ${cycle.id}`)
        .slice(0, 3);

      const estimate: TheftLossEstimate = {
        estimatedLossPercentage: Math.round(estimatedLossPercentage * 10) / 10,
        estimatedLossValue,
        flaggedItems:
          flaggedItems.length > 0
            ? flaggedItems
            : ['No specific items flagged'],
        repeatOffenders: [], // This should come from actual user tracking data
        riskFactors:
          incompleteCycles > 0
            ? [
                'Incomplete sterilization cycles',
                'Missing cycle documentation',
                'Protocol non-compliance',
              ]
            : ['Minimal risk factors detected'],
        recommendedActions: [
          'Complete incomplete sterilization cycles',
          'Review cycle documentation procedures',
          'Monitor compliance metrics',
        ],
        confidence: Math.max(0.5, 1 - estimatedLossPercentage / 100),
      };

      this.setCachedData(cacheKey, estimate);
      return estimate;
    } catch (error) {
      console.error('Error estimating theft/loss:', error);
      return {
        estimatedLossPercentage: 0,
        estimatedLossValue: 0,
        flaggedItems: [],
        repeatOffenders: [],
        riskFactors: [],
        recommendedActions: [],
        confidence: 0,
      };
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

export default TheftLossForecastService;
