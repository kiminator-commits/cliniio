import React from 'react';
import EnvironmentalCleanAnalytics from './EnvironmentalCleanAnalytics';
import EnvironmentalCleanRoomStatus from './EnvironmentalCleanRoomStatus';
import EnvironmentalCleanChecklists from './EnvironmentalCleanChecklists';

const EnvironmentalCleanDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <EnvironmentalCleanAnalytics />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EnvironmentalCleanRoomStatus />
        <EnvironmentalCleanChecklists />
      </div>
    </div>
  );
};

export default EnvironmentalCleanDashboard;
