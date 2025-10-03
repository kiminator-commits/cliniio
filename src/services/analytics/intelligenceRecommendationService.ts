// External dependencies
import { IntelligenceSummary } from './forecastingAnalyticsService';
import { AILearningService } from '../../pages/KnowledgeHub/services/aiLearningService';

// Type definitions
import { 
  IntelligenceRecommendation, 
  OptimizationTip, 
  RiskAlert 
} from '../../types/intelligenceRecommendationTypes';

// Intelligence services
import { RecommendationEngine } from '../intelligence/recommendationEngine';
import {
  getAIRiskPredictions,
  getHistoricalRiskPatterns
} from '../intelligence/intelligenceAIProvider';
import {
  sortRecommendationsByPriority,
  sortOptimizationTipsByPriority,
  sortRiskAlertsBySeverity
} from '../intelligence/intelligenceUtils';

// Data providers
import {
  getAIRecommendations,
  getUserBehaviorInsights,
  getUserPerformancePatterns,
  getAIConfidenceScore,
  getLearningProgressMetrics
} from './providers/intelligenceRecommendationSupabaseProvider';

export class IntelligenceRecommendationService {
  private static aiLearningService = new AILearningService();

  /**
   * Generate intelligent recommendations based on current performance and AI learning
   */
  static async generateRecommendations(
    summary: IntelligenceSummary
  ): Promise<IntelligenceRecommendation[]> {
    try {
      // Get AI-powered recommendations from learning service
      const aiRecommendations = await getAIRecommendations();

      // Get user behavior insights
      const userInsights = await getUserBehaviorInsights();

      // Combine AI insights with business logic for hybrid recommendations
      const recommendations = await RecommendationEngine.generateHybridRecommendations(
        summary,
        aiRecommendations,
        userInsights
      );

      // Sort by priority and AI confidence
      return sortRecommendationsByPriority(recommendations);
    } catch (error) {
      console.error('Error generating AI recommendations:', error);
      // Fallback to basic recommendations if AI fails
      return RecommendationEngine.generateFallbackRecommendations(summary);
    }
  }

  /**
   * Generate optimization tips based on AI learning and user behavior
   */
  static async generateOptimizationTips(
    summary: IntelligenceSummary
  ): Promise<OptimizationTip[]> {
    try {
      // Get AI learning insights for personalized tips
      const learningInsights =
        (await this.aiLearningService.getLearningInsights()) as Record<
          string,
          unknown
        > | null;

      // Get user performance patterns
      const performancePatterns = await getUserPerformancePatterns();

      // Generate AI-enhanced optimization tips
      const tips = await RecommendationEngine.generateAIOptimizationTips(
        summary,
        learningInsights,
        performancePatterns
      );

      return sortOptimizationTipsByPriority(tips);
    } catch (error) {
      console.error('Error generating AI optimization tips:', error);
      // Fallback to basic tips if AI fails
      return RecommendationEngine.generateFallbackOptimizationTips(summary);
    }
  }

  /**
   * Generate risk alerts based on AI analysis and predictive modeling
   */
  static async generateRiskAlerts(
    summary: IntelligenceSummary
  ): Promise<RiskAlert[]> {
    try {
      // Get AI-powered risk predictions
      const aiRiskPredictions = await getAIRiskPredictions();

      // Get historical risk patterns
      const riskPatterns = await getHistoricalRiskPatterns();

      // Generate intelligent risk alerts
      const alerts = await RecommendationEngine.generateIntelligentRiskAlerts(
        summary,
        aiRiskPredictions,
        riskPatterns
      );

      return sortRiskAlertsBySeverity(alerts);
    } catch (error) {
      console.error('Error generating AI risk alerts:', error);
      // Fallback to basic risk alerts if AI fails
      return RecommendationEngine.generateFallbackRiskAlerts(summary);
    }
  }

  /**
   * Get actionable insights summary with AI enhancement
   */
  static async getActionableInsights(summary: IntelligenceSummary) {
    const recommendations = await this.generateRecommendations(summary);
    const tips = await this.generateOptimizationTips(summary);
    const alerts = await this.generateRiskAlerts(summary);

    // Get AI confidence scores
    const aiConfidence = await getAIConfidenceScore();

    return {
      totalRecommendations: recommendations.length,
      criticalItems: recommendations.filter((r) => r.priority === 'critical')
        .length,
      highPriorityItems: recommendations.filter((r) => r.priority === 'high')
        .length,
      totalTips: tips.length,
      totalAlerts: alerts.length,
      criticalAlerts: alerts.filter((a) => a.severity === 'critical').length,
      estimatedSavings: recommendations.reduce(
        (sum, r) => sum + (r.impact.costSavings || 0),
        0
      ),
      estimatedTimeSavings: recommendations.reduce(
        (sum, r) => sum + (r.impact.timeSavings || 0),
        0
      ),
      aiConfidence: aiConfidence,
      learningProgress: await getLearningProgressMetrics(),
    };
  }



}

export default IntelligenceRecommendationService;
