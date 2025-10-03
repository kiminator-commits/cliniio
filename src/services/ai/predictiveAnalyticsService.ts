import { InventoryActionService } from '../../pages/Inventory/services/inventoryActionService';

export interface DemandForecast {
  itemId: string;
  itemName: string;
  currentStock: number;
  predictedDemand: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  seasonalFactor: number;
  nextOrderDate: string;
  recommendedOrderQuantity: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface MaintenancePrediction {
  itemId: string;
  itemName: string;
  lastMaintenance: string;
  nextMaintenanceDue: string;
  maintenanceType: 'routine' | 'preventive' | 'urgent';
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  failureRisk: number;
  recommendedActions: string[];
}

export interface CostOptimization {
  itemId: string;
  itemName: string;
  currentCost: number;
  historicalCosts: number[];
  costTrend: 'increasing' | 'decreasing' | 'stable';
  potentialSavings: number;
  supplierRecommendations: string[];
  bulkPurchaseOpportunity: boolean;
  optimalOrderSize: number;
  reorderPoint: number;
}

export interface SeasonalAnalysis {
  itemId: string;
  itemName: string;
  seasonalPattern: 'high' | 'low' | 'moderate';
  peakSeason: string[];
  lowSeason: string[];
  seasonalMultiplier: number;
  recommendations: string[];
}

export interface InventoryOptimization {
  demandForecasts: DemandForecast[];
  maintenancePredictions: MaintenancePrediction[];
  costOptimizations: CostOptimization[];
  seasonalAnalyses: SeasonalAnalysis[];
  overallEfficiency: number;
  recommendations: string[];
  riskAssessment: {
    stockoutRisk: number;
    overstockRisk: number;
    maintenanceRisk: number;
    costRisk: number;
  };
}

import { Database } from '@/types/database.types';
type InventoryItem = Database['public']['Tables']['inventory_items']['Row'];

export class PredictiveAnalyticsService {
  private openaiApiKey: string | null = null;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Generate comprehensive inventory optimization insights
   */
  async generateInventoryOptimization(
    facilityId: string
  ): Promise<InventoryOptimization> {
    try {
      const [
        demandForecasts,
        maintenancePredictions,
        costOptimizations,
        seasonalAnalyses,
      ] = await Promise.all([
        this.generateDemandForecasts(facilityId),
        this.generateMaintenancePredictions(facilityId),
        this.generateCostOptimizations(facilityId),
        this.generateSeasonalAnalyses(facilityId),
      ]);

      const overallEfficiency = this.calculateOverallEfficiency(
        demandForecasts,
        maintenancePredictions,
        costOptimizations
      );

      const recommendations = this.generateOverallRecommendations(
        demandForecasts,
        maintenancePredictions,
        costOptimizations,
        seasonalAnalyses
      );

      const riskAssessment = this.assessOverallRisk(
        demandForecasts,
        maintenancePredictions,
        costOptimizations
      );

      return {
        demandForecasts,
        maintenancePredictions,
        costOptimizations,
        seasonalAnalyses,
        overallEfficiency,
        recommendations,
        riskAssessment,
      };
    } catch (error) {
      console.error('Inventory optimization generation failed:', error);
      throw new Error('Failed to generate inventory optimization');
    }
  }

  /**
   * Generate demand forecasts for inventory items
   */
  async generateDemandForecasts(facilityId: string): Promise<DemandForecast[]> {
    try {
      // Get inventory items with usage history using centralized service
      const allItems = await InventoryActionService.getItems();
      const inventoryData = allItems.filter(
        (item) => item.facility_id === facilityId
      );

      // Get usage transactions (if available) using centralized service
      const { data: transactions, error: transactionsError } =
        await InventoryActionService.getInventoryTransactionsByFacility(
          facilityId
        );

      if (transactionsError || !transactions || transactions.length === 0) {
        // Fallback to basic forecasting without usage data
        return this.generateBasicDemandForecasts(
          this.validateInventoryData(inventoryData)
        );
      }

      return this.generateAdvancedDemandForecasts(
        this.validateInventoryData(inventoryData)
      );
    } catch (error) {
      console.error('Demand forecast generation failed:', error);
      return [];
    }
  }

  /**
   * Generate maintenance predictions
   */
  async generateMaintenancePredictions(
    facilityId: string
  ): Promise<MaintenancePrediction[]> {
    try {
      // Get inventory items using centralized service
      const allItems = await InventoryActionService.getItems();
      const inventoryData = allItems.filter(
        (item) => item.facility_id === facilityId
      );

      return (inventoryData as unknown as InventoryItem[])
        .filter(
          (item) =>
            ((item.data as Record<string, unknown>)
              ?.maintenance_interval as number) ||
            ((item.data as Record<string, unknown>)?.last_maintenance as string)
        )
        .map((item) => this.predictMaintenance(item));
    } catch (error) {
      console.error('Maintenance prediction generation failed:', error);
      return [];
    }
  }

  /**
   * Generate cost optimization insights
   */
  async generateCostOptimizations(
    facilityId: string
  ): Promise<CostOptimization[]> {
    try {
      // Get inventory items using centralized service
      const allItems = await InventoryActionService.getItems();
      const inventoryData = allItems.filter(
        (item) => item.facility_id === facilityId
      );

      return (inventoryData as unknown as InventoryItem[])
        .filter((item) => ((item.unit_cost as number) || 0) > 0)
        .map((item) => this.optimizeCosts(item));
    } catch (error) {
      console.error('Cost optimization generation failed:', error);
      return [];
    }
  }

  /**
   * Generate seasonal analysis
   */
  async generateSeasonalAnalyses(
    facilityId: string
  ): Promise<SeasonalAnalysis[]> {
    try {
      // Get inventory items using centralized service
      const allItems = await InventoryActionService.getItems();
      const inventoryData = allItems.filter(
        (item) => item.facility_id === facilityId
      );

      return (inventoryData as unknown as InventoryItem[]).map((item) =>
        this.analyzeSeasonality(item)
      );
    } catch (error) {
      console.error('Seasonal analysis generation failed:', error);
      return [];
    }
  }

  // Private helper methods
  private validateInventoryData(data: unknown): InventoryItem[] {
    if (Array.isArray(data)) {
      return data.filter(
        (item) => item && typeof item === 'object' && 'id' in item
      ) as InventoryItem[];
    }
    return [];
  }

  private generateBasicDemandForecasts(
    inventoryData: InventoryItem[]
  ): DemandForecast[] {
    return inventoryData.map((item) => {
      const currentStock = (item.quantity as number) || 0;
      const maxQuantity =
        ((item.data as Record<string, unknown>)?.maximum_quantity as number) ||
        100;

      // Basic forecasting based on current stock and limits
      let predictedDemand = Math.floor(maxQuantity * 0.3);
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

      if (currentStock <= 0) {
        riskLevel = 'critical';
        predictedDemand = maxQuantity - currentStock;
      } else if (currentStock <= maxQuantity * 0.3) {
        riskLevel = 'high';
        predictedDemand = Math.floor((maxQuantity - currentStock) * 0.7);
      } else if (currentStock <= maxQuantity * 0.5) {
        riskLevel = 'medium';
        predictedDemand = Math.floor((maxQuantity - currentStock) * 0.5);
      }

      return {
        itemId: item.id as string,
        itemName: item.name as string,
        currentStock,
        predictedDemand,
        confidence: 0.6,
        trend: 'stable',
        seasonalFactor: 1.0,
        nextOrderDate: this.calculateNextOrderDate(currentStock),
        recommendedOrderQuantity: Math.max(0, predictedDemand),
        riskLevel,
      };
    });
  }

  private generateAdvancedDemandForecasts(
    inventoryData: InventoryItem[]
  ): DemandForecast[] {
    // This would implement more sophisticated forecasting using usage patterns
    // For now, return basic forecasts
    return this.generateBasicDemandForecasts(inventoryData);
  }

  private predictMaintenance(item: InventoryItem): MaintenancePrediction {
    const lastMaintenance = (item.data as Record<string, unknown>)
      ?.last_maintenance
      ? new Date(
          (item.data as Record<string, unknown>).last_maintenance as string
        )
      : new Date();
    const maintenanceInterval =
      ((item.data as Record<string, unknown>)
        ?.maintenance_interval as number) || 365; // days

    const nextMaintenance = new Date(
      lastMaintenance.getTime() + maintenanceInterval * 24 * 60 * 60 * 1000
    );
    const daysUntilMaintenance = Math.ceil(
      (nextMaintenance.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
    );

    let priority: 'low' | 'medium' | 'high' | 'critical' = 'low';

    if (daysUntilMaintenance <= 7) {
      priority = 'critical';
    } else if (daysUntilMaintenance <= 30) {
      priority = 'high';
    } else if (daysUntilMaintenance <= 90) {
      priority = 'medium';
    }

    const failureRisk = Math.max(
      0,
      Math.min(1, (90 - daysUntilMaintenance) / 90)
    );

    return {
      itemId: item.id,
      itemName: item.name || '',
      lastMaintenance: lastMaintenance.toISOString(),
      nextMaintenanceDue: nextMaintenance.toISOString(),
      maintenanceType: priority === 'critical' ? 'urgent' : 'preventive',
      estimatedCost:
        ((item.data as Record<string, unknown>)?.maintenance_cost as number) ||
        100,
      priority,
      failureRisk,
      recommendedActions: this.generateMaintenanceActions(priority),
    };
  }

  private optimizeCosts(item: InventoryItem): CostOptimization {
    const currentCost = item.unit_cost || 0;
    const historicalCosts = [
      currentCost * 0.95,
      currentCost,
      currentCost * 1.05,
    ]; // Mock historical data

    const costTrend = this.analyzeCostTrend(historicalCosts);
    const potentialSavings = currentCost * 0.1; // Assume 10% savings potential

    return {
      itemId: item.id,
      itemName: item.name || '',
      currentCost,
      historicalCosts,
      costTrend,
      potentialSavings,
      supplierRecommendations: this.generateSupplierRecommendations(item),
      bulkPurchaseOpportunity:
        (item.quantity || 0) <
        (((item.data as Record<string, unknown>)?.maximum_quantity as number) ||
          100) *
          0.5,
      optimalOrderSize: this.calculateOptimalOrderSize(item),
      reorderPoint:
        ((item.data as Record<string, unknown>)?.minimum_quantity as number) ||
        0,
    };
  }

  private analyzeSeasonality(item: InventoryItem): SeasonalAnalysis {
    // Mock seasonal analysis - in real implementation, this would analyze historical usage patterns
    const seasonalPattern = Math.random() > 0.5 ? 'high' : 'low';
    const peakSeason = ['Spring', 'Summer'];
    const lowSeason = ['Fall', 'Winter'];

    return {
      itemId: item.id,
      itemName: item.name || '',
      seasonalPattern,
      peakSeason,
      lowSeason,
      seasonalMultiplier: seasonalPattern === 'high' ? 1.5 : 0.7,
      recommendations: this.generateSeasonalRecommendations(seasonalPattern),
    };
  }

  private calculateNextOrderDate(currentStock: number): string {
    const daysUntilReorder = Math.max(1, Math.ceil(currentStock / 2));
    const nextOrderDate = new Date(
      Date.now() + daysUntilReorder * 24 * 60 * 60 * 1000
    );
    return nextOrderDate.toISOString();
  }

  private generateMaintenanceActions(priority: string): string[] {
    const actions: string[] = [];

    if (priority === 'critical') {
      actions.push('Schedule maintenance immediately');
      actions.push('Check warranty coverage');
      actions.push('Prepare replacement if needed');
    } else if (priority === 'high') {
      actions.push('Schedule maintenance within 30 days');
      actions.push('Order replacement parts if needed');
    } else {
      actions.push('Schedule routine maintenance');
      actions.push('Update maintenance records');
    }

    return actions;
  }

  private analyzeCostTrend(
    historicalCosts: number[]
  ): 'increasing' | 'decreasing' | 'stable' {
    if (historicalCosts.length < 2) return 'stable';

    const firstCost = historicalCosts[0];
    const lastCost = historicalCosts[historicalCosts.length - 1];
    const change = (lastCost - firstCost) / firstCost;

    if (change > 0.05) return 'increasing';
    if (change < -0.05) return 'decreasing';
    return 'stable';
  }

  private generateSupplierRecommendations(item: InventoryItem): string[] {
    const recommendations: string[] = [];

    if ((item.unit_cost || 0) > 100) {
      recommendations.push('Contact current supplier for better pricing');
      recommendations.push('Research alternative suppliers');
      recommendations.push('Consider bulk purchasing');
    }

    if (
      (item.quantity || 0) <
      (((item.data as Record<string, unknown>)?.maximum_quantity as number) ||
        100) *
        0.3
    ) {
      recommendations.push('Negotiate better terms for larger orders');
    }

    return recommendations;
  }

  private calculateOptimalOrderSize(item: InventoryItem): number {
    const maxQuantity =
      ((item.data as Record<string, unknown>)?.maximum_quantity as number) ||
      100;
    const currentQuantity = item.quantity || 0;

    return Math.max(0, Math.floor((maxQuantity - currentQuantity) * 0.8));
  }

  private generateSeasonalRecommendations(seasonalPattern: string): string[] {
    if (seasonalPattern === 'high') {
      return [
        'Increase stock levels during peak seasons',
        'Plan ahead for seasonal demand spikes',
        'Consider seasonal pricing strategies',
      ];
    } else {
      return [
        'Reduce stock levels during low seasons',
        'Focus on cost optimization during slow periods',
        'Plan maintenance during low demand periods',
      ];
    }
  }

  private calculateOverallEfficiency(
    demandForecasts: DemandForecast[],
    maintenancePredictions: MaintenancePrediction[],
    costOptimizations: CostOptimization[]
  ): number {
    const totalItems = demandForecasts.length;
    if (totalItems === 0) return 0;

    let efficiencyScore = 0;

    // Stock efficiency (40% weight)
    const stockEfficiency =
      demandForecasts.reduce((sum, forecast) => {
        if (forecast.riskLevel === 'low') return sum + 1;
        if (forecast.riskLevel === 'medium') return sum + 0.7;
        if (forecast.riskLevel === 'high') return sum + 0.3;
        return sum + 0; // critical
      }, 0) / totalItems;

    // Maintenance efficiency (30% weight)
    const maintenanceEfficiency =
      maintenancePredictions.reduce((sum, prediction) => {
        if (prediction.priority === 'low') return sum + 1;
        if (prediction.priority === 'medium') return sum + 0.7;
        if (prediction.priority === 'high') return sum + 0.3;
        return sum + 0; // critical
      }, 0) / Math.max(1, maintenancePredictions.length);

    // Cost efficiency (30% weight)
    const costEfficiency =
      costOptimizations.reduce((sum, optimization) => {
        const savingsRatio =
          optimization.potentialSavings / optimization.currentCost;
        return sum + Math.min(1, savingsRatio * 10); // Normalize to 0-1
      }, 0) / Math.max(1, costOptimizations.length);

    efficiencyScore =
      stockEfficiency * 0.4 +
      maintenanceEfficiency * 0.3 +
      costEfficiency * 0.3;

    return Math.round(efficiencyScore * 100);
  }

  private generateOverallRecommendations(
    demandForecasts: DemandForecast[],
    maintenancePredictions: MaintenancePrediction[],
    costOptimizations: CostOptimization[],
    seasonalAnalyses: SeasonalAnalysis[]
  ): string[] {
    const recommendations: string[] = [];

    // Stockout risk recommendations
    const criticalStockoutItems = demandForecasts.filter(
      (f) => f.riskLevel === 'critical'
    );
    if (criticalStockoutItems.length > 0) {
      recommendations.push(
        `Immediate action required: ${criticalStockoutItems.length} items at critical stockout risk`
      );
    }

    // Maintenance recommendations
    const urgentMaintenance = maintenancePredictions.filter(
      (m) => m.priority === 'critical'
    );
    if (urgentMaintenance.length > 0) {
      recommendations.push(
        `Schedule urgent maintenance for ${urgentMaintenance.length} items`
      );
    }

    // Cost optimization recommendations
    const highSavingsItems = costOptimizations.filter(
      (c) => c.potentialSavings > 100
    );
    if (highSavingsItems.length > 0) {
      const totalSavings = highSavingsItems.reduce(
        (sum, item) => sum + item.potentialSavings,
        0
      );
      recommendations.push(
        `Potential cost savings: $${totalSavings.toFixed(2)} across ${highSavingsItems.length} items`
      );
    }

    // Seasonal recommendations
    const highSeasonalItems = seasonalAnalyses.filter(
      (s) => s.seasonalPattern === 'high'
    );
    if (highSeasonalItems.length > 0) {
      recommendations.push(
        `Prepare for seasonal demand: ${highSeasonalItems.length} items show high seasonal variation`
      );
    }

    return recommendations;
  }

  private assessOverallRisk(
    demandForecasts: DemandForecast[],
    maintenancePredictions: MaintenancePrediction[],
    costOptimizations: CostOptimization[]
  ): {
    stockoutRisk: number;
    overstockRisk: number;
    maintenanceRisk: number;
    costRisk: number;
  } {
    const totalItems = demandForecasts.length;

    const stockoutRisk =
      totalItems > 0
        ? demandForecasts.filter(
            (f) => f.riskLevel === 'critical' || f.riskLevel === 'high'
          ).length / totalItems
        : 0;

    const overstockRisk =
      totalItems > 0
        ? demandForecasts.filter((f) => f.currentStock > f.predictedDemand * 3)
            .length / totalItems
        : 0;

    const maintenanceRisk =
      maintenancePredictions.length > 0
        ? maintenancePredictions.filter(
            (m) => m.priority === 'critical' || m.priority === 'high'
          ).length / maintenancePredictions.length
        : 0;

    const costRisk =
      costOptimizations.length > 0
        ? costOptimizations.filter((c) => c.costTrend === 'increasing').length /
          costOptimizations.length
        : 0;

    return {
      stockoutRisk: Math.round(stockoutRisk * 100),
      overstockRisk: Math.round(overstockRisk * 100),
      maintenanceRisk: Math.round(maintenanceRisk * 100),
      costRisk: Math.round(costRisk * 100),
    };
  }
}
