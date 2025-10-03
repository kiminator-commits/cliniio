// Core data structures for learning AI service
export interface LearningProgressData {
  id: string;
  user_id: string;
  content_id: string;
  content_type: string;
  progress_status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  completion_percentage: number;
  time_spent_minutes: number;
  last_accessed: string;
  score?: number;
  attempts: number;
  learning_path_id?: string;
}

export interface LearningContent {
  id: string;
  title: string;
  content_type:
    | 'course'
    | 'video'
    | 'article'
    | 'quiz'
    | 'simulation'
    | 'assessment';
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes: number;
  category: string;
  tags: string[];
  prerequisites: string[];
  learning_objectives: string[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  role: string;
  department: string;
  experience_level: 'entry' | 'mid' | 'senior' | 'expert';
  skill_areas: string[];
  learning_goals: string[];
  preferred_learning_style: string;
  time_availability: number;
  last_updated: string;
}

export interface LearningSession {
  id: string;
  user_id: string;
  content_id: string;
  session_start: string;
  session_end?: string;
  duration_minutes: number;
  engagement_score: number;
  completion_status: string;
  notes?: string;
}

// AI Service Interfaces
export interface LearningAIInsight {
  id: string;
  type:
    | 'personalized_recommendation'
    | 'skill_gap_analysis'
    | 'learning_path_optimization'
    | 'performance_prediction'
    | 'adaptive_difficulty'
    | 'engagement_analysis'
    | 'retention_prediction'
    | 'learning_analytics';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  actionable: boolean;
  recommendations: string[];
  data: Record<string, unknown>;
  created_at: string;
  facility_id: string;
}

export interface PersonalizedRecommendationResult {
  id: string;
  facility_id: string;
  user_id: string;
  recommended_content: string[];
  recommendation_reasoning: string[];
  confidence_scores: number[];
  learning_path_suggestions: string[];
  skill_development_areas: string[];
  estimated_completion_time: number;
  difficulty_progression: string[];
  alternative_recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface SkillGapAnalysisResult {
  id: string;
  facility_id: string;
  user_id: string;
  current_skills: Record<string, number>;
  required_skills: Record<string, number>;
  skill_gaps: Record<string, number>;
  gap_priorities: string[];
  learning_recommendations: string[];
  skill_development_plan: string[];
  estimated_learning_time: number;
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface LearningPathOptimizationResult {
  id: string;
  facility_id: string;
  user_id: string;
  optimized_learning_path: string[];
  path_efficiency_score: number;
  estimated_total_time: number;
  difficulty_progression: string[];
  prerequisite_mapping: Record<string, string[]>;
  alternative_paths: string[][];
  optimization_factors: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface PerformancePredictionResult {
  id: string;
  facility_id: string;
  user_id: string;
  content_id: string;
  predicted_performance: number;
  predicted_completion_time: number;
  success_probability: number;
  risk_factors: string[];
  improvement_suggestions: string[];
  study_recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface AdaptiveDifficultyResult {
  id: string;
  facility_id: string;
  user_id: string;
  content_id: string;
  recommended_difficulty: 'beginner' | 'intermediate' | 'advanced';
  difficulty_adjustment: number;
  learning_curve_analysis: string;
  adaptation_reasoning: string[];
  performance_indicators: Record<string, number>;
  next_difficulty_target: string;
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface EngagementAnalysisResult {
  id: string;
  facility_id: string;
  user_id: string;
  engagement_score: number;
  engagement_trends: Record<string, unknown>;
  engagement_factors: string[];
  disengagement_triggers: string[];
  improvement_suggestions: string[];
  optimal_learning_times: string[];
  content_preferences: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface RetentionPredictionResult {
  id: string;
  facility_id: string;
  user_id: string;
  retention_probability: number;
  knowledge_decay_rate: number;
  review_recommendations: string[];
  reinforcement_schedule: string[];
  retention_factors: string[];
  forgetting_risk_areas: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface LearningAnalyticsResult {
  id: string;
  facility_id: string;
  user_id: string;
  learning_efficiency_score: number;
  preferred_content_categories: string[];
  optimal_study_duration: number;
  learning_patterns: Record<string, unknown>;
  progress_trends: Record<string, unknown>;
  performance_metrics: Record<string, number>;
  insights: string[];
  recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface LearningAISettings {
  id?: string;
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
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AIModel {
  id: string;
  facility_id: string;
  name: string;
  model_type: 'recommendation' | 'prediction' | 'analysis' | 'optimization';
  provider: 'openai' | 'google' | 'azure' | 'custom';
  version: string;
  description?: string;
  model_parameters?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  deployment_status: 'deployed' | 'testing' | 'archived';
  accuracy_score?: number;
  processing_time_ms?: number;
  cost_per_request?: number;
  created_by?: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
}

// AI processing result types
export interface AIPersonalizedRecommendationResult {
  recommended_content: string[];
  recommendation_reasoning: string[];
  confidence_scores: number[];
  learning_path_suggestions: string[];
  skill_development_areas: string[];
  estimated_completion_time: number;
  difficulty_progression: string[];
  alternative_recommendations: string[];
  confidence_score: number;
}

export interface AISkillGapAnalysisResult {
  current_skills: Record<string, number>;
  required_skills: Record<string, number>;
  skill_gaps: Record<string, number>;
  gap_priorities: string[];
  learning_recommendations: string[];
  skill_development_plan: string[];
  estimated_learning_time: number;
  confidence_score: number;
}

export interface AILearningPathOptimizationResult {
  optimized_learning_path: string[];
  path_efficiency_score: number;
  estimated_total_time: number;
  difficulty_progression: string[];
  prerequisite_mapping: Record<string, string[]>;
  alternative_paths: string[][];
  optimization_factors: string[];
  confidence_score: number;
}

export interface AIPerformancePredictionResult {
  predicted_performance: number;
  predicted_completion_time: number;
  success_probability: number;
  risk_factors: string[];
  improvement_suggestions: string[];
  study_recommendations: string[];
  confidence_score: number;
}

export interface HistoricalLearningData {
  date: string;
  user_id: string;
  content_id: string;
  progress_percentage: number;
  time_spent: number;
  score?: number;
  engagement_score: number;
}

export interface LearningCostData {
  content_creation_costs: number;
  platform_costs: number;
  assessment_costs: number;
  certification_costs: number;
  total_cost: number;
}

// Database row types for Supabase
export interface SupabaseError {
  code: string;
  message: string;
  details?: string;
  hint?: string;
}

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
  recommended_content: string[];
  recommendation_reasoning: string[];
  confidence_scores: number[];
  learning_path_suggestions: string[];
  skill_development_areas: string[];
  estimated_completion_time: number;
  difficulty_progression: string[];
  alternative_recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface SkillGapAnalysisRow {
  id: string;
  facility_id: string;
  user_id: string;
  current_skills: Record<string, number>;
  required_skills: Record<string, number>;
  skill_gaps: Record<string, number>;
  gap_priorities: string[];
  learning_recommendations: string[];
  skill_development_plan: string[];
  estimated_learning_time: number;
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface LearningPathOptimizationRow {
  id: string;
  facility_id: string;
  user_id: string;
  optimized_learning_path: string[];
  path_efficiency_score: number;
  estimated_total_time: number;
  difficulty_progression: string[];
  prerequisite_mapping: Record<string, string[]>;
  alternative_paths: string[][];
  optimization_factors: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}

export interface PerformancePredictionRow {
  id: string;
  facility_id: string;
  user_id: string;
  content_id: string;
  predicted_performance: number;
  predicted_completion_time: number;
  success_probability: number;
  risk_factors: string[];
  improvement_suggestions: string[];
  study_recommendations: string[];
  confidence_score: number;
  model_id?: string;
  processing_time_ms?: number;
  created_at: string;
}
