import { enhancedLoggingService } from '../../monitoring/EnhancedLoggingService';
import { logger } from '../../../utils/_core/logger';
import { SecurityEvent } from '../types/securityTypes';

export class SecurityEventLogger {
  /**
   * Log a security event
   */
  logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): SecurityEvent {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    // Log to enhanced logging service
    enhancedLoggingService.log(
      securityEvent.severity === 'critical'
        ? 'fatal'
        : securityEvent.severity === 'high'
          ? 'error'
          : securityEvent.severity === 'medium'
            ? 'warn'
            : 'info',
      `Security Event: ${securityEvent.action}`,
      {
        correlationId: securityEvent.correlationId,
        userId: securityEvent.userId,
        facilityId: securityEvent.facilityId,
        sessionId: securityEvent.sessionId,
        operation: 'security_audit',
        service: 'security',
      },
      {
        eventType: securityEvent.eventType,
        severity: securityEvent.severity,
        result: securityEvent.result,
        resource: securityEvent.resource,
        details: securityEvent.details,
      }
    );

    logger.debug(
      `Security event logged: ${securityEvent.eventType}`,
      securityEvent
    );

    return securityEvent;
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
  ): SecurityEvent {
    return this.logSecurityEvent({
      eventType: 'authentication',
      severity: result === 'failure' ? 'high' : 'medium',
      userId,
      facilityId,
      action,
      result,
      details: {
        ...details,
        action,
      },
    });
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
  ): SecurityEvent {
    return this.logSecurityEvent({
      eventType: 'authorization',
      severity: result === 'failure' ? 'high' : 'medium',
      userId,
      facilityId,
      resource,
      action,
      result,
      details: {
        ...details,
        action,
      },
    });
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
  ): SecurityEvent {
    return this.logSecurityEvent({
      eventType: 'data_access',
      severity: 'low',
      userId,
      facilityId,
      resource,
      action,
      result,
      details: {
        ...details,
        dataType,
        recordCount,
      },
    });
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
  ): SecurityEvent {
    return this.logSecurityEvent({
      eventType: 'data_modification',
      severity: 'medium',
      userId,
      facilityId,
      resource,
      action,
      result,
      details: {
        ...details,
        recordId,
        changes,
      },
    });
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
  ): SecurityEvent {
    return this.logSecurityEvent({
      eventType: 'system_access',
      severity: 'medium',
      userId,
      facilityId,
      action,
      result,
      details: {
        ...details,
        action,
      },
    });
  }
}
