import { useState } from 'react';
import {
  EnvironmentalCleaningAISettings,
  CleaningProtocolSettings,
  NotificationSettings,
  DEFAULT_AI_SETTINGS,
  DEFAULT_PROTOCOL_SETTINGS,
  DEFAULT_NOTIFICATION_SETTINGS,
  MESSAGE_TIMEOUT,
} from './constants';
import { Message } from './types';
import { coerceAndValidateForm } from './validation';
import { saveAllSettings } from './api';

export const useEnvironmentalCleaningSettings = () => {
  const [aiSettings, setAiSettings] =
    useState<EnvironmentalCleaningAISettings>(DEFAULT_AI_SETTINGS);
  const [protocolSettings, setProtocolSettings] =
    useState<CleaningProtocolSettings>(DEFAULT_PROTOCOL_SETTINGS);
  const [notificationSettings, setNotificationSettings] =
    useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [message, setMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // AI Settings Helper Functions
  const handleAISettingChange = (
    field: keyof EnvironmentalCleaningAISettings,
    value: boolean | number | string
  ) => {
    setAiSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleProtocolSettingChange = (
    field: keyof CleaningProtocolSettings,
    value: boolean | number | string | string[]
  ) => {
    setProtocolSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationSettingChange = (
    field: keyof NotificationSettings,
    value: boolean
  ) => {
    setNotificationSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      setMessage(null);

      // Validate settings before saving
      const validation = coerceAndValidateForm(
        aiSettings,
        protocolSettings,
        notificationSettings
      );
      if (!validation.isValid) {
        setMessage({
          type: 'error',
          text: validation.errors[0] || 'Validation failed',
        });
        return;
      }

      // Save all settings using extracted API logic
      await saveAllSettings(aiSettings, protocolSettings, notificationSettings);

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
      setTimeout(() => setMessage(null), MESSAGE_TIMEOUT);
    } catch (err) {
      console.error(err);
      setMessage({
        type: 'error',
        text: 'Failed to save settings. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessage = () => setMessage(null);

  return {
    aiSettings,
    protocolSettings,
    notificationSettings,
    message,
    isLoading,
    handleAISettingChange,
    handleProtocolSettingChange,
    handleNotificationSettingChange,
    handleSaveSettings,
    clearMessage,
  };
};
