// React hook for secure authentication
import { useState, useEffect, useCallback, useRef } from 'react';
import { secureAuthService } from '../services/secureAuthenticationService';
import { authMigrationService } from '../services/authMigrationService';

interface User {
  id: string;
  email: string;
  role: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  error: string | null;
  migrationStatus: {
    isComplete: boolean;
    isRunning: boolean;
    stepsCompleted: string[];
    errors: string[];
  };
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface LoginResult {
  success: boolean;
  error?: string;
  rateLimitInfo?: {
    remainingAttempts: number;
    resetTime: number;
  };
}

export const useSecureAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null,
    migrationStatus: {
      isComplete: false,
      isRunning: false,
      stepsCompleted: [],
      errors: [],
    },
  });

  const initializationRef = useRef(false);
  const tokenValidationInterval = useRef<NodeJS.Timeout | null>(null);

  // Initialize authentication state
  const initializeAuth = useCallback(async () => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check if migration is needed
      if (!authMigrationService.isMigrationComplete()) {
        const migrationStatus = authMigrationService.getMigrationStatus();

        if (!migrationStatus.isComplete && !migrationStatus.errors.length) {
          // Run migration
          setAuthState((prev) => ({
            ...prev,
            migrationStatus: {
              isComplete: false,
              isRunning: true,
              stepsCompleted: migrationStatus.stepsCompleted,
              errors: migrationStatus.errors,
            },
          }));

          const migrationResult = await authMigrationService.runMigration();

          setAuthState((prev) => ({
            ...prev,
            migrationStatus: {
              isComplete: migrationResult.isComplete,
              isRunning: false,
              stepsCompleted: migrationResult.stepsCompleted,
              errors: migrationResult.errors,
            },
          }));

          if (!migrationResult.isComplete) {
            setAuthState((prev) => ({
              ...prev,
              isLoading: false,
              error:
                'Authentication migration failed. Please refresh the page.',
            }));
            return;
          }
        }
      }

      // Check authentication status
      const isAuthenticated = await secureAuthService.isAuthenticated();
      const user = isAuthenticated
        ? await secureAuthService.getCurrentUser()
        : null;

      setAuthState((prev) => ({
        ...prev,
        isAuthenticated,
        user,
        isLoading: false,
        error: null,
      }));

      // Start token validation interval
      if (isAuthenticated) {
        startTokenValidation();
      }
    } catch (error) {
      console.error('Authentication initialization failed:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication initialization failed',
      }));
    }
  }, [startTokenValidation]);

  // Start periodic token validation
  const startTokenValidation = useCallback(() => {
    if (tokenValidationInterval.current) {
      clearInterval(tokenValidationInterval.current);
    }

    tokenValidationInterval.current = setInterval(
      async () => {
        try {
          const isValid = await secureAuthService.validateToken();
          if (!isValid) {
            await logout();
          }
        } catch (error) {
          console.warn('Token validation failed:', error);
          await logout();
        }
      },
      5 * 60 * 1000
    ); // Check every 5 minutes
  }, [logout]);

  // Stop token validation
  const stopTokenValidation = useCallback(() => {
    if (tokenValidationInterval.current) {
      clearInterval(tokenValidationInterval.current);
      tokenValidationInterval.current = null;
    }
  }, []);

  // Login function
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginResult> => {
      try {
        setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));

        const result = await secureAuthService.authenticate(credentials);

        if (result.success && result.data) {
          const user = await secureAuthService.getCurrentUser();

          setAuthState((prev) => ({
            ...prev,
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null,
          }));

          // Start token validation
          startTokenValidation();

          return { success: true };
        } else {
          setAuthState((prev) => ({
            ...prev,
            isLoading: false,
            error: result.error || 'Login failed',
          }));

          return {
            success: false,
            error: result.error || 'Login failed',
            rateLimitInfo: result.rateLimitInfo,
          };
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Login failed';

        setAuthState((prev) => ({
          ...prev,
          isLoading: false,
          error: errorMessage,
        }));

        return {
          success: false,
          error: errorMessage,
        };
      }
    },
    [startTokenValidation]
  );

  // Logout function
  const logout = useCallback(async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      await secureAuthService.logout();

      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: null,
        migrationStatus: {
          isComplete: true,
          isRunning: false,
          stepsCompleted: [],
          errors: [],
        },
      });

      // Stop token validation
      stopTokenValidation();
    } catch (error) {
      console.error('Logout failed:', error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        error: 'Logout failed',
      }));
    }
  }, [stopTokenValidation]);

  // Refresh token function
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const success = await secureAuthService.refreshToken();

      if (success) {
        const user = await secureAuthService.getCurrentUser();
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: true,
          user,
        }));
      } else {
        await logout();
      }

      return success;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
      return false;
    }
  }, [logout]);

  // Extend session function
  const extendSession = useCallback(async (): Promise<boolean> => {
    try {
      return await secureAuthService.extendSession();
    } catch (error) {
      console.warn('Session extension failed:', error);
      return false;
    }
  }, []);

  // Report security event function
  const reportSecurityEvent = useCallback(
    async (eventType: string, details: unknown): Promise<void> => {
      try {
        await secureAuthService.reportSecurityEvent(eventType, details);
      } catch (error) {
        console.warn('Failed to report security event:', error);
      }
    },
    []
  );

  // Get access token function
  const getAccessToken = useCallback((): string | null => {
    return secureAuthService.getAccessToken();
  }, []);

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      return authState.user?.role === role;
    },
    [authState.user]
  );

  // Check if user has any of the specified roles
  const hasAnyRole = useCallback(
    (roles: string[]): boolean => {
      return authState.user ? roles.includes(authState.user.role) : false;
    },
    [authState.user]
  );

  // Initialize on mount
  useEffect(() => {
    initializeAuth();

    // Cleanup on unmount
    return () => {
      stopTokenValidation();
    };
  }, [initializeAuth, stopTokenValidation]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && authState.isAuthenticated) {
        // Validate token when page becomes visible
        try {
          const isValid = await secureAuthService.validateToken();
          if (!isValid) {
            await logout();
          }
        } catch (error) {
          console.warn('Token validation on visibility change failed:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [authState.isAuthenticated, logout]);

  // Handle beforeunload event
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Extend session before page unload
      if (authState.isAuthenticated) {
        secureAuthService.extendSession().catch(() => {
          // Ignore errors during page unload
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [authState.isAuthenticated]);

  return {
    // State
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    user: authState.user,
    error: authState.error,
    migrationStatus: authState.migrationStatus,

    // Actions
    login,
    logout,
    refreshToken,
    extendSession,
    reportSecurityEvent,
    getAccessToken,

    // Utilities
    hasRole,
    hasAnyRole,
    initializeAuth,
  };
};

// Export types
export type { User, LoginCredentials, LoginResult, AuthState };
