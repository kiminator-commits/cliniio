import React, { useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import { mdiFileUploadOutline } from '@mdi/js';
import { useInventoryHeaderData } from '@/hooks/inventory/useInventoryHeaderData';
import { useInventoryHeaderKeyboard } from '../InventoryHeaderSection/hooks/useInventoryHeaderKeyboard';

export interface InventoryHeaderActionsProps {
  activeTab: string;
  handleShowAddModal: () => void;
}

export const InventoryHeaderActions: React.FC<InventoryHeaderActionsProps> = ({
  activeTab,
  handleShowAddModal,
}) => {
  const { handleUploadBarcode } = useInventoryHeaderData(handleShowAddModal);

  // Refs for action buttons
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  // Use shared keyboard navigation hook
  const { handleKeyDown } = useInventoryHeaderKeyboard({
    addButtonRef,
    uploadButtonRef,
    handleShowAddModal,
    handleUploadBarcode,
  });

  // Focus management - focus first action button when component mounts
  useEffect(() => {
    if (addButtonRef.current) {
      addButtonRef.current.focus();
    }
  }, []);

  const getAriaLabel = () => {
    const itemType =
      activeTab === 'tools'
        ? 'tool'
        : activeTab === 'supplies'
          ? 'supply'
          : activeTab === 'equipment'
            ? 'equipment'
            : 'office hardware';
    return `Add new ${itemType} to inventory`;
  };

  const getUploadAriaLabel = () => {
    const itemType =
      activeTab === 'tools'
        ? 'tools'
        : activeTab === 'supplies'
          ? 'supplies'
          : activeTab === 'equipment'
            ? 'equipment'
            : 'office hardware';
    return `Upload barcode file for ${itemType}`;
  };

  return (
    <>
      <style>
        {`
            html body .inventory-add-item-button,
            html body button.inventory-add-item-button,
            html body button.inventory-add-item-button.btn,
            html body button.inventory-add-item-button.btn-primary {
              background-color: #4ECDC4 !important;
              border-color: #4ECDC4 !important;
              color: white !important;
            }
            
            html body .inventory-add-item-button:hover,
            html body button.inventory-add-item-button:hover,
            html body button.inventory-add-item-button.btn:hover,
            html body button.inventory-add-item-button.btn-primary:hover {
              background-color: #3db8b0 !important;
              border-color: #3db8b0 !important;
            }
            
            html body .inventory-add-item-button:active,
            html body button.inventory-add-item-button:active,
            html body button.inventory-add-item-button.btn:active,
            html body button.inventory-add-item-button.btn-primary:active {
              background-color: #3db8b0 !important;
              border-color: #3db8b0 !important;
            }
            
            html body .inventory-add-item-button:focus,
            html body button.inventory-add-item-button:focus,
            html body button.inventory-add-item-button.btn:focus,
            html body button.inventory-add-item-button.btn-primary:focus {
              background-color: #4ECDC4 !important;
              border-color: #4ECDC4 !important;
              outline: none !important;
              box-shadow: 0 0 0 2px #4ECDC4, 0 0 0 4px rgba(78, 205, 196, 0.1) !important;
            }
          `}
      </style>
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
            boxShadow: '0 0 0 2px #4ECDC4, 0 0 0 4px rgba(78, 205, 196, 0.1)',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleShowAddModal();
          }}
          onKeyDown={(e) => handleKeyDown(e, 'add')}
          aria-label={getAriaLabel()}
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
          aria-label={getUploadAriaLabel()}
          tabIndex={0}
        >
          <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
        </button>
      </div>
    </>
  );
};
