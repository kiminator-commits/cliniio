import React from 'react';
import ToggleSwitch from '../InventoryManagementSettings/ToggleSwitch';
import {
  playNotificationSound,
  testVibration,
  testFullNotification,
} from '../../../../utils/notificationUtils';

interface UserPreferences {
  theme: string;
  notifications: {
    push: boolean;
    sound: string;
    volume: number;
    vibration: string;
    vibrationEnabled: boolean;
  };
}

interface PreferencesTabProps {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

export const PreferencesTab: React.FC<PreferencesTabProps> = ({
  preferences,
  setPreferences,
}) => {
  const updatePreference = (key: string, value: string | boolean) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const updateNotificationPreference = (
    key: string,
    value: boolean | string | number
  ) => {
    setPreferences({
      ...preferences,
      notifications: { ...preferences.notifications, [key]: value },
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">Appearance</h5>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="theme"
              className="block text-sm font-medium text-gray-600 mb-2"
            >
              Theme
            </label>
            <select
              id="theme"
              value={preferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto (System)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Notifications
        </h5>
        <div className="space-y-4">
          <ToggleSwitch
            id="push-notifications"
            checked={preferences.notifications.push}
            onChange={(checked) =>
              updateNotificationPreference('push', checked)
            }
            label="Push Notifications (Browser)"
          />

          {preferences.notifications.push && (
            <>
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h6 className="text-sm font-medium text-gray-700 mb-3">
                  Notification Sounds
                </h6>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="notification-sound"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Default Sound
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        id="notification-sound"
                        value={
                          preferences.notifications.sound || 'gentle-chime'
                        }
                        onChange={(e) =>
                          updateNotificationPreference('sound', e.target.value)
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                      >
                        <option value="gentle-chime">Gentle Chime</option>
                        <option value="medical-alert">Medical Alert</option>
                        <option value="soft-bell">Soft Bell</option>
                        <option value="digital-beep">Digital Beep</option>
                        <option value="success-tone">Success Tone</option>
                        <option value="warning-sound">Warning Sound</option>
                        <option value="none">No Sound</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          playNotificationSound(
                            preferences.notifications.sound || 'gentle-chime',
                            preferences.notifications.volume || 50
                          )
                        }
                        className="px-3 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm"
                      >
                        Preview
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="notification-volume"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Volume
                    </label>
                    <input
                      id="notification-volume"
                      type="range"
                      min="0"
                      max="100"
                      value={preferences.notifications.volume || 50}
                      onChange={(e) =>
                        updateNotificationPreference(
                          'volume',
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>{preferences.notifications.volume || 50}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h6 className="text-sm font-medium text-gray-700 mb-3">
                  Vibration (Mobile Devices)
                </h6>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="vibration-pattern"
                      className="block text-sm font-medium text-gray-600 mb-2"
                    >
                      Vibration Pattern
                    </label>
                    <div className="flex items-center gap-3">
                      <select
                        id="vibration-pattern"
                        value={
                          preferences.notifications.vibration || 'short-pulse'
                        }
                        onChange={(e) =>
                          updateNotificationPreference(
                            'vibration',
                            e.target.value
                          )
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                      >
                        <option value="short-pulse">Short Pulse</option>
                        <option value="double-tap">Double Tap</option>
                        <option value="long-pulse">Long Pulse</option>
                        <option value="pattern">Pattern</option>
                        <option value="off">Off</option>
                      </select>
                      <button
                        type="button"
                        onClick={() =>
                          testVibration(
                            preferences.notifications.vibration || 'short-pulse'
                          )
                        }
                        className="px-3 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm"
                      >
                        Test
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <ToggleSwitch
                      id="vibration-enabled"
                      checked={
                        preferences.notifications.vibrationEnabled !== false
                      }
                      onChange={(checked) =>
                        updateNotificationPreference(
                          'vibrationEnabled',
                          checked
                        )
                      }
                      label="Enable Vibration"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => testFullNotification(preferences)}
                  className="w-full px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors"
                >
                  Test Full Notification
                </button>
              </div>
            </>
          )}

          <p className="text-xs text-gray-500 mt-2">
            You can customize notification preferences for specific features in
            each module.
          </p>
        </div>
      </div>
    </div>
  );
};
