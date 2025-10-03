import { supabase } from '../../../lib/supabaseClient';
import { InventoryAnalyticsService } from './analytics';
import { InventoryForecastingService } from './forecasting';
import { InventoryAIProviderService } from './provider';
import { InventoryActionService } from '../../../pages/Inventory/services/inventoryActionService';
import type { DemandForecastingResult } from './types';
import { NINETY_DAYS_MS, ONE_YEAR_MS } from './inventoryAIConfig';

export class ForecastingWorkflowService {
  private facilityId: string;
  private analyticsService: InventoryAnalyticsService;
  private forecastingService: InventoryForecastingService;
  private providerService: InventoryAIProviderService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.analyticsService = new InventoryAnalyticsService(facilityId);
    this.forecastingService = new InventoryForecastingService(facilityId);
    this.providerService = new InventoryAIProviderService(facilityId);
  }

  // Generate demand forecast
  async generateDemandForecast(
    itemId: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<DemandForecastingResult | null> {
    try {
      // Get historical data using analytics service
      const historicalData =
        await this.analyticsService.getHistoricalInventoryData();

      // Generate forecast using forecasting service
      const forecast = await this.forecastingService.generateDemandForecast(
        itemId,
        period,
        historicalData
      );

      // Save to database
      const { data, error } = await supabase
        .from('inventory_ai_demand_forecasting')
        .insert(forecast as Record<string, unknown>)
        .select()
        .single();

      if (error) {
        console.error('Error saving demand forecast:', error);
        return null;
      }

      return data as DemandForecastingResult | null;
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      return null;
    }
  }

  // Get predictive analytics for inventory
  async getPredictiveAnalytics(): Promise<{
    demandForecast: Array<{
      itemId: string;
      itemName: string;
      predictedDemand: number;
      confidence: number;
      timeframe: string;
      factors: string[];
    }>;
    stockoutRisk: Array<{
      itemId: string;
      itemName: string;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
      probability: number;
      estimatedStockoutDate: string;
      recommendedAction: string;
    }>;
    maintenancePredictions: Array<{
      equipmentId: string;
      equipmentName: string;
      predictedIssue: string;
      estimatedFailureDate: string;
      confidence: number;
      recommendedMaintenance: string;
    }>;
    costTrends: Array<{
      category: string;
      currentCost: number;
      predictedCost: number;
      trend: 'increasing' | 'decreasing' | 'stable';
      confidence: number;
      factors: string[];
    }>;
    seasonalPatterns: Array<{
      category: string;
      pattern: string;
      peakSeason: string;
      lowSeason: string;
      confidence: number;
      recommendations: string[];
    }>;
  }> {
    try {
      const startTime = Date.now();

      // Get historical inventory data using centralized service
      const { data: allTransactions, error: transactionsError } =
        await InventoryActionService.getInventoryTransactionsByFacility(
          this.facilityId
        );

      if (transactionsError) {
        console.error(
          'Error getting inventory transactions:',
          transactionsError
        );
        return {
          demandForecast: [],
          stockoutRisk: [],
          maintenancePredictions: [],
          costTrends: [],
          seasonalPatterns: [],
        };
      }

      // Apply date filter manually
      const ninetyDaysAgo = new Date(Date.now() - NINETY_DAYS_MS);
      const inventoryHistory = (allTransactions || []).filter(
        (transaction: { created_at?: string; [key: string]: unknown }) =>
          transaction.created_at &&
          new Date(transaction.created_at as string) >= ninetyDaysAgo
      );

      // Sort by created_at descending
      inventoryHistory.sort(
        (
          a: { created_at?: string; [key: string]: unknown },
          b: { created_at?: string; [key: string]: unknown }
        ) =>
          new Date((b.created_at as string) || '').getTime() -
          new Date((a.created_at as string) || '').getTime()
      );

      // Get equipment maintenance history using centralized service
      const { data: allMaintenance, error: maintenanceError } =
        await InventoryActionService.getEquipmentMaintenanceByFacility(
          this.facilityId
        );

      if (maintenanceError) {
        console.error('Error getting equipment maintenance:', maintenanceError);
        return {
          demandForecast: [],
          stockoutRisk: [],
          maintenancePredictions: [],
          costTrends: [],
          seasonalPatterns: [],
        };
      }

      // Apply date filter manually
      const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
      const maintenanceHistory = (allMaintenance || []).filter(
        (maintenance: { created_at?: string; [key: string]: unknown }) =>
          maintenance.created_at &&
          new Date(maintenance.created_at as string) >= oneYearAgo
      );

      // Sort by created_at descending
      maintenanceHistory.sort(
        (
          a: { created_at?: string; [key: string]: unknown },
          b: { created_at?: string; [key: string]: unknown }
        ) =>
          new Date((b.created_at as string) || '').getTime() -
          new Date((a.created_at as string) || '').getTime()
      );

      // Get cost history using centralized service
      const { data: allCosts, error: costsError } =
        await InventoryActionService.getInventoryCostsByFacility(
          this.facilityId
        );

      if (costsError) {
        console.error('Error getting inventory costs:', costsError);
        return {
          demandForecast: [],
          stockoutRisk: [],
          maintenancePredictions: [],
          costTrends: [],
          seasonalPatterns: [],
        };
      }

      // Apply date filter manually
      const costHistory = (allCosts || []).filter(
        (cost: { created_at?: string; [key: string]: unknown }) =>
          cost.created_at && new Date(cost.created_at as string) >= oneYearAgo
      );

      // Sort by created_at descending
      costHistory.sort(
        (
          a: { created_at?: string; [key: string]: unknown },
          b: { created_at?: string; [key: string]: unknown }
        ) =>
          new Date((b.created_at as string) || '').getTime() -
          new Date((a.created_at as string) || '').getTime()
      );

      // Process with AI using provider service
      const predictions =
        await this.providerService.processPredictiveAnalyticsWithAI();

      const processingTime = Date.now() - startTime;

      // Save predictive analytics results
      const { error: saveError } = await supabase
        .from('inventory_ai_predictive_analytics')
        .insert({
          facility_id: this.facilityId,
          predictions_data: predictions,
          processing_time_ms: processingTime,
          generated_at: new Date().toISOString(),
        });

      if (saveError) {
        console.error('Error saving predictive analytics:', saveError);
      }

      return predictions;
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      throw error;
    }
  }
}
