import { useState, useEffect, useCallback } from 'react';
import { useFacility } from '../contexts/FacilityContext';
import { AISettings } from '../pages/Settings/components/ContentManagementSettings/types';

export const useContentAISettings = () => {
  const { getCurrentFacilityId, isLoading: facilityLoading } = useFacility();
  const facilityId = getCurrentFacilityId();
  
  const [settings, setSettings] = useState<AISettings>({
    enableAISuggestions: true,
    contentOptimization: true,
    seoOptimization: false,
    readabilityScore: true,
    plagiarismCheck: false,
    autoTagging: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from localStorage
  const loadSettings = useCallback(() => {
    if (facilityLoading) return;
    
    try {
      const effectiveFacilityId = facilityId || 'default';
      const storageKey = `contentAISettings_${effectiveFacilityId}`;
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prevSettings => ({ ...prevSettings, ...parsedSettings }));
      }
    } catch (err) {
      console.error('Failed to load content AI settings:', err);
      setError('Failed to load AI settings');
    }
  }, [facilityId, facilityLoading]);

  // Save settings to localStorage
  const saveSettings = useCallback(async (newSettings: Partial<AISettings>) => {
    if (facilityLoading) return false;
    
    try {
      setLoading(true);
      setError(null);
      
      const effectiveFacilityId = facilityId || 'default';
      const storageKey = `contentAISettings_${effectiveFacilityId}`;
      const updatedSettings = { ...settings, ...newSettings };
      
      localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      
      return updatedSettings;
    } catch (err) {
      console.error('Failed to save content AI settings:', err);
      setError('Failed to save AI settings');
      return false;
    } finally {
      setLoading(false);
    }
  }, [settings, facilityId, facilityLoading]);

  // Update a single setting
  const updateSetting = useCallback(<K extends keyof AISettings>(
    key: K,
    value: AISettings[K]
  ) => {
    return saveSettings({ [key]: value });
  }, [saveSettings]);

  // Reset to defaults
  const resetSettings = useCallback(() => {
    const defaultSettings: AISettings = {
      enableAISuggestions: true,
      contentOptimization: true,
      seoOptimization: false,
      readabilityScore: true,
      plagiarismCheck: false,
      autoTagging: true,
    };
    
    saveSettings(defaultSettings);
  }, [saveSettings]);

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    error,
    updateSetting,
    saveSettings,
    resetSettings,
    facilityId: facilityId || 'default',
    facilityLoading,
  };
};
