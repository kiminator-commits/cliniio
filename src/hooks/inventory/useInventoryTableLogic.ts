import { useMemo, useEffect, useCallback } from 'react';
import { useInventoryStore } from '@/store/useInventoryStore';
import { usageTrackingService } from '@/services/usageTrackingService';
import { InventoryItem } from '@/types/inventoryTypes';
import { ITEMS_PER_PAGE } from '@/constants/homeUiConstants';

interface UseInventoryTableLogicProps {
  activeTab: string;
  filteredData: InventoryItem[];
  filteredSuppliesData: InventoryItem[];
  filteredEquipmentData: InventoryItem[];
  filteredOfficeHardwareData: InventoryItem[];
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  itemsPerPage?: number;
}

export const useInventoryTableLogic = ({
  activeTab,
  filteredData,
  filteredSuppliesData,
  filteredEquipmentData,
  filteredOfficeHardwareData,
  showTrackedOnly,
  showFavoritesOnly,
  itemsPerPage,
}: UseInventoryTableLogicProps) => {
  const {
    pagination,
    setCurrentPage,
    trackedItems,
    toggleTrackedItem,
    favorites,
  } = useInventoryStore();
  const currentPage = pagination.currentPage;

  // Use provided itemsPerPage or default to ITEMS_PER_PAGE
  const itemsPerPageValue = itemsPerPage || ITEMS_PER_PAGE;

  // Helper function to get item ID
  const getItemId = useCallback((item: InventoryItem): string => {
    return (
      (typeof item.data?.toolId === 'string' ? item.data.toolId : '') ||
      (typeof item.data?.supplyId === 'string' ? item.data.supplyId : '') ||
      (typeof item.data?.equipmentId === 'string'
        ? item.data.equipmentId
        : '') ||
      (typeof item.data?.hardwareId === 'string' ? item.data.hardwareId : '') ||
      item.id
    );
  }, []);

  // Helper function to get status/quantity/expiration/warranty
  const getItemStatus = useCallback((item: InventoryItem): string => {
    // For tools, return currentPhase (sterilization status) if available, otherwise p2Status or status
    if (typeof item.data?.toolId === 'string') {
      const status =
        (typeof item.data?.currentPhase === 'string'
          ? item.data.currentPhase
          : '') ||
        (typeof item.data?.p2Status === 'string' ? item.data.p2Status : '') ||
        (typeof item.status === 'string' ? item.status : '') ||
        '';

      return status;
    }
    // For supplies, return quantity as string
    if (typeof item.data?.supplyId === 'string')
      return item.quantity?.toString() || '0';
    // For equipment and hardware, return status or warranty
    return (
      (typeof item.status === 'string' ? item.status : '') ||
      (typeof item.data?.warranty === 'string' ? item.data.warranty : '') ||
      ''
    );
  }, []);

  // Get filtered and processed items
  const items = useMemo(() => {
    let result: InventoryItem[] = [];
    if (activeTab === 'tools') result = filteredData;
    else if (activeTab === 'supplies') result = filteredSuppliesData;
    else if (activeTab === 'equipment') result = filteredEquipmentData;
    else if (activeTab === 'officeHardware')
      result = filteredOfficeHardwareData;

    // Filter by tracked items if showTrackedOnly is true
    if (showTrackedOnly) {
      result = result.filter((item) => {
        const itemId = getItemId(item);
        return trackedItems.has(itemId);
      });
    }

    // Filter by favorites if showFavoritesOnly is true
    if (showFavoritesOnly) {
      result = result.filter((item) => {
        const itemId = getItemId(item);
        return favorites.includes(itemId);
      });
    }

    return result;
  }, [
    activeTab,
    filteredData,
    filteredSuppliesData,
    filteredEquipmentData,
    filteredOfficeHardwareData,
    showTrackedOnly,
    showFavoritesOnly,
    trackedItems,
    favorites,
    getItemId,
  ]);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPageValue));
  const startIndex = (currentPage - 1) * itemsPerPageValue;
  const endIndex = startIndex + itemsPerPageValue;
  const paginatedItems = items.slice(startIndex, endIndex);

  // Reset to page 1 if items change and currentPage is out of range
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(1);
  }, [items.length, totalPages, currentPage, setCurrentPage]);

  // Auto-reset tracking when sterilization status changes to "bath1"
  useEffect(() => {
    const resetTrackedItems = () => {
      trackedItems.forEach((_, itemId) => {
        const item = items.find((item) => getItemId(item) === itemId);
        if (item && getItemStatus(item) === 'bath1') {
          toggleTrackedItem(itemId, '');
        }
      });
    };

    resetTrackedItems();
  }, [trackedItems, toggleTrackedItem, items, getItemId, getItemStatus]);

  // Track item views when items are rendered
  useEffect(() => {
    items.forEach((item) => {
      const itemId = getItemId(item);
      if (itemId) {
        usageTrackingService.trackItemView(itemId);
      }
    });
  }, [items, getItemId]);

  return {
    items,
    paginatedItems,
    totalPages,
    currentPage,
    itemsPerPageValue,
    getItemId,
    getItemStatus,
  };
};
