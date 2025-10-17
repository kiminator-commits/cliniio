/**
 * Hook for background cache refresh
 * Provides automatic cache refresh functionality
 */

import { useEffect, useRef } from 'react';
import { cacheWarmingService } from '../services/cache/cacheWarmingCompatibility';

export interface UseBackgroundCacheRefreshOptions {
  enabled?: boolean;
  interval?: number; // in milliseconds
  onRefresh?: () => void;
  onError?: (error: Error) => void;
}

export const useBackgroundCacheRefresh = (
  options: UseBackgroundCacheRefreshOptions = {}
) => {
  const {
    enabled = true,
    interval = 10 * 60 * 1000, // 10 minutes
    onRefresh,
    onError,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) {
      return () => {}; // Return empty cleanup function
    }

    const performRefresh = async () => {
      try {
        await cacheWarmingService.warmFrequentlyAccessedData();
        onRefresh?.();
      } catch (error) {
        console.warn('Background cache refresh failed:', error);
        onError?.(error as Error);
      }
    };

    // Start background refresh
    intervalRef.current = setInterval(performRefresh, interval);

    // Perform initial refresh
    performRefresh();

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, interval, onRefresh, onError]);

  return {
    isActive: intervalRef.current !== null,
  };
};
