import { useCallback } from 'react';
import { useInventoryDataManager } from './useInventoryDataManager';
import { InventoryItem, InventoryFilters } from '../../types/inventory';

export const useInventoryRead = () => {
  const { inventoryData } = useInventoryDataManager();

  // Get single item by ID
  const getItem = useCallback(
    (id: string): InventoryItem | null => {
      return inventoryData.find((item) => item.id === id) || null;
    },
    [inventoryData]
  );

  // Get items with optional filters
  const getItems = useCallback(
    (filters?: InventoryFilters): InventoryItem[] => {
      let filteredItems = [...inventoryData];

      if (filters) {
        if (filters.category) {
          filteredItems = filteredItems.filter(
            (item) => item.category === filters.category
          );
        }
        if (filters.status) {
          filteredItems = filteredItems.filter(
            (item) => item.status === filters.status
          );
        }
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          filteredItems = filteredItems.filter(
            (item) =>
              item.name?.toLowerCase().includes(searchLower) ||
              (typeof item.data?.description === 'string' &&
                item.data.description.toLowerCase().includes(searchLower)) ||
              (typeof item.data?.sku === 'string' &&
                item.data.sku.toLowerCase().includes(searchLower))
          );
        }
      }

      return filteredItems;
    },
    [inventoryData]
  );

  // Get items by category
  const getItemsByCategory = useCallback(
    (category: string): InventoryItem[] => {
      return inventoryData.filter((item) => item.category === category);
    },
    [inventoryData]
  );

  // Get items by status
  const getItemsByStatus = useCallback(
    (status: string): InventoryItem[] => {
      return inventoryData.filter((item) => item.status === status);
    },
    [inventoryData]
  );

  // Get items by location
  const getItemsByLocation = useCallback(
    (location: string): InventoryItem[] => {
      return inventoryData.filter((item) => item.location === location);
    },
    [inventoryData]
  );

  // Get items with low stock
  const getLowStockItems = useCallback(
    (threshold: number = 10): InventoryItem[] => {
      return inventoryData.filter((item) => {
        const quantity = item.quantity || 0;
        return quantity <= threshold && quantity > 0;
      });
    },
    [inventoryData]
  );

  // Get out of stock items
  const getOutOfStockItems = useCallback((): InventoryItem[] => {
    return inventoryData.filter((item) => {
      const quantity = item.quantity || 0;
      return quantity === 0;
    });
  }, [inventoryData]);

  // Get items by price range
  const getItemsByPriceRange = useCallback(
    (minPrice: number, maxPrice: number): InventoryItem[] => {
      return inventoryData.filter((item) => {
        const cost = item.unit_cost || 0;
        return cost >= minPrice && cost <= maxPrice;
      });
    },
    [inventoryData]
  );

  // Get items by date range
  const getItemsByDateRange = useCallback(
    (startDate: Date, endDate: Date): InventoryItem[] => {
      return inventoryData.filter((item) => {
        const dateString =
          item.updated_at ||
          (typeof item.data?.createdAt === 'string'
            ? item.data.createdAt
            : null);
        const itemDate = dateString ? new Date(dateString) : new Date();
        return itemDate >= startDate && itemDate <= endDate;
      });
    },
    [inventoryData]
  );

  // Get unique categories
  const getCategories = useCallback((): string[] => {
    const categories = new Set(
      inventoryData
        .map((item) => item.category)
        .filter((cat): cat is string => cat !== null)
    );
    return Array.from(categories).sort();
  }, [inventoryData]);

  // Get unique locations
  const getLocations = useCallback((): string[] => {
    const locations = new Set(
      inventoryData
        .map((item) => item.location)
        .filter((loc): loc is string => loc !== undefined)
    );
    return Array.from(locations).sort();
  }, [inventoryData]);

  // Get unique statuses
  const getStatuses = useCallback((): string[] => {
    const statuses = new Set(
      inventoryData
        .map((item) => item.status)
        .filter((status): status is string => status !== undefined)
    );
    return Array.from(statuses).sort();
  }, [inventoryData]);

  // Get items count
  const getItemsCount = useCallback(
    (filters?: InventoryFilters): number => {
      return getItems(filters).length;
    },
    [getItems]
  );

  // Get total value
  const getTotalValue = useCallback(
    (filters?: InventoryFilters): number => {
      return getItems(filters).reduce((total, item) => {
        const cost = item.unit_cost || 0;
        const quantity = item.quantity || 1;
        return total + cost * quantity;
      }, 0);
    },
    [getItems]
  );

  return {
    getItem,
    getItems,
    getItemsByCategory,
    getItemsByStatus,
    getItemsByLocation,
    getLowStockItems,
    getOutOfStockItems,
    getItemsByPriceRange,
    getItemsByDateRange,
    getCategories,
    getLocations,
    getStatuses,
    getItemsCount,
    getTotalValue,
  };
};
