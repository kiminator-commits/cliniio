import { useCallback, useMemo } from 'react';
import { TabType, InventoryItem, InventoryFormData } from '@/types/inventory';
import { useAddModalHandlers } from '@/hooks/useAddModalHandlers';
import { useInventoryFormHandlers } from '@/hooks/useInventoryFormHandlers';
import { useFavoriteToggle } from '@/hooks/useFavoriteToggle';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { inventoryServiceFacade } from '@/services/inventory/InventoryServiceFacade';
// import { InventoryServiceFacade } from '@/pages/Inventory/services/inventoryServiceFacade';
import { InventoryActionService } from '@/pages/Inventory/services/inventoryActionService';
import { useInventoryStore } from '@/hooks/useInventoryStore';

/**
 * Hook that contains all business logic for the Inventory page
 * Extracted from the main Inventory component to separate concerns
 */
export const useInventoryPageLogic = () => {
  // Store state management - using explicit store references
  const store = useInventoryStore();

  // keep the other destructured items if you need them
  const {
    formData,
    setFormData,
    isEditMode,
    setEditMode,
    favorites,
    setFavorites,
    expandedSections,
    setExpandedSections,
    openAddModal,
    closeAddModal,
    setActiveTab,
    showTrackedOnly,
    setShowTrackedOnly,
    showFavoritesOnly,
    setShowFavoritesOnly,
    searchQuery,
    setSearchQuery,
  } = store;

  // explicitly grab mergeFormData off the store
  const mergeFormData = store.mergeFormData;

  // runtime guard - logging removed for performance
  if (typeof mergeFormData !== 'function') {
    console.error(
      '❌ mergeFormData is NOT a function! Store might not be wired correctly.'
    );
  }

  // Get data manager for refreshing data
  useInventoryDataManager();

  // Business logic - form handlers
  const { handleToggleSection, handleFormChangeWrapper } =
    useInventoryFormHandlers({
      expandedSections: expandedSections as unknown as string[],
      setExpandedSections: setExpandedSections as unknown as (
        sections: string[]
      ) => void,
      formData,
      setFormData,
      mergeFormData,
    });

  // Business logic - favorite toggle
  const { handleToggleFavorite } = useFavoriteToggle(favorites, setFavorites);

  // Business logic - modal handlers
  const { handleShowAddModal, handleCloseAddModal } = useAddModalHandlers({
    openAddModal,
    closeAddModal,
    setEditMode,
    resetForm: () => {}, // Mock resetForm function
    setExpandedSections,
    setFormData,
  });

  // Business logic - status badge styling (using service)
  const getStatusBadge = useCallback((phase: string) => {
    return (
      inventoryServiceFacade.statusService.getStatusBadge?.(phase) || phase
    );
  }, []);

  // Business logic - status display text (using service)
  const getStatusText = useCallback((phase: string) => {
    return inventoryServiceFacade.statusService.getStatusText?.(phase) || phase;
  }, []);

  // Business logic - category change handler (using service)
  const memoizedCategoryChange = useCallback(
    (tab: TabType) => {
      const stringHandler = (tabString: string) =>
        setActiveTab(tabString as TabType);
      inventoryServiceFacade.categoryService.createCategoryChangeHandler?.(
        stringHandler
      )?.(tab as string);
    },
    [setActiveTab]
  );

  // Business logic - filter handlers (using service)
  const handleToggleTrackedFilter = useCallback(() => {
    inventoryServiceFacade.categoryService.createTrackedFilterHandler?.(
      showTrackedOnly,
      setShowTrackedOnly
    )?.();
  }, [showTrackedOnly, setShowTrackedOnly]);

  const handleToggleFavoritesFilter = useCallback(() => {
    inventoryServiceFacade.categoryService.createFavoritesFilterHandler?.(
      showFavoritesOnly,
      setShowFavoritesOnly
    )?.();
  }, [showFavoritesOnly, setShowFavoritesOnly]);

  // Business logic - search handler
  const memoizedSetSearchQuery = useCallback(
    (term: string) => setSearchQuery(term),
    [setSearchQuery]
  );

  // Business logic - edit handler
  const handleEditItem = useCallback(
    (item: InventoryItem) => {
      // Convert InventoryItem to InventoryFormData format
      const formDataToSet: InventoryFormData = {
        itemName: item.name || item.item || '',
        category: item.category || '',
        id: item.id,
        location: item.location || '',
        createdAt:
          (item.data?.purchaseDate as string) || new Date().toISOString(),
        supplier: item.supplier || '',
        unit_cost: item.unit_cost || 0,
        unitCost: item.unit_cost || 0,
        notes: (item.data?.notes as string) || '',
        updated_at:
          (item.data?.lastServiced as string) || new Date().toISOString(),
        status: item.status || '',
        quantity: item.quantity || 1,
        reorder_point: item.reorder_point || 0,
        minimumQuantity: 0,
        maximumQuantity: 999,
        // maximumQuantity removed - not in Supabase schema
        barcode: (item.data?.barcode as string) || '',
        sku: (item.data?.sku as string) || '',
        description: (item.data?.description as string) || '',
      };

      // Set form data and open modal in edit mode
      setFormData(formDataToSet);
      setEditMode(true);
      openAddModal();
    },
    [setFormData, setEditMode, openAddModal]
  );

  // Business logic - save handler
  const handleSave = useCallback(async () => {
    if (!formData) return;

    // Build item payload using only columns that exist in DB
    const itemToSave = {
      name: formData.itemName || '',
      category: formData.category || '',
      location: formData.location || '',
      status: formData.status || 'active',
      quantity: formData.quantity || 0,
      unit_cost: formData.unitCost || 0,
      description: formData.description || '',
      notes: formData.notes || '',
      supplier: formData.supplier || '',
      barcode: formData.barcode || '',
      sku: formData.sku || '',
      updated_at: new Date().toISOString(),
    };

    try {
      if (isEditMode && formData.id) {
        // ✅ Update existing
        await InventoryActionService.processItemUpdate(formData.id, itemToSave);
      } else {
        // ✅ Create new
        await InventoryActionService.processItemCreation(itemToSave);
      }
      // Close modal - data will refresh naturally
      handleCloseAddModal();
    } catch (err) {
      console.error('❌ Inventory save failed', err);
    }
  }, [formData, isEditMode, handleCloseAddModal]);

  // Data transformation - filtered tools for modal (using service)
  const filteredTools = useMemo(() => {
    // Note: This needs to be implemented properly with actual data and criteria
    // For now, returning empty array to prevent errors
    return [];
  }, []);

  return {
    // State
    showTrackedOnly,
    showFavoritesOnly,
    searchQuery,
    expandedSections,
    favorites,
    filteredTools,
    isEditMode,

    // Handlers
    handleShowAddModal,
    handleCloseAddModal,
    handleEditItem,
    handleToggleTrackedFilter,
    handleToggleFavoritesFilter,
    onCategoryChange: memoizedCategoryChange,
    setSearchTerm: memoizedSetSearchQuery,
    handleSave,
    handleToggleSection,
    handleFormChangeWrapper,
    handleToggleFavorite,
    getStatusBadge,
    getStatusText,
  };
};
