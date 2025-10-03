import { useCallback } from 'react';

export interface LoginAnalyticsData {
  email: string;
  stage?: string;
  userId?: string;
  error?: string;
  userAgent: string;
  timestamp: string;
}

export interface DailyAnalytics {
  attempts: number;
  successes: number;
  failures: number;
}

export const useLoginAnalytics = () => {
  // Track login event
  const trackEvent = useCallback(
    (event: 'attempt' | 'success' | 'failure', data: LoginAnalyticsData) => {
      try {
        // In production, this would send to your analytics service
        // For now, we'll use localStorage to track basic metrics
        const analyticsKey = `login_analytics_${new Date().toISOString().split('T')[0]}`;
        const existingData = localStorage.getItem(analyticsKey);
        const analyticsData: DailyAnalytics = existingData
          ? JSON.parse(existingData)
          : {
              attempts: 0,
              successes: 0,
              failures: 0,
            };

        analyticsData[
          event === 'attempt'
            ? 'attempts'
            : event === 'success'
              ? 'successes'
              : 'failures'
        ]++;

        localStorage.setItem(analyticsKey, JSON.stringify(analyticsData));

        // Log analytics data
        console.info(`Login analytics updated:`, analyticsData);

        // Log detailed event
        console.info(`Login ${event}:`, {
          ...data,
          analytics: analyticsData,
        });
      } catch (error) {
        console.warn('Failed to track login analytics:', error);
      }
    },
    []
  );

  // Get daily analytics
  const getDailyAnalytics = useCallback((date?: string): DailyAnalytics => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const analyticsKey = `login_analytics_${targetDate}`;
      const existingData = localStorage.getItem(analyticsKey);

      if (existingData) {
        return JSON.parse(existingData);
      }

      return { attempts: 0, successes: 0, failures: 0 };
    } catch (error) {
      console.warn('Failed to get daily analytics:', error);
      return { attempts: 0, successes: 0, failures: 0 };
    }
  }, []);

  // Get analytics for a date range
  const getAnalyticsRange = useCallback(
    (startDate: string, endDate: string): DailyAnalytics[] => {
      try {
        const analytics: DailyAnalytics[] = [];
        const currentDate = new Date(startDate);
        const end = new Date(endDate);

        while (currentDate <= end) {
          const dateStr = currentDate.toISOString().split('T')[0];
          analytics.push(getDailyAnalytics(dateStr));
          currentDate.setDate(currentDate.getDate() + 1);
        }

        return analytics;
      } catch (error) {
        console.warn('Failed to get analytics range:', error);
        return [];
      }
    },
    [getDailyAnalytics]
  );

  // Clear analytics data
  const clearAnalytics = useCallback(() => {
    try {
      const keys = Object.keys(localStorage);
      const analyticsKeys = keys.filter((key) =>
        key.startsWith('login_analytics_')
      );

      analyticsKeys.forEach((key) => localStorage.removeItem(key));
      console.info('Login analytics cleared');
    } catch (error) {
      console.warn('Failed to clear analytics:', error);
    }
  }, []);

  return {
    trackEvent,
    getDailyAnalytics,
    getAnalyticsRange,
    clearAnalytics,
  };
};
