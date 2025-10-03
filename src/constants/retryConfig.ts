/**
 * Centralized retry configuration constants
 * Provides consistent retry settings across the application
 */

export const RETRY_CONFIG = {
  // Quick operations (UI interactions, simple API calls)
  QUICK: {
    maxRetries: 1,
    baseDelay: 100,
    maxDelay: 200,
    backoffStrategy: 'fixed' as const,
  },

  // Standard operations (most business logic)
  STANDARD: {
    maxRetries: 3,
    baseDelay: 100,
    maxDelay: 1000,
    backoffStrategy: 'linear' as const,
  },

  // Network operations (API calls, data fetching)
  NETWORK: {
    maxRetries: 5,
    baseDelay: 200,
    maxDelay: 2000,
    backoffStrategy: 'exponential' as const,
  },

  // Critical operations (authentication, payments)
  CRITICAL: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 5000,
    backoffStrategy: 'exponential' as const,
  },

  // Background operations (notifications, cleanup)
  BACKGROUND: {
    maxRetries: 2,
    baseDelay: 1000,
    maxDelay: 5000,
    backoffStrategy: 'linear' as const,
  },
} as const;

/**
 * Retry condition functions for different error types
 */
export const RETRY_CONDITIONS = {
  // Only retry on network-related errors
  NETWORK_ONLY: (error: Error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('network') ||
      message.includes('timeout') ||
      message.includes('fetch') ||
      message.includes('connection')
    );
  },

  // Retry on temporary errors (rate limits, temporary failures)
  TEMPORARY_ONLY: (error: Error) => {
    const message = error.message.toLowerCase();
    return (
      message.includes('rate limit') ||
      message.includes('temporary') ||
      message.includes('busy') ||
      message.includes('unavailable')
    );
  },

  // Retry on both network and temporary errors
  NETWORK_AND_TEMPORARY: (error: Error) => {
    return (
      RETRY_CONDITIONS.NETWORK_ONLY(error) ||
      RETRY_CONDITIONS.TEMPORARY_ONLY(error)
    );
  },

  // Retry on all errors (use with caution)
  ALL: () => true,

  // Never retry (for testing or specific cases)
  NONE: () => false,
} as const;

/**
 * Predefined retry configurations for common use cases
 */
export const RETRY_PRESETS = {
  // UI operations that should be fast
  UI_OPERATION: {
    ...RETRY_CONFIG.QUICK,
    retryCondition: RETRY_CONDITIONS.NETWORK_ONLY,
  },

  // Data fetching operations
  DATA_FETCH: {
    ...RETRY_CONFIG.STANDARD,
    retryCondition: RETRY_CONDITIONS.NETWORK_AND_TEMPORARY,
  },

  // API calls
  API_CALL: {
    ...RETRY_CONFIG.NETWORK,
    retryCondition: RETRY_CONDITIONS.NETWORK_AND_TEMPORARY,
  },

  // Authentication operations
  AUTH: {
    ...RETRY_CONFIG.CRITICAL,
    retryCondition: RETRY_CONDITIONS.NETWORK_AND_TEMPORARY,
  },

  // Background tasks
  BACKGROUND_TASK: {
    ...RETRY_CONFIG.BACKGROUND,
    retryCondition: RETRY_CONDITIONS.ALL,
  },
} as const;

/**
 * Background sync configuration
 */
export const BACKGROUND_SYNC_CONFIG = {
  ...RETRY_CONFIG.BACKGROUND,
  retryCondition: RETRY_CONDITIONS.NETWORK_AND_TEMPORARY,
  syncInterval: 30000, // 30 seconds
  maxConcurrentSyncs: 3,
} as const;
