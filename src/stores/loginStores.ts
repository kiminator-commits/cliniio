import { create } from 'zustand';

// Auth Store
interface AuthStore {
  token: string | null;
  setAuthToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  setAuthToken: (token: string) => set({ token }),
}));

// Form Store
interface FormStore {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
}

export const useFormStore = create<FormStore>((set) => ({
  email: '',
  password: '',
  setEmail: (email: string) => set({ email }),
  setPassword: (password: string) => set({ password }),
}));

// UI State Store
interface UIStore {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  loading: false,
  setLoading: (loading: boolean) => set({ loading }),
}));
