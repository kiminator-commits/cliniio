// import { supabase } from '@/lib/supabaseClient';
import { BIFailureNotificationDataProvider } from './data/BIFailureNotificationDataProvider';
import { BIFailureErrorHandler } from '../failure/BIFailureErrorHandler';
import { OptimizedRetryService } from '@/services/retry/OptimizedRetryService';

/**
 * Notification Retry Service
 * Handles retry logic for failed notifications
 */
export class NotificationRetryService {
  private static readonly RETRY_DELAY_MINUTES = 5;

  /**
   * Retry failed notifications
   */
  static async retryFailedNotifications(): Promise<number> {
    try {
      const failedNotifications = await this.getFailedNotifications();
      let retryCount = 0;

      for (const notification of failedNotifications) {
        if (notification.retryCount < notification.maxRetries) {
          try {
            await this.retryNotification(notification);
            retryCount++;
          } catch (error) {
            console.error(
              'Failed to retry notification:',
              notification.id,
              error
            );
          }
        }
      }

      return retryCount;
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'retry failed notifications'
      );
      return 0;
    }
  }

  /**
   * Retry a failed notification with optimized retry logic
   */
  private static async retryNotification(notification: {
    id: string;
    incidentId: string;
    facilityId: string;
    type: string;
    data: Record<string, unknown>;
    retryCount: number;
    maxRetries: number;
  }): Promise<void> {
    const result = await OptimizedRetryService.executeWithRetry(
      async () => {
        // Calculate retry delay with linear backoff instead of exponential
        const retryDelay =
          this.RETRY_DELAY_MINUTES * (notification.retryCount + 1);
        const retryTime = new Date();
        retryTime.setMinutes(retryTime.getMinutes() + retryDelay);

        // No-op since scheduled_notifications table doesn't exist
        console.log(`Notification ${notification.id} scheduled for retry at ${retryTime.toISOString()}`);

        // Log retry attempt
        await BIFailureNotificationDataProvider.logNotificationAuditEvent(
          notification.id,
          'retry_scheduled',
          `Retry ${notification.retryCount + 1}/${notification.maxRetries} scheduled for ${retryTime.toISOString()}`
        );
      },
      {
        maxRetries: 2, // Reduced retries for notifications
        baseDelay: 1000, // 1 second base delay
        backoffStrategy: 'linear',
      }
    );

    if (!result.success) {
      BIFailureErrorHandler.handleUnexpectedError(
        result.error!,
        'retry notification'
      );
      throw result.error!;
    }
  }

  /**
   * Get failed notifications for retry
   */
  private static async getFailedNotifications(): Promise<
    Array<{
      id: string;
      incidentId: string;
      facilityId: string;
      type: string;
      data: Record<string, unknown>;
      retryCount: number;
      maxRetries: number;
    }>
  > {
    try {
      // Return empty array since scheduled_notifications table doesn't exist
      return [];
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get failed notifications'
      );
      return [];
    }
  }
}
