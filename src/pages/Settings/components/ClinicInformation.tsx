import React from 'react';
import Icon from '@mdi/react';
import { mdiHospital } from '@mdi/js';
import { ClinicInformationProps } from '../types/UserProfileTypes';

const ClinicInformation: React.FC<ClinicInformationProps> = ({ userData }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="bg-purple-100 rounded-lg p-3 mr-4">
            <Icon path={mdiHospital} size={1.5} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Clinic Information
            </h2>
            <p className="text-sm text-gray-500">
              Your assigned clinic and department details
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Facility ID
            </span>
            <p className="text-gray-900">
              {userData.facility_id || 'Not assigned'}
            </p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </span>
            <div className="flex flex-wrap gap-1">
              {userData.department ? (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {userData.department}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Not assigned</span>
              )}
            </div>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </span>
            <div className="flex flex-wrap gap-1">
              {userData.position ? (
                <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {userData.position}
                </span>
              ) : (
                <span className="text-gray-500 text-sm">Not assigned</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClinicInformation;
