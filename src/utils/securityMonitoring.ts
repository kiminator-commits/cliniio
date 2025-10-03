/**
 * Security Monitoring Utilities
 *
 * This module provides utilities for monitoring security events,
 * generating security reports, and alerting on suspicious activity.
 */

export interface SecurityEvent {
  type:
    | 'unauthorized_origin'
    | 'rate_limit_exceeded'
    | 'validation_failed'
    | 'invalid_config'
    | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, unknown>;
  timestamp: string;
  clientId: string;
  origin: string | null;
}

export interface SecurityMetrics {
  totalEvents: number;
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  byOrigin: Record<string, number>;
  topOrigins: Array<{ origin: string; count: number }>;
  criticalEvents: number;
  rateLimitViolations: number;
  unauthorizedOrigins: number;
  suspiciousActivity: number;
}

export interface SecurityAlert {
  id: string;
  type: 'threshold_exceeded' | 'pattern_detected' | 'critical_event';
  severity: 'medium' | 'high' | 'critical';
  message: string;
  details: Record<string, unknown>;
  timestamp: string;
  acknowledged: boolean;
}

/**
 * Security monitoring class for tracking and analyzing security events
 */
export class SecurityMonitor {
  private events: SecurityEvent[] = [];
  private alerts: SecurityAlert[] = [];
  private thresholds = {
    maxEventsPerHour: 100,
    maxCriticalEventsPerDay: 10,
    maxSuspiciousActivityPerHour: 5,
    maxRateLimitViolationsPerHour: 50,
  };

  /**
   * Log a security event
   */
  logEvent(
    event: Omit<SecurityEvent, 'timestamp' | 'clientId' | 'origin'>
  ): void {
    const securityEvent: SecurityEvent = {
      ...event,
      timestamp: new Date().toISOString(),
      clientId: 'unknown', // Will be set by caller
      origin: null, // Will be set by caller
    };

    this.events.push(securityEvent);

    // Keep only last 10000 events to prevent memory issues
    if (this.events.length > 10000) {
      this.events.splice(0, this.events.length - 10000);
    }

    // Check for alerts
    this.checkAlerts();

    // Log to console with appropriate level
    this.logToConsole(securityEvent);
  }

  /**
   * Get security metrics for the last 24 hours
   */
  getMetrics(): SecurityMetrics {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;

    const recentEvents = this.events.filter(
      (event) => new Date(event.timestamp).getTime() > last24Hours
    );

    const metrics: SecurityMetrics = {
      totalEvents: recentEvents.length,
      byType: {},
      bySeverity: {},
      byOrigin: {},
      topOrigins: [],
      criticalEvents: 0,
      rateLimitViolations: 0,
      unauthorizedOrigins: 0,
      suspiciousActivity: 0,
    };

    // Count by type and severity
    recentEvents.forEach((event) => {
      metrics.byType[event.type] = (metrics.byType[event.type] || 0) + 1;
      metrics.bySeverity[event.severity] =
        (metrics.bySeverity[event.severity] || 0) + 1;

      if (event.origin) {
        metrics.byOrigin[event.origin] =
          (metrics.byOrigin[event.origin] || 0) + 1;
      }

      // Count specific event types
      if (event.severity === 'critical') metrics.criticalEvents++;
      if (event.type === 'rate_limit_exceeded') metrics.rateLimitViolations++;
      if (event.type === 'unauthorized_origin') metrics.unauthorizedOrigins++;
      if (event.type === 'suspicious_activity') metrics.suspiciousActivity++;
    });

    // Get top origins
    metrics.topOrigins = Object.entries(metrics.byOrigin)
      .map(([origin, count]) => ({ origin, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return metrics;
  }

  /**
   * Get active alerts
   */
  getAlerts(): SecurityAlert[] {
    return this.alerts.filter((alert) => !alert.acknowledged);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Generate a security report
   */
  generateReport(): string {
    const metrics = this.getMetrics();
    const alerts = this.getAlerts();

    const report = `
# Security Report - ${new Date().toISOString()}

## Summary
- Total Events (24h): ${metrics.totalEvents}
- Critical Events: ${metrics.criticalEvents}
- Rate Limit Violations: ${metrics.rateLimitViolations}
- Unauthorized Origins: ${metrics.unauthorizedOrigins}
- Suspicious Activity: ${metrics.suspiciousActivity}
- Active Alerts: ${alerts.length}

## Event Breakdown
${Object.entries(metrics.byType)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## Severity Breakdown
${Object.entries(metrics.bySeverity)
  .map(([severity, count]) => `- ${severity}: ${count}`)
  .join('\n')}

## Top Origins
${metrics.topOrigins.map(({ origin, count }) => `- ${origin}: ${count} events`).join('\n')}

## Active Alerts
${alerts.length > 0 ? alerts.map((alert) => `- [${alert.severity.toUpperCase()}] ${alert.message}`).join('\n') : 'No active alerts'}

## Recommendations
${this.generateRecommendations(metrics, alerts)}
`;

    return report.trim();
  }

  /**
   * Check for security alerts based on thresholds and patterns
   */
  private checkAlerts(): void {
    const now = Date.now();
    const lastHour = now - 60 * 60 * 1000;
    const lastDay = now - 24 * 60 * 60 * 1000;

    const recentEvents = this.events.filter(
      (event) => new Date(event.timestamp).getTime() > lastHour
    );

    const dailyEvents = this.events.filter(
      (event) => new Date(event.timestamp).getTime() > lastDay
    );

    // Check thresholds
    if (recentEvents.length > this.thresholds.maxEventsPerHour) {
      this.createAlert({
        type: 'threshold_exceeded',
        severity: 'high',
        message: `High event volume: ${recentEvents.length} events in the last hour`,
        details: {
          eventCount: recentEvents.length,
          threshold: this.thresholds.maxEventsPerHour,
        },
      });
    }

    const criticalEvents = dailyEvents.filter((e) => e.severity === 'critical');
    if (criticalEvents.length > this.thresholds.maxCriticalEventsPerDay) {
      this.createAlert({
        type: 'threshold_exceeded',
        severity: 'critical',
        message: `Critical event threshold exceeded: ${criticalEvents.length} critical events today`,
        details: {
          eventCount: criticalEvents.length,
          threshold: this.thresholds.maxCriticalEventsPerDay,
        },
      });
    }

    const rateLimitViolations = recentEvents.filter(
      (e) => e.type === 'rate_limit_exceeded'
    );
    if (
      rateLimitViolations.length > this.thresholds.maxRateLimitViolationsPerHour
    ) {
      this.createAlert({
        type: 'threshold_exceeded',
        severity: 'medium',
        message: `High rate limit violations: ${rateLimitViolations.length} in the last hour`,
        details: {
          eventCount: rateLimitViolations.length,
          threshold: this.thresholds.maxRateLimitViolationsPerHour,
        },
      });
    }

    // Check for suspicious patterns
    this.checkSuspiciousPatterns(recentEvents);
  }

  /**
   * Check for suspicious activity patterns
   */
  private checkSuspiciousPatterns(events: SecurityEvent[]): void {
    // Group events by client ID
    const eventsByClient = events.reduce(
      (acc, event) => {
        if (!acc[event.clientId]) acc[event.clientId] = [];
        acc[event.clientId].push(event);
        return acc;
      },
      {} as Record<string, SecurityEvent[]>
    );

    // Check each client for suspicious patterns
    Object.entries(eventsByClient).forEach(([clientId, clientEvents]) => {
      const failedAttempts = clientEvents.filter(
        (e) =>
          e.type === 'validation_failed' || e.type === 'unauthorized_origin'
      ).length;

      const rateLimitViolations = clientEvents.filter(
        (e) => e.type === 'rate_limit_exceeded'
      ).length;

      // Flag as suspicious if multiple failures or rapid violations
      if (failedAttempts >= 5 || rateLimitViolations >= 3) {
        this.createAlert({
          type: 'pattern_detected',
          severity: 'high',
          message: `Suspicious activity detected from client ${clientId}`,
          details: {
            clientId,
            failedAttempts,
            rateLimitViolations,
            totalEvents: clientEvents.length,
          },
        });
      }
    });
  }

  /**
   * Create a new security alert
   */
  private createAlert(
    alert: Omit<SecurityAlert, 'id' | 'timestamp' | 'acknowledged'>
  ): void {
    const newAlert: SecurityAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
    };

    this.alerts.push(newAlert);

    // Keep only last 1000 alerts
    if (this.alerts.length > 1000) {
      this.alerts.splice(0, this.alerts.length - 1000);
    }
  }

  /**
   * Log security event to console
   */
  private logToConsole(event: SecurityEvent): void {
    const logMessage = `🚨 SECURITY EVENT [${event.severity.toUpperCase()}]: ${event.type}`;
    const logData = {
      ...event.details,
      timestamp: event.timestamp,
    };

    switch (event.severity) {
      case 'critical':
      case 'high':
        console.error(logMessage, logData);
        break;
      case 'medium':
        console.warn(logMessage, logData);
        break;
      case 'low':
        console.log(logMessage, logData);
        break;
    }
  }

  /**
   * Generate security recommendations based on metrics and alerts
   */
  private generateRecommendations(
    metrics: SecurityMetrics,
    alerts: SecurityAlert[]
  ): string {
    const recommendations: string[] = [];

    if (metrics.criticalEvents > 5) {
      recommendations.push(
        'High number of critical events detected. Review system configuration and security policies.'
      );
    }

    if (metrics.rateLimitViolations > 20) {
      recommendations.push(
        'High rate limit violations. Consider implementing stricter rate limiting or investigating potential attacks.'
      );
    }

    if (metrics.unauthorizedOrigins > 10) {
      recommendations.push(
        'Multiple unauthorized origin attempts. Review CORS configuration and consider additional origin validation.'
      );
    }

    if (alerts.length > 5) {
      recommendations.push(
        'Multiple active security alerts. Prioritize addressing high-severity alerts first.'
      );
    }

    if (metrics.suspiciousActivity > 0) {
      recommendations.push(
        'Suspicious activity patterns detected. Consider implementing additional monitoring and blocking mechanisms.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        'No immediate security concerns detected. Continue monitoring for any changes in patterns.'
      );
    }

    return recommendations.join('\n');
  }
}

// Export a singleton instance
export const securityMonitor = new SecurityMonitor();
