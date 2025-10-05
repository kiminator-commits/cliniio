// Real-time security monitoring and alerting system
interface SecurityMetrics {
  timestamp: number;
  totalRequests: number;
  successfulLogins: number;
  failedLogins: number;
  rateLimitHits: number;
  securityEvents: number;
  threatDetections: number;
  averageResponseTime: number;
  errorRate: number;
}

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  cooldownMinutes: number;
  lastTriggered?: number;
}

interface SecurityAlert {
  id: string;
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  details: any;
  timestamp: number;
  acknowledged: boolean;
  resolved: boolean;
}

class SecurityMonitoringService {
  private metrics: SecurityMetrics[] = [];
  private alerts: SecurityAlert[] = [];
  private alertRules: AlertRule[] = [];
  private maxMetricsHistory = 1000;
  private maxAlertsHistory = 500;
  private isMonitoring = false;
  private monitoringInterval: number | null = null;

  constructor() {
    this.initializeDefaultAlertRules();
  }

  private initializeDefaultAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_failure_rate',
        name: 'High Login Failure Rate',
        condition: 'failedLogins / totalRequests > threshold',
        threshold: 0.5, // 50% failure rate
        severity: 'high',
        enabled: true,
        cooldownMinutes: 15,
      },
      {
        id: 'rate_limit_spike',
        name: 'Rate Limit Spike',
        condition: 'rateLimitHits > threshold',
        threshold: 100, // 100 rate limit hits in 5 minutes
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 10,
      },
      {
        id: 'threat_detection_spike',
        name: 'Threat Detection Spike',
        condition: 'threatDetections > threshold',
        threshold: 10, // 10 threats in 5 minutes
        severity: 'critical',
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        id: 'high_response_time',
        name: 'High Response Time',
        condition: 'averageResponseTime > threshold',
        threshold: 5000, // 5 seconds
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 10,
      },
      {
        id: 'error_rate_spike',
        name: 'Error Rate Spike',
        condition: 'errorRate > threshold',
        threshold: 0.1, // 10% error rate
        severity: 'high',
        enabled: true,
        cooldownMinutes: 5,
      },
      {
        id: 'unusual_activity',
        name: 'Unusual Activity Pattern',
        condition: 'totalRequests > threshold',
        threshold: 1000, // 1000 requests in 5 minutes
        severity: 'medium',
        enabled: true,
        cooldownMinutes: 15,
      },
    ];
  }

  startMonitoring(intervalMs: number = 300000): void {
    // 5 minutes default
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
      this.evaluateAlertRules();
    }, intervalMs);

    console.log('Security monitoring started');
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    console.log('Security monitoring stopped');
  }

  private async collectMetrics(): Promise<void> {
    try {
      // This would typically query your database for metrics
      // For now, we'll simulate metrics collection
      const now = Date.now();
      const fiveMinutesAgo = now - 5 * 60 * 1000;

      // Simulate metrics collection
      const metrics: SecurityMetrics = {
        timestamp: now,
        totalRequests: Math.floor(Math.random() * 100) + 50,
        successfulLogins: Math.floor(Math.random() * 80) + 20,
        failedLogins: Math.floor(Math.random() * 20) + 5,
        rateLimitHits: Math.floor(Math.random() * 10),
        securityEvents: Math.floor(Math.random() * 5),
        threatDetections: Math.floor(Math.random() * 3),
        averageResponseTime: Math.floor(Math.random() * 2000) + 500,
        errorRate: Math.random() * 0.1,
      };

      this.metrics.push(metrics);

      // Keep only recent metrics
      if (this.metrics.length > this.maxMetricsHistory) {
        this.metrics = this.metrics.slice(-this.maxMetricsHistory);
      }

      console.log('Security metrics collected:', metrics);
    } catch (error) {
      console.error('Failed to collect security metrics:', error);
    }
  }

  private evaluateAlertRules(): void {
    if (this.metrics.length === 0) return;

    const latestMetrics = this.metrics[this.metrics.length - 1];

    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      // Check cooldown
      if (
        rule.lastTriggered &&
        Date.now() - rule.lastTriggered < rule.cooldownMinutes * 60 * 1000
      ) {
        continue;
      }

      const shouldAlert = this.evaluateCondition(
        rule.condition,
        latestMetrics,
        rule.threshold
      );

      if (shouldAlert) {
        this.triggerAlert(rule, latestMetrics);
        rule.lastTriggered = Date.now();
      }
    }
  }

  private evaluateCondition(
    condition: string,
    metrics: SecurityMetrics,
    threshold: number
  ): boolean {
    try {
      // Simple condition evaluation
      // In production, you'd want a more robust expression evaluator
      const context = {
        ...metrics,
        threshold,
      };

      // Replace variables in condition
      let expression = condition;
      expression = expression.replace(
        /failedLogins/g,
        metrics.failedLogins.toString()
      );
      expression = expression.replace(
        /totalRequests/g,
        metrics.totalRequests.toString()
      );
      expression = expression.replace(
        /rateLimitHits/g,
        metrics.rateLimitHits.toString()
      );
      expression = expression.replace(
        /threatDetections/g,
        metrics.threatDetections.toString()
      );
      expression = expression.replace(
        /averageResponseTime/g,
        metrics.averageResponseTime.toString()
      );
      expression = expression.replace(
        /errorRate/g,
        metrics.errorRate.toString()
      );
      expression = expression.replace(/threshold/g, threshold.toString());

      // Evaluate the expression
      return eval(expression);
    } catch (error) {
      console.error('Failed to evaluate alert condition:', error);
      return false;
    }
  }

  private triggerAlert(rule: AlertRule, metrics: SecurityMetrics): void {
    const alert: SecurityAlert = {
      id: `alert_${Date.now()}_${rule.id}`,
      ruleId: rule.id,
      severity: rule.severity,
      message: this.generateAlertMessage(rule, metrics),
      details: {
        rule,
        metrics,
        timestamp: Date.now(),
      },
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
    };

    this.alerts.push(alert);

    // Keep only recent alerts
    if (this.alerts.length > this.maxAlertsHistory) {
      this.alerts = this.alerts.slice(-this.maxAlertsHistory);
    }

    // Send alert notification
    this.sendAlertNotification(alert);

    console.log(`Security alert triggered: ${alert.message}`);
  }

  private generateAlertMessage(
    rule: AlertRule,
    metrics: SecurityMetrics
  ): string {
    switch (rule.id) {
      case 'high_failure_rate':
        return `High login failure rate detected: ${((metrics.failedLogins / metrics.totalRequests) * 100).toFixed(1)}%`;
      case 'rate_limit_spike':
        return `Rate limit spike detected: ${metrics.rateLimitHits} hits in 5 minutes`;
      case 'threat_detection_spike':
        return `Threat detection spike: ${metrics.threatDetections} threats detected in 5 minutes`;
      case 'high_response_time':
        return `High response time detected: ${metrics.averageResponseTime}ms average`;
      case 'error_rate_spike':
        return `Error rate spike: ${(metrics.errorRate * 100).toFixed(1)}% error rate`;
      case 'unusual_activity':
        return `Unusual activity detected: ${metrics.totalRequests} requests in 5 minutes`;
      default:
        return `Security alert: ${rule.name}`;
    }
  }

  private async sendAlertNotification(alert: SecurityAlert): Promise<void> {
    try {
      // In production, you would send to various notification channels
      // For now, we'll just log the alert

      const notification = {
        alert,
        channels: ['console', 'webhook', 'email'], // Configure based on severity
        timestamp: new Date().toISOString(),
      };

      console.log('Security alert notification:', notification);

      // Example webhook notification
      if (Deno.env.get('SECURITY_WEBHOOK_URL')) {
        await fetch(Deno.env.get('SECURITY_WEBHOOK_URL')!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification),
        });
      }
    } catch (error) {
      console.error('Failed to send alert notification:', error);
    }
  }

  recordSecurityEvent(eventType: string, severity: string, details: any): void {
    const event = {
      type: eventType,
      severity,
      details,
      timestamp: Date.now(),
    };

    // Update metrics
    if (this.metrics.length > 0) {
      this.metrics[this.metrics.length - 1].securityEvents++;
    }

    console.log('Security event recorded:', event);
  }

  recordLoginAttempt(success: boolean, responseTime: number): void {
    if (this.metrics.length > 0) {
      const metrics = this.metrics[this.metrics.length - 1];
      metrics.totalRequests++;

      if (success) {
        metrics.successfulLogins++;
      } else {
        metrics.failedLogins++;
      }

      // Update average response time
      const totalRequests = metrics.totalRequests;
      const currentAvg = metrics.averageResponseTime;
      metrics.averageResponseTime =
        (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
    }
  }

  recordRateLimitHit(): void {
    if (this.metrics.length > 0) {
      this.metrics[this.metrics.length - 1].rateLimitHits++;
    }
  }

  recordThreatDetection(): void {
    if (this.metrics.length > 0) {
      this.metrics[this.metrics.length - 1].threatDetections++;
    }
  }

  getMetrics(timeRangeMinutes: number = 60): SecurityMetrics[] {
    const cutoff = Date.now() - timeRangeMinutes * 60 * 1000;
    return this.metrics.filter((m) => m.timestamp >= cutoff);
  }

  getAlerts(timeRangeMinutes: number = 1440): SecurityAlert[] {
    // 24 hours default
    const cutoff = Date.now() - timeRangeMinutes * 60 * 1000;
    return this.alerts.filter((a) => a.timestamp >= cutoff);
  }

  getActiveAlerts(): SecurityAlert[] {
    return this.alerts.filter((a) => !a.resolved);
  }

  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      return true;
    }
    return false;
  }

  getDashboardData(): {
    metrics: SecurityMetrics[];
    alerts: SecurityAlert[];
    activeAlerts: SecurityAlert[];
    alertRules: AlertRule[];
    isMonitoring: boolean;
  } {
    return {
      metrics: this.getMetrics(60), // Last hour
      alerts: this.getAlerts(1440), // Last 24 hours
      activeAlerts: this.getActiveAlerts(),
      alertRules: this.alertRules,
      isMonitoring: this.isMonitoring,
    };
  }

  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): boolean {
    const rule = this.alertRules.find((r) => r.id === ruleId);
    if (rule) {
      Object.assign(rule, updates);
      return true;
    }
    return false;
  }

  addAlertRule(rule: Omit<AlertRule, 'id'>): string {
    const newRule: AlertRule = {
      ...rule,
      id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.alertRules.push(newRule);
    return newRule.id;
  }

  removeAlertRule(ruleId: string): boolean {
    const index = this.alertRules.findIndex((r) => r.id === ruleId);
    if (index !== -1) {
      this.alertRules.splice(index, 1);
      return true;
    }
    return false;
  }
}

// Export singleton instance
let securityMonitoringService: SecurityMonitoringService | null = null;

export function getSecurityMonitoringService(): SecurityMonitoringService {
  if (!securityMonitoringService) {
    securityMonitoringService = new SecurityMonitoringService();

    // Start monitoring if enabled
    if (Deno.env.get('ENABLE_SECURITY_MONITORING') === 'true') {
      securityMonitoringService.startMonitoring();
    }
  }

  return securityMonitoringService;
}

export {
  SecurityMonitoringService,
  type SecurityMetrics,
  type SecurityAlert,
  type AlertRule,
};
