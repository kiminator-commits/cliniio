import { supabase } from '@/lib/supabaseClient';

export async function notifyManager(
  facilityId: string,
  managerEmail: string,
  subject: string,
  message: string,
  metadata: Record<string, any> = {}
): Promise<{ success: boolean; error?: string }> {
  try {
    const notification = {
      facility_id: facilityId,
      recipient: managerEmail,
      subject,
      message,
      metadata,
      sent_at: new Date().toISOString(),
    };

    const { error: notifError } = await supabase.from('manager_notifications').insert(notification);
    if (notifError) throw notifError;

    const auditRecord = {
      facility_id: facilityId,
      action: 'MANAGER_NOTIFICATION_SENT',
      details: { recipient: managerEmail, subject, metadata },
      created_at: new Date().toISOString(),
    };
    const { error: auditError } = await supabase.from('audit_logs').insert(auditRecord);
    if (auditError) throw auditError;

    console.info(`✅ Manager notification sent and logged for ${managerEmail}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to send or log manager notification:', error.message);
    return { success: false, error: error.message };
  }
}
