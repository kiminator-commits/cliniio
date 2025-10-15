import React, { useState } from 'react';
import { FormSectionProps } from './types';

const RolePermissionsSection: React.FC<FormSectionProps> = ({ user }) => {
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState('');

  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-medium text-gray-700 mb-3">
        Role & Permissions
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="userRole"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Role *
          </label>
          {!showAddRole ? (
            <select
              id="userRole"
              defaultValue={user?.role || ''}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
            >
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Technician">Technician</option>
              <option value="Nurse">Nurse</option>
              <option value="add-new">+ Add New Role</option>
            </select>
          ) : (
            <div className="space-y-2">
              <input
                id="newRoleInput"
                type="text"
                placeholder="Enter new role name"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    if (newRole.trim()) {
                      // Here you would add the new role to your system
                      setNewRole('');
                      setShowAddRole(false);
                    }
                  }}
                  className="px-3 py-1 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-xs"
                >
                  Add Role
                </button>
                <button
                  onClick={() => {
                    setNewRole('');
                    setShowAddRole(false);
                  }}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          {!showAddRole && (
            <button
              onClick={() => setShowAddRole(true)}
              className="text-xs text-[#4ECDC4] hover:text-[#38b2ac] mt-1"
            >
              + Add New Role
            </button>
          )}
        </div>
      </div>

      {/* Module Permissions */}
      <div className="mt-6">
        <h4 className="text-md font-medium text-gray-700 mb-3">
          Module Permissions
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: 'Inventory Management', key: 'inventory' },
            { name: 'Sterilization', key: 'sterilization' },
            { name: 'Environmental Cleaning', key: 'cleaning' },
            { name: 'Knowledge Hub', key: 'knowledge' },
            { name: 'Settings', key: 'settings' },
            { name: 'Reports', key: 'reports' },
          ].map((module) => (
            <label key={module.key} className="flex items-center space-x-2">
              <input
                type="checkbox"
                defaultChecked={user?.role === 'Admin'} // Admin gets all permissions by default
                className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
              />
              <span className="text-sm text-gray-700">{module.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsSection;
