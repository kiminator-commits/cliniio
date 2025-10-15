import React from 'react';
import Icon from '@mdi/react';
import { mdiClose } from '@mdi/js';
import { UserFormProps } from './UserForm/types';
import BasicInfoSection from './UserForm/BasicInfoSection';
import RolePermissionsSection from './UserForm/RolePermissionsSection';
import DepartmentSection from './UserForm/DepartmentSection';
import SecuritySection from './UserForm/SecuritySection';
import LoginSecuritySection from './UserForm/LoginSecuritySection';

const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onClose,
  user,
  mode,
  onSave,
}) => {
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
          <BasicInfoSection user={user} mode={mode} />
          <RolePermissionsSection user={user} mode={mode} />
          <DepartmentSection user={user} mode={mode} />
          <SecuritySection />
          <LoginSecuritySection user={user} mode={mode} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // Here you would collect form data and call onSave
              onSave({});
              onClose();
            }}
            className="px-4 py-2 bg-[#4ECDC4] text-white rounded-md hover:bg-[#38b2ac] transition-colors"
          >
            {mode === 'add' ? 'Add User' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserForm;
