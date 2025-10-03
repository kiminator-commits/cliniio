import { BIFailureErrorHandler } from './BIFailureErrorHandler';
import { BIFailureValidationService } from './BIFailureValidationService';
import { supabase } from '../../../lib/supabaseClient';
import { BIFailureNotificationDataProvider } from '../notification/data/BIFailureNotificationDataProvider';
import { FacilityService } from '../../facilityService';
import {
  NotificationMessage,
  NotificationScheduler,
  NotificationMessenger,
  NotificationFormatters,
} from './notification';
import type { Json } from '../../../types/database.types';

// Define proper types for Supabase operations
type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Database row interfaces
interface NotificationRow {
  id: string;
  incident_id: string;
  facility_id: string;
  severity: string;
  message_type: string;
  recipients: Json;
  subject: string;
  body: string;
  sent_at: string | null;
  status: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

interface BIFailureIncidentRow {
  id: string;
  incident_number: string;
  failure_date: string;
  affected_tools_count: number;
  failure_reason: string | null;
  facility_id: string;
  created_at: string;
  updated_at: string;
}

interface IncidentDetails {
  incidentNumber: string;
  failureDate: string;
  affectedToolsCount: number;
  failureReason?: string;
}

/**
 * Notification service for BI failure operations
 * Handles regulatory notifications and alerts
 */
export class BIFailureNotificationService {
  private static readonly DEFAULT_NOTIFICATION_DELAY = 30; // minutes
  private static readonly MAX_RETRY_COUNT = 3;

  /**
   * Send regulatory notification for BI failure incident
   */
  static async sendRegulatoryNotification(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    incidentDetails: {
      incidentNumber: string;
      failureDate: string;
      affectedToolsCount: number;
      failureReason?: string;
    }
  ): Promise<boolean> {
    try {
      BIFailureValidationService.validateIncidentId(incidentId);
      BIFailureValidationService.validateFacilityId(facilityId);

      const config =
        await NotificationMessenger.getNotificationConfig(facilityId);

      if (!config.autoNotificationEnabled) {
        return false;
      }

      const notification = NotificationFormatters.createNotificationMessage(
        incidentId,
        facilityId,
        severity,
        'regulatory',
        incidentDetails,
        await this.getDefaultRecipients()
      );

      // Check if regulatory notification is required based on severity
      if (
        NotificationScheduler.isRegulatoryNotificationRequired(severity, config)
      ) {
        await NotificationMessenger.sendNotification(notification);
        await this.updateIncidentNotificationStatus(
          incidentId,
          facilityId,
          true
        );
        return true;
      }

      return false;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'send regulatory notification'
      );
      return false;
    }
  }

  /**
   * Send internal notification to facility staff
   */
  static async sendInternalNotification(
    incidentId: string,
    facilityId: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    recipients: string[],
    customMessage?: string
  ): Promise<boolean> {
    try {
      BIFailureValidationService.validateIncidentId(incidentId);
      BIFailureValidationService.validateFacilityId(facilityId);

      const incidentDetails = await this.getIncidentDetails(
        incidentId,
        facilityId
      );

      const notification = NotificationFormatters.createNotificationMessage(
        incidentId,
        facilityId,
        severity,
        'internal',
        incidentDetails,
        recipients,
        customMessage
      );

      await NotificationMessenger.sendNotification(notification);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'send internal notification'
      );
      return false;
    }
  }

  /**
   * Send escalation notification
   */
  static async sendEscalationNotification(
    incidentId: string,
    facilityId: string,
    escalationLevel: 'supervisor' | 'manager' | 'director' | 'executive'
  ): Promise<boolean> {
    try {
      BIFailureValidationService.validateIncidentId(incidentId);
      BIFailureValidationService.validateFacilityId(facilityId);

      const config =
        await NotificationMessenger.getNotificationConfig(facilityId);
      const escalationRecipients =
        NotificationScheduler.getEscalationRecipients(escalationLevel, config);

      if (escalationRecipients.length === 0) {
        return false;
      }

      const incidentDetails = await this.getIncidentDetails(
        incidentId,
        facilityId
      );

      const notification = NotificationFormatters.createNotificationMessage(
        incidentId,
        facilityId,
        'high', // Escalations are typically high priority
        'escalation',
        incidentDetails,
        escalationRecipients,
        `BI Failure incident ${incidentDetails.incidentNumber} requires ${escalationLevel} attention.`
      );

      await NotificationMessenger.sendNotification(notification);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'send escalation notification'
      );
      return false;
    }
  }

  /**
   * Schedule delayed notification
   */
  static async scheduleDelayedNotification(
    incidentId: string,
    facilityId: string,
    delayMinutes: number = this.DEFAULT_NOTIFICATION_DELAY
  ): Promise<string> {
    try {
      return await NotificationScheduler.scheduleDelayedNotification(
        incidentId,
        facilityId,
        delayMinutes
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'schedule delayed notification'
      );
      return '';
    }
  }

  /**
   * Get notification history for an incident
   */
  static async getNotificationHistory(
    incidentId: string
  ): Promise<NotificationMessage[]> {
    try {
      BIFailureValidationService.validateIncidentId(incidentId);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('incident_id', incidentId)
        .order('created_at', { ascending: false });

      if (error) {
        const errorData = error as SupabaseError;
        throw new Error(
          `Failed to get notification history: ${errorData.message}`
        );
      }

      if (!data) return [];

      return ((data as NotificationRow[]) || []).map(
        (item): NotificationMessage => ({
          id: item.id,
          incidentId: item.incident_id,
          facilityId: item.facility_id,
          severity:
            (item.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
          messageType:
            (item.message_type as 'regulatory' | 'internal' | 'escalation') ||
            'internal',
          recipients: (item.recipients as string[]) || [],
          subject: item.subject,
          body: item.body,
          sentAt: item.sent_at || undefined,
          status:
            (item.status as 'pending' | 'sent' | 'failed' | 'delivered') ||
            'pending',
          retryCount: item.retry_count,
          maxRetries: item.max_retries,
        })
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get notification history'
      );
      return [];
    }
  }

  /**
   * Retry failed notifications
   */
  static async retryFailedNotifications(incidentId: string): Promise<number> {
    try {
      BIFailureValidationService.validateIncidentId(incidentId);

      const failedNotifications = await this.getFailedNotifications(incidentId);
      let retryCount = 0;

      for (const notification of failedNotifications) {
        if (notification.retryCount < notification.maxRetries) {
          try {
            await NotificationMessenger.sendNotification(notification);
            retryCount++;

            // Log retry attempt
            await BIFailureNotificationDataProvider.logNotificationAuditEvent(
              notification.id,
              'retried',
              `Retry attempt ${notification.retryCount + 1}/${notification.maxRetries}`,
              await this.getCurrentUserId()
            );
          } catch (error) {
            // Log retry failure
            await BIFailureNotificationDataProvider.logNotificationAuditEvent(
              notification.id,
              'retry_failed',
              `Retry attempt ${notification.retryCount + 1} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
              await this.getCurrentUserId()
            );
          }
        }
      }

      return retryCount;
    } catch (error) {
      if (error instanceof Error && error.name === 'BIFailureError') {
        throw error;
      }

      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'retry failed notifications'
      );
      return 0;
    }
  }

  /**
   * Get incident details
   */
  private static async getIncidentDetails(
    incidentId: string,
    facilityId: string
  ): Promise<IncidentDetails> {
    try {
      const { data, error } = await supabase
        .from('bi_failure_incidents')
        .select('*')
        .eq('id', incidentId)
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        const errorData = error as SupabaseError;
        throw new Error(`Failed to get incident details: ${errorData.message}`);
      }

      if (!data) {
        throw new Error('Incident not found');
      }

      const incidentData = data as BIFailureIncidentRow;
      return {
        incidentNumber: incidentData.incident_number,
        failureDate: incidentData.failure_date,
        affectedToolsCount: incidentData.affected_tools_count,
        failureReason: incidentData.failure_reason || undefined,
      };
    } catch {
      // Return fallback data
      return {
        incidentNumber: `BI-FAIL-${incidentId.substring(0, 8)}`,
        failureDate: new Date().toISOString(),
        affectedToolsCount: 0,
        failureReason: 'Unknown',
      };
    }
  }

  /**
   * Get default recipients for notification
   */
  private static async getDefaultRecipients(): Promise<string[]> {
    try {
      const facilityId = await FacilityService.getCurrentFacilityId();
      if (!facilityId) {
        return ['admin@facility.com', 'supervisor@facility.com'];
      }

      const { data, error } = await supabase
        .from('facility_staff')
        .select('email')
        .eq('facility_id', facilityId)
        .eq('is_active', true)
        .in('role', ['admin', 'supervisor', 'manager']);

      if (error) {
        return ['admin@facility.com', 'supervisor@facility.com'];
      }

      if (!data) return ['admin@facility.com', 'supervisor@facility.com'];

      return ((data as { email: string }[]) || []).map((item) => item.email);
    } catch {
      return ['admin@facility.com', 'supervisor@facility.com'];
    }
  }

  /**
   * Get failed notifications
   */
  private static async getFailedNotifications(
    incidentId: string
  ): Promise<NotificationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('incident_id', incidentId)
        .eq('status', 'failed')
        .lt('retry_count', 'max_retries');

      if (error) {
        const errorData = error as SupabaseError;
        throw new Error(
          `Failed to get failed notifications: ${errorData.message}`
        );
      }

      if (!data) return [];

      return ((data as NotificationRow[]) || []).map(
        (item): NotificationMessage => ({
          id: item.id,
          incidentId: item.incident_id,
          facilityId: item.facility_id,
          severity:
            (item.severity as 'low' | 'medium' | 'high' | 'critical') || 'low',
          messageType:
            (item.message_type as 'regulatory' | 'internal' | 'escalation') ||
            'internal',
          recipients: (item.recipients as string[]) || [],
          subject: item.subject,
          body: item.body,
          sentAt: item.sent_at || undefined,
          status:
            (item.status as 'pending' | 'sent' | 'failed' | 'delivered') ||
            'pending',
          retryCount: item.retry_count,
          maxRetries: item.max_retries,
        })
      );
    } catch {
      return [];
    }
  }

  /**
   * Update incident notification status
   */
  private static async updateIncidentNotificationStatus(
    incidentId: string,
    facilityId: string,
    notificationSent: boolean
  ): Promise<void> {
    try {
      const updateData = {
        regulatory_notification_sent: notificationSent,
        regulatory_notification_date: notificationSent
          ? new Date().toISOString()
          : null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('bi_failure_incidents')
        .update(updateData)
        .eq('id', incidentId)
        .eq('facility_id', facilityId);

      if (error) {
        // Only log errors in non-test environments
        if (
          !(global as { __TESTING__?: boolean }).__TESTING__ &&
          process.env.NODE_ENV !== 'test'
        ) {
          console.error(
            'Failed to update incident notification status:',
            error
          );
        }
      }
    } catch (error) {
      // Only log errors in non-test environments
      if (
        !(global as { __TESTING__?: boolean }).__TESTING__ &&
        process.env.NODE_ENV !== 'test'
      ) {
        console.error('Error updating incident notification status:', error);
      }
    }
  }

  /**
   * Get current user ID
   */
  private static async getCurrentUserId(): Promise<string | undefined> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user?.id;
    } catch {
      return undefined;
    }
  }
}
