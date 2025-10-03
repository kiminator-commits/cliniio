import type { Json } from '../../../types/database.types';

export type SupabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

// Database row interfaces
export interface LearningAISettingsRow {
  id: string;
  facility_id: string;
  ai_enabled: boolean;
  ai_version: string;
  personalized_recommendations: boolean;
  skill_gap_analysis: boolean;
  learning_path_optimization: boolean;
  performance_prediction: boolean;
  adaptive_difficulty: boolean;
  learning_analytics_enabled: boolean;
  behavior_tracking: boolean;
  progress_prediction: boolean;
  engagement_metrics: boolean;
  retention_analysis: boolean;
  ai_confidence_threshold: number;
  recommendation_limit: number;
  data_retention_days: number;
  model_version: string;
  data_sharing_enabled: boolean;
  local_ai_processing_enabled: boolean;
  encrypted_data_transmission: boolean;
  ai_model_training: boolean;
  created_at: string;
  updated_at: string;
}

export interface PersonalizedRecommendationRow {
  id: string;
  facility_id: string;
  user_id: string;
  recommended_content: Json;
  recommendation_reasoning: string;
  confidence_scores: Json;
  learning_path_suggestions: Json;
  skill_development_areas: Json;
  estimated_completion_time: number;
  difficulty_progression: Json;
  alternative_recommendations: Json;
  confidence_score: number;
  processing_time_ms: number;
  created_at: string;
}

export interface SkillGapAnalysisRow {
  id: string;
  facility_id: string;
  user_id: string;
  current_skills: Json;
  required_skills: Json;
  skill_gaps: Json;
  gap_priorities: Json;
  learning_recommendations: Json;
  skill_development_plan: Json;
  estimated_learning_time: number;
  confidence_score: number;
  processing_time_ms: number;
  created_at: string;
}

export interface LearningPathOptimizationRow {
  id: string;
  facility_id: string;
  user_id: string;
  optimized_learning_path: Json;
  path_efficiency_score: number;
  estimated_total_time: number;
  difficulty_progression: Json;
  prerequisite_mapping: Json;
  alternative_paths: Json;
  optimization_factors: Json;
  confidence_score: number;
  processing_time_ms: number;
  created_at: string;
}

export interface PerformancePredictionRow {
  id: string;
  facility_id: string;
  user_id: string;
  content_id: string;
  predicted_performance: number;
  confidence_score: number;
  performance_factors: Json;
  improvement_suggestions: Json;
  estimated_completion_time: number;
  difficulty_assessment: Json;
  prerequisite_requirements: Json;
  alternative_approaches: Json;
  processing_time_ms: number;
  created_at: string;
}
