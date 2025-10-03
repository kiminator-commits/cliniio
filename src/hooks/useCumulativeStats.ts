import { useState, useEffect } from 'react';
import { statsService, CumulativeStats } from '../services/statsService';

export const useCumulativeStats = () => {
  const [stats, setStats] = useState<CumulativeStats>({
    toolsSterilized: 0,
    inventoryChecks: 0,
    perfectDays: 0,
    totalTasks: 0,
    completedTasks: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalPoints: 0,
    challengesCompleted: 0,
    totalChallenges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const cumulativeStats = await statsService.fetchCumulativeStats();
      setStats(cumulativeStats);
    } catch (err) {
      console.error('Error fetching cumulative stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refreshStats = () => {
    fetchStats();
  };

  return {
    stats,
    loading,
    error,
    refreshStats,
  };
};
