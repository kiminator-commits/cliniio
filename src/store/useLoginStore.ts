import { create } from 'zustand';

interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
  rememberDevice: boolean;
  stage: 'credentials' | 'otp';
  otp?: string;
}

interface Errors {
  email?: string;
  password?: string;
  submit?: string;
  otp?: string;
  [key: string]: string | undefined;
}

interface LoginState {
  // Basic auth state
  token: string | null;
  authToken: string | null;
  tokenExpiry: string | null;
  remember: boolean;
  
  // Form state
  formData: FormData;
  errors: Errors;
  loading: boolean;
  
  // Security state
  csrfToken: string | null;
  isSecureMode: boolean;
  isOffline: boolean;
  failedAttempts: number;
  
  // Actions
  setToken: (token: string, remember: boolean) => void;
  setAuthToken: (token: string) => void;
  setSessionExpiry: (expiry: string) => void;
  setField: (field: keyof FormData, value: string | boolean) => void;
  setErrors: (errors: Partial<Errors>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  reset: () => void;
  clear: () => void;
  
  // Computed properties
  isTokenExpired: boolean;
}

export const useLoginStore = create<LoginState>((set, get) => {
  // ✅ SSR guard
  const isBrowser = typeof window !== 'undefined';
  const storedToken = isBrowser ? localStorage.getItem('token') : null;

  return {
    // Basic auth state
    token: storedToken,
    authToken: storedToken,
    tokenExpiry: null,
    remember: false,
    
    // Form state
    formData: {
      email: '',
      password: '',
      rememberMe: false,
      rememberDevice: false,
      stage: 'credentials',
      otp: '',
    },
    errors: {},
    loading: false,
    
    // Security state
    csrfToken: null,
    isSecureMode: false,
    isOffline: false,
    failedAttempts: 0,
    
    // Actions
    setToken: (token, remember) => {
      if (typeof window === 'undefined') return;
      if (remember) localStorage.setItem('token', token);
      else sessionStorage.setItem('token', token);
      set({ token, authToken: token, remember });
    },
    
    setAuthToken: (token) => {
      set({ authToken: token, token });
    },
    
    setSessionExpiry: (expiry) => {
      set({ tokenExpiry: expiry });
    },
    
    setField: (field, value) => {
      set((state) => ({
        formData: { ...state.formData, [field]: value }
      }));
    },
    
    setErrors: (errors) => {
      set((state) => ({
        errors: { ...state.errors, ...errors }
      }));
    },
    
    setLoading: (loading) => {
      set({ loading });
    },
    
    setError: (error) => {
      set((state) => ({
        errors: { ...state.errors, submit: error }
      }));
    },
    
    clearError: () => {
      set((state) => ({
        errors: { ...state.errors, submit: undefined }
      }));
    },
    
    incrementFailedAttempts: () => {
      set((state) => ({
        failedAttempts: state.failedAttempts + 1
      }));
    },
    
    resetFailedAttempts: () => {
      set({ failedAttempts: 0 });
    },
    
    reset: () => {
      set({
        formData: {
          email: '',
          password: '',
          rememberMe: false,
          rememberDevice: false,
          stage: 'credentials',
          otp: '',
        },
        errors: {},
        loading: false,
        failedAttempts: 0,
      });
    },
    
    clear: () => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      set({ 
        token: null, 
        authToken: null,
        tokenExpiry: null,
        formData: {
          email: '',
          password: '',
          rememberMe: false,
          rememberDevice: false,
          stage: 'credentials',
          otp: '',
        },
        errors: {},
        loading: false,
        failedAttempts: 0,
      });
    },
    
    // Computed properties
    get isTokenExpired() {
      const state = get();
      if (!state.tokenExpiry) return false;
      return new Date() > new Date(state.tokenExpiry);
    },
  };
});