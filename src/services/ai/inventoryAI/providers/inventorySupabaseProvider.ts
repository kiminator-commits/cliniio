import { supabase } from '../../../../lib/supabaseClient';
import type { Database } from '../../../../types/database.types';
import type { InventoryAISettings } from '../../../types/inventoryAITypes';
import { DEFAULT_AI_SETTINGS } from '../inventoryAIConfig';

export class InventorySupabaseProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Load AI settings for the facility
  async loadSettings(): Promise<Database['public']['Tables']['inventory_ai_settings']['Row'] | null> {
    try {
      const { data, error } = await supabase
        .from<Database['public']['Tables']['inventory_ai_settings']['Row']>('inventory_ai_settings')
        .select('*')
        .eq('facility_id', this.facilityId)
        .single();

      if (error) {
        console.error('Error loading AI settings:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return null;
    }
  }

  // Save AI settings for the facility
  async saveSettings(settings: Partial<InventoryAISettings>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from<Database['public']['Tables']['inventory_ai_settings']['Row']>('inventory_ai_settings')
        .upsert<Database['public']['Tables']['inventory_ai_settings']['Insert']>({
          facility_id: this.facilityId,
          ...settings,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error saving AI settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return false;
    }
  }

  // Initialize default AI settings for a facility
  async initializeSettings(): Promise<boolean> {
    try {
      const defaultSettings: Partial<InventoryAISettings> = DEFAULT_AI_SETTINGS;

      return await this.saveSettings(defaultSettings);
    } catch (error) {
      console.error('Error initializing AI settings:', error);
      return false;
    }
  }
}
