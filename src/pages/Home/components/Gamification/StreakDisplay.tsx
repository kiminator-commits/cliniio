import React from 'react';

type Props = {
  streakCount: number;
};

export const StreakDisplay = ({ streakCount }: Props) => {
  // Hardened value with bounds checking
  const safeStreakCount = Math.max(0, streakCount || 0);

  return (
    <div className="text-sm text-orange-500 font-medium">
      🔥 {safeStreakCount}-day streak
    </div>
  );
};
