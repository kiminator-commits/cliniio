// ============================================================================
// UNIFIED AI SERVICE - Single Entry Point for All AI Operations
// ============================================================================

import { askCliniioAI } from '../aiService';
import { OptimizedAIService } from './OptimizedAIService';
import { LearningAIService } from './learningAI/learningAIService';
import { InventoryAIService } from './inventoryAIService';
import { SterilizationAIService } from './sterilization/sterilizationAIService';
import { EnvironmentalAIService } from './environmentalAI/environmentalAIService';

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
    return askCliniioAI({ prompt, context });
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
    return learningAI.getPersonalizedRecommendations(userId);
  }

  /**
   * Analyze knowledge gaps
   */
  static async analyzeKnowledgeGaps(facilityId: string, userId: string) {
    const learningAI = this.getLearningAI(facilityId);
    return learningAI.analyzeKnowledgeGaps(userId);
  }

  /**
   * Optimize learning pathways
   */
  static async optimizeLearningPathways(facilityId: string, userId: string) {
    const learningAI = this.getLearningAI(facilityId);
    return learningAI.optimizeLearningPathways(userId);
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
  static async analyzeBarcode(facilityId: string, barcodeData: string) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.analyzeBarcode(barcodeData);
  }

  /**
   * Perform image recognition
   */
  static async performImageRecognition(facilityId: string, imageData: string) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.performImageRecognition(imageData);
  }

  /**
   * Generate demand forecasting
   */
  static async generateDemandForecasting(
    facilityId: string,
    timeframe: string
  ) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.generateDemandForecasting(timeframe);
  }

  /**
   * Optimize inventory costs
   */
  static async optimizeInventoryCosts(facilityId: string) {
    const inventoryAI = this.getInventoryAI(facilityId);
    return inventoryAI.optimizeInventoryCosts();
  }

  // ============================================================================
  // STERILIZATION AI OPERATIONS
  // ============================================================================

  /**
   * Get Sterilization AI service instance
   */
  private static getSterilizationAI(): SterilizationAIService {
    if (!this.sterilizationAIInstance) {
      this.sterilizationAIInstance = new SterilizationAIService();
    }
    return this.sterilizationAIInstance;
  }

  /**
   * Get sterilization insights
   */
  static async getSterilizationInsights() {
    const sterilizationAI = this.getSterilizationAI();
    return sterilizationAI.getInsights();
  }

  /**
   * Get predictive analytics
   */
  static async getSterilizationPredictiveAnalytics() {
    const sterilizationAI = this.getSterilizationAI();
    return sterilizationAI.getPredictiveAnalytics();
  }

  /**
   * Get real-time insights
   */
  static async getSterilizationRealTimeInsights() {
    const sterilizationAI = this.getSterilizationAI();
    return sterilizationAI.getRealTimeInsights();
  }

  /**
   * Get historical trends
   */
  static async getSterilizationHistoricalTrends() {
    const sterilizationAI = this.getSterilizationAI();
    return sterilizationAI.getHistoricalTrends();
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
  static async analyzeEnvironmentalData(
    facilityId: string,
    data: Record<string, unknown>
  ) {
    const environmentalAI = this.getEnvironmentalAI(facilityId);
    return environmentalAI.analyzeEnvironmentalData(data);
  }

  /**
   * Generate environmental insights
   */
  static async generateEnvironmentalInsights(facilityId: string) {
    const environmentalAI = this.getEnvironmentalAI(facilityId);
    return environmentalAI.generateInsights();
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
      await inventoryAI.initialize();

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
