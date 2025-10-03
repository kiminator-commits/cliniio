import { BITestService } from './bi/BITestService';
import { BIAnalyticsService } from './bi/BIAnalyticsService';
import { BIFacilityCycleService } from './bi/BIFacilityCycleService';
import { BISubscriptionService } from './bi/BISubscriptionService';

/**
 * BI Workflow Service - Facade for all BI operations
 * This service delegates to specialized services for better organization
 */
export class BIWorkflowService {
  // ========================================
  // BI TEST RESULTS MANAGEMENT
  // ========================================

  static createBITestResult = BITestService.createBITestResult;
  static updateBITestResult = BITestService.updateBITestResult;
  static getBITestResults = BITestService.getBITestResults;
  static getBITestResult = BITestService.getBITestResult;
  static deleteBITestResult = BITestService.deleteBITestResult;

  // ========================================
  // ANALYTICS AND REPORTING
  // ========================================

  static getBIPassRateAnalytics = BIAnalyticsService.getBIPassRateAnalytics;
  static getOperatorPerformance = BIAnalyticsService.getOperatorPerformance;
  static getBITestAnalytics = BIAnalyticsService.getBITestAnalytics;
  static getAITrainingData = BIAnalyticsService.getAITrainingData;
  static getPredictiveAnalyticsData =
    BIAnalyticsService.getPredictiveAnalyticsData;

  // ========================================
  // FACILITY AND OPERATOR MANAGEMENT
  // ========================================

  static getFacilities = BIFacilityCycleService.getFacilities;
  static getOperators = BIFacilityCycleService.getOperators;

  // ========================================
  // STERILIZATION CYCLES
  // ========================================

  static getSterilizationCycles = BIFacilityCycleService.getSterilizationCycles;
  static createSterilizationCycle =
    BIFacilityCycleService.createSterilizationCycle;

  // ========================================
  // EQUIPMENT MANAGEMENT
  // ========================================

  static getEquipment = BIFacilityCycleService.getEquipment;

  // ========================================
  // COMPLIANCE AUDITS
  // ========================================

  static getComplianceAudits = BIFacilityCycleService.getComplianceAudits;

  // ========================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================

  static subscribeToBITestChanges = BISubscriptionService.subscribeToBITestChanges;
  static subscribeToCycleChanges = BISubscriptionService.subscribeToCycleChanges;
}
