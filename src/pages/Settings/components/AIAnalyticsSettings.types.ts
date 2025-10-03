// Type and interface definitions for AIAnalyticsSettings component

// Toggle Switch Component Props
export interface ToggleSwitchProps {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}

// Form Group Component Props
export interface FormGroupProps {
  title: string;
  children: React.ReactNode;
}

// Message state type
export interface MessageState {
  type: 'success' | 'error';
  text: string;
}

// Service status type
export interface ServiceStatus {
  sterilization: boolean;
  inventory: boolean;
  environmental: boolean;
  learning: boolean;
}
