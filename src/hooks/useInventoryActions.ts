import { useCallback } from 'react';
import {
  toggleFavorite,
  resetAddModalState,
  getFormDataFromItem,
  toggleSection,
  handleFormChange,
} from '../utils/inventoryHelpers';
import { InventoryItem, ExpandedSections } from '../types/inventoryTypes';
import { InventoryFormData } from '../types/inventory';

interface InventoryState {
  // Search and filter state
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  locationFilter: string;
  setLocationFilter: (filter: string) => void;
  showTrackedOnly: boolean;
  setShowTrackedOnly: React.Dispatch<React.SetStateAction<boolean>>;

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
  setFavorites: React.Dispatch<React.SetStateAction<Set<string>>>;

  // Pagination and filter display state
  itemsPerPage: number;
  setItemsPerPage: (items: number) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;

  // Add modal section states
  expandedSections: ExpandedSections;
  setExpandedSections: React.Dispatch<React.SetStateAction<ExpandedSections>>;

  // Form state for add/edit modal
  formData: InventoryFormData;
  setFormData: React.Dispatch<React.SetStateAction<InventoryFormData>>;

  // Edit mode state
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;

  // Inventory data state
  inventoryData: InventoryItem[];
  setInventoryData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  suppliesData: InventoryItem[];
  setSuppliesData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  equipmentData: InventoryItem[];
  setEquipmentData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
  officeHardwareData: InventoryItem[];
  setOfficeHardwareData: React.Dispatch<React.SetStateAction<InventoryItem[]>>;
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
  const mockTools: InventoryItem[] = [];
  const filteredTools: InventoryItem[] = [];

  // Event handlers
  const handleToggleFavorite = useCallback(
    (toolId: string) => {
      setFavorites((prev) => toggleFavorite(prev, toolId));
    },
    [setFavorites]
  );

  const handleCategoryChange = useCallback(
    (setActiveTab: (tab: string) => void, tab: string) => {
      setActiveTab(tab);
    },
    []
  );

  const handleCloseAddModal = useCallback(() => {
    setShowAddModal(false);
    if (state.isEditMode) {
      setIsEditMode(false);
      setFormData({} as InventoryFormData);
    } else {
      resetAddModalState(setFormData, setIsEditMode, setExpandedSections);
    }
  }, [
    setShowAddModal,
    state.isEditMode,
    setIsEditMode,
    setFormData,
    setExpandedSections,
  ]);

  const handleShowAddModal = useCallback(() => {
    setShowAddModal(true);
  }, [setShowAddModal]);

  const handleCloseTrackModal = useCallback(() => {
    setShowTrackModal(false);
    setFormData({} as InventoryFormData);
  }, [setShowTrackModal, setFormData]);

  const handleEditClick = useCallback(
    (item: InventoryItem) => {
      const formData = getFormDataFromItem(item);
      setFormData({
        ...formData,
        itemName: formData.itemName || '',
      });
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
    const itemData = item.data as Record<string, unknown> | undefined;
    const itemId =
      itemData?.toolId ||
      itemData?.supplyId ||
      itemData?.equipmentId ||
      itemData?.hardwareId;

    if (itemId) {
      if (itemData?.toolId) {
        setInventoryData((prev) =>
          prev.filter((i: InventoryItem) => i.data?.toolId !== itemId)
        );
      } else if (itemData?.supplyId) {
        setSuppliesData((prev) =>
          prev.filter((i: InventoryItem) => i.data?.supplyId !== itemId)
        );
      } else if (itemData?.equipmentId) {
        setEquipmentData((prev) =>
          prev.filter((i: InventoryItem) => i.data?.equipmentId !== itemId)
        );
      } else if (itemData?.hardwareId) {
        setOfficeHardwareData((prev) =>
          prev.filter((i: InventoryItem) => i.data?.hardwareId !== itemId)
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
    setShowTrackedOnly((prev) => !prev);
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
    (section: keyof ExpandedSections) => {
      setExpandedSections((prev) => toggleSection(prev, section));
    },
    [setExpandedSections]
  );

  const handleFormChangeWrapper = useCallback(
    (field: keyof InventoryFormData, value: string) => {
      setFormData((prev) => handleFormChange(prev, field, value));
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
