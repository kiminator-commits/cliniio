import React from 'react';

type Props = {
  percent: number;
};

export const ProgressDisplay = ({ percent }: Props) => {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div
        className="bg-green-500 h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percent}%` }}
      ></div>
    </div>
  );
};
