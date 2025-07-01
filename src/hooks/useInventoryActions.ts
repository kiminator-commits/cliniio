import { useCallback } from 'react';
import {
  toggleFavorite,
  handleFormChange,
  toggleSection,
  getFormDataFromItem,
  resetAddModalState,
} from '../utils/inventoryHelpers';

interface InventoryState {
  // Search and filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
  showTrackedOnly: boolean;
  setShowTrackedOnly: (show: boolean) => void;

  // Tab and modal state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  showAddModal: boolean;
  setShowAddModal: (show: boolean) => void;
  showTrackModal: boolean;
  setShowTrackModal: (show: boolean) => void;
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  showUploadModal: boolean;
  setShowUploadModal: (show: boolean) => void;
  deletingItem: unknown;
  setDeletingItem: (item: unknown) => void;

  // Track modal search state
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  favorites: Set<string>;
  setFavorites: (favorites: Set<string>) => void;

  // Pagination and filter display state
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Add modal section states
  expandedSections: Record<string, boolean>;
  setExpandedSections: (sections: Record<string, boolean>) => void;

  // Form state for add/edit modal
  formData: Record<string, unknown>;
  setFormData: (data: Record<string, unknown>) => void;

  // Edit mode state
  isEditMode: boolean;
  setIsEditMode: (mode: boolean) => void;

  // Inventory data state
  inventoryData: unknown[];
  setInventoryData: (data: unknown[]) => void;
  suppliesData: unknown[];
  setSuppliesData: (data: unknown[]) => void;
  equipmentData: unknown[];
  setEquipmentData: (data: unknown[]) => void;
  officeHardwareData: unknown[];
  setOfficeHardwareData: (data: unknown[]) => void;
}

export const useInventoryActions = (state: InventoryState) => {
  const {
    setCategoryFilter,
    setLocationFilter,
    setShowTrackedOnly,
    setShowAddModal,
    setShowTrackModal,
    setDeletingItem,
    setFavorites,
    setExpandedSections,
    setFormData,
    setIsEditMode,
    setInventoryData,
    setSuppliesData,
    setEquipmentData,
    setOfficeHardwareData,
  } = state;

  // Mock data and filtered data
  const mockTools: unknown[] = [];
  const filteredTools: unknown[] = [];

  // Event handlers
  const handleToggleFavorite = useCallback(
    (toolId: string) => {
      setFavorites(prev => toggleFavorite(prev, toolId));
    },
    [setFavorites]
  );

  const handleCategoryChange = useCallback((setActiveTab: (tab: string) => void, tab: string) => {
    setActiveTab(tab);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
    if (state.isEditMode) {
      setIsEditMode(false);
      setFormData({});
    } else {
      resetAddModalState(setFormData, setExpandedSections);
    }
  }, [setShowAddModal, state.isEditMode, setIsEditMode, setFormData, setExpandedSections]);

  const handleShowAddModal = useCallback(() => {
    setShowAddModal(true);
  }, [setShowAddModal]);

  const handleCloseTrackModal = useCallback(() => {
    setShowTrackModal(false);
    setFormData({});
  }, [setShowTrackModal, setFormData]);

  const handleEditClick = useCallback(
    (item: unknown) => {
      setFormData(getFormDataFromItem(item));
      setIsEditMode(true);
      setShowAddModal(true);
    },
    [setFormData, setIsEditMode, setShowAddModal]
  );

  const handleDeleteItem = useCallback(
    (item: unknown) => {
      setDeletingItem(item);
    },
    [setDeletingItem]
  );

  const confirmDelete = useCallback(() => {
    if (!state.deletingItem) return;

    const item = state.deletingItem as Record<string, unknown>;
    const itemId = item.toolId || item.supplyId || item.equipmentId || item.hardwareId;

    if (itemId) {
      if (item.toolId) {
        setInventoryData(prev =>
          (prev as unknown[]).filter(
            (i: unknown) => (i as Record<string, unknown>).toolId !== itemId
          )
        );
      } else if (item.supplyId) {
        setSuppliesData(prev =>
          (prev as unknown[]).filter(
            (i: unknown) => (i as Record<string, unknown>).supplyId !== itemId
          )
        );
      } else if (item.equipmentId) {
        setEquipmentData(prev =>
          (prev as unknown[]).filter(
            (i: unknown) => (i as Record<string, unknown>).equipmentId !== itemId
          )
        );
      } else if (item.hardwareId) {
        setOfficeHardwareData(prev =>
          (prev as unknown[]).filter(
            (i: unknown) => (i as Record<string, unknown>).hardwareId !== itemId
          )
        );
      }
    }
    setDeletingItem(null);
  }, [
    state.deletingItem,
    setInventoryData,
    setSuppliesData,
    setEquipmentData,
    setOfficeHardwareData,
    setDeletingItem,
  ]);

  const handleToggleTrackedFilter = useCallback(() => {
    setShowTrackedOnly(prev => !prev);
  }, [setShowTrackedOnly]);

  const handleSetCategoryFilter = useCallback(
    (category: string) => {
      setCategoryFilter(category);
    },
    [setCategoryFilter]
  );

  const handleSetLocationFilter = useCallback(
    (location: string) => {
      setLocationFilter(location);
    },
    [setLocationFilter]
  );

  const handleToggleSectionWrapper = useCallback(
    (section: string) => {
      setExpandedSections(prev => toggleSection(prev, section));
    },
    [setExpandedSections]
  );

  const handleFormChangeWrapper = useCallback(
    (field: string, value: unknown) => {
      setFormData(prev => handleFormChange(prev, field, value));
    },
    [setFormData]
  );

  return {
    // Mock data and filtered data
    mockTools,
    filteredTools,

    // Event handlers
    handleToggleFavorite,
    handleCategoryChange,
    handleCloseAddModal,
    handleShowAddModal,
    handleCloseTrackModal,
    handleEditClick,
    handleDeleteItem,
    confirmDelete,
    handleToggleTrackedFilter,
    handleSetCategoryFilter,
    handleSetLocationFilter,
    handleToggleSectionWrapper,
    handleFormChangeWrapper,
  };
};
