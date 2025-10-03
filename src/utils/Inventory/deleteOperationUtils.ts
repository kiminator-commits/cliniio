import { InventoryItem } from '../../types/inventory';

/**
 * Utility functions for inventory delete operations.
 * Extracts complex business logic to improve readability and testability.
 */

/**
 * Validates if an item exists and can be deleted.
 * Provides clear error messages for different failure scenarios.
 */
export const validateItemForDeletion = (
  item: InventoryItem | undefined,
  itemId: string
): { isValid: boolean; error?: string } => {
  if (!item) {
    return {
      isValid: false,
      error: `Item with id ${itemId} not found`,
    };
  }

  if (item.status === 'deleted') {
    return {
      isValid: false,
      error: `Item ${item.name} is already deleted`,
    };
  }

  if (item.status === 'in_use') {
    return {
      isValid: false,
      error: `Cannot delete item ${item.name} while it is in use`,
    };
  }

  return { isValid: true };
};

/**
 * Creates a soft-deleted version of an item.
 * Maintains item data while marking it as deleted.
 */
export const createSoftDeletedItem = (item: InventoryItem): InventoryItem => {
  return {
    ...item,
    status: 'deleted',
    // Preserve original data for potential restoration
    data: {
      ...item.data,
      deletedAt: new Date().toISOString(),
      originalStatus: item.status,
    },
  };
};

/**
 * Restores a soft-deleted item to its original state.
 * Reverts status and removes deletion metadata.
 */
export const createRestoredItem = (
  item: InventoryItem & { data?: { originalStatus?: string } }
): InventoryItem => {
  const originalStatus = item.data?.originalStatus;
  return {
    ...item,
    status: originalStatus || 'available',
    data: {
      ...item.data,
      restoredAt: new Date().toISOString(),
    },
  };
};

/**
 * Calculates delete operation progress metrics.
 * Provides detailed progress information for bulk operations.
 */
export const calculateDeleteProgress = (
  totalItems: number,
  completedItems: number,
  failedItems: number
): {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  successRate: number;
} => {
  const inProgress = totalItems - completedItems - failedItems;
  const successRate = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  return {
    total: totalItems,
    completed: completedItems,
    failed: failedItems,
    inProgress: Math.max(0, inProgress),
    successRate: Math.round(successRate * 100) / 100,
  };
};

/**
 * Formats error messages for delete operations.
 * Provides consistent error formatting across different operation types.
 */
export const formatDeleteErrorMessage = (
  operation: string,
  itemId: string,
  originalError: string
): string => {
  const operationMap = {
    delete: 'delete',
    soft_delete: 'soft delete',
    restore: 'restore',
    bulk_delete: 'bulk delete',
    bulk_soft_delete: 'bulk soft delete',
    bulk_restore: 'bulk restore',
  };

  const operationName =
    operationMap[operation as keyof typeof operationMap] || operation;
  return `Failed to ${operationName} item ${itemId}: ${originalError}`;
};

/**
 * Determines if a delete operation should be retried.
 * Implements retry logic based on error type and operation context.
 */
export const shouldRetryDeleteOperation = (
  error: Error,
  attemptCount: number,
  maxRetries: number = 3
): boolean => {
  if (attemptCount >= maxRetries) {
    return false;
  }

  // Retry on network errors and temporary database issues
  const retryableErrors = [
    'network',
    'timeout',
    'connection',
    'temporary',
    'rate limit',
    'service unavailable',
  ];

  const errorMessage = error.message.toLowerCase();
  return retryableErrors.some((retryableError) =>
    errorMessage.includes(retryableError)
  );
};
