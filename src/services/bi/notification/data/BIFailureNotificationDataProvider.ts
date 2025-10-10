import { supabase } from '../../../../lib/supabaseClient';
import { BIFailureErrorHandler } from '../../failure/BIFailureErrorHandler';
import {
  NotificationMessage,
  EmailAlertQueue,
} from '../types/BIFailureNotificationTypes';

// Database row interfaces

interface BIActivityLogRow {
  id: string;
  incident_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface AuditLogRow {
  id: string;
  module: string;
  table_name: string;
  record_id: string | null;
  action: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

interface NotificationRow {
  id: string;
  incident_id: string;
  facility_id: string;
  severity: string;
  message_type: string;
  recipients: string[];
  subject: string;
  body: string;
  sent_at: string | null;
  status: string;
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

interface EmailAlertQueueRow {
  id: string;
  incident_id: string;
  facility_id: string;
  recipient_type: string;
  recipient_email: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduled_for: string | null;
  status: 'queued' | 'sending' | 'sent' | 'failed';
  retry_count: number;
  max_retries: number;
  created_at: string;
  updated_at: string;
}

interface ActivityLogRow {
  id: string;
  action: string;
  timestamp: string;
  details: string | undefined;
  created_at: string;
}

export class BIFailureNotificationDataProvider {
  /**
   * Update incident notification status
   */
  static async updateIncidentNotificationStatus(
    incidentId: string,
    facilityId: string,
    notificationSent: boolean
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        regulatory_notification_sent: notificationSent,
        regulatory_notification_date: notificationSent
          ? new Date().toISOString()
          : null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('bi_failure_incidents')
        .update(updateData)
        .eq('id', incidentId)
        .eq('facility_id', facilityId);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'update incident notification status'
        );
      }
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'update incident notification status'
      );
    }
  }

  /**
   * Log manager notification
   */
  static async logManagerNotification(
    incidentId: string,
    managerId: string,
    severity: string
  ): Promise<void> {
    try {
      // Log to activity log
      const activityLogData: Omit<BIActivityLogRow, 'id'> = {
        incident_id: incidentId,
        action: 'manager_notification_sent',
        details: {
          manager_id: managerId,
          severity: severity,
          notification_type: 'manager_alert',
        },
        created_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: activityError } = await (supabase as any)
        .from('bi_activity_log')
        .insert(activityLogData);

      if (activityError) {
        console.error('Failed to log to activity log:', activityError);
      }

      // Log to audit trail
      const auditLogData: Omit<AuditLogRow, 'id'> = {
        module: 'bi_failure',
        table_name: 'bi_failure_incidents',
        record_id: incidentId || null,
        action: 'notification_sent',
        metadata: {
          notification_type: 'manager_alert',
          manager_id: managerId,
          severity: severity,
          facility_id: '550e8400-e29b-41d4-a716-446655440000', // Default facility ID - should be passed as parameter
          timestamp: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: auditError } = await (supabase as any)
        .from('audit_logs')
        .insert(auditLogData);

      if (auditError) {
        console.error('Failed to log to audit trail:', auditError);
      }

      console.log(
        `Manager notification logged: incident ${incidentId}, manager ${managerId}, severity ${severity}`
      );
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'log manager notification'
      );
    }
  }

  /**
   * Store notification record
   */
  static async storeNotificationRecord(
    notification: NotificationMessage
  ): Promise<void> {
    try {
      const notificationData: Omit<
        NotificationRow,
        'created_at' | 'updated_at'
      > = {
        id: notification.id,
        incident_id: notification.incidentId,
        facility_id: notification.facilityId,
        severity: notification.severity,
        message_type: notification.messageType,
        recipients: notification.recipients,
        subject: notification.subject,
        body: notification.body,
        sent_at: notification.sentAt || null,
        status: notification.status,
        retry_count: notification.retryCount,
        max_retries: notification.maxRetries,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('notifications').insert({
        ...notificationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'store notification record'
        );
      }

      console.log('Notification record stored:', notification.id);
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'store notification record'
      );
    }
  }

  /**
   * Store email alert in queue
   */
  static async storeEmailAlertInQueue(
    emailAlert: EmailAlertQueue
  ): Promise<string> {
    try {
      const emailAlertData: Omit<
        EmailAlertQueueRow,
        'created_at' | 'updated_at'
      > = {
        id: emailAlert.id,
        incident_id: emailAlert.incidentId,
        facility_id: emailAlert.facilityId,
        recipient_type: emailAlert.recipientType,
        recipient_email: emailAlert.emailAddress,
        subject: emailAlert.subject,
        message: emailAlert.body,
        priority: emailAlert.priority,
        scheduled_for: emailAlert.scheduledFor || null,
        status: emailAlert.status,
        retry_count: emailAlert.retryCount,
        max_retries: emailAlert.maxRetries,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('email_alert_queue')
        .insert({
          ...emailAlertData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'store email alert in queue'
        );
      }

      if (!data) {
        throw new Error('Failed to store email alert in queue');
      }

      return data.id;
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'store email alert in queue'
      );
      throw error;
    }
  }

  /**
   * Get pending email alerts
   */
  static async getPendingEmailAlerts(): Promise<EmailAlertQueue[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('email_alert_queue')
        .select('*')
        .eq('status', 'queued')
        .lte('scheduled_for', new Date().toISOString())
        .order('priority', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'get pending email alerts'
        );
        return [];
      }

      if (!data) return [];

      return data.map((item: EmailAlertQueueRow) => ({
        id: item.id,
        incidentId: item.incident_id,
        facilityId: item.facility_id,
        recipientType: item.recipient_type as
          | 'regulator'
          | 'clinic_manager'
          | 'operator'
          | 'supervisor',
        emailAddress: item.recipient_email,
        subject: item.subject,
        body: item.message,
        priority: item.priority,
        scheduledFor: item.scheduled_for || undefined,
        status: item.status,
        retryCount: item.retry_count || 0,
        maxRetries: item.max_retries || 3,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get pending email alerts'
      );
      return [];
    }
  }

  /**
   * Update email alert status
   */
  static async updateEmailAlertStatus(
    alertId: string,
    status: 'queued' | 'sending' | 'sent' | 'failed',
    retryCount?: number
  ): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (retryCount !== undefined) {
        updateData.retry_count = retryCount;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('email_alert_queue')
        .update(updateData)
        .eq('id', alertId);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'update email alert status'
        );
      }
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'update email alert status'
      );
    }
  }

  /**
   * Get notification statistics
   */
  static async getNotificationStats(): Promise<{
    totalSent: number;
    totalFailed: number;
    totalQueued: number;
    successRate: number;
  }> {
    try {
      // Get sent notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: sentData, error: sentError } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('status', 'sent');

      if (sentError) {
        BIFailureErrorHandler.handleDatabaseError(
          sentError,
          'get sent notifications'
        );
      }

      // Get failed notifications
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: failedData, error: failedError } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('status', 'failed');

      if (failedError) {
        BIFailureErrorHandler.handleDatabaseError(
          failedError,
          'get failed notifications'
        );
      }

      // Get queued email alerts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: queuedData, error: queuedError } = await (supabase as any)
        .from('email_alert_queue')
        .select('id')
        .eq('status', 'queued');

      if (queuedError) {
        BIFailureErrorHandler.handleDatabaseError(
          queuedError,
          'get queued email alerts'
        );
      }

      const totalSent = sentData?.length || 0;
      const totalFailed = failedData?.length || 0;
      const totalQueued = queuedData?.length || 0;
      const total = totalSent + totalFailed;
      const successRate = total > 0 ? (totalSent / total) * 100 : 0;

      return {
        totalSent,
        totalFailed,
        totalQueued,
        successRate,
      };
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get notification stats'
      );
      return {
        totalSent: 0,
        totalFailed: 0,
        totalQueued: 0,
        successRate: 0,
      };
    }
  }

  /**
   * Get notification audit log
   */
  static async getNotificationAuditLog(notificationId: string): Promise<
    Array<{
      id: string;
      action: string;
      timestamp: string;
      details?: string;
    }>
  > {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from('notification_audit_log')
        .select('*')
        .eq('notification_id', notificationId)
        .order('timestamp', { ascending: false });

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'get notification audit log'
        );
        return [];
      }

      if (!data) return [];

      return data.map((item: ActivityLogRow) => ({
        id: item.id,
        action: item.action,
        timestamp: item.timestamp,
        details: item.details,
      }));
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'get notification audit log'
      );
      return [];
    }
  }

  /**
   * Log notification audit event
   */
  static async logNotificationAuditEvent(
    notificationId: string,
    action: string,
    details?: string,
    userId?: string
  ): Promise<void> {
    try {
      const auditLog = {
        notification_id: notificationId,
        action,
        timestamp: new Date().toISOString(),
        user_id: userId,
        details,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('notification_audit_log')
        .insert(auditLog);

      if (error) {
        BIFailureErrorHandler.handleDatabaseError(
          error,
          'log notification audit event'
        );
      }
    } catch (error) {
      BIFailureErrorHandler.handleUnexpectedError(
        error,
        'log notification audit event'
      );
    }
  }
}
