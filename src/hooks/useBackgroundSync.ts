import { useEffect, useRef, useCallback } from 'react';
import { BACKGROUND_SYNC_CONFIG } from '../constants/retryConfig';

interface UseBackgroundSyncProps {
  isReady: boolean;
  isLoading: boolean;
  onError: (error: string) => void;
}

export const useBackgroundSync = ({
  isReady,
  isLoading,
  onError,
}: UseBackgroundSyncProps) => {
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const retryAttemptsRef = useRef(0);

  // Auto-retry mechanism for non-critical errors
  const attemptBackgroundSync = useCallback(async () => {
    try {
      // Check if user is authenticated before attempting sync
      const authToken = localStorage.getItem('authToken');
      const currentUser = localStorage.getItem('currentUser');

      if (!authToken || !currentUser) {
        console.log('Background sync skipped: No authentication data');
        return;
      }

      // Simulate background sync operations (task refresh, metrics update)
      // These are non-critical operations that can fail silently
      console.log('Attempting background sync...');

      // In a real implementation, this would be actual API calls
      // For now, we'll simulate a successful sync operation

      // Reset retry attempts on successful operation
      retryAttemptsRef.current = 0;
    } catch (error) {
      console.warn('Background sync failed:', error);

      // Increment retry attempts
      retryAttemptsRef.current += 1;

      // Only retry if we haven't exceeded max attempts
      if (retryAttemptsRef.current < BACKGROUND_SYNC_CONFIG.maxRetries) {
        console.log(
          `Retrying background sync in ${BACKGROUND_SYNC_CONFIG.baseDelay}ms (attempt ${retryAttemptsRef.current}/${BACKGROUND_SYNC_CONFIG.maxRetries})`
        );

        retryTimeoutRef.current = setTimeout(() => {
          attemptBackgroundSync();
        }, BACKGROUND_SYNC_CONFIG.baseDelay);
      } else {
        console.error('Background sync failed after all retry attempts');
        // Only set error state if all retries fail
        onError('Background sync failed after all retry attempts');
      }
    }
  }, [onError]);

  useEffect(() => {
    // Start background sync when component mounts
    if (isReady && !isLoading) {
      attemptBackgroundSync();
    }

    // Cleanup timeout on unmount or state change
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
        retryTimeoutRef.current = null;
      }
      retryAttemptsRef.current = 0;
    };
  }, [isReady, isLoading, attemptBackgroundSync]);

  return { attemptBackgroundSync };
};
