import { SecurityEvent } from '../types/securityTypes';
import { SecurityViolationManager } from '../violations/SecurityViolationManager';

export class SecurityThreatDetector {
  private violationManager: SecurityViolationManager;

  constructor(violationManager: SecurityViolationManager) {
    this.violationManager = violationManager;
  }

  /**
   * Check for security violations
   */
  checkForViolations(event: SecurityEvent, allEvents: SecurityEvent[]): void {
    // Check for suspicious patterns
    if (event.eventType === 'authentication' && event.result === 'failure') {
      this.checkForBruteForce(event, allEvents);
    }

    if (event.eventType === 'authorization' && event.result === 'failure') {
      this.checkForUnauthorizedAccess(event, allEvents);
    }

    if (
      event.eventType === 'data_access' &&
      (event.details.recordCount as number) > 1000
    ) {
      this.violationManager.logSecurityViolation(
        'suspicious_activity',
        'medium',
        'Large data access detected',
        event.userId,
        event.facilityId,
        { recordCount: event.details.recordCount }
      );
    }
  }

  /**
   * Check for brute force attacks
   */
  private checkForBruteForce(
    event: SecurityEvent,
    allEvents: SecurityEvent[]
  ): void {
    const recentFailures = allEvents.filter(
      (e) =>
        e.eventType === 'authentication' &&
        e.result === 'failure' &&
        e.userId === event.userId &&
        e.timestamp > new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
    );

    if (recentFailures.length >= 5) {
      this.violationManager.logSecurityViolation(
        'suspicious_activity',
        'high',
        'Potential brute force attack detected',
        event.userId,
        event.facilityId,
        { failureCount: recentFailures.length }
      );
    }
  }

  /**
   * Check for unauthorized access attempts
   */
  private checkForUnauthorizedAccess(
    event: SecurityEvent,
    allEvents: SecurityEvent[]
  ): void {
    const recentDenials = allEvents.filter(
      (e) =>
        e.eventType === 'authorization' &&
        e.result === 'failure' &&
        e.userId === event.userId &&
        e.timestamp > new Date(Date.now() - 30 * 60 * 1000) // 30 minutes
    );

    if (recentDenials.length >= 10) {
      this.violationManager.logSecurityViolation(
        'unauthorized_access',
        'high',
        'Multiple unauthorized access attempts detected',
        event.userId,
        event.facilityId,
        { denialCount: recentDenials.length }
      );
    }
  }
}
