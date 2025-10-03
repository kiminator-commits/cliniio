import { useCallback, useRef } from 'react';
import { useErrorRecovery } from '../useErrorRecovery';

/**
 * Hook for inventory-specific error handling
 * Provides error recovery and retry mechanisms for inventory operations
 */
export const useInventoryErrorHandling = () => {
  const { handleError, resetError: clearRecoveryError } = useErrorRecovery();
  const lastOperationRef = useRef<{
    type: 'create' | 'update' | 'delete' | 'fetch';
    itemId?: string;
    data?: unknown;
  } | null>(null);

  // Reset error state
  const resetError = useCallback(() => {
    clearRecoveryError();
  }, [clearRecoveryError]);

  // Retry the last operation
  const retryLastOperation = useCallback(async () => {
    if (!lastOperationRef.current) {
      console.warn('No last operation to retry');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const _ = lastOperationRef.current;

    try {
      // This is a placeholder implementation
      // In a real app, you would call the actual operation functions
      // You would typically call the appropriate operation here:
      // switch (type) {
      //   case 'create':
      //     await createItem(data);
      //     break;
      //   case 'update':
      //     await updateItem(itemId!, data);
      //     break;
      //   case 'delete':
      //     await deleteItem(itemId!);
      //     break;
      //   case 'fetch':
      //     await fetchData();
      //     break;
      // }
    } catch (error) {
      console.error('Failed to retry last operation:', error);
      handleError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [handleError]);

  // Set the last operation for retry purposes
  const setLastOperation = useCallback(
    (
      type: 'create' | 'update' | 'delete' | 'fetch',
      itemId?: string,
      data?: unknown
    ) => {
      lastOperationRef.current = { type, itemId, data };
    },
    []
  );

  // Handle inventory-specific errors
  const handleInventoryError = useCallback(
    (error: Error | string, context?: string) => {
      const errorMessage = error instanceof Error ? error.message : error;
      const fullMessage = context
        ? `${context}: ${errorMessage}`
        : errorMessage;

      console.error('Inventory error:', fullMessage);
      handleError(fullMessage);
    },
    [handleError]
  );

  // Check if an error is retryable
  const isRetryableError = useCallback((error: Error | string): boolean => {
    const errorMessage = error instanceof Error ? error.message : error;

    // Network errors are typically retryable
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return true;
    }

    // Server errors (5xx) are retryable
    if (
      errorMessage.includes('500') ||
      errorMessage.includes('502') ||
      errorMessage.includes('503')
    ) {
      return true;
    }

    // Validation errors are not retryable
    if (
      errorMessage.includes('validation') ||
      errorMessage.includes('invalid')
    ) {
      return false;
    }

    // Permission errors are not retryable
    if (
      errorMessage.includes('permission') ||
      errorMessage.includes('unauthorized')
    ) {
      return false;
    }

    return false;
  }, []);

  // Get error recovery suggestions
  const getErrorRecoverySuggestions = useCallback(
    (error: Error | string): string[] => {
      const errorMessage = error instanceof Error ? error.message : error;
      const suggestions: string[] = [];

      if (errorMessage.includes('network')) {
        suggestions.push('Check your internet connection');
        suggestions.push('Try refreshing the page');
      }

      if (errorMessage.includes('timeout')) {
        suggestions.push('The operation is taking longer than expected');
        suggestions.push('Try again in a few moments');
      }

      if (errorMessage.includes('validation')) {
        suggestions.push('Please check the input data');
        suggestions.push('Ensure all required fields are filled');
      }

      if (errorMessage.includes('permission')) {
        suggestions.push('You may not have permission to perform this action');
        suggestions.push('Contact your administrator');
      }

      if (suggestions.length === 0) {
        suggestions.push('Try refreshing the page');
        suggestions.push('Contact support if the problem persists');
      }

      return suggestions;
    },
    []
  );

  return {
    // Error state management
    resetError,
    clearError: resetError, // Alias for resetError

    // Retry functionality
    retryLastOperation,
    setLastOperation,

    // Error handling
    handleInventoryError,
    isRetryableError,
    getErrorRecoverySuggestions,

    // Legacy compatibility
    handleError,
  };
};
