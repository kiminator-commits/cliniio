import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types for the settings state
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

interface SettingsState {
  // Form states
  basicInfoForm: BasicInfoForm;
  preferences: PreferencesForm;

  // UI states
  activeTab: string;
  loading: boolean;
  saving: boolean;

  // Notification states
  saveSuccess: boolean;
  saveError: string | null;
  uploadSuccess: boolean;
  uploadError: string | null;

  // Photo upload state
  uploading: boolean;
}

// Action types for the reducer
type SettingsAction =
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'UPDATE_BASIC_INFO'; payload: Partial<BasicInfoForm> }
  | { type: 'UPDATE_PREFERENCES'; payload: Partial<PreferencesForm> }
  | {
      type: 'UPDATE_NOTIFICATION_PREFERENCES';
      payload: Partial<NotificationPreferences>;
    }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_SAVE_SUCCESS'; payload: boolean }
  | { type: 'SET_SAVE_ERROR'; payload: string | null }
  | { type: 'SET_UPLOAD_SUCCESS'; payload: boolean }
  | { type: 'SET_UPLOAD_ERROR'; payload: string | null }
  | { type: 'SET_UPLOADING'; payload: boolean }
  | { type: 'RESET_NOTIFICATIONS' }
  | { type: 'RESET_FORM_STATE' }
  | {
      type: 'INITIALIZE_FORMS';
      payload: { basicInfo: BasicInfoForm; preferences: PreferencesForm };
    };

// Initial state
const initialState: SettingsState = {
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
  preferences: {
    theme: 'light',
    notifications: {
      push: true,
      sound: 'gentle-chime',
      volume: 50,
      vibration: 'short-pulse',
      vibrationEnabled: true,
    },
  },
  activeTab: 'basic-info',
  loading: false,
  saving: false,
  saveSuccess: false,
  saveError: null,
  uploadSuccess: false,
  uploadError: null,
  uploading: false,
};

// Reducer function
function settingsReducer(
  state: SettingsState,
  action: SettingsAction
): SettingsState {
  switch (action.type) {
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };

    case 'UPDATE_BASIC_INFO':
      return {
        ...state,
        basicInfoForm: { ...state.basicInfoForm, ...action.payload },
      };

    case 'UPDATE_PREFERENCES':
      return {
        ...state,
        preferences: { ...state.preferences, ...action.payload },
      };

    case 'UPDATE_NOTIFICATION_PREFERENCES':
      return {
        ...state,
        preferences: {
          ...state.preferences,
          notifications: {
            ...state.preferences.notifications,
            ...action.payload,
          },
        },
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_SAVING':
      return { ...state, saving: action.payload };

    case 'SET_SAVE_SUCCESS':
      return { ...state, saveSuccess: action.payload };

    case 'SET_SAVE_ERROR':
      return { ...state, saveError: action.payload };

    case 'SET_UPLOAD_SUCCESS':
      return { ...state, uploadSuccess: action.payload };

    case 'SET_UPLOAD_ERROR':
      return { ...state, uploadError: action.payload };

    case 'SET_UPLOADING':
      return { ...state, uploading: action.payload };

    case 'RESET_NOTIFICATIONS':
      return {
        ...state,
        saveSuccess: false,
        saveError: null,
        uploadSuccess: false,
        uploadError: null,
      };

    case 'RESET_FORM_STATE':
      return {
        ...state,
        saveSuccess: false,
        saveError: null,
        uploadSuccess: false,
        uploadError: null,
        uploading: false,
      };

    case 'INITIALIZE_FORMS':
      return {
        ...state,
        basicInfoForm: action.payload.basicInfo,
        preferences: action.payload.preferences,
      };

    default:
      return state;
  }
}

// Context interface
interface SettingsContextType {
  state: SettingsState;
  dispatch: React.Dispatch<SettingsAction>;

  // Convenience methods
  setActiveTab: (tab: string) => void;
  updateBasicInfo: (updates: Partial<BasicInfoForm>) => void;
  updatePreferences: (updates: Partial<PreferencesForm>) => void;
  updateNotificationPreferences: (
    updates: Partial<NotificationPreferences>
  ) => void;
  setLoading: (loading: boolean) => void;
  setSaving: (saving: boolean) => void;
  setSaveSuccess: (success: boolean) => void;
  setSaveError: (error: string | null) => void;
  setUploadSuccess: (success: boolean) => void;
  setUploadError: (error: string | null) => void;
  setUploading: (uploading: boolean) => void;
  resetNotifications: () => void;
  resetFormState: () => void;
  initializeForms: (
    basicInfo: BasicInfoForm,
    preferences: PreferencesForm
  ) => void;
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

// Provider component
interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(settingsReducer, initialState);

  // Convenience methods
  const setActiveTab = (tab: string) =>
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
  const updateBasicInfo = (updates: Partial<BasicInfoForm>) =>
    dispatch({ type: 'UPDATE_BASIC_INFO', payload: updates });
  const updatePreferences = (updates: Partial<PreferencesForm>) =>
    dispatch({ type: 'UPDATE_PREFERENCES', payload: updates });
  const updateNotificationPreferences = (
    updates: Partial<NotificationPreferences>
  ) => dispatch({ type: 'UPDATE_NOTIFICATION_PREFERENCES', payload: updates });
  const setLoading = (loading: boolean) =>
    dispatch({ type: 'SET_LOADING', payload: loading });
  const setSaving = (saving: boolean) =>
    dispatch({ type: 'SET_SAVING', payload: saving });
  const setSaveSuccess = (success: boolean) =>
    dispatch({ type: 'SET_SAVE_SUCCESS', payload: success });
  const setSaveError = (error: string | null) =>
    dispatch({ type: 'SET_SAVE_ERROR', payload: error });
  const setUploadSuccess = (success: boolean) =>
    dispatch({ type: 'SET_UPLOAD_SUCCESS', payload: success });
  const setUploadError = (error: string | null) =>
    dispatch({ type: 'SET_UPLOAD_ERROR', payload: error });
  const setUploading = (uploading: boolean) =>
    dispatch({ type: 'SET_UPLOADING', payload: uploading });
  const resetNotifications = () => dispatch({ type: 'RESET_NOTIFICATIONS' });
  const resetFormState = () => dispatch({ type: 'RESET_FORM_STATE' });
  const initializeForms = (
    basicInfo: BasicInfoForm,
    preferences: PreferencesForm
  ) =>
    dispatch({ type: 'INITIALIZE_FORMS', payload: { basicInfo, preferences } });

  const value: SettingsContextType = {
    state,
    dispatch,
    setActiveTab,
    updateBasicInfo,
    updatePreferences,
    updateNotificationPreferences,
    setLoading,
    setSaving,
    setSaveSuccess,
    setSaveError,
    setUploadSuccess,
    setUploadError,
    setUploading,
    resetNotifications,
    resetFormState,
    initializeForms,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use the settings context
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
