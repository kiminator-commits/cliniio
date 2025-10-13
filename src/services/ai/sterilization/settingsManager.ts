import { supabase } from '../../../lib/supabaseClient';
import { Database } from '../../../types/supabase/generated';
import { SterilizationAISettings } from './types';
import { getEnvVar } from '../../../lib/getEnv';
import { logSettingsAudit } from '@/services/audit/AuditLogger';

export type SterilizationAISettingsDB =
  Database['public']['Tables']['sterilization_ai_settings']['Row'];

export class SettingsManager {
  private facilityId: string;
  private settings: SterilizationAISettings | null = null;

  constructor(facilityId: string) {
    this.facilityId = facilityId;
  }

  // Load AI settings for the facility
  async loadSettings(): Promise<SterilizationAISettings | null> {
    try {
      const { data, error } = await supabase
        .from('ai_settings')
        .select('*')
        .eq('facility_id', this.facilityId)
        .eq('module', 'sterilization')
        .single();

      if (error) {
        console.error('Error loading AI settings:', error);
        return null;
      }

      this.settings = data.settings as SterilizationAISettings;
      return data.settings as SterilizationAISettings;
    } catch (error) {
      console.error('Error loading AI settings:', error);
      return null;
    }
  }

  // Save AI settings to database
  async saveSettings(
    settings: Partial<SterilizationAISettings>
  ): Promise<boolean> {
    try {
      const settingsToSave = {
        facility_id: this.facilityId,
        module: 'sterilization',
        settings: settings,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('ai_settings')
        .upsert(settingsToSave, { onConflict: 'facility_id,module' });

      if (error) {
        console.error('Error saving AI settings:', error);
        return false;
      }

      if (!error && settingsToSave) {
        await logSettingsAudit({
          facilityId: this.facilityId,
          userId: 'system',
          module: 'sterilization',
          action: 'UPDATE',
          details: settingsToSave,
        });
      }

      await this.loadSettings(); // Reload settings
      return true;
    } catch (error) {
      console.error('Error saving AI settings:', error);
      return false;
    }
  }

  // Check if AI feature is enabled
  isFeatureEnabled(feature: keyof SterilizationAISettings): boolean {
    if (!this.settings?.ai_enabled) return false;
    return this.settings[feature] === true;
  }

  // Get current settings
  getCurrentSettings(): SterilizationAISettings | null {
    return this.settings;
  }

  // Get OpenAI API key
  getOpenAIKey(): string | undefined {
    return (
      this.settings?.openai_api_key_encrypted ||
      getEnvVar('VITE_OPENAI_API_KEY')
    );
  }

  // Check if computer vision is enabled
  isComputerVisionEnabled(): boolean {
    return this.isFeatureEnabled('computer_vision_enabled');
  }

  // Check if tool condition assessment is enabled
  isToolConditionAssessmentEnabled(): boolean {
    return this.isFeatureEnabled('tool_condition_assessment');
  }

  // Check if barcode quality detection is enabled
  isBarcodeQualityDetectionEnabled(): boolean {
    return this.isFeatureEnabled('barcode_quality_detection');
  }

  // Check if tool type recognition is enabled
  isToolTypeRecognitionEnabled(): boolean {
    return this.isFeatureEnabled('tool_type_recognition');
  }

  // Check if predictive analytics is enabled
  isPredictiveAnalyticsEnabled(): boolean {
    return this.isFeatureEnabled('predictive_analytics_enabled');
  }

  // Check if cycle optimization is enabled
  isCycleOptimizationEnabled(): boolean {
    return this.isFeatureEnabled('cycle_optimization');
  }

  // Check if intelligent workflow selection is enabled
  isIntelligentWorkflowSelectionEnabled(): boolean {
    return this.isFeatureEnabled('intelligent_workflow_selection');
  }

  // Check if automated problem detection is enabled
  isAutomatedProblemDetectionEnabled(): boolean {
    return this.isFeatureEnabled('automated_problem_detection');
  }

  // Check if real-time monitoring is enabled
  isRealTimeMonitoringEnabled(): boolean {
    return this.isFeatureEnabled('real_time_monitoring_enabled');
  }

  // Check if compliance monitoring is enabled
  isComplianceMonitoringEnabled(): boolean {
    return this.isFeatureEnabled('compliance_monitoring');
  }

  // Check if biological indicator analysis is enabled
  isBiologicalIndicatorAnalysisEnabled(): boolean {
    return this.isFeatureEnabled('biological_indicator_analysis');
  }

  // Get AI confidence threshold
  getConfidenceThreshold(): number {
    return this.settings?.ai_confidence_threshold || 0.8;
  }

  // Get data retention days
  getDataRetentionDays(): number {
    return this.settings?.ai_data_retention_days || 365;
  }
}
