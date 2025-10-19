import { supabase } from '@/lib/supabaseClient';

/**
 * Synchronize BI compliance settings with Supabase
 * Handles upsert operations for BI compliance setting records
 */
export async function syncComplianceSettings(record: any): Promise<{ success: boolean; error?: string }> {
  try {
    if (!record || !record.facility_id) throw new Error('Missing facility_id in compliance record.');

    const { error } = await supabase
      .from('bi_compliance_settings')
      .upsert(record, { onConflict: 'facility_id' });

    if (error) throw error;

    console.info(`✅ Synced compliance settings for facility ${record.facility_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('❌ Failed to sync BI compliance settings:', error.message);
    return { success: false, error: error.message };
  }
}
