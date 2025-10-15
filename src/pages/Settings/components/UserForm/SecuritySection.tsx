import React from 'react';

const SecuritySection: React.FC = () => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-medium text-gray-700 mb-3">
        Security Settings
      </h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Force Password Change
            </p>
            <p className="text-xs text-gray-500">
              Require user to change password on next login
            </p>
          </div>
          <button className="px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-xs">
            Force Change
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Session Management
            </p>
            <p className="text-xs text-gray-500">
              View and manage active sessions
            </p>
          </div>
          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors text-xs">
            View Sessions
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Access Logs</p>
            <p className="text-xs text-gray-500">
              Monitor login attempts and system access
            </p>
          </div>
          <button className="px-3 py-1 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors text-xs">
            View Logs
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">IP Restrictions</p>
            <p className="text-xs text-gray-500">
              Configure allowed IP ranges for this user
            </p>
          </div>
          <button className="px-3 py-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors text-xs">
            Manage IPs
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Device Management
            </p>
            <p className="text-xs text-gray-500">
              Approve and manage mobile devices
            </p>
          </div>
          <button className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors text-xs">
            Manage Devices
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;
