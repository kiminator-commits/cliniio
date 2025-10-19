// ============================================================================
// SERVICE VALIDATION TEST - Comprehensive Service Testing
// ============================================================================

import { UnifiedAIService } from '../ai/UnifiedAIService';
import { SecureAuthService } from '../secureAuthService';
import { KnowledgeHubService } from '../../pages/KnowledgeHub/services/knowledgeHubService';
import { BIFailureService } from '../bi/failure';
import { inventoryServiceFacade } from '../inventory/InventoryServiceFacade';
import { ServiceRegistry } from '../ServiceRegistry';
import { servicePerformanceMonitor } from './ServicePerformanceMonitor';

interface ValidationResult {
  serviceName: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: unknown;
  responseTime?: number;
}

interface ValidationSummary {
  totalServices: number;
  successfulServices: number;
  failedServices: number;
  warningServices: number;
  averageResponseTime: number;
  results: ValidationResult[];
}

/**
 * Service Validation Test - Comprehensive testing of all consolidated services
 */
export class ServiceValidationTest {
  private static instance: ServiceValidationTest;
  private results: ValidationResult[] = [];

  private constructor() {}

  static getInstance(): ServiceValidationTest {
    if (!ServiceValidationTest.instance) {
      ServiceValidationTest.instance = new ServiceValidationTest();
    }
    return ServiceValidationTest.instance;
  }

  // ============================================================================
  // VALIDATION METHODS
  // ============================================================================

  /**
   * Run comprehensive validation of all services
   */
  async runFullValidation(): Promise<ValidationSummary> {
    console.log(
      '[ServiceValidation] Starting comprehensive service validation...'
    );
    this.results = [];

    const startTime = Date.now();

    // Test all consolidated services
    await Promise.all([
      this.validateUnifiedAIService(),
      this.validateSecureAuthService(),
      this.validateKnowledgeHubService(),
      this.validateBIFailureService(),
      this.validateInventoryService(),
      this.validateServiceRegistry(),
      this.validatePerformanceMonitoring(),
    ]);

    const endTime = Date.now();
    const totalTime = endTime - startTime;

    const summary = this.generateSummary(totalTime);
    this.logResults(summary);

    return summary;
  }

  /**
   * Validate UnifiedAIService
   */
  private async validateUnifiedAIService(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test basic AI functionality
      const response = await UnifiedAIService.askAI(
        'Test prompt for validation',
        {
          module: 'service-validation',
          facilityId: 'unknown',
          userId: 'unknown'
        }
      );

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'UnifiedAIService',
        status: 'success',
        message: 'AI service responding correctly',
        details: { responseLength: response.length },
        responseTime,
      });

      // Test service status
      const status = UnifiedAIService.getServiceStatus();
      this.results.push({
        serviceName: 'UnifiedAIService Status',
        status: 'success',
        message: 'Service status check successful',
        details: status,
      });
    } catch (error) {
      this.results.push({
        serviceName: 'UnifiedAIService',
        status: 'error',
        message: `AI service validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate SecureAuthService
   */
  private async validateSecureAuthService(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test service instantiation
      const authService = new SecureAuthService();

      // Test CSRF token generation
      const csrfToken = authService.generateCSRFToken();

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'SecureAuthService',
        status: 'success',
        message:
          'Auth service instantiation and CSRF token generation successful',
        details: { csrfTokenLength: csrfToken.length },
        responseTime,
      });

      // Test token validation (without actual token)
      try {
        await authService.validateToken('invalid-token');
        this.results.push({
          serviceName: 'SecureAuthService Validation',
          status: 'warning',
          message:
            'Token validation with invalid token should fail but did not',
        });
      } catch {
        this.results.push({
          serviceName: 'SecureAuthService Validation',
          status: 'success',
          message: 'Token validation correctly rejects invalid tokens',
        });
      }
    } catch (error) {
      this.results.push({
        serviceName: 'SecureAuthService',
        status: 'error',
        message: `Auth service validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate KnowledgeHubService
   */
  private async validateKnowledgeHubService(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test knowledge articles retrieval
      const articles = await KnowledgeHubService.getKnowledgeArticles();

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'KnowledgeHubService',
        status: 'success',
        message: 'Knowledge hub service responding correctly',
        details: { articlesCount: articles.length },
        responseTime,
      });

      // Test user activity (with optional parameters)
      const activity = await KnowledgeHubService.getRecentUserActivity();

      this.results.push({
        serviceName: 'KnowledgeHubService Activity',
        status: 'success',
        message: 'User activity retrieval successful',
        details: { activityCount: activity.length },
      });
    } catch (error) {
      this.results.push({
        serviceName: 'KnowledgeHubService',
        status: 'error',
        message: `Knowledge hub service validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate BIFailureService
   */
  private async validateBIFailureService(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test service instantiation and basic methods
      const facilityId = 'test-facility';

      // Test getting active incidents (should return empty array for test facility)
      const incidents = await BIFailureService.getActiveIncidents(facilityId);

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'BIFailureService',
        status: 'success',
        message: 'BI Failure service responding correctly',
        details: { incidentsCount: incidents.length },
        responseTime,
      });

      // Test analytics summary
      const analytics = await BIFailureService.getAnalyticsSummary(
        facilityId,
        '30d'
      );

      this.results.push({
        serviceName: 'BIFailureService Analytics',
        status: 'success',
        message: 'Analytics summary retrieval successful',
        details: analytics,
      });
    } catch (error) {
      this.results.push({
        serviceName: 'BIFailureService',
        status: 'error',
        message: `BI Failure service validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate InventoryService
   */
  private async validateInventoryService(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test inventory service facade
      const inventoryData =
        await inventoryServiceFacade.fetchAllInventoryData();

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'InventoryServiceFacade',
        status: 'success',
        message: 'Inventory service responding correctly',
        details: {
          itemsCount:
            (inventoryData.tools?.length || 0) +
            (inventoryData.supplies?.length || 0) +
            (inventoryData.equipment?.length || 0) +
            (inventoryData.officeHardware?.length || 0),
          categoriesCount: inventoryData.categories?.length || 0,
        },
        responseTime,
      });
    } catch (error) {
      this.results.push({
        serviceName: 'InventoryServiceFacade',
        status: 'error',
        message: `Inventory service validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate ServiceRegistry
   */
  private async validateServiceRegistry(): Promise<void> {
    const startTime = Date.now();

    try {
      const registry = ServiceRegistry.getInstance();

      // Test service registration and retrieval
      const serviceNames = registry.getServiceNames();

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'ServiceRegistry',
        status: 'success',
        message: 'Service registry responding correctly',
        details: { registeredServices: serviceNames },
        responseTime,
      });

      // Test performance metrics
      const metrics = registry.getPerformanceMetrics();

      this.results.push({
        serviceName: 'ServiceRegistry Performance',
        status: 'success',
        message: 'Performance metrics retrieval successful',
        details: { metricsCount: metrics.length },
      });
    } catch (error) {
      this.results.push({
        serviceName: 'ServiceRegistry',
        status: 'error',
        message: `Service registry validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  /**
   * Validate Performance Monitoring
   */
  private async validatePerformanceMonitoring(): Promise<void> {
    const startTime = Date.now();

    try {
      // Test performance monitor
      const allMetrics = servicePerformanceMonitor.getAllMetrics();
      const thresholds = servicePerformanceMonitor.getThresholds();

      const responseTime = Date.now() - startTime;

      this.results.push({
        serviceName: 'ServicePerformanceMonitor',
        status: 'success',
        message: 'Performance monitoring responding correctly',
        details: {
          metricsCount: allMetrics.length,
          thresholds: thresholds,
        },
        responseTime,
      });

      // Test threshold update
      servicePerformanceMonitor.updateThresholds({
        maxResponseTime: 10000,
        maxErrorRate: 15,
      });

      this.results.push({
        serviceName: 'ServicePerformanceMonitor Thresholds',
        status: 'success',
        message: 'Threshold update successful',
      });
    } catch (error) {
      this.results.push({
        serviceName: 'ServicePerformanceMonitor',
        status: 'error',
        message: `Performance monitoring validation failed: ${error instanceof Error ? error.message : String(error)}`,
        responseTime: Date.now() - startTime,
      });
    }
  }

  // ============================================================================
  // SUMMARY AND REPORTING
  // ============================================================================

  /**
   * Generate validation summary
   */
  private generateSummary(_totalTime: number): ValidationSummary {
    const successfulServices = this.results.filter(
      (r) => r.status === 'success'
    ).length;
    const failedServices = this.results.filter(
      (r) => r.status === 'error'
    ).length;
    const warningServices = this.results.filter(
      (r) => r.status === 'warning'
    ).length;

    const responseTimes = this.results
      .filter((r) => r.responseTime !== undefined)
      .map((r) => r.responseTime!);

    const averageResponseTime =
      responseTimes.length > 0
        ? responseTimes.reduce((sum, time) => sum + time, 0) /
          responseTimes.length
        : 0;

    return {
      totalServices: this.results.length,
      successfulServices,
      failedServices,
      warningServices,
      averageResponseTime: Math.round(averageResponseTime),
      results: [...this.results],
    };
  }

  /**
   * Log validation results
   */
  private logResults(summary: ValidationSummary): void {
    console.log(
      '\n[ServiceValidation] ==========================================='
    );
    console.log('[ServiceValidation] SERVICE VALIDATION SUMMARY');
    console.log(
      '[ServiceValidation] ==========================================='
    );
    console.log(
      `[ServiceValidation] Total Services Tested: ${summary.totalServices}`
    );
    console.log(
      `[ServiceValidation] Successful: ${summary.successfulServices}`
    );
    console.log(`[ServiceValidation] Failed: ${summary.failedServices}`);
    console.log(`[ServiceValidation] Warnings: ${summary.warningServices}`);
    console.log(
      `[ServiceValidation] Average Response Time: ${summary.averageResponseTime}ms`
    );
    console.log(
      '[ServiceValidation] ==========================================='
    );

    // Log individual results
    summary.results.forEach((result) => {
      const statusIcon =
        result.status === 'success'
          ? '✅'
          : result.status === 'warning'
            ? '⚠️'
            : '❌';
      console.log(
        `[ServiceValidation] ${statusIcon} ${result.serviceName}: ${result.message}`
      );
      if (result.responseTime) {
        console.log(
          `[ServiceValidation]    Response Time: ${result.responseTime}ms`
        );
      }
      if (result.details) {
        console.log(`[ServiceValidation]    Details:`, result.details);
      }
    });

    console.log(
      '[ServiceValidation] ===========================================\n'
    );
  }

  /**
   * Export validation results
   */
  exportResults(): ValidationSummary {
    return this.generateSummary(0);
  }
}

// Export singleton instance
export const serviceValidationTest = ServiceValidationTest.getInstance();
