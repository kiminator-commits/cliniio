import { useState, useCallback, useEffect } from 'react';
import { useUser } from '../../../contexts/UserContext';
import { settingsService, BasicInfoForm } from '../services/settingsService';
import {
  errorHandlingService,
  AppError,
} from '../services/errorHandlingService';
import { useValidatedForm } from './useValidatedForm';
import { BASIC_INFO_VALIDATION_RULES } from '../utils/formValidation';
// import { UserProfileData } from '../types/UserProfileTypes';

interface UseEnhancedProfileFormOptions {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
  autoSave?: boolean;
  autoSaveDelay?: number;
}

export function useEnhancedProfileForm(
  options: UseEnhancedProfileFormOptions = {}
) {
  const {
    onSuccess,
    onError,
    autoSave = false,
    autoSaveDelay = 2000,
  } = options;
  const { refreshUserData } = useUser();
  const [userData, setUserData] = useState<Record<string, unknown> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [lastSavedData, setLastSavedData] = useState<BasicInfoForm | null>(
    null
  );

  // Load user data from service
  const loadUserData = useCallback(async () => {
    try {
      setLoading(true);
      const profile = await settingsService.fetchUserProfile();

      if (profile) {
        const formData: BasicInfoForm = {
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          department: profile.department || '',
          position: profile.position || '',
          date_of_birth: profile.date_of_birth || '',
          bio: profile.bio || '',
          preferred_language: profile.preferred_language || 'en',
          timezone: profile.timezone || 'UTC',
        };

        setUserData(profile as unknown as Record<string, unknown>);
        setLastSavedData(formData);
        return formData;
      }

      return null;
    } catch (error) {
      const appError = errorHandlingService.handleError(error, {
        showNotification: true,
        logToConsole: true,
      });
      onError?.(appError);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // Initialize form data
  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  // Enhanced form hook with validation
  const form = useValidatedForm({
    initialData: {
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
    validationRules: BASIC_INFO_VALIDATION_RULES,
    onSubmit: async (data: BasicInfoForm) => {
      return saveProfile(data);
    },
    onValidationError: (errors) => {
      const validationError = errorHandlingService.createError(
        'VALIDATION_ERROR',
        'Please fix the validation errors',
        Object.values(errors).join(', ')
      );
      onError?.(validationError);
    },
  });

  // Save profile using service
  const saveProfile = useCallback(
    async (data: BasicInfoForm): Promise<boolean> => {
      if (!userData?.id) {
        const error = errorHandlingService.createError(
          'AUTH_REQUIRED',
          'User not authenticated'
        );
        onError?.(error);
        return false;
      }

      try {
        const result = await settingsService.saveProfile(
          String(userData.id),
          data
        );

        if (result.success) {
          setLastSavedData(data);
          await refreshUserData();
          onSuccess?.();
          return true;
        } else {
          const error = errorHandlingService.createError(
            'OPERATION_FAILED',
            result.error || 'Failed to save profile'
          );
          onError?.(error);
          return false;
        }
      } catch (error) {
        const appError = errorHandlingService.handleError(error, {
          showNotification: true,
          logToConsole: true,
        });
        onError?.(appError);
        return false;
      }
    },
    [userData?.id, refreshUserData, onSuccess, onError]
  );

  // Auto-save functionality
  useEffect(() => {
    if (!autoSave || !form.isModified || form.isSubmitting) return undefined;

    const timer = setTimeout(() => {
      if (form.isValid) {
        form.submitForm();
      }
    }, autoSaveDelay);

    return () => clearTimeout(timer);
  }, [form, autoSave, autoSaveDelay]);

  // Reset form to last saved data
  const resetToLastSaved = useCallback(() => {
    if (lastSavedData) {
      form.resetToData(lastSavedData);
    }
  }, [lastSavedData, form]);

  // Check if form has unsaved changes
  const hasUnsavedChanges = form.isModified;

  // Get save status
  const getSaveStatus = useCallback(() => {
    if (form.isSubmitting) return 'saving';
    if (form.isModified) return 'modified';
    if (lastSavedData) return 'saved';
    return 'initial';
  }, [form.isSubmitting, form.isModified, lastSavedData]);

  return {
    // Form state
    ...form,

    // User data
    userData,
    loading,

    // Save functionality
    saveProfile,
    resetToLastSaved,
    hasUnsavedChanges,
    getSaveStatus,

    // Data loading
    loadUserData,

    // Auto-save
    autoSave,
    autoSaveDelay,
  };
}
