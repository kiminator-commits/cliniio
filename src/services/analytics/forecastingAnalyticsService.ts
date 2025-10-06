import { AnalyticsFilters } from './analyticsDataService';
import {
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
} from '../../types/forecastingAnalyticsTypes';
import type { IntelligenceSummary } from '../../types/forecastingAnalyticsTypes';
import { DEFAULT_CACHE_TTL } from './forecastingAnalyticsConfig';

// Import sub-services
import {
  toolReplacementForecastService as ToolReplacementForecastService,
  autoclaveCapacityForecastService as AutoclaveCapacityForecastService,
  inventoryInflationForecastService as InventoryInflationForecastService,
  clinicalStaffingForecastService as ClinicalStaffingForecastService,
  adminStaffingForecastService as AdminStaffingForecastService,
  theftLossForecastService as TheftLossForecastService,
  supplyDepletionForecastService as SupplyDepletionForecastService,
  efficiencyRoiForecastService as EfficiencyRoiForecastService,
  sterilizationMetricsService as SterilizationMetricsService,
  auditRiskForecastService as AuditRiskForecastService,
} from './forecasting';

export class ForecastingAnalyticsService {
  private static instance: ForecastingAnalyticsService;
  private cache: Map<
    string,
    { data: unknown; timestamp: number; ttl: number }
  > = new Map();
  private readonly DEFAULT_CACHE_TTL = DEFAULT_CACHE_TTL;

  private constructor() {}

  static getInstance(): ForecastingAnalyticsService {
    if (!ForecastingAnalyticsService.instance) {
      ForecastingAnalyticsService.instance = new ForecastingAnalyticsService();
    }
    return ForecastingAnalyticsService.instance;
  }

  /**
   * 🔧 Tool Replacement Forecast
   * Predict average lifecycle of tools based on cleaning cycles + BI/CI failure correlation
   */
  async getToolReplacementForecast(
    filters: AnalyticsFilters = {}
  ): Promise<ToolReplacementForecast[]> {
    return ToolReplacementForecastService.getInstance().getToolReplacementForecast(
      filters
    );
  }

  /**
   * ⏰ Autoclave Capacity Planning
   * Queue length trends, peak hours, overload predictions
   */
  async getAutoclaveCapacityForecast(
    filters: AnalyticsFilters = {}
  ): Promise<AutoclaveCapacityForecast[]> {
    return AutoclaveCapacityForecastService.getInstance().getAutoclaveCapacityForecast(
      filters
    );
  }

  /**
   * 💸 Inventory Inflation Trend
   * Price delta by category, supplier trends, regional inflation
   */
  async getInventoryInflationForecast(
    filters: AnalyticsFilters = {}
  ): Promise<InventoryInflationForecast[]> {
    return InventoryInflationForecastService.getInstance().getInventoryInflationForecast(
      filters
    );
  }

  /**
   * 👩‍⚕️ Clinical Staffing Forecast
   * Missed cleanings, time-to-task trends, tool backlog after hours
   */
  async getClinicalStaffingForecast(
    filters: AnalyticsFilters = {}
  ): Promise<ClinicalStaffingForecast[]> {
    return ClinicalStaffingForecastService.getInstance().getClinicalStaffingForecast(
      filters
    );
  }

  /**
   * 📊 Admin Staffing Forecast
   * Audit log volume, expired tasks, user onboarding errors
   */
  async getAdminStaffingForecast(
    filters: AnalyticsFilters = {}
  ): Promise<AdminStaffingForecast[]> {
    return AdminStaffingForecastService.getInstance().getAdminStaffingForecast(
      filters
    );
  }

  /**
   * 🕵️ Theft / Loss Estimation
   * Scanned tool mismatch, rapid depletion without log match, non-standard hours usage
   */
  async getTheftLossEstimate(
    filters: AnalyticsFilters = {}
  ): Promise<TheftLossEstimate> {
    return TheftLossForecastService.getInstance().getTheftLossEstimate(filters);
  }

  /**
   * 🔮 Supply Depletion Forecast
   * Usage trend vs. stock, reorder window, supplier delay
   */
  async getSupplyDepletionForecast(
    filters: AnalyticsFilters = {}
  ): Promise<SupplyDepletionForecast[]> {
    return SupplyDepletionForecastService.getInstance().getSupplyDepletionForecast(
      filters
    );
  }

  /**
   * 🔄 Tool Turnover & Utilization Analysis
   * Track tool usage frequency, daily cycle counts, and utilization patterns
   */
  async getToolTurnoverUtilization(
    filters: AnalyticsFilters = {}
  ): Promise<ToolTurnoverUtilization[]> {
    return SterilizationMetricsService.getInstance().getToolTurnoverUtilization(
      filters
    );
  }

  /**
   * 🚨 Audit Risk Score
   * Missed indicators, skipped steps, no tool logs, policy drift
   */
  async getAuditRiskScore(
    filters: AnalyticsFilters = {}
  ): Promise<AuditRiskScore | null> {
    return AuditRiskForecastService.getInstance().getAuditRiskScore(filters);
  }

  /**
   * 📚 Training & Knowledge Gaps
   * Course engagement vs. errors, unread policies, failed quiz attempts
   */
  async getTrainingKnowledgeGaps(
    filters: AnalyticsFilters = {}
  ): Promise<TrainingKnowledgeGaps | null> {
    return AuditRiskForecastService.getInstance().getTrainingKnowledgeGaps(
      filters
    );
  }

  /**
   * 💰 Efficiency & ROI Tracker
   * Time saved per module, AI feature usage, automation vs. manual
   */
  async getEfficiencyROITracker(
    filters: AnalyticsFilters = {}
  ): Promise<EfficiencyROITracker | null> {
    return EfficiencyRoiForecastService.getInstance().getEfficiencyROITracker(
      filters
    );
  }

  /**
   * 🧠 Get comprehensive intelligence summary
   * All forecasting metrics in one call
   */
  async getIntelligenceSummary(
    filters: AnalyticsFilters = {},
    forceRefresh = false
  ): Promise<IntelligenceSummary> {
    try {
      const cacheKey = `intelligence_summary_${JSON.stringify(filters)}`;

      // Clear cache if force refresh is requested
      if (forceRefresh) {
        this.clearCache('intelligence_summary');
      }

      const cached = this.getCachedData<IntelligenceSummary>(cacheKey);
      if (cached && !forceRefresh) return cached;

      const [
        toolReplacement,
        autoclaveCapacity,
        inventoryInflation,
        clinicalStaffingArray,
        adminStaffingArray,
        theftLoss,
        supplyDepletion,
        toolTurnoverUtilization,
        auditRisk,
        trainingGaps,
        efficiencyROI,
        sterilizationMetrics,
        inventoryMetrics,
      ] = await Promise.all([
        this.getToolReplacementForecast(filters),
        this.getAutoclaveCapacityForecast(filters),
        this.getInventoryInflationForecast(filters),
        this.getClinicalStaffingForecast(filters),
        this.getAdminStaffingForecast(filters),
        this.getTheftLossEstimate(filters),
        this.getSupplyDepletionForecast(filters),
        this.getToolTurnoverUtilization(filters),
        this.getAuditRiskScore(filters),
        this.getTrainingKnowledgeGaps(filters),
        this.getEfficiencyROITracker(filters),
        SterilizationMetricsService.getInstance().getSterilizationMetrics(
          filters
        ),
        SterilizationMetricsService.getInstance().getInventoryMetrics(filters),
      ]);

      // Extract first item from arrays for single object fields
      const clinicalStaffing = clinicalStaffingArray[0] || null;
      const adminStaffing = adminStaffingArray[0] || null;

      const summary: IntelligenceSummary = {
        toolReplacement,
        autoclaveCapacity,
        inventoryInflation,
        clinicalStaffing,
        adminStaffing,
        theftLoss,
        supplyDepletion,
        toolTurnoverUtilization,
        auditRisk: auditRisk || {
          overallRiskScore: 0,
          riskLevel: 'low' as const,
          riskFactors: [],
          skippedIndicators: 0,
          incompleteCycles: 0,
          policyDrift: 0,
          recommendedActions: [],
        },
        trainingGaps: trainingGaps || {
          usersWithGaps: [],
          overallGapScore: 0,
          criticalGaps: [],
          knowledgeHubRecommendations: [],
        },
        efficiencyROI: efficiencyROI || {
          timeSavedHours: 0,
          estimatedLaborSavings: 0,
          aiFeatureUsage: [],
          automationEfficiency: 0,
          moduleContributions: [],
          projectedAnnualSavings: 0,
        },
        sterilization: sterilizationMetrics,
        inventory: inventoryMetrics,
        lastUpdated: new Date().toISOString(),
        confidence: 0.89,
      };

      this.setCachedData(cacheKey, summary);
      return summary;
    } catch (error) {
      console.error('Error generating intelligence summary:', error);
      throw error;
    }
  }

  /**
   * Clear cache for specific intelligence module or all modules
   */
  clearCache(module?: string): void {
    if (module) {
      const keysToDelete = Array.from(this.cache.keys()).filter((key) =>
        key.startsWith(module)
      );
      keysToDelete.forEach((key) => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    this.cache.delete(key);
    return null;
  }

  private setCachedData(
    key: string,
    data: unknown,
    ttl: number = this.DEFAULT_CACHE_TTL
  ): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }
}

export default ForecastingAnalyticsService;

// Re-export types for convenience
export type { IntelligenceSummary } from '../../types/forecastingAnalyticsTypes';
