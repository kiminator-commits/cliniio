import React, { useMemo } from 'react';
import { GamificationStats } from '../../../components/Dashboard/GamificationStats';
import { useHomeGamification } from '../../../hooks/useHomeGamification';

export default function GamificationSection() {
  const { gamificationData, loading, error } = useHomeGamification();

  const statsData = useMemo(
    () => ({
      totalScore: gamificationData.totalScore,
      level: gamificationData.level,
      totalPoints: gamificationData.totalScore,
      streak: gamificationData.streak,
      rank: gamificationData.rank,
      stats: gamificationData.stats,
    }),
    [gamificationData]
  );

  // Show loading state if data is still loading
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-2 mb-4 border-l-4 border-[#4ECDC4] border-opacity-50 mt-2">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4ECDC4]"></div>
          <span className="ml-2 text-sm text-gray-500">Loading stats...</span>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-2 mb-4 border-l-4 border-red-400 border-opacity-50 mt-2">
        <div className="flex items-center justify-center py-4">
          <span className="text-sm text-red-500">
            Error loading stats: {error}
          </span>
        </div>
      </div>
    );
  }

  return <GamificationStats gamificationData={statsData} />;
}
