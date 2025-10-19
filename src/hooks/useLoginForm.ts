import { useEffect, useCallback } from 'react';
import { useLoginStore } from '../store/useLoginStore';
import { useUser } from '../contexts/UserContext';
import { logger } from '../utils/_core/logger';
import { LOGIN_ERROR_MESSAGES } from '../constants/errorMessages';

// Lazy load heavy services only when needed
const loadSecureAuthService = () =>
  import('../services/secureAuthService').then((m) => m.SecureAuthService);
const loadAuditService = () =>
  import('../services/auditService').then((m) => m.logAudit);
const loadErrorReportingService = () =>
  import('../services/errorReportingService').then(
    (m) => m.ErrorReportingService
  );

export const useLoginForm = () => {
  const { initializeUserContext, clearUserData } = useUser();

  // Create user-friendly error messages
  const createUserFriendlyError = useCallback((error: unknown): string => {
    if (typeof error === 'string') {
      return error;
    }

    if (error instanceof Error) {
      const message = error.message.toLowerCase();

      // Authentication errors
      if (
        message.includes('invalid credentials') ||
        message.includes('unauthorized')
      ) {
        return LOGIN_ERROR_MESSAGES.INVALID_CREDENTIALS;
      }

      if (
        message.includes('user not found') ||
        message.includes('email not found')
      ) {
        return LOGIN_ERROR_MESSAGES.USER_NOT_FOUND;
      }

      if (message.includes('password') && message.includes('incorrect')) {
        return LOGIN_ERROR_MESSAGES.INCORRECT_PASSWORD;
      }

      // Network errors
      if (
        message.includes('network') ||
        message.includes('connection') ||
        message.includes('timeout')
      ) {
        return LOGIN_ERROR_MESSAGES.NETWORK_ERROR;
      }

      if (message.includes('fetch') || message.includes('http')) {
        return LOGIN_ERROR_MESSAGES.SERVER_ERROR;
      }

      // Validation errors
      if (message.includes('required')) {
        return LOGIN_ERROR_MESSAGES.EMAIL_REQUIRED;
      }

      if (
        message.includes('invalid email') ||
        message.includes('email format')
      ) {
        return LOGIN_ERROR_MESSAGES.INVALID_EMAIL_FORMAT;
      }

      if (message.includes('password') && message.includes('length')) {
        return LOGIN_ERROR_MESSAGES.PASSWORD_TOO_SHORT;
      }

      // Server errors
      if (message.includes('500') || message.includes('internal server')) {
        return LOGIN_ERROR_MESSAGES.INTERNAL_ERROR;
      }

      if (message.includes('503') || message.includes('service unavailable')) {
        return LOGIN_ERROR_MESSAGES.SERVICE_UNAVAILABLE;
      }

      // Default fallback
      return LOGIN_ERROR_MESSAGES.LOGIN_FAILED;
    }

    return LOGIN_ERROR_MESSAGES.GENERIC_ERROR;
  }, []);

  // Initialize secure token storage
  const initializeSecureStorage = useCallback(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedExpiry = localStorage.getItem('sessionExpiry');

    if (storedToken && storedExpiry && new Date(storedExpiry) > new Date()) {
      useLoginStore.getState().setAuthToken(storedToken, storedExpiry);
      useLoginStore.getState().setSessionExpiry(storedExpiry);
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    initializeSecureStorage();
  }, [initializeSecureStorage]);

  // Secure session refresh with enhanced error handling
  useEffect(() => {
    const interval = setInterval(
      async () => {
        try {
          const SecureAuthService = await loadSecureAuthService();
          const authService = new SecureAuthService();
          const refreshed = await authService.refreshToken();

          if (refreshed) {
            // Log successful refresh for security monitoring
            console.log('[AUTH] Session refreshed successfully');
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (err) {
          console.error('[AUTH] Session refresh failed:', err);

          // Clear invalid session and logout
          useLoginStore.getState().reset();
          const SecureAuthService = await loadSecureAuthService();
          const authService = new SecureAuthService();
          await authService.logout();
        }
      },
      14 * 60 * 1000 // Refresh every 14 minutes
    );

    return () => clearInterval(interval);
  }, []);

  // Get store selectors and actions
  const formData = useLoginStore((state) => state.formData);
  const errors = useLoginStore((state) => state.errors);
  const loading = useLoginStore((state) => state.loading);
  const setField = useLoginStore((state) => state.setField);

  const handleChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value =
        e.target.type === 'checkbox' ? e.target.checked : e.target.value;
      setField(field, value);
    };

  const handleSubmit = useCallback(
    async (credentials: {
      username: string;
      password: string;
      rememberMe?: boolean;
    }): Promise<void> => {
      const startTime = performance.now();

      try {
        // Set loading state
        useLoginStore.getState().setLoading(true);

        // Sanitize inputs for security
        const sanitizedEmail = credentials.username.trim().toLowerCase();
        const sanitizedPassword = credentials.password;

        // Validate inputs
        if (!sanitizedEmail || !sanitizedPassword) {
          throw new Error('Email and password are required');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedEmail)) {
          throw new Error('Please enter a valid email address');
        }

        if (sanitizedPassword.length < 8) {
          throw new Error('Password must be at least 8 characters long');
        }

        // Lazy load services only when needed
        const [SecureAuthService, logAudit, _ErrorReportingService] =
          await Promise.all([
            loadSecureAuthService(),
            loadAuditService(),
            loadErrorReportingService(),
          ]);

        // Attempt secure login
        const authService = new SecureAuthService();
        const response = await authService.secureLogin({
          email: sanitizedEmail,
          password: sanitizedPassword,
        });

        if (response.success && response.data) {
          // Store tokens securely - respect Remember Me setting
          const expiry = new Date(
            Date.now() + response.data.expiresIn * 1000
          ).toISOString();
          useLoginStore
            .getState()
            .setAuthToken(
              response.data.accessToken,
              expiry,
              credentials.rememberMe
            );

          // Initialize UserContext after successful login
          await initializeUserContext();

          // Initialize performance metrics cache on login for faster dashboard loading
          try {
            const { performanceMetricsCache } = await import(
              '../services/performanceMetricsCache'
            );
            await performanceMetricsCache.fetchAndCacheMetricsOnLogin();
            console.log('✅ Performance metrics cached on login');
          } catch (error) {
            console.warn(
              'Failed to cache performance metrics on login:',
              error
            );
            // Don't fail login if metrics caching fails
          }
        } else {
          throw new Error(response.error || 'Authentication failed');
        }

        // Log successful authentication
        await logAudit(sanitizedEmail, true);

        const loginTime = performance.now() - startTime;
        console.log(
          `[AUTH] Login successful for ${sanitizedEmail} in ${loginTime.toFixed(2)}ms`
        );
      } catch (error: unknown) {
        const userFriendlyMessage = createUserFriendlyError(error);

        // Lazy load services for error handling
        const [logAudit, _ErrorReportingService] = await Promise.all([
          loadAuditService(),
          loadErrorReportingService(),
        ]);

        // Log failed authentication
        await logAudit(credentials.username, false);

        // Report error to service
        try {
          _ErrorReportingService.reportError(
            error instanceof Error ? error : new Error(String(error)),
            undefined,
            {
              context: 'login',
              email: credentials.username,
              timestamp: new Date().toISOString(),
            }
          );
        } catch (reportError) {
          logger.error('Failed to report login error:', reportError);
        }

        const loginTime = performance.now() - startTime;
        logger.error(
          `[AUTH] Login failed for ${credentials.username} after ${loginTime.toFixed(2)}ms:`,
          error
        );

        // Set user-friendly error state
        useLoginStore.getState().setErrors({
          submit: userFriendlyMessage,
        });

        throw new Error(userFriendlyMessage);
      } finally {
        // Clear loading state
        useLoginStore.getState().setLoading(false);
      }
    },
    [createUserFriendlyError, initializeUserContext]
  );

  // Secure logout function
  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      console.log('[AUTH] Starting secure logout...');

      // Clear user data from UserContext FIRST (before clearing auth tokens)
      console.log('[AUTH] Calling clearUserData()...');
      clearUserData();

      // Wait a moment to ensure UserContext is cleared
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Call secure logout
      console.log('[AUTH] Calling logout()...');
      const SecureAuthService = await loadSecureAuthService();
      const authService = new SecureAuthService();
      await authService.logout();

      // Clear all local state
      console.log('[AUTH] Calling login store reset()...');
      await useLoginStore.getState().reset();

      console.log('[AUTH] Logout completed successfully');

      // Force page reload to clear console and reset all services
      console.log('[AUTH] Reloading page for clean state...');
      window.location.reload();
    } catch (error) {
      console.error('[AUTH] Logout error:', error);

      // Force clear local state even if server logout fails
      clearUserData();
      await useLoginStore.getState().reset();

      // Force page reload even on error to ensure clean state
      console.log('[AUTH] Reloading page after logout error...');
      window.location.reload();

      throw error;
    }
  }, [clearUserData]);

  // Check if user is authenticated
  const isAuthenticated = useCallback((): boolean => {
    const authToken = useLoginStore.getState().authToken;
    const tokenExpiry = useLoginStore.getState().tokenExpiry;

    if (!authToken || !tokenExpiry) {
      return false;
    }

    return new Date(tokenExpiry) > new Date();
  }, []);

  // Get current user info
  const getCurrentUser = useCallback(() => {
    const authToken = useLoginStore.getState().authToken;
    const tokenExpiry = useLoginStore.getState().tokenExpiry;

    if (!authToken || !tokenExpiry || new Date(tokenExpiry) <= new Date()) {
      return null;
    }

    // In a real implementation, you might decode the JWT token here
    // For now, return basic info
    return {
      token: authToken,
      expiresAt: tokenExpiry,
    };
  }, []);

  return {
    formData,
    errors,
    loading,
    handleChange,
    handleSubmit,
    handleLogout,
    isAuthenticated,
    getCurrentUser,
  };
};
