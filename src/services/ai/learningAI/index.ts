// Re-export all sub-services
export { RecommendationService } from './recommendationService';
export { KnowledgeGapService } from './knowledgeGapService';
export { PathwayAnalysisService } from './pathwayAnalysisService';
export { EvaluationService } from './evaluationService';

// Re-export main service
export { LearningAIService } from './learningAIService';

// Re-export types
export type {
  LearningAISettings,
  LearningAIInsight,
  PersonalizedRecommendationResult,
  SkillGapAnalysisResult,
  LearningPathOptimizationResult,
  PerformancePredictionResult,
  LearningProgressData,
  UserProfile,
} from '../../../types/learningAITypes';

// Re-export utility functions
export {
  isFeatureEnabled,
  getNestedProperty,
  calculateProcessingTime,
  formatRecommendationReasoning,
  parseRecommendationReasoning,
  getCurrentTimestamp,
} from './learningAIUtils';

// Re-export configuration
export {
  DEFAULT_AI_SETTINGS,
  SUPABASE_ERROR_CODES,
  DEFAULT_VALUES,
  QUERY_LIMITS,
} from './learningAIConfig';
