import { useState, useEffect, useCallback } from 'react';
import {
  trackingAnalyticsService,
  TrackingAnalyticsSummary,
  TrackingAnalyticsEvent,
} from '../../services/analytics/trackingAnalyticsService';

export interface UseTrackingAnalyticsReturn {
  // Data
  analyticsSummary: TrackingAnalyticsSummary | null;
  isLoading: boolean;

  // Actions
  refreshAnalytics: () => void;
  getToolAnalytics: (toolId: string) => TrackingAnalyticsEvent[];
  getUserAnalytics: (doctorName: string) => TrackingAnalyticsEvent[];
  getAnalyticsForTimeRange: (
    start: Date,
    end: Date
  ) => TrackingAnalyticsSummary;

  // Utilities
  clearOldEvents: (olderThanDays?: number) => void;
}

export const useTrackingAnalytics = (): UseTrackingAnalyticsReturn => {
  const [analyticsSummary, setAnalyticsSummary] =
    useState<TrackingAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Refresh analytics data
  const refreshAnalytics = useCallback(() => {
    setIsLoading(true);
    try {
      const summary = trackingAnalyticsService.getAnalyticsSummary();
      setAnalyticsSummary(summary);
    } catch (error) {
      console.error('Failed to refresh analytics:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get analytics for a specific tool
  const getToolAnalytics = useCallback(
    (toolId: string): TrackingAnalyticsEvent[] => {
      return trackingAnalyticsService.getToolAnalytics(toolId);
    },
    []
  );

  // Get analytics for a specific user
  const getUserAnalytics = useCallback(
    (doctorName: string): TrackingAnalyticsEvent[] => {
      return trackingAnalyticsService.getUserAnalytics(doctorName);
    },
    []
  );

  // Get analytics for a specific time range
  const getAnalyticsForTimeRange = useCallback(
    (start: Date, end: Date): TrackingAnalyticsSummary => {
      return trackingAnalyticsService.getAnalyticsSummary({ start, end });
    },
    []
  );

  // Clear old events
  const clearOldEvents = useCallback(
    (olderThanDays: number = 30) => {
      trackingAnalyticsService.clearOldEvents(olderThanDays);
      refreshAnalytics(); // Refresh after clearing
    },
    [refreshAnalytics]
  );

  // Load initial data
  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analyticsSummary,
    isLoading,
    refreshAnalytics,
    getToolAnalytics,
    getUserAnalytics,
    getAnalyticsForTimeRange,
    clearOldEvents,
  };
};
