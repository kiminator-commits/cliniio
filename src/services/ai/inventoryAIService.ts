import { InventoryAnalyticsService } from './inventoryAI/analytics';
import {
  ForecastingWorkflowService,
  OptimizationService,
  RiskAnalysisService,
  CostAnalyticsService,
} from './inventoryAI/';
import { InventorySupabaseProvider } from './inventoryAI/providers/inventorySupabaseProvider';
import type {
  InventoryAISettings,
  BarcodeAnalysisResult,
  ImageRecognitionResult,
  DemandForecastingResult,
  CostOptimizationResult,
  SmartCategorizationResult,
  AIInventoryInsight,
  ReportData,
} from '../../types/inventoryAITypes';

// Re-export all types for backward compatibility
export type {
  InventoryAISettings,
  AIModel,
  BarcodeAnalysisResult,
  ImageRecognitionResult,
  DemandForecastingResult,
  CostOptimizationResult,
  SmartCategorizationResult,
  AIInventoryInsight,
  InventoryReportData,
  CostReportData,
  MaintenanceReportData,
  ComprehensiveReportData,
  ReportData,
} from '../../types/inventoryAITypes';

export class InventoryAIService {
  private facilityId: string;
  private analyticsService: InventoryAnalyticsService;
  private forecastingService: ForecastingWorkflowService;
  private optimizationService: OptimizationService;
  private riskAnalysisService: RiskAnalysisService;
  private costAnalyticsService: CostAnalyticsService;
  private supabaseProvider: InventorySupabaseProvider;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
    this.analyticsService = new InventoryAnalyticsService(facilityId);
    this.forecastingService = new ForecastingWorkflowService(facilityId);
    this.optimizationService = new OptimizationService(facilityId);
    this.riskAnalysisService = new RiskAnalysisService(facilityId);
    this.costAnalyticsService = new CostAnalyticsService(facilityId);
    this.supabaseProvider = new InventorySupabaseProvider(facilityId);
  }

  // ============================================================================
  // SYNCHRONOUS FACADE METHODS
  // Methods that return immediately without awaiting AI/DB operations
  // ============================================================================

  // Get AI insights for inventory
  async getInventoryInsights(): Promise<AIInventoryInsight[]> {
    return this.analyticsService.getInventoryInsights();
  }

  // ============================================================================
  // ASYNCHRONOUS FACADE METHODS
  // Methods that await AI/DB operations and external service calls
  // ============================================================================

  // Load AI settings for the facility
  async loadSettings(): Promise<InventoryAISettings | null> {
    return await this.supabaseProvider.loadSettings();
  }

  // Save AI settings for the facility
  async saveSettings(settings: Partial<InventoryAISettings>): Promise<boolean> {
    return await this.supabaseProvider.saveSettings(settings);
  }

  // Initialize default AI settings for a facility
  async initializeSettings(): Promise<boolean> {
    return await this.supabaseProvider.initializeSettings();
  }

  // Analyze barcode with AI
  async analyzeBarcode(
    imageFile: File,
    barcodeValue?: string
  ): Promise<BarcodeAnalysisResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.barcode_scanning_enabled) {
        throw new Error('Barcode scanning AI is not enabled');
      }

      return await this.riskAnalysisService.analyzeBarcode(imageFile, barcodeValue);
    } catch (error) {
      console.error('Error analyzing barcode:', error);
      return null;
    }
  }

  // Analyze image with AI
  async analyzeImage(imageFile: File): Promise<ImageRecognitionResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.image_recognition_enabled) {
        throw new Error('Image recognition AI is not enabled');
      }

      return await this.riskAnalysisService.analyzeImage(imageFile);
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  }

  // Generate demand forecast
  async generateDemandForecast(
    itemId: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ): Promise<DemandForecastingResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.demand_forecasting_enabled) {
        throw new Error('Demand forecasting AI is not enabled');
      }

      return await this.forecastingService.generateDemandForecast(itemId, period);
    } catch (error) {
      console.error('Error generating demand forecast:', error);
      return null;
    }
  }

  // Generate cost optimization insights
  async generateCostOptimization(
    optimizationType: 'purchasing' | 'storage' | 'transportation' | 'overall'
  ): Promise<CostOptimizationResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.cost_optimization_enabled) {
        throw new Error('Cost optimization AI is not enabled');
      }

      return await this.optimizationService.generateCostOptimization(optimizationType);
    } catch (error) {
      console.error('Error generating cost optimization:', error);
      return null;
    }
  }

  // Smart categorization
  async categorizeItem(
    inputData: string | File,
    dataType: 'text' | 'image' | 'barcode' | 'mixed'
  ): Promise<SmartCategorizationResult | null> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.smart_categorization_enabled) {
        throw new Error('Smart categorization AI is not enabled');
      }

      return await this.optimizationService.categorizeItem(inputData, dataType);
    } catch (error) {
      console.error('Error categorizing item:', error);
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
      const settings = await this.loadSettings();
      if (!settings?.predictive_analytics_enabled) {
        throw new Error('Predictive analytics AI is not enabled');
      }

      return await this.forecastingService.getPredictiveAnalytics();
    } catch (error) {
      console.error('Error generating predictive analytics:', error);
      throw error;
    }
  }

  // Export analytics report
  async exportAnalyticsReport(
    reportType:
      | 'inventory'
      | 'predictive'
      | 'cost'
      | 'maintenance'
      | 'comprehensive',
    format: 'pdf' | 'csv' | 'excel' | 'json',
    dateRange?: { start: string; end: string }
  ): Promise<{
    success: boolean;
    data?: ReportData;
    error?: string;
    downloadUrl?: string;
  }> {
    try {
      const settings = await this.loadSettings();
      if (!settings?.predictive_analytics_enabled) {
        throw new Error('Analytics export is not enabled');
      }

      return await this.costAnalyticsService.exportAnalyticsReport(
        reportType,
        format,
        dateRange
      );
    } catch (error) {
      console.error('Error exporting analytics report:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Export failed',
      };
    }
  }


}
