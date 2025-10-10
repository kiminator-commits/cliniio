import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLoginStore } from '@/stores/useLoginStore';
import { useUser } from '@/contexts/UserContext';
import { SecureAuthService } from '@/services/secureAuthService';
import { trackEvent } from '@/services/analytics';
import { LOGIN_CONFIG, LOGIN_ERRORS } from '@/constants/loginConstants';
import { deviceManager } from '@/services/deviceManager';

export const useLoginForm = () => {
  const navigate = useNavigate();
  const { refreshUserData } = useUser();
  const {
    formData,
    errors,
    loading,
    setField,
    setErrors,
    setLoading,
    setAuthToken,
    csrfToken: _csrfToken,
    incrementFailedAttempts,
    resetFailedAttempts,
    isSecureMode,
  } = useLoginStore();

  const [loadingStep, setLoadingStep] = useState<string>('');

  const handleChange = useCallback(
    (field: keyof typeof formData) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value =
          field === 'rememberMe' || field === 'rememberDevice'
            ? e.target.checked
            : e.target.value;

        setField(field, value);

        // Clear field-specific errors when user starts typing
        if (errors[field]) {
          setErrors({ ...errors, [field]: '' });
        }
      },
    [errors, setField, setErrors]
  );

  const handleSubmit = async (
    sanitizedEmail: string,
    sanitizedPassword: string,
    validateCsrfToken: () => boolean,
    logSecurityEvent: (event: string, user: string, reason?: string) => void,
    rememberMe: boolean = false,
    rememberDevice: boolean = false
  ) => {
    if (loading) return;

    // Clear previous errors
    setErrors({});
    setLoading(true);

    // Validate CSRF token if in secure mode
    if (isSecureMode && !validateCsrfToken()) {
      setErrors({
        submit:
          'Security validation failed. Please refresh the page and try again.',
      });
      setLoading(false);
      return;
    }

    try {
      // Track login attempt
      trackEvent('attempt', {
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      });

      // Check if device is already trusted (for faster login)
      const _isTrustedDevice = false;
      if (rememberDevice) {
        try {
          // We'll check this after we get the user ID from successful auth
          console.log('🔍 Checking if device is already trusted...');
        } catch (error) {
          console.warn('Failed to check trusted device:', error);
        }
      }

      // Use secure authentication
      const authService = new SecureAuthService();
      const response = await authService.secureLogin({
        email: sanitizedEmail,
        password: sanitizedPassword,
        rememberMe: rememberMe,
      });

      if (response.success && response.data) {
        // Update progress
        setLoadingStep(LOGIN_CONFIG.PROGRESS_STEPS.VERIFYING);

        // Set auth token with secure expiry and remember me setting
        const expiry = new Date(
          Date.now() + response.data.expiresIn * 1000
        ).toISOString();
        setAuthToken(response.data.accessToken, expiry, rememberMe);

        // Refresh user data
        try {
          await refreshUserData();
        } catch (error) {
          console.warn('Failed to refresh user data:', error);
        }

        // Handle device trust if requested
        if (rememberDevice) {
          try {
            const deviceFingerprint = deviceManager.generateDeviceFingerprint();
            const userId = response.data.user?.id;

            if (userId) {
              // Check if device is already trusted
              const alreadyTrusted =
                await deviceManager.isDeviceTrusted(userId);

              if (!alreadyTrusted) {
                await deviceManager.storeTrustedDevice(
                  userId,
                  deviceFingerprint
                );
                console.log('✅ Device marked as trusted');
              } else {
                console.log('✅ Device already trusted');
              }
            }
          } catch (error) {
            console.warn('Failed to store trusted device:', error);
            // Don't fail login if device storage fails
          }
        }

        // Track successful login
        trackEvent('success', {
          email: sanitizedEmail,
          timestamp: new Date().toISOString(),
        });

        // Log security event
        logSecurityEvent('login_success', sanitizedEmail);

        // Reset failed attempts on successful login
        resetFailedAttempts();

        // Update progress
        setLoadingStep(LOGIN_CONFIG.PROGRESS_STEPS.SUCCESS);

        // Redirect after delay
        setTimeout(() => {
          navigate('/home');
        }, LOGIN_CONFIG.REDIRECT_DELAY_MS);
      } else {
        throw new Error(response.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Secure login error:', error);

      // Increment failed attempts for security tracking
      incrementFailedAttempts();

      const errorMessage =
        error instanceof Error ? error.message : LOGIN_ERRORS.unexpectedError;
      setErrors({ submit: errorMessage });

      // Track failed login
      trackEvent('failure', {
        email: sanitizedEmail,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });

      // Log security event
      logSecurityEvent('login_failure', sanitizedEmail, errorMessage);
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  const handleForgotPassword = useCallback(() => {
    // This will be handled by the parent component
    console.log('Forgot password clicked');
  }, []);

  return {
    formData,
    errors,
    loading,
    loadingStep,
    handleChange,
    handleSubmit,
    handleForgotPassword,
  };
};
