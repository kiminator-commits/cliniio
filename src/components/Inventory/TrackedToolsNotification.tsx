import React, { useState, useEffect } from 'react';
import Icon from '../Icon/Icon';
import {
  mdiBell,
  mdiCheck,
  mdiClose,
} from '@mdi/js';
import { useTrackedTools } from '../../hooks/inventory/useTrackedTools';
import { TrackedToolNotification } from '../../services/trackedToolsService';
import { getPriorityIcon, getPriorityColor } from '../../utils/priorityUtils';

interface TrackedToolsNotificationProps {
  className?: string;
  showBadge?: boolean;
  maxNotifications?: number;
}

export const TrackedToolsNotification: React.FC<
  TrackedToolsNotificationProps
> = ({ className = '', showBadge = true, maxNotifications = 5 }) => {
  const {
    pendingNotifications,
    acknowledgeNotification,
    clearExpiredNotifications,
  } = useTrackedTools();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<TrackedToolNotification[]>(
    []
  );

  // Update notifications when they change
  useEffect(() => {
    // Use setTimeout to avoid calling setState synchronously in effect
    setTimeout(() => {
      setNotifications(pendingNotifications?.slice(0, maxNotifications) || []);
    }, 0);
  }, [pendingNotifications, maxNotifications]);

  // Clear expired notifications periodically
  useEffect(() => {
    const interval = setInterval(() => {
      clearExpiredNotifications();
    }, 60000); // Clear every minute

    return () => clearInterval(interval);
  }, [clearExpiredNotifications]);

  // Error handling for missing hook data - moved after all hooks
  if (!pendingNotifications) {
    return null;
  }

  // Don't render anything if there are no notifications
  if (!notifications || notifications.length === 0) {
    return null;
  }

  const handleAcknowledge = (notificationId: string) => {
    acknowledgeNotification(notificationId);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Notification Bell with Badge */}
      <button
        onClick={handleToggle}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
        aria-label={`Tracked tools notifications (${notifications.length} pending)`}
      >
        <Icon path={mdiBell} size={1.2} />
        {showBadge && notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Tracked Tools
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close notifications"
            >
              <Icon path={mdiClose} size={1.2} />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Icon
                  path={mdiCheck}
                  size={2}
                  className="mx-auto mb-2 text-green-500"
                />
                <p>No pending notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors duration-150 border-l-4 ${getPriorityColor(notification.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon
                            path={getPriorityIcon(notification.priority)}
                            size={1}
                            className="text-current"
                          />
                          <span className="text-sm font-medium text-gray-800">
                            {notification.toolName}
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded-full capitalize ${getPriorityColor(notification.priority)}`}
                          >
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                          <button
                            onClick={() => handleAcknowledge(notification.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                          >
                            Acknowledge
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  {notifications.length} notification
                  {notifications.length !== 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => {
                    notifications.forEach((n) => handleAcknowledge(n.id));
                  }}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Acknowledge All
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}
    </div>
  );
};

export default TrackedToolsNotification;
