import { LocalInventoryItem } from '../../types/inventoryTypes';
import { InventoryFilters } from '@/types/inventoryServiceTypes';

export const filterInventoryData = (
  data: LocalInventoryItem[],
  filters: InventoryFilters,
  activeTab: string,
  favorites: Set<string> = new Set()
): LocalInventoryItem[] => {
  return data.filter((item) => {
    // Filter by category
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Filter by location
    if (filters.location && item.location !== filters.location) {
      return false;
    }

    // Filter by status
    if (filters.status && item.status !== filters.status) {
      return false;
    }

    // Filter by price/cost range
    if (filters.minCost !== undefined || filters.maxCost !== undefined) {
      const cost = item.unit_cost || 0;
      if (filters.minCost !== undefined && cost < filters.minCost) return false;
      if (filters.maxCost !== undefined && cost > filters.maxCost) return false;
    }

    // Filter by quantity range
    const filtersWithQuantity = filters as InventoryFilters & {
      minQuantity?: number;
      maxQuantity?: number;
    };
    if (
      filtersWithQuantity.minQuantity !== undefined ||
      filtersWithQuantity.maxQuantity !== undefined
    ) {
      const quantity = item.quantity || 0;
      if (
        filtersWithQuantity.minQuantity !== undefined &&
        quantity < filtersWithQuantity.minQuantity
      )
        return false;
      if (
        filtersWithQuantity.maxQuantity !== undefined &&
        quantity > filtersWithQuantity.maxQuantity
      )
        return false;
    }

    // Filter by tracked only
    if (
      (filters.trackedOnly || filters.tracked || filters.showTrackedOnly) &&
      !item.data?.tracked
    ) {
      return false;
    }

    // Filter by favorites only
    if (
      (filters.favoritesOnly ||
        filters.favorite ||
        filters.showFavoritesOnly) &&
      !favorites.has(item.id)
    ) {
      return false;
    }

    // Filter by search query
    const searchQuery = filters.searchQuery || filters.search;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const searchableFields = [
        item.name || '',
        item.item || '',
        item.category || '',
        item.location || '',
        item.data?.description || '',
        item.data?.sku || '',
      ];

      const matchesSearch = searchableFields.some((field) =>
        (field as string).toLowerCase().includes(query)
      );

      if (!matchesSearch) {
        return false;
      }
    }

    return true;
  });
};
