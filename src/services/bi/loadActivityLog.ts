import { supabase } from '@/lib/supabaseClient';

/**
 * Load BI activity log for a specific facility
 * Fetches activity records from Supabase with proper error handling
 */
export async function loadActivityLog(facilityId: string): Promise<{ data: any[] | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bi_activity_log')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    console.info(`✅ Loaded ${data?.length ?? 0} BI activity records.`);
    return { data };
  } catch (error: any) {
    console.error('❌ Failed to load BI activity log:', error.message);
    return { data: null, error: error.message };
  }
}
