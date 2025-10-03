import React from 'react';
import { BaseModal } from '@/components/BaseModal';
import { InventoryItem } from '@/types/inventoryTypes';
import Icon from '@mdi/react';
import { mdiAlert, mdiDelete } from '@mdi/js';

interface DeleteConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  item: InventoryItem | null;
  isLoading?: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  item,
  isLoading = false,
}) => {
  if (!item) return null;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <BaseModal
      show={show}
      onClose={onClose}
      title="Confirm Deletion"
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button
            onClick={handleCancel}
            disabled={isLoading}
            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md font-medium transition-colors duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Deleting...
              </>
            ) : (
              <>
                <Icon path={mdiDelete} size={0.8} />
                Delete
              </>
            )}
          </button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <Icon path={mdiAlert} size={1.2} className="text-red-600" />
          </div>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Delete "{item.name}"?
          </h3>
          <p className="text-gray-600 mb-4">
            This action cannot be undone. The item will be permanently removed
            from the inventory.
          </p>
          <div className="bg-gray-50 rounded-md p-3">
            <div className="text-sm text-gray-700">
              <div className="flex justify-between mb-1">
                <span className="font-medium">Item:</span>
                <span>{item.name}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Category:</span>
                <span>{item.category}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="font-medium">Location:</span>
                <span>{item.location}</span>
              </div>
              {item.quantity !== undefined && (
                <div className="flex justify-between">
                  <span className="font-medium">Quantity:</span>
                  <span>{item.quantity}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default DeleteConfirmationModal;
