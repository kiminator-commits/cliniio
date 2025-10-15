export interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  mode: 'add' | 'edit';
  onSave: (userData: Partial<User>) => void;
}

export interface FormSectionProps {
  user?: User | null;
  mode: 'add' | 'edit';
}
