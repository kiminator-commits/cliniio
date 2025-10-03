import React from 'react';
import Icon from '@mdi/react';
import { mdiFileUploadOutline } from '@mdi/js';
import TrackedToolsNotification from '../TrackedToolsNotification';

interface InventoryActionButtonsProps {
  activeTab: string;
  addButtonRef: React.RefObject<HTMLButtonElement>;
  uploadButtonRef: React.RefObject<HTMLButtonElement>;
  handleShowAddModal: () => void;
  handleUploadBarcode: () => void;
  handleKeyDown: (event: React.KeyboardEvent, buttonType: string) => void;
}

/**
 * Action buttons component that provides add item and upload barcode functionality.
 * Handles accessibility, keyboard navigation, and visual styling for inventory actions.
 */
export const InventoryActionButtons: React.FC<InventoryActionButtonsProps> = ({
  activeTab,
  addButtonRef,
  uploadButtonRef,
  handleShowAddModal,
  handleUploadBarcode,
  handleKeyDown,
}) => {
  const getAriaLabel = (action: 'add' | 'upload') => {
    const itemType =
      activeTab === 'tools'
        ? 'tool'
        : activeTab === 'supplies'
          ? 'supply'
          : activeTab === 'equipment'
            ? 'equipment'
            : 'office hardware';

    return action === 'add'
      ? `Add new ${itemType} to inventory`
      : `Upload barcode file for ${itemType}s`;
  };

  const shouldShowTrackedToolsNotification = activeTab === 'tools';

  return (
    <div
      className="flex gap-2"
      role="group"
      aria-label={`${activeTab} management actions`}
    >
      <button
        ref={addButtonRef}
        className="inventory-add-item-button"
        style={{
          backgroundColor: '#4ECDC4',
          borderColor: '#4ECDC4',
          color: 'white',
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: '6px',
          border: '1px solid #4ECDC4',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={handleShowAddModal}
        onKeyDown={(e) => handleKeyDown(e, 'add')}
        aria-label={getAriaLabel('add')}
        tabIndex={0}
      >
        Add Item
      </button>

      <button
        ref={uploadButtonRef}
        className="p-2 text-[#17a2b8] hover:bg-[#17a2b8] hover:text-white rounded-md transition-colors duration-200 border border-[#17a2b8] hover:border-[#17a2b8] focus:outline-none focus:ring-2 focus:ring-[#17a2b8] focus:ring-offset-1"
        title="Upload Barcodes"
        onClick={handleUploadBarcode}
        onKeyDown={(e) => handleKeyDown(e, 'upload')}
        aria-label={getAriaLabel('upload')}
        tabIndex={0}
      >
        <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
      </button>

      {shouldShowTrackedToolsNotification && (
        <TrackedToolsNotification className="ml-2" />
      )}
    </div>
  );
};
