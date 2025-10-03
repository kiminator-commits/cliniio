import { PerformanceUpdate } from '@/types/aiTaskPerformanceTypes';

/**
 * Log error with context and re-throw
 */
export function logAndRethrowError(context: string, error: unknown): never {
  console.error(`${context}:`, error);
  throw error;
}

/**
 * Log error with context and return fallback value
 */
export function logErrorAndReturnFallback<T>(
  context: string, 
  error: unknown, 
  fallback: T
): T {
  console.error(`${context}:`, error);
  return fallback;
}

/**
 * Get default performance update fallback
 */
export function getDefaultPerformanceUpdate(): PerformanceUpdate {
  return {
    timeSaved: { daily: 0, monthly: 0 },
    costSavings: { monthly: 0, annual: 0 },
    aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
    teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
    gamificationStats: {
      totalTasks: 0,
      completedTasks: 0,
      perfectDays: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  };
}

/**
 * Handle task completion errors
 */
export function handleTaskCompletionError(error: unknown): never {
  return logAndRethrowError('Error recording task completion', error);
}

/**
 * Handle performance metrics errors
 */
export function handlePerformanceMetricsError(error: unknown): PerformanceUpdate {
  return logErrorAndReturnFallback('Error getting performance metrics', error, getDefaultPerformanceUpdate());
}

/**
 * Handle facility ID errors
 */
export function handleFacilityIdError(error: unknown): never {
  return logAndRethrowError('Failed to get current facility ID', error);
}

/**
 * Handle performance update errors
 */
export function handlePerformanceUpdateError(error: unknown): void {
  logErrorAndReturnFallback('Error updating performance metrics', error, undefined);
}
