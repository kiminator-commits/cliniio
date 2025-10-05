import { supabase } from '@/lib/supabaseClient';

export interface ComplianceSettings {
  id: string;
  facility_id: string;
  sterilization_required: boolean;
  ci_strips_enabled: boolean;
  bi_tests_required: boolean;
  environmental_logging: boolean;
  updated_at: string;
}

export const complianceService = {
  async loadComplianceSettings(): Promise<ComplianceSettings | null> {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error(
          'Unauthorized: cannot load compliance settings without a valid user.'
        );
        return null;
      }

      const facilityId = user.user_metadata?.facility_id;
      if (!facilityId) {
        console.error(
          'Missing facility_id — cannot fetch compliance settings.'
        );
        return null;
      }

      const { data, error } = await supabase
        .from('compliance_settings')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        console.error('Error loading compliance settings:', error.message);
        return null;
      }

      console.info(
        '✅ Compliance settings loaded successfully for facility:',
        facilityId
      );
      return data as ComplianceSettings;
    } catch (err) {
      console.error('Unexpected error loading compliance settings:', err);
      return null;
    }
  },
};
