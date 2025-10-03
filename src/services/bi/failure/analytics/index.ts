// Re-export all analytics services
export { BIFailureAnalyticsSummaryService } from './BIFailureAnalyticsSummaryService';
export { BIFailureTrendAnalysisService } from './BIFailureTrendAnalysisService';
export { BIFailureComplianceService } from './BIFailureComplianceService';
export { BIFailureRealTimeService } from './BIFailureRealTimeService';
export { BIFailurePredictiveService } from './BIFailurePredictiveService';

// Re-export all types
export * from './types';

// Import services for internal use
import { BIFailureAnalyticsSummaryService } from './BIFailureAnalyticsSummaryService';
import { BIFailureTrendAnalysisService } from './BIFailureTrendAnalysisService';
import { BIFailureComplianceService } from './BIFailureComplianceService';
import { BIFailureRealTimeService } from './BIFailureRealTimeService';
import { BIFailurePredictiveService } from './BIFailurePredictiveService';
// import { logger } from '../../../utils/_core/logger';

// Main analytics service that combines all functionality
// This maintains backward compatibility with the original monolithic service
export class BIFailureAnalyticsService {
  /**
   * Get analytics summary for a facility within a date range
   */
  static async getAnalyticsSummary(
    facilityId: string,
    startDate: string,
    endDate: string
  ) {
    return BIFailureAnalyticsSummaryService.getAnalyticsSummary(
      facilityId,
      startDate,
      endDate
    );
  }

  /**
   * Get trend analysis for a facility within a date range
   */
  static async getTrendAnalysis(
    facilityId: string,
    startDate: string,
    endDate: string
  ) {
    return BIFailureTrendAnalysisService.getTrendAnalysis(
      facilityId,
      startDate,
      endDate
    );
  }

  /**
   * Get analytics summary for multiple facilities
   */
  static async getMultiFacilityAnalyticsSummary(
    facilityIds: string[],
    startDate: string,
    endDate: string
  ) {
    return BIFailureAnalyticsSummaryService.getMultiFacilityAnalyticsSummary(
      facilityIds,
      startDate,
      endDate
    );
  }

  /**
   * Get comparative analytics summary between two periods
   */
  static async getComparativeAnalyticsSummary(
    facilityId: string,
    currentPeriod: { startDate: string; endDate: string },
    previousPeriod: { startDate: string; endDate: string }
  ) {
    return BIFailureAnalyticsSummaryService.getComparativeAnalyticsSummary(
      facilityId,
      currentPeriod,
      previousPeriod
    );
  }

  /**
   * Get trend analysis with custom date grouping
   */
  static async getCustomTrendAnalysis(
    facilityId: string,
    startDate: string,
    endDate: string,
    groupBy: 'hour' | 'day' | 'week' | 'month' | 'quarter' | 'year'
  ) {
    return BIFailureTrendAnalysisService.getCustomTrendAnalysis(
      facilityId,
      startDate,
      endDate,
      groupBy
    );
  }

  /**
   * Get compliance report for a facility
   */
  static async getComplianceReport(facilityId: string) {
    try {
      return await BIFailureComplianceService.getComplianceReport(facilityId);
    } catch (error) {
      console.error('Error getting compliance report:', error);
      // Return fallback data if service fails
      return {
        facilityId,
        reportDate: new Date().toISOString(),
        complianceScore: 0,
        regulatoryRequirements: [],
        auditFindings: [],
        recommendations: [],
      };
    }
  }

  /**
   * Get real-time dashboard data for a facility
   */
  static async getRealTimeDashboardData(facilityId: string) {
    try {
      return await BIFailureRealTimeService.getRealTimeDashboardData(
        facilityId
      );
    } catch (error) {
      console.error('Error getting real-time dashboard data:', error);
      // Return fallback data if service fails
      return {
        facilityId,
        activeIncidents: 0,
        pendingActions: 0,
        lastUpdated: new Date().toISOString(),
        alerts: [],
        incidentSummary: {
          totalToday: 0,
          totalThisWeek: 0,
          totalThisMonth: 0,
          resolvedToday: 0,
          escalatedToday: 0,
        },
        performanceMetrics: {
          averageResponseTime: 0,
          averageResolutionTime: 0,
          complianceScore: 0,
          riskLevel: 'low',
        },
        recentActivity: [],
      };
    }
  }

  /**
   * Get predictive insights for a facility
   */
  static async getPredictiveInsights(facilityId: string) {
    try {
      return await BIFailurePredictiveService.getPredictiveInsights(facilityId);
    } catch (error) {
      console.error('Error getting predictive insights:', error);
      // Return fallback data if service fails
      return {
        facilityId,
        riskLevel: 'low',
        predictedIncidents: 0,
        recommendations: [],
        confidence: 0.8,
        riskFactors: [],
        trendAnalysis: {
          incidentTrend: 'stable',
          riskTrend: 'stable',
          confidence: 0.5,
          nextWeekPrediction: 0,
          nextMonthPrediction: 0,
        },
        seasonalPatterns: [],
      };
    }
  }
}
