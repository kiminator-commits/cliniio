import React from 'react';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { NotificationPreferencesProps } from '../types/UserProfileTypes';

const NotificationPreferences: React.FC<NotificationPreferencesProps> = ({
  userData,
  onNotificationChange,
}) => {
  const notificationOptions = [
    {
      key: 'emailNotifications',
      label: 'Email Notifications',
      description: 'Receive important updates via email',
    },
    {
      key: 'dailyDigest',
      label: 'Daily Summary Digest',
      description: 'Receive a daily summary of activities',
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-yellow-100 rounded-lg p-3 mr-4">
            <Icon path={mdiBell} size={1.5} className="text-yellow-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Notification Preferences
            </h2>
            <p className="text-sm text-gray-500">
              Choose how you want to receive notifications
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          {notificationOptions.map(({ key, label, description }) => (
            <div
              key={key}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div>
                <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
              <label
                htmlFor={`toggle-${key}`}
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  checked={userData[key as keyof typeof userData] as boolean}
                  onChange={(e) => onNotificationChange(key, e.target.checked)}
                  className="sr-only peer"
                  aria-label={label}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#4ECDC4]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#4ECDC4]"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferences;
