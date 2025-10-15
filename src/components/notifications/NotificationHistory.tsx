import React, { useState, useEffect } from 'react';
import {
  trackingNotificationService,
  TrackingNotification,
} from '../../services/notifications/trackingNotificationService';
import Icon from '@mdi/react';
import {
  mdiHistory,
  mdiClose,
  mdiFilterVariant,
  mdiToolbox as _mdiToolbox,
  mdiClock,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiInformation,
} from '@mdi/js';

interface NotificationHistoryProps {
  className?: string;
}

const NotificationHistory: React.FC<NotificationHistoryProps> = React.memo(
  ({ className = '' }) => {
    const [notifications, setNotifications] = useState<TrackingNotification[]>(
      []
    );
    const [filteredNotifications, setFilteredNotifications] = useState<
      TrackingNotification[]
    >([]);
    const [filterType, setFilterType] = useState<
      TrackingNotification['type'] | 'all'
    >('all');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
      const loadHistory = () => {
        const history = trackingNotificationService.getNotificationHistory();
        setNotifications(history);
        setFilteredNotifications(history);
      };

      loadHistory();

      // Refresh every 5 seconds
      const interval = setInterval(loadHistory, 5000);
      return () => clearInterval(interval);
    }, []);

  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      if (filterType === 'all') {
        setFilteredNotifications(notifications);
      } else {
        setFilteredNotifications(
          notifications.filter((n) => n.type === filterType)
        );
      }
    }, 0);
  }, [notifications, filterType]);

    const getIcon = (type: TrackingNotification['type']) => {
      switch (type) {
        case 'tool_available':
          return mdiCheckCircle;
        case 'position_changed':
        case 'queue_update':
          return mdiInformation;
        case 'tool_unavailable':
          return mdiAlertCircle;
        default:
          return mdiInformation;
      }
    };

    const getIconColor = (type: TrackingNotification['type']) => {
      switch (type) {
        case 'tool_available':
          return 'text-green-500';
        case 'position_changed':
        case 'queue_update':
          return 'text-blue-500';
        case 'tool_unavailable':
          return 'text-orange-500';
        default:
          return 'text-gray-500';
      }
    };

    const getBgColor = (notification: TrackingNotification) => {
      if (notification.title.includes('🔥')) {
        return 'bg-red-50 border-red-200';
      } else if (notification.title.includes('⚡')) {
        return 'bg-yellow-50 border-yellow-200';
      } else if (notification.title.includes('📋')) {
        return 'bg-gray-50 border-gray-200';
      }

      switch (notification.type) {
        case 'tool_available':
          return 'bg-green-50 border-green-200';
        case 'position_changed':
        case 'queue_update':
          return 'bg-blue-50 border-blue-200';
        case 'tool_unavailable':
          return 'bg-orange-50 border-orange-200';
        default:
          return 'bg-gray-50 border-gray-200';
      }
    };

    const clearHistory = () => {
      trackingNotificationService.clearNotificationHistory();
      setNotifications([]);
      setFilteredNotifications([]);
    };

    if (!isOpen) {
      return (
        <button
          onClick={() => setIsOpen(true)}
          className={`font-medium px-4 py-2 rounded-md border border-gray-300 shadow-sm flex items-center focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] focus:ring-offset-1 min-w-fit whitespace-nowrap bg-white hover:bg-gray-50 text-gray-700 ${className}`}
          title="View notification history"
        >
          <Icon
            path={mdiHistory}
            size={1}
            className="mr-2"
            aria-hidden="true"
          />
          History
          {notifications.length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {notifications.length}
            </span>
          )}
        </button>
      );
    }

    return (
      <div
        className={`fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-xl border ${className}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Icon path={mdiHistory} size={1.2} className="mr-2 text-blue-500" />
            Notification History
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearHistory}
              className="text-sm text-gray-500 hover:text-gray-700"
              title="Clear history"
            >
              Clear
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Icon path={mdiClose} size={1} />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <Icon path={mdiFilterVariant} size={1} className="text-gray-500" />
            <select
              value={filterType}
              onChange={(e) =>
                setFilterType(
                  e.target.value as TrackingNotification['type'] | 'all'
                )
              }
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Types</option>
              <option value="tool_available">Tool Available</option>
              <option value="position_changed">Position Changed</option>
              <option value="queue_update">Queue Update</option>
              <option value="tool_unavailable">Tool Unavailable</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-64 overflow-y-auto">
          {filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Icon
                path={mdiClock}
                size={2}
                className="mx-auto mb-2 text-gray-300"
              />
              <p>No notifications in history</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${getBgColor(notification)} border rounded-lg p-3 text-sm`}
                >
                  <div className="flex items-start">
                    <Icon
                      path={getIcon(notification.type)}
                      size={1}
                      className={`${getIconColor(notification.type)} mr-2 mt-0.5`}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-xs">
                        {notification.title}
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500">
                          {notification.toolName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);

NotificationHistory.displayName = 'NotificationHistory';

export default NotificationHistory;
