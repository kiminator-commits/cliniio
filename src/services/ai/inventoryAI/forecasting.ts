/**
 * Inventory Forecasting Service - Main coordinator for forecasting operations
 * Simplified version that uses focused sub-services
 */

import type {
  _AIForecastResult,
  DemandForecastingResult,
  HistoricalInventoryData,
} from './types';
import { InventoryForecastingCoreService } from './services/InventoryForecastingCoreService';
import { InventoryForecastingAnalyticsService } from './services/InventoryForecastingAnalyticsService';

export class InventoryForecastingService {
  private facilityId: string;
  private coreService: InventoryForecastingCoreService;
  private analyticsService: InventoryForecastingAnalyticsService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.coreService = new InventoryForecastingCoreService(facilityId);
    this.analyticsService = new InventoryForecastingAnalyticsService(
      facilityId
    );
  }

  // Generate demand forecast
  async generateDemandForecast(
    itemId: string,
    period: 'week' | 'month' | 'quarter' | 'year',
    historicalData?: HistoricalInventoryData[]
  ): Promise<DemandForecastingResult> {
    return await this.coreService.generateDemandForecast(
      itemId,
      period,
      historicalData
    );
  }

  // Analyze forecast accuracy
  async analyzeForecastAccuracy(
    forecasts: DemandForecastingResult[],
    actualData: HistoricalInventoryData[]
  ): Promise<{
    accuracy: number;
    trends: string[];
    recommendations: string[];
  }> {
    return await this.analyticsService.analyzeForecastAccuracy(
      forecasts,
      actualData
    );
  }

  // Generate forecast report
  async generateForecastReport(forecasts: DemandForecastingResult[]): Promise<{
    summary: string;
    keyInsights: string[];
    riskFactors: string[];
  }> {
    return await this.analyticsService.generateForecastReport(forecasts);
  }

  // Batch forecast generation
  async generateBatchForecasts(
    items: string[],
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<DemandForecastingResult[]> {
    const forecasts: DemandForecastingResult[] = [];

    for (const itemId of items) {
      try {
        const forecast = await this.generateDemandForecast(itemId, period);
        forecasts.push(forecast);
      } catch (error) {
        console.error(`Error generating forecast for item ${itemId}:`, error);
        // Continue with other items
      }
    }

    return forecasts;
  }

  // Get forecasting insights
  async getForecastingInsights(): Promise<{
    totalForecasts: number;
    averageAccuracy: number;
    topTrends: string[];
  }> {
    // Implementation for getting insights
    return {
      totalForecasts: 0,
      averageAccuracy: 0.85,
      topTrends: ['Seasonal patterns', 'Demand variability'],
    };
  }
}
