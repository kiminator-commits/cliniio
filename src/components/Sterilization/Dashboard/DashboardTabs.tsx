import React, { memo, Suspense } from 'react';
import Icon from '@mdi/react';

import { TabInfo } from '../services/dashboardService';

import CleaningLogTracker from '../CleaningLogTracker';
import TimerDisplay from '../TimerDisplay';
import { CardSkeleton } from '../../ui/Skeleton';

interface DashboardTabsProps {
  activeTab: string;
  tabs: TabInfo[];
  SterilizationAnalyticsComponent?: React.ComponentType;
  onTabChange: (tabId: string) => void;
  getTabButtonClasses: (isActive: boolean) => string;
}

/**
 * DashboardTabs component for handling tab navigation and content display.
 * Shows different content based on the active tab (timers, analytics, logs).
 */
export const DashboardTabs: React.FC<DashboardTabsProps> = memo(
  function DashboardTabs({
    activeTab,
    tabs,
    SterilizationAnalyticsComponent,
    onTabChange,
    getTabButtonClasses,
  }) {
    return (
      <div
        className="bg-white rounded-lg shadow"
        style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
      >
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap gap-2 p-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${getTabButtonClasses(activeTab === tab.id)}`}
              >
                <Icon path={tab.icon} size={0.8} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'timers' && <TimerDisplay />}

          {activeTab === 'analytics' && (
            <>
              {SterilizationAnalyticsComponent && (
                <SterilizationAnalyticsComponent />
              )}
            </>
          )}

          {activeTab === 'logs' && (
            <Suspense fallback={<CardSkeleton />}>
              <CleaningLogTracker />
            </Suspense>
          )}
        </div>
      </div>
    );
  }
);
