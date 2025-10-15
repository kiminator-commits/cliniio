import React, { useEffect, useState } from 'react';
import {
  trackingNotificationService,
  TrackingNotification,
} from '@/services/notifications/trackingNotificationService';
import Icon from '@mdi/react';
import {
  mdiCheckCircle,
  mdiInformation,
  mdiAlertCircle,
  mdiClose,
} from '@mdi/js';

const ToastNotification: React.FC<{ notification: TrackingNotification }> = ({
  notification,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        trackingNotificationService.removeNotification(notification.id);
      }, 300); // Wait for animation to complete
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      trackingNotificationService.removeNotification(notification.id);
    }, 300);
  };

  const getIcon = () => {
    switch (notification.type) {
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

  const getIconColor = () => {
    switch (notification.type) {
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

  const getBgColor = () => {
    switch (notification.type) {
      case 'tool_available':
        // Check if it's high priority based on title
        if (notification.title.includes('🔥')) {
          return 'bg-red-50 border-red-200';
        } else if (notification.title.includes('⚡')) {
          return 'bg-yellow-50 border-yellow-200';
        } else if (notification.title.includes('📋')) {
          return 'bg-gray-50 border-gray-200';
        }
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

  return (
    <div
      className={`
        ${getBgColor()}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        transform transition-all duration-300 ease-in-out
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon path={getIcon()} size={1.2} className={getIconColor()} />
        </div>

        <div className="ml-3 flex-1">
          <h4 className="text-sm font-medium text-gray-900">
            {notification.title}
          </h4>
          <p className="mt-1 text-sm text-gray-600">{notification.message}</p>

          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={handleClose}
          className="ml-4 flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
    </div>
  );
};

const NotificationContainer: React.FC = () => {
  const [notifications, setNotifications] = useState<TrackingNotification[]>(
    []
  );

  useEffect(() => {
    const unsubscribe = trackingNotificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm">
      {notifications.map((notification) => (
        <ToastNotification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
