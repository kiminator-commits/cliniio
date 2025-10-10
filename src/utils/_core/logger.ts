// Logger utility to control console output verbosity
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

// Get log level from environment or default to INFO in production, DEBUG in development
const getLogLevel = (): LogLevel => {
  // Check if we're in production
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    return 'INFO';
  }

  // Handle environment variables
  let envLevel: LogLevel | undefined;
  if (typeof process !== 'undefined' && process?.env) {
    envLevel = (process.env.VITE_LOG_LEVEL as LogLevel) || 'DEBUG';
  }

  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel;
  }

  return 'DEBUG'; // Keep debug level to see all logs
};

const currentLogLevel = getLogLevel();

const shouldLog = (level: LogLevel): boolean => {
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLogLevel];
};

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (shouldLog('ERROR')) {
      console.error(message, ...args);
    }
  },

  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('WARN')) {
      console.warn(message, ...args);
    }
  },

  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('INFO')) {
      console.info(message, ...args);
    }
  },

  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('DEBUG')) {
      console.log(message, ...args);
    }
  },

  verbose: (message: string, ...args: unknown[]) => {
    if (shouldLog('VERBOSE')) {
      console.log(message, ...args);
    }
  },

  // Special methods for common patterns
  perf: (message: string, ...args: unknown[]) => {
    if (shouldLog('DEBUG')) {
      console.log(`[PERF] ${message}`, ...args);
    }
  },

  security: (message: string, ...args: unknown[]) => {
    if (shouldLog('INFO')) {
      console.log(`[SECURITY] ${message}`, ...args);
    }
  },

  audit: (message: string, ...args: unknown[]) => {
    if (shouldLog('INFO')) {
      console.log(`[AUDIT] ${message}`, ...args);
    }
  },

  realtime: (message: string, ...args: unknown[]) => {
    if (shouldLog('DEBUG')) {
      console.log(message, ...args);
    }
  },

  // Get current log level
  getLevel: () => currentLogLevel,

  // Check if specific level is enabled
  isEnabled: (level: LogLevel) => shouldLog(level),
};

export default logger;
