// Real-time audit monitoring and alerting system
interface AuditAlert {
  id: string;
  type: 'anomaly' | 'threshold' | 'pattern' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolvedBy?: string;
  resolvedAt?: number;
  metadata: Record<string, any>;
  relatedEvents: string[];
}

interface MonitoringRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'threshold' | 'anomaly' | 'pattern' | 'compliance';
  conditions: MonitoringCondition[];
  timeWindow: number; // milliseconds
  threshold?: number;
  cooldown: number; // milliseconds
  severity: 'low' | 'medium' | 'high' | 'critical';
  actions: MonitoringAction[];
  lastTriggered?: number;
}

interface MonitoringCondition {
  field: string;
  operator:
    | 'equals'
    | 'not_equals'
    | 'greater_than'
    | 'less_than'
    | 'contains'
    | 'regex';
  value: any;
  weight?: number;
}

interface MonitoringAction {
  type: 'alert' | 'notification' | 'webhook' | 'email' | 'slack' | 'block';
  config: Record<string, any>;
  enabled: boolean;
}

interface AuditMetrics {
  timestamp: number;
  totalEvents: number;
  eventsBySeverity: Record<string, number>;
  eventsByType: Record<string, number>;
  uniqueActors: number;
  uniqueResources: number;
  failureRate: number;
  averageResponseTime: number;
  anomalies: string[];
}

class AuditMonitoringService {
  private alerts: Map<string, AuditAlert> = new Map();
  private rules: Map<string, MonitoringRule> = new Map();
  private metrics: AuditMetrics[] = [];
  private eventBuffer: any[] = [];
  private isMonitoring = false;
  private monitoringInterval: number | null = null;
  private maxAlerts = 1000;
  private maxMetrics = 1000;
  private maxBufferSize = 10000;

  constructor() {
    this.initializeDefaultRules();

    if (Deno.env.get('ENABLE_AUDIT_MONITORING') === 'true') {
      this.startMonitoring();
    }
  }

  private initializeDefaultRules(): void {
    const defaultRules: MonitoringRule[] = [
      {
        id: 'high_failure_rate',
        name: 'High Authentication Failure Rate',
        description: 'Alert when authentication failure rate exceeds threshold',
        enabled: true,
        type: 'threshold',
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_failure',
            weight: 1,
          },
        ],
        timeWindow: 5 * 60 * 1000, // 5 minutes
        threshold: 0.3, // 30% failure rate
        cooldown: 10 * 60 * 1000, // 10 minutes
        severity: 'high',
        actions: [
          { type: 'alert', config: { level: 'high' }, enabled: true },
          {
            type: 'notification',
            config: { channels: ['email', 'slack'] },
            enabled: true,
          },
        ],
      },
      {
        id: 'unusual_access_pattern',
        name: 'Unusual Access Pattern',
        description: 'Alert when access patterns deviate from normal',
        enabled: true,
        type: 'anomaly',
        conditions: [
          {
            field: 'timestamp',
            operator: 'greater_than',
            value: '{{night_hours}}',
            weight: 1,
          },
          {
            field: 'eventType',
            operator: 'equals',
            value: 'login_success',
            weight: 1,
          },
        ],
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        threshold: 0.1, // 10% of normal activity
        cooldown: 60 * 60 * 1000, // 1 hour
        severity: 'medium',
        actions: [
          { type: 'alert', config: { level: 'medium' }, enabled: true },
          {
            type: 'notification',
            config: { channels: ['slack'] },
            enabled: true,
          },
        ],
      },
      {
        id: 'privilege_escalation',
        name: 'Privilege Escalation Attempt',
        description: 'Alert on privilege escalation attempts',
        enabled: true,
        type: 'pattern',
        conditions: [
          { field: 'action', operator: 'contains', value: 'admin', weight: 2 },
          { field: 'outcome', operator: 'equals', value: 'failure', weight: 1 },
        ],
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 1, // Any attempt
        cooldown: 30 * 60 * 1000, // 30 minutes
        severity: 'critical',
        actions: [
          { type: 'alert', config: { level: 'critical' }, enabled: true },
          {
            type: 'notification',
            config: { channels: ['email', 'slack', 'webhook'] },
            enabled: true,
          },
          { type: 'block', config: { duration: 3600000 }, enabled: true },
        ],
      },
      {
        id: 'data_access_anomaly',
        name: 'Data Access Anomaly',
        description: 'Alert on unusual data access patterns',
        enabled: true,
        type: 'anomaly',
        conditions: [
          {
            field: 'action',
            operator: 'contains',
            value: 'data_access',
            weight: 1,
          },
        ],
        timeWindow: 60 * 60 * 1000, // 1 hour
        threshold: 0.2, // 20% above normal
        cooldown: 30 * 60 * 1000, // 30 minutes
        severity: 'high',
        actions: [
          { type: 'alert', config: { level: 'high' }, enabled: true },
          {
            type: 'notification',
            config: { channels: ['email'] },
            enabled: true,
          },
        ],
      },
      {
        id: 'compliance_violation',
        name: 'Compliance Violation',
        description: 'Alert on potential compliance violations',
        enabled: true,
        type: 'compliance',
        conditions: [
          {
            field: 'eventType',
            operator: 'equals',
            value: 'audit_trail_access',
            weight: 1,
          },
          {
            field: 'actor',
            operator: 'not_equals',
            value: 'system',
            weight: 1,
          },
        ],
        timeWindow: 24 * 60 * 60 * 1000, // 24 hours
        threshold: 1, // Any access
        cooldown: 60 * 60 * 1000, // 1 hour
        severity: 'critical',
        actions: [
          { type: 'alert', config: { level: 'critical' }, enabled: true },
          {
            type: 'notification',
            config: { channels: ['email', 'webhook'] },
            enabled: true,
          },
        ],
      },
    ];

    defaultRules.forEach((rule) => {
      this.rules.set(rule.id, rule);
    });
  }

  startMonitoring(intervalMs: number = 60000): void {
    // 1 minute default
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateRules();
    }, intervalMs);

    console.log('Audit monitoring started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Audit monitoring stopped');
  }

  async processEvent(event: any): Promise<void> {
    // Add to event buffer
    this.eventBuffer.push(event);

    // Keep buffer size manageable
    if (this.eventBuffer.length > this.maxBufferSize) {
      this.eventBuffer = this.eventBuffer.slice(-this.maxBufferSize);
    }

    // Real-time rule evaluation for critical events
    if (event.severity === 'critical' || event.severity === 'high') {
      await this.evaluateRulesForEvent(event);
    }
  }

  private async collectMetrics(): Promise<void> {
    const now = Date.now();
    const timeWindow = 5 * 60 * 1000; // 5 minutes
    const cutoff = now - timeWindow;

    // Filter recent events
    const recentEvents = this.eventBuffer.filter((e) => e.timestamp >= cutoff);

    // Calculate metrics
    const metrics: AuditMetrics = {
      timestamp: now,
      totalEvents: recentEvents.length,
      eventsBySeverity: {},
      eventsByType: {},
      uniqueActors: 0,
      uniqueResources: 0,
      failureRate: 0,
      averageResponseTime: 0,
      anomalies: [],
    };

    // Count by severity and type
    const actors = new Set();
    const resources = new Set();
    let failures = 0;
    let totalResponseTime = 0;
    let responseTimeCount = 0;

    for (const event of recentEvents) {
      // Severity counts
      metrics.eventsBySeverity[event.severity] =
        (metrics.eventsBySeverity[event.severity] || 0) + 1;

      // Type counts
      metrics.eventsByType[event.eventType] =
        (metrics.eventsByType[event.eventType] || 0) + 1;

      // Unique counts
      if (event.actor) actors.add(event.actor);
      if (event.resource) resources.add(event.resource);

      // Failure rate
      if (event.outcome === 'failure') failures++;

      // Response time
      if (event.responseTime) {
        totalResponseTime += event.responseTime;
        responseTimeCount++;
      }
    }

    metrics.uniqueActors = actors.size;
    metrics.uniqueResources = resources.size;
    metrics.failureRate =
      recentEvents.length > 0 ? failures / recentEvents.length : 0;
    metrics.averageResponseTime =
      responseTimeCount > 0 ? totalResponseTime / responseTimeCount : 0;

    // Detect anomalies
    metrics.anomalies = await this.detectAnomalies(metrics);

    // Store metrics
    this.metrics.push(metrics);

    // Keep metrics history manageable
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    console.log('Audit metrics collected:', {
      totalEvents: metrics.totalEvents,
      failureRate: (metrics.failureRate * 100).toFixed(1) + '%',
      anomalies: metrics.anomalies.length,
    });
  }

  private async detectAnomalies(metrics: AuditMetrics): Promise<string[]> {
    const anomalies: string[] = [];

    // Compare with historical data
    if (this.metrics.length > 1) {
      const historical = this.metrics.slice(-10); // Last 10 data points
      const avgEvents =
        historical.reduce((sum, m) => sum + m.totalEvents, 0) /
        historical.length;
      const avgFailureRate =
        historical.reduce((sum, m) => sum + m.failureRate, 0) /
        historical.length;

      // Event volume anomaly
      if (metrics.totalEvents > avgEvents * 2) {
        anomalies.push('High event volume detected');
      }

      // Failure rate anomaly
      if (metrics.failureRate > avgFailureRate * 1.5) {
        anomalies.push('High failure rate detected');
      }

      // Response time anomaly
      const avgResponseTime =
        historical.reduce((sum, m) => sum + m.averageResponseTime, 0) /
        historical.length;
      if (metrics.averageResponseTime > avgResponseTime * 2) {
        anomalies.push('High response time detected');
      }
    }

    return anomalies;
  }

  private async evaluateRules(): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (
        rule.lastTriggered &&
        Date.now() - rule.lastTriggered < rule.cooldown
      ) {
        continue;
      }

      const shouldTrigger = await this.evaluateRule(rule);
      if (shouldTrigger) {
        await this.triggerAlert(rule);
        rule.lastTriggered = Date.now();
      }
    }
  }

  private async evaluateRulesForEvent(event: any): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (
        rule.lastTriggered &&
        Date.now() - rule.lastTriggered < rule.cooldown
      ) {
        continue;
      }

      const shouldTrigger = await this.evaluateRuleForEvent(rule, event);
      if (shouldTrigger) {
        await this.triggerAlert(rule, [event]);
        rule.lastTriggered = Date.now();
      }
    }
  }

  private async evaluateRule(rule: MonitoringRule): Promise<boolean> {
    const now = Date.now();
    const cutoff = now - rule.timeWindow;
    const relevantEvents = this.eventBuffer.filter(
      (e) => e.timestamp >= cutoff
    );

    switch (rule.type) {
      case 'threshold':
        return this.evaluateThresholdRule(rule, relevantEvents);
      case 'anomaly':
        return this.evaluateAnomalyRule(rule, relevantEvents);
      case 'pattern':
        return this.evaluatePatternRule(rule, relevantEvents);
      case 'compliance':
        return this.evaluateComplianceRule(rule, relevantEvents);
      default:
        return false;
    }
  }

  private async evaluateRuleForEvent(
    rule: MonitoringRule,
    event: any
  ): Promise<boolean> {
    // Evaluate rule against single event
    return this.eventMatchesConditions(event, rule.conditions);
  }

  private evaluateThresholdRule(rule: MonitoringRule, events: any[]): boolean {
    if (!rule.threshold) return false;

    const matchingEvents = events.filter((event) =>
      this.eventMatchesConditions(event, rule.conditions)
    );

    const rate = events.length > 0 ? matchingEvents.length / events.length : 0;
    return rate >= rule.threshold;
  }

  private evaluateAnomalyRule(rule: MonitoringRule, events: any[]): boolean {
    // Compare current activity with historical baseline
    if (this.metrics.length < 5) return false; // Need historical data

    const matchingEvents = events.filter((event) =>
      this.eventMatchesConditions(event, rule.conditions)
    );

    const currentRate =
      events.length > 0 ? matchingEvents.length / events.length : 0;

    // Calculate historical baseline
    const historical = this.metrics.slice(-10);
    const historicalRates = historical.map((m) => {
      const historicalEvents = this.eventBuffer.filter(
        (e) =>
          e.timestamp >= m.timestamp - rule.timeWindow &&
          e.timestamp < m.timestamp
      );
      const historicalMatching = historicalEvents.filter((event) =>
        this.eventMatchesConditions(event, rule.conditions)
      );
      return historicalEvents.length > 0
        ? historicalMatching.length / historicalEvents.length
        : 0;
    });

    const baseline =
      historicalRates.reduce((sum, rate) => sum + rate, 0) /
      historicalRates.length;
    const threshold = rule.threshold || 0.2; // 20% deviation default

    return Math.abs(currentRate - baseline) > threshold;
  }

  private evaluatePatternRule(rule: MonitoringRule, events: any[]): boolean {
    const matchingEvents = events.filter((event) =>
      this.eventMatchesConditions(event, rule.conditions)
    );

    return matchingEvents.length >= (rule.threshold || 1);
  }

  private evaluateComplianceRule(rule: MonitoringRule, events: any[]): boolean {
    const matchingEvents = events.filter((event) =>
      this.eventMatchesConditions(event, rule.conditions)
    );

    // Compliance violations are typically any occurrence
    return matchingEvents.length > 0;
  }

  private eventMatchesConditions(
    event: any,
    conditions: MonitoringCondition[]
  ): boolean {
    for (const condition of conditions) {
      if (!this.evaluateCondition(event, condition)) {
        return false;
      }
    }
    return true;
  }

  private evaluateCondition(
    event: any,
    condition: MonitoringCondition
  ): boolean {
    const fieldValue = this.getFieldValue(event, condition.field);
    const conditionValue = condition.value;

    switch (condition.operator) {
      case 'equals':
        return fieldValue === conditionValue;
      case 'not_equals':
        return fieldValue !== conditionValue;
      case 'greater_than':
        return Number(fieldValue) > Number(conditionValue);
      case 'less_than':
        return Number(fieldValue) < Number(conditionValue);
      case 'contains':
        return String(fieldValue).includes(String(conditionValue));
      case 'regex':
        return new RegExp(String(conditionValue)).test(String(fieldValue));
      default:
        return false;
    }
  }

  private getFieldValue(event: any, field: string): any {
    const parts = field.split('.');
    let value = event;

    for (const part of parts) {
      if (value && typeof value === 'object') {
        value = value[part];
      } else {
        return undefined;
      }
    }

    return value;
  }

  private async triggerAlert(
    rule: MonitoringRule,
    relatedEvents: any[] = []
  ): Promise<void> {
    const alertId = `alert_${Date.now()}_${rule.id}`;

    const alert: AuditAlert = {
      id: alertId,
      type: rule.type as any,
      severity: rule.severity,
      title: rule.name,
      description: rule.description,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
      metadata: {
        ruleId: rule.id,
        ruleType: rule.type,
        timeWindow: rule.timeWindow,
        threshold: rule.threshold,
        conditions: rule.conditions,
      },
      relatedEvents: relatedEvents.map((e) => e.id || `event_${e.timestamp}`),
    };

    this.alerts.set(alertId, alert);

    // Keep alerts manageable
    if (this.alerts.size > this.maxAlerts) {
      const oldestAlerts = Array.from(this.alerts.values())
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, this.alerts.size - this.maxAlerts);

      oldestAlerts.forEach((alert) => this.alerts.delete(alert.id));
    }

    // Execute actions
    await this.executeActions(rule.actions, alert);

    console.log(`Audit alert triggered: ${alert.title} (${alert.severity})`);
  }

  private async executeActions(
    actions: MonitoringAction[],
    alert: AuditAlert
  ): Promise<void> {
    for (const action of actions) {
      if (!action.enabled) continue;

      try {
        await this.executeAction(action, alert);
      } catch (error) {
        console.error(`Failed to execute action ${action.type}:`, error);
      }
    }
  }

  private async executeAction(
    action: MonitoringAction,
    alert: AuditAlert
  ): Promise<void> {
    switch (action.type) {
      case 'alert':
        console.log(
          `AUDIT ALERT [${alert.severity.toUpperCase()}]: ${alert.title}`
        );
        console.log(`Description: ${alert.description}`);
        console.log(`Related Events: ${alert.relatedEvents.length}`);
        break;

      case 'notification':
        console.log(`AUDIT NOTIFICATION: ${alert.title}`);
        // In production, send to configured channels
        break;

      case 'webhook':
        if (action.config.url) {
          await fetch(action.config.url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(alert),
          });
        }
        break;

      case 'email':
        console.log(`AUDIT EMAIL: ${alert.title} - ${alert.severity}`);
        // In production, send email notification
        break;

      case 'slack':
        console.log(`AUDIT SLACK: ${alert.title} - ${alert.severity}`);
        // In production, send Slack notification
        break;

      case 'block':
        console.log(`AUDIT BLOCK: Blocking for ${action.config.duration}ms`);
        // In production, implement blocking mechanism
        break;
    }
  }

  acknowledgeAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = acknowledgedBy;
      alert.acknowledgedAt = Date.now();
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string, resolvedBy: string): boolean {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.resolved = true;
      alert.resolvedBy = resolvedBy;
      alert.resolvedAt = Date.now();
      return true;
    }
    return false;
  }

  getAlerts(
    filters: {
      severity?: string;
      type?: string;
      acknowledged?: boolean;
      resolved?: boolean;
      timeRange?: number;
    } = {}
  ): AuditAlert[] {
    let alerts = Array.from(this.alerts.values());

    if (filters.severity) {
      alerts = alerts.filter((a) => a.severity === filters.severity);
    }
    if (filters.type) {
      alerts = alerts.filter((a) => a.type === filters.type);
    }
    if (filters.acknowledged !== undefined) {
      alerts = alerts.filter((a) => a.acknowledged === filters.acknowledged);
    }
    if (filters.resolved !== undefined) {
      alerts = alerts.filter((a) => a.resolved === filters.resolved);
    }
    if (filters.timeRange) {
      const cutoff = Date.now() - filters.timeRange;
      alerts = alerts.filter((a) => a.timestamp >= cutoff);
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  getMetrics(timeRangeMinutes: number = 60): AuditMetrics[] {
    const cutoff = Date.now() - timeRangeMinutes * 60 * 1000;
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  getStatistics(): {
    totalAlerts: number;
    activeAlerts: number;
    alertsBySeverity: Record<string, number>;
    alertsByType: Record<string, number>;
    totalEvents: number;
    averageFailureRate: number;
    monitoringActive: boolean;
  } {
    const stats = {
      totalAlerts: this.alerts.size,
      activeAlerts: 0,
      alertsBySeverity: {} as Record<string, number>,
      alertsByType: {} as Record<string, number>,
      totalEvents: 0,
      averageFailureRate: 0,
      monitoringActive: this.isMonitoring,
    };

    // Count alerts
    for (const alert of this.alerts.values()) {
      if (!alert.resolved) stats.activeAlerts++;

      stats.alertsBySeverity[alert.severity] =
        (stats.alertsBySeverity[alert.severity] || 0) + 1;

      stats.alertsByType[alert.type] =
        (stats.alertsByType[alert.type] || 0) + 1;
    }

    // Calculate event metrics
    if (this.metrics.length > 0) {
      stats.totalEvents = this.metrics.reduce(
        (sum, m) => sum + m.totalEvents,
        0
      );
      stats.averageFailureRate =
        this.metrics.reduce((sum, m) => sum + m.failureRate, 0) /
        this.metrics.length;
    }

    return stats;
  }

  addRule(rule: MonitoringRule): void {
    this.rules.set(rule.id, rule);
  }

  updateRule(ruleId: string, updates: Partial<MonitoringRule>): boolean {
    const rule = this.rules.get(ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  destroy(): void {
    this.stopMonitoring();
    this.alerts.clear();
    this.rules.clear();
    this.metrics = [];
    this.eventBuffer = [];
  }
}

// Export singleton instance
let auditMonitoringService: AuditMonitoringService | null = null;

export function getAuditMonitoringService(): AuditMonitoringService {
  if (!auditMonitoringService) {
    auditMonitoringService = new AuditMonitoringService();
  }
  return auditMonitoringService;
}

export {
  AuditMonitoringService,
  type AuditAlert,
  type MonitoringRule,
  type AuditMetrics,
};
