import { BIFailureNotificationDataProvider } from './data/BIFailureNotificationDataProvider';
import { BIFailureErrorHandler } from '../failure/BIFailureErrorHandler';
import { NotificationScheduler } from './NotificationScheduler';
import { EmailNotificationService } from './EmailNotificationService';
import { WebhookNotificationService } from './WebhookNotificationService';

/**
 * Notification Processor Service
 * Orchestrates notification processing using focused services
 */
export class NotificationProcessorService {
  /**
   * Process scheduled notifications
   */
  static async processScheduledNotifications(): Promise<number> {
    try {
      const scheduledNotifications =
        await NotificationScheduler.getScheduledNotifications();
      let processedCount = 0;

      for (const notification of scheduledNotifications) {
        try {
          await this.processNotification(notification);
          processedCount++;
        } catch (error) {
          console.error(
            'Failed to process scheduled notification:',
            notification.id,
            error
          );

          // Log processing failure
          await BIFailureNotificationDataProvider.logNotificationAuditEvent(
            notification.id,
            'processing_failed',
            `Failed to process: ${error instanceof Error ? error.message : 'Unknown error'}`
          );
        }
      }

      return processedCount;
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'process scheduled notifications'
      );
      return 0;
    }
  }

  /**
   * Process queued email alerts
   */
  static async processEmailAlerts(): Promise<number> {
    try {
      const pendingAlerts =
        await BIFailureNotificationDataProvider.getPendingEmailAlerts();
      let processedCount = 0;

      for (const alert of pendingAlerts) {
        try {
          await EmailNotificationService.processEmailAlert(alert);
          processedCount++;
        } catch (error) {
          console.error('Failed to process email alert:', alert.id, error);

          // Update alert status to failed
          await BIFailureNotificationDataProvider.updateEmailAlertStatus(
            alert.id,
            'failed',
            alert.retryCount + 1
          );
        }
      }

      return processedCount;
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'process email alerts'
      );
      return 0;
    }
  }

  /**
   * Process a single notification
   */
  private static async processNotification(notification: {
    id: string;
    incidentId: string;
    facilityId: string;
    type: string;
    data: Record<string, unknown>;
  }): Promise<void> {
    try {
      // Update status to processing
      await NotificationScheduler.updateNotificationStatus(
        notification.id,
        'processing'
      );

      // Process based on notification type
      switch (notification.type) {
        case 'email':
          await EmailNotificationService.processEmailNotification(notification);
          break;
        case 'webhook':
          await WebhookNotificationService.processWebhookNotification(
            notification
          );
          break;
        default:
          throw new Error(`Unknown notification type: ${notification.type}`);
      }

      // Update status to completed
      await NotificationScheduler.updateNotificationStatus(
        notification.id,
        'completed'
      );

      // Log successful processing
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        notification.id,
        'processed',
        'Notification processed successfully'
      );
    } catch (error) {
      // Update status to failed
      await NotificationScheduler.updateNotificationStatus(
        notification.id,
        'failed'
      );

      // Log processing failure
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        notification.id,
        'processing_failed',
        `Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );

      throw error;
    }
  }
}
