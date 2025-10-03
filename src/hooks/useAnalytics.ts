import { useState, useEffect, useCallback } from 'react';
import {
  AnalyticsDataService,
  AnalyticsFilters,
  SterilizationAnalyticsData,
  InventoryAnalyticsData,
  EnvironmentalAnalyticsData,
  UserEngagementData,
} from '../services/analytics';

export interface AnalyticsData {
  sterilization: SterilizationAnalyticsData | null;
  inventory: InventoryAnalyticsData | null;
  environmental: EnvironmentalAnalyticsData | null;
  userEngagement: UserEngagementData | null;
}

export interface AnalyticsState {
  data: AnalyticsData;
  loading: boolean;
  error: string | null;
  updated_at: string | null;
}

/**
 * Hook for fetching analytics data for forecasting intelligence
 * (Not for operational dashboard display)
 */
export const useAnalytics = (filters: AnalyticsFilters = {}) => {
  const [state, setState] = useState<AnalyticsState>({
    data: {
      sterilization: null,
      inventory: null,
      environmental: null,
      userEngagement: null,
    },
    loading: false,
    error: null,
    updated_at: null,
  });

  const fetchAnalytics = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const analyticsService = AnalyticsDataService.getInstance();
      const allData = await analyticsService.getAllAnalytics(filters);

      setState({
        data: allData,
        loading: false,
        error: null,
        updated_at: new Date().toISOString(),
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch forecasting data',
      }));
    }
  }, [filters]);

  const refreshData = useCallback(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const clearCache = useCallback(() => {
    const analyticsService = AnalyticsDataService.getInstance();
    analyticsService.clearCache();
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return {
    ...state,
    refreshData,
    clearCache,
  };
};

export default useAnalytics;
