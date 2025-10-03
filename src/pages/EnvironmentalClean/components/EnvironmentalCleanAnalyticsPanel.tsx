import React from 'react';
import CleaningAnalytics from './ui/CleaningAnalytics';
import RecentlyCleaned from './ui/RecentlyCleaned';

const EnvironmentalCleanAnalyticsPanel: React.FC = () => {
  return (
    <div className="flex-1">
      <CleaningAnalytics />
      <div className="mt-4">
        <RecentlyCleaned />
      </div>
    </div>
  );
};

export default EnvironmentalCleanAnalyticsPanel;
