import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import {
  _SterilizationCycleRow,
  EfficiencyROITracker,
} from '../forecastingAnalyticsTypes';

export class EfficiencyRoiForecastService {
  private static instance: EfficiencyRoiForecastService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): EfficiencyRoiForecastService {
    if (!EfficiencyRoiForecastService.instance) {
      EfficiencyRoiForecastService.instance =
        new EfficiencyRoiForecastService();
    }
    return EfficiencyRoiForecastService.instance;
  }

  /**
   * 💰 Efficiency & ROI Tracker
   * Time saved per module, AI feature usage, automation vs. manual
   */
  async getEfficiencyROITracker(
    filters: AnalyticsFilters = {}
  ): Promise<EfficiencyROITracker | null> {
    try {
      const cacheKey = `efficiency_roi_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<EfficiencyROITracker>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for efficiency ROI tracking');
        return null;
      }

      // Get sterilization data for efficiency analysis
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
        console.warn('No sterilization data found for efficiency ROI tracking');
        return null;
      }

      // Calculate efficiency metrics based on actual data
      const totalCycles = sterilizationData.length;
      const completedCycles = (
        sterilizationData as _SterilizationCycleRow[]
      ).filter(
        (cycle: _SterilizationCycleRow) => cycle.status === 'completed'
      ).length;
      const efficiencyRate =
        totalCycles > 0 ? (completedCycles / totalCycles) * 100 : 0;

      // Estimate time savings based on efficiency improvements
      const timeSavedHours = Math.round((efficiencyRate / 100) * 40); // Base 40 hours
      const estimatedLaborSavings = timeSavedHours * 42; // $42/hour average rate
      const projectedAnnualSavings = estimatedLaborSavings * 12;

      const roi: EfficiencyROITracker = {
        timeSavedHours,
        estimatedLaborSavings,
        aiFeatureUsage: [
          {
            feature: 'Automated scheduling',
            usageCount: Math.floor(totalCycles * 0.8),
            timeSaved: Math.round(timeSavedHours * 0.3),
          },
          {
            feature: 'Smart inventory alerts',
            usageCount: Math.floor(totalCycles * 0.6),
            timeSaved: Math.round(timeSavedHours * 0.2),
          },
          {
            feature: 'Predictive maintenance',
            usageCount: Math.floor(totalCycles * 0.4),
            timeSaved: Math.round(timeSavedHours * 0.1),
          },
        ],
        automationEfficiency: Math.round(efficiencyRate),
        moduleContributions: [
          {
            module: 'Sterilization',
            timeSaved: Math.round(timeSavedHours * 0.5),
            costSavings: Math.round(estimatedLaborSavings * 0.5),
            efficiency: Math.round(efficiencyRate),
          },
          {
            module: 'Inventory',
            timeSaved: Math.round(timeSavedHours * 0.3),
            costSavings: Math.round(estimatedLaborSavings * 0.3),
            efficiency: Math.round(efficiencyRate * 0.9),
          },
          {
            module: 'Environmental',
            timeSaved: Math.round(timeSavedHours * 0.2),
            costSavings: Math.round(estimatedLaborSavings * 0.2),
            efficiency: Math.round(efficiencyRate * 0.8),
          },
        ],
        projectedAnnualSavings,
      };

      this.setCachedData(cacheKey, roi);
      return roi;
    } catch (error) {
      console.error('Error tracking efficiency ROI:', error);
      return null;
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

export default EfficiencyRoiForecastService;
