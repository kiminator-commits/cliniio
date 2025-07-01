import { LocalInventoryItem } from '../../types/inventoryTypes';
import { InventoryFilters } from '../../hooks/inventory/useInventoryFilters';

// Filter predicate types
export type FilterPredicate<T = LocalInventoryItem> = (item: T) => boolean;
export type FilterComposer<T = LocalInventoryItem> = (
  ...predicates: FilterPredicate<T>[]
) => FilterPredicate<T>;

// Base filter predicates
export const createTextFilter = (
  searchTerm: string,
  fields: (keyof LocalInventoryItem)[],
  caseSensitive = false
): FilterPredicate => {
  if (!searchTerm.trim()) return () => true;

  const query = caseSensitive ? searchTerm : searchTerm.toLowerCase();

  return (item: LocalInventoryItem) => {
    return fields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        const itemValue = caseSensitive ? value : value.toLowerCase();
        return itemValue.includes(query);
      }
      return false;
    });
  };
};

export const createCategoryFilter = (category: string): FilterPredicate => {
  if (!category) return () => true;
  return (item: LocalInventoryItem) => item.category === category;
};

export const createLocationFilter = (location: string): FilterPredicate => {
  if (!location) return () => true;
  return (item: LocalInventoryItem) => item.location === location;
};

export const createStatusFilter = (status: string): FilterPredicate => {
  if (!status) return () => true;
  return (item: LocalInventoryItem) => {
    const itemStatus =
      (item as Record<string, unknown>).status || (item as Record<string, unknown>).p2Status;
    return itemStatus === status;
  };
};

export const createPriceRangeFilter = (minPrice?: number, maxPrice?: number): FilterPredicate => {
  return (item: LocalInventoryItem) => {
    const cost = item.cost || 0;
    if (minPrice !== undefined && cost < minPrice) return false;
    if (maxPrice !== undefined && cost > maxPrice) return false;
    return true;
  };
};

export const createQuantityRangeFilter = (
  minQuantity?: number,
  maxQuantity?: number
): FilterPredicate => {
  return (item: LocalInventoryItem) => {
    const quantity = (item as Record<string, unknown>).quantity;
    if (quantity === undefined) return true; // Skip items without quantity
    if (minQuantity !== undefined && quantity < minQuantity) return false;
    if (maxQuantity !== undefined && quantity > maxQuantity) return false;
    return true;
  };
};

export const createDateRangeFilter = (startDate?: Date, endDate?: Date): FilterPredicate => {
  return (item: LocalInventoryItem) => {
    if (!startDate && !endDate) return true;

    const itemDate = new Date(
      (item as Record<string, unknown>).purchaseDate ||
        (item as Record<string, unknown>).dateCreated
    );
    if (isNaN(itemDate.getTime())) return true; // Skip items without valid date

    if (startDate && itemDate < startDate) return false;
    if (endDate && itemDate > endDate) return false;
    return true;
  };
};

export const createTrackedOnlyFilter = (showTrackedOnly: boolean): FilterPredicate => {
  if (!showTrackedOnly) return () => true;
  return (item: LocalInventoryItem) => {
    // Check if item has tracking-related fields
    return (
      !!(item as Record<string, unknown>).toolId || !!(item as Record<string, unknown>).supplyId
    );
  };
};

export const createFavoritesFilter = (
  showFavoritesOnly: boolean,
  favorites: Set<string>
): FilterPredicate => {
  if (!showFavoritesOnly) return () => true;
  return (item: LocalInventoryItem) => {
    const itemId =
      (item as Record<string, unknown>).toolId ||
      (item as Record<string, unknown>).supplyId ||
      (item as Record<string, unknown>).equipmentId ||
      (item as Record<string, unknown>).hardwareId;
    return favorites.has(itemId as string);
  };
};

// Filter composers
export const composeFilters: FilterComposer = (...predicates) => {
  return (item: LocalInventoryItem) => {
    return predicates.every(predicate => predicate(item));
  };
};

export const composeOrFilters: FilterComposer = (...predicates) => {
  return (item: LocalInventoryItem) => {
    return predicates.some(predicate => predicate(item));
  };
};

// Tab-specific filter composers
export const createToolFilters = (
  filters: InventoryFilters,
  favorites: Set<string> = new Set()
) => {
  const predicates: FilterPredicate[] = [
    createTextFilter(filters.searchQuery, ['item', 'category', 'toolId', 'location']),
    createCategoryFilter(filters.category),
    createLocationFilter(filters.location),
    createStatusFilter(filters.status || ''),
    createPriceRangeFilter(filters.minPrice, filters.maxPrice),
    createDateRangeFilter(filters.dateCreated?.start, filters.dateCreated?.end),
    createTrackedOnlyFilter(filters.showTrackedOnly || false),
    createFavoritesFilter(filters.showFavoritesOnly || false, favorites),
  ];

  return composeFilters(...predicates);
};

export const createSupplyFilters = (
  filters: InventoryFilters,
  favorites: Set<string> = new Set()
) => {
  const predicates: FilterPredicate[] = [
    createTextFilter(filters.searchQuery, ['item', 'category', 'supplyId', 'location']),
    createCategoryFilter(filters.category),
    createLocationFilter(filters.location),
    createPriceRangeFilter(filters.minPrice, filters.maxPrice),
    createQuantityRangeFilter(filters.minQuantity, filters.maxQuantity),
    createDateRangeFilter(filters.dateCreated?.start, filters.dateCreated?.end),
    createTrackedOnlyFilter(filters.showTrackedOnly || false),
    createFavoritesFilter(filters.showFavoritesOnly || false, favorites),
  ];

  return composeFilters(...predicates);
};

export const createEquipmentFilters = (
  filters: InventoryFilters,
  favorites: Set<string> = new Set()
) => {
  const predicates: FilterPredicate[] = [
    createTextFilter(filters.searchQuery, ['item', 'category', 'equipmentId', 'location']),
    createCategoryFilter(filters.category),
    createLocationFilter(filters.location),
    createStatusFilter(filters.status || ''),
    createPriceRangeFilter(filters.minPrice, filters.maxPrice),
    createDateRangeFilter(filters.dateCreated?.start, filters.dateCreated?.end),
    createFavoritesFilter(filters.showFavoritesOnly || false, favorites),
  ];

  return composeFilters(...predicates);
};

export const createHardwareFilters = (
  filters: InventoryFilters,
  favorites: Set<string> = new Set()
) => {
  const predicates: FilterPredicate[] = [
    createTextFilter(filters.searchQuery, ['item', 'category', 'hardwareId', 'location']),
    createCategoryFilter(filters.category),
    createLocationFilter(filters.location),
    createStatusFilter(filters.status || ''),
    createPriceRangeFilter(filters.minPrice, filters.maxPrice),
    createDateRangeFilter(filters.dateCreated?.start, filters.dateCreated?.end),
    createFavoritesFilter(filters.showFavoritesOnly || false, favorites),
  ];

  return composeFilters(...predicates);
};

// Main filter function
export const filterInventoryData = (
  data: LocalInventoryItem[],
  filters: InventoryFilters,
  activeTab: string,
  favorites: Set<string> = new Set()
): LocalInventoryItem[] => {
  let filterPredicate: FilterPredicate;

  switch (activeTab) {
    case 'tools':
      filterPredicate = createToolFilters(filters, favorites);
      break;
    case 'supplies':
      filterPredicate = createSupplyFilters(filters, favorites);
      break;
    case 'equipment':
      filterPredicate = createEquipmentFilters(filters, favorites);
      break;
    case 'hardware':
      filterPredicate = createHardwareFilters(filters, favorites);
      break;
    default:
      filterPredicate = createTextFilter(filters.searchQuery, ['item', 'category', 'location']);
  }

  return data.filter(filterPredicate);
};

// Utility functions for getting filter options
export const getUniqueCategories = (data: LocalInventoryItem[]): string[] => {
  const categories = new Set(data.map(item => item.category));
  return Array.from(categories).sort();
};

export const getUniqueLocations = (data: LocalInventoryItem[]): string[] => {
  const locations = new Set(data.map(item => item.location));
  return Array.from(locations).sort();
};

export const getUniqueStatuses = (data: LocalInventoryItem[]): string[] => {
  const statuses = new Set(
    data
      .map(
        item =>
          (item as Record<string, unknown>).status || (item as Record<string, unknown>).p2Status
      )
      .filter(Boolean)
  );
  return Array.from(statuses).sort();
};

export const getPriceRange = (data: LocalInventoryItem[]): { min: number; max: number } => {
  const costs = data.map(item => item.cost || 0).filter(cost => cost > 0);
  return {
    min: costs.length > 0 ? Math.min(...costs) : 0,
    max: costs.length > 0 ? Math.max(...costs) : 0,
  };
};

export const getQuantityRange = (data: LocalInventoryItem[]): { min: number; max: number } => {
  const quantities = data
    .map(item => (item as Record<string, unknown>).quantity)
    .filter(quantity => quantity !== undefined && quantity > 0);

  return {
    min: quantities.length > 0 ? Math.min(...quantities) : 0,
    max: quantities.length > 0 ? Math.max(...quantities) : 0,
  };
};

// Filter validation
export const validateFilters = (
  filters: InventoryFilters
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (filters.minPrice > filters.maxPrice) {
      errors.push('Minimum price cannot be greater than maximum price');
    }
  }

  if (filters.minQuantity !== undefined && filters.maxQuantity !== undefined) {
    if (filters.minQuantity > filters.maxQuantity) {
      errors.push('Minimum quantity cannot be greater than maximum quantity');
    }
  }

  if (filters.dateCreated?.start && filters.dateCreated?.end) {
    if (filters.dateCreated.start > filters.dateCreated.end) {
      errors.push('Start date cannot be after end date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
