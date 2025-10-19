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
import { supabase } from '../../lib/supabaseClient';
import { logger } from '../logging/structuredLogger';

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
   * Ask Cliniio AI a general question - Production hardened version
   */
  static async askAI(prompt: string, context?: { module?: string; facilityId?: string; userId?: string; }): Promise<string> {
    const apiKey = process.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('AIServiceError: 401 - OpenAI API key not configured');
    }

    const module = context?.module || 'unknown';
    const facilityId = context?.facilityId || 'unknown';
    const userId = context?.userId || 'unknown';
    const promptLength = prompt.length;
    const redactedPrompt = prompt.substring(0, 250).replace(/\n/g, ' ');

    const payload = {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are Cliniio\'s AI assistant, specializing in healthcare facility management, sterilization protocols, inventory management, and compliance workflows. Provide accurate, actionable insights based on the data provided.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    };

    let lastError: Error | null = null;
    const retryDelays = [1000, 2000, 4000]; // 1s, 2s, 4s

    for (let attempt = 0; attempt <= 3; attempt++) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`AIServiceError: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const responseText = data.choices?.[0]?.message?.content;
        
        if (!responseText) {
          throw new Error('AIServiceError: 500 - No response content from OpenAI');
        }

        // Log successful attempt
        try {
          await supabase.from('ai_usage_logs').insert({
            facility_id: facilityId,
            user_id: userId,
            module: module,
            prompt_length: promptLength,
            response_length: responseText.length,
            success: true,
            model: 'gpt-4o-mini',
            created_at: new Date().toISOString()
          });
        } catch (logError) {
          // Log failures silently
        }

        // Track usage for general AI questions
        const inputTokens = Math.ceil(promptLength / 4);
        const outputTokens = Math.ceil(responseText.length / 4);
        
        aiServiceIntegration.trackUsage(
          'General AI Questions',
          'gpt-4o-mini',
          inputTokens,
          outputTokens,
          true
        );

        return responseText;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        // Log failed attempt
        try {
          await supabase.from('ai_usage_logs').insert({
            facility_id: facilityId,
            user_id: userId,
            module: module,
            prompt_length: promptLength,
            response_length: 0,
            success: false,
            model: 'gpt-4o-mini',
            created_at: new Date().toISOString()
          });
        } catch (logError) {
          // Log failures silently
        }

        // Track failed request
        aiServiceIntegration.trackUsage(
          'General AI Questions',
          'gpt-4o-mini',
          0,
          0,
          false
        );

        if (attempt < 3) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
          continue;
        }
      }
    }

    // All retries failed
    const errorMessage = lastError?.message || 'Unknown error';
    logger.error('All AI service retries failed', {
      module: module,
      facilityId: facilityId,
      userId: userId
    }, {
      error: errorMessage,
      attempts: 3,
      lastError: lastError?.message
    });
    throw new Error(errorMessage);
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
