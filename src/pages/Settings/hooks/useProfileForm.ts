import { useState, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface BasicInfoForm {
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

interface ProfileFormState {
  basicInfoForm: BasicInfoForm;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
}

export const useProfileForm = () => {
  const [state, setState] = useState<ProfileFormState>({
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
    loading: false,
    saving: false,
    saveSuccess: false,
    saveError: null,
  });

  const updateBasicInfoForm = useCallback((updates: Partial<BasicInfoForm>) => {
    setState((prev) => ({
      ...prev,
      basicInfoForm: { ...prev.basicInfoForm, ...updates },
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState((prev) => ({ ...prev, loading }));
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setState((prev) => ({ ...prev, saving }));
  }, []);

  const setSaveSuccess = useCallback((success: boolean) => {
    setState((prev) => ({ ...prev, saveSuccess: success }));
  }, []);

  const setSaveError = useCallback((error: string | null) => {
    setState((prev) => ({ ...prev, saveError: error }));
  }, []);

  const resetFormState = useCallback(() => {
    setState((prev) => ({
      ...prev,
      saveSuccess: false,
      saveError: null,
    }));
  }, []);

  const saveProfile = useCallback(
    async (userId: string) => {
      try {
        setSaving(true);
        setSaveError(null);

        const { error } = await supabase
          .from('users')
          .update({
            first_name: state.basicInfoForm.first_name,
            last_name: state.basicInfoForm.last_name,
            phone: state.basicInfoForm.phone,
            department: state.basicInfoForm.department,
            position: state.basicInfoForm.position,
            date_of_birth: state.basicInfoForm.date_of_birth,
            bio: state.basicInfoForm.bio,
            preferred_language: state.basicInfoForm.preferred_language,
            timezone: state.basicInfoForm.timezone,
          })
          .eq('id', userId);

        if (error) {
          throw error;
        }

        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to save profile';
        setSaveError(errorMessage);
        return false;
      } finally {
        setSaving(false);
      }
    },
    [state.basicInfoForm, setSaving, setSaveError, setSaveSuccess]
  );

  return {
    ...state,
    updateBasicInfoForm,
    setLoading,
    setSaving,
    setSaveSuccess,
    setSaveError,
    resetFormState,
    saveProfile,
  };
};
