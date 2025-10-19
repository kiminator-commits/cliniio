import { supabase } from '@/lib/supabaseClient';

/**
 * Load BI compliance settings for a specific facility
 * Fetches compliance settings from Supabase with proper error handling
 */
export async function loadComplianceSettings(facilityId: string): Promise<{ data: any | null; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('bi_compliance_settings')
      .select('*')
      .eq('facility_id', facilityId)
      .single();
    if (error) throw error;
    console.info('✅ Loaded BI compliance settings successfully.');
    return { data };
  } catch (error: any) {
    console.error('❌ Failed to load BI compliance settings:', error.message);
    return { data: null, error: error.message };
  }
}
