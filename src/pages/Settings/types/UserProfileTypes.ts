export interface UserProfileData {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'user' | 'viewer';
  facility_id: string | null;
  department: string | null;
  position: string | null;
  phone: string | null;
  avatar_url: string | null;
  preferences: Record<string, string | number | boolean>;
  last_login: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BasicInformationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
}

export interface SecurityFormData {
  two_factor_enabled: boolean;
  auto_logout_minutes: number;
}

export interface PreferencesFormData {
  default_module: string;
  compliance_alert_frequency: string;
  report_preferences: string;
  compact_layout: boolean;
  show_quick_actions: boolean;
}

export interface LearningProfileFormData {
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced';
  time_availability: number;
  preferred_categories: string[];
  learning_goals: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

// Legacy interfaces for backward compatibility
export interface FormData {
  name: string;
  email: string;
}

export interface BasicInformationProps {
  userData: UserProfileData;
  formData: BasicInformationFormData;
  isEditing: boolean;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  onFormDataChange: (data: BasicInformationFormData) => void;
}

export interface SecurityProps {
  userData: UserProfileData;
  formData: SecurityFormData;
  onPasswordChange: () => void;
  onTwoFactorToggle: () => void;
  onFormDataChange: (data: SecurityFormData) => void;
}

export interface PreferencesProps {
  userData: UserProfileData;
  formData: PreferencesFormData;
  onFormDataChange: (data: PreferencesFormData) => void;
}

export interface LearningProfileProps {
  userData: UserProfileData;
  formData: LearningProfileFormData;
  onFormDataChange: (data: LearningProfileFormData) => void;
}

export interface AccountManagementProps {
  userData: UserProfileData;
  onDeleteAccount: () => void;
}

export interface NotificationPreferencesProps {
  userData: UserProfileData;
  onNotificationChange: (key: string, value: boolean) => void;
}

export interface ClinicInformationProps {
  userData: UserProfileData;
}

export interface SessionActivityProps {
  userData: UserProfileData;
  onForceLogout: () => void;
}

export interface PasswordChangeModalProps {
  isOpen: boolean;
  passwordData: PasswordData;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onClose: () => void;
  onPasswordChange: () => void;
  onPasswordDataChange: (data: PasswordData) => void;
  onShowPasswordToggle: () => void;
  onShowConfirmPasswordToggle: () => void;
}

export interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAccount: () => void;
}
