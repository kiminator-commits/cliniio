import type {
  LearningAISettings,
  LearningAISettingsRow,
  UserProfile,
} from '@/types/learningAITypes';
import type { Json } from '@/types/database.types';
import { DEFAULT_VALUES } from '../learningAIConfig';

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
