import { useState, useCallback, useEffect } from 'react';

export interface SecurityConfig {
  csrfEnabled: boolean;
  rateLimitEnabled: boolean;
  sessionTimeout: number;
}

export interface SecurityEventDetails {
  [key: string]: string | number | boolean | undefined;
}

export const useLoginSecurity = (
  config: SecurityConfig = {
    csrfEnabled: true,
    rateLimitEnabled: true,
    sessionTimeout: 3600000, // 1 hour default
  }
) => {
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Generate CSRF token
  const generateCSRFToken = useCallback((): string => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  }, []);

  // Validate CSRF token
  const validateCSRFToken = useCallback(
    (formToken: string): boolean => {
      if (!config.csrfEnabled) return true;
      return formToken === csrfToken;
    },
    [csrfToken, config.csrfEnabled]
  );

  // Get CSRF token for form
  const getCSRFToken = useCallback((): string => {
    return csrfToken;
  }, [csrfToken]);

  // Refresh CSRF token
  const refreshCSRFToken = useCallback((): void => {
    setCsrfToken(generateCSRFToken());
  }, [generateCSRFToken]);

  // Security validation for form submission
  const validateFormSecurity = useCallback(
    (form: HTMLFormElement): { isValid: boolean; error?: string } => {
      if (!config.csrfEnabled) {
        return { isValid: true };
      }

      const formCsrfToken = form.querySelector(
        'input[name="csrf_token"]'
      ) as HTMLInputElement;

      if (!formCsrfToken) {
        return {
          isValid: false,
          error:
            'Security token missing. Please refresh the page and try again.',
        };
      }

      if (!validateCSRFToken(formCsrfToken.value)) {
        return {
          isValid: false,
          error:
            'Security validation failed. Please refresh the page and try again.',
        };
      }

      return { isValid: true };
    },
    [validateCSRFToken, config.csrfEnabled]
  );

  // Security audit logging
  const logSecurityEvent = useCallback(
    (event: string, details: SecurityEventDetails): void => {
      console.warn(`Security Event: ${event}`, {
        timestamp: new Date().toISOString(),
        csrfEnabled: config.csrfEnabled,
        rateLimitEnabled: config.rateLimitEnabled,
        userAgent: navigator.userAgent,
        ...details,
      });
    },
    [config]
  );

  // Initialize security on mount
  useEffect(() => {
    if (config.csrfEnabled) {
      setCsrfToken(generateCSRFToken());
    }
  }, [config.csrfEnabled, generateCSRFToken]);

  return {
    csrfToken: getCSRFToken(),
    validateFormSecurity,
    refreshCSRFToken,
    logSecurityEvent,
    isCSRFEnabled: config.csrfEnabled,
  };
};
