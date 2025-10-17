import { describe, test, expect, it } from 'vitest';
import { BITestCRUDService } from '../../src/services/bi/BITestCRUDService';
import { BIAnalyticsService } from '../../src/services/bi/BIAnalyticsService';
import { BISubscriptionService } from '../../src/services/bi/BISubscriptionService';
import { BIAIService } from '../../src/services/bi/BIAIService';
import { BIFacilityService } from '../../src/services/bi/BIFacilityService';
import { BIWorkflowService } from '../../src/services/biWorkflowService';

describe('BI Services Refactoring', () => {
  describe('API Compatibility', () => {
    it('should maintain all original BIWorkflowService methods', () => {
      // Verify all original methods are still available
      expect(typeof BIWorkflowService.createBITestResult).toBe('function');
      expect(typeof BIWorkflowService.updateBITestResult).toBe('function');
      expect(typeof BIWorkflowService.getBITestResults).toBe('function');
      expect(typeof BIWorkflowService.getBITestResult).toBe('function');
      expect(typeof BIWorkflowService.deleteBITestResult).toBe('function');
      expect(typeof BIWorkflowService.getBIPassRateAnalytics).toBe('function');
      expect(typeof BIWorkflowService.getOperatorPerformance).toBe('function');
      expect(typeof BIWorkflowService.getBITestAnalytics).toBe('function');
      expect(typeof BIWorkflowService.getFacilities).toBe('function');
      expect(typeof BIWorkflowService.getOperators).toBe('function');
      expect(typeof BIWorkflowService.getSterilizationCycles).toBe('function');
      expect(typeof BIWorkflowService.createSterilizationCycle).toBe(
        'function'
      );
      expect(typeof BIWorkflowService.getEquipment).toBe('function');
      expect(typeof BIWorkflowService.getComplianceAudits).toBe('function');
      expect(typeof BIWorkflowService.subscribeToBITestChanges).toBe(
        'function'
      );
      expect(typeof BIWorkflowService.subscribeToCycleChanges).toBe('function');
      expect(typeof BIWorkflowService.getAITrainingData).toBe('function');
      expect(typeof BIWorkflowService.getPredictiveAnalyticsData).toBe(
        'function'
      );
    });

    it('should have modular services with focused responsibilities', () => {
      // Verify CRUD service
      expect(typeof BITestCRUDService.createBITestResult).toBe('function');
      expect(typeof BITestCRUDService.updateBITestResult).toBe('function');
      expect(typeof BITestCRUDService.getBITestResults).toBe('function');
      expect(typeof BITestCRUDService.getBITestResult).toBe('function');
      expect(typeof BITestCRUDService.deleteBITestResult).toBe('function');

      // Verify Analytics service
      expect(typeof BIAnalyticsService.getBIPassRateAnalytics).toBe('function');
      expect(typeof BIAnalyticsService.getOperatorPerformance).toBe('function');
      expect(typeof BIAnalyticsService.getBITestAnalytics).toBe('function');

      // Verify Subscription service
      expect(typeof BISubscriptionService.subscribeToBITestChanges).toBe(
        'function'
      );
      expect(typeof BISubscriptionService.subscribeToCycleChanges).toBe(
        'function'
      );

      // Verify AI service
      expect(typeof BIAIService.getAITrainingData).toBe('function');
      expect(typeof BIAIService.getPredictiveAnalyticsData).toBe('function');

      // Verify Facility service
      expect(typeof BIFacilityService.getFacilities).toBe('function');
      expect(typeof BIFacilityService.getOperators).toBe('function');
      expect(typeof BIFacilityService.getSterilizationCycles).toBe('function');
      expect(typeof BIFacilityService.createSterilizationCycle).toBe(
        'function'
      );
      expect(typeof BIFacilityService.getEquipment).toBe('function');
      expect(typeof BIFacilityService.getComplianceAudits).toBe('function');
    });
  });

  describe('Service Architecture', () => {
    it('should have single responsibility principle applied', () => {
      // BITestCRUDService should only handle CRUD operations
      const crudMethods = Object.getOwnPropertyNames(BITestCRUDService).filter(
        (name) =>
          typeof BITestCRUDService[name as keyof typeof BITestCRUDService] ===
          'function'
      );

      expect(crudMethods).toContain('createBITestResult');
      expect(crudMethods).toContain('updateBITestResult');
      expect(crudMethods).toContain('getBITestResults');
      expect(crudMethods).toContain('getBITestResult');
      expect(crudMethods).toContain('deleteBITestResult');

      // BIAnalyticsService should only handle analytics
      const analyticsMethods = Object.getOwnPropertyNames(
        BIAnalyticsService
      ).filter(
        (name) =>
          typeof BIAnalyticsService[name as keyof typeof BIAnalyticsService] ===
          'function'
      );

      expect(analyticsMethods).toContain('getBIPassRateAnalytics');
      expect(analyticsMethods).toContain('getOperatorPerformance');
      expect(analyticsMethods).toContain('getBITestAnalytics');

      // BISubscriptionService should only handle subscriptions
      const subscriptionMethods = Object.getOwnPropertyNames(
        BISubscriptionService
      ).filter(
        (name) =>
          typeof BISubscriptionService[
            name as keyof typeof BISubscriptionService
          ] === 'function'
      );

      expect(subscriptionMethods).toContain('subscribeToBITestChanges');
      expect(subscriptionMethods).toContain('subscribeToCycleChanges');
    });
  });
});
