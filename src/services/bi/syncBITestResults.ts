import { supabase } from '@/lib/supabaseClient';

/**
 * Synchronize BI test results with Supabase
 * Handles upsert operations for BI test result records
 */
export async function syncBITestResults(record: any) {
  try {
    const { id, ...payload } = record;
    const { error } = await supabase
      .from('bi_test_results')
      .upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    console.info(`Synced BI Test Result [${id}] successfully.`);
  } catch (error) {
    console.error(`Failed to sync BI Test Result [${record.id}]:`, error);
  }
}
