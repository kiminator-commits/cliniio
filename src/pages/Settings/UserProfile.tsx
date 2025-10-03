import React from 'react';
import { SharedLayout } from '../../components/Layout/SharedLayout';
import { useUserProfile } from './hooks/useUserProfile';

// Import refactored components
import BasicInformation from './components/BasicInformation';
import AccountSecurity from './components/AccountSecurity';
import NotificationPreferences from './components/NotificationPreferences';
import ClinicInformation from './components/ClinicInformation';
import SessionActivity from './components/SessionActivity';
import AccountManagement from './components/AccountManagement';
import { PasswordChangeModal } from './components/modals';
import DeleteAccountModal from './components/DeleteAccountModal';

const UserProfile: React.FC = () => {
  const {
    // State
    isEditing,
    showPasswordModal,
    showDeleteModal,
    userData,
    formData,
    securityData,

    // Actions
    setIsEditing,
    setShowPasswordModal,
    setShowDeleteModal,
    handleSave,
    handleCancel,
    handlePasswordChange,
    handleDeleteAccount,
    handleNotificationChange,
    handleTwoFactorToggle,
    handleForceLogout,
    handleFormDataChange,
  } = useUserProfile();

  return (
    <SharedLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            User Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Basic Information */}
        <BasicInformation
          userData={userData}
          formData={formData}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
          onSave={handleSave}
          onCancel={handleCancel}
          onFormDataChange={handleFormDataChange}
        />

        {/* Account Security */}
        <AccountSecurity
          userData={userData}
          formData={securityData}
          onPasswordChange={() => setShowPasswordModal(true)}
          onTwoFactorToggle={handleTwoFactorToggle}
          onFormDataChange={() => {}}
        />

        {/* Notification Preferences */}
        <NotificationPreferences
          userData={userData}
          onNotificationChange={handleNotificationChange}
        />

        {/* Clinic Information */}
        <ClinicInformation userData={userData} />

        {/* Session Activity */}
        <SessionActivity
          userData={userData}
          onForceLogout={handleForceLogout}
        />

        {/* Account Management */}
        <AccountManagement
          userData={userData}
          onDeleteAccount={() => setShowDeleteModal(true)}
        />

        {/* Password Change Modal */}
        <PasswordChangeModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onSubmit={handlePasswordChange}
          error={null}
          success={null}
        />

        {/* Delete Account Modal */}
        <DeleteAccountModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onDeleteAccount={handleDeleteAccount}
        />
      </div>
    </SharedLayout>
  );
};

export default UserProfile;
