import React from 'react';
import { create } from 'zustand';
import { useFacility } from '../contexts/FacilityContext';

interface ContentBuilderSettings {
  enableContentCreation: boolean;
  autoSave: boolean;
  draftRetention: number;
  templateLibrary: boolean;
  collaborativeEditing: boolean;
}

interface ContentBuilderSettingsState {
  settings: ContentBuilderSettings;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadSettings: (facilityId: string) => void;
  updateSetting: <K extends keyof ContentBuilderSettings>(
    key: K, 
    value: ContentBuilderSettings[K]
  ) => void;
  resetSettings: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const defaultSettings: ContentBuilderSettings = {
  enableContentCreation: true,
  autoSave: true,
  draftRetention: 30,
  templateLibrary: true,
  collaborativeEditing: false,
};

const getStorageKey = (facilityId: string) => `contentBuilderSettings_${facilityId}`;

const useContentBuilderSettingsStore = create<ContentBuilderSettingsState>((set, get) => ({
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
      console.error('Failed to load content builder settings:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load settings',
        settings: defaultSettings,
        loading: false 
      });
    }
  },

  updateSetting: <K extends keyof ContentBuilderSettings>(
    key: K, 
    value: ContentBuilderSettings[K]
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

// Hook that provides facility-aware settings
export const useContentBuilderSettings = () => {
  const { getCurrentFacilityId, isLoading: facilityLoading } = useFacility();
  const facilityId = getCurrentFacilityId();
  
  const store = useContentBuilderSettingsStore();
  
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
        console.warn('No facility ID available, using default settings');
      }
      store.loadSettings('default');
    }
  }, [facilityId, facilityLoading, store]);

  // Enhanced updateSetting that includes facility ID
  const updateSetting = React.useCallback(<K extends keyof ContentBuilderSettings>(
    key: K, 
    value: ContentBuilderSettings[K]
  ) => {
    // Use default facility ID if none available
    const effectiveFacilityId = facilityId || 'default';
    
    if (!effectiveFacilityId) {
      store.setError('No facility ID available');
      return;
    }

    const newSettings = { ...store.settings, [key]: value };
    
    try {
      const isBrowser = typeof window !== 'undefined';
      if (!isBrowser) {
        // Update in-memory state only
        store.updateSetting(key, value);
        return;
      }

      const storageKey = getStorageKey(effectiveFacilityId);
      localStorage.setItem(storageKey, JSON.stringify(newSettings));
      
      // Update in-memory state after successful save
      store.updateSetting(key, value);
    } catch (error) {
      console.error('Failed to save content builder settings:', error);
      store.setError(error instanceof Error ? error.message : 'Failed to save settings');
    }
  }, [facilityId, store]);

  return {
    ...store,
    updateSetting,
    facilityId: facilityId || 'default',
    facilityLoading,
  };
};

export type { ContentBuilderSettings };
