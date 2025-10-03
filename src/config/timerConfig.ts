import { isDevelopment } from '@/lib/getEnv';

export const TIMER_CONFIG = {
  // Web Worker settings
  worker: {
    updateInterval: 100, // milliseconds between timer updates

    fallbackToMainThread: true,
    maxWorkers: 10, // Maximum number of concurrent workers
    workerTimeout: 300000, // 5 minutes - timeout for inactive workers
  },

  // Timer accuracy settings
  accuracy: {
    warningThreshold: 95, // Warn if accuracy drops below 95%
    criticalThreshold: 90, // Critical if accuracy drops below 90%
    measurementEnabled: isDevelopment(),
  },

  // Phase timer settings
  phase: {
    maxDuration: 7200, // Maximum phase duration in seconds (2 hours)
    minDuration: 1, // Minimum phase duration in seconds
    defaultUpdateInterval: 100, // Default update interval for phase timers
  },

  // Over-exposure settings (for bath phases)
  overExposure: {
    enabled: true,
    warningThreshold: 3600, // 1 hour - show warning
    criticalThreshold: 7200, // 2 hours - show critical alert
  },

  // UI settings
  ui: {
    showTimerErrors: true,
    showWorkerStats: isDevelopment(),
    progressBarUpdateInterval: 100, // How often to update progress bars
  },

  // Performance settings
  performance: {
    enableWorkerPooling: true, // Reuse workers when possible
    enableMemoryCleanup: true, // Clean up unused workers
    cleanupInterval: 60000, // Clean up every minute
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB max memory usage for workers
  },
} as const;

// Timer validation functions
export const validateTimerDuration = (duration: number): boolean => {
  return (
    duration >= TIMER_CONFIG.phase.minDuration &&
    duration <= TIMER_CONFIG.phase.maxDuration
  );
};

export const validateTimerInterval = (interval: number): boolean => {
  return interval >= 10 && interval <= 1000; // Between 10ms and 1 second
};

// Timer utility functions
export const formatTimerDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const calculateTimerProgress = (
  elapsed: number,
  total: number
): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

// Timer error messages
export const TIMER_ERROR_MESSAGES = {
  WORKER_NOT_SUPPORTED: 'Web Workers not supported in this browser',
  WORKER_CREATION_FAILED: 'Failed to create timer worker',
  WORKER_MESSAGE_ERROR: 'Timer worker communication error',
  INVALID_DURATION: 'Invalid timer duration',
  INVALID_INTERVAL: 'Invalid timer interval',
  MEMORY_LIMIT_EXCEEDED: 'Timer memory limit exceeded',
  WORKER_TIMEOUT: 'Timer worker timeout',
} as const;

// Timer event types
export const TIMER_EVENTS = {
  START: 'START',
  PAUSE: 'PAUSE',
  RESET: 'RESET',
  UPDATE: 'UPDATE',
  TICK: 'TICK',
  COMPLETE: 'COMPLETE',
  STATE_UPDATE: 'STATE_UPDATE',
  ERROR: 'ERROR',
} as const;
