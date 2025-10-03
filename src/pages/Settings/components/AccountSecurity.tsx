import React from 'react';
import Icon from '@mdi/react';
import { mdiShield } from '@mdi/js';
import { SecurityProps } from '../types/UserProfileTypes';

const AccountSecurity: React.FC<SecurityProps> = ({
  userData,
  formData,
  onPasswordChange,
  onTwoFactorToggle,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-green-100 rounded-lg p-3 mr-4">
            <Icon path={mdiShield} size={1.5} className="text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Account Security
            </h2>
            <p className="text-sm text-gray-500">
              Manage your password and security settings
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Password</h3>
              <p className="text-xs text-gray-500">
                Last changed:{' '}
                {userData.updated_at
                  ? new Date(userData.updated_at).toLocaleDateString()
                  : 'Never'}
              </p>
            </div>
            <button
              onClick={onPasswordChange}
              className="px-4 py-2 text-sm font-medium text-[#4ECDC4] bg-white border border-[#4ECDC4] rounded-md hover:bg-[#4ECDC4] hover:text-white"
            >
              Change Password
            </button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Two-Factor Authentication
              </h3>
              <p className="text-xs text-gray-500">
                {formData.two_factor_enabled ? 'Enabled' : 'Not enabled'} - Add
                an extra layer of security
              </p>
            </div>
            <div className="flex items-center">
              <span
                className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  formData.two_factor_enabled
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {formData.two_factor_enabled ? 'Enabled' : 'Disabled'}
              </span>
              <button
                onClick={onTwoFactorToggle}
                className="ml-3 px-3 py-1 text-xs font-medium text-[#4ECDC4] hover:underline"
              >
                {formData.two_factor_enabled ? 'Disable' : 'Enable'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSecurity;
