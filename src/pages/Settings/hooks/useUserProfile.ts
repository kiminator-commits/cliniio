import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useUser } from '../../../contexts/UserContext';
import {
  UserProfileData,
  BasicInformationFormData,
  PasswordData,
  SecurityFormData,
} from '../types/UserProfileTypes';
import {
  getDefaultUserData,
  getDefaultFormData,
  getDefaultPasswordData,
} from '../utils/userProfileUtils';

export const useUserProfile = () => {
  const { currentUser, refreshUserData } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // User data from auth system
  const [userData, setUserData] =
    useState<UserProfileData>(getDefaultUserData());

  const [formData, setFormData] = useState<BasicInformationFormData>(
    getDefaultFormData(userData)
  );

  const [_passwordData, setPasswordData] = useState<PasswordData>(
    getDefaultPasswordData()
  );

  // Security settings state
  const [securityData, setSecurityData] = useState<SecurityFormData>({
    two_factor_enabled: false,
    auto_logout_minutes: 30,
  });

  // Load user data and security settings
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);

        // Load user profile data
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentUser.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        if (profileData) {
          setUserData(profileData as unknown as UserProfileData);
          setFormData(
            getDefaultFormData(profileData as unknown as UserProfileData)
          );
        }

        // Load security settings
        const { data: securitySettings, error: securityError } = await supabase
          .from('user_security_settings')
          .select('two_factor_enabled, auto_logout_minutes')
          .eq('user_id', currentUser.id)
          .single();

        if (securityError && securityError.code !== 'PGRST116') {
          // PGRST116 is "not found" - we'll create default settings
          throw securityError;
        }

        if (securitySettings) {
          setSecurityData({
            two_factor_enabled:
              Boolean(securitySettings.two_factor_enabled) || false,
            auto_logout_minutes:
              Number(securitySettings.auto_logout_minutes) || 30,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load user data'
        );
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser]);

  const handleSave = () => {
    setUserData((prev) => ({
      ...prev,
      full_name: `${formData.first_name} ${formData.last_name}`.trim(),
      email: formData.email,
      phone: formData.phone,
      department: formData.department,
      position: formData.position,
    }));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(getDefaultFormData(userData));
    setIsEditing(false);
  };

  const handlePasswordChange = async (_passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    // Implement password change logic
    try {
      // TODO: Implement actual password change logic // TRACK: Migrate to GitHub issue
      setShowPasswordModal(false);
      setPasswordData(getDefaultPasswordData());
    } catch (error) {
      console.error('Password change failed:', error);
    }
  };

  const handleDeleteAccount = () => {
    // Implement account deletion logic
    setShowDeleteModal(false);
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setUserData((prev) => ({ ...prev, [key]: value }));
  };

  const handleTwoFactorToggle = async () => {
    if (!currentUser) return;

    try {
      setSaving(true);
      setError(null);

      const newTwoFactorEnabled = !securityData.two_factor_enabled;

      // Check if user has existing security settings
      const { data: existingSettings } = await supabase
        .from('user_security_settings')
        .select('id')
        .eq('user_id', currentUser.id)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('user_security_settings')
          .update({
            two_factor_enabled: newTwoFactorEnabled,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', currentUser.id);

        if (error) {
          throw error;
        }
      } else {
        // Create new security settings record
        const { error } = await supabase.from('user_security_settings').insert({
          user_id: currentUser.id,
          two_factor_enabled: newTwoFactorEnabled,
          session_timeout: 480, // 8 hours default
          inactive_timeout: 30, // 30 minutes default
          remember_me_duration: 7, // 7 days default
          require_reauth_for_sensitive: true,
        });

        if (error) {
          throw error;
        }
      }

      // Update local state
      setSecurityData((prev) => ({
        ...prev,
        two_factor_enabled: newTwoFactorEnabled,
      }));

      // Refresh user context
      await refreshUserData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to update 2FA settings'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleForceLogout = () => {
    // Implement force logout logic
  };

  const handleFormDataChange = (data: BasicInformationFormData) => {
    setFormData(data);
  };

  const handlePasswordDataChange = (data: PasswordData) => {
    setPasswordData(data);
  };

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handleShowConfirmPasswordToggle = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return {
    // State
    isEditing,
    showPasswordModal,
    showDeleteModal,
    showPassword,
    showConfirmPassword,
    userData,
    formData,
    _passwordData,
    securityData,
    loading,
    saving,
    error,

    // Actions
    setIsEditing,
    setShowPasswordModal,
    setShowDeleteModal,
    setShowPassword,
    setShowConfirmPassword,
    handleSave,
    handleCancel,
    handlePasswordChange,
    handleDeleteAccount,
    handleNotificationChange,
    handleTwoFactorToggle,
    handleForceLogout,
    handleFormDataChange,
    handlePasswordDataChange,
    handleShowPasswordToggle,
    handleShowConfirmPasswordToggle,
  };
};
