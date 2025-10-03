import { useState, useEffect, useCallback } from 'react';

import { CleaningAnalytics } from '../models';
import { EnvironmentalCleanService } from '../services/EnvironmentalCleanService';

export interface UseEnvironmentalCleanAnalyticsResult {
  analytics: CleaningAnalytics;
  isLoading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
}

export function useEnvironmentalCleanAnalytics(): UseEnvironmentalCleanAnalyticsResult {
  const [analytics, setAnalytics] = useState<CleaningAnalytics>({
    totalRooms: 0,
    cleanRooms: 0,
    dirtyRooms: 0,
    inProgressRooms: 0,
    cleaningEfficiency: 0,
    averageCleaningTime: 0,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await EnvironmentalCleanService.fetchAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error('Error fetching analytics:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async () => {
    await fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Set up real-time subscription to refresh analytics when data changes
  // Temporarily disabled to fix production issues
  /*
  useEffect(() => {
    if (!supabase || typeof supabase.channel !== 'function') {
      console.warn('⚠️ Supabase client not properly initialized, skipping analytics subscription');
      return;
    }

    const channel = supabase
      .channel('environmental_cleans_analytics')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'environmental_cleans_enhanced',
        },
        () => {
          // Refresh analytics when any change occurs
          fetchAnalytics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAnalytics]);
  */

  return {
    analytics,
    isLoading,
    error,
    refreshAnalytics,
  };
}
