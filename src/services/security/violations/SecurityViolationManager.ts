import { logger } from '../../../utils/_core/logger';
import { SecurityViolation, SecurityViolationFilter } from '../types/securityTypes';
import { SecurityEventLogger } from '../logging/SecurityEventLogger';

export class SecurityViolationManager {
  private violations: SecurityViolation[] = [];
  private readonly MAX_VIOLATIONS = 10000;
  private eventLogger: SecurityEventLogger;

  constructor(eventLogger: SecurityEventLogger) {
    this.eventLogger = eventLogger;
  }

  /**
   * Log security violation
   */
  logSecurityViolation(
    violationType: SecurityViolation['violationType'],
    severity: 'medium' | 'high' | 'critical',
    description: string,
    userId?: string,
    facilityId?: string,
    evidence: Record<string, unknown> = {}
  ): SecurityViolation {
    const violation: SecurityViolation = {
      id: `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      violationType,
      severity,
      userId,
      facilityId,
      description,
      evidence,
      timestamp: new Date(),
      resolved: false,
    };

    this.violations.push(violation);

    // Keep only recent violations
    if (this.violations.length > this.MAX_VIOLATIONS) {
      this.violations.splice(0, this.violations.length - this.MAX_VIOLATIONS);
    }

    // Log as critical security event
    this.eventLogger.logSecurityEvent({
      eventType: 'security_violation',
      severity: 'critical',
      userId,
      facilityId,
      action: 'security_violation_detected',
      result: 'failure',
      details: {
        violationType,
        description,
        evidence,
      },
    });

    logger.warn(`Security violation detected: ${violationType}`, violation);

    return violation;
  }

  /**
   * Get security violations
   */
  getSecurityViolations(filter: SecurityViolationFilter = {}): SecurityViolation[] {
    let filteredViolations = [...this.violations];

    if (filter.violationType && filter.violationType.length > 0) {
      filteredViolations = filteredViolations.filter((v) =>
        filter.violationType!.includes(v.violationType)
      );
    }

    if (filter.severity && filter.severity.length > 0) {
      filteredViolations = filteredViolations.filter((v) =>
        filter.severity!.includes(v.severity)
      );
    }

    if (filter.resolved !== undefined) {
      filteredViolations = filteredViolations.filter(
        (v) => v.resolved === filter.resolved
      );
    }

    if (filter.startDate) {
      filteredViolations = filteredViolations.filter(
        (v) => v.timestamp >= filter.startDate!
      );
    }

    if (filter.endDate) {
      filteredViolations = filteredViolations.filter(
        (v) => v.timestamp <= filter.endDate!
      );
    }

    if (filter.limit) {
      filteredViolations = filteredViolations.slice(-filter.limit);
    }

    return filteredViolations.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }

  /**
   * Resolve a security violation
   */
  resolveViolation(violationId: string, resolvedBy: string): void {
    const violation = this.violations.find((v) => v.id === violationId);
    if (violation) {
      violation.resolved = true;
      violation.resolvedAt = new Date();
      violation.resolvedBy = resolvedBy;

      logger.info(
        `Security violation resolved: ${violationId} by ${resolvedBy}`
      );
    }
  }

  /**
   * Get all violations (for cleanup)
   */
  getAllViolations(): SecurityViolation[] {
    return [...this.violations];
  }

  /**
   * Clean up old violations
   */
  cleanupOldViolations(cutoffDate: Date): number {
    const originalCount = this.violations.length;
    this.violations = this.violations.filter((v) => v.timestamp > cutoffDate);
    return originalCount - this.violations.length;
  }
}
