// Logging configuration
export const LOGGING_CONFIG = {
  // Set to 'ERROR', 'WARN', 'INFO', 'DEBUG', or 'VERBOSE'
  // In production, this will default to 'INFO'
  // In development, this will default to 'DEBUG' unless overridden
  DEFAULT_LEVEL: 'INFO' as const,

  // Enable/disable specific log categories
  CATEGORIES: {
    PERFORMANCE: true, // Keep performance logs enabled
    SECURITY: true,
    AUDIT: true,
    REALTIME: false, // Disable verbose realtime logs
    USER_CONTEXT: false, // Disable user context logs
  },

  // Performance thresholds for logging
  PERFORMANCE_THRESHOLDS: {
    SLOW_MOUNT: 100, // ms
    SLOW_NAVIGATION: 100, // ms
    SLOW_AUTH: 50, // ms
    SLOW_DATA_FETCH: 200, // ms
  },
};

// Environment-specific overrides
if (import.meta.env.DEV) {
  // In development, you can override these settings
  // To reduce console noise, set to INFO level
  // LOGGING_CONFIG.DEFAULT_LEVEL = 'INFO';
  // To enable verbose logging for debugging, uncomment:
  // LOGGING_CONFIG.DEFAULT_LEVEL = 'DEBUG';
  // LOGGING_CONFIG.CATEGORIES.PERFORMANCE = true;
  // LOGGING_CONFIG.CATEGORIES.REALTIME = true;
}
