import React, { useCallback } from 'react';
import { create } from 'zustand';
import { useFacility } from '../contexts/FacilityContext';
import { MediaSettings } from '../pages/Settings/components/ContentManagementSettings/types';

interface MediaSettingsState {
  settings: MediaSettings;
  loading: boolean;
  error: string | null;
  loadSettings: (facilityId: string) => void;
  updateSetting: <K extends keyof MediaSettings>(key: K, value: MediaSettings[K]) => void;
  resetSettings: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: MediaSettings = {
  maxFileSize: 50, // MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'mp4', 'webm', 'mov', 'avi', 'mp3', 'wav', 'aac', 'ogg', 'pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'],
  autoCompression: true,
  watermarkSettings: {
    enabled: false,
    position: 'bottom-right',
    opacity: 0.5,
  },
  cdnEnabled: false,
  backupEnabled: true,
};

const getStorageKey = (facilityId: string) => `mediaSettings_${facilityId}`;

const useMediaSettingsStore = create<MediaSettingsState>((set, get) => ({
  settings: defaultSettings,
  loading: false,
  error: null,

  loadSettings: (facilityId: string) => {
    set({ loading: true, error: null });
    
    try {
      const isBrowser = typeof window !== 'undefined';
      if (!isBrowser) {
        set({ settings: defaultSettings, loading: false });
        return;
      }

      const storageKey = getStorageKey(facilityId);
      const stored = localStorage.getItem(storageKey);
      
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        // Merge with defaults to handle new settings that might be added
        const settings = { ...defaultSettings, ...parsedSettings };
        set({ settings, loading: false });
      } else {
        // First time - save defaults to localStorage
        localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
        set({ settings: defaultSettings, loading: false });
      }
    } catch (error) {
      console.error('Failed to load media settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        settings: defaultSettings,
        loading: false 
      });
    }
  },

  updateSetting: <K extends keyof MediaSettings>(
    key: K, 
    value: MediaSettings[K]
  ) => {
    const { settings } = get();
    const newSettings = { ...settings, [key]: value };
    
    set({ settings: newSettings });
    
    // Note: localStorage saving is handled by the hook wrapper
    // This function only updates the in-memory state
  },

  resetSettings: () => {
    set({ settings: defaultSettings });
    
    // Note: localStorage saving is handled by the hook wrapper
    // This function only updates the in-memory state
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));

// Hook that provides facility-aware media settings
export const useMediaSettings = () => {
  const { getCurrentFacilityId, isLoading: facilityLoading } = useFacility();
  const facilityId = getCurrentFacilityId();
  
  const store = useMediaSettingsStore();
  
  // Load settings when facility changes
  React.useEffect(() => {
    // Don't load settings if facility is still loading
    if (facilityLoading) {
      return;
    }
    
    if (facilityId) {
      store.loadSettings(facilityId);
    } else {
      // If no facility ID after loading is complete, use a default key and load default settings
      // Only log warning if we're not in development mode or if it's unexpected
      const isDevMode = process.env.NODE_ENV === 'development' || 
                       (typeof window !== 'undefined' && window.location?.hostname === 'localhost');
      
      if (!isDevMode) {
        console.warn('No facility ID available, using default media settings');
      }
      store.loadSettings('default');
    }
  }, [facilityId, facilityLoading, store]);

  // Enhanced updateSetting that includes facility ID
  const updateSetting = useCallback(<K extends keyof MediaSettings>(
    key: K,
    value: MediaSettings[K]
  ) => {
    store.updateSetting(key, value);
    
    // Save to localStorage with facility ID
    if (!facilityLoading) {
      const effectiveFacilityId = facilityId || 'default';
      const storageKey = getStorageKey(effectiveFacilityId);
      const updatedSettings = { ...store.settings, [key]: value };
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedSettings));
      } catch (error) {
        console.error('Failed to save media settings:', error);
        store.setError('Failed to save settings');
      }
    }
  }, [store, facilityId, facilityLoading]);

  // Enhanced resetSettings that includes facility ID
  const resetSettings = useCallback(() => {
    store.resetSettings();
    
    // Save defaults to localStorage with facility ID
    if (!facilityLoading) {
      const effectiveFacilityId = facilityId || 'default';
      const storageKey = getStorageKey(effectiveFacilityId);
      
      try {
        localStorage.setItem(storageKey, JSON.stringify(defaultSettings));
      } catch (error) {
        console.error('Failed to save default media settings:', error);
        store.setError('Failed to save default settings');
      }
    }
  }, [store, facilityId, facilityLoading]);

  return {
    settings: store.settings,
    loading: store.loading,
    error: store.error,
    updateSetting,
    resetSettings,
    facilityId: facilityId || 'default',
    facilityLoading,
  };
};
