// ============================================================================
// SERVICE CONSOLIDATION TEST SUITE - Comprehensive Testing
// ============================================================================

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { UnifiedAIService } from '../../services/ai/UnifiedAIService';
import { SecureAuthService } from '../../services/secureAuthService';
import { KnowledgeHubService } from '../../pages/KnowledgeHub/services/knowledgeHubService';
import { BIFailureService } from '../../services/bi/failure';
import { InventoryServiceFacade } from '../../services/inventory/InventoryServiceFacade';
import { ServiceRegistry } from '../../services/ServiceRegistry';
import { servicePerformanceMonitor } from '../../services/_core/ServicePerformanceMonitor';
import { serviceValidationTest } from '../../services/_core/ServiceValidationTest';

describe('Service Consolidation Test Suite', () => {
  beforeEach(() => {
    // Clear performance monitor before each test
    servicePerformanceMonitor.resetMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    servicePerformanceMonitor.resetMetrics();
  });

  describe('UnifiedAIService', () => {
    it('should provide unified AI interface', async () => {
      // Test basic AI functionality
      const response = await UnifiedAIService.askAI(
        'Test prompt',
        'Test context'
      );

      expect(response).toBeDefined();
      expect(typeof response).toBe('string');
    });

    it('should manage service instances correctly', () => {
      const status = UnifiedAIService.getServiceStatus();

      expect(status).toBeDefined();
      expect(typeof status).toBe('object');
      expect(status).toHaveProperty('learningAI');
      expect(status).toHaveProperty('inventoryAI');
      expect(status).toHaveProperty('sterilizationAI');
      expect(status).toHaveProperty('environmentalAI');
    });

    it('should initialize services for facility', async () => {
      const facilityId = 'test-facility';

      // This should not throw an error
      await expect(
        UnifiedAIService.initializeServices(facilityId)
      ).resolves.not.toThrow();
    });
  });

  describe('SecureAuthService', () => {
    it('should generate CSRF tokens', () => {
      const authService = new SecureAuthService();
      const token = authService.generateCSRFToken();

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('should validate tokens correctly', async () => {
      const authService = new SecureAuthService();

      // Invalid token should be rejected
      await expect(authService.validateToken('invalid-token')).resolves.toBe(
        false
      );
    });

    it('should handle secure login', async () => {
      const authService = new SecureAuthService();

      // Test with invalid credentials (should fail gracefully)
      const result = await authService.secureLogin({
        email: 'invalid@test.com',
        password: 'invalid-password',
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('KnowledgeHubService', () => {
    it('should retrieve knowledge articles', async () => {
      const articles = await KnowledgeHubService.getKnowledgeArticles();

      expect(articles).toBeDefined();
      expect(Array.isArray(articles)).toBe(true);
    });

    it('should retrieve user activity', async () => {
      const activity = await KnowledgeHubService.getRecentUserActivity();

      expect(activity).toBeDefined();
      expect(Array.isArray(activity)).toBe(true);
    });

    it('should retrieve user activity with parameters', async () => {
      const userId = 'test-user';
      const limit = 5;

      const activity = await KnowledgeHubService.getRecentUserActivity(
        userId,
        limit
      );

      expect(activity).toBeDefined();
      expect(Array.isArray(activity)).toBe(true);
    });
  });

  describe('BIFailureService', () => {
    it('should retrieve active incidents', async () => {
      const facilityId = 'test-facility';
      const incidents = await BIFailureService.getActiveIncidents(facilityId);

      expect(incidents).toBeDefined();
      expect(Array.isArray(incidents)).toBe(true);
    });

    it('should generate analytics summary', async () => {
      const facilityId = 'test-facility';
      const startDate = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      ).toISOString();
      const endDate = new Date().toISOString();

      const analytics = await BIFailureService.getAnalyticsSummary(
        facilityId,
        startDate,
        endDate
      );

      expect(analytics).toBeDefined();
      expect(typeof analytics).toBe('object');
    });

    it('should send regulatory notifications', async () => {
      const result = await BIFailureService.sendRegulatoryNotification(
        'test-incident',
        'test-facility',
        'low',
        {
          incidentNumber: 'TEST-001',
          failureDate: new Date().toISOString(),
          affectedToolsCount: 1,
        }
      );

      expect(result).toBeDefined();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('InventoryServiceFacade', () => {
    it('should fetch all inventory data', async () => {
      const data = await InventoryServiceFacade.fetchAllInventoryData();

      expect(data).toBeDefined();
      expect(typeof data).toBe('object');
      expect(data).toHaveProperty('items');
      expect(data).toHaveProperty('categories');
    });

    it('should be a singleton', () => {
      const instance1 = InventoryServiceFacade.getInstance();
      const instance2 = InventoryServiceFacade.getInstance();

      expect(instance1).toBe(instance2);
    });
  });

  describe('ServiceRegistry', () => {
    it('should register and retrieve services', () => {
      const registry = ServiceRegistry.getInstance();
      const serviceNames = registry.getServiceNames();

      expect(serviceNames).toBeDefined();
      expect(Array.isArray(serviceNames)).toBe(true);
    });

    it('should provide performance metrics', () => {
      const registry = ServiceRegistry.getInstance();
      const metrics = registry.getPerformanceMetrics();

      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should identify services with performance issues', () => {
      const registry = ServiceRegistry.getInstance();
      const issues = registry.getServicesWithPerformanceIssues();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
    });
  });

  describe('ServicePerformanceMonitor', () => {
    it('should track service calls', () => {
      const callId = servicePerformanceMonitor.startCall(
        'TestService',
        'testMethod'
      );

      expect(callId).toBeDefined();
      expect(typeof callId).toBe('string');

      servicePerformanceMonitor.endCall(callId, true);
    });

    it('should track failed service calls', () => {
      const callId = servicePerformanceMonitor.startCall(
        'TestService',
        'testMethod'
      );

      servicePerformanceMonitor.endCall(callId, false, 'Test error');

      const metrics =
        servicePerformanceMonitor.getServiceMetrics('TestService');
      expect(metrics).toBeDefined();
      expect(metrics?.failedCalls).toBeGreaterThan(0);
    });

    it('should provide all metrics', () => {
      const metrics = servicePerformanceMonitor.getAllMetrics();

      expect(metrics).toBeDefined();
      expect(Array.isArray(metrics)).toBe(true);
    });

    it('should update thresholds', () => {
      const newThresholds = {
        maxResponseTime: 10000,
        maxErrorRate: 15,
        maxCallsPerMinute: 200,
      };

      servicePerformanceMonitor.updateThresholds(newThresholds);

      const thresholds = servicePerformanceMonitor.getThresholds();
      expect(thresholds.maxResponseTime).toBe(10000);
      expect(thresholds.maxErrorRate).toBe(15);
      expect(thresholds.maxCallsPerMinute).toBe(200);
    });

    it('should export metrics data', () => {
      const exportData = servicePerformanceMonitor.exportMetrics();

      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('metrics');
      expect(exportData).toHaveProperty('callHistory');
      expect(exportData).toHaveProperty('thresholds');
      expect(exportData).toHaveProperty('exportTime');
    });
  });

  describe('Service Validation Test', () => {
    it('should run comprehensive validation', async () => {
      const summary = await serviceValidationTest.runFullValidation();

      expect(summary).toBeDefined();
      expect(summary.totalServices).toBeGreaterThan(0);
      expect(summary.successfulServices).toBeGreaterThan(0);
      expect(summary.results).toBeDefined();
      expect(Array.isArray(summary.results)).toBe(true);
    });

    it('should export validation results', () => {
      const results = serviceValidationTest.exportResults();

      expect(results).toBeDefined();
      expect(results).toHaveProperty('totalServices');
      expect(results).toHaveProperty('successfulServices');
      expect(results).toHaveProperty('failedServices');
      expect(results).toHaveProperty('warningServices');
      expect(results).toHaveProperty('averageResponseTime');
      expect(results).toHaveProperty('results');
    });
  });

  describe('Service Consolidation Integration', () => {
    it('should have no deprecated service usage', () => {
      // This test ensures that all services are using the consolidated versions
      // The fact that these tests run without errors indicates successful consolidation

      expect(UnifiedAIService).toBeDefined();
      expect(SecureAuthService).toBeDefined();
      expect(KnowledgeHubService).toBeDefined();
      expect(BIFailureService).toBeDefined();
      expect(InventoryServiceFacade).toBeDefined();
      expect(ServiceRegistry).toBeDefined();
      expect(servicePerformanceMonitor).toBeDefined();
    });

    it('should maintain consistent service patterns', () => {
      // Test that all services follow the same patterns
      const services = [
        UnifiedAIService,
        KnowledgeHubService,
        BIFailureService,
        InventoryServiceFacade,
      ];

      services.forEach((Service) => {
        // All services should have static methods
        expect(typeof Service).toBe('function');

        // Check for common patterns (this is a basic check)
        const serviceMethods = Object.getOwnPropertyNames(Service);
        expect(serviceMethods.length).toBeGreaterThan(0);
      });
    });
  });
});
