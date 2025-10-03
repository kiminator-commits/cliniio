import { useState, useCallback } from 'react';

interface NotificationPreferences {
  push: boolean;
  sound: string;
  volume: number;
  vibration: string;
  vibrationEnabled: boolean;
}

interface PreferencesForm {
  theme: string;
  notifications: NotificationPreferences;
}

export const usePreferencesForm = () => {
  const [preferences, setPreferences] = useState<PreferencesForm>({
    theme: 'light',
    notifications: {
      push: true,
      sound: 'gentle-chime',
      volume: 50,
      vibration: 'short-pulse',
      vibrationEnabled: true,
    },
  });

  const updatePreferences = useCallback((updates: Partial<PreferencesForm>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  }, []);

  const updateNotificationPreferences = useCallback(
    (updates: Partial<NotificationPreferences>) => {
      setPreferences((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, ...updates },
      }));
    },
    []
  );

  const resetPreferences = useCallback(() => {
    setPreferences({
      theme: 'light',
      notifications: {
        push: true,
        sound: 'gentle-chime',
        volume: 50,
        vibration: 'short-pulse',
        vibrationEnabled: true,
      },
    });
  }, []);

  return {
    preferences,
    updatePreferences,
    updateNotificationPreferences,
    resetPreferences,
  };
};
