import React from 'react';
import Icon from '@mdi/react';
import {
  mdiClose,
  mdiAlertCircle,
  mdiInformation,
  mdiCheckCircle,
  mdiExclamation,
} from '@mdi/js';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface EnvironmentalCleanErrorNotificationProps {
  type: NotificationType;
  title: string;
  message: string;
  suggestion?: string;
  onClose: () => void;
  onRetry?: () => void;
  showRetry?: boolean;
}

const EnvironmentalCleanErrorNotification: React.FC<
  EnvironmentalCleanErrorNotificationProps
> = ({
  type,
  title,
  message,
  suggestion,
  onClose,
  onRetry,
  showRetry = false,
}) => {
  const getNotificationStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          iconBg: 'bg-green-100',
          title: 'text-green-800',
          message: 'text-green-700',
          closeButton: 'text-green-400 hover:text-green-600',
          retryButton: 'bg-green-600 hover:bg-green-700 text-white',
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          iconBg: 'bg-red-100',
          title: 'text-red-800',
          message: 'text-red-700',
          closeButton: 'text-red-400 hover:text-red-600',
          retryButton: 'bg-red-600 hover:bg-red-700 text-white',
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          iconBg: 'bg-yellow-100',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          closeButton: 'text-yellow-400 hover:text-yellow-600',
          retryButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          iconBg: 'bg-blue-100',
          title: 'text-blue-800',
          message: 'text-blue-700',
          closeButton: 'text-blue-400 hover:text-blue-600',
          retryButton: 'bg-blue-600 hover:bg-blue-700 text-white',
        };
    }
  };

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return mdiCheckCircle;
      case 'error':
        return mdiAlertCircle;
      case 'warning':
        return mdiExclamation;
      case 'info':
        return mdiInformation;
    }
  };

  const styles = getNotificationStyles(type);
  const icon = getIcon(type);

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md w-full border rounded-lg shadow-lg ${styles.container}`}
    >
      <div className="p-4">
        <div className="flex items-start">
          {/* Icon */}
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${styles.iconBg}`}
          >
            <Icon path={icon} size={1} className={styles.icon} />
          </div>

          {/* Content */}
          <div className="ml-3 flex-1">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${styles.title}`}>{title}</h3>
              <button
                onClick={onClose}
                className={`ml-4 flex-shrink-0 rounded-md inline-flex text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.closeButton}`}
              >
                <Icon path={mdiClose} size={0.8} />
              </button>
            </div>

            <div className="mt-1">
              <p className={`text-sm ${styles.message}`}>{message}</p>

              {suggestion && (
                <p className="mt-2 text-xs text-gray-600">💡 {suggestion}</p>
              )}
            </div>

            {/* Action Buttons */}
            {showRetry && onRetry && (
              <div className="mt-3 flex space-x-2">
                <button
                  onClick={onRetry}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${styles.retryButton}`}
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnvironmentalCleanErrorNotification;
