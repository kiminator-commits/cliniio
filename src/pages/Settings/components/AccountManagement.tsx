import React from 'react';
import Icon from '@mdi/react';
import { mdiTrashCan } from '@mdi/js';
import { AccountManagementProps } from '../types/UserProfileTypes';

const AccountManagement: React.FC<AccountManagementProps> = ({
  onDeleteAccount,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-red-100 rounded-lg p-3 mr-4">
            <Icon path={mdiTrashCan} size={1.5} className="text-red-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Account Management
            </h2>
            <p className="text-sm text-gray-500">
              Dangerous actions - use with caution
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
          <div>
            <h3 className="text-sm font-medium text-red-900">Delete Account</h3>
            <p className="text-xs text-red-700">
              Permanently delete your account and all associated data
            </p>
          </div>
          <button
            onClick={onDeleteAccount}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountManagement;
