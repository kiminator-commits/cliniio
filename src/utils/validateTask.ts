/**
 * Task input validation utilities
 */

export const isValidTaskInput = (taskId: string, points?: number): boolean => {
  // Validate taskId
  if (typeof taskId !== 'string' || taskId.trim() === '') {
    return false;
  }

  // Validate points if provided
  if (points !== undefined) {
    if (typeof points !== 'number' || isNaN(points) || points < 0) {
      return false;
    }
  }

  return true;
};

// Re-export the type guard from the centralized location
export { isTask } from './typeGuards';
