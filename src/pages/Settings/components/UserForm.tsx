import React, { useState } from 'react';
import Icon from '@mdi/react';
import { mdiClose, mdiShieldCheck, mdiAccount } from '@mdi/js';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface UserFormProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  mode: 'add' | 'edit';
  onSave: (userData: Partial<User>) => void;
}

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  onSave,
}) => {
  const [showAddRole, setShowAddRole] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto scrollbar-hide">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {mode === 'add'
              ? 'Add New User'
              : `Edit: ${(user as { full_name?: string })?.full_name || 'Unknown User'}`}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <Icon path={mdiClose} size={1.2} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Basic Information */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="Enter first name"
                  defaultValue={
                    (user as { full_name?: string })?.full_name?.split(
                      ' '
                    )[0] || ''
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Enter last name"
                  defaultValue={
                    (user as { full_name?: string })?.full_name
                      ?.split(' ')
                      .slice(1)
                      .join(' ') || ''
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
              <div className="md:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@clinic.com"
                  defaultValue={user?.email || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
                {mode === 'add' && (
                  <p className="text-xs text-gray-500 mt-1">
                    An invitation email will be sent to this address
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Role & Permissions */}
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
              <div>
                <label
                  htmlFor="userDepartment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                {!showAddDepartment ? (
                  <select
                    id="userDepartment"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                  >
                    <option value="">Select department</option>
                    <option value="Sterilization">Sterilization</option>
                    <option value="Environmental Cleaning">
                      Environmental Cleaning
                    </option>
                    <option value="Inventory">Inventory</option>
                    <option value="General">General</option>
                    <option value="add-new">+ Add New Department</option>
                  </select>
                ) : (
                  <div className="space-y-2">
                    <input
                      id="newDepartmentInput"
                      type="text"
                      placeholder="Enter new department name"
                      value={newDepartment}
                      onChange={(e) => setNewDepartment(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          if (newDepartment.trim()) {
                            // Here you would add the new department to your system
                            setNewDepartment('');
                            setShowAddDepartment(false);
                          }
                        }}
                        className="px-3 py-1 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-xs"
                      >
                        Add Department
                      </button>
                      <button
                        onClick={() => {
                          setNewDepartment('');
                          setShowAddDepartment(false);
                        }}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
                {!showAddDepartment && (
                  <button
                    onClick={() => setShowAddDepartment(true)}
                    className="text-xs text-[#4ECDC4] hover:text-[#38b2ac] mt-1"
                  >
                    + Add New Department
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Module Permissions */}
          <div className="border-t pt-4">
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
                { name: 'Analytics', key: 'analytics' },
                { name: 'User Management', key: 'users' },
                { name: 'Reports', key: 'reports' },
              ].map((module) => (
                <div key={module.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`module-${module.key}`}
                    defaultChecked={
                      user?.role === 'Admin' ||
                      ['inventory', 'sterilization'].includes(module.key)
                    }
                    className="rounded border-gray-300 text-[#4ECDC4] focus:ring-[#4ECDC4]"
                  />
                  <label
                    htmlFor={`module-${module.key}`}
                    className="text-sm text-gray-700"
                  >
                    {module.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Factor Authentication */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-md font-medium text-gray-700">
                Two-Factor Authentication
              </h4>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                    user?.twoFactorEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button className="text-sm text-[#4ECDC4] hover:text-[#38b2ac]">
                  {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            <div className="bg-gray-50 rounded-md p-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-[#4ECDC4] rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon path={mdiShieldCheck} size={1} className="text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {user?.twoFactorEnabled
                      ? '2FA is Active'
                      : '2FA is Not Configured'}
                  </p>
                  <p className="text-xs text-gray-500 mb-2">
                    {user?.twoFactorEnabled
                      ? 'User has two-factor authentication enabled for enhanced security.'
                      : 'Enable two-factor authentication to add an extra layer of security to this account.'}
                  </p>
                  {!user?.twoFactorEnabled && (
                    <button className="px-3 py-1 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors text-xs">
                      Setup 2FA
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Security Settings */}
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
                  <p className="text-sm font-medium text-gray-700">
                    Access Logs
                  </p>
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
                  <p className="text-sm font-medium text-gray-700">
                    IP Restrictions
                  </p>
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

          {/* Login Security */}
          <div className="border-t pt-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">
              Login Security
            </h4>
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
                  <p className="text-sm font-medium text-gray-700">
                    Session Timeout
                  </p>
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
          </div>

          {/* Audit & Compliance */}
          <div className="border-t pt-4">
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
                  <label
                    htmlFor="export-logs"
                    className="text-xs text-gray-700"
                  >
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
                  <label
                    htmlFor="sensitive-data"
                    className="text-xs text-gray-700"
                  >
                    Required
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Invitation Settings - Only for Add User */}
          {mode === 'add' && (
            <div className="border-t pt-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">
                Invitation Settings
              </h4>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon path={mdiAccount} size={1} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-1">
                      Email Invitation
                    </p>
                    <p className="text-xs text-blue-700 mb-2">
                      The user will receive an email invitation with a secure
                      link to set up their account. They can choose their own
                      password and complete their profile setup.
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-blue-600">
                      <span>✓ Secure invitation link</span>
                      <span>•</span>
                      <span>✓ Self-service password setup</span>
                      <span>•</span>
                      <span>✓ Profile completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Here you would implement the save logic
              onSave({});
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] rounded-md hover:bg-[#38b2ac]"
          >
            {mode === 'add' ? 'Send Invitation' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
