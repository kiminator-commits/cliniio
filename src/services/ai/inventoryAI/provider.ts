/**
 * Inventory AI Provider Service - Main coordinator for AI operations
 * Simplified version that uses focused sub-services
 */

import type {
  AIImageProcessingResult,
  AIForecastResult,
  AIOptimizationResult,
  AICategorizationResult,
} from './types';
import { InventoryAIImageProcessingService } from './services/InventoryAIImageProcessingService';
import { InventoryAIForecastingService } from './services/InventoryAIForecastingService';
import { InventoryAIOptimizationService } from './services/InventoryAIOptimizationService';

export class InventoryAIProviderService {
  private facilityId: string;
  private imageProcessingService: InventoryAIImageProcessingService;
  private forecastingService: InventoryAIForecastingService;
  private optimizationService: InventoryAIOptimizationService;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.imageProcessingService = new InventoryAIImageProcessingService(
      facilityId
    );
    this.forecastingService = new InventoryAIForecastingService(facilityId);
    this.optimizationService = new InventoryAIOptimizationService(facilityId);
  }

  // Process image with AI
  async processImageWithAI(): Promise<AIImageProcessingResult> {
    return await this.imageProcessingService.processImageWithAI();
  }

  // Analyze barcode with AI
  async analyzeBarcodeWithAI(
    barcodeData: string
  ): Promise<AIImageProcessingResult> {
    return await this.imageProcessingService.analyzeBarcodeWithAI(barcodeData);
  }

  // Generate demand forecast with AI
  async generateDemandForecastWithAI(): Promise<AIForecastResult[]> {
    return await this.forecastingService.generateDemandForecastWithAI();
  }

  // Generate stockout risk analysis
  async generateStockoutRiskAnalysis(): Promise<{
    highRiskItems: string[];
    mediumRiskItems: string[];
    lowRiskItems: string[];
    overallRiskScore: number;
  }> {
    return await this.forecastingService.generateStockoutRiskAnalysis();
  }

  // Generate maintenance predictions
  async generateMaintenancePredictions(): Promise<{
    urgentMaintenance: string[];
    scheduledMaintenance: string[];
    preventiveMaintenance: string[];
  }> {
    return await this.forecastingService.generateMaintenancePredictions();
  }

  // Generate cost optimization with AI
  async generateCostOptimizationWithAI(): Promise<AIOptimizationResult> {
    return await this.optimizationService.generateCostOptimizationWithAI();
  }

  // Generate smart categorization with AI
  async generateSmartCategorizationWithAI(): Promise<AICategorizationResult> {
    return await this.optimizationService.generateSmartCategorizationWithAI();
  }

  // Generate inventory optimization recommendations
  async generateInventoryOptimizationRecommendations(): Promise<{
    reorderPoints: Record<string, number>;
    safetyStock: Record<string, number>;
    maxStockLevels: Record<string, number>;
  }> {
    return await this.optimizationService.generateInventoryOptimizationRecommendations();
  }

  // Get comprehensive AI insights
  async getComprehensiveAIInsights(): Promise<{
    demandForecast: AIForecastResult[];
    stockoutRisk: {
      highRiskItems: string[];
      mediumRiskItems: string[];
      lowRiskItems: string[];
      overallRiskScore: number;
    };
    maintenancePredictions: {
      urgentMaintenance: string[];
      scheduledMaintenance: string[];
      preventiveMaintenance: string[];
    };
    costTrends: {
      trend: string;
      percentageChange: number;
      confidence: number;
    };
    seasonalPatterns: {
      patterns: string[];
      confidence: number;
    };
  }> {
    const demandForecast = await this.generateDemandForecastWithAI();
    const stockoutRisk = await this.generateStockoutRiskAnalysis();
    const maintenancePredictions = await this.generateMaintenancePredictions();

    // Mock additional data
    const costTrends = {
      trend: 'decreasing',
      percentageChange: -5.2,
      confidence: 0.85,
    };

    const seasonalPatterns = {
      patterns: ['Q4 peak', 'Summer dip'],
      confidence: 0.78,
    };

    return {
      demandForecast,
      stockoutRisk,
      maintenancePredictions,
      costTrends,
      seasonalPatterns,
    };
  }
}
