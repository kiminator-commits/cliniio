import { SterilizationAISettingsType, LocalStorageSettings } from './types';
import { STERILIZATION_AI_CONSTANTS } from './constants';

export const fetchSettings = async (
  userId: string
): Promise<SterilizationAISettingsType | null> => {
  if (!userId) return null;

  try {
    const aiSettings = localStorage.getItem(
      STERILIZATION_AI_CONSTANTS.LOCAL_STORAGE_KEY
    );
    if (aiSettings) {
      const parsed: LocalStorageSettings = JSON.parse(aiSettings);

      // Map from localStorage camelCase to new snake_case interface
      const mappedSettings: SterilizationAISettingsType = {
        facility_id: userId,
        ai_version: STERILIZATION_AI_CONSTANTS.DEFAULT_AI_VERSION,
        ai_enabled: parsed.aiEnabled || false,
        computer_vision_enabled: parsed.computerVisionEnabled || false,
        tool_condition_assessment: parsed.toolConditionAssessment || false,
        barcode_quality_detection: parsed.barcodeQualityDetection || false,
        tool_type_recognition: parsed.toolTypeRecognition || false,
        cleaning_validation: parsed.cleaningValidation || false,
        predictive_analytics_enabled:
          parsed.predictiveAnalyticsEnabled || false,
        cycle_optimization: parsed.cycleOptimization || false,
        failure_prediction: parsed.failurePrediction || false,
        efficiency_optimization: parsed.efficiencyOptimization || false,
        resource_planning: parsed.resourcePlanning || false,
        smart_workflow_enabled: parsed.smartWorkflowEnabled || false,
        intelligent_workflow_selection:
          parsed.intelligentWorkflowSelection || false,
        automated_problem_detection: parsed.automatedProblemDetection || false,
        smart_phase_transitions: parsed.smartPhaseTransitions || false,
        batch_optimization: parsed.batchOptimization || false,
        quality_assurance_enabled: parsed.qualityAssuranceEnabled || false,
        biological_indicator_analysis:
          parsed.biologicalIndicatorAnalysis || false,
        compliance_monitoring: parsed.complianceMonitoring || false,
        audit_trail_enhancement: parsed.auditTrailEnhancement || false,
        risk_assessment: parsed.riskAssessment || false,
        scanner_intelligence_enabled:
          parsed.scannerIntelligenceEnabled || false,
        multi_format_barcode_support: parsed.multiFormatBarcodeSupport || false,
        tool_history_integration: parsed.toolHistoryIntegration || false,
        smart_validation: parsed.smartValidation || false,
        error_prevention: parsed.errorPrevention || false,
        real_time_monitoring_enabled: parsed.realTimeMonitoringEnabled || false,
        anomaly_detection: parsed.anomalyDetection || false,
        predictive_maintenance: parsed.predictiveMaintenance || false,
        quality_drift_detection: parsed.qualityDriftDetection || false,
        smart_notifications: parsed.smartNotifications || false,
        ai_confidence_threshold:
          parsed.aiConfidenceThreshold ||
          STERILIZATION_AI_CONSTANTS.DEFAULT_AI_CONFIDENCE_THRESHOLD,
        ai_data_retention_days:
          parsed.aiDataRetentionDays ||
          STERILIZATION_AI_CONSTANTS.DEFAULT_AI_DATA_RETENTION_DAYS,
        real_time_processing_enabled: parsed.realTimeProcessingEnabled || false,
        batch_processing_enabled: parsed.batchProcessingEnabled || false,
        data_sharing_enabled: parsed.dataSharingEnabled || false,
        local_ai_processing_enabled: parsed.localAIProcessingEnabled || false,
        encrypted_data_transmission:
          parsed.encryptedDataTransmission ||
          STERILIZATION_AI_CONSTANTS.DEFAULT_ENCRYPTED_DATA_TRANSMISSION,
        ai_model_training: parsed.aiModelTraining || false,
        auto_optimization_enabled: parsed.autoOptimizationEnabled || false,
        performance_monitoring: parsed.performanceMonitoring || false,
        resource_optimization: parsed.resourceOptimization || false,
        openai_api_key_encrypted: parsed.openaiApiKey
          ? STERILIZATION_AI_CONSTANTS.API_KEY_MASK_PREFIX +
            parsed.openaiApiKey.slice(
              -STERILIZATION_AI_CONSTANTS.API_KEY_VISIBLE_CHARS
            )
          : '',
        google_vision_api_key_encrypted: parsed.googleVisionApiKey
          ? STERILIZATION_AI_CONSTANTS.API_KEY_MASK_PREFIX +
            parsed.googleVisionApiKey.slice(
              -STERILIZATION_AI_CONSTANTS.API_KEY_VISIBLE_CHARS
            )
          : '',
        azure_computer_vision_key_encrypted: parsed.azureComputerVisionKey
          ? STERILIZATION_AI_CONSTANTS.API_KEY_MASK_PREFIX +
            parsed.azureComputerVisionKey.slice(
              -STERILIZATION_AI_CONSTANTS.API_KEY_VISIBLE_CHARS
            )
          : '',
      };

      return mappedSettings;
    }
    return null;
  } catch (error) {
    console.error('Failed to load sterilization AI settings:', error);
    throw new Error('Failed to load settings');
  }
};

export const saveSettings = async (
  settings: SterilizationAISettingsType,
  userId: string
): Promise<void> => {
  if (!userId) throw new Error('User ID required');

  try {
    const aiSettings = {
      ai_enabled: settings.ai_enabled,
      computer_vision_enabled: settings.computer_vision_enabled,
      tool_condition_assessment: settings.tool_condition_assessment,
      barcode_quality_detection: settings.barcode_quality_detection,
      tool_type_recognition: settings.tool_type_recognition,
      cleaning_validation: settings.cleaning_validation,
      predictive_analytics_enabled: settings.predictive_analytics_enabled,
      cycle_optimization: settings.cycle_optimization,
      failure_prediction: settings.failure_prediction,
      efficiency_optimization: settings.efficiency_optimization,
      resource_planning: settings.resource_planning,
      smart_workflow_enabled: settings.smart_workflow_enabled,
      intelligent_workflow_selection: settings.intelligent_workflow_selection,
      automated_problem_detection: settings.automated_problem_detection,
      smart_phase_transitions: settings.smart_phase_transitions,
      batch_optimization: settings.batch_optimization,
      quality_assurance_enabled: settings.quality_assurance_enabled,
      biological_indicator_analysis: settings.biological_indicator_analysis,
      compliance_monitoring: settings.compliance_monitoring,
      audit_trail_enhancement: settings.audit_trail_enhancement,
      risk_assessment: settings.risk_assessment,
      scanner_intelligence_enabled: settings.scanner_intelligence_enabled,
      multi_format_barcode_support: settings.multi_format_barcode_support,
      tool_history_integration: settings.tool_history_integration,
      smart_validation: settings.smart_validation,
      error_prevention: settings.error_prevention,
      real_time_monitoring_enabled: settings.real_time_monitoring_enabled,
      anomaly_detection: settings.anomaly_detection,
      predictive_maintenance: settings.predictive_maintenance,
      quality_drift_detection: settings.quality_drift_detection,
      smart_notifications: settings.smart_notifications,
      ai_confidence_threshold: settings.ai_confidence_threshold,
      ai_data_retention_days: settings.ai_data_retention_days,
      real_time_processing_enabled: settings.real_time_processing_enabled,
      batch_processing_enabled: settings.batch_processing_enabled,
      data_sharing_enabled: settings.data_sharing_enabled,
      local_ai_processing_enabled: settings.local_ai_processing_enabled,
      encrypted_data_transmission: settings.encrypted_data_transmission,
      ai_model_training: settings.ai_model_training,
      auto_optimization_enabled: settings.auto_optimization_enabled,
      performance_monitoring: settings.performance_monitoring,
      resource_optimization: settings.resource_optimization,
      openai_api_key_encrypted: settings.openai_api_key_encrypted,
      google_vision_api_key_encrypted: settings.google_vision_api_key_encrypted,
      azure_computer_vision_key_encrypted:
        settings.azure_computer_vision_key_encrypted,
    };

    localStorage.setItem(
      STERILIZATION_AI_CONSTANTS.LOCAL_STORAGE_KEY,
      JSON.stringify(aiSettings)
    );
  } catch (error) {
    console.error('Failed to save sterilization AI settings:', error);
    throw new Error('Failed to save settings');
  }
};

export const testConnection = async (
  apiKey: string,
  provider: 'openai' | 'google_vision' | 'azure_computer_vision'
): Promise<boolean> => {
  try {
    // This would typically make an actual API call to test the connection
    // For now, we'll simulate a successful connection if the key format looks valid
    if (!apiKey || apiKey.length < 10) {
      return false;
    }

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return true;
  } catch (error) {
    console.error(`Failed to test ${provider} connection:`, error);
    return false;
  }
};

export const resetToDefaults = async (
  userId: string
): Promise<SterilizationAISettingsType> => {
  if (!userId) throw new Error('User ID required');

  try {
    // Clear existing settings
    localStorage.removeItem(STERILIZATION_AI_CONSTANTS.LOCAL_STORAGE_KEY);

    // Return default settings
    return {
      facility_id: userId,
      ai_version: STERILIZATION_AI_CONSTANTS.DEFAULT_AI_VERSION,
      ai_enabled: false,
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
      ai_confidence_threshold:
        STERILIZATION_AI_CONSTANTS.DEFAULT_AI_CONFIDENCE_THRESHOLD,
      ai_data_retention_days:
        STERILIZATION_AI_CONSTANTS.DEFAULT_AI_DATA_RETENTION_DAYS,
      real_time_processing_enabled: false,
      batch_processing_enabled: false,
      data_sharing_enabled: false,
      local_ai_processing_enabled: false,
      encrypted_data_transmission:
        STERILIZATION_AI_CONSTANTS.DEFAULT_ENCRYPTED_DATA_TRANSMISSION,
      ai_model_training: false,
      auto_optimization_enabled: false,
      performance_monitoring: false,
      resource_optimization: false,
      openai_api_key_encrypted: '',
      google_vision_api_key_encrypted: '',
      azure_computer_vision_key_encrypted: '',
    };
  } catch (error) {
    console.error('Failed to reset sterilization AI settings:', error);
    throw new Error('Failed to reset settings');
  }
};

export const validateAndSanitizeSettings = (
  settings: SterilizationAISettingsType
): SterilizationAISettingsType => {
  // Ensure numeric values are within bounds
  return {
    ...settings,
    ai_confidence_threshold: Math.max(
      STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MIN,
      Math.min(
        STERILIZATION_AI_CONSTANTS.AI_CONFIDENCE_THRESHOLD_MAX,
        settings.ai_confidence_threshold
      )
    ),
    ai_data_retention_days: Math.max(
      STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MIN,
      Math.min(
        STERILIZATION_AI_CONSTANTS.AI_DATA_RETENTION_DAYS_MAX,
        settings.ai_data_retention_days
      )
    ),
  };
};
