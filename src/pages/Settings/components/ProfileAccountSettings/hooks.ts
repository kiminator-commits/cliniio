import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../../../../lib/supabase';
import { useUser } from '../../../../contexts/UserContext';
import { ProfileSettingsService } from './service';
import {
  BasicInfoForm as _BasicInfoForm,
  PreferencesForm as _PreferencesForm,
  MobileShortcuts as _MobileShortcuts,
  PasswordChangeData,
  ProfileSettingsState,
} from './types';

export const useProfileSettings = () => {
  const { refreshUserData } = useUser();
  const location = useLocation();

  const [state, setState] = useState<ProfileSettingsState>({
    activeTab: 'basic-info',
    userData: null,
    loading: true,
    saving: false,
    saveSuccess: false,
    saveError: null,
    basicInfoForm: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      date_of_birth: '',
      bio: '',
      preferred_language: 'en',
      timezone: 'UTC',
    },
    preferences: {
      theme: 'light',
      notifications: {
        push: true,
        sound: 'default',
        volume: 50,
        email: true,
        sms: false,
        desktop: true,
        mobile: true,
        weekly_digest: true,
        security_alerts: true,
        system_updates: true,
        maintenance_notices: true,
      },
      privacy: {
        profile_visibility: 'public',
        show_online_status: true,
        allow_direct_messages: true,
        data_sharing: false,
        analytics_tracking: true,
      },
      accessibility: {
        high_contrast: false,
        large_text: false,
        screen_reader: false,
        keyboard_navigation: true,
        reduced_motion: false,
      },
    },
    mobileShortcuts: {
      quick_scan: true,
      emergency_contact: true,
      voice_commands: false,
      gesture_navigation: true,
      haptic_feedback: true,
      auto_sync: true,
      offline_mode: false,
      biometric_login: false,
    },
    showPasswordModal: false,
    isPasswordReset: false,
    passwordError: null,
    passwordSuccess: null,
  } as ProfileSettingsState);

  // Handle URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    const openPasswordModal = searchParams.get('openPasswordModal');

    if (tab) {
      setState((prev) => ({ ...prev, activeTab: tab }));
    }

    if (openPasswordModal === 'true') {
      setState((prev) => ({ ...prev, showPasswordModal: true }));
      window.history.replaceState({}, '', '/settings');
    }
  }, [location.search]);

  const fetchUserData = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, loading: true }));

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const profileData = await ProfileSettingsService.fetchUserData(user.id);
      const activeSessionsCount =
        await ProfileSettingsService.getActiveSessionsCount(user.id);

      // Parse name data
      let parsedFirstName = profileData.first_name || '';
      let parsedLastName = profileData.last_name || '';

      if (!parsedFirstName && !parsedLastName && profileData.full_name) {
        const nameParts = profileData.full_name.split(' ');
        parsedFirstName = nameParts[0] || '';
        parsedLastName = nameParts.slice(1).join(' ') || '';
      }

      // Parse email
      const email = profileData.email || user.email || '';
      let parsedEmail = email;
      if (!email && user.email) {
        const emailPrefix = user.email.split('@')[0];
        if (emailPrefix.includes('.')) {
          const parts = emailPrefix.split('.');
          parsedFirstName = parts[0] || parsedFirstName;
          parsedLastName = parts.slice(1).join(' ') || parsedLastName;
        }
        parsedEmail = user.email;
      }

      const updatedProfileData = {
        ...profileData,
        first_name: parsedFirstName,
        last_name: parsedLastName,
        email: parsedEmail,
        active_sessions: activeSessionsCount,
      };

      setState((prev) => ({
        ...prev,
        userData: updatedProfileData,
        basicInfoForm: {
          first_name: parsedFirstName,
          last_name: parsedLastName,
          email: parsedEmail,
          phone: profileData.phone || '',
          department: profileData.department || '',
          position: profileData.position || '',
          date_of_birth: profileData.date_of_birth || '',
          bio: profileData.bio || '',
          preferred_language: profileData.preferred_language || 'en',
          timezone: profileData.timezone || 'UTC',
        },
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
      setState((prev) => ({ ...prev, loading: false }));
    }
  }, [setState]);

  const handleSave = async () => {
    try {
      setState((prev) => ({ ...prev, saving: true, saveError: null }));

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await ProfileSettingsService.saveProfile(user.id, state.basicInfoForm);

      setState((prev) => ({
        ...prev,
        saving: false,
        saveSuccess: true,
        saveError: null,
      }));

      setTimeout(() => {
        setState((prev) => ({ ...prev, saveSuccess: false }));
      }, 3000);

      refreshUserData();
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        saving: false,
        saveError: error instanceof Error ? error.message : 'Failed to save profile',
      }));
    }
  };

  const handlePasswordChange = async (passwordData: PasswordChangeData) => {
    try {
      setState((prev) => ({
        ...prev,
        passwordError: null,
        passwordSuccess: null,
      }));

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setState((prev) => ({
          ...prev,
          passwordError: 'Passwords do not match',
        }));
        return;
      }

      if (state.isPasswordReset) {
        await ProfileSettingsService.resetPassword(passwordData.newPassword);
        setState((prev) => ({
          ...prev,
          passwordSuccess: 'Password reset email sent! Check your inbox.',
          showPasswordModal: false,
        }));
      } else {
        await ProfileSettingsService.changePassword(passwordData);
        setState((prev) => ({
          ...prev,
          passwordSuccess: 'Password changed successfully!',
          showPasswordModal: false,
        }));
      }
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        passwordError: error instanceof Error ? error.message : 'Failed to change password',
      }));
    }
  };

  const handleArchiveAccount = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await ProfileSettingsService.archiveAccount(user.id);
      await supabase.auth.signOut();
      window.location.href = '/login';
    } catch (error: unknown) {
      console.error('Error archiving account:', error);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const publicUrl = await ProfileSettingsService.uploadProfilePhoto(
        user.id,
        file
      );

      setState((prev) => ({
        ...prev,
        userData: prev.userData
          ? { ...prev.userData, avatar_url: publicUrl }
          : null,
      }));

      refreshUserData();
    } catch (error) {
      console.error('Error uploading profile photo:', error);
    }
  };

  const removeProfilePhoto = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      await ProfileSettingsService.removeProfilePhoto(user.id);

      setState((prev) => ({
        ...prev,
        userData: prev.userData
          ? { ...prev.userData, avatar_url: null }
          : null,
      }));

      refreshUserData();
    } catch (error) {
      console.error('Error removing profile photo:', error);
    }
  };

  return {
    state,
    setState,
    fetchUserData,
    handleSave,
    handlePasswordChange,
    handleArchiveAccount,
    uploadProfilePhoto,
    removeProfilePhoto,
  };
};
