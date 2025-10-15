import { supabase } from '@/lib/supabaseClient';

export async function logSettingsAudit({
  facilityId,
  userId,
  module,
  action,
  details,
}: {
  facilityId: string;
  userId: string;
  module: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  details: Record<string, string | number | boolean | null>;
}) {
  try {
    const { error } = await supabase.from('security_audit_log').insert([
      {
        facility_id: facilityId,
        user_id: userId,
        object_schema: 'public',
        object_table: 'ai_settings',
        action,
        event_context: {
          module,
          details,
          source: 'frontend',
        },
        happened_at: new Date().toISOString(),
      },
    ]);

    if (error) console.error('❌ Audit log insert failed:', error);
    else console.log('✅ Audit event logged:', module, action);
  } catch (err) {
    console.error('❌ Unexpected audit log failure:', err);
  }
}
