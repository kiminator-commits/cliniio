import React from 'react';
import Icon from '@mdi/react';
import { mdiBell } from '@mdi/js';
import { NotificationSettings, NOTIFICATION_CATEGORIES } from './constants';

interface NotificationsTabProps {
  notificationSettings: NotificationSettings;
  onNotificationSettingChange: (
    field: keyof NotificationSettings,
    value: boolean
  ) => void;
}

const NotificationsTab: React.FC<NotificationsTabProps> = ({
  notificationSettings,
  onNotificationSettingChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Icon path={mdiBell} size={1.5} className="text-yellow-600" />
          <div>
            <h4 className="text-lg font-semibold text-yellow-800">
              Notification Settings
            </h4>
            <p className="text-sm text-yellow-700">
              Configure how and when you receive notifications
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Email Notifications */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">
              Email Notifications
            </h5>
            <div className="space-y-3">
              {NOTIFICATION_CATEGORIES.email.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label htmlFor={key} className="text-sm text-gray-700">
                    {label}
                  </label>
                  <button
                    id={key}
                    onClick={() =>
                      onNotificationSettingChange(
                        key as keyof NotificationSettings,
                        !notificationSettings[key as keyof NotificationSettings]
                      )
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 ${
                      notificationSettings[key as keyof NotificationSettings]
                        ? 'bg-yellow-600'
                        : 'bg-gray-200'
                    }`}
                    aria-label={label}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationSettings[key as keyof NotificationSettings]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* In-App Notifications */}
          <div>
            <h5 className="font-medium text-gray-800 mb-3">
              In-App Notifications
            </h5>
            <div className="space-y-3">
              {NOTIFICATION_CATEGORIES.inApp.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between">
                  <label htmlFor={key} className="text-sm text-gray-700">
                    {label}
                  </label>
                  <button
                    id={key}
                    onClick={() =>
                      onNotificationSettingChange(
                        key as keyof NotificationSettings,
                        !notificationSettings[key as keyof NotificationSettings]
                      )
                    }
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 ${
                      notificationSettings[key as keyof NotificationSettings]
                        ? 'bg-yellow-600'
                        : 'bg-gray-200'
                    }`}
                    aria-label={label}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                        notificationSettings[key as keyof NotificationSettings]
                          ? 'translate-x-5'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;
