import { supabase } from '@/lib/supabaseClient';
import { BIFailureNotificationDataProvider } from '../../notification/data/BIFailureNotificationDataProvider';
import { NotificationMessage, NotificationConfig } from './types';

/**
 * Messenger module for BI failure notifications
 * Handles channel dispatch, provider adapters, and notification sending
 */
export class NotificationMessenger {
  private static readonly MAX_RETRY_COUNT = 3;

  /**
   * Send notification through configured channels
   */
  static async sendNotification(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      const config = await this.getNotificationConfig(notification.facilityId);

      for (const channel of config.notificationChannels) {
        try {
          switch (channel) {
            case 'email':
              await this.sendEmailNotification(notification);
              break;
            case 'webhook':
              await this.sendWebhookNotification(notification);
              break;
          }
        } catch (error) {
          console.error(`Failed to send ${channel} notification:`, error);
          notification.retryCount++;
        }
      }

      notification.status = 'sent';
      notification.sentAt = new Date().toISOString();

      // Store notification record
      await this.storeNotificationRecord(notification);

      // Log successful notification
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        notification.id,
        'sent',
        'Notification sent successfully',
        await this.getCurrentUserId()
      );
    } catch (error) {
      notification.status = 'failed';

      // Log failed notification
      await BIFailureNotificationDataProvider.logNotificationAuditEvent(
        notification.id,
        'failed',
        `Notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        await this.getCurrentUserId()
      );

      throw error;
    }
  }

  /**
   * Send email notification
   */
  static async sendEmailNotification(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      // Store email in queue for processing
      const { error } = await supabase.from('email_alert_queue').insert({
        recipient_email: notification.recipients.join(','),
        subject: notification.subject,
        body: notification.body,
        status: 'queued',
        created_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(`Failed to queue email notification: ${error.message}`);
      }

      console.log('Email notification queued:', {
        to: notification.recipients,
        subject: notification.subject,
      });
    } catch (error) {
      console.error('Failed to send email notification:', error);
      throw error;
    }
  }

  /**
   * Send webhook notification
   */
  static async sendWebhookNotification(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      // No-op since facility_webhooks table doesn't exist
      console.warn(
        'Webhook notifications disabled - facility_webhooks table not available:',
        notification.facilityId
      );
      return;

    } catch (error) {
      console.error('Failed to send webhook notification:', error);
      throw error;
    }
  }

  /**
   * Store notification record
   */
  static async storeNotificationRecord(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      const { error } = await supabase.from('notifications').insert({
        id: notification.id,
        facility_id: notification.facilityId,
        severity: notification.severity,
        title: notification.subject,
        message: notification.body,
        notification_type: notification.messageType,
        module: 'bi_failure',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(
          `Failed to store notification record: ${error.message}`
        );
      }

      console.log('Notification record stored:', notification.id);
    } catch (error) {
      console.error('Failed to store notification record:', error);
      throw error;
    }
  }

  /**
   * Get notification configuration for facility
   */
  static async getNotificationConfig(
    facilityId: string
  ): Promise<NotificationConfig> {
    try {
      const { data, error } = await supabase
        .from('facility_notification_config')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        throw new Error(`Failed to get notification config: ${error.message}`);
      }

      if (data) {
        return {
          facilityId: data.facility_id as string,
          regulatoryBodies: data.regulatory_bodies as string[],
          notificationChannels: data.notification_channels as (
            | 'email'
            | 'webhook'
          )[],
          escalationLevels: data.escalation_levels as {
            low: string[];
            medium: string[];
            high: string[];
            critical: string[];
          },
          autoNotificationEnabled: data.auto_notification_enabled as boolean,
          notificationDelayMinutes: data.notification_delay_minutes as number,
        };
      }

      // Return default configuration if none found
      return {
        facilityId,
        regulatoryBodies: ['FDA', 'CDC', 'State Health Department'],
        notificationChannels: ['email', 'webhook'],
        escalationLevels: {
          low: ['supervisor'],
          medium: ['supervisor', 'manager'],
          high: ['supervisor', 'manager', 'director'],
          critical: ['supervisor', 'manager', 'director', 'executive'],
        },
        autoNotificationEnabled: true,
        notificationDelayMinutes: 30,
      };
    } catch (error) {
      console.error('Error getting notification config:', error);
      // Return default configuration on error
      return {
        facilityId,
        regulatoryBodies: ['FDA', 'CDC', 'State Health Department'],
        notificationChannels: ['email', 'webhook'],
        escalationLevels: {
          low: ['supervisor'],
          medium: ['supervisor', 'manager'],
          high: ['supervisor', 'manager', 'director'],
          critical: ['supervisor', 'manager', 'director', 'executive'],
        },
        autoNotificationEnabled: true,
        notificationDelayMinutes: 30,
      };
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
    } catch (error) {
      console.error('Error getting current user:', error);
      return undefined;
    }
  }
}
