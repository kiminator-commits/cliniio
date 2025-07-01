import React from 'react';

type Props = {
  points: number;
};

export const PointsDisplay = ({ points }: Props) => {
  return <div className="text-xl font-bold">{points} pts</div>;
};
