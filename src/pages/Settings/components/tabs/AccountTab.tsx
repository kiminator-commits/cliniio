import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiShield, mdiTrashCan } from '@mdi/js';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
  bio: string;
  preferred_language: string;
  timezone: string;
  avatar_url?: string;
  active_sessions: number;
  password_changed_at?: string;
}

interface AccountTabProps {
  userData: UserData | null;
  onPasswordChange: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  onOpenPasswordModal: () => void;
  onArchiveAccount: () => Promise<void>;
  passwordError: string | null;
  passwordSuccess: string | null;
}

export const AccountTab: React.FC<AccountTabProps> = ({
  userData,
  onPasswordChange,
  onOpenPasswordModal,
  onArchiveAccount,
  passwordError,
  passwordSuccess,
}) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [archiveReason, setArchiveReason] = useState('');

  const handlePasswordSubmit = async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    await onPasswordChange(passwordData);
    setShowPasswordModal(false);
  };

  const handleArchiveAccount = () => {
    if (archiveReason.trim()) {
      onArchiveAccount();
      setShowArchiveConfirm(false);
      setArchiveReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Account Security
        </h5>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#4ECDC4] rounded-lg flex items-center justify-center">
                <Icon path={mdiShield} size={1} className="text-white" />
              </div>
              <div>
                <h6 className="font-medium text-gray-700">Password</h6>
                <p className="text-sm text-gray-500">
                  Last changed:{' '}
                  {userData?.password_changed_at
                    ? userData.password_changed_at
                    : 'Never'}
                </p>
              </div>
            </div>
            <button
              onClick={onOpenPasswordModal}
              className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm"
            >
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <label
                htmlFor="two-factor-toggle"
                className="block text-sm font-medium text-gray-700"
              >
                Two-Factor Authentication
              </label>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <button
              id="two-factor-toggle"
              disabled
              className="px-4 py-2 rounded-md transition-colors text-sm bg-gray-400 text-white cursor-not-allowed opacity-60"
              title="Coming Soon"
            >
              Coming Soon
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <label
                htmlFor="sessions-toggle"
                className="block text-sm font-medium text-gray-700"
              >
                Login Sessions
              </label>
              <p className="text-sm text-gray-500">
                Active sessions:{' '}
                {userData?.active_sessions ? userData.active_sessions : 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h5 className="text-md font-medium text-gray-700 mb-4">
          Account Actions
        </h5>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <Icon path={mdiTrashCan} size={1} className="text-white" />
              </div>
              <div>
                <h6 className="font-medium text-orange-700">Archive Account</h6>
                <p className="text-sm text-orange-600">
                  Archive your account - data is preserved but access is
                  disabled
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowArchiveConfirm(true)}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors text-sm"
            >
              Archive Account
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Change Password
            </h3>

            {passwordError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-green-600 text-sm">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="current-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  id="current-password"
                  type="password"
                  placeholder="Enter your current password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>

              <div>
                <label
                  htmlFor="new-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password (min 8 characters)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowPasswordModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  handlePasswordSubmit({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: '',
                  })
                }
                className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] rounded-md hover:bg-[#38b2ac]"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Account Confirmation Modal */}
      {showArchiveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-orange-900 mb-4">
              Archive Account
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Your account will be archived. This means:
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1">
              <li>• Your data will be preserved</li>
              <li>• You won't be able to access the system</li>
              <li>• Your account can be restored by administrators</li>
              <li>• All sessions will be terminated</li>
            </ul>
            <p className="text-sm text-gray-600 mb-4">
              This action can be reversed by contacting support.
            </p>

            <div className="mb-4">
              <label
                htmlFor="delete-reason"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Reason for archiving (optional)
              </label>
              <textarea
                id="archive-reason"
                value={archiveReason}
                onChange={(e) => setArchiveReason(e.target.value)}
                placeholder="Please let us know why you're archiving your account..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowArchiveConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleArchiveAccount}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
              >
                Archive Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
