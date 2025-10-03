import React from 'react';
import Icon from '@mdi/react';
import { mdiAccount, mdiPencil } from '@mdi/js';
import { BasicInformationProps } from '../types/UserProfileTypes';
import { getRoleBadgeColor } from '../utils/userProfileUtils';

const BasicInformation: React.FC<BasicInformationProps> = ({
  userData,
  formData,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onFormDataChange,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-100 rounded-lg p-3 mr-4">
              <Icon path={mdiAccount} size={1.5} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Basic Information
              </h2>
              <p className="text-sm text-gray-500">
                Your personal and account details
              </p>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Icon path={mdiPencil} size={0.8} className="mr-1" />
              Edit
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Full Name
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-2">
                <input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={(e) =>
                    onFormDataChange({
                      ...formData,
                      first_name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={(e) =>
                    onFormDataChange({ ...formData, last_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                />
              </div>
            ) : (
              <p className="text-gray-900">
                {userData.full_name ||
                  `${formData.first_name} ${formData.last_name}`}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="emailAddress"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            {isEditing ? (
              <input
                id="emailAddress"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  onFormDataChange({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
              />
            ) : (
              <p className="text-gray-900">{userData.email}</p>
            )}
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Role
            </span>
            <span
              className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(userData.role)}`}
            >
              {userData.role}
            </span>
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 text-sm font-medium text-white bg-[#4ECDC4] rounded-md hover:bg-[#38b2ac]"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicInformation;
