import {
  SecurityEvent,
  SecurityViolation,
  ComplianceReport,
  SecurityEventFilter,
  SecurityViolationFilter,
} from './types/securityTypes';
import { SecurityEventLogger } from './logging/SecurityEventLogger';
import { SecurityViolationManager } from './violations/SecurityViolationManager';
import { SecurityAnalytics } from './analytics/SecurityAnalytics';
import { SecurityThreatDetector } from './detection/SecurityThreatDetector';
import { SecurityDataManager } from './data/SecurityDataManager';

export class SecurityAuditService {
  private static instance: SecurityAuditService;
  private eventLogger: SecurityEventLogger;
  private violationManager: SecurityViolationManager;
  private analytics: SecurityAnalytics;
  private threatDetector: SecurityThreatDetector;
  private dataManager: SecurityDataManager;

  private constructor() {
    this.eventLogger = new SecurityEventLogger();
    this.violationManager = new SecurityViolationManager(this.eventLogger);
    this.analytics = new SecurityAnalytics();
    this.threatDetector = new SecurityThreatDetector(this.violationManager);
    this.dataManager = new SecurityDataManager();
    this.dataManager.startCleanupTimer();
  }

  static getInstance(): SecurityAuditService {
    if (!SecurityAuditService.instance) {
      SecurityAuditService.instance = new SecurityAuditService();
    }
    return SecurityAuditService.instance;
  }

  /**
   * Log a security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent = this.eventLogger.logSecurityEvent(event);
    this.dataManager.addSecurityEvent(securityEvent);
    this.threatDetector.checkForViolations(securityEvent, this.dataManager.getAllEvents());
  }

  /**
   * Log authentication event
   */
  logAuthentication(
    action:
      | 'login'
      | 'logout'
      | 'login_failed'
      | 'password_reset'
      | 'mfa_enabled'
      | 'mfa_disabled',
    result: 'success' | 'failure',
    userId?: string,
    facilityId?: string,
    details: Record<string, unknown> = {}
  ): void {
    const event = this.eventLogger.logAuthentication(action, result, userId, facilityId, details);
    this.dataManager.addSecurityEvent(event);
    this.threatDetector.checkForViolations(event, this.dataManager.getAllEvents());
  }

  /**
   * Log authorization event
   */
  logAuthorization(
    action:
      | 'access_granted'
      | 'access_denied'
      | 'permission_changed'
      | 'role_assigned'
      | 'role_removed',
    result: 'success' | 'failure',
    userId?: string,
    facilityId?: string,
    resource?: string,
    details: Record<string, unknown> = {}
  ): void {
    const event = this.eventLogger.logAuthorization(action, result, userId, facilityId, resource, details);
    this.dataManager.addSecurityEvent(event);
    this.threatDetector.checkForViolations(event, this.dataManager.getAllEvents());
  }

  /**
   * Log data access event
   */
  logDataAccess(
    action: 'read' | 'export' | 'download' | 'view',
    result: 'success' | 'failure',
    userId?: string,
    facilityId?: string,
    resource?: string,
    dataType?: string,
    recordCount?: number,
    details: Record<string, unknown> = {}
  ): void {
    const event = this.eventLogger.logDataAccess(action, result, userId, facilityId, resource, dataType, recordCount, details);
    this.dataManager.addSecurityEvent(event);
    this.threatDetector.checkForViolations(event, this.dataManager.getAllEvents());
  }

  /**
   * Log data modification event
   */
  logDataModification(
    action: 'create' | 'update' | 'delete' | 'restore',
    result: 'success' | 'failure',
    userId?: string,
    facilityId?: string,
    resource?: string,
    recordId?: string,
    changes?: Record<string, unknown>,
    details: Record<string, unknown> = {}
  ): void {
    const event = this.eventLogger.logDataModification(action, result, userId, facilityId, resource, recordId, changes, details);
    this.dataManager.addSecurityEvent(event);
    this.threatDetector.checkForViolations(event, this.dataManager.getAllEvents());
  }

  /**
   * Log system access event
   */
  logSystemAccess(
    action:
      | 'system_startup'
      | 'system_shutdown'
      | 'configuration_change'
      | 'maintenance_mode',
    result: 'success' | 'failure',
    userId?: string,
    facilityId?: string,
    details: Record<string, unknown> = {}
  ): void {
    const event = this.eventLogger.logSystemAccess(action, result, userId, facilityId, details);
    this.dataManager.addSecurityEvent(event);
    this.threatDetector.checkForViolations(event, this.dataManager.getAllEvents());
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
  ): void {
    this.violationManager.logSecurityViolation(
      violationType,
      severity,
      description,
      userId,
      facilityId,
      evidence
    );
  }

  /**
   * Get security events
   */
  getSecurityEvents(filter: SecurityEventFilter = {}): SecurityEvent[] {
    const events = this.dataManager.getAllEvents();
    return this.analytics.filterSecurityEvents(events, filter);
  }

  /**
   * Get security violations
   */
  getSecurityViolations(filter: SecurityViolationFilter = {}): SecurityViolation[] {
    return this.violationManager.getSecurityViolations(filter);
  }

  /**
   * Resolve a security violation
   */
  resolveViolation(violationId: string, resolvedBy: string): void {
    this.violationManager.resolveViolation(violationId, resolvedBy);
  }

  /**
   * Generate compliance report
   */
  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const events = this.getSecurityEvents({
      startDate,
      endDate,
    });

    const violations = this.getSecurityViolations({
      startDate,
      endDate,
    });

    return this.analytics.generateComplianceReport(events, violations, startDate, endDate);
  }

}

// Singleton instance
export const securityAuditService = SecurityAuditService.getInstance();
