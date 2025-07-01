import React from 'react';

type Props = {
  streakCount: number;
};

export const StreakDisplay = ({ streakCount }: Props) => {
  return <div className="text-sm text-orange-500 font-medium">🔥 {streakCount}-day streak</div>;
};
