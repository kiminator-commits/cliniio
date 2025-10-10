import { supabase } from '../../../lib/supabaseClient';
import { AnalyticsFilters } from '../analyticsDataService';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import {
  _SterilizationCycleRow,
  ToolTurnoverUtilization,
} from '../forecastingAnalyticsTypes';
import {
  calculatePeakHours,
  getOptimizationRecommendation,
  getBottleneckIndicators,
} from '../forecastingAnalyticsUtils';

export class SterilizationMetricsService {
  private static instance: SterilizationMetricsService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = 300000; // 5 minutes

  private constructor() {}

  static getInstance(): SterilizationMetricsService {
    if (!SterilizationMetricsService.instance) {
      SterilizationMetricsService.instance = new SterilizationMetricsService();
    }
    return SterilizationMetricsService.instance;
  }

  /**
   * 🔄 Tool Turnover & Utilization Analysis
   * Track tool usage frequency, daily cycle counts, and utilization patterns
   */
  async getToolTurnoverUtilization(
    filters: AnalyticsFilters = {}
  ): Promise<ToolTurnoverUtilization[]> {
    try {
      const cacheKey = `tool_turnover_utilization_${JSON.stringify(filters)}`;
      const cached = this.getCachedData<ToolTurnoverUtilization[]>(cacheKey);
      if (cached) return cached;

      if (!filters.facilityId) {
        console.warn('No facility ID provided for tool turnover utilization');
        return [];
      }

      // Get sterilization data for tool utilization analysis
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
        console.warn(
          'No sterilization data found for tool turnover utilization'
        );
        return [];
      }

      // Group by tool batch and analyze utilization
      const toolGroups = (sterilizationData as _SterilizationCycleRow[]).reduce(
        (
          acc: Record<string, _SterilizationCycleRow[]>,
          cycle: _SterilizationCycleRow
        ) => {
          const toolBatchId = cycle.tool_batch_id ?? '';
          if (!toolBatchId) return acc;

          if (!acc[toolBatchId]) {
            acc[toolBatchId] = [];
          }
          acc[toolBatchId].push(cycle);
          return acc;
        },
        {} as Record<string, _SterilizationCycleRow[]>
      );

      const utilization: ToolTurnoverUtilization[] = Object.entries(
        toolGroups
      ).map(([toolBatchId, cycles]) => {
        const dailyCycleCount = cycles.length;
        const weeklyUtilization = Math.min(100, (dailyCycleCount / 7) * 100);
        const averageCyclesPerDay = dailyCycleCount / 7;

        // Calculate peak usage hours based on cycle timestamps
        const peakHours = calculatePeakHours(
          cycles as _SterilizationCycleRow[]
        );
        const utilizationEfficiency = Math.min(
          100,
          Math.max(50, weeklyUtilization)
        );
        const turnoverRate = averageCyclesPerDay;
        const idleTimePercentage = Math.max(0, 100 - utilizationEfficiency);

        return {
          toolBatchId,
          toolName: `Tool ${toolBatchId}`,
          dailyCycleCount,
          weeklyUtilization,
          averageCyclesPerDay,
          peakUsageHours: peakHours,
          utilizationEfficiency,
          turnoverRate,
          idleTimePercentage,
          recommendedOptimization: getOptimizationRecommendation(
            utilizationEfficiency
          ),
          bottleneckIndicators: getBottleneckIndicators(utilizationEfficiency),
          performanceScore: Math.round(utilizationEfficiency),
        };
      });

      this.setCachedData(cacheKey, utilization);
      return utilization;
    } catch (error) {
      console.error('Error analyzing tool turnover utilization:', error);
      return [];
    }
  }

  /**
   * 🔬 Get sterilization metrics for optimization tips
   */
  async getSterilizationMetrics(filters: AnalyticsFilters = {}): Promise<{
    biPassRate: number;
    cycleEfficiency: number;
    qualityScore: number;
  }> {
    try {
      if (!filters.facilityId) {
        return { biPassRate: 0, cycleEfficiency: 0, qualityScore: 0 };
      }

      // Get BI test results for pass rate calculation
      const { data: biResults } = await supabase
        .from('bi_test_results')
        .select('*')
        .eq('facility_id', filters.facilityId as string)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      // Get sterilization cycles for efficiency calculation
      const { data: cycles } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('facility_id', filters.facilityId as string)
        .gte(
          'created_at',
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );

      // Calculate BI pass rate
      let biPassRate = 100;
      if (biResults && biResults.length > 0) {
        const passedTests = Array.isArray(biResults)
          ? biResults.filter(
              (result: { result: string }) => result.result === 'pass'
            ).length
          : 0;
        biPassRate = Math.round((passedTests / biResults.length) * 100);
      }

      // Calculate cycle efficiency
      let cycleEfficiency = 100;
      if (cycles && cycles.length > 0) {
        const completedCycles = (cycles as _SterilizationCycleRow[]).filter(
          (cycle: _SterilizationCycleRow) => cycle.status === 'clean'
        ).length;
        cycleEfficiency = Math.round((completedCycles / cycles.length) * 100);
      }

      // Calculate quality score (average of pass rate and efficiency)
      const qualityScore = Math.round((biPassRate + cycleEfficiency) / 2);

      return { biPassRate, cycleEfficiency, qualityScore };
    } catch (error) {
      console.error('Error getting sterilization metrics:', error);
      return { biPassRate: 0, cycleEfficiency: 0, qualityScore: 0 };
    }
  }

  /**
   * 📦 Get inventory metrics for optimization tips
   */
  async getInventoryMetrics(filters: AnalyticsFilters = {}): Promise<{
    turnoverRate: number;
    stockLevel: number;
    reorderEfficiency: number;
  }> {
    try {
      if (!filters.facilityId) {
        return { turnoverRate: 0, stockLevel: 0, reorderEfficiency: 0 };
      }

      // Get inventory items for turnover calculation using centralized service
      const allItems = await InventoryActionService.getItems();

      // Apply facility filter manually
      let inventoryItems = allItems;
      if (filters.facilityId) {
        inventoryItems = allItems.filter(
          (item) => item.facility_id === filters.facilityId
        );
      }

      // Calculate turnover rate (simplified - items used in last 30 days)
      let turnoverRate = 80; // Default to good rate
      if (inventoryItems && inventoryItems.length > 0) {
        const activeItems = inventoryItems.filter(
          (item) => (item.status ?? '') === 'active'
        ).length;
        const totalItems = inventoryItems.length;
        if (totalItems > 0) {
          // Simulate turnover based on active vs total items
          turnoverRate = Math.round((activeItems / totalItems) * 100);
        }
      }

      // Calculate stock level (percentage of items above reorder point)
      let stockLevel = 100;
      if (inventoryItems && inventoryItems.length > 0) {
        const wellStockedItems = inventoryItems.filter(
          (item) =>
            (item.quantity as number) > ((item.reorder_point as number) ?? 0)
        ).length;
        stockLevel = Math.round(
          (wellStockedItems / inventoryItems.length) * 100
        );
      }

      // Calculate reorder efficiency (simplified)
      const reorderEfficiency = Math.round((turnoverRate + stockLevel) / 2);

      return { turnoverRate, stockLevel, reorderEfficiency };
    } catch (error) {
      console.error('Error getting inventory metrics:', error);
      return { turnoverRate: 0, stockLevel: 0, reorderEfficiency: 0 };
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

export default SterilizationMetricsService;
