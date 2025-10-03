import { securityAuditService } from '../SecurityAuditService';
import { logger } from '../../../utils/_core/logger';
import { ThreatIndicator, ThreatCondition } from './SecurityThreatIndicatorProvider';
// import { SecurityIncident } from './SecurityIncidentProvider';

export class SecurityMonitoringProvider {
  private monitoringTimer: NodeJS.Timeout | null = null;
  private readonly MONITORING_INTERVAL = 30000; // 30 seconds
  private isMonitoring = false;

  /**
   * Start monitoring
   */
  startMonitoring(): void {
    if (this.isMonitoring) {
      logger.warn('Security monitoring is already running');
      return;
    }

    this.monitoringTimer = setInterval(() => {
      this.performMonitoring();
    }, this.MONITORING_INTERVAL);

    this.isMonitoring = true;
    logger.info('Security monitoring started');
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    this.isMonitoring = false;
    logger.info('Security monitoring stopped');
  }

  /**
   * Check if monitoring is active
   */
  isMonitoringActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Get monitoring status
   */
  getMonitoringStatus(): {
    isActive: boolean;
    interval: number;
    nextCheck?: Date;
  } {
    return {
      isActive: this.isMonitoring,
      interval: this.MONITORING_INTERVAL,
      nextCheck: this.isMonitoring ? new Date(Date.now() + this.MONITORING_INTERVAL) : undefined,
    };
  }

  /**
   * Perform monitoring checks
   */
  private async performMonitoring(): Promise<void> {
    try {
      // Get recent security events
      const recentEvents = securityAuditService.getSecurityEvents({
        startDate: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        limit: 1000,
      });

      logger.debug(`Monitoring check: ${recentEvents.length} recent events`);
    } catch (error) {
      logger.error('Error during security monitoring:', error);
    }
  }

  /**
   * Check threat indicator against events
   */
  async checkThreatIndicator(
    indicator: ThreatIndicator,
    events: unknown[]
  ): Promise<{
    triggered: boolean;
    matchingEvents: unknown[];
    shouldCreateIncident: boolean;
  }> {
    if (!indicator.enabled) {
      return {
        triggered: false,
        matchingEvents: [],
        shouldCreateIncident: false,
      };
    }

    const matchingEvents = events.filter((event) =>
      this.evaluateThreatConditions(indicator.conditions, event)
    );

    if (matchingEvents.length === 0) {
      return {
        triggered: false,
        matchingEvents: [],
        shouldCreateIncident: false,
      };
    }

    const shouldTrigger = this.shouldTriggerIndicator(indicator, matchingEvents);

    return {
      triggered: shouldTrigger,
      matchingEvents,
      shouldCreateIncident: shouldTrigger,
    };
  }

  /**
   * Evaluate threat conditions against an event
   */
  evaluateThreatConditions(
    conditions: ThreatCondition[],
    event: unknown
  ): boolean {
    return conditions.every((condition) => {
      const eventValue = this.getEventValue(event, condition.field);

      switch (condition.operator) {
        case 'equals':
          return eventValue === condition.value;
        case 'not_equals':
          return eventValue !== condition.value;
        case 'contains':
          return (
            typeof eventValue === 'string' &&
            typeof condition.value === 'string' &&
            eventValue.includes(condition.value)
          );
        case 'not_contains':
          return (
            typeof eventValue === 'string' &&
            typeof condition.value === 'string' &&
            !eventValue.includes(condition.value)
          );
        case 'gt':
          return (
            typeof eventValue === 'number' &&
            typeof condition.value === 'number' &&
            eventValue > condition.value
          );
        case 'lt':
          return (
            typeof eventValue === 'number' &&
            typeof condition.value === 'number' &&
            eventValue < condition.value
          );
        case 'gte':
          return (
            typeof eventValue === 'number' &&
            typeof condition.value === 'number' &&
            eventValue >= condition.value
          );
        case 'lte':
          return (
            typeof eventValue === 'number' &&
            typeof condition.value === 'number' &&
            eventValue <= condition.value
          );
        case 'regex':
          return (
            typeof eventValue === 'string' &&
            typeof condition.value === 'string' &&
            new RegExp(condition.value).test(eventValue)
          );
        default:
          return false;
      }
    });
  }

  /**
   * Get event value by field path
   */
  private getEventValue(event: unknown, field: string): unknown {
    const parts = field.split('.');
    let value = event;

    for (const part of parts) {
      if (value && typeof value === 'object' && part in value) {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  /**
   * Check if indicator should trigger based on conditions
   */
  private shouldTriggerIndicator(
    indicator: ThreatIndicator,
    matchingEvents: unknown[]
  ): boolean {
    // Check count threshold
    if (indicator.conditions.some((c) => c.count)) {
      const minCount = Math.max(
        ...indicator.conditions.map((c) => c.count || 0)
      );
      if (matchingEvents.length < minCount) {
        return false;
      }
    }

    // Check time window
    if (indicator.conditions.some((c) => c.timeWindow)) {
      const timeWindow = Math.max(
        ...indicator.conditions.map((c) => c.timeWindow || 0)
      );
      const cutoff = new Date(Date.now() - timeWindow * 1000);
      const recentEvents = matchingEvents.filter(
        (e) =>
          typeof e === 'object' &&
          e !== null &&
          'timestamp' in e &&
          typeof (e as { timestamp?: unknown }).timestamp === 'number' &&
          (e as { timestamp: number }).timestamp >= cutoff.getTime()
      );

      if (recentEvents.length === 0) {
        return false;
      }
    }

    return true;
  }

  /**
   * Analyze event patterns
   */
  analyzeEventPatterns(
    events: unknown[],
    timeWindow: number = 3600 // 1 hour
  ): {
    patterns: Array<{
      type: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }>;
    anomalies: Array<{
      event: unknown;
      reason: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }>;
  } {
    const patterns: Array<{
      type: string;
      count: number;
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
    }> = [];

    const anomalies: Array<{
      event: unknown;
      reason: string;
      severity: 'low' | 'medium' | 'high' | 'critical';
    }> = [];

    // Analyze authentication patterns
    const authEvents = events.filter(
      (e) => this.getEventValue(e, 'eventType') === 'authentication'
    );
    const failedAuthEvents = authEvents.filter(
      (e) => this.getEventValue(e, 'result') === 'failure'
    );

    if (failedAuthEvents.length > 10) {
      patterns.push({
        type: 'authentication',
        count: failedAuthEvents.length,
        severity: 'high',
        description: 'High number of failed authentication attempts',
      });
    }

    // Analyze authorization patterns
    const authzEvents = events.filter(
      (e) => this.getEventValue(e, 'eventType') === 'authorization'
    );
    const failedAuthzEvents = authzEvents.filter(
      (e) => this.getEventValue(e, 'result') === 'failure'
    );

    if (failedAuthzEvents.length > 5) {
      patterns.push({
        type: 'authorization',
        count: failedAuthzEvents.length,
        severity: 'critical',
        description: 'Multiple authorization failures detected',
      });
    }

    // Analyze data access patterns
    const dataAccessEvents = events.filter(
      (e) => this.getEventValue(e, 'eventType') === 'data_access'
    );

    const largeDataAccess = dataAccessEvents.filter((e) => {
      const recordCount = this.getEventValue(e, 'details.recordCount') as number;
      return recordCount && recordCount > 1000;
    });

    if (largeDataAccess.length > 0) {
      patterns.push({
        type: 'data_access',
        count: largeDataAccess.length,
        severity: 'medium',
        description: 'Unusually large data access detected',
      });
    }

    // Detect anomalies
    events.forEach((event) => {
      const eventType = this.getEventValue(event, 'eventType');
      const timestamp = this.getEventValue(event, 'timestamp') as number;

      if (timestamp && Date.now() - timestamp > timeWindow * 1000) {
        anomalies.push({
          event,
          reason: 'Event timestamp is outside expected time window',
          severity: 'low',
        });
      }

      if (eventType === 'unknown') {
        anomalies.push({
          event,
          reason: 'Unknown event type detected',
          severity: 'medium',
        });
      }
    });

    return { patterns, anomalies };
  }

  /**
   * Get monitoring metrics
   */
  getMonitoringMetrics(): {
    isActive: boolean;
    uptime: number; // seconds
    checksPerformed: number;
    lastCheckTime?: Date;
    averageCheckDuration: number; // ms
    errors: number;
  } {
    // This would typically be tracked over time
    // For now, return mock data
    return {
      isActive: this.isMonitoring,
      uptime: this.isMonitoring ? Date.now() - (this.monitoringTimer ? Date.now() : 0) : 0,
      checksPerformed: 0, // Would track this
      lastCheckTime: this.isMonitoring ? new Date() : undefined,
      averageCheckDuration: 150, // ms
      errors: 0, // Would track this
    };
  }

  /**
   * Test threat indicator
   */
  testThreatIndicator(
    indicator: ThreatIndicator,
    testEvents: unknown[]
  ): {
    matches: number;
    wouldTrigger: boolean;
    matchingEvents: unknown[];
    evaluationDetails: Array<{
      condition: ThreatCondition;
      passed: boolean;
      eventValue: unknown;
    }>;
  } {
    const matchingEvents: unknown[] = [];
    const evaluationDetails: Array<{
      condition: ThreatCondition;
      passed: boolean;
      eventValue: unknown;
    }> = [];

    testEvents.forEach((event) => {
      let allConditionsPassed = true;
      const eventEvaluations: Array<{
        condition: ThreatCondition;
        passed: boolean;
        eventValue: unknown;
      }> = [];

      indicator.conditions.forEach((condition) => {
        const eventValue = this.getEventValue(event, condition.field);
        const passed = this.evaluateThreatConditions([condition], event);
        
        eventEvaluations.push({
          condition,
          passed,
          eventValue,
        });

        if (!passed) {
          allConditionsPassed = false;
        }
      });

      if (allConditionsPassed) {
        matchingEvents.push(event);
      }

      evaluationDetails.push(...eventEvaluations);
    });

    const wouldTrigger = this.shouldTriggerIndicator(indicator, matchingEvents);

    return {
      matches: matchingEvents.length,
      wouldTrigger,
      matchingEvents,
      evaluationDetails,
    };
  }

  /**
   * Validate monitoring configuration
   */
  validateMonitoringConfig(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (this.MONITORING_INTERVAL < 10000) {
      warnings.push('Monitoring interval is very short, may impact performance');
    }

    if (this.MONITORING_INTERVAL > 300000) {
      warnings.push('Monitoring interval is very long, may miss time-sensitive threats');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Set monitoring interval
   */
  setMonitoringInterval(intervalMs: number): void {
    if (intervalMs < 5000) {
      throw new Error('Monitoring interval must be at least 5000ms');
    }

    if (this.isMonitoring) {
      this.stopMonitoring();
      // Update interval
      (this as Record<string, unknown>).MONITORING_INTERVAL = intervalMs;
      this.startMonitoring();
    } else {
      (this as Record<string, unknown>).MONITORING_INTERVAL = intervalMs;
    }

    logger.info(`Monitoring interval updated to ${intervalMs}ms`);
  }

  /**
   * Get recent security events for monitoring
   */
  async getRecentSecurityEvents(
    timeWindowMinutes: number = 5,
    limit: number = 1000
  ): Promise<unknown[]> {
    try {
      const startDate = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
      return securityAuditService.getSecurityEvents({
        startDate,
        limit,
      });
    } catch (error) {
      logger.error('Error getting recent security events:', error);
      return [];
    }
  }
}
