import React, { useMemo, useEffect } from 'react';
import { GamificationStats } from '../../../components/Dashboard/GamificationStats';
import { TASK_DEFAULTS } from '../../../constants/taskConstants';
import { useCumulativeStats } from '../../../hooks/useCumulativeStats';
import { useHomeStore } from '../../../store/homeStore';

interface HomeGamificationSectionProps {
  gamificationData: {
    streak?: number;
    level?: number;
    rank?: number;
    totalScore?: number;
  };
}

const HomeGamificationSection: React.FC<HomeGamificationSectionProps> =
  React.memo(({ gamificationData }) => {
    // Get real stats data from the service
    const { stats: cumulativeStats, loading: statsLoading } =
      useCumulativeStats();
    const { updateGamificationData } = useHomeStore();

    // Hardened loading check with comprehensive validation
    const isValidData =
      gamificationData &&
      typeof gamificationData.streak === 'number' &&
      typeof gamificationData.level === 'number' &&
      typeof gamificationData.rank === 'number' &&
      typeof gamificationData.totalScore === 'number' &&
      gamificationData.streak >= 0 &&
      gamificationData.level >= 1 &&
      gamificationData.rank >= 1 &&
      gamificationData.totalScore >= 0;

    const isLoading = !isValidData || statsLoading;

    // Memoize the gamification data object with hardened fallbacks
    const memoizedGamificationData = useMemo(() => {
      // Safe extraction with fallbacks
      const safeStreak = Math.max(0, gamificationData?.streak || 0);
      const safeLevel = Math.max(
        1,
        gamificationData?.level || TASK_DEFAULTS.DEFAULT_LEVEL
      );
      const safeRank = Math.max(
        1,
        gamificationData?.rank || TASK_DEFAULTS.DEFAULT_RANK
      );
      const safeTotalScore = Math.max(
        0,
        gamificationData?.totalScore || TASK_DEFAULTS.DEFAULT_SCORE
      );

      const data = {
        streak: safeStreak,
        level: safeLevel,
        rank: safeRank,
        totalScore: safeTotalScore,
        stats: {
          toolsSterilized: cumulativeStats.toolsSterilized || 0,
          inventoryChecks: cumulativeStats.inventoryChecks || 0,
          perfectDays: cumulativeStats.perfectDays || 0,
          totalTasks: cumulativeStats.totalTasks || 0,
          completedTasks: cumulativeStats.completedTasks || 0,
          currentStreak: cumulativeStats.currentStreak || safeStreak,
          bestStreak: cumulativeStats.bestStreak || 0,
        },
      };
      return data;
    }, [
      gamificationData?.streak,
      gamificationData?.level,
      gamificationData?.rank,
      gamificationData?.totalScore,
      cumulativeStats,
    ]);

    // Update the store with the complete gamification data including stats
    useEffect(() => {
      if (!isLoading && memoizedGamificationData) {
        updateGamificationData(memoizedGamificationData);
      }
    }, [memoizedGamificationData, isLoading, updateGamificationData]);

    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-2 mb-4 border-l-4 border-[#4ECDC4] border-opacity-50 mt-2">
          <div className="animate-pulse">
            <div className="flex items-center justify-between p-1">
              {/* Current Streak */}
              <div className="flex items-center p-1">
                <div className="p-2 bg-orange-100 rounded-full">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-2">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>

              {/* Level */}
              <div className="flex items-center p-1">
                <div className="p-2 bg-teal-100 rounded-full">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-2">
                  <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="flex items-baseline">
                    <div className="h-6 bg-gray-200 rounded w-8 mr-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>

              {/* Total Points */}
              <div className="flex items-center p-1 pl-8">
                <div className="p-2 bg-teal-100 rounded-full">
                  <div className="w-5 h-5 bg-gray-200 rounded"></div>
                </div>
                <div className="ml-2">
                  <div className="h-4 bg-gray-200 rounded w-12 mb-1"></div>
                  <div className="h-6 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return <GamificationStats gamificationData={memoizedGamificationData} />;
  });

HomeGamificationSection.displayName = 'HomeGamificationSection';

export default HomeGamificationSection;
