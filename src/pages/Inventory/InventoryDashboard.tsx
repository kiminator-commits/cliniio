// React imports
import React, { Suspense, lazy, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

// Component imports
import InventoryHeader from '../../components/Inventory/ui/InventoryHeader';
// import InventoryInsightsCard as _InventoryInsightsCard from '../../components/Inventory/analytics/InventoryInsightsCard';
// import CategoriesCard as _CategoriesCard from '../../components/Inventory/analytics/CategoriesCard';
import { InventoryErrorFallback } from '@/components/Error/InventoryErrorFallback';
import { CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

// Hook imports
import { useInventoryDataAccess } from '@/hooks/inventory/useInventoryDataAccess';
import { useInventoryStore } from '@/hooks/useInventoryStore';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import { useInventoryRealtimeUpdates } from '@/hooks/useInventoryRealtimeUpdates';
import { useInventoryPageLogic } from '@/hooks/inventory/useInventoryPageLogic';

// Service imports
import { InventoryActionService } from './services/inventoryActionService';

// Type imports
import { InventoryItem, ExpandedSections } from '@/types/inventoryTypes';
import { InventoryDashboardContextType } from './types/inventoryDashboardTypes';

// Context imports
import { InventoryDashboardContext } from './context/InventoryDashboardContext';

// Utility imports
import { transformFormDataForModal } from '@/utils/Inventory/formDataUtils';

// Local component imports
import InventoryModalsWrapper from './components/InventoryModalsWrapper';
import ScanModalWrapper from './components/ScanModalWrapper';
import DeleteConfirmationModal from '../../components/Inventory/modals/DeleteConfirmationModal';

// Commented imports (for future use)
// import { useInventoryContext } from '@/hooks/inventory/useInventoryContext';
// import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';

// Lazy load components for better performance
const InventoryTableSection = lazy(
  () => import('@/components/Inventory/InventoryTableSection')
);

// Lazy load heavy analytics components
const InventoryInsightsCardLazy = lazy(
  () => import('../../components/Inventory/analytics/InventoryInsightsCard')
);
const CategoriesCardLazy = lazy(
  () => import('../../components/Inventory/analytics/CategoriesCard')
);

const InventoryDashboard: React.FC = () => {
  // Get data from focused hooks
  const { refreshData } = useInventoryDataAccess();

  // Set up real-time updates for inventory changes
  const { registerRefreshCallback } = useInventoryRealtimeUpdates();

  // Register refresh callback for real-time updates
  React.useEffect(() => {
    const unregister = registerRefreshCallback(() => {
      console.log(
        '🔄 InventoryDashboard received real-time update, refreshing data...'
      );
      refreshData(); // Use the proper refresh method from the hook instead of direct facade call
    });

    return unregister;
  }, [refreshData, registerRefreshCallback]); // Include dependencies

  // Get the properly categorized data from the hook
  const {
    tools: inventoryData,
    supplies: suppliesData,
    equipment: equipmentData,
    officeHardware: officeHardwareData,
  } = useInventoryDataAccess();

  // Get scan modal management
  const { getProgressInfo } = useScanModalManagement();

  // Get form data directly from inventory store
  const {
    formData: storeFormData,
    activeTab,
    showDeleteModal,
    itemToDelete,
    closeDeleteModal,
    showTrackedOnly,
    setShowTrackedOnly,
  } = useInventoryStore();

  // Transform form data for modal - make it reactive to store changes
  const transformedFormData = useMemo(
    () => transformFormDataForModal(storeFormData),
    [storeFormData]
  );

  // Get context values for the dashboard
  const {
    expandedSections,
    handleCloseAddModal,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    handleEditItem,
    handleCloneItem,
    isEditMode,
  } = useInventoryPageLogic();

  // Get setActiveTab from the store before using it in context
  const { setActiveTab } = useInventoryStore();

  // Get current items based on active tab
  const getCurrentItems = useMemo(() => {
    switch (activeTab) {
      case 'tools':
        return inventoryData || [];
      case 'supplies':
        return suppliesData || [];
      case 'equipment':
        return equipmentData || [];
      case 'officeHardware':
        return officeHardwareData || [];
      default:
        return inventoryData || [];
    }
  }, [
    activeTab,
    inventoryData,
    suppliesData,
    equipmentData,
    officeHardwareData,
  ]);

  const contextValue: InventoryDashboardContextType = {
    showTrackedOnly: showTrackedOnly,
    showFavoritesOnly: false, // Default value
    handleShowAddModal: () => {}, // Default empty function
    handleCloseAddModal,
    handleToggleTrackedFilter: () => setShowTrackedOnly(!showTrackedOnly),
    handleToggleFavoritesFilter: () => {}, // Default empty function
    onCategoryChange: (tab: string) =>
      setActiveTab(
        tab as 'tools' | 'supplies' | 'equipment' | 'officeHardware'
      ), // Use setActiveTab from store
    searchTerm: '', // Default empty string
    expandedSections,
    favorites: [], // Default empty array
    filteredTools: [], // Default empty array
    setSearchTerm: () => {}, // Default empty function
    handleToggleFavorite: () => {}, // Default empty function
    handleSave,
    handleToggleSection: handleToggleSection as (
      section: keyof ExpandedSections
    ) => void,
    handleFormChangeWrapper: handleFormChangeWrapper as (
      field: string,
      value: unknown
    ) => void,
    getStatusBadge: (status: string) => status, // Default return status as-is
    getStatusText: (status: string) => status, // Default return status as-is
  };

  // Handle delete item using the action service
  const handleDeleteItem = async (item: InventoryItem) => {
    try {
      await InventoryActionService.handleDeleteItem(
        item.id,
        () => {
          console.log('Item deleted successfully');
          refreshData(); // Refresh the data after deletion
        },
        (error: string) => {
          console.error('Failed to delete item:', error);
          // You could add a toast notification here
        }
      );
    } catch (error) {
      console.error('Error in delete handler:', error);
    }
  };

  // Handle archive confirmation
  const handleArchiveConfirm = async () => {
    if (!itemToDelete) return;

    try {
      await InventoryActionService.handleArchiveItem(
        itemToDelete.id,
        () => {
          console.log('Item archived successfully');
          closeDeleteModal();
          refreshData(); // Refresh the data after archiving
        },
        (error: string) => {
          console.error('Failed to archive item:', error);
          // You could add a toast notification here
        }
      );
    } catch (error) {
      console.error('Error in archive handler:', error);
    }
  };

  // Construct the proper InventoryData object for the insights card
  const insightsData = {
    tools: inventoryData,
    supplies: suppliesData,
    equipment: equipmentData,
    officeHardware: officeHardwareData,
  };

  // Debug: Log the data being passed to insights card - only when data changes
  React.useEffect(() => {
    console.log('🏠 InventoryDashboard insights data:', {
      tools: inventoryData?.length || 0,
      supplies: suppliesData?.length || 0,
      equipment: equipmentData?.length || 0,
      officeHardware: officeHardwareData?.length || 0,
      total:
        (inventoryData?.length || 0) +
        (suppliesData?.length || 0) +
        (equipmentData?.length || 0) +
        (officeHardwareData?.length || 0),
    });
  }, [inventoryData, suppliesData, equipmentData, officeHardwareData]);

  return (
    <InventoryDashboardContext.Provider
      value={contextValue as InventoryDashboardContextType}
    >
      <ErrorBoundary fallback={<InventoryErrorFallback />}>
        <div className="p-4 md:p-6 space-y-4 md:space-y-6">
          <InventoryHeader />
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col gap-4 lg:w-1/4 pl-0 md:pl-4">
              <Suspense fallback={<CardSkeleton />}>
                <InventoryInsightsCardLazy data={insightsData} />
              </Suspense>
              <Suspense fallback={<CardSkeleton />}>
                <CategoriesCardLazy
                  onCategoryChange={(tab) => setActiveTab(tab)}
                  counts={{
                    tools: inventoryData?.length || 0,
                    supplies: suppliesData?.length || 0,
                    equipment: equipmentData?.length || 0,
                    officeHardware: officeHardwareData?.length || 0,
                  }}
                />
              </Suspense>
            </div>
            <div className="flex-1 pr-0 md:pr-4">
              <Suspense fallback={<TableSkeleton rows={8} columns={5} />}>
                <div
                  className="bg-white rounded-lg shadow p-4 md:p-6 w-full max-w-full flex flex-col min-h-fit"
                  style={{ borderLeft: '4px solid rgba(78, 205, 196, 0.5)' }}
                  role="region"
                  aria-label="inventory table and controls"
                >
                  <InventoryTableSection
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                    onClone={handleCloneItem}
                    items={getCurrentItems}
                  />
                </div>
              </Suspense>
            </div>
          </div>

          <InventoryModalsWrapper
            isEditMode={isEditMode}
            formData={transformedFormData}
            progressInfo={getProgressInfo()}
          />

          {/* Scan Modal */}
          <ScanModalWrapper />

          {/* Delete Confirmation Modal */}
          <DeleteConfirmationModal
            show={showDeleteModal}
            onClose={closeDeleteModal}
            onConfirm={handleArchiveConfirm}
            item={itemToDelete}
            activeTab={activeTab}
          />
        </div>
      </ErrorBoundary>
    </InventoryDashboardContext.Provider>
  );
};

export default InventoryDashboard;
