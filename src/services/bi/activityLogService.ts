import { supabase } from '@/lib/supabaseClient';

export type BIActivityEvent = {
  facility_id: string;
  event_type: 'TEST' | 'INCIDENT' | 'COMPLIANCE';
  reference_id?: string;
  operator_id?: string;
  details?: Record<string, any>;
};

export async function logBIActivity(event: BIActivityEvent): Promise<{ success: boolean; error?: string }> {
  try {
    if (!event.facility_id || !event.event_type)
      throw new Error('Missing required BI activity log fields.');

    const record = {
      ...event,
      created_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('bi_activity_log').insert(record);
    if (error) throw error;

    console.info(`✅ Logged BI ${event.event_type} event for facility ${event.facility_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to log BI activity:', error.message);
    return { success: false, error: error.message };
  }
}
