import React from 'react';
import Icon from '@mdi/react';
import { mdiTrashCan } from '@mdi/js';

interface User {
  name: string;
  email: string;
  role: string;
  status: string;
  lastLogin: string;
  twoFactorEnabled: boolean;
}

interface UserModalsProps {
  showDeleteModal: boolean;
  selectedUser: User | null;
  onCloseDeleteModal: () => void;
  onConfirmDelete: () => void;
}

const UserModals: React.FC<UserModalsProps> = ({
  showDeleteModal,
  selectedUser,
  onCloseDeleteModal,
  onConfirmDelete,
}) => {
  return (
    <>
      {/* Delete User Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 rounded-lg p-2 mr-3">
                <Icon path={mdiTrashCan} size={1.5} className="text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Delete User
              </h3>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-red-600">
                      {selectedUser?.name
                        .split(' ')
                        .map((n: string) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedUser?.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {selectedUser?.email}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser?.role === 'Admin'
                            ? 'bg-red-100 text-red-800'
                            : selectedUser?.role === 'Technician'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {selectedUser?.role}
                      </span>
                      <span
                        className={`inline-flex px-1.5 py-0.5 rounded-full text-xs font-medium ${
                          selectedUser?.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {selectedUser?.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={onCloseDeleteModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserModals;
