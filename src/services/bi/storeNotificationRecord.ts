import { supabase } from '@/lib/supabaseClient';

/**
 * Store notification record with audit tracking
 * Handles both notification persistence and audit trail logging
 */
export async function storeNotificationRecord(notification: {
  facility_id: string;
  incident_id: string;
  recipients: string[];
  message: string;
  sent_by: string;
}) {
  try {
    // Store notification record
    const notificationData = {
      ...notification,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      status: 'sent',
      retry_count: 0,
      max_retries: 3
    };

    const { error: notifError } = await supabase
      .from('bi_notifications')
      .insert(notificationData);
    if (notifError) throw notifError;

    // Create audit log entry
    const auditLog = {
      facility_id: notification.facility_id,
      action: 'BI_NOTIFICATION_SENT',
      metadata: {
        incident_id: notification.incident_id,
        recipients: notification.recipients,
        message: notification.message,
        sent_by: notification.sent_by,
        timestamp: new Date().toISOString()
      },
      created_at: new Date().toISOString(),
    };

    const { error: auditError } = await supabase
      .from('audit_logs')
      .insert(auditLog);
    if (auditError) throw auditError;

    console.info(`✅ Notification and audit log stored for incident ${notification.incident_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to store notification record:', error.message);
    return { success: false, error: error.message };
  }
}
