import { performanceMonitor } from './monitoring/PerformanceMonitor';
import { PerformanceAlert } from './monitoring/PerformanceMonitor';

/**
 * Performance Alerting Service
 * Handles intelligent alerting and notification management
 */
export class PerformanceAlertingService {
  private static instance: PerformanceAlertingService | null = null;
  private alertRules: Map<string, AlertRule> = new Map();
  private notificationChannels: NotificationChannel[] = [];
  private alertHistory: AlertHistory[] = [];
  private isEnabled = true;

  private constructor() {
    this.initializeDefaultRules();
    this.setupAlertSubscriptions();
  }

  static getInstance(): PerformanceAlertingService {
    if (!PerformanceAlertingService.instance) {
      PerformanceAlertingService.instance = new PerformanceAlertingService();
    }
    return PerformanceAlertingService.instance;
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultRules(): void {
    // Response time alerts
    this.addAlertRule({
      id: 'response_time_critical',
      name: 'Critical Response Time',
      metric: 'response_time',
      condition: { operator: 'gt', value: 5000 },
      severity: 'critical',
      cooldown: 300000, // 5 minutes
      enabled: true,
    });

    this.addAlertRule({
      id: 'response_time_warning',
      name: 'High Response Time',
      metric: 'response_time',
      condition: { operator: 'gt', value: 1000 },
      severity: 'warning',
      cooldown: 600000, // 10 minutes
      enabled: true,
    });

    // Memory usage alerts
    this.addAlertRule({
      id: 'memory_critical',
      name: 'Critical Memory Usage',
      metric: 'memory_usage',
      condition: { operator: 'gt', value: 500 * 1024 * 1024 }, // 500MB
      severity: 'critical',
      cooldown: 300000,
      enabled: true,
    });

    this.addAlertRule({
      id: 'memory_warning',
      name: 'High Memory Usage',
      metric: 'memory_usage',
      condition: { operator: 'gt', value: 200 * 1024 * 1024 }, // 200MB
      severity: 'warning',
      cooldown: 600000,
      enabled: true,
    });

    // Error rate alerts
    this.addAlertRule({
      id: 'error_rate_critical',
      name: 'Critical Error Rate',
      metric: 'error_rate',
      condition: { operator: 'gt', value: 10 },
      severity: 'critical',
      cooldown: 300000,
      enabled: true,
    });

    this.addAlertRule({
      id: 'error_rate_warning',
      name: 'High Error Rate',
      metric: 'error_rate',
      condition: { operator: 'gt', value: 5 },
      severity: 'warning',
      cooldown: 600000,
      enabled: true,
    });

    // Component mount time alerts
    this.addAlertRule({
      id: 'component_mount_critical',
      name: 'Critical Component Mount Time',
      metric: 'component_mount_time',
      condition: { operator: 'gt', value: 3000 },
      severity: 'critical',
      cooldown: 300000,
      enabled: true,
    });

    this.addAlertRule({
      id: 'component_mount_warning',
      name: 'Slow Component Mount Time',
      metric: 'component_mount_time',
      condition: { operator: 'gt', value: 1000 },
      severity: 'warning',
      cooldown: 600000,
      enabled: true,
    });
  }

  /**
   * Setup alert subscriptions
   */
  private setupAlertSubscriptions(): void {
    performanceMonitor.subscribeToAlerts((alert) => {
      this.handleAlert(alert);
    });
  }

  /**
   * Add an alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules.delete(ruleId);
  }

  /**
   * Add a notification channel
   */
  addNotificationChannel(channel: NotificationChannel): void {
    this.notificationChannels.push(channel);
  }

  /**
   * Remove a notification channel
   */
  removeNotificationChannel(channelId: string): void {
    this.notificationChannels = this.notificationChannels.filter(
      (c) => c.id !== channelId
    );
  }

  /**
   * Handle incoming alert
   */
  private async handleAlert(alert: PerformanceAlert): Promise<void> {
    if (!this.isEnabled) return;

    // Check if alert should be processed based on rules
    const rule = this.findMatchingRule(alert);
    if (!rule || !rule.enabled) return;

    // Check cooldown
    if (this.isInCooldown(rule.id, alert.timestamp)) return;

    // Process alert
    await this.processAlert(alert, rule);
  }

  /**
   * Find matching alert rule
   */
  private findMatchingRule(alert: PerformanceAlert): AlertRule | undefined {
    for (const rule of this.alertRules.values()) {
      if (rule.metric === alert.metric && rule.severity === alert.severity) {
        return rule;
      }
    }
    return undefined;
  }

  /**
   * Check if rule is in cooldown
   */
  private isInCooldown(ruleId: string, timestamp: Date): boolean {
    const lastAlert = this.alertHistory
      .filter((h) => h.ruleId === ruleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];

    if (!lastAlert) return false;

    const rule = this.alertRules.get(ruleId);
    if (!rule) return false;

    const timeSinceLastAlert =
      timestamp.getTime() - lastAlert.timestamp.getTime();
    return timeSinceLastAlert < rule.cooldown;
  }

  /**
   * Process alert
   */
  private async processAlert(
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    try {
      // Send notifications
      await this.sendNotifications(alert, rule);

      // Record in history
      this.alertHistory.push({
        id: `${rule.id}_${Date.now()}`,
        ruleId: rule.id,
        alertId: alert.id,
        timestamp: new Date(),
        processed: true,
      });

      // Keep only last 1000 history entries
      if (this.alertHistory.length > 1000) {
        this.alertHistory.splice(0, this.alertHistory.length - 1000);
      }

      console.log(
        `[PerformanceAlertingService] Processed alert: ${rule.name}`,
        {
          alertId: alert.id,
          ruleId: rule.id,
          severity: alert.severity,
          metric: alert.metric,
        }
      );
    } catch (error) {
      console.error(
        '[PerformanceAlertingService] Failed to process alert:',
        error
      );
    }
  }

  /**
   * Send notifications through all channels
   */
  private async sendNotifications(
    alert: PerformanceAlert,
    rule: AlertRule
  ): Promise<void> {
    const notification = this.createNotification(alert, rule);

    for (const channel of this.notificationChannels) {
      try {
        await channel.send(notification);
      } catch (error) {
        console.error(
          `[PerformanceAlertingService] Failed to send notification via ${channel.id}:`,
          error
        );
      }
    }
  }

  /**
   * Create notification from alert and rule
   */
  private createNotification(
    alert: PerformanceAlert,
    rule: AlertRule
  ): Notification {
    return {
      id: `${alert.id}_${Date.now()}`,
      title: `Performance Alert: ${rule.name}`,
      message: alert.message,
      severity: alert.severity,
      metric: alert.metric,
      value: alert.value,
      threshold: rule.condition.value,
      timestamp: alert.timestamp,
      tags: (alert as { tags?: string[] }).tags || [],
    };
  }

  /**
   * Enable alerting
   */
  enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disable alerting
   */
  disable(): void {
    this.isEnabled = false;
  }

  /**
   * Get alert statistics
   */
  getAlertStatistics(): AlertStatistics {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const recentAlerts = this.alertHistory.filter((h) => h.timestamp > last24h);
    const weeklyAlerts = this.alertHistory.filter((h) => h.timestamp > last7d);

    return {
      totalRules: this.alertRules.size,
      enabledRules: Array.from(this.alertRules.values()).filter(
        (r) => r.enabled
      ).length,
      totalAlerts24h: recentAlerts.length,
      totalAlerts7d: weeklyAlerts.length,
      activeChannels: this.notificationChannels.length,
      isEnabled: this.isEnabled,
    };
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 100): AlertHistory[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Clear alert history
   */
  clearHistory(): void {
    this.alertHistory = [];
  }
}

// Types
interface AlertRule {
  id: string;
  name: string;
  metric: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
    value: number;
  };
  severity: 'warning' | 'critical';
  cooldown: number; // milliseconds
  enabled: boolean;
}

export interface NotificationChannel {
  id: string;
  name: string;
  send: (notification: Notification) => Promise<void>;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  severity: 'warning' | 'critical';
  metric: string;
  value: number;
  threshold: number;
  timestamp: Date;
  tags: Record<string, string>;
}

interface AlertHistory {
  id: string;
  ruleId: string;
  alertId: string;
  timestamp: Date;
  processed: boolean;
}

interface AlertStatistics {
  totalRules: number;
  enabledRules: number;
  totalAlerts24h: number;
  totalAlerts7d: number;
  activeChannels: number;
  isEnabled: boolean;
}

// Export singleton instance
export const performanceAlertingService =
  PerformanceAlertingService.getInstance();
