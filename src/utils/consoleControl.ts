/**
 * Console Control Utility
 * Provides easy ways to control console logging verbosity
 */

// Available log levels
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  VERBOSE: 4,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Set console log level dynamically
 * This affects the main logger utility
 */
export const setConsoleLogLevel = (level: LogLevel): void => {
  if (typeof window !== 'undefined') {
    // Store in localStorage for persistence
    localStorage.setItem('cliniio_log_level', level);

    // Update the logger if it exists
    if ((window as { cliniioLogger?: { setLevel: (level: LogLevel) => void } }).cliniioLogger) {
      (window as { cliniioLogger: { setLevel: (level: LogLevel) => void } }).cliniioLogger.setLevel(level);
    }

    console.log(`🔧 Console log level set to: ${level}`);
  }
};

/**
 * Get current console log level
 */
export const getConsoleLogLevel = (): LogLevel => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('cliniio_log_level') as LogLevel;
    if (stored && LOG_LEVELS[stored] !== undefined) {
      return stored;
    }
  }
  return 'WARN'; // Default
};

/**
 * Quick console control functions
 */
export const consoleControl = {
  // Set to minimal logging (errors and warnings only)
  quiet: () => setConsoleLogLevel('WARN'),

  // Set to normal logging (errors, warnings, and info)
  normal: () => setConsoleLogLevel('INFO'),

  // Set to verbose logging (everything)
  verbose: () => setConsoleLogLevel('DEBUG'),

  // Disable all console logging
  silent: () => {
    const originalConsole = { ...console };
    Object.keys(console).forEach((key) => {
      if (typeof console[key as keyof Console] === 'function') {
        (console as Record<string, unknown>)[key] = () => {};
      }
    });
    console.log(
      '🔇 Console logging disabled. Use consoleControl.restore() to re-enable.'
    );
    return originalConsole;
  },

  // Restore console logging
  restore: (originalConsole?: Record<string, unknown>) => {
    if (originalConsole) {
      Object.assign(console, originalConsole);
      console.log('🔊 Console logging restored.');
    }
  },

  // Show current log level
  status: () => {
    const level = getConsoleLogLevel();
    console.log(`📊 Current log level: ${level}`);
    return level;
  },
};

/**
 * Initialize console control
 * Call this early in your app to set up console control
 */
export const initializeConsoleControl = (): void => {
  if (typeof window !== 'undefined') {
    // Make console control available globally for easy access
    (window as { consoleControl: typeof consoleControl }).consoleControl = consoleControl;

    // Show current status
    console.log(
      '🎛️ Console control initialized. Use consoleControl.quiet(), consoleControl.normal(), or consoleControl.verbose() to adjust logging.'
    );
    consoleControl.status();
  }
};

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  initializeConsoleControl();
}
