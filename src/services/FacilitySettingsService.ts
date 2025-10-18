import { supabase } from '../lib/supabaseClient';
import { Database } from '../types/supabase/generated';

export type FacilitySettings =
  Database['public']['Tables']['facility_settings']['Row'];

export class FacilitySettingsService {
  /**
   * Get facility settings by facility ID
   */
  static async getFacilitySettings(
    facilityId: string
  ): Promise<FacilitySettings | null> {
    try {
      const { data, error } = await supabase
        .from('facility_settings')
        .select('*')
        .eq('facility_id', facilityId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching facility settings:', error);
        return null;
      }

      return data as FacilitySettings;
    } catch (error) {
      console.error('Error fetching facility settings:', error);
      return null;
    }
  }

  /**
   * Update facility settings by facility ID
   */
  static async updateFacilitySettings(
    facilityId: string,
    updates: Partial<FacilitySettings>
  ): Promise<FacilitySettings | null> {
    try {
      const updateData = {
        ...updates,
        facility_id: facilityId,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('facility_settings')
        .upsert(updateData, { onConflict: 'facility_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating facility settings:', error);
        return null;
      }

      return data as FacilitySettings;
    } catch (error) {
      console.error('Error updating facility settings:', error);
      return null;
    }
  }
}
