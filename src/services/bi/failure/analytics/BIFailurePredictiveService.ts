import { logger } from '@/utils/_core/logger';
import {
  BIRiskAnalysisProvider,
  RiskFactor,
} from './providers/BIRiskAnalysisProvider';
import { BIPredictionProvider } from './providers/BIPredictionProvider';
import {
  BIRecommendationsProvider,
  PredictiveRecommendation,
} from './providers/BIRecommendationsProvider';
import {
  BITrendAnalysisProvider,
  TrendAnalysis,
} from './providers/BITrendAnalysisProvider';
import {
  BISeasonalAnalysisProvider,
  SeasonalPattern,
} from './providers/BISeasonalAnalysisProvider';
import { BIDataProcessingProvider } from './providers/BIDataProcessingProvider';

// Re-export interfaces for backward compatibility
export interface PredictiveInsights {
  facilityId: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictedIncidents: number;
  recommendations: PredictiveRecommendation[];
  confidence: number;
  riskFactors: RiskFactor[];
  trendAnalysis: TrendAnalysis;
  seasonalPatterns: SeasonalPattern[];
}

export class BIFailurePredictiveService {
  /**
   * Get predictive insights for a facility
   */
  static async getPredictiveInsights(
    facilityId: string
  ): Promise<PredictiveInsights> {
    try {
      const [
        riskLevel,
        predictedIncidents,
        recommendations,
        riskFactors,
        trendAnalysis,
        seasonalPatterns,
      ] = await Promise.all([
        BIRiskAnalysisProvider.calculateRiskLevel(facilityId),
        BIPredictionProvider.predictIncidentCount(facilityId),
        BIRecommendationsProvider.generatePredictiveRecommendations(facilityId),
        BIRiskAnalysisProvider.analyzeRiskFactors(facilityId),
        BITrendAnalysisProvider.analyzeTrends(facilityId),
        BISeasonalAnalysisProvider.analyzeSeasonalPatterns(facilityId),
      ]);

      // Calculate overall confidence based on data quality and model performance
      const confidence = BIDataProcessingProvider.calculateConfidence(
        facilityId,
        riskFactors as any,
        trendAnalysis as any
      );

      return {
        facilityId,
        riskLevel,
        predictedIncidents,
        recommendations,
        confidence,
        riskFactors,
        trendAnalysis,
        seasonalPatterns,
      };
    } catch (error) {
      logger.error('Error generating predictive insights:', error);
      throw new Error('Failed to generate predictive insights');
    }
  }
}
