import { useState, useEffect } from 'react';
import {
  leaderboardService,
  LeaderboardData,
} from '../services/leaderboardService';

export const useLeaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({
    id: '',
    user_id: '',
    facility_id: '',
    points: 0,
    rank: 1,
    user_name: '',
    department: '',
    created_at: '',
    updated_at: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await leaderboardService.fetchLeaderboardData();
      setLeaderboardData(data as unknown as LeaderboardData);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch leaderboard'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  return {
    leaderboardData,
    loading,
    error,
    refreshLeaderboard: fetchLeaderboard,
  };
};
