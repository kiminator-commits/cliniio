import React from 'react';
import { useInventoryModals } from '@/hooks/inventory/useInventoryModals';
import { INVENTORY_MODAL_CONFIGS, ADD_EDIT_ITEM_SECTIONS } from '@/config/modalConfig';
import { validateFormData } from '@/config/modalConfig';
import ModalContent from './ModalContent';
import TrackToolsModal from './TrackToolsModal';
import UploadBarcodeModal from './UploadBarcodeModal';

/**
 * Refactored InventoryModals component that uses the new modal management system
 * Separates modal content from modal management
 */
const InventoryModalsRefactored: React.FC = () => {
  const {
    // Modal visibility states
    showAddModal,
    showTrackModal,
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

    // Track modal state and handlers
    searchQuery,
    favorites,
    trackedItems,
    trackingData,
    handleSearchChange,
    toggleFavorite,
    handleTrackItem,
  } = useInventoryModals();

  // Validate form data before saving
  const handleSave = () => {
    const errors = validateFormData(formData);
    if (Object.keys(errors).length === 0) {
      handleSaveItem();
    } else {
      // Handle validation errors - could show toast or error messages
      console.error('Validation errors:', errors);
      // For now, just prevent save
      return;
    }
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
        toggleSection={toggleSection}
        handleFormChange={handleFormChange}
        onSave={handleSave}
        sections={ADD_EDIT_ITEM_SECTIONS}
      />

      {/* Track Tools Modal */}
      {showTrackModal && (
        <TrackToolsModal
          searchTerm={searchQuery}
          setSearchTerm={handleSearchChange}
          activeFilter="all"
          setActiveFilter={() => {}} // Could be added to modal config if needed
          filteredTools={[]} // This would come from a service or hook
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          trackedItems={trackedItems}
          trackingData={Object.fromEntries(trackingData)}
          toggleTracking={handleTrackItem}
          getStatusBadge={(phase: string) => `badge-${phase}`} // Could be moved to service
          getStatusText={(phase: string) => phase} // Could be moved to service
          handleCloseAddModal={closeAddModal}
        />
      )}

      {/* Upload Barcode Modal */}
      <UploadBarcodeModal show={showUploadBarcodeModal} onClose={closeUploadBarcodeModal} />

      {/* Scan Modal - could be refactored to use ModalContent as well */}
      {showScanModal && (
        <ModalContent
          modalConfig={INVENTORY_MODAL_CONFIGS.SCAN_ITEM}
          show={showScanModal}
          onHide={closeScanModal}
          formData={{}}
          isEditMode={false}
          expandedSections={{}}
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

export default InventoryModalsRefactored;
