import React from 'react';
import Icon from '@mdi/react';
import { mdiTrashCan } from '@mdi/js';
import { DeleteAccountModalProps } from '../types/UserProfileTypes';

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onDeleteAccount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 rounded-lg p-2 mr-3">
            <Icon path={mdiTrashCan} size={1.5} className="text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Delete Account
          </h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          This action cannot be undone. This will permanently delete your
          account and remove all your data from our servers.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-sm text-red-800">
            <strong>Warning:</strong> All your data, including personal
            information, activity history, and preferences will be permanently
            deleted.
          </p>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onDeleteAccount}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
