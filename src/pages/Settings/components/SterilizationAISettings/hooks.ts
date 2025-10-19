import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../../../contexts/UserContext';
import { SterilizationAISettings as _SterilizationAISettingsType } from '../../../../services/ai/sterilization/types';
import { Message as _Message } from '../../../../types/sterilizationAISettingsTypes';
// import { isValidApiKeyValue } from '../../utils/sterilizationAISettingsUtils';
import {
  fetchSettings,
  saveSettings as saveSettingsToStorage,
  STERILIZATION_AI_CONSTANTS,
  DEFAULT_SETTINGS,
} from '../sterilizationAI';
import { SterilizationAISettingsState } from './types';

export const useSterilizationAISettings = () => {
  const { currentUser: user } = useUser();
  const [state, setState] = useState<SterilizationAISettingsState>({
    settings: {
      facility_id: user?.id || '',
      ai_version: STERILIZATION_AI_CONSTANTS.DEFAULT_AI_VERSION,
      ...DEFAULT_SETTINGS,
    },
    isLoading: false,
    isSaving: false,
    message: null,
  });

  const loadSettings = useCallback(async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const mappedSettings = await fetchSettings(user.id);
      if (mappedSettings) {
        setState((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            ...mappedSettings,
          },
        }));
      }
    } catch (error) {
      console.error('Failed to load sterilization AI settings:', error);
      setState((prev) => ({
        ...prev,
        message: { type: 'error', text: 'Failed to load settings' },
      }));
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isSaving: true }));
    try {
      await saveSettingsToStorage(state.settings, user.id);

      setState((prev) => ({
        ...prev,
        message: {
          type: 'success',
          text: 'Sterilization AI settings saved successfully',
        },
      }));
      setTimeout(
        () => setState((prev) => ({ ...prev, message: null })),
        STERILIZATION_AI_CONSTANTS.SUCCESS_MESSAGE_TIMEOUT
      );
    } catch (error) {
      console.error('Failed to save sterilization AI settings:', error);
      setState((prev) => ({
        ...prev,
        message: { type: 'error', text: 'Failed to save settings' },
      }));
    } finally {
      setState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const handleInputChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setState((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  };

  const handleApiKeyChange = () => {
    // API key management has been moved to server-side for security
    // This function is kept for compatibility but does nothing
    console.warn('API key management has been moved to server-side for security reasons');
  };

  return {
    ...state,
    loadSettings,
    saveSettings,
    handleInputChange,
    handleApiKeyChange,
  };
};
