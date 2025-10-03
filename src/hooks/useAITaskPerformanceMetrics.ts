import { useState, useEffect, useCallback } from 'react';
import {
  aiTaskPerformanceService,
  PerformanceUpdate,
} from '../services/aiTaskPerformanceService';

export const useAITaskPerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceUpdate>({
    timeSaved: { daily: 0, monthly: 0 },
    costSavings: { monthly: 0, annual: 0 },
    aiEfficiency: { timeSavings: 0, proactiveMgmt: 0 },
    teamPerformance: { skills: 0, inventory: 0, sterilization: 0 },
    gamificationStats: {
      totalTasks: 0,
      completedTasks: 0,
      perfectDays: 0,
      currentStreak: 0,
      bestStreak: 0,
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch current performance metrics
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const currentMetrics =
        await aiTaskPerformanceService.getCurrentPerformanceMetrics();
      setMetrics(currentMetrics);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to fetch performance metrics';
      setError(errorMessage);
      console.error('Error fetching AI task performance metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh metrics (useful after task completion)
  const refreshMetrics = useCallback(async () => {
    await fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh metrics every 5 minutes
  useEffect(() => {
    fetchMetrics();

    const interval = setInterval(fetchMetrics, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refreshMetrics,
    fetchMetrics,
  };
};
