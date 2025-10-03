// Security Configuration - Centralized security settings
import { getEnvVar } from '@/lib/getEnv';

// Environment variable keys for security-sensitive configuration
export const SECURITY_KEYS = {
  SUPABASE_URL: 'VITE_SUPABASE_URL',
  SUPABASE_ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
  SUPABASE_SERVICE_ROLE_KEY: 'VITE_SUPABASE_SERVICE_ROLE_KEY',
  OPENAI_API_KEY: 'VITE_OPENAI_API_KEY',
  GOOGLE_VISION_API_KEY: 'VITE_GOOGLE_VISION_API_KEY',
  AZURE_VISION_API_KEY: 'VITE_AZURE_VISION_API_KEY',
  AZURE_VISION_ENDPOINT: 'VITE_AZURE_VISION_ENDPOINT',
} as const;

// Security configuration object
export const SECURITY_CONFIG = {
  // Authentication settings
  auth: {
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    inactivityTimeout: 8 * 60 * 60 * 1000, // 8 hours in milliseconds
    tokenRefreshThreshold: 14 * 60 * 1000, // 14 minutes before expiry
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },

  // Password requirements
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxLength: 128,
  },

  // Input validation limits
  input: {
    maxLength: 1000,
    maxTitleLength: 200,
    maxDescriptionLength: 2000,
    maxSearchQueryLength: 100,
  },

  // Rate limiting
  rateLimit: {
    loginAttempts: 5,
    loginWindow: 15 * 60 * 1000, // 15 minutes
    apiRequests: 100,
    apiWindow: 60 * 1000, // 1 minute
  },

  // Development settings
  development: {
    allowMockAuth: false, // Disabled for security
    allowHardcodedCredentials: false, // Disabled for security
    enableSecurityLogging: true,
  },
} as const;

// Secure credential getter with validation
export const getSecureCredentials = (key: keyof typeof SECURITY_KEYS) => {
  const value = getEnvVar(SECURITY_KEYS[key]);

  if (!value) {
    throw new Error(
      `Missing required security configuration: ${SECURITY_KEYS[key]}. ` +
        'Please set this environment variable.'
    );
  }

  return value;
};

// Check if all required security configuration is present
export const validateSecurityConfiguration = (): {
  isValid: boolean;
  missing: string[];
  present: string[];
} => {
  const missing: string[] = [];
  const present: string[] = [];

  Object.entries(SECURITY_KEYS).forEach(([key, envKey]) => {
    const value = getEnvVar(envKey);
    if (value) {
      present.push(key);
    } else {
      missing.push(key);
    }
  });

  return {
    isValid: missing.length === 0,
    missing,
    present,
  };
};

// Get security configuration status for debugging
export const getSecurityConfigStatus = () => {
  const validation = validateSecurityConfiguration();

  return {
    ...validation,
    totalKeys: Object.keys(SECURITY_KEYS).length,
    configuredKeys: validation.present.length,
    missingKeys: validation.missing.length,
    configurationPercentage: Math.round(
      (validation.present.length / Object.keys(SECURITY_KEYS).length) * 100
    ),
  };
};

// Security utility functions
export const securityUtils = {
  // Generate secure random string
  generateSecureString: (length: number = 32): string => {
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validate environment variable security
  validateEnvVar: (key: string, value: string): boolean => {
    if (!value || value.trim() === '') return false;
    if (value.includes('test') || value.includes('mock')) return false;
    if (value.length < 10) return false; // Minimum length for security
    return true;
  },

  // Sanitize configuration for logging (remove sensitive data)
  sanitizeForLogging: (
    config: Record<string, unknown>
  ): Record<string, unknown> => {
    const sanitized = { ...config };
    const sensitiveKeys = ['key', 'token', 'secret', 'password', 'credential'];

    Object.keys(sanitized).forEach((key) => {
      if (
        sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))
      ) {
        if (typeof sanitized[key] === 'string') {
          const value = sanitized[key] as string;
          sanitized[key] =
            value.length > 8
              ? `${value.substring(0, 4)}***${value.substring(value.length - 4)}`
              : '***';
        } else {
          sanitized[key] = '***';
        }
      }
    });

    return sanitized;
  },
};
