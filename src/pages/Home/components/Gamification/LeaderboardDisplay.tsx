import React from 'react';

type Leader = {
  name: string;
  points: number;
};

type Props = {
  leaders: Leader[];
};

export const LeaderboardDisplay = ({ leaders }: Props) => {
  return (
    <div className="space-y-1">
      {leaders.map((leader, index) => (
        <div key={index} className="flex justify-between text-sm text-gray-700">
          <span>{leader.name}</span>
          <span>{leader.points} pts</span>
        </div>
      ))}
    </div>
  );
};
