import { BIFailureError } from './failure/BIFailureError';
import { BIFailureErrorHandler } from './failure/BIFailureErrorHandler';
import { BIFailureNotificationValidators } from './notification/utils/BIFailureNotificationValidators';
import { BIFailureNotificationGenerators } from './notification/utils/BIFailureNotificationGenerators';
import { BIFailureNotificationDataProvider } from './notification/data/BIFailureNotificationDataProvider';
import {
  NotificationMessage,
  EmailAlertQueue,
  RegulatoryNotificationRequest,
  ClinicManagerNotificationRequest,
  EmailAlertRequest,
} from './notification/types/BIFailureNotificationTypes';

/**
 * @deprecated Use BIFailureNotificationService from '@/services/bi/failure/BIFailureNotificationService' instead
 * This service is deprecated in favor of the consolidated BI failure services
 * 
 * Service for BI failure notification operations
 * Handles regulatory notifications, clinic manager alerts, and email queuing
 */
export class BIFailureNotificationService {
  private static readonly MAX_RETRY_COUNT = 3;
  private static readonly DEFAULT_EMAIL_DELAY = 5; // minutes

  /**
   * Notify regulatory authorities about a BI failure incident
   * @deprecated Use BIFailureService.sendRegulatoryNotification() instead
   */
  static async notifyRegulator(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
      operatorName?: string;
    }
  ): Promise<boolean> {
    console.warn('BIFailureNotificationService.notifyRegulator() is deprecated. Use BIFailureService.sendRegulatoryNotification() instead.');
    try {
      // Validate inputs
      const request: RegulatoryNotificationRequest = {
        incidentId,
        facilityId,
        severity,
        incidentDetails,
      };
      BIFailureNotificationValidators.validateNotificationRequest(request);

      // Skip regulatory notifications - not needed for BI failures
      return false;

      // Create notification message
      const notification: NotificationMessage = {
        id: BIFailureNotificationGenerators.generateNotificationId(
          'reg',
          incidentId
        ),
        incidentId,
        facilityId,
        severity,
        messageType: 'regulatory',
        recipients: regulatoryContacts,
        subject: BIFailureNotificationGenerators.generateRegulatorySubject(
          severity,
          incidentDetails
        ),
        body: BIFailureNotificationGenerators.generateRegulatoryBody(
          severity,
          incidentDetails
        ),
        status: 'pending',
        retryCount: 0,
        maxRetries: this.MAX_RETRY_COUNT,
      };

      // Send notification
      await this.sendNotification(notification);

      // Update incident notification status
      await BIFailureNotificationDataProvider.updateIncidentNotificationStatus(
        incidentId,
        facilityId,
        true
      );

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(error, 'notify regulator');
      return false;
    }
  }

  /**
   * Notify clinic manager about a BI failure incident
   */
  static async notifyClinicManager(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    managerDetails: {
      managerId: string;
      managerName: string;
      managerEmail: string;
    },
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
      operatorName?: string;
    }
  ): Promise<boolean> {
    try {
      // Validate inputs
      const request: ClinicManagerNotificationRequest = {
        incidentId,
        facilityId,
        severity,
        incidentDetails,
        managerDetails,
      };
      BIFailureNotificationValidators.validateNotificationRequest(request);
      BIFailureNotificationValidators.validateManagerDetails(managerDetails);

      // Create notification message
      const notification: NotificationMessage = {
        id: BIFailureNotificationGenerators.generateNotificationId(
          'cm',
          incidentId
        ),
        incidentId,
        facilityId,
        severity,
        messageType: 'clinic_manager',
        recipients: [managerDetails.managerEmail],
        subject: BIFailureNotificationGenerators.generateClinicManagerSubject(
          severity,
          incidentDetails
        ),
        body: BIFailureNotificationGenerators.generateClinicManagerBody(
          severity,
          incidentDetails,
          managerDetails
        ),
        status: 'pending',
        retryCount: 0,
        maxRetries: this.MAX_RETRY_COUNT,
      };

      // Send notification
      await this.sendNotification(notification);

      // Log manager notification
      await BIFailureNotificationDataProvider.logManagerNotification(
        incidentId,
        managerDetails.managerId,
        severity
      );

      return true;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'notify clinic manager'
      );
      return false;
    }
  }

  /**
   * Queue an incident email alert for later sending
   */
  static async queueIncidentEmailAlert(
    incidentId: string,
    facilityId: string,
    recipientType: 'regulator' | 'clinic_manager' | 'operator' | 'supervisor',
    emailAddress: string,
    subject: string,
    body: string,
    priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
    scheduledFor?: string
  ): Promise<string> {
    try {
      // Validate inputs
      const request: EmailAlertRequest = {
        incidentId,
        facilityId,
        recipientType,
        emailAddress,
        subject,
        body,
        priority,
        scheduledFor,
      };
      BIFailureNotificationValidators.validateEmailAlertRequest(request);

      // Create email alert queue entry
      const emailAlert: EmailAlertQueue = {
        id: BIFailureNotificationGenerators.generateEmailAlertId(incidentId),
        incidentId,
        facilityId,
        recipientType,
        emailAddress,
        subject,
        body,
        priority,
        scheduledFor:
          scheduledFor ||
          new Date(
            Date.now() + this.DEFAULT_EMAIL_DELAY * 60 * 1000
          ).toISOString(),
        status: 'queued',
        retryCount: 0,
        maxRetries: this.MAX_RETRY_COUNT,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Store in database
      const queueId =
        await BIFailureNotificationDataProvider.storeEmailAlertInQueue(
          emailAlert
        );

      // Log queued email

      return queueId;
    } catch (error) {
      if (error instanceof BIFailureError) {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'queue incident email alert'
      );
      throw error;
    }
  }

  /**
   * Send notification through configured channels
   */
  private static async sendNotification(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      // Update status to sending
      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();

      // Store notification record
      await BIFailureNotificationDataProvider.storeNotificationRecord(
        notification
      );

      // Log successful notification
    } catch (error) {
      notification.status = 'failed';
      notification.retryCount++;

      if (notification.retryCount < notification.maxRetries) {
        console.warn(
          `Notification failed, will retry (${notification.retryCount}/${notification.maxRetries})`
        );

        // Schedule retry with exponential backoff
        const retryDelay = Math.pow(2, notification.retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(async () => {
          try {
            await this.retryNotification(notification);
          } catch (retryError) {
            console.error('Retry attempt failed:', retryError);
          }
        }, retryDelay);
      } else {
        // Only log errors in non-test environments
        if (
          !(global as { __TESTING__?: boolean }).__TESTING__ &&
          process.env.NODE_ENV !== 'test'
        ) {
          console.error(
            `Notification failed permanently after ${notification.maxRetries} retries`
          );
        }
      }

      throw error;
    }
  }

  /**
   * Retry a failed notification
   */
  private static async retryNotification(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      // Update notification status to retrying
      await BIFailureNotificationDataProvider.updateIncidentNotificationStatus(
        notification.id,
        notification.facilityId,
        true
      );

      // Attempt to send the notification again
      await this.sendNotification(notification);
    } catch (error) {
      console.error(`Notification ${notification.id} retry failed:`, error);

      // Update notification status to failed
      await BIFailureNotificationDataProvider.updateIncidentNotificationStatus(
        notification.id,
        notification.facilityId,
        false
      );

      throw error;
    }
  }
}
