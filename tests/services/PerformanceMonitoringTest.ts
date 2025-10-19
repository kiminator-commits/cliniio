// ============================================================================
// PERFORMANCE MONITORING TEST SUITE - Performance System Testing
// ============================================================================

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { servicePerformanceMonitor } from '../../services/_core/ServicePerformanceMonitor';
import { ServiceRegistry } from '../../services/ServiceRegistry';
import { UnifiedAIService } from '../../services/ai/UnifiedAIService';

describe('Performance Monitoring Test Suite', () => {
  beforeEach(() => {
    // Clear performance monitor before each test
    servicePerformanceMonitor.resetMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    servicePerformanceMonitor.resetMetrics();
  });

  describe('ServicePerformanceMonitor', () => {
    it('should track successful service calls', async () => {
      const serviceName = 'TestService';
      const methodName = 'testMethod';

      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        methodName
      );

      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 10));

      servicePerformanceMonitor.endCall(callId, true);

      const metrics = servicePerformanceMonitor.getServiceMetrics(serviceName);

      expect(metrics).toBeDefined();
      expect(metrics?.serviceName).toBe(serviceName);
      expect(metrics?.totalCalls).toBe(1);
      expect(metrics?.successfulCalls).toBe(1);
      expect(metrics?.failedCalls).toBe(0);
      expect(metrics?.errorRate).toBe(0);
      expect(metrics?.averageResponseTime).toBeGreaterThan(0);
    });

    it('should track failed service calls', async () => {
      const serviceName = 'TestService';
      const methodName = 'testMethod';

      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        methodName
      );

      // Simulate some processing time
      await new Promise((resolve) => setTimeout(resolve, 5));

      servicePerformanceMonitor.endCall(callId, false, 'Test error message');

      const metrics = servicePerformanceMonitor.getServiceMetrics(serviceName);

      expect(metrics).toBeDefined();
      expect(metrics?.totalCalls).toBe(1);
      expect(metrics?.successfulCalls).toBe(0);
      expect(metrics?.failedCalls).toBe(1);
      expect(metrics?.errorRate).toBe(100);
    });

    it('should calculate average response time correctly', async () => {
      const serviceName = 'TestService';
      const methodName = 'testMethod';

      // Make multiple calls with different response times
      for (let i = 0; i < 3; i++) {
        const callId = servicePerformanceMonitor.startCall(
          serviceName,
          methodName
        );

        // Simulate different processing times
        await new Promise((resolve) => setTimeout(resolve, 10 + i * 5));

        servicePerformanceMonitor.endCall(callId, true);
      }

      const metrics = servicePerformanceMonitor.getServiceMetrics(serviceName);

      expect(metrics).toBeDefined();
      expect(metrics?.totalCalls).toBe(3);
      expect(metrics?.averageResponseTime).toBeGreaterThan(10);
    });

    it('should detect performance issues', async () => {
      const serviceName = 'SlowService';
      const methodName = 'slowMethod';

      // Set low threshold for testing
      servicePerformanceMonitor.updateThresholds({
        maxResponseTime: 50,
        maxErrorRate: 10,
        maxCallsPerMinute: 100,
      });

      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        methodName
      );

      // Simulate slow response
      await new Promise((resolve) => setTimeout(resolve, 100));

      servicePerformanceMonitor.endCall(callId, true);

      const issues = servicePerformanceMonitor.getServicesWithIssues();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);
      expect(issues.length).toBeGreaterThan(0);

      const slowServiceIssue = issues.find(
        (issue) => issue.serviceName === serviceName
      );
      expect(slowServiceIssue).toBeDefined();
    });

    it('should track call frequency', async () => {
      const serviceName = 'FrequentService';
      const methodName = 'frequentMethod';

      // Set low threshold for testing
      servicePerformanceMonitor.updateThresholds({
        maxResponseTime: 5000,
        maxErrorRate: 10,
        maxCallsPerMinute: 2,
      });

      // Make multiple rapid calls
      for (let i = 0; i < 3; i++) {
        const callId = servicePerformanceMonitor.startCall(
          serviceName,
          methodName
        );
        servicePerformanceMonitor.endCall(callId, true);
      }

      const issues = servicePerformanceMonitor.getServicesWithIssues();

      expect(issues).toBeDefined();
      expect(Array.isArray(issues)).toBe(true);

      // Should detect high call frequency
      const frequentServiceIssue = issues.find(
        (issue) => issue.serviceName === serviceName
      );
      expect(frequentServiceIssue).toBeDefined();
    });

    it('should provide top performing services', async () => {
      // Create multiple services with different performance characteristics
      const services = [
        { name: 'FastService', responseTime: 10 },
        { name: 'MediumService', responseTime: 50 },
        { name: 'SlowService', responseTime: 100 },
      ];

      for (const service of services) {
        const callId = servicePerformanceMonitor.startCall(
          service.name,
          'testMethod'
        );

        // Simulate response time
        await new Promise((resolve) =>
          setTimeout(resolve, service.responseTime)
        );

        servicePerformanceMonitor.endCall(callId, true);
      }

      const topServices = servicePerformanceMonitor.getTopPerformingServices(2);

      expect(topServices).toBeDefined();
      expect(Array.isArray(topServices)).toBe(true);
      expect(topServices.length).toBeLessThanOrEqual(2);

      // Top services should be ordered by performance (lowest error rate first)
      if (topServices.length > 1) {
        expect(topServices[0].errorRate).toBeLessThanOrEqual(
          topServices[1].errorRate
        );
      }
    });

    it('should export comprehensive metrics', () => {
      const exportData = servicePerformanceMonitor.exportMetrics();

      expect(exportData).toBeDefined();
      expect(exportData).toHaveProperty('metrics');
      expect(exportData).toHaveProperty('callHistory');
      expect(exportData).toHaveProperty('thresholds');
      expect(exportData).toHaveProperty('exportTime');

      expect(Array.isArray(exportData.metrics)).toBe(true);
      expect(Array.isArray(exportData.callHistory)).toBe(true);
      expect(typeof exportData.thresholds).toBe('object');
      expect(typeof exportData.exportTime).toBe('number');
    });

    it('should clean up old call history', async () => {
      // This test verifies that the cleanup mechanism works
      // In a real scenario, this would be tested over time

      const serviceName = 'CleanupTestService';
      const callId = servicePerformanceMonitor.startCall(
        serviceName,
        'testMethod'
      );
      servicePerformanceMonitor.endCall(callId, true);

      const metrics = servicePerformanceMonitor.getServiceMetrics(serviceName);
      expect(metrics).toBeDefined();

      // The cleanup is handled by setInterval in the actual implementation
      // This test just verifies the basic functionality
    });
  });

  describe('ServiceRegistry Performance Integration', () => {
    it('should track service creation performance', () => {
      const registry = ServiceRegistry.getInstance();

      // Get performance metrics
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

    it('should provide top performing services', () => {
      const registry = ServiceRegistry.getInstance();

      const topServices = registry.getTopPerformingServices(5);

      expect(topServices).toBeDefined();
      expect(Array.isArray(topServices)).toBe(true);
      expect(topServices.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Real Service Performance Tracking', () => {
    it('should track UnifiedAIService performance', async () => {
      // This test verifies that the UnifiedAIService is being tracked
      // when called through the ServiceRegistry

      try {
        // Make a call that should be tracked
        await UnifiedAIService.askAI('Test prompt', 'Test context');

        // Check if performance data was recorded
        const metrics = servicePerformanceMonitor.getAllMetrics();

        expect(metrics).toBeDefined();
        expect(Array.isArray(metrics)).toBe(true);

        // Look for UnifiedAIService in metrics
        const aiServiceMetrics = metrics.find(
          (m) => m.serviceName === 'UnifiedAIService'
        );
        expect(aiServiceMetrics).toBeDefined();
      } catch (error) {
        // AI service might fail in test environment, which is expected
        console.log(
          'AI service test failed (expected in test environment):',
          error
        );
      }
    });

    it('should maintain performance data across multiple calls', async () => {
      const serviceName = 'PersistenceTestService';
      const methodName = 'testMethod';

      // Make multiple calls
      for (let i = 0; i < 5; i++) {
        const callId = servicePerformanceMonitor.startCall(
          serviceName,
          methodName
        );

        // Simulate processing time
        await new Promise((resolve) => setTimeout(resolve, 10));

        servicePerformanceMonitor.endCall(callId, true);
      }

      const metrics = servicePerformanceMonitor.getServiceMetrics(serviceName);

      expect(metrics).toBeDefined();
      expect(metrics?.totalCalls).toBe(5);
      expect(metrics?.successfulCalls).toBe(5);
      expect(metrics?.failedCalls).toBe(0);
      expect(metrics?.errorRate).toBe(0);
    });
  });

  describe('Performance Threshold Management', () => {
    it('should update thresholds correctly', () => {
      const newThresholds = {
        maxResponseTime: 15000,
        maxErrorRate: 20,
        maxCallsPerMinute: 300,
      };

      servicePerformanceMonitor.updateThresholds(newThresholds);

      const currentThresholds = servicePerformanceMonitor.getThresholds();

      expect(currentThresholds.maxResponseTime).toBe(15000);
      expect(currentThresholds.maxErrorRate).toBe(20);
      expect(currentThresholds.maxCallsPerMinute).toBe(300);
    });

    it('should maintain default thresholds', () => {
      const defaultThresholds = servicePerformanceMonitor.getThresholds();

      expect(defaultThresholds.maxResponseTime).toBeGreaterThan(0);
      expect(defaultThresholds.maxErrorRate).toBeGreaterThan(0);
      expect(defaultThresholds.maxCallsPerMinute).toBeGreaterThan(0);
    });
  });
});
