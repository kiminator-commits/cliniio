import { AnalyticsConfig } from './types';
import { AnalyticsConfigService } from './config';
import { AnalyticsProviderService } from './providers';
import { AnalyticsTrackingService } from './tracking';

// Core analytics services for forecasting intelligence
export { AnalyticsDataService } from './analyticsDataService';
export { SterilizationAnalyticsService } from './sterilizationAnalyticsService';
export { InventoryAnalyticsService } from './inventoryAnalyticsService';
export { EnvironmentalAnalyticsService } from './environmentalAnalyticsService';
export { UserEngagementAnalyticsService } from './userEngagementAnalyticsService';

// Forecasting intelligence service
export { ForecastingAnalyticsService } from './forecastingAnalyticsService';

// NEW: Advanced intelligence services
export { IntelligenceRecommendationService } from './intelligenceRecommendationService';
export { IntelligenceIntegrationService } from './intelligenceIntegrationService';

// Core analytics types for forecasting intelligence
export type {
  AnalyticsTimeframe,
  AnalyticsFilters,
  BaseAnalyticsResponse,
  SterilizationAnalyticsData,
  InventoryAnalyticsData,
  EnvironmentalAnalyticsData,
  UserEngagementData,
} from './analyticsDataService';

// Forecasting intelligence types
export type {
  ToolReplacementForecast,
  AutoclaveCapacityForecast,
  InventoryInflationForecast,
  ClinicalStaffingForecast,
  AdminStaffingForecast,
  TheftLossEstimate,
  SupplyDepletionForecast,
  ToolTurnoverUtilization,
  AuditRiskScore,
  TrainingKnowledgeGaps,
  EfficiencyROITracker,
  IntelligenceSummary,
} from '../../types/forecastingAnalyticsTypes';

// NEW: Advanced intelligence types
export type {
  IntelligenceRecommendation,
  OptimizationTip,
  RiskAlert,
} from '../../types/intelligenceRecommendationTypes';

export type {
  KnowledgeHubIntegration,
  SupplierIntegration,
  AuditTrailIntegration,
  IntegrationMetrics,
} from './intelligenceIntegrationService';

export type {
  SterilizationCycleData,
  SterilizationTrendData,
  EquipmentPerformanceData,
  BIAnalyticsData,
  SterilizationEfficiencyMetrics,
} from './sterilizationAnalyticsService';

export type {
  InventoryItemAnalytics,
  InventoryTrendData,
  CategoryAnalytics,
  SupplierAnalytics,
  InventoryEfficiencyMetrics,
} from './inventoryAnalyticsService';

export type {
  CleaningSessionData,
  CleaningTrendData,
  ProtocolAnalytics,
  RoomAnalytics,
  ComplianceMetrics,
} from './environmentalAnalyticsService';

export type {
  UserActivityData,
  UserEngagementTrendData,
  TaskAnalytics,
  PerformanceMetrics,
  LeaderboardEntry,
} from './userEngagementAnalyticsService';

/**
 * Analytics Service for tracking and configuration.
 * This service orchestrates interactions with various analytics providers (e.g., Google Analytics, Mixpanel, Amplitude)
 * and handles event tracking, user identification, and configuration management.
 */
export class AnalyticsService {
  private static isInitialized = false;

  /**
   * Initialize all analytics providers.
   * This method should be called once when the application starts.
   */
  static async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    try {
      const config = AnalyticsConfigService.getConfig();
      await AnalyticsProviderService.initialize(config);
      this.isInitialized = true;
      console.log('Analytics Service initialized successfully.');
    } catch (error) {
      console.error('Failed to initialize Analytics Service:', error);
    }
  }

  /**
   * Track a custom event.
   */
  static async trackEvent(
    name: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    try {
      // Track with Supabase
      await AnalyticsTrackingService.trackEvent(
        name,
        properties,
        userId,
        facilityId
      );

      // Track with external providers
      const config = AnalyticsConfigService.getConfig();
      await AnalyticsProviderService.trackEvent(
        name,
        properties,
        userId,
        facilityId,
        config
      );
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }

  /**
   * Track a page view.
   */
  static async trackPageView(
    page: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    await this.trackEvent(
      'page_view',
      { page, ...properties },
      userId,
      facilityId
    );
  }

  /**
   * Track a user action.
   */
  static async trackUserAction(
    action: string,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    await this.trackEvent(
      'user_action',
      { action, ...properties },
      userId,
      facilityId
    );
  }

  /**
   * Track error
   */
  static async trackError(
    error: Error,
    context?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    await this.trackEvent(
      'error',
      {
        message: error.message,
        stack: error.stack,
        ...context,
      },
      userId,
      facilityId
    );
  }

  /**
   * Track performance metric
   */
  static async trackPerformance(
    metric: string,
    value: number,
    properties?: Record<string, unknown>,
    userId?: string,
    facilityId?: string
  ): Promise<void> {
    await this.trackEvent(
      'performance',
      {
        metric,
        value,
        ...properties,
      },
      userId,
      facilityId
    );
  }

  /**
   * Get current analytics configuration.
   */
  static getConfig(): AnalyticsConfig {
    return AnalyticsConfigService.getConfig();
  }

  /**
   * Update analytics configuration.
   */
  static async updateConfig(config: Partial<AnalyticsConfig>): Promise<void> {
    await AnalyticsConfigService.updateConfig(config);
  }

  /**
   * Reset analytics service
   */
  static reset(): void {
    this.isInitialized = false;
    // Reset individual services if they have reset methods
    // AnalyticsConfigService.reset();
    // AnalyticsProviderService.reset();
    // AnalyticsTrackingService.reset();
  }
}

// Export convenience functions for backward compatibility
export const trackEvent = AnalyticsService.trackEvent.bind(AnalyticsService);
export const trackPageView =
  AnalyticsService.trackPageView.bind(AnalyticsService);
export const trackUserAction =
  AnalyticsService.trackUserAction.bind(AnalyticsService);
export const trackError = AnalyticsService.trackError.bind(AnalyticsService);
export const trackPerformance =
  AnalyticsService.trackPerformance.bind(AnalyticsService);

// Export specific types instead of export * to prevent circular dependencies
export type {
  AnalyticsConfig,
  AnalyticsProvider,
} from './types';

export default AnalyticsService;
