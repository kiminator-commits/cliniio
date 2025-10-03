/**
 * Simplified hook for cache warming integration
 * Removes unnecessary overhead while maintaining interface compatibility
 */

import { useCallback } from 'react';
import { simpleCacheWarmingService } from '../services/cache/SimpleCacheWarmingService';

export interface UseSimpleCacheWarmingOptions {
  warmOnMount?: boolean;
  warmOnUserAction?: boolean;
  backgroundRefresh?: boolean;
  refreshInterval?: number;
}

export const useSimpleCacheWarming = (
  options: UseSimpleCacheWarmingOptions = {}
) => {
  const {
    warmOnMount = false, // Disabled by default
    warmOnUserAction = false,
    backgroundRefresh = false,
    refreshInterval = 10 * 60 * 1000,
  } = options;

  // Configure cache warming service (simplified)
  const configureService = useCallback(() => {
    simpleCacheWarmingService.configure({
      warmOnAppStart: warmOnMount,
      warmOnUserAction,
      backgroundRefresh,
      refreshInterval,
    });
  }, [warmOnMount, warmOnUserAction, backgroundRefresh, refreshInterval]);

  // Warm cache on user action (simplified)
  const warmOnAction = useCallback(
    (action: string) => {
      if (warmOnUserAction) {
        simpleCacheWarmingService.warmOnUserAction(action);
      }
    },
    [warmOnUserAction]
  );

  // Get warming status
  const getStatus = useCallback(() => {
    return simpleCacheWarmingService.getStatus();
  }, []);

  // Initialize service configuration
  configureService();

  return {
    warmOnAction,
    getStatus,
    warmFrequentlyAccessedData:
      simpleCacheWarmingService.warmFrequentlyAccessedData.bind(
        simpleCacheWarmingService
      ),
  };
};
