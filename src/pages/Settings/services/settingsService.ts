import { supabase } from '../../../lib/supabase';

// Types
export interface BasicInfoForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
  bio: string;
  preferred_language: string;
  timezone: string;
}

export interface NotificationPreferences {
  push: boolean;
  sound: string;
  volume: number;
  vibration: string;
  vibrationEnabled: boolean;
}

export interface PreferencesForm {
  theme: string;
  notifications: NotificationPreferences;
}

export interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
  bio: string;
  preferred_language: string;
  timezone: string;
  avatar_url?: string;
  active_sessions: number;
}

export interface PhotoUploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

export interface SaveProfileResult {
  success: boolean;
  error?: string;
}

export interface UpdatePreferencesResult {
  success: boolean;
  error?: string;
}

// Service class
export class SettingsService {
  private static instance: SettingsService;

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  // User Profile Management
  async fetchUserProfile(): Promise<UserData | null> {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      let { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists, create a default one
      if (!profileData) {
        profileData = await this.createDefaultProfile(user);
      }

      if (profileData) {
        // Fetch active sessions count
        const activeSessionsCount = await this.fetchActiveSessionsCount();

        return {
          ...(profileData as Record<string, unknown>),
          active_sessions: activeSessionsCount,
        } as UserData;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  private async createDefaultProfile(user: {
    id: string;
    email?: string;
  }): Promise<UserData> {
    const defaultProfile: UserData = {
      id: user.id,
      email: user.email || '',
      first_name: '',
      last_name: '',
      role: 'user',
      phone: '',
      department: '',
      position: '',
      date_of_birth: '',
      bio: '',
      preferred_language: 'en',
      timezone: 'UTC',
      avatar_url: undefined,
      active_sessions: 0,
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert(defaultProfile)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating default profile:', insertError);
      return defaultProfile;
    }

    return newProfile as UserData;
  }

  private async fetchActiveSessionsCount(): Promise<number> {
    try {
      const { data: sessionsData } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('is_active', true);

      return sessionsData?.length || 0;
    } catch (error) {
      console.warn('Failed to fetch active sessions count:', error);
      return 0;
    }
  }

  async saveProfile(
    userId: string,
    profileData: BasicInfoForm
  ): Promise<SaveProfileResult> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          department: profileData.department,
          position: profileData.position,
          date_of_birth: profileData.date_of_birth,
          bio: profileData.bio,
          preferred_language: profileData.preferred_language,
          timezone: profileData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save profile';
      return { success: false, error: errorMessage };
    }
  }

  // Photo Upload Management
  async uploadProfilePhoto(
    file: File,
    userId: string
  ): Promise<PhotoUploadResult> {
    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `profile-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: publicUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (updateError) {
        throw updateError;
      }

      return { success: true, url: publicUrl };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload photo';
      return { success: false, error: errorMessage };
    }
  }

  async removeProfilePhoto(userId: string): Promise<PhotoUploadResult> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to remove photo';
      return { success: false, error: errorMessage };
    }
  }

  // Preferences Management
  async savePreferences(
    userId: string,
    preferences: PreferencesForm
  ): Promise<UpdatePreferencesResult> {
    try {
      // This would typically save to a user_preferences table
      // For now, we'll save theme to the users table and handle notifications separately
      const { error } = await supabase
        .from('users')
        .update({
          theme: preferences.theme,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Save notification preferences to a separate table or localStorage
      await this.saveNotificationPreferences(userId, preferences.notifications);

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to save preferences';
      return { success: false, error: errorMessage };
    }
  }

  private async saveNotificationPreferences(
    userId: string,
    notifications: NotificationPreferences
  ): Promise<void> {
    try {
      // This would save to a user_notification_preferences table
      // For now, we'll use localStorage as a fallback
      localStorage.setItem(
        `user_${userId}_notifications`,
        JSON.stringify(notifications)
      );
    } catch (error) {
      console.warn('Failed to save notification preferences:', error);
    }
  }

  async loadNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      // This would load from a user_notification_preferences table
      // For now, we'll use localStorage as a fallback
      const stored = localStorage.getItem(`user_${userId}_notifications`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load notification preferences:', error);
    }

    // Return defaults
    return {
      push: true,
      sound: 'gentle-chime',
      volume: 50,
      vibration: 'short-pulse',
      vibrationEnabled: true,
    };
  }

  // Account Management
  async archiveAccount(
    userId: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          is_active: false,
          archived_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        throw error;
      }

      // Sign out the user after archiving
      await supabase.auth.signOut();

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to archive account';
      return { success: false, error: errorMessage };
    }
  }

  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // This would typically involve verifying the current password first
      // For now, we'll simulate the password change
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to change password';
      return { success: false, error: errorMessage };
    }
  }

  // Utility Methods
  async refreshUserData(): Promise<UserData | null> {
    return this.fetchUserProfile();
  }

  async validateProfileData(
    profileData: BasicInfoForm
  ): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (!profileData.first_name?.trim()) {
      errors.push('First name is required');
    }

    if (!profileData.last_name?.trim()) {
      errors.push('Last name is required');
    }

    if (!profileData.email?.trim()) {
      errors.push('Email is required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (
      profileData.phone &&
      !/^[+]?[1-9][\d]{0,15}$/.test(profileData.phone.replace(/[\s\-()]/g, ''))
    ) {
      errors.push('Please enter a valid phone number');
    }

    if (profileData.date_of_birth) {
      const date = new Date(profileData.date_of_birth);
      const now = new Date();

      if (date > now) {
        errors.push('Date of birth cannot be in the future');
      }

      const age = now.getFullYear() - date.getFullYear();
      if (age > 120) {
        errors.push('Please enter a valid date of birth');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// Export singleton instance
export const settingsService = SettingsService.getInstance();
