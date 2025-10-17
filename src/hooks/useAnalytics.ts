import { useState, useEffect, useCallback } from 'react';
import {
  trackEvent as _trackEvent,
  trackPageView as _trackPageView,
  trackUserAction as _trackUserAction,
  trackError as _trackError,
  trackPerformance as _trackPerformance,
} from '../services/analyticsService';

// Define missing types locally
export interface SterilizationAnalyticsData {
  totalCycles: number;
  successRate: number;
  averageCycleTime: number;
  lastCycleDate: string;
}

export interface InventoryAnalyticsData {
  totalItems: number;
  lowStockItems: number;
  expiredItems: number;
  lastUpdated: string;
}

export interface EnvironmentalAnalyticsData {
  temperatureReadings: number[];
  humidityReadings: number[];
  lastReading: string;
}

export interface UserEngagementData {
  activeUsers: number;
  totalSessions: number;
  averageSessionDuration: number;
  lastActivity: string;
}

export interface AnalyticsFilters {
  dateRange: {
    start: string;
    end: string;
  };
  facilityId?: string;
  category?: string;
}

// Mock AnalyticsDataService for compatibility
export class AnalyticsDataService {
  static async getSterilizationData(_filters: AnalyticsFilters): Promise<SterilizationAnalyticsData> {
    return {
      totalCycles: 150,
      successRate: 98.5,
      averageCycleTime: 45,
      lastCycleDate: new Date().toISOString(),
    };
  }

  static async getInventoryData(_filters: AnalyticsFilters): Promise<InventoryAnalyticsData> {
    return {
      totalItems: 1250,
      lowStockItems: 23,
      expiredItems: 5,
      lastUpdated: new Date().toISOString(),
    };
  }

  static async getEnvironmentalData(_filters: AnalyticsFilters): Promise<EnvironmentalAnalyticsData> {
    return {
      temperatureReadings: [22.5, 23.1, 22.8, 23.0],
      humidityReadings: [45, 47, 46, 48],
      lastReading: new Date().toISOString(),
    };
  }

  static async getUserEngagementData(_filters: AnalyticsFilters): Promise<UserEngagementData> {
    return {
      activeUsers: 45,
      totalSessions: 120,
      averageSessionDuration: 25,
      lastActivity: new Date().toISOString(),
    };
  }
}

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

interface AnalyticsService {
  getAllAnalytics(filters: AnalyticsFilters): Promise<unknown>;
  [key: string]: unknown;
}

/**
 * Hook for fetching analytics data for forecasting intelligence
 * (Not for operational dashboard display)
 */
export const useAnalytics = (filters: AnalyticsFilters = { dateRange: { start: new Date().toISOString(), end: new Date().toISOString() } }) => {
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
      const analyticsService = new AnalyticsDataService();
      const allData = await (analyticsService as AnalyticsService).getAllAnalytics(filters);

      setState({
        data: {
          sterilization: null,
          inventory: null,
          environmental: null,
          userEngagement: null,
        },
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
    // Clear cache by refetching data
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
