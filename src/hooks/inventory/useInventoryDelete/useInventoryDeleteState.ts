import { useCallback } from 'react';
import { useAuditLogger } from '../../../utils/auditLogger';

interface DeleteState {
  isLoading: boolean;
  error: string | null;
  lastOperation: 'delete' | null;
  operationTimestamp: Date | null;
  itemsBeingDeleted: Set<string>;
  deletedItems: Set<string>;
}

/**
 * Custom hook that manages delete state updates and audit logging.
 * Provides centralized state management and logging for delete operations.
 */
export const useInventoryDeleteState = (
  setState: React.Dispatch<React.SetStateAction<DeleteState>>,
  logAuditEvent: ReturnType<typeof useAuditLogger>['logAuditEvent']
) => {
  const updateState = useCallback(
    (updates: Partial<DeleteState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    [setState]
  );

  const logOperation = useCallback(
    async (operation: string, details: Record<string, unknown>) => {
      try {
        await logAuditEvent('inventory_delete', {
          operation,
          details,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.warn('Failed to log audit event:', error);
      }
    },
    [logAuditEvent]
  );

  return { updateState, logOperation };
};
