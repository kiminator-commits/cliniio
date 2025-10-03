/**
 * Hook for cache warming integration
 * Provides cache warming functionality for React components
 */

import { useEffect, useCallback } from 'react';
import { cacheWarmingService } from '../services/cache/cacheWarmingCompatibility';
import { cacheInvalidationService } from '../services/cache/cacheInvalidationCompatibility';

export interface UseCacheWarmingOptions {
  warmOnMount?: boolean;
  warmOnUserAction?: boolean;
  backgroundRefresh?: boolean;
  refreshInterval?: number;
}

export const useCacheWarming = (options: UseCacheWarmingOptions = {}) => {
  const {
    warmOnMount = true,
    warmOnUserAction = true,
    backgroundRefresh = true,
    refreshInterval = 10 * 60 * 1000, // 10 minutes
  } = options;

  // Configure cache warming service
  useEffect(() => {
    cacheWarmingService.configure({
      warmOnAppStart: warmOnMount,
      warmOnUserAction,
      backgroundRefresh,
      refreshInterval,
    });

    // Cleanup on unmount
    return () => {
      cacheWarmingService.cleanup();
    };
  }, [warmOnMount, warmOnUserAction, backgroundRefresh, refreshInterval]);

  // Warm cache on mount
  useEffect(() => {
    if (warmOnMount) {
      cacheWarmingService.warmFrequentlyAccessedData();
    }
  }, [warmOnMount]);

  // Warm cache on user action
  const warmOnAction = useCallback(
    (action: string) => {
      if (warmOnUserAction) {
        cacheWarmingService.warmOnUserAction(action);
      }
    },
    [warmOnUserAction]
  );

  // Invalidate cache
  const invalidateCache = useCallback(
    (operation: string, entityId?: string) => {
      cacheInvalidationService.invalidateRelated(operation, entityId);
    },
    []
  );

  // Get warming status
  const getStatus = useCallback(() => {
    return cacheWarmingService.getStatus();
  }, []);

  return {
    warmOnAction,
    invalidateCache,
    getStatus,
    warmFrequentlyAccessedData:
      cacheWarmingService.warmFrequentlyAccessedData.bind(cacheWarmingService),
  };
};
