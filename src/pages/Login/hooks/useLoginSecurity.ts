import { useState, useEffect, useMemo } from 'react';
import {
  sanitizeInput,
  detectSuspiciousInput,
  csrfProtection,
} from '@/utils/securityUtils';
import { rateLimitService } from '@/services/rateLimitService';
import { isDevelopment } from '@/lib/getEnv';
import { logAuditEvent } from '@/services/auditService';
import { useDebounce } from '@/hooks/useDebounce';
import { SECURITY_CONSTANTS } from '@/constants/securityConstants';

export const useLoginSecurity = () => {
  const [csrfToken, setCsrfToken] = useState<string>('');
  const [securityWarnings, setSecurityWarnings] = useState<string[]>([]);
  const [rateLimitInfo, setRateLimitInfo] = useState<unknown>(null);
  const [isHttps, setIsHttps] = useState<boolean>(false);

  // Generate CSRF token on mount - only once
  useEffect(() => {
    // Check if we already have a stored token
    const initializeToken = () => {
      const existingToken = csrfProtection.getStoredToken();
      if (existingToken) {
        setCsrfToken(existingToken);
      } else {
        // Generate new token only if none exists
        const token = csrfProtection.generateToken();
        setCsrfToken(token);
        csrfProtection.storeToken(token);
      }
    };
    
    // Use setTimeout to avoid calling setState synchronously in effect
    const timeoutId = setTimeout(initializeToken, 0);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const logSecurityEvent = (eventType: string, details: unknown) => {
    // Only log to console in development, never in production
    if (isDevelopment()) {
      console.warn(`[SECURITY] ${eventType}:`, details);
    }

    // Log to audit service (no sensitive data in production)
    const sanitizedDetails = isDevelopment()
      ? details
      : {
          event_type: eventType,
          timestamp: new Date().toISOString(),
          // Remove sensitive information in production
          has_details:
            Object.keys(details as Record<string, unknown>).length > 0,
        };

    logAuditEvent({
      event: 'security_event',
      timestamp: new Date().toISOString(),
      metadata: sanitizedDetails as Record<string, unknown>,
    });
  };

  // Check HTTPS enforcement
  useEffect(() => {
    const checkHttps = () => {
      const isSecure =
        window.location.protocol === 'https:' ||
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1';
      setIsHttps(isSecure);

      if (!isSecure && !isDevelopment()) {
        logSecurityEvent('non_https_connection', {
          protocol: window.location.protocol,
          hostname: window.location.hostname,
        });
      }
    };

    checkHttps();
  }, []);

  const validateInputsInternal = (email: string, password: string) => {
    // Basic validation first
    const basicErrors: string[] = [];

    // Email validation
    if (!email.trim()) {
      basicErrors.push('Please enter a valid email address.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      basicErrors.push('Please enter a valid email address.');
    }

    // Password validation
    if (!password) {
      basicErrors.push('Password must be at least 6 characters long.');
    } else if (password.length < 6) {
      basicErrors.push('Password must be at least 6 characters long.');
    }

    // If basic validation fails, return early
    if (basicErrors.length > 0) {
      return {
        isValid: false,
        email: email.trim(),
        password: password,
        errors: basicErrors,
      };
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email, 'email');
    const sanitizedPassword = sanitizeInput(password, 'password');

    if (!sanitizedEmail || !sanitizedPassword) {
      return {
        isValid: false,
        email: sanitizedEmail,
        password: sanitizedPassword,
        errors: ['Invalid email or password format'],
      };
    }

    // Check for suspicious input patterns
    const emailThreats = detectSuspiciousInput(sanitizedEmail);
    const passwordThreats = detectSuspiciousInput(sanitizedPassword);

    const allThreats = [...emailThreats.threats, ...passwordThreats.threats];

    if (allThreats.length > 0) {
      setSecurityWarnings(allThreats);
      logSecurityEvent('suspicious_input_detected', {
        email: sanitizedEmail,
        threats: allThreats,
      });
      return {
        isValid: false,
        email: sanitizedEmail,
        password: sanitizedPassword,
        errors: allThreats,
      };
    }

    // Clear security warnings if inputs are clean
    setSecurityWarnings([]);

    return {
      isValid: true,
      email: sanitizedEmail,
      password: sanitizedPassword,
      errors: [],
    };
  };

  // Debounced validation to prevent excessive security checks
  const debouncedValidateInputs = useDebounce(
    ((email: string, password: string) => {
      return validateInputsInternal(email, password);
    }) as (...args: unknown[]) => unknown,
    SECURITY_CONSTANTS.VALIDATION.DEBOUNCE_MS
  );

  const validateInputs = (email: string, password: string) => {
    // For immediate validation (e.g., form submission), use internal validation
    return validateInputsInternal(email, password);
  };

  const validateCsrfToken = (token: string): boolean => {
    const storedToken = csrfProtection.getStoredToken();
    const isValid = csrfProtection.validateToken(token, storedToken || '');

    if (!isValid) {
      logSecurityEvent('csrf_validation_failed', {
        providedToken: token,
        storedToken,
      });

      // Refresh token if validation fails to prevent future failures
      const newToken = csrfProtection.refreshToken();
      setCsrfToken(newToken);
    }

    return isValid;
  };

  const checkRateLimit = async (email: string) => {
    try {
      const info = await rateLimitService.checkRateLimit(email);
      setRateLimitInfo(info);

      if (info.isLocked) {
        logSecurityEvent('rate_limit_exceeded', {
          email,
          lockoutTime: info.lockoutTime,
        });
      }

      return info;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return { isLocked: false, remainingAttempts: 5 };
    }
  };

  const clearSecurityWarnings = () => {
    setSecurityWarnings([]);
  };

  const clearCsrfToken = () => {
    csrfProtection.clearToken();
    setCsrfToken('');
  };

  const getSecurityStatus = useMemo(() => {
    const hasWarnings = securityWarnings.length > 0;
    const isRateLimited =
      (rateLimitInfo as { isLocked?: boolean })?.isLocked || false;

    if (isRateLimited) return 'locked';
    if (hasWarnings) return 'warning';
    return 'secure';
  }, [securityWarnings, rateLimitInfo]);

  return {
    csrfToken,
    securityWarnings,
    rateLimitInfo,
    isHttps,
    validateInputs,
    debouncedValidateInputs,
    validateCsrfToken,
    checkRateLimit,
    clearSecurityWarnings,
    clearCsrfToken,
    logSecurityEvent,
    getSecurityStatus,
  };
};
