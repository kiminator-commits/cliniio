// Default AI settings configuration
export const DEFAULT_AI_SETTINGS = {
  ai_enabled: false,
  ai_version: '1.0.0',
  computer_vision_enabled: false,
  barcode_scanning_enabled: false,
  image_recognition_enabled: false,
  quality_assessment_enabled: false,
  damage_detection_enabled: false,
  inventory_counting_enabled: false,
  predictive_analytics_enabled: false,
  demand_forecasting_enabled: false,
  maintenance_prediction_enabled: false,
  cost_optimization_enabled: false,
  seasonal_analysis_enabled: false,
  cycle_optimization_enabled: false,
  smart_categorization_enabled: false,
  auto_classification_enabled: false,
  smart_form_filling_enabled: false,
  intelligent_workflow_enabled: false,
  quality_assurance_enabled: false,
  compliance_monitoring_enabled: false,
  audit_trail_enhancement_enabled: false,
  risk_assessment_enabled: false,
  scanner_intelligence_enabled: false,
  multi_format_barcode_support: false,
  smart_validation_enabled: false,
  error_prevention_enabled: false,
  real_time_monitoring_enabled: false,
  anomaly_detection_enabled: false,
  predictive_maintenance_enabled: false,
  smart_notifications_enabled: false,
  ai_confidence_threshold: 0.85,
  ai_data_retention_days: 90,
  real_time_processing_enabled: false,
  data_sharing_enabled: false,
  local_ai_processing_enabled: false,
  encrypted_data_transmission: true,
  ai_model_training: false,
  auto_optimization_enabled: false,
  performance_monitoring: false,
  resource_optimization: false,
} as const;

// AI confidence and threshold constants
export const AI_CONFIDENCE_THRESHOLD = 0.85;
export const DEFAULT_CONFIDENCE_SCORE = 0.85;

// Data retention and time period constants
export const DATA_RETENTION_DAYS = 90;
export const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
export const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
export const DATA_ANALYSIS_PERIOD = '30_days';

// Report and display limits
export const HIGH_VALUE_ITEMS_LIMIT = 10;
export const UPCOMING_MAINTENANCE_LIMIT = 5;

// Placeholder values
export const PLACEHOLDER_MAINTENANCE_ID = 'maintenance-1';
export const PLACEHOLDER_COST_TRENDS = [
  { month: 'Jan', cost: 1000, trend: 'stable' as const },
  { month: 'Feb', cost: 1200, trend: 'increasing' as const },
];

// Default string values
export const DEFAULT_CATEGORY = 'Uncategorized';
export const DEFAULT_UNKNOWN = 'Unknown';
export const DEFAULT_UNKNOWN_EQUIPMENT = 'Unknown Equipment';

// MIME types for file exports
export const MIME_TYPES = {
  csv: 'text/csv',
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  pdf: 'application/pdf',
  json: 'application/json',
  default: 'text/plain',
} as const;

// Default quality assessment values
export const DEFAULT_QUALITY_ASSESSMENT = 'good';
export const DEFAULT_CONDITION_RATING = 'good';

// Default recommendations
export const DEFAULT_RECOMMENDATIONS = [
  'Increase inventory levels for low stock items.',
  'Review maintenance schedules.',
];

// Risk levels
export const DEFAULT_RISK_LEVEL = 'low' as const;
