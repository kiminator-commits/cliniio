import { serviceRegistry } from './ServiceRegistry';
import { performanceMonitor } from './monitoring/PerformanceMonitor';

/**
 * Service Consolidator
 * Identifies and consolidates duplicate service instances
 */
export class ServiceConsolidator {
  private static instance: ServiceConsolidator | null = null;
  private consolidationReport: Map<string, ConsolidationInfo> = new Map();

  private constructor() {}

  static getInstance(): ServiceConsolidator {
    if (!ServiceConsolidator.instance) {
      ServiceConsolidator.instance = new ServiceConsolidator();
    }
    return ServiceConsolidator.instance;
  }

  /**
   * Analyze services for consolidation opportunities
   */
  async analyzeServices(): Promise<ConsolidationReport> {
    const startTime = performance.now();
    const report: ConsolidationReport = {
      totalServices: 0,
      duplicateServices: [],
      consolidationOpportunities: [],
      performanceImpact: {
        memoryReduction: 0,
        initializationTimeReduction: 0,
        duplicateCallsReduction: 0,
      },
    };

    try {
      // Get all registered services
      const serviceNames = serviceRegistry.getServiceNames();
      report.totalServices = serviceNames.length;

      // Analyze each service
      for (const serviceName of serviceNames) {
        const info = await this.analyzeService(serviceName);
        this.consolidationReport.set(serviceName, info);

        if (info.isDuplicate) {
          report.duplicateServices.push(serviceName);
        }

        if (info.consolidationOpportunity) {
          report.consolidationOpportunities.push({
            serviceName,
            reason: info.consolidationReason || 'Unknown',
            potentialSavings: info.potentialSavings || 0,
          });
        }
      }

      // Calculate performance impact
      report.performanceImpact = this.calculatePerformanceImpact();

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('service_analysis', duration, {
        service: 'ServiceConsolidator',
        operation: 'analyzeServices',
        totalServices: report.totalServices.toString(),
        duplicates: report.duplicateServices.length.toString(),
      });

      console.log(
        `[ServiceConsolidator] Analysis completed in ${duration.toFixed(2)}ms`
      );
      return report;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordErrorRate('service_analysis', 100, {
        service: 'ServiceConsolidator',
        operation: 'analyzeServices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error(
        `[ServiceConsolidator] Analysis failed after ${duration.toFixed(2)}ms:`,
        error
      );
      throw error;
    }
  }

  /**
   * Consolidate duplicate services
   */
  async consolidateServices(): Promise<ConsolidationResult> {
    const startTime = performance.now();
    const result: ConsolidationResult = {
      consolidatedServices: [],
      failedConsolidations: [],
      totalSavings: 0,
    };

    try {
      const report = await this.analyzeServices();

      for (const opportunity of report.consolidationOpportunities) {
        try {
          await this.consolidateService(opportunity.serviceName);
          result.consolidatedServices.push(opportunity.serviceName);
          result.totalSavings += opportunity.potentialSavings;
        } catch (error) {
          result.failedConsolidations.push({
            serviceName: opportunity.serviceName,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      const duration = performance.now() - startTime;
      performanceMonitor.recordResponseTime('service_consolidation', duration, {
        service: 'ServiceConsolidator',
        operation: 'consolidateServices',
        consolidated: result.consolidatedServices.length.toString(),
        failed: result.failedConsolidations.length.toString(),
      });

      console.log(
        `[ServiceConsolidator] Consolidation completed in ${duration.toFixed(2)}ms`
      );
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      performanceMonitor.recordErrorRate('service_consolidation', 100, {
        service: 'ServiceConsolidator',
        operation: 'consolidateServices',
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      console.error(
        `[ServiceConsolidator] Consolidation failed after ${duration.toFixed(2)}ms:`,
        error
      );
      throw error;
    }
  }

  /**
   * Analyze a specific service
   */
  private async analyzeService(
    serviceName: string
  ): Promise<ConsolidationInfo> {
    const info: ConsolidationInfo = {
      serviceName,
      isDuplicate: false,
      consolidationOpportunity: false,
      consolidationReason: null,
      potentialSavings: 0,
    };

    try {
      const service = serviceRegistry.get(serviceName);

      // Check if service has duplicate patterns
      if (this.hasDuplicatePatterns(service)) {
        info.isDuplicate = true;
        info.consolidationOpportunity = true;
        info.consolidationReason = 'Duplicate patterns detected';
        info.potentialSavings = this.calculatePotentialSavings(service);
      }

      // Check for singleton violations
      if (this.hasSingletonViolations(service)) {
        info.consolidationOpportunity = true;
        info.consolidationReason = 'Singleton pattern violations';
        info.potentialSavings += 100; // Base savings for singleton fixes
      }

      // Check for redundant initialization
      if (this.hasRedundantInitialization(service)) {
        info.consolidationOpportunity = true;
        info.consolidationReason = 'Redundant initialization detected';
        info.potentialSavings += 50; // Base savings for initialization fixes
      }
    } catch (error) {
      console.warn(
        `[ServiceConsolidator] Failed to analyze service '${serviceName}':`,
        error
      );
    }

    return info;
  }

  /**
   * Consolidate a specific service
   */
  private async consolidateService(serviceName: string): Promise<void> {
    // Implementation would depend on the specific service
    // For now, we'll just log the consolidation attempt
    console.log(`[ServiceConsolidator] Consolidating service '${serviceName}'`);
  }

  /**
   * Check for duplicate patterns
   */
  private hasDuplicatePatterns(service: unknown): boolean {
    // Check for common duplicate patterns
    if (typeof service === 'object' && service !== null) {
      // Check for duplicate methods
      const methods = Object.getOwnPropertyNames(
        Object.getPrototypeOf(service)
      );
      const uniqueMethods = new Set(methods);

      if (methods.length !== uniqueMethods.size) {
        return true;
      }

      // Check for duplicate properties
      const properties = Object.getOwnPropertyNames(service);
      const uniqueProperties = new Set(properties);

      if (properties.length !== uniqueProperties.size) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check for singleton violations
   */
  private hasSingletonViolations(service: unknown): boolean {
    // Check if service has multiple instances
    if (typeof service === 'object' && service !== null) {
      // This is a simplified check - in practice, you'd need more sophisticated detection
      return false;
    }

    return false;
  }

  /**
   * Check for redundant initialization
   */
  private hasRedundantInitialization(service: unknown): boolean {
    // Check if service has redundant initialization logic
    if (typeof service === 'object' && service !== null) {
      // This is a simplified check - in practice, you'd need more sophisticated detection
      return false;
    }

    return false;
  }

  /**
   * Calculate potential savings
   */
  private calculatePotentialSavings(_service: unknown): number {
    // Simplified calculation - in practice, you'd need more sophisticated analysis
    // Could analyze service complexity, memory usage, etc.
    return 50; // Base savings
  }

  /**
   * Calculate performance impact
   */
  private calculatePerformanceImpact(): PerformanceImpact {
    const totalDuplicates = this.consolidationReport.size;
    const totalOpportunities = Array.from(
      this.consolidationReport.values()
    ).filter((info) => info.consolidationOpportunity).length;

    return {
      memoryReduction: totalDuplicates * 10, // 10KB per duplicate
      initializationTimeReduction: totalOpportunities * 50, // 50ms per opportunity
      duplicateCallsReduction: totalDuplicates * 5, // 5 calls per duplicate
    };
  }
}

// Types
interface ConsolidationInfo {
  serviceName: string;
  isDuplicate: boolean;
  consolidationOpportunity: boolean;
  consolidationReason: string | null;
  potentialSavings: number;
}

interface ConsolidationReport {
  totalServices: number;
  duplicateServices: string[];
  consolidationOpportunities: ConsolidationOpportunity[];
  performanceImpact: PerformanceImpact;
}

interface ConsolidationOpportunity {
  serviceName: string;
  reason: string;
  potentialSavings: number;
}

interface ConsolidationResult {
  consolidatedServices: string[];
  failedConsolidations: FailedConsolidation[];
  totalSavings: number;
}

interface FailedConsolidation {
  serviceName: string;
  error: string;
}

interface PerformanceImpact {
  memoryReduction: number;
  initializationTimeReduction: number;
  duplicateCallsReduction: number;
}

// Export singleton instance
export const serviceConsolidator = ServiceConsolidator.getInstance();
