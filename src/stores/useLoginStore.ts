import { create } from 'zustand';
import { LoginFormData, FormErrors } from '@/pages/Login/types';

interface LoginStore {
  formData: LoginFormData;
  errors: FormErrors;
  loading: boolean;
  sessionExpiry: string | null;
  authToken: string | null;
  tokenExpiry: string | null;
  // Security enhancements
  csrfToken: string | null;
  lastLoginAttempt: number | null;
  failedAttempts: number;
  isSecureMode: boolean;
  setField: (
    field: keyof LoginFormData,
    value: LoginFormData[keyof LoginFormData]
  ) => void;
  setErrors: (errors: FormErrors) => void;
  setLoading: (loading: boolean) => void;
  setStage: (stage: 'credentials' | 'otp') => void;
  setSessionExpiry: (expiry: string) => void;
  setAuthToken: (token: string, expiry: string, rememberMe?: boolean) => void;
  reset: () => Promise<void>;
  // Security methods
  setCSRFToken: (token: string) => void;
  incrementFailedAttempts: () => void;
  resetFailedAttempts: () => void;
  setSecureMode: (enabled: boolean) => void;
  isTokenExpired: () => boolean;
  getRemainingSessionTime: () => number;
}

export const useLoginStore = create<LoginStore>((set, get) => {
  // Get stored tokens - check both localStorage and sessionStorage
  const storedAuthToken =
    localStorage.getItem('authToken') ??
    sessionStorage.getItem('authToken') ??
    null;
  const storedTokenExpiry =
    localStorage.getItem('tokenExpiry') ??
    sessionStorage.getItem('tokenExpiry') ??
    null;
  const storedCSRFToken =
    localStorage.getItem('csrfToken') ??
    sessionStorage.getItem('csrfToken') ??
    null;
  const storedFailedAttempts = parseInt(
    localStorage.getItem('failedAttempts') ??
      sessionStorage.getItem('failedAttempts') ??
      '0'
  );
  const storedLastAttempt = parseInt(
    localStorage.getItem('lastLoginAttempt') ??
      sessionStorage.getItem('lastLoginAttempt') ??
      '0'
  );

  // Secure storage with error handling - respects Remember Me setting
  const persistToStorage = (
    key: string,
    value: string,
    rememberMe: boolean = false
  ) => {
    setTimeout(() => {
      try {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(key, value);
      } catch (error) {
        console.warn(
          `Failed to save ${key} to ${rememberMe ? 'localStorage' : 'sessionStorage'}:`,
          error
        );
      }
    }, 0); // Defer to next tick
  };

  // Generate secure CSRF token
  const generateCSRFToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, Array.from(array)))
      .replace(/[^a-zA-Z0-9]/g, '')
      .substring(0, 32);
  };

  return {
    formData: {
      email: '',
      password: '',
      rememberMe: false,
      rememberDevice: false,
      otp: '',
      stage: 'credentials',
    },
    errors: {},
    loading: false,
    sessionExpiry: localStorage.getItem('sessionExpiry') ?? null,
    authToken: storedAuthToken,
    tokenExpiry: storedTokenExpiry,
    // Security state
    csrfToken: storedCSRFToken || generateCSRFToken(),
    lastLoginAttempt: storedLastAttempt || null,
    failedAttempts: storedFailedAttempts,
    isSecureMode: true, // Enable secure mode by default
    setField: (field, value) =>
      set((state) => ({ formData: { ...state.formData, [field]: value } })),
    setErrors: (errors) => set({ errors }),
    setLoading: (loading) => set({ loading }),
    setStage: (stage) =>
      set((state) => ({ formData: { ...state.formData, stage } })),
    setSessionExpiry: (expiry) => {
      persistToStorage('sessionExpiry', expiry);
      set({ sessionExpiry: expiry });
    },
    setAuthToken: (token, expiry, rememberMe = false) => {
      persistToStorage('authToken', token, rememberMe);
      persistToStorage('tokenExpiry', expiry, rememberMe);
      set({ authToken: token, tokenExpiry: expiry });
      // Reset failed attempts on successful login
      get().resetFailedAttempts();
    },
    reset: async () => {
      // Clear both localStorage and sessionStorage for complete logout
      localStorage.removeItem('authToken');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('sessionExpiry');
      localStorage.removeItem('csrfToken');
      localStorage.removeItem('failedAttempts');
      localStorage.removeItem('lastLoginAttempt');
      localStorage.removeItem('currentUser'); // Clear UserContext data
      localStorage.removeItem('userProfile');
      localStorage.removeItem('userData');
      localStorage.removeItem('user_preferences');
      localStorage.removeItem('sb-user');
      localStorage.removeItem('user_data');

      sessionStorage.removeItem('authToken');
      sessionStorage.removeItem('tokenExpiry');
      sessionStorage.removeItem('sessionExpiry');
      sessionStorage.removeItem('csrfToken');
      sessionStorage.removeItem('failedAttempts');
      sessionStorage.removeItem('lastLoginAttempt');
      sessionStorage.removeItem('currentUser');
      sessionStorage.removeItem('userProfile');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('user_preferences');
      sessionStorage.removeItem('user_id');
      sessionStorage.removeItem('user_email');
      sessionStorage.removeItem('user_role');

      // Clear Supabase session
      try {
        const { supabase } = await import('@/lib/supabaseClient');
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Failed to clear Supabase session:', error);
      }
      set({
        formData: {
          email: '',
          password: '',
          rememberMe: false,
          rememberDevice: false,
          otp: '',
          stage: 'credentials',
        },
        errors: {},
        loading: false,
        sessionExpiry: null,
        authToken: null,
        tokenExpiry: null,
        csrfToken: generateCSRFToken(), // Generate new CSRF token
        lastLoginAttempt: null,
        failedAttempts: 0,
        isSecureMode: true,
      });
    },
    // Security methods
    setCSRFToken: (token) => {
      persistToStorage('csrfToken', token);
      set({ csrfToken: token });
    },
    incrementFailedAttempts: () => {
      const newAttempts = get().failedAttempts + 1;
      const now = Date.now();
      persistToStorage('failedAttempts', newAttempts.toString());
      persistToStorage('lastLoginAttempt', now.toString());
      set({
        failedAttempts: newAttempts,
        lastLoginAttempt: now,
      });
    },
    resetFailedAttempts: () => {
      localStorage.removeItem('failedAttempts');
      localStorage.removeItem('lastLoginAttempt');
      set({
        failedAttempts: 0,
        lastLoginAttempt: null,
      });
    },
    setSecureMode: (enabled) => {
      set({ isSecureMode: enabled });
    },
    isTokenExpired: () => {
      const { tokenExpiry } = get();
      if (!tokenExpiry) return true;
      return new Date(tokenExpiry) <= new Date();
    },
    getRemainingSessionTime: () => {
      const { tokenExpiry } = get();
      if (!tokenExpiry) return 0;
      const expiry = new Date(tokenExpiry);
      const now = new Date();
      return Math.max(0, expiry.getTime() - now.getTime());
    },
  };
});
