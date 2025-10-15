import React, { useEffect } from 'react';
import { TabNavigation } from './navigation';
import { BasicInfoTab, PreferencesTab, MobileTab, AccountTab } from './tabs';
import { PasswordChangeModal } from './modals';
import {
  ProfileSettingsProvider,
  useProfileSettingsContext,
} from './ProfileAccountSettings/context';

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
              setState((prev) => ({ ...prev, basicInfoForm: formData }))
            }
            userData={state.userData}
            uploadingPhoto={state.uploadingPhoto}
            uploadProfilePhoto={uploadProfilePhoto}
            removeProfilePhoto={removeProfilePhoto}
          />
        )}

        {state.activeTab === 'preferences' && (
          <PreferencesTab
            preferences={state.preferences}
            onPreferencesChange={(preferences) =>
              setState((prev) => ({ ...prev, preferences }))
            }
            onSave={handleSave}
            saving={state.saving}
            saveSuccess={state.saveSuccess}
            saveError={state.saveError}
          />
        )}

        {state.activeTab === 'mobile' && (
          <MobileTab
            shortcuts={state.mobileShortcuts}
            availableShortcuts={availableShortcuts}
            onShortcutsChange={(shortcuts) =>
              setState((prev) => ({ ...prev, mobileShortcuts: shortcuts }))
            }
            onSave={handleSave}
            saving={state.saving}
            saveSuccess={state.saveSuccess}
            saveError={state.saveError}
          />
        )}

        {state.activeTab === 'account' && (
          <AccountTab
            userData={state.userData}
            onPasswordChange={() =>
              setState((prev) => ({ ...prev, showPasswordModal: true }))
            }
            onArchiveAccount={handleArchiveAccount}
            loading={state.loading}
          />
        )}
      </div>

      <PasswordChangeModal
        isOpen={state.showPasswordModal}
        onClose={() =>
          setState((prev) => ({ ...prev, showPasswordModal: false }))
        }
        onPasswordChange={handlePasswordChange}
        isPasswordReset={state.isPasswordReset}
        error={state.passwordError}
        success={state.passwordSuccess}
        userEmail={state.userData?.email || ''}
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
