import React, { useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiCheckCircle, mdiAlertCircle, mdiClose } from '@mdi/js';

interface NotificationBannerProps {
  type: 'success' | 'error';
  message: string;
  isVisible: boolean;
  onClose: () => void;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const NotificationBanner: React.FC<NotificationBannerProps> = ({
  type,
  message,
  isVisible,
  onClose,
  autoHide = true,
  autoHideDelay = 3000,
}) => {
  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, isVisible, autoHideDelay, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
  const icon = type === 'success' ? mdiCheckCircle : mdiAlertCircle;

  return (
    <div
      className={`fixed bottom-6 right-6 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg max-w-md z-50`}
    >
      <div className="flex items-center space-x-3">
        <Icon path={icon} size={1.2} />
        <span className="flex-1">{message}</span>
        <button
          onClick={onClose}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <Icon path={mdiClose} size={1} />
        </button>
      </div>
    </div>
  );
};
