import React, { useMemo } from 'react';
import { GamificationStats } from '../../../components/Dashboard/GamificationStats';
import { TASK_DEFAULTS } from '../../../constants/taskConstants';

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
    // Check if gamification data is available
    const isLoading =
      !gamificationData || Object.keys(gamificationData).length === 0;

    // Memoize the gamification data object to prevent unnecessary re-renders
    const memoizedGamificationData = useMemo(
      () => ({
        streak: gamificationData?.streak,
        level: gamificationData?.level || TASK_DEFAULTS.DEFAULT_LEVEL,
        rank: gamificationData?.rank || TASK_DEFAULTS.DEFAULT_RANK,
        totalScore: gamificationData?.totalScore || TASK_DEFAULTS.DEFAULT_SCORE,
        stats: {
          toolsSterilized: TASK_DEFAULTS.DEFAULT_SCORE,
          inventoryChecks: TASK_DEFAULTS.DEFAULT_SCORE,
          perfectDays: TASK_DEFAULTS.DEFAULT_SCORE,
          totalTasks: TASK_DEFAULTS.DEFAULT_SCORE,
          completedTasks: TASK_DEFAULTS.DEFAULT_SCORE,
          currentStreak: gamificationData?.streak,
          bestStreak: TASK_DEFAULTS.DEFAULT_SCORE,
        },
      }),
      [
        gamificationData?.streak,
        gamificationData?.level,
        gamificationData?.rank,
        gamificationData?.totalScore,
      ]
    );

    if (isLoading) {
      return (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="text-center">
                  <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-12 mx-auto"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return <GamificationStats gamificationData={memoizedGamificationData} />;
  });

HomeGamificationSection.displayName = 'HomeGamificationSection';

export default HomeGamificationSection;
