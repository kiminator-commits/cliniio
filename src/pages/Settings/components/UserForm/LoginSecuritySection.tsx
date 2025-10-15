import React from 'react';
import { FormSectionProps } from './types';

const LoginSecuritySection: React.FC<FormSectionProps> = ({ user }) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-medium text-gray-700 mb-3">Login Security</h4>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Failed Login Attempts
            </p>
            <p className="text-xs text-gray-500">
              Account lockout after multiple failed attempts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="1"
              max="10"
              defaultValue="5"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
            <span className="text-xs text-gray-500">attempts</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">
              Lockout Duration
            </p>
            <p className="text-xs text-gray-500">
              How long to lock account after failed attempts
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              min="5"
              max="1440"
              defaultValue="30"
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            />
            <span className="text-xs text-gray-500">minutes</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">Session Timeout</p>
            <p className="text-xs text-gray-500">
              Auto-logout after inactivity
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <select className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]">
              <option value="15">15 minutes</option>
              <option value="30" selected>
                30 minutes
              </option>
              <option value="60">1 hour</option>
              <option value="240">4 hours</option>
              <option value="480">8 hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit & Compliance */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Audit & Compliance
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Activity Monitoring
              </p>
              <p className="text-xs text-gray-500">
                Track user actions and system changes
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="activity-monitoring"
                defaultChecked={true}
                className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
              <label
                htmlFor="activity-monitoring"
                className="text-xs text-gray-700"
              >
                Enabled
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Data Export Logs
              </p>
              <p className="text-xs text-gray-500">
                Log all data export activities
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="export-logs"
                defaultChecked={true}
                className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
              <label htmlFor="export-logs" className="text-xs text-gray-700">
                Enabled
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">
                Sensitive Data Access
              </p>
              <p className="text-xs text-gray-500">
                Require additional verification for sensitive data
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sensitive-data"
                defaultChecked={user?.role === 'Admin'}
                className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
              <label htmlFor="sensitive-data" className="text-xs text-gray-700">
                Enabled
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSecuritySection;
