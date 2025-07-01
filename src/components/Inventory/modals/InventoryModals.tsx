import React, { useEffect, useCallback } from 'react';
import { useInventoryStore } from '../../../store/useInventoryStore';
import AddItemModal from './AddItemModal';
import TrackToolsModal from './TrackToolsModal';
import UploadBarcodeModal from './UploadBarcodeModal';

interface InventoryModalsProps {
  formData: {
    itemName: string;
    category: string;
    id: string;
    location: string;
    purchaseDate: string;
    vendor: string;
    cost: string;
    warranty: string;
    maintenanceSchedule: string;
    lastServiced: string;
    nextDue: string;
    serviceProvider: string;
    assignedTo: string;
    status: string;
    quantity: string;
    notes: string;
  };
  isEditMode: boolean;
  expandedSections: {
    general: boolean;
    purchase: boolean;
    maintenance: boolean;
    usage: boolean;
  };
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  favorites: Set<string>;
  filteredTools: Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;
  handleCloseAddModal: () => void;
  handleSave?: () => void;
  toggleSection: (section: string) => void;
  handleFormChange: (field: string, value: string) => void;
  toggleFavorite: (toolId: string) => void;
  getStatusBadge: (phase: string) => string;
  getStatusText: (phase: string) => string;
  progressInfo?: {
    current: number;
    total: number;
    currentItemName: string;
  };
}

const InventoryModals: React.FC<InventoryModalsProps> = ({
  formData,
  isEditMode,
  expandedSections,
  searchTerm,
  setSearchTerm,
  activeFilter,
  setActiveFilter,
  favorites,
  filteredTools,
  handleCloseAddModal,
  handleSave,
  toggleSection,
  handleFormChange,
  toggleFavorite,
  getStatusBadge,
  getStatusText,
  progressInfo,
}) => {
  const {
    showAddModal,
    showTrackModal,
    trackedItems,
    trackingData,
    toggleTrackedItem,
    showUploadBarcodeModal,
    toggleUploadBarcodeModal,
  } = useInventoryStore();

  // Prevent default drag behaviors
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault();
    };

    document.addEventListener('dragover', preventDefault);
    document.addEventListener('drop', preventDefault);

    return () => {
      document.removeEventListener('dragover', preventDefault);
      document.removeEventListener('drop', preventDefault);
    };
  }, []);

  const toggleTracking = useCallback(
    (toolId: string) => {
      toggleTrackedItem(toolId, 'Current User');
    },
    [toggleTrackedItem]
  );

  return (
    <>
      {/* Add Item Modal */}
      <AddItemModal
        show={showAddModal}
        onHide={handleCloseAddModal}
        formData={formData}
        isEditMode={isEditMode}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        handleFormChange={handleFormChange}
        progressInfo={progressInfo}
        onSave={handleSave}
      />

      {/* Track Tools Modal */}
      {showTrackModal && (
        <TrackToolsModal
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filteredTools={filteredTools}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          trackedItems={trackedItems}
          trackingData={Object.fromEntries(trackingData)}
          toggleTracking={toggleTracking}
          getStatusBadge={getStatusBadge}
          getStatusText={getStatusText}
          handleCloseAddModal={handleCloseAddModal}
        />
      )}

      {/* Upload Barcode Modal */}
      <UploadBarcodeModal show={showUploadBarcodeModal} onClose={toggleUploadBarcodeModal} />
    </>
  );
};

export default InventoryModals;
