import { useInventoryDashboardContext } from '@/hooks/inventory/useInventoryDashboardContext';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useAddModalHandlers } from '@/hooks/useAddModalHandlers';
import { InventoryFormData } from '@/types/inventory';
import { useInventoryDataAccess } from '@/hooks/inventory/useInventoryDataAccess';

export const useInventoryTableData = () => {
  const context = useInventoryDashboardContext();

  const { handleShowAddModal } = context;

  // Get all values from store
  const {
    activeTab,
    showFilters,
    itemsPerPage,
    setItemsPerPage,
    setEditMode,
    resetForm,
    setExpandedSections,
    setFormData,
    openAddModal,
  } = useInventoryStore();

  // Get the edit handler from useAddModalHandlers
  const { handleEditClick } = useAddModalHandlers({
    openAddModal,
    closeAddModal: () => {}, // Mock function since not available
    setEditMode,
    resetForm,
    setExpandedSections: setExpandedSections as (
      sections: Record<string, boolean>
    ) => void,
    setFormData: (data: InventoryFormData) => setFormData(data),
  });

  // Get data from centralized inventory system
  const { getAllItems } = useInventoryDataAccess();
  const allItems = getAllItems();

  // Filter data by category for current tab count calculation
  const filteredData = allItems.filter((item) => item.category === 'Tools');
  const filteredSuppliesData = allItems.filter(
    (item) => item.category === 'Supplies'
  );
  const filteredEquipmentData = allItems.filter(
    (item) => item.category === 'Equipment'
  );
  const filteredOfficeHardwareData = allItems.filter(
    (item) => item.category === 'Office Hardware'
  );

  // Calculate current tab count
  const currentTabCount =
    activeTab === 'tools'
      ? filteredData.length
      : activeTab === 'supplies'
        ? filteredSuppliesData.length
        : activeTab === 'equipment'
          ? filteredEquipmentData.length
          : activeTab === 'officeHardware'
            ? filteredOfficeHardwareData.length
            : 0;

  return {
    // Data
    currentTabCount,

    // UI State
    activeTab,
    showFilters,
    itemsPerPage,

    // Actions
    handleShowAddModal,
    handleEditClick,
    handleDeleteItem: () => {
      // Implementation would depend on your delete logic
    },

    // Store setters
    setItemsPerPage,
  };
};
