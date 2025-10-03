import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useUser } from '../../../contexts/UserContext';
import {
  UserProfileData,
  BasicInformationFormData,
  SecurityFormData,
  PreferencesFormData,
  LearningProfileFormData,
} from '../types/UserProfileTypes';

export const useProfileAccountSettings = () => {
  const { refreshUserData } = useUser();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data for each tab
  const [basicInfoForm, setBasicInfoForm] = useState<BasicInformationFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    date_of_birth: '',
  });

  const [securityForm, setSecurityForm] = useState<SecurityFormData>({
    two_factor_enabled: false,
    auto_logout_minutes: 30,
  });

  const [preferencesForm, setPreferencesForm] = useState<PreferencesFormData>({
    default_module: 'Sterilization',
    compliance_alert_frequency: 'Daily',
    report_preferences: 'Detailed',
    compact_layout: false,
    show_quick_actions: true,
  });

  const [learningForm, setLearningForm] = useState<LearningProfileFormData>({
    skill_level: 'Beginner',
    time_availability: 120,
    preferred_categories: ['Sterilization Procedures', 'Equipment Operation'],
    learning_goals: '',
  });

  // Load user data from Supabase
  const loadUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      setUserData({
        id: String(data.id || ''),
        email: String(data.email || ''),
        full_name: String(data.full_name || ''),
        phone: String(data.phone || ''),
        department: String(data.department || ''),
        position: String(data.position || ''),
        avatar_url: String(data.avatar_url || ''),
        preferences: (data.preferences as Record<string, unknown>) || {},
        created_at: String(data.created_at || ''),
        updated_at: String(data.updated_at || ''),
      } as UserProfileData);

      // Parse full_name into first and last name
      const fullName = data.full_name || '';
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Set form data from user data
      setBasicInfoForm({
        first_name: firstName,
        last_name: lastName,
        email: (data as { email?: string }).email || '',
        phone: (data as { phone?: string }).phone || '',
        department: (data as { department?: string }).department || '',
        position: (data as { position?: string }).position || '',
        date_of_birth:
          (data as { preferences?: { date_of_birth?: string } }).preferences
            ?.date_of_birth || '',
      });

      // Set preferences from user preferences
      const preferences =
        (data as { preferences?: Record<string, unknown> }).preferences || {};
      setSecurityForm({
        two_factor_enabled:
          (preferences as { two_factor_enabled?: boolean })
            .two_factor_enabled || false,
        auto_logout_minutes:
          (preferences as { auto_logout_minutes?: number })
            .auto_logout_minutes || 30,
      });

      setPreferencesForm({
        default_module:
          (preferences as { default_module?: string }).default_module ||
          'Sterilization',
        compliance_alert_frequency:
          (preferences as { compliance_alert_frequency?: string })
            .compliance_alert_frequency || 'Daily',
        report_preferences:
          (preferences as { report_preferences?: string }).report_preferences ||
          'Detailed',
        compact_layout:
          (preferences as { compact_layout?: boolean }).compact_layout || false,
        show_quick_actions:
          (preferences as { show_quick_actions?: boolean })
            .show_quick_actions !== false,
      });

      setLearningForm({
        skill_level: ((preferences as { skill_level?: string }).skill_level ||
          'Beginner') as 'Beginner' | 'Intermediate' | 'Advanced',
        time_availability:
          (preferences as { time_availability?: number }).time_availability ||
          120,
        preferred_categories: (
          preferences as { preferred_categories?: string[] }
        ).preferred_categories || [
          'Sterilization Procedures',
          'Equipment Operation',
        ],
        learning_goals:
          (preferences as { learning_goals?: string }).learning_goals || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  // Upload profile photo
  const uploadProfilePhoto = async (file: File) => {
    if (!userData) {
      return;
    }

    try {
      setUploadingPhoto(true);
      setError(null);

      // Validate file
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      if (file.size > 2 * 1024 * 1024) {
        // 2MB limit
        throw new Error('File size must be less than 2MB');
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Convert file to base64 data URL with size optimization
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;

          // If the data URL is too large, try to compress it
          if (result.length > 100000) {
            // 100KB limit
            const img = new Image();
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');

              // Resize to reasonable dimensions
              const maxSize = 200;
              let { width, height } = img;
              if (width > height) {
                if (width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                }
              } else {
                if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
              }

              canvas.width = width;
              canvas.height = height;
              ctx?.drawImage(img, 0, 0, width, height);

              const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
              resolve(compressedDataUrl);
            };
            img.onerror = () => resolve(result); // Fallback to original
            img.src = result;
          } else {
            resolve(result);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Update user profile with base64 avatar data

      // Test if we can update any field first
      const { error: testError } = await supabase
        .from('users')
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (testError) {
        console.error('Basic update test failed:', testError);
        throw testError;
      } else {
        console.log('Basic update test passed');
      }

      // Test with a simple string first to see if avatar_url field can be updated
      const { error: simpleTestError } = await supabase
        .from('users')
        .update({
          avatar_url: 'test-simple-avatar-url',
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (simpleTestError) {
        console.error('Simple avatar_url test failed:', simpleTestError);
        throw simpleTestError;
      } else {
        console.log('Simple avatar_url test passed');
      }

      // Now try the actual avatar update

      // Check if dataUrl is valid
      if (!dataUrl.startsWith('data:image/')) {
        console.error('Invalid data URL format:', dataUrl.substring(0, 100));
        throw new Error('Invalid image data format');
      }

      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: dataUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('Database update error:', updateError);
        console.error(
          'Error details:',
          updateError.message,
          updateError.details,
          updateError.hint
        );
        throw updateError;
      }

      // For now, trust the update response and proceed with local state update

      // Update local state immediately
      if (userData) {
        setUserData({
          ...userData,
          avatar_url: dataUrl,
          updated_at: new Date().toISOString(),
        });
      }

      // Add a small delay to ensure database transaction is committed
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Verify the update worked by querying the database
      const { data: verifyData, error: verifyError } = await supabase
        .from('users')
        .select('avatar_url')
        .eq('id', user.id)
        .single();

      if (verifyError) {
        console.error('Verification error:', verifyError);
      } else {
        console.log('Database verification result:', verifyData);
        if (verifyData.avatar_url) {
          console.log('Avatar URL verified:', verifyData.avatar_url);
        } else {
          console.log('No avatar URL found in verification');
        }
      }

      // Refresh user context to update avatar in navigation
      await refreshUserData();
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Remove profile photo
  const removeProfilePhoto = async () => {
    if (!userData || !userData.avatar_url) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Update user profile to remove avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state immediately
      setUserData({
        ...userData,
        avatar_url: null,
        updated_at: new Date().toISOString(),
      });

      // Refresh user context to update avatar in navigation
      await refreshUserData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Save basic information
  const saveBasicInformation = async () => {
    if (!userData) return;

    try {
      setSaving(true);
      setError(null);

      const fullName =
        `${basicInfoForm.first_name} ${basicInfoForm.last_name}`.trim();

      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          email: basicInfoForm.email,
          phone: basicInfoForm.phone,
          department: basicInfoForm.department,
          position: basicInfoForm.position,
          preferences: {
            ...userData.preferences,
            date_of_birth: basicInfoForm.date_of_birth,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        throw error;
      }

      // Update local state instead of reloading
      setUserData({
        ...userData,
        full_name: fullName,
        email: basicInfoForm.email,
        phone: basicInfoForm.phone,
        department: basicInfoForm.department,
        position: basicInfoForm.position,
        preferences: {
          ...userData.preferences,
          date_of_birth: basicInfoForm.date_of_birth,
        },
        updated_at: new Date().toISOString(),
      });

      // Refresh user context to update navigation
      await refreshUserData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save basic information'
      );
    } finally {
      setSaving(false);
    }
  };

  // Save security settings
  const saveSecuritySettings = async () => {
    if (!userData) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            ...userData.preferences,
            two_factor_enabled: securityForm.two_factor_enabled,
            auto_logout_minutes: securityForm.auto_logout_minutes,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        throw error;
      }

      // Update local state instead of reloading
      setUserData({
        ...userData,
        preferences: {
          ...userData.preferences,
          two_factor_enabled: securityForm.two_factor_enabled,
          auto_logout_minutes: securityForm.auto_logout_minutes,
        },
        updated_at: new Date().toISOString(),
      });

      // Refresh user context to update navigation
      await refreshUserData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save security settings'
      );
    } finally {
      setSaving(false);
    }
  };

  // Save preferences
  const savePreferences = async () => {
    if (!userData) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            ...userData.preferences,
            default_module: preferencesForm.default_module,
            compliance_alert_frequency:
              preferencesForm.compliance_alert_frequency,
            report_preferences: preferencesForm.report_preferences,
            compact_layout: preferencesForm.compact_layout,
            show_quick_actions: preferencesForm.show_quick_actions,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        throw error;
      }

      // Update local state instead of reloading
      setUserData({
        ...userData,
        preferences: {
          ...userData.preferences,
          default_module: preferencesForm.default_module,
          compliance_alert_frequency:
            preferencesForm.compliance_alert_frequency,
          report_preferences: preferencesForm.report_preferences,
          compact_layout: preferencesForm.compact_layout,
          show_quick_actions: preferencesForm.show_quick_actions,
        },
        updated_at: new Date().toISOString(),
      });

      // Refresh user context to update navigation
      await refreshUserData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save preferences'
      );
    } finally {
      setSaving(false);
    }
  };

  // Save learning profile
  const saveLearningProfile = async () => {
    if (!userData) return;

    try {
      setSaving(true);
      setError(null);

      const { error } = await supabase
        .from('users')
        .update({
          preferences: {
            ...userData.preferences,
            skill_level: learningForm.skill_level,
            time_availability: learningForm.time_availability,
            preferred_categories: JSON.stringify(
              learningForm.preferred_categories
            ),
            learning_goals: learningForm.learning_goals,
          },
          updated_at: new Date().toISOString(),
        })
        .eq('id', userData.id);

      if (error) {
        throw error;
      }

      // Update local state instead of reloading
      setUserData({
        ...userData,
        preferences: {
          ...userData.preferences,
          skill_level: learningForm.skill_level,
          time_availability: learningForm.time_availability,
          preferred_categories: JSON.stringify(
            learningForm.preferred_categories
          ),
          learning_goals: learningForm.learning_goals,
        },
        updated_at: new Date().toISOString(),
      });

      // Refresh user context to update navigation
      await refreshUserData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to save learning profile'
      );
    } finally {
      setSaving(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  return {
    // State
    userData,
    loading,
    saving,
    uploadingPhoto,
    error,
    basicInfoForm,
    securityForm,
    preferencesForm,
    learningForm,

    // Actions
    setBasicInfoForm,
    setSecurityForm,
    setPreferencesForm,
    setLearningForm,
    uploadProfilePhoto,
    removeProfilePhoto,
    saveBasicInformation,
    saveSecuritySettings,
    savePreferences,
    saveLearningProfile,
    loadUserData,
    setError,
    setUserData,
  };
};
