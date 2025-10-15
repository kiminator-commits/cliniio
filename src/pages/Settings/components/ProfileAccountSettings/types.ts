export interface BasicInfoForm {
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

export interface PreferencesForm {
  theme: string;
  notifications: {
    push: boolean;
    sound: string;
    volume: number;
    email: boolean;
    sms: boolean;
    desktop: boolean;
    mobile: boolean;
    weekly_digest: boolean;
    security_alerts: boolean;
    system_updates: boolean;
    maintenance_notices: boolean;
  };
  privacy: {
    profile_visibility: string;
    show_online_status: boolean;
    allow_direct_messages: boolean;
    data_sharing: boolean;
    analytics_tracking: boolean;
  };
  accessibility: {
    high_contrast: boolean;
    large_text: boolean;
    screen_reader: boolean;
    keyboard_navigation: boolean;
    reduced_motion: boolean;
  };
}

export interface MobileShortcuts {
  quick_scan: boolean;
  emergency_contact: boolean;
  voice_commands: boolean;
  gesture_navigation: boolean;
  haptic_feedback: boolean;
  auto_sync: boolean;
  offline_mode: boolean;
  biometric_login: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  date_of_birth?: string;
  bio?: string;
  preferred_language?: string;
  timezone?: string;
  profile_photo?: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileSettingsState {
  activeTab: string;
  userData: UserData | null;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  basicInfoForm: BasicInfoForm;
  preferences: PreferencesForm;
  mobileShortcuts: MobileShortcuts;
  showPasswordModal: boolean;
  isPasswordReset: boolean;
  passwordError: string | null;
  passwordSuccess: string | null;
}
