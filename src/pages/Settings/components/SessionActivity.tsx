import React from 'react';
import Icon from '@mdi/react';
import { mdiClock } from '@mdi/js';
import { SessionActivityProps } from '../types/UserProfileTypes';
import { formatDate } from '../utils/userProfileUtils';

const SessionActivity: React.FC<SessionActivityProps> = ({
  userData,
  onForceLogout,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-orange-100 rounded-lg p-3 mr-4">
            <Icon path={mdiClock} size={1.5} className="text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Session Activity
            </h2>
            <p className="text-sm text-gray-500">
              Your recent login activity and sessions
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Last Login</h3>
              <p className="text-xs text-gray-500">
                {userData.last_login
                  ? formatDate(userData.last_login)
                  : 'Never'}
              </p>
            </div>
            <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active
            </span>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                Active Sessions
              </h3>
              <p className="text-xs text-gray-500">
                Manage your current login sessions
              </p>
            </div>
            <button
              onClick={onForceLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
            >
              Force Logout Others
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionActivity;
