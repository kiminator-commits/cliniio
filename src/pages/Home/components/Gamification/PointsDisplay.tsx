import React from 'react';

type Props = {
  points: number;
};

export const PointsDisplay = ({ points }: Props) => {
  // Hardened value with bounds checking
  const safePoints = Math.max(0, points || 0);

  return <div className="text-xl font-bold text-[#4ECDC4]">{safePoints}</div>;
};
