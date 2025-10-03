import { useCallback } from 'react';
import { logger } from '../utils/logger';

export const useErrorHandler = () => {
  function getErrorMessage(error: unknown, context: string): string {
    // basic matching logic here
    if (context.includes('task')) {
      if (context.includes('load') || context.includes('fetch')) {
        return 'Failed to load tasks. Please check your internet connection.';
      }
      if (context.includes('complete') || context.includes('update')) {
        return 'Task completion failed. Try again or contact support.';
      }
      return 'Task operation failed. Please try again.';
    }

    if (context.includes('network') || context.includes('connection')) {
      return 'Network error. Please check your internet connection.';
    }

    if (context.includes('validation') || context.includes('input')) {
      return 'Invalid input provided. Please check your data and try again.';
    }

    // Fallback message
    return 'An unexpected error occurred. Please try again.';
  }

  const handleError = useCallback(
    (error: unknown, context: string, retryFn?: () => void): void => {
      // Log the error with context
      logger.error(`Error in ${context}:`, error);

      if (retryFn) {
        const shouldRetry = confirm(
          getErrorMessage(error, context) + '\n\nWould you like to try again?'
        );
        if (shouldRetry) retryFn();
      } else {
        // Show context-specific alert
        alert(getErrorMessage(error, context));
      }
    },
    []
  );

  return { handleError };
};
