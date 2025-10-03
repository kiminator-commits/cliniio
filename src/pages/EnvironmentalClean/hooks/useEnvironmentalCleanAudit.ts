import { useMutation } from '@tanstack/react-query';
import { auditLogger } from '@/utils/auditLogger';
import { RoomStatusType } from '../models';

// Define proper types for audit events
export interface EnvironmentalCleanAuditEvent {
  action: string;
  item?: Record<string, string | number | boolean | undefined>;
  operator?: string;
  roomId?: string;
  status?: RoomStatusType;
  metadata?: Record<string, string | number | boolean | undefined>;
}

// Define audit result types
export interface EnvironmentalCleanAuditResult {
  success: boolean;
  auditId?: string;
  timestamp?: string;
  error?: string;
}

// Define audit error types
export type EnvironmentalCleanAuditError = Error | string | null;

export function useEnvironmentalCleanAudit() {
  return useMutation<
    EnvironmentalCleanAuditResult,
    EnvironmentalCleanAuditError,
    EnvironmentalCleanAuditEvent
  >({
    mutationFn: async (auditEvent: EnvironmentalCleanAuditEvent) => {
      try {
        const timestamp = new Date().toISOString();
        const operator = auditEvent.operator || 'Unknown Operator';

        // Create comprehensive audit event
        const _fullAuditEvent = {
          ...auditEvent,
          timestamp,
          operator,
          module: 'environmental_clean',
          category: 'environmental_clean',
        };

        // Log to single audit system to prevent duplicates
        const auditPromises = [
          // 1. Console logging (development) - removed for performance

          // 2. Single audit logger utility (consolidated)
          Promise.resolve().then(() => {
            try {
              auditLogger.log('environmental_clean', auditEvent.action, {
                ...auditEvent.item,
                operator,
                roomId: auditEvent.roomId,
                status: auditEvent.status,
                metadata: auditEvent.metadata,
                timestamp,
              });
            } catch (error) {
              console.warn('Audit logger failed:', error);
            }
          }),
        ];

        // Don't wait for audit operations - make them non-blocking
        Promise.allSettled(auditPromises).catch(() => {
          // Silently handle any audit failures
        });

        // Generate audit ID for tracking
        const auditId = `EC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Success logging removed for performance

        return {
          success: true,
          auditId,
          timestamp,
        };
      } catch (error) {
        console.error('❌ Failed to log Environmental Clean audit:', error);

        // Even if audit fails, don't break the user experience
        // Log to console as fallback
        console.warn(
          '⚠️ Audit logging failed, using console fallback:',
          auditEvent
        );

        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown audit error',
        };
      }
    },
    // Retry configuration for audit failures
    retry: 2,
    retryDelay: 1000,
    // Don't show loading states for audit operations
    onMutate: () => {
      // Audit indicator removed for performance
    },
    onError: (error) => {
      console.error('❌ Environmental Clean audit failed:', error);
      // Don't show error to user for audit failures
    },
    onSuccess: (_data) => {
      // Success logging removed for performance
    },
  });
}
