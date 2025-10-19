import { supabase } from '@/lib/supabaseClient';

/**
 * Synchronize BI failure incidents with Supabase
 * Handles upsert operations for BI failure incident records
 */
export async function syncBIFailureIncidents(record: any) {
  try {
    const { id, ...payload } = record;
    const { error } = await supabase
      .from('bi_failure_incidents')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    console.info(`Synced BI Failure Incident [${id}] successfully.`);
  } catch (error) {
    console.error(`Failed to sync BI Failure Incident [${record.id}]:`, error);
  }
}
