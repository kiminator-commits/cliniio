import React from 'react';
import Icon from '@mdi/react';
import {
  mdiTestTube,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiShieldAlert,
  mdiBellRing,
  mdiScanHelper,
  mdiWater,
  mdiThermometer,
  mdiAlert,
  mdiPackageVariant,
} from '@mdi/js';

interface ActivityItem {
  id: string;
  type:
    | 'bi-test'
    | 'bi-failure'
    | 'cycle-complete'
    | 'cycle-completed'
    | 'cycle-started'
    | 'tool-quarantine'
    | 'regulatory-notification'
    | 'tool-200-scans'
    | 'bath-1-change'
    | 'bath-2-change'
    | 'autoclave-cycle-started'
    | 'tool-problem-flagged'
    | 'batch-id-created';
  title: string;
  description?: string;
  time: string;
  toolCount?: number;
  color: string;
  operatorId?: string;
  metadata?: Record<string, unknown>;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

/**
 * Get the appropriate icon for each activity type
 */
const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'bi-test':
      return mdiTestTube;
    case 'bi-failure':
      return mdiAlertCircle;
    case 'cycle-complete':
    case 'cycle-completed':
      return mdiCheckCircle;
    case 'cycle-started':
      return mdiThermometer;
    case 'tool-quarantine':
      return mdiShieldAlert;
    case 'regulatory-notification':
      return mdiBellRing;
    case 'tool-200-scans':
      return mdiScanHelper;
    case 'bath-1-change':
    case 'bath-2-change':
      return mdiWater;
    case 'autoclave-cycle-started':
      return mdiThermometer;
    case 'tool-problem-flagged':
      return mdiAlert;
    case 'batch-id-created':
      return mdiPackageVariant;
    default:
      return mdiBellRing;
  }
};

/**
 * RecentActivity component for displaying recent sterilization activities.
 * Shows a list of recent events with timestamps and tool counts.
 */
export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
}) => {
  return (
    <div
      className="bg-gray-50 rounded-lg p-4"
      style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Activity
      </h3>
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 ${activity.color} rounded-lg flex items-center justify-center`}
              >
                <Icon
                  path={getActivityIcon(activity.type)}
                  size={0.8}
                  className="text-white"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
            {activity.toolCount && (
              <span className="text-xs text-gray-500">
                {activity.toolCount} tools
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
