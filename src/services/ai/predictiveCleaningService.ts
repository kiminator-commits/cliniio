import { auditLogger } from '@/utils/auditLogger';
import {
  generateCleaningPredictions as generatePredictions,
  getActivePredictions,
  updatePredictionAccuracy,
} from './predictiveCleaning';

// Import and re-export types from predictiveCleaning
import type {
  CleaningPrediction,
  CleaningPattern,
  RoomUsagePattern,
  PredictiveCleaningInsights,
} from './predictiveCleaning';

export type {
  CleaningPrediction,
  CleaningPattern,
  RoomUsagePattern,
  PredictiveCleaningInsights,
};

export class PredictiveCleaningService {
  private openaiApiKey: string | null = null;

  constructor() {
    this.openaiApiKey = import.meta.env.VITE_OPENAI_API_KEY || null;
  }

  /**
   * Generate comprehensive cleaning predictions for a facility
   */
  async generateCleaningPredictions(
    facilityId: string
  ): Promise<PredictiveCleaningInsights> {
    try {
      const insights = await generatePredictions(facilityId);

      // Log insights generation
      auditLogger.log('environmental_clean', 'ai_insights_generated', {
        facilityId,
        predictionCount: insights.predictions.length,
        overallEfficiency: insights.overallEfficiency,
        timestamp: new Date().toISOString(),
      });

      return insights;
    } catch (error) {
      console.error('❌ Error generating cleaning predictions:', error);
      throw new Error('Failed to generate cleaning predictions');
    }
  }

  /**
   * Get active predictions for a facility
   */
  async getActivePredictions(
    facilityId: string
  ): Promise<CleaningPrediction[]> {
    return getActivePredictions(facilityId);
  }

  /**
   * Update prediction accuracy after cleaning completion
   */
  async updatePredictionAccuracy(
    predictionId: string,
    actualCleaningDate: string,
    accuracy: number
  ): Promise<void> {
    return updatePredictionAccuracy(predictionId, actualCleaningDate, accuracy);
  }
}
