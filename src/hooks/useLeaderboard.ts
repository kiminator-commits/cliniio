import { useState, useEffect, useCallback } from 'react';
import {
  leaderboardService,
  LeaderboardData,
} from '../services/leaderboardService';
import { useFacility } from '../contexts/FacilityContext';

export const useLeaderboard = () => {
  const { getCurrentFacilityId } = useFacility();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const facilityId = getCurrentFacilityId();
      const data = await leaderboardService.fetchLeaderboardData(facilityId || undefined);
      setLeaderboardData(data);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      );
    } finally {
      setLoading(false);
    }
  }, [getCurrentFacilityId]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  return {
    leaderboardData,
    loading,
    error,
    refreshLeaderboard: fetchLeaderboard,
  };
};
