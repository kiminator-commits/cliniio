import { aiMetricsService } from './aiMetricsService';
import { aiCostCalculationService } from './aiCostCalculationService';
import { aiReportingService } from './aiReportingService';

// Import and re-export types for backward compatibility
import type {
  AIImpactMetrics,
  AIBaselineData,
  AITask,
} from './aiMetricsService';
export type { AIImpactMetrics, AIBaselineData, AITask };

/**
 * Main AI Impact Measurement Service - Orchestrates metrics, cost calculations, and reporting
 * This service maintains the exact same API contract as the original monolithic service
 */
export class AIImpactMeasurementService {
  /**
   * Get comprehensive AI impact metrics for real-time dashboard
   */
  async getAIImpactMetrics() {
    return await aiMetricsService.getAIImpactMetrics();
  }

  /**
   * Get real-time alerts and insights
   */
  async getAIInsights() {
    return await aiMetricsService.getAIInsights();
  }

  /**
   * Generate comprehensive AI impact report
   */
  generateAIImpactReport(metrics: AIImpactMetrics) {
    return aiReportingService.generateAIImpactReport(metrics);
  }

  /**
   * Generate executive summary for stakeholders
   */
  generateExecutiveSummary(metrics: AIImpactMetrics) {
    return aiReportingService.generateExecutiveSummary(metrics);
  }

  /**
   * Generate detailed performance breakdown
   */
  generatePerformanceBreakdown(metrics: AIImpactMetrics) {
    return aiReportingService.generatePerformanceBreakdown(metrics);
  }

  /**
   * Calculate cost savings (exposed for direct access if needed)
   */
  async calculateCostSavings(
    timeSavings: AIImpactMetrics['timeSavings'],
    aiTasks: AITask[]
  ) {
    return await aiCostCalculationService.calculateCostSavings(
      timeSavings,
      aiTasks
    );
  }
}

// Export singleton instance for backward compatibility
export const aiImpactMeasurementService = new AIImpactMeasurementService();
