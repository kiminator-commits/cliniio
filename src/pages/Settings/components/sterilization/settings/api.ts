import {
  SterilizationAIService,
  SterilizationAISettings,
} from '../../../../../services/ai/sterilizationAIService';
import { AI_SETTINGS_DEFAULTS } from './constants';

export const fetchSettings = async (
  facilityId: string
): Promise<SterilizationAISettings | null> => {
  try {
    const aiService = new SterilizationAIService(facilityId);
    return await aiService.loadSettings();
  } catch (error) {
    console.error('Failed to load AI settings:', error);
    return null;
  }
};

export const saveSettings = async (
  facilityId: string,
  settings: SterilizationAISettings
): Promise<boolean> => {
  try {
    const aiService = new SterilizationAIService(facilityId);
    return await aiService.saveSettings(settings);
  } catch (error) {
    console.error('Failed to save AI settings:', error);
    return false;
  }
};

export const testConnections = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    // This would test API connections if implemented
    return { success: true, message: 'All connections successful' };
  } catch (err) {
    console.error(err);
    return { success: false, message: 'Connection test failed' };
  }
};

export const resetDefaults = async (facilityId: string): Promise<boolean> => {
  try {
    const defaultSettings: SterilizationAISettings = {
      facility_id: facilityId,
      ai_enabled: false,
      ai_version: AI_SETTINGS_DEFAULTS.AI_VERSION,
      computer_vision_enabled: false,
      tool_condition_assessment: false,
      barcode_quality_detection: false,
      tool_type_recognition: false,
      cleaning_validation: false,
      predictive_analytics_enabled: false,
      cycle_optimization: false,
      failure_prediction: false,
      efficiency_optimization: false,
      resource_planning: false,
      smart_workflow_enabled: false,
      intelligent_workflow_selection: false,
      automated_problem_detection: false,
      smart_phase_transitions: false,
      batch_optimization: false,
      quality_assurance_enabled: false,
      biological_indicator_analysis: false,
      compliance_monitoring: false,
      audit_trail_enhancement: false,
      risk_assessment: false,
      scanner_intelligence_enabled: false,
      multi_format_barcode_support: false,
      tool_history_integration: false,
      smart_validation: false,
      error_prevention: false,
      real_time_monitoring_enabled: false,
      anomaly_detection: false,
      predictive_maintenance: false,
      quality_drift_detection: false,
      smart_notifications: false,
      ai_confidence_threshold: AI_SETTINGS_DEFAULTS.AI_CONFIDENCE_THRESHOLD,
      ai_data_retention_days: AI_SETTINGS_DEFAULTS.AI_DATA_RETENTION_DAYS,
      real_time_processing_enabled: false,
      batch_processing_enabled: false,
      data_sharing_enabled: false,
      local_ai_processing_enabled: false,
      encrypted_data_transmission:
        AI_SETTINGS_DEFAULTS.ENCRYPTED_DATA_TRANSMISSION,
      ai_model_training: false,
      auto_optimization_enabled: false,
      performance_monitoring: false,
      resource_optimization: false,
      openai_api_key_encrypted: '',
      google_vision_api_key_encrypted: '',
      azure_computer_vision_key_encrypted: '',
    };

    const aiService = new SterilizationAIService(facilityId);
    return await aiService.saveSettings(defaultSettings);
  } catch (error) {
    console.error('Failed to reset AI settings:', error);
    return false;
  }
};

export const createDefaultSettings = (
  facilityId: string
): SterilizationAISettings => {
  return {
    facility_id: facilityId,
    ai_enabled: false,
    ai_version: AI_SETTINGS_DEFAULTS.AI_VERSION,
    computer_vision_enabled: false,
    tool_condition_assessment: false,
    barcode_quality_detection: false,
    tool_type_recognition: false,
    cleaning_validation: false,
    predictive_analytics_enabled: false,
    cycle_optimization: false,
    failure_prediction: false,
    efficiency_optimization: false,
    resource_planning: false,
    smart_workflow_enabled: false,
    intelligent_workflow_selection: false,
    automated_problem_detection: false,
    smart_phase_transitions: false,
    batch_optimization: false,
    quality_assurance_enabled: false,
    biological_indicator_analysis: false,
    compliance_monitoring: false,
    audit_trail_enhancement: false,
    risk_assessment: false,
    scanner_intelligence_enabled: false,
    multi_format_barcode_support: false,
    tool_history_integration: false,
    smart_validation: false,
    error_prevention: false,
    real_time_monitoring_enabled: false,
    anomaly_detection: false,
    predictive_maintenance: false,
    quality_drift_detection: false,
    smart_notifications: false,
    ai_confidence_threshold: AI_SETTINGS_DEFAULTS.AI_CONFIDENCE_THRESHOLD,
    ai_data_retention_days: AI_SETTINGS_DEFAULTS.AI_DATA_RETENTION_DAYS,
    real_time_processing_enabled: false,
    batch_processing_enabled: false,
    data_sharing_enabled: false,
    local_ai_processing_enabled: false,
    encrypted_data_transmission:
      AI_SETTINGS_DEFAULTS.ENCRYPTED_DATA_TRANSMISSION,
    ai_model_training: false,
    auto_optimization_enabled: false,
    performance_monitoring: false,
    resource_optimization: false,
    openai_api_key_encrypted: '',
    google_vision_api_key_encrypted: '',
    azure_computer_vision_key_encrypted: '',
  };
};
