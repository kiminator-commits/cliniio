import { useState, useEffect } from 'react';
import {
  availablePointsService,
  AvailablePointsData,
} from '../services/availablePointsService';

export const useAvailablePoints = () => {
  const [availablePointsData, setAvailablePointsData] =
    useState<AvailablePointsData>({
      totalAvailable: 250,
      pointsEarned: 0,
      pointsRemaining: 250,
      challengesCompleted: 0,
      totalChallenges: 0,
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailablePoints = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await availablePointsService.calculateAvailablePoints();
      setAvailablePointsData(data);
    } catch (err) {
      console.error('Error fetching available points:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch available points'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailablePoints();
  }, []);

  const refreshAvailablePoints = () => {
    fetchAvailablePoints();
  };

  return {
    availablePointsData,
    loading,
    error,
    refreshAvailablePoints,
  };
};
