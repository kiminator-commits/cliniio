import type {
  LearningAISettings,
  LearningAISettingsRow,
  UserProfile,
} from '../../types/learningAITypes';
import type { Json } from '../../types/database.types';
import { DEFAULT_VALUES } from '../ai/learningAI/learningAIConfig';

/**
 * Transform database row data to LearningAISettings interface
 */
export function transformSettingsData(
  settingsData: LearningAISettingsRow
): LearningAISettings {
  return {
    id: settingsData.id ?? '',
    facility_id: settingsData.facility_id ?? '',
    ai_enabled: settingsData.ai_enabled ?? false,
    ai_version: settingsData.ai_version ?? '',
    personalized_recommendations:
      settingsData.personalized_recommendations ?? false,
    skill_gap_analysis: settingsData.skill_gap_analysis ?? false,
    learning_path_optimization:
      settingsData.learning_path_optimization ?? false,
    performance_prediction: settingsData.performance_prediction ?? false,
    adaptive_difficulty: settingsData.adaptive_difficulty ?? false,
    learning_analytics_enabled:
      settingsData.learning_analytics_enabled ?? false,
    behavior_tracking: settingsData.behavior_tracking ?? false,
    progress_prediction: settingsData.progress_prediction ?? false,
    engagement_metrics: settingsData.engagement_metrics ?? false,
    retention_analysis: settingsData.retention_analysis ?? false,
    ai_confidence_threshold: settingsData.ai_confidence_threshold ?? 0,
    recommendation_limit: settingsData.recommendation_limit ?? 0,
    data_retention_days: settingsData.data_retention_days ?? 0,
    model_version: settingsData.model_version ?? '',
    data_sharing_enabled: settingsData.data_sharing_enabled ?? false,
    local_ai_processing_enabled:
      settingsData.local_ai_processing_enabled ?? false,
    encrypted_data_transmission:
      settingsData.encrypted_data_transmission ?? false,
    ai_model_training: settingsData.ai_model_training ?? false,
    created_at: settingsData.created_at ?? '',
    updated_at: settingsData.updated_at ?? '',
  };
}

/**
 * Transform database profile data to UserProfile interface
 */
export function transformUserProfileData(profileData: {
  id: string;
  user_id: string;
  role: string;
  department: string;
  experience_level: string;
  skill_areas: Json;
  learning_goals: Json;
  preferred_learning_style: string;
  time_availability: number;
  updated_at: string;
  created_at: string;
}): UserProfile {
  return {
    id: profileData.id ?? '',
    user_id: profileData.user_id ?? '',
    role: profileData.role ?? DEFAULT_VALUES.USER_ROLE,
    department: profileData.department ?? DEFAULT_VALUES.DEPARTMENT,
    experience_level:
      (profileData.experience_level as 'expert' | 'senior' | 'entry' | 'mid') ??
      DEFAULT_VALUES.EXPERIENCE_LEVEL,
    skill_areas: (profileData.skill_areas as string[]) ?? [],
    learning_goals: (profileData.learning_goals as string[]) ?? [],
    preferred_learning_style:
      profileData.preferred_learning_style ?? DEFAULT_VALUES.LEARNING_STYLE,
    time_availability:
      profileData.time_availability ?? DEFAULT_VALUES.TIME_AVAILABILITY,
    last_updated: profileData.updated_at ?? profileData.created_at ?? '',
  };
}

/**
 * Validate if a feature is enabled in settings
 */
export function validateFeatureEnabled(
  settings: LearningAISettings | null,
  featurePath: string
): boolean {
  return (
    settings !== null &&
    settings[featurePath as keyof LearningAISettings] === true
  );
}

/**
 * Check if settings are valid and loaded
 */
export function areSettingsValid(settings: LearningAISettings | null): boolean {
  return settings !== null;
}

/**
 * Get nested property from object using dot notation
 */
export function getNestedProperty(
  obj: Record<string, unknown>,
  path: string
): unknown {
  return path.split('.').reduce((current, key) => {
    return current && typeof current === 'object'
      ? (current as Record<string, unknown>)[key]
      : undefined;
  }, obj);
}

/**
 * Calculate processing time in milliseconds
 */
export function calculateProcessingTime(startTime: number): number {
  return Date.now() - startTime;
}

/**
 * Format recommendation reasoning for display
 */
export function formatRecommendationReasoning(
  reasoning: string[] | string
): string {
  if (Array.isArray(reasoning)) {
    return reasoning.join('; ');
  }
  return reasoning;
}

/**
 * Parse recommendation reasoning from string to array
 */
export function parseRecommendationReasoning(reasoning: string): string[] {
  return reasoning.split('; ').filter((item) => item.trim().length > 0);
}

/**
 * Get current timestamp in ISO format
 */
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format confidence score for display
 */
export function formatConfidenceScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Validate confidence score range
 */
export function isValidConfidenceScore(score: number): boolean {
  return score >= 0 && score <= 1;
}

/**
 * Calculate average confidence score from array
 */
export function calculateAverageConfidenceScore(scores: number[]): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

/**
 * Format learning time in minutes to human readable format
 */
export function formatLearningTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`;
}

/**
 * Validate learning path sequence
 */
export function validateLearningPath(path: string[]): boolean {
  return (
    Array.isArray(path) &&
    path.length > 0 &&
    path.every((item) => typeof item === 'string' && item.trim().length > 0)
  );
}

/**
 * Calculate learning path efficiency score
 */
export function calculatePathEfficiencyScore(
  totalTime: number,
  optimalTime: number,
  completionRate: number
): number {
  const timeEfficiency = Math.min(optimalTime / totalTime, 1);
  return (timeEfficiency + completionRate) / 2;
}

/**
 * Format skill gap priority for display
 */
export function formatSkillGapPriority(priority: number): string {
  if (priority >= 0.8) return 'High';
  if (priority >= 0.6) return 'Medium';
  if (priority >= 0.4) return 'Low';
  return 'Very Low';
}

/**
 * Calculate skill gap severity
 */
export function calculateSkillGapSeverity(
  current: number,
  required: number
): number {
  return Math.max(0, required - current);
}

/**
 * Format performance metrics for display
 */
export function formatPerformanceMetrics(
  metrics: Record<string, number>
): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [key, value] of Object.entries(metrics)) {
    if (
      key.includes('score') ||
      key.includes('rate') ||
      key.includes('probability')
    ) {
      formatted[key] = formatConfidenceScore(value);
    } else if (key.includes('time')) {
      formatted[key] = formatLearningTime(value);
    } else {
      formatted[key] = value.toString();
    }
  }
  return formatted;
}

/**
 * Validate user profile data
 */
export function validateUserProfile(profile: Partial<UserProfile>): boolean {
  return !!(
    profile.user_id &&
    profile.role &&
    profile.department &&
    profile.experience_level &&
    Array.isArray(profile.skill_areas) &&
    Array.isArray(profile.learning_goals)
  );
}

/**
 * Calculate learning efficiency score
 */
export function calculateLearningEfficiencyScore(
  completionRate: number,
  accuracy: number,
  engagement: number,
  retention: number
): number {
  return (completionRate + accuracy + engagement + retention) / 4;
}

/**
 * Format engagement trends for display
 */
export function formatEngagementTrends(
  trends: Record<string, unknown>
): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const [key, value] of Object.entries(trends)) {
    if (typeof value === 'number') {
      formatted[key] = formatConfidenceScore(value);
    } else {
      formatted[key] = String(value);
    }
  }
  return formatted;
}

/**
 * Calculate retention probability based on factors
 */
export function calculateRetentionProbability(
  engagementScore: number,
  practiceFrequency: number,
  reviewFrequency: number,
  applicationOpportunities: number
): number {
  const weights = [0.4, 0.3, 0.2, 0.1];
  return (
    engagementScore * weights[0] +
    practiceFrequency * weights[1] +
    reviewFrequency * weights[2] +
    applicationOpportunities * weights[3]
  );
}

/**
 * Format difficulty level for display
 */
export function formatDifficultyLevel(
  level: 'beginner' | 'intermediate' | 'advanced'
): string {
  const levelMap = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  };
  return levelMap[level] || 'Unknown';
}

/**
 * Calculate optimal study duration based on user profile
 */
export function calculateOptimalStudyDuration(
  experienceLevel: string,
  timeAvailability: number,
  preferredStyle: string
): number {
  let baseDuration = 30; // Default 30 minutes

  // Adjust based on experience level
  switch (experienceLevel) {
    case 'expert':
      baseDuration = 45;
      break;
    case 'senior':
      baseDuration = 40;
      break;
    case 'mid':
      baseDuration = 35;
      break;
    case 'entry':
      baseDuration = 25;
      break;
  }

  // Adjust based on time availability
  if (timeAvailability < 30) {
    baseDuration = Math.min(baseDuration, 20);
  } else if (timeAvailability > 120) {
    baseDuration = Math.min(baseDuration, 60);
  }

  // Adjust based on learning style
  if (preferredStyle === 'visual') {
    baseDuration += 5;
  } else if (preferredStyle === 'kinesthetic') {
    baseDuration += 10;
  }

  return Math.max(15, Math.min(90, baseDuration));
}
