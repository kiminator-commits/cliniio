import { useCallback } from 'react';
import { useModalState } from './useModalState';
import { useInventoryStore } from '../../store/useInventoryStore';
import { InventoryItem, InventoryFormData } from '../../types/inventory';
import { inventoryServiceFacade } from '../../services/inventory/InventoryServiceFacade';
import { useCentralizedInventoryData } from '../useCentralizedInventoryData';
import { Json } from '../../types/supabase';

/**
 * Hook to manage inventory modal business logic
 * Extracts modal operations from UI components
 */
export const useInventoryModals = () => {
  const modalState = useModalState();
  const { refreshData } = useCentralizedInventoryData();
  const {
    // Search and filter state
    searchQuery,
    setSearchQuery,
    favorites,
    setFavorites,

    // Track modal state
    trackedItems,
    trackingData,
    toggleTrackedItem,
  } = useInventoryStore();

  // Handler for form changes in add/edit modal
  const handleFormChange = useCallback(
    (field: string, value: string) => {
      console.log(`🔄 Form field changed: ${field} = "${value}"`);
      console.log('📝 Current form data before update:', modalState.formData);
      console.log('🔍 Calling updateField with:', field, value);
      // Use updateField to properly update individual fields
      modalState.updateField(field as keyof InventoryFormData, value);
      console.log('📝 Form data after update should be updated in store');
    },
    [modalState]
  );

  // Handler for toggling sections in add/edit modal
  const toggleSection = useCallback(
    (section: keyof typeof modalState.expandedSections) => {
      modalState.setExpandedSections({
        ...modalState.expandedSections,
        [section]: !modalState.expandedSections[section],
      });
    },
    [modalState]
  );

  // Convert FormData to InventoryItem format for saving
  const convertFormDataToItem = useCallback(
    (
      formData: InventoryFormData
    ): Omit<InventoryItem, 'id' | 'lastUpdated'> => {
      // Parse cost from text input
      const parseCost = (costText?: string | number): number => {
        if (!costText) return 0;
        if (typeof costText === 'number') return costText;

        // Remove currency symbols and commas, then parse
        const cleanCost = costText.toString().replace(/[$,\s]/g, '');
        const parsed = parseFloat(cleanCost);
        return isNaN(parsed) ? 0 : parsed;
      };

      const parsedCost = parseCost(formData.unitCost);
      console.log(`💰 Cost parsing: "${formData.unitCost}" -> ${parsedCost}`);

      const itemToSave: Omit<InventoryItem, 'id' | 'lastUpdated'> = {
        name: formData.itemName || '',
        category: formData.category || '',
        location: formData.location || '',
        status: formData.status || 'Active',
        quantity: formData.quantity || 1,
        unit_cost: parsedCost,
        facility_id: 'unknown',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        reorder_point: (typeof formData.reorder_point === 'number' ? formData.reorder_point : 0) || 0,
        expiration_date: (typeof formData.expiry_date === 'string' ? formData.expiry_date : '') || '',
        supplier: (typeof formData.supplier === 'string' ? formData.supplier : '') || '',
        cost: parsedCost,
        vendor: (typeof formData.supplier === 'string' ? formData.supplier : '') || '',
        warranty: (typeof formData.warranty === 'string' ? formData.warranty : '') || '',
        maintenance_schedule: '',
        next_due: '',
        service_provider: '',
        assigned_to: '',
        notes: formData.notes || '',
        tool_id: '',
        supply_id: '',
        equipment_id: '',
        hardware_id: '',
        p2_status: '',
        serial_number: (typeof formData.serialNumber === 'string' ? formData.serialNumber : '') || '',
        manufacturer: (typeof formData.manufacturer === 'string' ? formData.manufacturer : '') || '',
        image_url: '',
        tags: [],
        favorite: false,
        tracked: true,
        barcode: formData.barcode || '',
        sku: formData.sku || '',
        description: formData.description || '',
        current_phase: 'Active',
        is_active: true,
        unit: '',
        expiration: (typeof formData.expiry_date === 'string' ? formData.expiry_date : '') || '',
        purchase_date: (typeof formData.purchaseDate === 'string' ? formData.purchaseDate : '') || '',
        last_serviced: '',
        last_updated: new Date().toISOString(),
        data: {
          warranty: formData.warranty || '',
          notes: formData.notes || '',
          purchaseDate: formData.purchaseDate || '',
          supplier: formData.supplier || '',
          manufacturer: formData.manufacturer || '',
          expiry_date: formData.expiry_date || '',
          assetTag: formData.assetTag || '',
          brand: formData.brand || '',
          model: formData.model || '',
          serialNumber: formData.serialNumber || '',
          barcode: formData.barcode || '',
          sku: formData.sku || '',
          description: formData.description || '',
          tags: [],
          imageUrl: '',
          isActive: true,
          tracked: true,
          favorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentPhase: 'Active',
          p2Status: '',
          toolId: '',
          supplyId: '',
          equipmentId: '',
          hardwareId: '',
          serviceProvider: '',
          assignedTo: '',
        } as Json,
      };

      console.log('📦 Converted item to save:', itemToSave);
      return itemToSave;
    },
    []
  );

  // Handler for saving item in add/edit modal
  const handleSaveItem = useCallback(async () => {
    try {
      console.log('🔄 Starting save process...');
      console.log('📝 Form data:', modalState.formData);

      const itemToSave = convertFormDataToItem({
        ...modalState.formData,
        name: modalState.formData.itemName,
        category: modalState.formData.category,
        quantity: modalState.formData.quantity,
        location: modalState.formData.location,
        manufacturer: modalState.formData.manufacturer,
        supplier: modalState.formData.supplier,
        expiry_date: modalState.formData.expiry_date,
      });
      console.log('💾 Item to save:', itemToSave);

      if (modalState.isEditMode) {
        // Update existing item
        if (modalState.formData.id) {
          console.log('✏️ Updating existing item...');
          const updateResponse = await inventoryServiceFacade.updateItem(
            modalState.formData.id,
            itemToSave
          );
          console.log('✅ Update response:', updateResponse);

          // Check for errors
          if (updateResponse.error) {
            throw new Error(`Update failed: ${updateResponse.error}`);
          }

          // Refresh the form data with the updated item
          if (updateResponse.data) {
            console.log('✅ Item updated successfully:', updateResponse.data);
            const convertItemToFormData = (
              item: InventoryItem
            ): InventoryFormData => ({
              itemName: item.name || item.item || '',
              category: item.category || '',
              id: item.id || '',
              location: item.location || '',
              createdAt:
                (item.data as { purchaseDate?: string })?.purchaseDate ||
                new Date().toISOString(),
              supplier: item.supplier || '',
              unit_cost: item.unit_cost || 0,
              notes: (item.data as { notes?: string })?.notes || '',
              updated_at:
                (item.data as { lastServiced?: string })?.lastServiced ||
                new Date().toISOString(),
              status: item.status || '',
              quantity: item.quantity || 1,
              reorder_point: item.reorder_point || 0,
              barcode: (item.data as { barcode?: string })?.barcode || '',
              sku: (item.data as { sku?: string })?.sku || '',
              description:
                (item.data as { description?: string })?.description || '',
              unitCost: item.unit_cost || 0,
              minimumQuantity: 0,
              maximumQuantity: 1000,
              warranty: (item.data as { warranty?: string })?.warranty || '',
              purchaseDate: (item.data as { purchaseDate?: string })?.purchaseDate || '',
              expiry_date: (item.data as { expiry_date?: string })?.expiry_date || '',
              assetTag: (item.data as { assetTag?: string })?.assetTag || '',
              brand: (item.data as { brand?: string })?.brand || '',
              model: (item.data as { model?: string })?.model || '',
              serialNumber: (item.data as { serialNumber?: string })?.serialNumber || '',
              manufacturer: item.manufacturer || '',
            });
            const updatedFormData = convertItemToFormData(updateResponse.data);
            modalState.setFormData(updatedFormData);
          } else {
            throw new Error('Update succeeded but no data returned');
          }
        }
      } else {
        // Add new item
        console.log('➕ Creating new item...');
        const createResponse =
          await inventoryServiceFacade.createItem(itemToSave as InventoryItem);
        console.log('✅ Create response:', createResponse);

        // Check for errors
        if (createResponse.error) {
          throw new Error(`Create failed: ${createResponse.error}`);
        }

        if (!createResponse.data) {
          throw new Error('Create succeeded but no data returned');
        }
      }

      console.log('✅ Item saved successfully!');

      // Refresh the inventory data to update tables and analytics
      console.log('🔄 Refreshing inventory data...');
      await refreshData();
      console.log('✅ Inventory data refreshed!');

      // Force a re-render of analytics by triggering a cache clear
      console.log('🧹 Clearing analytics cache...');
      inventoryServiceFacade.clearCache();
      console.log('✅ Analytics cache cleared!');

      // Don't close modal immediately - let user see the updated data
      // modalState.closeAddModal();
    } catch (error) {
      console.error('❌ Failed to save item:', error);
      // You could add error handling here (show toast, etc.)
    }
  }, [modalState, convertFormDataToItem, refreshData]);

  // Handler for deleting an item
  const handleDeleteItem = useCallback(() => {}, []);

  // Handler for toggling favorite status
  const toggleFavorite = useCallback(
    (itemId: string) => {
      const newFavorites = new Set(favorites);
      if (newFavorites.has(itemId)) {
        newFavorites.delete(itemId);
      } else {
        newFavorites.add(itemId);
      }
      setFavorites(Array.from(newFavorites));
    },
    [favorites, setFavorites]
  );

  // Handler for tracking an item
  const handleTrackItem = useCallback(
    (itemId: string, doctor: string) => {
      toggleTrackedItem(itemId, doctor);
    },
    [toggleTrackedItem]
  );

  // Handler for search term changes in track modal
  const handleSearchChange = useCallback(
    (term: string) => {
      setSearchQuery(term);
    },
    [setSearchQuery]
  );

  // Handler for opening edit modal with item data
  const handleEditItem = useCallback(
    (item: InventoryItem) => {
      const convertItemToFormData = (
        item: InventoryItem
      ): InventoryFormData => ({
        itemName: item.name || item.item || '',
        category: item.category || '',
        id: item.id || '',
        location: item.location || '',
        createdAt:
          (item.data as { purchaseDate?: string })?.purchaseDate ||
          new Date().toISOString(),
        supplier: item.supplier || '',
        unit_cost: item.unit_cost || 0,
        notes: (item.data as { notes?: string })?.notes || '',
        updated_at:
          (item.data as { lastServiced?: string })?.lastServiced ||
          new Date().toISOString(),
        status: item.status || '',
        quantity: item.quantity || 1,
        reorder_point: item.reorder_point || 0,
        barcode: (item.data as { barcode?: string })?.barcode || '',
        sku: (item.data as { sku?: string })?.sku || '',
        description: (item.data as { description?: string })?.description || '',
        unitCost: item.unit_cost || 0,
        minimumQuantity: 0,
        maximumQuantity: 1000,
        warranty: (item.data as { warranty?: string })?.warranty || '',
        purchaseDate: (item.data as { purchaseDate?: string })?.purchaseDate || '',
        expiry_date: (item.data as { expiry_date?: string })?.expiry_date || '',
        assetTag: (item.data as { assetTag?: string })?.assetTag || '',
        brand: (item.data as { brand?: string })?.brand || '',
        model: (item.data as { model?: string })?.model || '',
        serialNumber: (item.data as { serialNumber?: string })?.serialNumber || '',
        manufacturer: item.manufacturer || '',
      });
      const formData = convertItemToFormData(item);
      modalState.openEditModal(formData);
    },
    [modalState]
  );

  // Handler for opening add modal
  const handleAddItem = useCallback(() => {
    modalState.openAddModal();
  }, [modalState]);

  // Handler for cloning an existing item
  const handleCloneItem = useCallback(
    (item: InventoryItem) => {
      console.log('🔄 Cloning item:', item);

      // Convert item to form data
      const convertItemToFormData = (
        item: InventoryItem
      ): InventoryFormData => ({
        itemName: item.name || item.item || '',
        category: item.category || '',
        id: item.id || '',
        location: item.location || '',
        createdAt:
          (item.data as { purchaseDate?: string })?.purchaseDate ||
          new Date().toISOString(),
        supplier: item.supplier || '',
        unit_cost: item.unit_cost || 0,
        notes: (item.data as { notes?: string })?.notes || '',
        updated_at:
          (item.data as { lastServiced?: string })?.lastServiced ||
          new Date().toISOString(),
        status: item.status || '',
        quantity: item.quantity || 1,
        reorder_point: item.reorder_point || 0,
        barcode: (item.data as { barcode?: string })?.barcode || '',
        sku: (item.data as { sku?: string })?.sku || '',
        description:
          (item.data as { description?: string })?.description || '',
        unitCost: item.unit_cost || 0,
        minimumQuantity: 0,
        maximumQuantity: 1000,
        warranty: (item.data as { warranty?: string })?.warranty || '',
        purchaseDate: (item.data as { purchaseDate?: string })?.purchaseDate || '',
        expiry_date: (item.data as { expiry_date?: string })?.expiry_date || '',
        assetTag: (item.data as { assetTag?: string })?.assetTag || '',
        brand: (item.data as { brand?: string })?.brand || '',
        model: (item.data as { model?: string })?.model || '',
        serialNumber: (item.data as { serialNumber?: string })?.serialNumber || '',
        manufacturer: item.manufacturer || '',
      });
      const clonedFormData = convertItemToFormData(item);

      // Clear unique identifiers to avoid conflicts
      const cleanedFormData = {
        ...clonedFormData,
        id: '', // Clear unique ID
        barcode: '', // Clear barcode
        itemName: `${clonedFormData.itemName} (Copy)`, // Indicate it's a copy
        createdAt: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('📋 Cloned form data:', cleanedFormData);

      // Set the cloned data and open add modal
      modalState.setFormData(cleanedFormData);
      modalState.openAddModal();
    },
    [modalState]
  );

  // Handler for cloning current form data (from modal)
  const handleCloneCurrentForm = useCallback(() => {
    console.log('🔄 Cloning current form data');

    // Get current form data and clear unique identifiers
    const currentFormData = modalState.formData;
    const clonedFormData = {
      ...currentFormData,
      id: '', // Clear unique ID
      barcode: '', // Clear barcode
      sku: '', // Clear SKU (if unique)
      itemName: `${currentFormData.itemName} (Copy)`, // Indicate it's a copy
      createdAt: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('📋 Cloned form data:', clonedFormData);

    // Close current modal and open new one with cloned data
    modalState.closeAddModal();
    modalState.setFormData(clonedFormData);
    modalState.openAddModal();
  }, [modalState]);

  // Handler for opening track modal
  const handleOpenTrackModal = useCallback(() => {
    modalState.openTrackModal();
  }, [modalState]);

  // Handler for opening upload barcode modal
  const handleOpenUploadBarcodeModal = useCallback(() => {
    modalState.openUploadBarcodeModal();
  }, [modalState]);

  // Handler for opening scan modal
  const handleOpenScanModal = useCallback(() => {
    modalState.openScanModal();
  }, [modalState]);

  return {
    // Modal state
    ...modalState,

    // Form handlers
    handleFormChange,
    toggleSection,
    handleSaveItem,

    // Item operations
    handleDeleteItem,
    handleEditItem,
    handleAddItem,
    handleCloneItem,
    handleCloneCurrentForm,
    openAddModal: handleAddItem, // Alias for compatibility

    // Track modal handlers
    handleTrackItem,
    handleSearchChange,
    handleOpenTrackModal,

    // Other modal handlers
    handleOpenUploadBarcodeModal,
    handleOpenScanModal,

    // Favorite operations
    toggleFavorite,

    // Current state for modals
    searchQuery,
    favorites,
    trackedItems,
    trackingData,
  };
};
