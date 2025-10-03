import React, { useRef, useEffect } from 'react';
import Icon from '@mdi/react';
import {
  mdiWrench,
  mdiPackageVariant,
  mdiDesktopClassic,
  mdiPrinter3d,
  mdiFileUploadOutline,
} from '@mdi/js';

import { useInventoryHeaderData } from '@/hooks/inventory/useInventoryHeaderData';
import TrackedToolsNotification from './TrackedToolsNotification';

interface Props {
  activeTab: string;
  handleShowAddModal: () => void;
}

const InventoryHeaderSection: React.FC<Props> = ({
  activeTab,
  handleShowAddModal,
}) => {
  const { handleUploadBarcode } = useInventoryHeaderData(handleShowAddModal);

  // Refs for action buttons
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const uploadButtonRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation handler
  const handleKeyDown = (event: React.KeyboardEvent, buttonType: string) => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        if (buttonType === 'add') {
          uploadButtonRef.current?.focus();
        }
        break;
      case 'ArrowLeft':
        event.preventDefault();
        if (buttonType === 'upload') {
          addButtonRef.current?.focus();
        }
        break;
      case 'Enter':
      case ' ': {
        event.preventDefault();
        if (buttonType === 'add') {
          handleShowAddModal();
        } else if (buttonType === 'upload') {
          handleUploadBarcode();
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        // Return focus to a safe fallback
        const bannerElement = event.currentTarget.closest('[role="banner"]');
        if (bannerElement) {
          (bannerElement as HTMLElement).focus();
        }
        break;
      }
    }
  };

  // Focus management - focus first action button when component mounts
  useEffect(() => {
    if (addButtonRef.current) {
      addButtonRef.current.focus();
    }
  }, []);

  return (
    <>
      {activeTab === 'tools' && (
        <div
          className="flex items-center justify-between mb-6 flex-shrink-0"
          role="banner"
          aria-label="Tool management section"
        >
          <h2 className="text-2xl font-bold text-[#5b5b5b] tracking-tight flex items-center">
            <Icon
              path={mdiWrench}
              size={1.1}
              color="#4ECDC4"
              className="mr-2"
              aria-hidden="true"
            />
            Tool Management
          </h2>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Tool management actions"
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
              aria-label="Add new tool to inventory"
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
              aria-label="Upload barcode file for tools"
              tabIndex={0}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
            </button>
            <TrackedToolsNotification className="ml-2" />
          </div>
        </div>
      )}
      {activeTab === 'supplies' && (
        <div
          className="flex items-center justify-between mb-6 flex-shrink-0"
          role="banner"
          aria-label="Supplies management section"
        >
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon
              path={mdiPackageVariant}
              size={1.1}
              color="#4ECDC4"
              className="mr-2"
              aria-hidden="true"
            />
            Supplies Management
          </h2>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Supplies management actions"
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
              aria-label="Add new supply to inventory"
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
              aria-label="Upload barcode file for supplies"
              tabIndex={0}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
            </button>
            <TrackedToolsNotification className="ml-2" />
          </div>
        </div>
      )}
      {activeTab === 'equipment' && (
        <div
          className="flex items-center justify-between mb-6 flex-shrink-0"
          role="banner"
          aria-label="Equipment management section"
        >
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon
              path={mdiPrinter3d}
              size={1.1}
              color="#4ECDC4"
              className="mr-2"
              aria-hidden="true"
            />
            Equipment Management
          </h2>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Equipment management actions"
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
              aria-label="Add new equipment to inventory"
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
              aria-label="Upload barcode file for equipment"
              tabIndex={0}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
      {activeTab === 'officeHardware' && (
        <div
          className="flex items-center justify-between mb-6 flex-shrink-0"
          role="banner"
          aria-label="Office hardware management section"
        >
          <h2 className="text-2xl font-bold text-gray-700 tracking-tight flex items-center">
            <Icon
              path={mdiDesktopClassic}
              size={1.1}
              color="#4ECDC4"
              className="mr-2"
              aria-hidden="true"
            />
            Office Hardware Management
          </h2>
          <div
            className="flex gap-2"
            role="group"
            aria-label="Office hardware management actions"
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
              aria-label="Add new office hardware to inventory"
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
              aria-label="Upload barcode file for office hardware"
              tabIndex={0}
            >
              <Icon path={mdiFileUploadOutline} size={1.2} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default InventoryHeaderSection;
