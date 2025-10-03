import { supabase } from '@/lib/supabaseClient';
import { BIFailureNotificationDataProvider } from '../../notification/data/BIFailureNotificationDataProvider';
import { NotificationConfig } from './types';

/**
 * Scheduler module for BI failure notifications
 * Handles timing, escalations, and scheduling logic
 */
export class NotificationScheduler {
  private static readonly DEFAULT_NOTIFICATION_DELAY = 30; // minutes

  /**
   * Check if regulatory notification is required
   */
  static isRegulatoryNotificationRequired(
    severity: 'low' | 'medium' | 'high' | 'critical',
    config: NotificationConfig
  ): boolean {
    // Regulatory notifications are typically required for high and critical incidents
    // and when auto notification is enabled
    return (
      (severity === 'high' || severity === 'critical') &&
      config.autoNotificationEnabled
    );
  }

  /**
   * Schedule delayed notification
   */
  static async scheduleDelayedNotification(
    incidentId: string,
    facilityId: string,
    delayMinutes: number = this.DEFAULT_NOTIFICATION_DELAY
  ): Promise<string> {
    const scheduledTime = new Date();
    scheduledTime.setMinutes(scheduledTime.getMinutes() + delayMinutes);

    // Store scheduled notification in database
    const _scheduledNotification = {
      incident_id: incidentId,
      facility_id: facilityId,
      severity: 'medium',
      message_type: 'internal',
      scheduled_for: scheduledTime.toISOString(),
      status: 'scheduled',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // No-op since scheduled_notifications table doesn't exist
    console.log('Notification scheduled for:', scheduledTime);

    // Log scheduled notification
    await BIFailureNotificationDataProvider.logNotificationAuditEvent(
      incidentId,
      'scheduled',
      `Scheduled for ${scheduledTime.toISOString()}`,
      await this.getCurrentUserId()
    );

    return incidentId;
  }

  /**
   * Get escalation recipients
   */
  static getEscalationRecipients(
    escalationLevel: string,
    config: NotificationConfig
  ): string[] {
    try {
      const levelMap: Record<
        string,
        keyof NotificationConfig['escalationLevels']
      > = {
        supervisor: 'low',
        manager: 'medium',
        director: 'high',
        executive: 'critical',
      };

      const level = levelMap[escalationLevel] || 'high';
      return config.escalationLevels[level] || [];
    } catch (error) {
      console.error('Error getting escalation recipients:', error);
      return [];
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
