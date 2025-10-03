import {
  EnvironmentalCleaningAISettings,
  CleaningProtocolSettings,
  NotificationSettings,
} from './types';

// API endpoints
const API_ENDPOINTS = {
  settings: '/api/environmental-cleaning/settings',
  aiSettings: '/api/environmental-cleaning/ai-settings',
  testSync: '/api/environmental-cleaning/test-sync',
  resetDefaults: '/api/environmental-cleaning/reset-defaults',
};

// API configuration
const API_CONFIG = {
  timeout: 30000,
  retries: 3,
  headers: {
    'Content-Type': 'application/json',
  },
};

export interface SaveSettingsPayload {
  protocols: CleaningProtocolSettings;
  notifications: NotificationSettings;
}

export interface SaveAISettingsPayload {
  aiSettings: EnvironmentalCleaningAISettings;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Generic API helper with retry logic
const apiCall = async <T>(
  url: string,
  options: RequestInit,
  retries: number = API_CONFIG.retries
): Promise<T> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...API_CONFIG.headers,
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.name === 'AbortError') {
      // Retry on timeout
      return apiCall(url, options, retries - 1);
    }
    throw error;
  }
};

// Fetch current settings
export const fetchSettings = async (): Promise<{
  protocols: CleaningProtocolSettings;
  notifications: NotificationSettings;
}> => {
  try {
    const response = await apiCall<
      APIResponse<{
        protocols: CleaningProtocolSettings;
        notifications: NotificationSettings;
      }>
    >(API_ENDPOINTS.settings, {
      method: 'GET',
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to fetch settings');
    }

    return response.data;
  } catch (error) {
    console.error('Error fetching environmental cleaning settings:', error);
    throw new Error('Failed to fetch settings. Please try again.');
  }
};

// Save protocol and notification settings
export const saveSettings = async (
  payload: SaveSettingsPayload
): Promise<void> => {
  try {
    const response = await apiCall<APIResponse<void>>(API_ENDPOINTS.settings, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to save settings');
    }
  } catch (error) {
    console.error('Error saving environmental cleaning settings:', error);
    throw new Error('Failed to save settings. Please try again.');
  }
};

// Save AI settings
export const saveAISettings = async (
  payload: SaveAISettingsPayload
): Promise<void> => {
  try {
    const response = await apiCall<APIResponse<void>>(
      API_ENDPOINTS.aiSettings,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to save AI settings');
    }
  } catch (error) {
    console.error('Error saving AI settings:', error);
    throw new Error('Failed to save AI settings. Please try again.');
  }
};

// Test synchronization
export const testSync = async (): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await apiCall<APIResponse<{ message: string }>>(
      API_ENDPOINTS.testSync,
      {
        method: 'POST',
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Sync test failed');
    }

    return {
      success: true,
      message: response.data?.message || 'Sync test successful',
    };
  } catch (error) {
    console.error('Error testing sync:', error);
    return { success: false, message: 'Sync test failed. Please try again.' };
  }
};

// Reset to default values
export const resetDefaults = async (): Promise<void> => {
  try {
    const response = await apiCall<APIResponse<void>>(
      API_ENDPOINTS.resetDefaults,
      {
        method: 'POST',
      }
    );

    if (!response.success) {
      throw new Error(response.error || 'Failed to reset defaults');
    }
  } catch (error) {
    console.error('Error resetting defaults:', error);
    throw new Error('Failed to reset defaults. Please try again.');
  }
};

// Helper function to save all settings (used by the component)
export const saveAllSettings = async (
  aiSettings: EnvironmentalCleaningAISettings,
  protocolSettings: CleaningProtocolSettings,
  notificationSettings: NotificationSettings
): Promise<void> => {
  try {
    // Save AI settings if enabled
    if (aiSettings.aiEnabled) {
      await saveAISettings({ aiSettings });
    }

    // Save other settings
    await saveSettings({
      protocols: protocolSettings,
      notifications: notificationSettings,
    });
  } catch (error) {
    console.error('Error saving all settings:', error);
    throw error;
  }
};
