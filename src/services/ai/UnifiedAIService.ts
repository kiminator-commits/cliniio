// ============================================================================
// UNIFIED AI SERVICE - Single Entry Point for All AI Operations
// ============================================================================

import { askCliniioAI } from '../aiService';
import { OptimizedAIService } from './OptimizedAIService';
import { LearningAIService } from './learningAI/learningAIService';
import { InventoryAIService } from './inventoryAIService';
import { SterilizationAIService } from './sterilization/sterilizationAIService';
import { EnvironmentalAIService } from './environmentalAI/environmentalAIService';
import { aiServiceIntegration } from './AIServiceIntegration';

/**
 * Unified AI Service - Single entry point for all AI operations
 * Provides a consistent interface across all AI domains
 */
export class UnifiedAIService {
  private static learningAIInstance: LearningAIService | null = null;
  private static inventoryAIInstance: InventoryAIService | null = null;
  private static sterilizationAIInstance: SterilizationAIService | null = null;
  private static environmentalAIInstance: EnvironmentalAIService | null = null;

  // ============================================================================
  // GENERAL AI OPERATIONS
  // ============================================================================

  /**
   * Ask Cliniio AI a general question
   */
  static async askAI(prompt: string, context?: string): Promise<string> {
    try {
      const result = await askCliniioAI({ prompt, context });
      
      // Track usage for general AI questions
      // Estimate tokens (rough approximation)
      const inputTokens = Math.ceil(prompt.length / 4); // ~4 chars per token
      const outputTokens = Math.ceil(result.length / 4);
      
      aiServiceIntegration.trackUsage(
        'General AI Questions',
        'gpt-4o-mini',
        inputTokens,
        outputTokens,
        true
      );
      
      return result;
    } catch (error) {
      // Track failed request
      aiServiceIntegration.trackUsage(
        'General AI Questions',
        'gpt-4o-mini',
        0,
        0,
        false
      );
      throw error;
    }
  }

  /**
   * Execute optimized AI operation
   */
  static async executeOptimizedAI<T>(
    config: {
      service: string;
      operation: string;
      priority?: number;
      useCache?: boolean;
      useBatching?: boolean;
      cacheTtl?: number;
      maxRetries?: number;
      timeout?: number;
      metadata?: Record<string, unknown>;
    },
    operation: () => Promise<T>,
    context?: {
      userId?: string;
      facilityId?: string;
      parameters?: Record<string, unknown>;
    }
  ) {
    const optimizedService = OptimizedAIService.getInstance();
    return optimizedService.execute(config, operation, context);
  }

  // ============================================================================
  // LEARNING AI OPERATIONS
  // ============================================================================

  /**
   * Get Learning AI service instance
   */
  private static getLearningAI(facilityId: string): LearningAIService {
    if (!this.learningAIInstance) {
      this.learningAIInstance = new LearningAIService(facilityId);
    }
    return this.learningAIInstance;
  }

  /**
   * Get personalized learning recommendations
   */
  static async getLearningRecommendations(facilityId: string, userId: string) {
    const learningAI = this.getLearningAI(facilityId);
    return learningAI.generatePersonalizedRecommendations(userId);
  }

  /**
   * Analyze skill gaps
   */
  static async analyzeSkillGaps(facilityId: string, userId: string) {
    const learningAI = this.getLearningAI(facilityId);
    return learningAI.analyzeSkillGaps(userId);
  }

  /**
   * Optimize learning pathways
   */
  static async optimizeLearningPath(facilityId: string, userId: string) {
    const learningAI = this.getLearningAI(facilityId);
    return learningAI.optimizeLearningPath(userId);
  }

  // ============================================================================
  // INVENTORY AI OPERATIONS
  // ============================================================================

  /**
   * Get Inventory AI service instance
   */
  private static getInventoryAI(facilityId: string): InventoryAIService {
    if (!this.inventoryAIInstance) {
      this.inventoryAIInstance = new InventoryAIService(facilityId);
    }
    return this.inventoryAIInstance;
  }

  /**
   * Analyze barcode data
   */
  static async analyzeBarcode(facilityId: string, barcodeData: File) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.analyzeBarcode(barcodeData);
  }

  /**
   * Perform image recognition
   */
  static async performImageRecognition(facilityId: string, imageFile: File) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.analyzeImage(imageFile);
  }

  /**
   * Generate demand forecasting
   */
  static async generateDemandForecast(
    facilityId: string,
    timeframe: string,
    period: 'week' | 'month' | 'quarter' | 'year'
  ) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.generateDemandForecast(timeframe, period);
  }

  /**
   * Generate cost optimization
   */
  static async generateCostOptimization(
    facilityId: string,
    optimizationType: 'purchasing' | 'storage' | 'transportation' | 'overall'
  ) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.generateCostOptimization(optimizationType);
  }

  // ============================================================================
  // STERILIZATION AI OPERATIONS
  // ============================================================================

  /**
   * Get Sterilization AI service instance
   */
  private static getSterilizationAI(
    facilityId: string
  ): SterilizationAIService {
    if (!this.sterilizationAIInstance) {
      this.sterilizationAIInstance = new SterilizationAIService(facilityId);
    }
    return this.sterilizationAIInstance;
  }

  /**
   * Get sterilization insights
   */
  static async getSterilizationInsights(facilityId: string) {
    const sterilizationAI = this.getSterilizationAI(facilityId);
    return sterilizationAI.getRealTimeInsights();
  }

  /**
   * Get predictive analytics
   */
  static async getSterilizationPredictiveAnalytics(facilityId: string) {
    const sterilizationAI = this.getSterilizationAI(facilityId);
    return sterilizationAI.getPredictiveAnalytics();
  }

  /**
   * Get real-time insights
   */
  static async getSterilizationRealTimeInsights(facilityId: string) {
    const sterilizationAI = this.getSterilizationAI(facilityId);
    return sterilizationAI.getRealTimeInsights();
  }

  /**
   * Get historical trends
   */
  static async getSterilizationHistoricalTrends(
    facilityId: string,
    timeframe: 'week' | 'month' | 'quarter' | 'year'
  ) {
    const sterilizationAI = this.getSterilizationAI(facilityId);
    return sterilizationAI.getHistoricalTrends(timeframe);
  }

  // ============================================================================
  // ENVIRONMENTAL AI OPERATIONS
  // ============================================================================

  /**
   * Get Environmental AI service instance
   */
  private static getEnvironmentalAI(
    facilityId: string
  ): EnvironmentalAIService {
    if (!this.environmentalAIInstance) {
      this.environmentalAIInstance = new EnvironmentalAIService(facilityId);
    }
    return this.environmentalAIInstance;
  }

  /**
   * Analyze environmental data
   */
  static async analyzeEnvironmentalData(facilityId: string, roomId: string) {
    const environmentalAI = this.getEnvironmentalAI(facilityId);
    return environmentalAI.generatePredictiveCleaning(roomId);
  }

  /**
   * Generate environmental insights
   */
  static async generateEnvironmentalInsights(facilityId: string) {
    const environmentalAI = this.getEnvironmentalAI(facilityId);
    return environmentalAI.getEnvironmentalInsights();
  }

  // ============================================================================
  // SERVICE MANAGEMENT
  // ============================================================================

  /**
   * Initialize all AI services for a facility
   */
  static async initializeServices(facilityId: string): Promise<void> {
    try {
      // Initialize Learning AI
      const learningAI = this.getLearningAI(facilityId);
      await learningAI.initialize();

      // Initialize Inventory AI
      const inventoryAI = this.getInventoryAI(facilityId);
      await inventoryAI.initializeSettings();

      // Initialize Environmental AI
      const environmentalAI = this.getEnvironmentalAI(facilityId);
      await environmentalAI.initialize();

      console.log(
        `[UnifiedAIService] All AI services initialized for facility: ${facilityId}`
      );
    } catch (error) {
      console.error(
        '[UnifiedAIService] Failed to initialize AI services:',
        error
      );
      throw error;
    }
  }

  /**
   * Get service status
   */
  static getServiceStatus() {
    return {
      learningAI: !!this.learningAIInstance,
      inventoryAI: !!this.inventoryAIInstance,
      sterilizationAI: !!this.sterilizationAIInstance,
      environmentalAI: !!this.environmentalAIInstance,
    };
  }

  /**
   * Clear all service instances (for testing)
   */
  static clearInstances(): void {
    this.learningAIInstance = null;
    this.inventoryAIInstance = null;
    this.sterilizationAIInstance = null;
    this.environmentalAIInstance = null;
  }
}

// Export the unified service as default
export default UnifiedAIService;
