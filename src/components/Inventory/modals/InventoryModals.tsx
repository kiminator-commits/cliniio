import React, { Suspense, lazy } from 'react';
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import {
  INVENTORY_MODAL_CONFIGS,
  ADD_EDIT_ITEM_SECTIONS,
} from '@/config/modalConfig';
import { useInventoryModalSave } from '@/hooks/inventory/useInventoryModalSave';
import ModalContent from './ModalContent';

// Lazy load large modals
const UploadBarcodeModal = lazy(() => import('./UploadBarcodeModal'));
const _EnhancedTrackModal = lazy(() => import('./EnhancedTrackModal'));

/**
 * Refactored InventoryModals component that uses the new modal management system
 * Separates modal content from modal management
 */
const InventoryModals: React.FC = () => {
  const {
    // Modal visibility states
    showAddModal,
    showUploadBarcodeModal,
    showScanModal,

    // Modal close handlers
    closeAddModal,
    closeUploadBarcodeModal,
    closeScanModal,

    // Form and edit mode states
    formData,
    isEditMode,
    expandedSections,

  // Form handlers
  handleFormChange,
  toggleSection,
  handleSaveItem,
  handleCloneCurrentForm,
} = useInventoryModals();

// Use shared save validation hook
const { handleSave } = useInventoryModalSave({
  formData,
  isEditMode,
  handleSaveItem,
});

  // Wrapper function to convert the type mismatch
  const handleToggleSection = (section: string) => {
    toggleSection(section as keyof typeof expandedSections);
  };

  return (
    <>
      {/* Add/Edit Item Modal */}
      <ModalContent
        modalConfig={INVENTORY_MODAL_CONFIGS.ADD_ITEM}
        show={showAddModal}
        onHide={closeAddModal}
        formData={formData}
        isEditMode={isEditMode}
        expandedSections={expandedSections}
        toggleSection={handleToggleSection}
        handleFormChange={handleFormChange}
        onSave={handleSave}
        onClone={handleCloneCurrentForm}
        sections={ADD_EDIT_ITEM_SECTIONS}
      />

      {/* Upload Barcode Modal */}
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">Loading...</div>
        }
      >
        <UploadBarcodeModal
          show={showUploadBarcodeModal}
          onClose={closeUploadBarcodeModal}
        />
      </Suspense>

      {/* Scan Modal - could be refactored to use ModalContent as well */}
      {showScanModal && (
        <ModalContent
          modalConfig={INVENTORY_MODAL_CONFIGS.SCAN_ITEM}
          show={showScanModal}
          onHide={closeScanModal}
          formData={{
            itemName: '',
            category: '',
            id: '',
            location: '',
            status: '',
            quantity: 1,
            unitCost: 0,
            minimumQuantity: 0,
            maximumQuantity: 999,
            supplier: '',
            barcode: '',
            sku: '',
            description: '',
            notes: '',
            updated_at: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          }}
          isEditMode={false}
          expandedSections={{
            general: false,
            purchase: false,
            maintenance: false,
            usage: false,
          }}
          toggleSection={() => {}}
          handleFormChange={() => {}}
        >
          {/* Custom scan modal content would go here */}
          <div className="text-center p-4">
            <h4>Scan Items</h4>
            <p>Scan modal content would be implemented here</p>
          </div>
        </ModalContent>
      )}
    </>
  );
};

export default InventoryModals;
