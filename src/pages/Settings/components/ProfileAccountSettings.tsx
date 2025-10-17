import React, { useEffect } from 'react';
import { TabNavigation } from './navigation';
import { BasicInfoTab, PreferencesTab, MobileTab, AccountTab } from './tabs';
import { PasswordChangeModal } from './modals';
import {
  ProfileSettingsProvider,
  useProfileSettingsContext,
} from './ProfileAccountSettings/context';
import { MobileShortcuts, BasicInfoForm, UserData } from './ProfileAccountSettings/types';

interface Preferences {
  theme?: string;
  notifications?: {
    push?: boolean;
    sound?: boolean;
    volume?: number;
  };
}

const ProfileAccountSettingsContent: React.FC = () => {
  const {
    state,
    setState,
    fetchUserData,
    handleSave,
    handlePasswordChange,
    handleArchiveAccount,
    uploadProfilePhoto,
    removeProfilePhoto,
  } = useProfileSettingsContext();

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const availableShortcuts = [
    {
      id: 'quick_scan',
      label: 'Quick Scan',
      description: 'Fast barcode scanning',
    },
    {
      id: 'emergency_contact',
      label: 'Emergency Contact',
      description: 'Quick access to emergency',
    },
    {
      id: 'voice_commands',
      label: 'Voice Commands',
      description: 'Hands-free operation',
    },
    {
      id: 'gesture_navigation',
      label: 'Gesture Navigation',
      description: 'Swipe-based navigation',
    },
    {
      id: 'haptic_feedback',
      label: 'Haptic Feedback',
      description: 'Touch vibration feedback',
    },
    {
      id: 'auto_sync',
      label: 'Auto Sync',
      description: 'Automatic data synchronization',
    },
    {
      id: 'offline_mode',
      label: 'Offline Mode',
      description: 'Work without internet',
    },
    {
      id: 'biometric_login',
      label: 'Biometric Login',
      description: 'Fingerprint/Face ID login',
    },
  ];

  return (
    <div className="space-y-6">
      <TabNavigation
        activeTab={state.activeTab}
        onTabChange={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
      />

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {state.activeTab === 'basic-info' && (
          <BasicInfoTab
            basicInfoForm={state.basicInfoForm}
            setBasicInfoForm={(formData) =>
              setState((prev) => ({ ...prev, basicInfoForm: formData as BasicInfoForm }))
            }
            userData={state.userData ? { avatar_url: state.userData.profile_photo } : null}
            uploadingPhoto={state.uploadingPhoto}
            uploadProfilePhoto={uploadProfilePhoto}
            removeProfilePhoto={removeProfilePhoto}
          />
        )}

        {state.activeTab === 'preferences' && (
          <PreferencesTab
            preferences={{
              theme: state.preferences.theme,
              notifications: {
                push: state.preferences.notifications.push,
                sound: state.preferences.notifications.sound,
                volume: state.preferences.notifications.volume,
                vibration: 'medium',
                vibrationEnabled: true,
              },
            }}
            setPreferences={(preferences) => {
              setState((prev: any) => ({
                ...prev,
                preferences: {
                  ...prev.preferences,
                  theme: (preferences as Preferences).theme,
                  notifications: {
                    ...prev.preferences.notifications,
                    push: (preferences as Preferences).notifications?.push,
                    sound: (preferences as Preferences).notifications?.sound,
                    volume: (preferences as Preferences).notifications?.volume,
                  },
                },
              }));
            }}
          />
        )}

        {state.activeTab === 'mobile' && (
          <MobileTab
            mobileShortcuts={Object.entries(state.mobileShortcuts).map(([key, value]) => ({ [key]: value }))}
            setMobileShortcuts={(shortcuts) => {
              const newShortcuts = (shortcuts as Array<Record<string, unknown>>).reduce((acc, shortcut) => ({ ...acc, ...shortcut }), {});
              setState((prev) => ({ ...prev, mobileShortcuts: newShortcuts as unknown as MobileShortcuts }));
            }}
            availableShortcuts={availableShortcuts}
          />
        )}

        {state.activeTab === 'account' && (
          <AccountTab
            userData={state.userData as any}
            onPasswordChange={handlePasswordChange}
            onOpenPasswordModal={() =>
              setState((prev) => ({ ...prev, showPasswordModal: true }))
            }
            onArchiveAccount={handleArchiveAccount}
            passwordError={state.passwordError}
            passwordSuccess={state.passwordSuccess}
          />
        )}
      </div>

      <PasswordChangeModal
        isOpen={state.showPasswordModal}
        onClose={() =>
          setState((prev) => ({ ...prev, showPasswordModal: false }))
        }
        onSubmit={handlePasswordChange}
        error={state.passwordError}
        success={state.passwordSuccess}
        isPasswordReset={state.isPasswordReset}
      />
    </div>
  );
};

export const ProfileAccountSettings: React.FC = () => {
  return (
    <ProfileSettingsProvider>
      <ProfileAccountSettingsContent />
    </ProfileSettingsProvider>
  );
};
