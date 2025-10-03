import { logger } from '../../utils/_core/logger';

export interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: {
    operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte' | 'contains' | 'regex';
    threshold: number | string;
    timeWindow: number; // seconds
  };
  severity: 'info' | 'warning' | 'critical';
  enabled: boolean;
  tags?: Record<string, string>;
  metadata?: Record<string, unknown>;
}

export interface Alert {
  id: string;
  ruleId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  status: 'firing' | 'resolved';
  triggeredAt: Date;
  resolvedAt?: Date;
  value: number | string;
  threshold: number | string;
  tags: Record<string, string>;
  metadata?: Record<string, unknown>;
  notifications: AlertNotification[];
}

export interface AlertNotification {
  id: string;
  channel: 'email' | 'slack' | 'webhook' | 'console';
  status: 'pending' | 'sent' | 'failed';
  sentAt?: Date;
  error?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'console';
  config: Record<string, unknown>;
  enabled: boolean;
}

export class AlertingService {
  private static instance: AlertingService;
  private rules: Map<string, AlertRule> = new Map();
  private alerts: Map<string, Alert> = new Map();
  private channels: Map<string, NotificationChannel> = new Map();
  private evaluationInterval: NodeJS.Timeout | null = null;
  private readonly EVALUATION_INTERVAL = 30000; // 30 seconds

  private constructor() {
    this.initializeDefaultChannels();
    this.startEvaluation();
  }

  static getInstance(): AlertingService {
    if (!AlertingService.instance) {
      AlertingService.instance = new AlertingService();
    }
    return AlertingService.instance;
  }

  /**
   * Add an alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
    logger.info(`Alert rule added: ${rule.name}`, rule);
  }

  /**
   * Update an alert rule
   */
  updateRule(ruleId: string, updates: Partial<AlertRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      const updatedRule = { ...rule, ...updates };
      this.rules.set(ruleId, updatedRule);
      logger.info(`Alert rule updated: ${rule.name}`, updatedRule);
    }
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.delete(ruleId);
      logger.info(`Alert rule removed: ${rule.name}`);
    }
  }

  /**
   * Get all alert rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.status === 'firing'
    );
  }

  /**
   * Get all alerts
   */
  getAllAlerts(): Alert[] {
    return Array.from(this.alerts.values());
  }

  /**
   * Resolve an alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.get(alertId);
    if (alert && alert.status === 'firing') {
      alert.status = 'resolved';
      alert.resolvedAt = new Date();
      this.alerts.set(alertId, alert);

      logger.info(`Alert resolved: ${alert.title}`, alert);
    }
  }

  /**
   * Add a notification channel
   */
  addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.id, channel);
    logger.info(`Notification channel added: ${channel.name}`, channel);
  }

  /**
   * Send a test notification
   */
  async sendTestNotification(channelId: string): Promise<boolean> {
    const channel = this.channels.get(channelId);
    if (!channel || !channel.enabled) {
      return false;
    }

    const testAlert: Alert = {
      id: 'test_alert',
      ruleId: 'test_rule',
      title: 'Test Alert',
      message:
        'This is a test alert to verify notification channel configuration',
      severity: 'info',
      status: 'firing',
      triggeredAt: new Date(),
      value: 'test',
      threshold: 'test',
      tags: {},
      notifications: [],
    };

    return this.sendNotification(testAlert, channel);
  }

  /**
   * Start alert evaluation
   */
  private startEvaluation(): void {
    this.evaluationInterval = setInterval(() => {
      this.evaluateAlerts();
    }, this.EVALUATION_INTERVAL);

    logger.info('Alert evaluation started');
  }

  /**
   * Stop alert evaluation
   */
  stopEvaluation(): void {
    if (this.evaluationInterval) {
      clearInterval(this.evaluationInterval);
      this.evaluationInterval = null;
      logger.info('Alert evaluation stopped');
    }
  }

  /**
   * Evaluate all alert rules
   */
  private async evaluateAlerts(): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      try {
        await this.evaluateRule(rule);
      } catch (error) {
        logger.error(`Error evaluating rule ${rule.name}:`, error);
      }
    }
  }

  /**
   * Evaluate a specific rule
   */
  private async evaluateRule(rule: AlertRule): Promise<void> {
    // This is a simplified implementation
    // In a real system, you'd query your metrics store
    const currentValue = this.getCurrentMetricValue(rule.metric);

    if (currentValue === null) return;

    const shouldTrigger = this.evaluateCondition(currentValue, rule.condition);

    if (shouldTrigger) {
      await this.triggerAlert(rule, currentValue);
    } else {
      await this.resolveAlertIfExists(rule);
    }
  }

  /**
   * Get current metric value (simplified)
   */
  private getCurrentMetricValue(metric: string): number | string | null {
    // This would query your actual metrics store
    // For now, return a mock value
    const mockValues: Record<string, number> = {
      response_time: Math.random() * 2000,
      error_rate: Math.random() * 10,
      memory_usage: Math.random() * 500 * 1024 * 1024,
      cpu_usage: Math.random() * 100,
    };

    return mockValues[metric] || null;
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    value: number | string,
    condition: AlertRule['condition']
  ): boolean {
    const { operator, threshold } = condition;

    switch (operator) {
      case 'gt':
        return typeof value === 'number' && value > (threshold as number);
      case 'lt':
        return typeof value === 'number' && value < (threshold as number);
      case 'eq':
        return value === threshold;
      case 'gte':
        return typeof value === 'number' && value >= (threshold as number);
      case 'lte':
        return typeof value === 'number' && value <= (threshold as number);
      case 'contains':
        return typeof value === 'string' && value.includes(threshold as string);
      case 'regex':
        return (
          typeof value === 'string' &&
          new RegExp(threshold as string).test(value)
        );
      default:
        return false;
    }
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(
    rule: AlertRule,
    value: number | string
  ): Promise<void> {
    const alertId = `alert_${rule.id}_${Date.now()}`;

    // Check if alert already exists
    const existingAlert = Array.from(this.alerts.values()).find(
      (a) => a.ruleId === rule.id && a.status === 'firing'
    );

    if (existingAlert) {
      return; // Alert already firing
    }

    const alert: Alert = {
      id: alertId,
      ruleId: rule.id,
      title: rule.name,
      message: `${rule.description}: ${value} ${rule.condition.operator} ${rule.condition.threshold}`,
      severity: rule.severity,
      status: 'firing',
      triggeredAt: new Date(),
      value,
      threshold: rule.condition.threshold,
      tags: rule.tags || {},
      metadata: rule.metadata,
      notifications: [],
    };

    this.alerts.set(alertId, alert);

    // Send notifications
    await this.sendNotifications(alert);

    logger.warn(`Alert triggered: ${alert.title}`, alert);
  }

  /**
   * Resolve alert if it exists
   */
  private async resolveAlertIfExists(rule: AlertRule): Promise<void> {
    const existingAlert = Array.from(this.alerts.values()).find(
      (a) => a.ruleId === rule.id && a.status === 'firing'
    );

    if (existingAlert) {
      this.resolveAlert(existingAlert.id);
    }
  }

  /**
   * Send notifications for an alert
   */
  private async sendNotifications(alert: Alert): Promise<void> {
    for (const channel of this.channels.values()) {
      if (!channel.enabled) continue;

      try {
        const success = await this.sendNotification(alert, channel);

        const notification: AlertNotification = {
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          channel: channel.type,
          status: success ? 'sent' : 'failed',
          sentAt: success ? new Date() : undefined,
          error: success ? undefined : 'Failed to send notification',
          metadata: { channelId: channel.id },
        };

        alert.notifications.push(notification);
      } catch (error) {
        logger.error(`Failed to send notification via ${channel.name}:`, error);
      }
    }
  }

  /**
   * Send notification via a specific channel
   */
  private async sendNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<boolean> {
    try {
      switch (channel.type) {
        case 'console':
          return this.sendConsoleNotification(alert);
        case 'email':
          return this.sendEmailNotification(alert, channel);
        case 'slack':
          return this.sendSlackNotification(alert, channel);
        case 'webhook':
          return this.sendWebhookNotification(alert, channel);
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Notification failed for ${channel.type}:`, error);
      return false;
    }
  }

  /**
   * Send console notification
   */
  private sendConsoleNotification(alert: Alert): boolean {
    const severity = alert.severity.toUpperCase();
    const message = `[${severity}] ${alert.title}: ${alert.message}`;

    if (alert.severity === 'critical') {
      console.error(message);
    } else if (alert.severity === 'warning') {
      console.warn(message);
    } else {
      console.log(message);
    }

    return true;
  }

  /**
   * Send email notification (mock)
   */
  private async sendEmailNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<boolean> {
    // Mock email sending
    logger.info(`Email notification sent: ${alert.title}`, {
      to: channel.config.email,
      subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
      body: alert.message,
    });

    return true;
  }

  /**
   * Send Slack notification (mock)
   */
  private async sendSlackNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<boolean> {
    // Mock Slack sending
    logger.info(`Slack notification sent: ${alert.title}`, {
      channel: channel.config.channel,
      webhook: channel.config.webhook,
      message: alert.message,
    });

    return true;
  }

  /**
   * Send webhook notification (mock)
   */
  private async sendWebhookNotification(
    alert: Alert,
    channel: NotificationChannel
  ): Promise<boolean> {
    // Mock webhook sending
    logger.info(`Webhook notification sent: ${alert.title}`, {
      url: channel.config.url,
      payload: {
        alert: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: alert.triggeredAt,
      },
    });

    return true;
  }

  /**
   * Initialize default notification channels
   */
  private initializeDefaultChannels(): void {
    // Console channel (always enabled)
    this.addChannel({
      id: 'console',
      name: 'Console',
      type: 'console',
      config: {},
      enabled: true,
    });

    // Email channel (disabled by default)
    this.addChannel({
      id: 'email',
      name: 'Email',
      type: 'email',
      config: {
        email: 'admin@cliniio.com',
        smtp: {
          host: 'smtp.example.com',
          port: 587,
          secure: false,
        },
      },
      enabled: false,
    });
  }
}

// Singleton instance
export const alertingService = AlertingService.getInstance();
