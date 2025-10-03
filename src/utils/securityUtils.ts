// Basic security utilities for input validation and CSRF protection

export const sanitizeInput = (
  input: string,
  type: 'email' | 'password'
): string | null => {
  if (!input || typeof input !== 'string') return null;

  // Basic sanitization - remove script tags and dangerous characters
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();

  if (type === 'email') {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(sanitized) ? sanitized : null;
  }

  if (type === 'password') {
    // Basic password validation - just ensure minimum length
    // Password strength will be evaluated separately for user feedback
    if (sanitized.length < 8) {
      return null; // Minimum length requirement
    }

    return sanitized;
  }

  return sanitized;
};

import { SECURITY_CONSTANTS } from '../constants/securityConstants';

export const evaluatePasswordStrength = (
  password: string
): {
  score: number; // 0-5 (0=very weak, 5=very strong)
  strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  feedback: string[];
  suggestions: string[];
} => {
  if (
    !password ||
    password.length < SECURITY_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH
  ) {
    return {
      score: 0,
      strength: 'very_weak',
      feedback: ['Password is too short'],
      suggestions: [
        `Use at least ${SECURITY_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH} characters`,
      ],
    };
  }

  let score = 0;
  const feedback: string[] = [];
  const suggestions: string[] = [];

  // Length bonus
  if (password.length >= SECURITY_CONSTANTS.PASSWORD_STRENGTH.MIN_LENGTH) {
    score += 1;
  }
  // Additional length bonus for very long passwords (but reduced)
  if (
    password.length >= SECURITY_CONSTANTS.PASSWORD_STRENGTH.EXCELLENT_LENGTH
  ) {
    score += 0; // No additional length bonus to keep scores lower
  }

  // Character variety bonuses
  let charBonus = 0;
  if (/[a-z]/.test(password)) charBonus += 1;
  if (/[A-Z]/.test(password)) charBonus += 1;
  if (/\d/.test(password)) charBonus += 1;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) charBonus += 1;

  // Character variety scoring - give points for each character type
  // Simple linear scoring: 1 point per character type, capped at 3
  score += Math.min(charBonus, 3);

  // Penalize common patterns
  if (/123|abc|qwe|password|admin/i.test(password)) {
    feedback.push('Avoid common patterns');
    if (score < SECURITY_CONSTANTS.PASSWORD_STRENGTH.MAX_SCORE) {
      suggestions.push("Don't use sequential characters or common words");
    }
  }

  // Penalize repeated characters
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeated characters');
  }

  // Cap score at maximum
  score = Math.min(score, SECURITY_CONSTANTS.PASSWORD_STRENGTH.MAX_SCORE);

  // Determine strength level
  let strength: 'very_weak' | 'weak' | 'medium' | 'strong' | 'very_strong';
  if (score <= 1) strength = 'very_weak';
  else if (score === 2) strength = 'weak';
  else if (score === 3) strength = 'medium';
  else if (score === 4) strength = 'strong';
  else if (score >= 5) strength = 'very_strong';
  else strength = 'very_weak'; // fallback

  // Add positive feedback
  if (score >= 3) {
    feedback.push('Good password strength');
  }
  if (password.length >= 12) {
    feedback.push('Good length');
  }

  // Add suggestions for improvement (only if not at max score)
  if (score < SECURITY_CONSTANTS.PASSWORD_STRENGTH.MAX_SCORE) {
    if (!/[A-Z]/.test(password)) {
      suggestions.push('Add uppercase letters');
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push('Add lowercase letters');
    }
    if (!/\d/.test(password)) {
      suggestions.push('Add numbers');
    }
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
      suggestions.push('Add special characters');
    }
    if (password.length < SECURITY_CONSTANTS.PASSWORD_STRENGTH.GOOD_LENGTH) {
      suggestions.push(
        `Make it longer (${SECURITY_CONSTANTS.PASSWORD_STRENGTH.GOOD_LENGTH}+ characters)`
      );
    }
  }

  return { score, strength, feedback, suggestions };
};

export const detectSuspiciousInput = (
  input: string
): { isSuspicious: boolean; threats: string[] } => {
  const threats: string[] = [];

  if (!input || typeof input !== 'string') {
    return { isSuspicious: false, threats };
  }

  // Check for SQL injection patterns
  if (
    /('|"|;|--|\/\*|\*\/|union|select|insert|update|delete|drop|create|alter)/i.test(
      input
    )
  ) {
    threats.push('Potential SQL injection detected');
  }

  // Check for XSS patterns
  if (/<script|javascript:|on\w+\s*=|vbscript:|expression\(/i.test(input)) {
    threats.push('Potential XSS attack detected');
  }

  // Check for command injection
  if (/\||&|;|`|\$\(|eval\(|exec\(/i.test(input)) {
    threats.push('Potential command injection detected');
  }

  return {
    isSuspicious: threats.length > 0,
    threats,
  };
};

export const generateSecureToken = (length: number = 32): string => {
  const charset =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Use crypto.getRandomValues if available (more secure)
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);

    for (let i = 0; i < length; i++) {
      result += charset[randomValues[i] % charset.length];
    }
  } else {
    // Fallback for older browsers
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
  }

  return result;
};

export const csrfProtection = {
  generateToken: (): string => {
    return generateSecureToken(32);
  },

  storeToken: (token: string): void => {
    try {
      // Store in httpOnly cookie via server endpoint
      // For now, fallback to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('csrf_token', token);
      }
    } catch (error) {
      // Only warn in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to store CSRF token:', error);
      }
    }
  },

  getStoredToken: (): string | null => {
    try {
      // Get from httpOnly cookie via server endpoint
      // For now, fallback to localStorage
      if (typeof window !== 'undefined') {
        return localStorage.getItem('csrf_token');
      }
      return null;
    } catch (error) {
      // Only warn in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to retrieve CSRF token:', error);
      }
      return null;
    }
  },

  validateToken: (token: string, storedToken: string): boolean => {
    if (!token || !storedToken) {
      return false;
    }

    // Check if tokens match
    const isValid = token === storedToken;

    // If validation fails, log for debugging (development only)
    if (!isValid && process.env.NODE_ENV === 'development') {
      console.warn('[CSRF] Token mismatch detected:', {
        providedLength: token.length,
        storedLength: storedToken.length,
        providedStart: token.substring(0, 8),
        storedStart: storedToken.substring(0, 8),
      });
    }

    return isValid;
  },

  // New method to set httpOnly cookie (requires server implementation)
  setHttpOnlyCookie: (token: string): void => {
    // This should be implemented on the server side
    // For now, we'll use the fallback localStorage method
    csrfProtection.storeToken(token);
  },

  // Method to refresh token if validation fails
  refreshToken: (): string => {
    const newToken = csrfProtection.generateToken();
    csrfProtection.storeToken(newToken);
    return newToken;
  },

  // Method to clear stored token
  clearToken: (): void => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('csrf_token');
      }
    } catch (error) {
      // Only warn in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Failed to clear CSRF token:', error);
      }
    }
  },
};
