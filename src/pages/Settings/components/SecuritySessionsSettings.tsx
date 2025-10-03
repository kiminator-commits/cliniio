import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useUser } from '../../../contexts/UserContext';
import SessionStatus from '../../../components/SessionStatus';
import { sessionManager } from '../../../lib/sessionManager';

interface SecuritySettings {
  sessionTimeout: number; // in minutes
  inactiveTimeout: number; // in minutes
  rememberMeDuration: number; // in days
  requireReauthForSensitive: boolean;
  twoFactorEnabled: boolean;
}

const SecuritySessionsSettings: React.FC = () => {
  const { currentUser } = useUser();
  const [settings, setSettings] = useState<SecuritySettings>({
    sessionTimeout: 480, // 8 hours default
    inactiveTimeout: 30, // 30 minutes default
    rememberMeDuration: 7, // 7 days default
    requireReauthForSensitive: true,
    twoFactorEnabled: false,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const loadUserSettings = useCallback(async () => {
    if (!currentUser) return;

    setLoading(true);
    try {
      // Load user's security settings from Supabase
      const { data, error } = await supabase
        .from('user_security_settings')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows returned
        console.error('Error loading security settings:', error);
      } else if (data) {
        setSettings({
          sessionTimeout: (data.session_timeout as number) || 480,
          inactiveTimeout: (data.inactive_timeout as number) || 30,
          rememberMeDuration: (data.remember_me_duration as number) || 7,
          requireReauthForSensitive:
            (data.require_reauth_for_sensitive as boolean) ?? true,
          twoFactorEnabled: (data.two_factor_enabled as boolean) ?? false,
        });
      }
    } catch (error) {
      console.error('Error loading security settings:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUserSettings();
  }, [loadUserSettings]);

  const saveSettings = async () => {
    if (!currentUser) return;

    setSaving(true);
    setMessage(null);

    try {
      // Upsert user security settings to Supabase
      const { error } = await supabase.from('user_security_settings').upsert({
        user_id: currentUser.id,
        session_timeout: settings.sessionTimeout,
        inactive_timeout: settings.inactiveTimeout,
        remember_me_duration: settings.rememberMeDuration,
        require_reauth_for_sensitive: settings.requireReauthForSensitive,
        two_factor_enabled: settings.twoFactorEnabled,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw error;
      }

      setMessage({
        type: 'success',
        text: 'Security settings saved successfully!',
      });

      // Update local storage with new session settings
      localStorage.setItem(
        'cliniio_session_timeout',
        settings.sessionTimeout.toString()
      );
      localStorage.setItem(
        'cliniio_inactive_timeout',
        settings.inactiveTimeout.toString()
      );
      localStorage.setItem(
        'cliniio_remember_me_duration',
        settings.rememberMeDuration.toString()
      );

      // Update session manager with new configuration
      sessionManager.updateConfig({
        sessionTimeout: settings.sessionTimeout,
        inactiveTimeout: settings.inactiveTimeout,
        rememberMeDuration: settings.rememberMeDuration,
      });
    } catch (error) {
      console.error('Error saving security settings:', error);
      setMessage({
        type: 'error',
        text: 'Failed to save security settings. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSettingChange = (
    key: keyof SecuritySettings,
    value: string | number | boolean
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Security & Sessions
        </h2>
        <p className="text-gray-600 text-sm">
          Configure how long you stay logged in and security preferences for
          your account.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Session Timeout Settings */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Session Management
          </h3>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="session-timeout"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Maximum Session Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="session-timeout"
                  type="number"
                  min="60"
                  max="1440"
                  value={settings.sessionTimeout}
                  onChange={(e) =>
                    handleSettingChange(
                      'sessionTimeout',
                      parseInt(e.target.value) || 480
                    )
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">
                  minutes (1-24 hours)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long you stay logged in before being automatically logged
                out
              </p>
            </div>

            <div>
              <label
                htmlFor="inactive-timeout"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Inactive Timeout
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="inactive-timeout"
                  type="number"
                  min="5"
                  max="120"
                  value={settings.inactiveTimeout}
                  onChange={(e) =>
                    handleSettingChange(
                      'inactiveTimeout',
                      parseInt(e.target.value) || 30
                    )
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">
                  minutes (5-120 minutes)
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long of inactivity before automatic logout
              </p>
            </div>

            <div>
              <label
                htmlFor="remember-me-duration"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Remember Me Duration
              </label>
              <div className="flex items-center space-x-3">
                <input
                  id="remember-me-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={settings.rememberMeDuration}
                  onChange={(e) =>
                    handleSettingChange(
                      'rememberMeDuration',
                      parseInt(e.target.value) || 7
                    )
                  }
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">days (1-30 days)</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                How long to stay logged in when using "Remember Me"
              </p>
            </div>
          </div>
        </div>

        {/* Security Preferences */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Security Preferences
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="require-reauth-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Require Re-authentication for Sensitive Actions
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Ask for password confirmation before changing critical
                  settings
                </p>
              </div>
              <button
                id="require-reauth-toggle"
                onClick={() =>
                  handleSettingChange(
                    'requireReauthForSensitive',
                    !settings.requireReauthForSensitive
                  )
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settings.requireReauthForSensitive
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireReauthForSensitive
                      ? 'translate-x-6'
                      : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="two-factor-toggle"
                  className="text-sm font-medium text-gray-700"
                >
                  Two-Factor Authentication
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Add an extra layer of security to your account (coming soon)
                </p>
              </div>
              <button
                id="two-factor-toggle"
                disabled
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 cursor-not-allowed"
              >
                <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        {/* Current Session Info */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-blue-900 mb-4">
            Current Session
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Logged in as:</strong> {currentUser?.email}
            </p>
          </div>
          <div className="mt-4">
            <SessionStatus variant="detailed" />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={saveSettings}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default SecuritySessionsSettings;
