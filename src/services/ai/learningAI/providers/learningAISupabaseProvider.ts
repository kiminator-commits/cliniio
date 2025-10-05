import { supabase } from '../../../../lib/supabaseClient';
import type {
  LearningAISettings,
  LearningAISettingsRow,
  LearningProgressData,
  UserProfile,
  SupabaseError,
} from '../../../../types/learningAITypes';
import type { Json } from '../../../../types/database.types';
import { SUPABASE_ERROR_CODES, QUERY_LIMITS } from '../learningAIConfig';
import {
  getCurrentTimestamp,
  transformSettingsData,
  transformUserProfileData,
} from '../../../learningAI/learningAIUtils';

/**
 * Load AI settings for the facility
 */
export async function loadLearningAISettings(
  facilityId: string
): Promise<LearningAISettings | null> {
  try {
    const { data, error } = await supabase
      .from('learning_ai_settings')
      .select('*')
      .eq('facility_id', facilityId)
      .single();

    if (error) {
      const errorData = error as SupabaseError;
      if (errorData.code === SUPABASE_ERROR_CODES.NO_DATA_FOUND) {
        // No settings found, return null
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    const settingsData = data as unknown as LearningAISettingsRow;
    return transformSettingsData(settingsData);
  } catch (err) {
    console.error(err);
    console.error('Error loading learning AI settings');
    return null;
  }
}

/**
 * Save AI settings to database
 */
export async function saveLearningAISettings(
  facilityId: string,
  settings: Partial<LearningAISettings>
): Promise<boolean> {
  try {
    const upsertData: Partial<LearningAISettingsRow> = {
      facility_id: facilityId,
      ai_enabled: settings.ai_enabled,
      ai_version: settings.ai_version,
      personalized_recommendations: settings.personalized_recommendations,
      skill_gap_analysis: settings.skill_gap_analysis,
      learning_path_optimization: settings.learning_path_optimization,
      performance_prediction: settings.performance_prediction,
      adaptive_difficulty: settings.adaptive_difficulty,
      learning_analytics_enabled: settings.learning_analytics_enabled,
      behavior_tracking: settings.behavior_tracking,
      progress_prediction: settings.progress_prediction,
      engagement_metrics: settings.engagement_metrics,
      retention_analysis: settings.retention_analysis,
      ai_confidence_threshold: settings.ai_confidence_threshold,
      recommendation_limit: settings.recommendation_limit,
      data_retention_days: settings.data_retention_days,
      model_version: settings.model_version,
      data_sharing_enabled: settings.data_sharing_enabled,
      local_ai_processing_enabled: settings.local_ai_processing_enabled,
      encrypted_data_transmission: settings.encrypted_data_transmission,
      ai_model_training: settings.ai_model_training,
      updated_at: getCurrentTimestamp(),
    };

    const { error } = await supabase
      .from('learning_ai_settings')
      .upsert(upsertData);

    if (error) {
      console.error('Error saving learning AI settings:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(err);
    console.error('Error saving learning AI settings');
    return false;
  }
}

/**
 * Get learning progress data for a user
 */
export async function getLearningProgressData(
  facilityId: string,
  userId: string
): Promise<LearningProgressData[]> {
  try {
    const { data, error } = await supabase
      .from('learning_progress')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(QUERY_LIMITS.LEARNING_PROGRESS_DATA);

    if (error) {
      console.error('Error getting learning progress data:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    const rows = data as unknown as LearningProgressData[];
    return rows;
  } catch (error) {
    console.error('Error getting learning progress data:', error);
    return [];
  }
}

/**
 * Get user profile data
 */
export async function getUserProfileData(
  facilityId: string,
  userId: string
): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .eq('facility_id', facilityId)
      .single();

    if (error) {
      console.error('Error getting user profile:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    const profileData = data as unknown as {
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
    };

    return transformUserProfileData(profileData);
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
}
