import { NotificationScheduler } from './NotificationScheduler';
import { NotificationProcessorService } from './NotificationProcessorService';
import { NotificationRetryService } from './NotificationRetryService';

/**
 * Notification Scheduler Service - Main Orchestrator
 * Coordinates notification operations using focused services
 */
export class NotificationSchedulerService {
  /**
   * Process scheduled notifications
   */
  static async processScheduledNotifications(): Promise<number> {
    return NotificationProcessorService.processScheduledNotifications();
  }

  /**
   * Process queued email alerts
   */
  static async processEmailAlerts(): Promise<number> {
    return NotificationProcessorService.processEmailAlerts();
  }

  /**
   * Retry failed notifications
   */
  static async retryFailedNotifications(): Promise<number> {
    return NotificationRetryService.retryFailedNotifications();
  }

  /**
   * Schedule notification for later processing
   */
  static async scheduleNotification(notification: {
    id: string;
    incidentId: string;
    facilityId: string;
    scheduledFor: string;
    type: string;
    data: Record<string, unknown>;
  }): Promise<string> {
    return NotificationScheduler.scheduleNotification(notification);
  }
}
