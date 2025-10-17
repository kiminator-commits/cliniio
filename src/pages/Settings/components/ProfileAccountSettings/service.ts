import { supabase } from '../../../../lib/supabase';
import {
  BasicInfoForm,
  PreferencesForm as _PreferencesForm,
  MobileShortcuts as _MobileShortcuts,
  PasswordChangeData,
} from './types';

export class ProfileSettingsService {
  static async fetchUserData(userId: string) {
    try {
      const { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!profileData) {
        return await this.createDefaultProfile(userId);
      }

      return profileData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  static async createDefaultProfile(userId: string) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('facility_id')
      .eq('id', userId)
      .single();

    const defaultProfile = {
      id: userId,
      email: '',
      first_name: '',
      last_name: '',
      role: 'user' as const,
      phone: '',
      department: '',
      position: '',
      date_of_birth: '',
      bio: '',
      preferred_language: 'en',
      timezone: 'UTC',
      facility_id:
        userProfile?.facility_id || '550e8400-e29b-41d4-a716-446655440000',
    };

    const { data: newProfile, error: insertError } = await supabase
      .from('users')
      .insert(defaultProfile)
      .select()
      .single();

    if (insertError) {
      console.error('Error creating default profile:', insertError);
      throw insertError;
    }

    return newProfile;
  }

  static async getActiveSessionsCount(userId: string) {
    const { data: sessionsData } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('is_active', true);

    return sessionsData?.length || 0;
  }

  static async saveProfile(userId: string, profileData: BasicInfoForm) {
    const { error } = await supabase
      .from('users')
      .update({
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
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
  }

  static async changePassword(passwordData: PasswordChangeData) {
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      throw error;
    }
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/settings?tab=account&openPasswordModal=true`,
    });

    if (error) {
      throw error;
    }
  }

  static async archiveAccount(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  }

  static async uploadProfilePhoto(userId: string, file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(filePath);

    const { error: updateError } = await supabase
      .from('users')
      .update({ profile_photo_url: publicUrl })
      .eq('id', userId);

    if (updateError) {
      throw updateError;
    }

    return publicUrl;
  }

  static async removeProfilePhoto(userId: string) {
    const { error } = await supabase
      .from('users')
      .update({ profile_photo_url: null })
      .eq('id', userId);

    if (error) {
      throw error;
    }
  }
}
