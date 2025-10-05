import { useState, useEffect } from 'react';
import { statsService } from '../services/statsService';

export interface HomeGamificationData {
  totalScore: number;
  level: number;
  streak: number;
  rank: number;
  stats: {
    toolsSterilized: number;
    inventoryChecks: number;
    perfectDays: number;
    totalTasks: number;
    completedTasks: number;
    currentStreak: number;
    bestStreak: number;
  };
}

export const useHomeGamification = () => {
  const [gamificationData, setGamificationData] =
    useState<HomeGamificationData>({
      totalScore: 0,
      level: 1,
      streak: 0,
      rank: 1,
      stats: {
        toolsSterilized: 0,
        inventoryChecks: 0,
        perfectDays: 0,
        totalTasks: 0,
        completedTasks: 0,
        currentStreak: 0,
        bestStreak: 0,
      },
    });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log(
        '🎮 useHomeGamification: Starting to fetch cumulative stats...'
      );
      const cumulativeStats = await statsService.fetchCumulativeStats();
      console.log(
        '🎮 useHomeGamification: Received cumulative stats:',
        cumulativeStats
      );

      // Use enhanced leveling system if available, fallback to basic calculation
      let level: number;
      let rank: number;

      if (cumulativeStats.enhancedLevel) {
        level = cumulativeStats.enhancedLevel.coreLevel as number;
        rank = cumulativeStats.enhancedLevel.rank as number;
      } else {
        // Fallback to basic level calculation
        level = Math.max(1, Math.floor(cumulativeStats.totalPoints / 100) + 1);
        rank = Math.max(
          1,
          Math.min(100, Math.floor(100 - cumulativeStats.totalPoints / 10))
        );
      }

      const homeGamificationData: HomeGamificationData = {
        totalScore: cumulativeStats.totalPoints,
        level,
        streak: cumulativeStats.currentStreak,
        rank,
        stats: {
          toolsSterilized: cumulativeStats.toolsSterilized,
          inventoryChecks: cumulativeStats.inventoryChecks,
          perfectDays: cumulativeStats.perfectDays,
          totalTasks: cumulativeStats.totalTasks,
          completedTasks: cumulativeStats.completedTasks,
          currentStreak: cumulativeStats.currentStreak,
          bestStreak: cumulativeStats.bestStreak,
        },
      };

      console.log(
        '🎮 useHomeGamification: Final gamification data:',
        homeGamificationData
      );
      setGamificationData(homeGamificationData);
    } catch (err) {
      console.error('❌ Error fetching gamification data:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch gamification data'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const refreshGamificationData = () => {
    fetchGamificationData();
  };

  return {
    gamificationData,
    loading,
    error,
    refreshGamificationData,
  };
};
