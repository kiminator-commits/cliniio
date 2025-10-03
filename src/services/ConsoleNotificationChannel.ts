import {
  NotificationChannel,
  Notification,
} from './PerformanceAlertingService';

/**
 * Console Notification Channel
 * Sends performance alerts to browser console
 */
export class ConsoleNotificationChannel implements NotificationChannel {
  id = 'console';
  name = 'Console Notifications';

  async send(notification: Notification): Promise<void> {
    const timestamp = notification.timestamp.toLocaleString();
    const severity = notification.severity.toUpperCase();

    const message = `🚨 PERFORMANCE ALERT [${severity}]
📊 ${notification.title}
📈 Metric: ${notification.metric}
📊 Value: ${notification.value} (threshold: ${notification.threshold})
⏰ Time: ${timestamp}
📝 Message: ${notification.message}`;

    if (notification.severity === 'critical') {
      console.error(message);
    } else {
      console.warn(message);
    }
  }
}
