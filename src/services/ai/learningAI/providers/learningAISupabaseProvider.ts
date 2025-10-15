import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/supabase/generated';
import type {
  LearningAISettings,
  _LearningAISettingsRow,
  LearningProgressData,
  UserProfile,
  SupabaseError,
} from '@/types/learningAITypes';
import type { Json } from '@/types/database.types';
import { SUPABASE_ERROR_CODES, QUERY_LIMITS } from '../learningAIConfig';
import {
  getCurrentTimestamp,
  _transformSettingsData,
  transformUserProfileData,
} from '../../../learningAI/learningAIUtils';
import { logSettingsAudit } from '@/services/audit/AuditLogger';

export type LearningAISettingsDB =
  Database['public']['Tables']['learning_ai_settings']['Row'];

/**
 * Load AI settings for the facility
 */
export async function loadLearningAISettings(
  facilityId: string
): Promise<LearningAISettings | null> {
  try {
    const { data, error } = await supabase
      .from('ai_settings')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('module', 'learning')
      .single();

    if (error) {
      const errorData = error as SupabaseError;
      if (errorData.code === SUPABASE_ERROR_CODES.NO_DATA_FOUND) {
        // No settings found, return null
        return null;
      }
      // Log the error but don't throw to prevent infinite loops
      console.warn('Error loading learning AI settings:', error);
      return null;
    }

    if (!data) {
      return null;
    }

    return data.settings as LearningAISettings;
  } catch (err) {
    console.warn('Error loading learning AI settings:', err);
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
    const upsertData = {
      facility_id: facilityId,
      module: 'learning',
      settings: settings,
      updated_at: getCurrentTimestamp(),
    };

    const { error } = await supabase
      .from('ai_settings')
      .upsert(upsertData, { onConflict: 'facility_id,module' });

    if (error) {
      console.error('Error saving learning AI settings:', error);
      return false;
    }

    if (!error && upsertData) {
      await logSettingsAudit({
        facilityId,
        userId: 'system',
        module: 'learning',
        action: 'UPDATE',
        details: upsertData,
      });
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
