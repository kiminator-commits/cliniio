// Library imports
import { supabase } from '../../../lib/supabaseClient';
import { UnifiedAISettings } from './AISettingsConfigProvider';

export class AISettingsPersistenceProvider {
  private facilityId: string;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Save to unified settings table
  async saveToUnifiedTable(
    settings: Partial<UnifiedAISettings>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from('ai_settings').upsert(
        {
          facility_id: this.facilityId,
          settings: settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'facility_id' }
      );

      if (error) {
        console.error('Error saving to unified table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error saving to unified table:', error);
      return false;
    }
  }

  // Load from unified settings table
  async loadFromUnifiedTable(): Promise<UnifiedAISettings | null> {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('settings')
        .eq('facility_id', this.facilityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error loading from unified table:', error);
        return null;
      }

      return data?.settings as UnifiedAISettings;
    } catch (error) {
      console.error('Error loading from unified table:', error);
      return null;
    }
  }

  // Delete settings from unified table
  async deleteFromUnifiedTable(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ai_settings')
        .delete()
        .eq('facility_id', this.facilityId);

      if (error) {
        console.error('Error deleting from unified table:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting from unified table:', error);
      return false;
    }
  }

  // Check if settings exist in unified table
  async settingsExist(): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('facility_id')
        .eq('facility_id', this.facilityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return false;
        }
        console.error('Error checking if settings exist:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking if settings exist:', error);
      return false;
    }
  }

  // Get settings metadata (last updated, version, etc.)
  async getSettingsMetadata(): Promise<{
    updated_at: string | null;
    ai_version: string | null;
    created_at: string | null;
  } | null> {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('updated_at, ai_version, created_at')
        .eq('facility_id', this.facilityId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error getting settings metadata:', error);
        return null;
      }

      return {
        updated_at: data?.updated_at || null,
        ai_version: data?.ai_version || null,
        created_at: data?.created_at || null,
      };
    } catch (error) {
      console.error('Error getting settings metadata:', error);
      return null;
    }
  }

  // Backup settings to a backup table
  async backupSettings(settings: UnifiedAISettings): Promise<boolean> {
    try {
      const { error } = await supabase.from('ai_settings_backup').insert({
        facility_id: this.facilityId,
        settings: settings,
        backup_date: new Date().toISOString(),
        ai_version: settings.aiVersion,
      });

      if (error) {
        console.error('Error backing up settings:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error backing up settings:', error);
      return false;
    }
  }

  // Restore settings from backup
  async restoreSettings(backupDate?: string): Promise<UnifiedAISettings | null> {
    try {
      let query = supabase
        .from('ai_settings_backup')
        .select('settings')
        .eq('facility_id', this.facilityId)
        .order('backup_date', { ascending: false });

      if (backupDate) {
        query = query.eq('backup_date', backupDate);
      }

      const { data, error } = await query.limit(1).single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found
          return null;
        }
        console.error('Error restoring settings:', error);
        return null;
      }

      return data?.settings as UnifiedAISettings;
    } catch (error) {
      console.error('Error restoring settings:', error);
      return null;
    }
  }

  // Get list of available backups
  async getAvailableBackups(): Promise<Array<{
    backup_date: string;
    ai_version: string;
  }>> {
    try {
      const { data, error } = await supabase
        .from('ai_settings_backup')
        .select('backup_date, ai_version')
        .eq('facility_id', this.facilityId)
        .order('backup_date', { ascending: false });

      if (error) {
        console.error('Error getting available backups:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error getting available backups:', error);
      return [];
    }
  }

  // Export settings to JSON
  exportSettingsToJson(settings: UnifiedAISettings): string {
    return JSON.stringify(settings, null, 2);
  }

  // Import settings from JSON
  importSettingsFromJson(jsonString: string): UnifiedAISettings | null {
    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate that it has the required structure
      if (!parsed.aiEnabled || !parsed.facilityId || !parsed.aiConfig) {
        throw new Error('Invalid settings format');
      }

      return parsed as UnifiedAISettings;
    } catch (error) {
      console.error('Error importing settings from JSON:', error);
      return null;
    }
  }

  // Validate settings structure
  validateSettingsStructure(settings: unknown): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check required top-level properties
    const requiredProperties = [
      'aiEnabled',
      'computerVision',
      'predictiveAnalytics',
      'smartWorkflow',
      'qualityAssurance',
      'realTimeMonitoring',
      'analytics',
      'intelligence',
      'performance',
      'privacy',
      'integration',
      'userExperience',
      'environmental',
      'learning',
      'aiConfig',
      'apiKeys',
      'facilityId',
      'aiVersion',
      'updated_at',
    ];

    requiredProperties.forEach(prop => {
      if (!(prop in settings)) {
        errors.push(`Missing required property: ${prop}`);
      }
    });

    // Check nested object structures
    if (settings.computerVision && typeof settings.computerVision !== 'object') {
      errors.push('computerVision must be an object');
    }

    if (settings.predictiveAnalytics && typeof settings.predictiveAnalytics !== 'object') {
      errors.push('predictiveAnalytics must be an object');
    }

    if (settings.aiConfig && typeof settings.aiConfig !== 'object') {
      errors.push('aiConfig must be an object');
    }

    // Check AI config properties
    if (settings.aiConfig) {
      if (typeof settings.aiConfig.aiConfidenceThreshold !== 'number') {
        errors.push('aiConfig.aiConfidenceThreshold must be a number');
      }
      if (typeof settings.aiConfig.aiDataRetentionDays !== 'number') {
        errors.push('aiConfig.aiDataRetentionDays must be a number');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
