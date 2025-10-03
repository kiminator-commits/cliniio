// Security-related constants to avoid magic numbers

export const SECURITY_CONSTANTS = {
  // Rate limiting configuration
  RATE_LIMIT: {
    MAX_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    WINDOW_SIZE_MINUTES: 15,
  },

  // Input validation timing
  VALIDATION: {
    DEBOUNCE_MS: 500,
  },

  // Security thresholds
  THRESHOLDS: {
    MIN_PASSWORD_LENGTH: 8,
    MAX_LOGIN_ATTEMPTS: 5,
  },

  // Password strength scoring
  PASSWORD_STRENGTH: {
    MIN_LENGTH: 8,
    GOOD_LENGTH: 12,
    EXCELLENT_LENGTH: 16,
    MAX_SCORE: 5,
  },
} as const;

// Make the object deeply readonly at runtime
const deepFreeze = (obj: Record<string, unknown>) => {
  Object.keys(obj).forEach((prop) => {
    if (typeof obj[prop] === 'object' && obj[prop] !== null) {
      deepFreeze(obj[prop] as Record<string, unknown>);
    }
  });
  return Object.freeze(obj);
};

export const FROZEN_SECURITY_CONSTANTS = deepFreeze(SECURITY_CONSTANTS);

// Type-safe access to constants
export type SecurityConstants = typeof SECURITY_CONSTANTS;
