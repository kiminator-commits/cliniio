import React from 'react';
import { FormSectionProps } from './types';

const BasicInfoSection: React.FC<FormSectionProps> = ({ user, mode }) => {
  return (
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
              (user as { full_name?: string })?.full_name?.split(' ')[0] || ''
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
  );
};

export default BasicInfoSection;
