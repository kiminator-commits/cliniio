import { useInventoryDashboardContext } from '@/hooks/inventory/useInventoryDashboardContext';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useFilteredInventoryData } from '@/hooks/useFilteredInventoryData';
import { useAddModalHandlers } from '@/hooks/useAddModalHandlers';
import {
  inventoryData as staticInventoryData,
  suppliesData as staticSuppliesData,
  equipmentData as staticEquipmentData,
  officeHardwareData as staticOfficeHardwareData,
} from '@/utils/Inventory/inventoryData';

export const useInventoryTableData = () => {
  const context = useInventoryDashboardContext();

  const {
    showTrackedOnly,
    showFavoritesOnly,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    handleShowAddModal,
    handleToggleFavorite,
  } = context;

  // Get all values from store
  const {
    activeTab,
    showFilters,
    setShowFilters,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    itemsPerPage,
    setItemsPerPage,
    setEditMode,
    resetFormData,
    setExpandedSections,
    setFormData,
    toggleAddModal,
  } = useInventoryStore();

  // Get the edit handler from useAddModalHandlers
  const { handleEditClick } = useAddModalHandlers({
    toggleAddModal,
    setEditMode,
    resetFormData,
    setExpandedSections,
    setFormData,
  });

  // Get filtered data from hook
  const { filteredData, filteredSuppliesData, filteredEquipmentData, filteredOfficeHardwareData } =
    useFilteredInventoryData({
      searchQuery: '',
      localInventoryData: staticInventoryData,
      localSuppliesData: staticSuppliesData,
      localEquipmentData: staticEquipmentData,
      localOfficeHardwareData: staticOfficeHardwareData,
    });

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

  // Compatible filters object
  const compatibleFilters = {
    searchQuery: '',
    category: '',
    location: '',
    showTrackedOnly,
    showFavoritesOnly,
  };

  return {
    // Data
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    currentTabCount,
    compatibleFilters,

    // UI State
    activeTab,
    showFilters,
    itemsPerPage,
    showTrackedOnly,
    showFavoritesOnly,

    // Actions
    handleShowAddModal,
    handleEditClick,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    handleDeleteItem: () => {
      // Implementation would depend on your delete logic
      console.log('Delete item');
    },
    handleToggleFavorite,

    // Store setters
    setShowFilters,
    setSearchQuery,
    setCategoryFilter,
    setLocationFilter,
    setItemsPerPage,
  };
};
