import React, { useState } from 'react';
import { FormSectionProps } from './types';

const DepartmentSection: React.FC<FormSectionProps> = () => {
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [newDepartment, setNewDepartment] = useState('');

  return (
    <div className="border-t pt-4">
      <h4 className="text-md font-medium text-gray-700 mb-3">
        Department Assignment
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
  );
};

export default DepartmentSection;
