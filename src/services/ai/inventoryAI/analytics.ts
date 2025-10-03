import { supabase } from '../../../lib/supabaseClient';
import type {
  AIInventoryInsight,
  HistoricalInventoryData,
  InventoryCostData,
} from './types';

export class InventoryAnalyticsService {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Get AI insights for inventory
  async getInventoryInsights(): Promise<AIInventoryInsight[]> {
    try {
      const insights: AIInventoryInsight[] = [];

      // Get recent barcode analysis
      const { data: barcodeData } = await supabase
        .from('inventory_ai_barcode_analysis')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (barcodeData) {
        barcodeData.forEach((item) => {
          insights.push({
            type: 'barcode_analysis',
            title: 'Barcode Quality Assessment',
            description: `Barcode ${item.barcode_value as string} analyzed with ${((item.confidence_score as number) * 100).toFixed(1)}% confidence`,
            confidence: (item.confidence_score as number) || 0,
            recommendations: (item.recommendations as string[]) || [],
            data: item,
            timestamp: item.created_at as string,
            priority:
              (item.confidence_score as number) < 0.7
                ? 'critical'
                : (item.confidence_score as number) < 0.85
                  ? 'high'
                  : 'medium',
            id: (item.id as string) || `barcode-${Date.now()}`,
            actionable: true,
          });
        });
      }

      // Get recent demand forecasts
      const { data: forecastData } = await supabase
        .from('inventory_ai_demand_forecasting')
        .select('*')
        .eq('facility_id', this.facilityId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (forecastData) {
        forecastData.forEach((item) => {
          insights.push({
            type: 'demand_forecast',
            title: 'Demand Forecast',
            description: `${item.forecast_period as string} forecast: ${item.predicted_demand as number} units predicted`,
            confidence: (item.confidence_score as number) || 0,
            recommendations: (item.recommendations as string[]) || [],
            data: item,
            timestamp: item.created_at as string,
            priority:
              (item.confidence_score as number) < 0.7
                ? 'critical'
                : (item.confidence_score as number) < 0.85
                  ? 'high'
                  : 'medium',
            id: (item.id as string) || `forecast-${Date.now()}`,
            actionable: true,
          });
        });
      }

      return insights;
    } catch (error) {
      console.error('Error getting inventory insights:', error);
      return [];
    }
  }

  // Get historical inventory data for analytics
  async getHistoricalInventoryData(): Promise<HistoricalInventoryData[]> {
    // This would query the actual inventory transactions table
    // For now, return mock data
    return Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      quantity: Math.floor(Math.random() * 20) + 10,
      transaction_type: 'usage',
    }));
  }

  // Get inventory cost data for analytics
  async getInventoryCostData(): Promise<InventoryCostData> {
    // This would query the actual inventory costs
    // For now, return mock data
    return {
      purchasing_costs: 8000,
      storage_costs: 4000,
      transportation_costs: 3000,
      total_cost: 15000,
    };
  }

  // Pure helper functions for analytics calculations
  detectBarcodeType(barcodeValue?: string): string {
    if (!barcodeValue) return 'unknown';
    if (barcodeValue.length === 13) return 'ean13';
    if (barcodeValue.length === 12) return 'upc';
    if (barcodeValue.length === 8) return 'ean8';
    return 'code128';
  }

  assessBarcodeQuality(
    confidence: number
  ): 'excellent' | 'good' | 'fair' | 'poor' {
    if (confidence >= 0.9) return 'excellent';
    if (confidence >= 0.8) return 'good';
    if (confidence >= 0.7) return 'fair';
    return 'poor';
  }

  calculateInventoryTurns(
    annualUsage: number,
    averageInventory: number
  ): number {
    if (averageInventory === 0) return 0;
    return annualUsage / averageInventory;
  }

  calculateStockoutRisk(
    currentStock: number,
    averageDailyUsage: number,
    leadTimeDays: number,
    safetyStock: number
  ): number {
    const daysUntilStockout = (currentStock - safetyStock) / averageDailyUsage;
    if (daysUntilStockout <= 0) return 1.0; // 100% risk
    if (daysUntilStockout <= leadTimeDays) return 0.8; // High risk
    if (daysUntilStockout <= leadTimeDays * 1.5) return 0.5; // Medium risk
    return 0.2; // Low risk
  }

  calculateSafetyStock(
    averageDailyUsage: number,
    leadTimeDays: number,
    serviceLevel: number
  ): number {
    // Simple safety stock calculation based on service level
    const zScore = this.getZScore(serviceLevel);
    return Math.ceil(averageDailyUsage * leadTimeDays * zScore * 0.1);
  }

  calculateReorderPoint(
    averageDailyUsage: number,
    leadTimeDays: number,
    safetyStock: number
  ): number {
    return Math.ceil(averageDailyUsage * leadTimeDays + safetyStock);
  }

  private getZScore(serviceLevel: number): number {
    // Simplified Z-score mapping for common service levels
    const zScoreMap: Record<number, number> = {
      0.8: 0.84,
      0.85: 1.04,
      0.9: 1.28,
      0.95: 1.65,
      0.99: 2.33,
    };
    return zScoreMap[serviceLevel] || 1.28; // Default to 90% service level
  }
}
