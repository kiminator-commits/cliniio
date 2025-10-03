import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiEye, mdiEyeOff } from '@mdi/js';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => Promise<void>;
  error: string | null;
  success: string | null;
  isPasswordReset?: boolean;
}

export const PasswordChangeModal: React.FC<PasswordChangeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  error,
  success,
  isPasswordReset = false,
}) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async () => {
    await onSubmit(passwordData);
    // Reset form after successful submission
    if (success) {
      setPasswordData({
        currentPassword: '*********',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  const handleClose = () => {
    setPasswordData({
      currentPassword: '*********',
      newPassword: '',
      confirmPassword: '',
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {isPasswordReset ? 'Reset Password' : 'Change Password'}
        </h3>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <div className="space-y-4">
          {!isPasswordReset && (
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  id="currentPassword"
                  type="password"
                  placeholder="Enter your current password"
                  value={passwordData.currentPassword || '*********'}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter your current password to verify your identity before
                changing.
              </p>
            </div>
          )}

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {isPasswordReset ? 'Choose New Password' : 'New Password'}
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Enter new password (min 6 characters)"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  path={showNewPassword ? mdiEyeOff : mdiEye}
                  size={1}
                  className="text-gray-400"
                />
              </button>
            </div>

            {/* Password Requirements Checklist */}
            {passwordData.newPassword && (
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs font-medium text-gray-700 mb-2">
                  Password Requirements:
                </p>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    {passwordData.newPassword.length >= 6 ? (
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    )}
                    <span
                      className={`text-xs ${passwordData.newPassword.length >= 6 ? 'text-green-700' : 'text-gray-500'}`}
                    >
                      At least 6 characters ({passwordData.newPassword.length}
                      /6)
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordData.newPassword ===
                      passwordData.confirmPassword &&
                    passwordData.confirmPassword ? (
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                    )}
                    <span
                      className={`text-xs ${passwordData.newPassword === passwordData.confirmPassword && passwordData.confirmPassword ? 'text-green-700' : 'text-gray-500'}`}
                    >
                      Passwords match
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm New Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <Icon
                  path={showConfirmPassword ? mdiEyeOff : mdiEye}
                  size={1}
                  className="text-gray-400"
                />
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] rounded-md hover:bg-[#38b2ac]"
          >
            {isPasswordReset ? 'Send Reset Email' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
};
