// Default AI settings configuration
export const DEFAULT_AI_SETTINGS = {
  ai_enabled: false,
  ai_version: '1.0.0',
  personalized_recommendations: false,
  skill_gap_analysis: false,
  learning_path_optimization: false,
  performance_prediction: false,
  adaptive_difficulty: false,
  learning_analytics_enabled: false,
  behavior_tracking: false,
  progress_prediction: false,
  engagement_metrics: false,
  retention_analysis: false,
  ai_confidence_threshold: 0.8,
  recommendation_limit: 5,
  data_retention_days: 365,
  model_version: 'v1.0',
  data_sharing_enabled: false,
  local_ai_processing_enabled: false,
  encrypted_data_transmission: true,
  ai_model_training: false,
} as const;

// Error codes
export const SUPABASE_ERROR_CODES = {
  NO_DATA_FOUND: 'PGRST116',
} as const;

// Default values
export const DEFAULT_VALUES = {
  DIFFICULTY_LEVEL: 'beginner' as const,
  USER_ROLE: 'user' as const,
  DEPARTMENT: 'general' as const,
  EXPERIENCE_LEVEL: 'entry' as const,
  LEARNING_STYLE: 'visual' as const,
  TIME_AVAILABILITY: 30,
} as const;

// Query limits
export const QUERY_LIMITS = {
  LEARNING_PROGRESS_DATA: 100,
} as const;
