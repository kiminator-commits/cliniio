export const STERILIZATION_AI_CONSTANTS = {
  // Default values
  DEFAULT_AI_VERSION: '1.0.0',
  DEFAULT_AI_CONFIDENCE_THRESHOLD: 0.85,
  DEFAULT_AI_DATA_RETENTION_DAYS: 90,
  DEFAULT_ENCRYPTED_DATA_TRANSMISSION: true,

  // Range limits
  AI_CONFIDENCE_THRESHOLD_MIN: 0.5,
  AI_CONFIDENCE_THRESHOLD_MAX: 1.0,
  AI_CONFIDENCE_THRESHOLD_STEP: 0.05,
  AI_DATA_RETENTION_DAYS_MIN: 30,
  AI_DATA_RETENTION_DAYS_MAX: 1095,

  // Local storage keys
  LOCAL_STORAGE_KEY: 'cliniio_sterilization_ai_settings',

  // API key masking
  API_KEY_MASK_PREFIX: '••••••••',
  API_KEY_VISIBLE_CHARS: 4,

  // Message display timeout
  SUCCESS_MESSAGE_TIMEOUT: 3000,

  // Validation thresholds
  MIN_API_KEY_LENGTH: 4,
} as const;

export const DEFAULT_SETTINGS = {
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
  ai_confidence_threshold: 0.85,
  ai_data_retention_days: 90,
  real_time_processing_enabled: false,
  batch_processing_enabled: false,
  data_sharing_enabled: false,
  local_ai_processing_enabled: false,
  encrypted_data_transmission: true,
  ai_model_training: false,
  auto_optimization_enabled: false,
  performance_monitoring: false,
  resource_optimization: false,
  openai_api_key_encrypted: '',
  google_vision_api_key_encrypted: '',
  azure_computer_vision_key_encrypted: '',
} as const;
