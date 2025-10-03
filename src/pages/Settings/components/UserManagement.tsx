import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiPencil, mdiTrashCan } from '@mdi/js';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface UserManagementProps {
  users: User[];
  onEditUser: (user: User) => void;
  onDeleteUser: (user: User) => void;
  onAddUser: () => void;
  billingTierInfo: {
    currentTier: { name: string };
    nextTier: { name: string };
    usersToNextTier: number;
    activeUserCount: number;
  } | null;
}

const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onEditUser,
  onDeleteUser,
  onAddUser,
  billingTierInfo,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState('');

  // Filter users based on search term and role filter
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All Roles' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="mb-6">
      <h5 className="text-md font-medium text-gray-700 mb-3">
        User Management
      </h5>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 border border-gray-200 rounded-md">
          <div>
            <span className="text-sm font-medium text-gray-700">
              Create New User
            </span>
            <p className="text-xs text-gray-500">
              Add new staff members to the system
            </p>
          </div>
          <button
            onClick={onAddUser}
            className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-sm"
          >
            Add User
          </button>
        </div>

        {/* Billing Tier Warning Banner */}
        {billingTierInfo && billingTierInfo.usersToNextTier <= 2 && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Billing Tier Warning
                </h3>
                <div className="mt-1 text-sm text-amber-700">
                  <p>
                    You are {billingTierInfo.usersToNextTier} user
                    {billingTierInfo.usersToNextTier === 1 ? '' : 's'} away from
                    the next pricing tier ({billingTierInfo.nextTier.name}).
                    Please review and remove any inactive users to avoid an
                    increase in fees.
                  </p>
                  <p className="mt-1 text-xs">
                    Current: {billingTierInfo.activeUserCount} active users (
                    {billingTierInfo.currentTier.name})
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Compact User List */}
        <div className="border border-gray-200 rounded-md overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h6 className="text-sm font-medium text-gray-700">
                Active Users ({filteredUsers.length})
              </h6>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
                {!showAddRole ? (
                  <select
                    value={roleFilter}
                    onChange={(e) => {
                      if (e.target.value === 'add-new') {
                        setShowAddRole(true);
                      } else {
                        setRoleFilter(e.target.value);
                      }
                    }}
                    className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  >
                    <option>All Roles</option>
                    <option>Admin</option>
                    <option>Technician</option>
                    <option>Nurse</option>
                    <option value="add-new">+ Add New Role</option>
                  </select>
                ) : (
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="New role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] w-20"
                    />
                    <button
                      onClick={() => {
                        if (newRole.trim()) {
                          // Here you would add the new role to your system
                          setNewRole('');
                          setShowAddRole(false);
                        }
                      }}
                      className="px-2 py-1 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-xs"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setNewRole('');
                        setShowAddRole(false);
                      }}
                      className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto scrollbar-hide">
            {filteredUsers.map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">
                      {user.full_name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {user.full_name}
                      </span>
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'Admin'
                            ? 'bg-red-100 text-red-800'
                            : user.role === 'Technician'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {user.role}
                      </span>
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>{user.email}</span>
                      <span>•</span>
                      <span>Last login: {user.lastLogin}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onEditUser(user)}
                    className="p-1 text-gray-400 hover:text-gray-600"
                    title="Edit user"
                  >
                    <Icon path={mdiPencil} size={0.8} />
                  </button>
                  <button
                    onClick={() => onDeleteUser(user)}
                    className="p-1 text-gray-400 hover:text-red-600"
                    title="Delete user"
                  >
                    <Icon path={mdiTrashCan} size={0.8} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>
                Showing {filteredUsers.length} of {users.length} users
              </span>
              <div className="flex space-x-2">
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">
                  Previous
                </button>
                <button className="px-2 py-1 border border-gray-300 rounded bg-white">
                  1
                </button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">
                  2
                </button>
                <button className="px-2 py-1 border border-gray-300 rounded hover:bg-white">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
