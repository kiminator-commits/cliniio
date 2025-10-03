import React from 'react';
import RoomStatusSummary from './ui/RoomStatusSummary';

const EnvironmentalCleanStatusPanel: React.FC = () => {
  return (
    <div className="flex-1">
      <RoomStatusSummary />
    </div>
  );
};

export default EnvironmentalCleanStatusPanel;
