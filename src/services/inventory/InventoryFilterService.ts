import {
  LocalInventoryItem,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
} from '@/types/inventoryTypes';

export interface FilterCriteria {
  searchQuery?: string;
  category?: string;
  location?: string;
  status?: string;
  showTrackedOnly?: boolean;
  showFavoritesOnly?: boolean;
  includeInactive?: boolean;
  includeExpired?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface FilterResult<T = LocalInventoryItem> {
  items: T[];
  totalCount: number;
  filteredCount: number;
  appliedFilters: FilterCriteria;
}

export interface InventoryFilterService {
  // Core filtering methods
  filterItems(items: LocalInventoryItem[], criteria: FilterCriteria): FilterResult;
  filterTools(tools: ToolItem[], criteria: FilterCriteria): FilterResult<ToolItem>;
  filterSupplies(supplies: SupplyItem[], criteria: FilterCriteria): FilterResult<SupplyItem>;
  filterEquipment(
    equipment: EquipmentItem[],
    criteria: FilterCriteria
  ): FilterResult<EquipmentItem>;
  filterOfficeHardware(
    hardware: OfficeHardwareItem[],
    criteria: FilterCriteria
  ): FilterResult<OfficeHardwareItem>;

  // Individual filter methods
  filterBySearch(items: LocalInventoryItem[], searchQuery: string): LocalInventoryItem[];
  filterByCategory(items: LocalInventoryItem[], category: string): LocalInventoryItem[];
  filterByLocation(items: LocalInventoryItem[], location: string): LocalInventoryItem[];
  filterByStatus(items: LocalInventoryItem[], status: string): LocalInventoryItem[];
  filterByTracked(items: LocalInventoryItem[], trackedOnly: boolean): LocalInventoryItem[];
  filterByFavorites(items: LocalInventoryItem[], favoritesOnly: boolean): LocalInventoryItem[];
  filterByDateRange(
    items: LocalInventoryItem[],
    startDate: Date,
    endDate: Date
  ): LocalInventoryItem[];

  // Advanced filtering
  filterByMultipleCriteria(
    items: LocalInventoryItem[],
    criteria: FilterCriteria
  ): LocalInventoryItem[];
  filterByCustomPredicate<T extends LocalInventoryItem>(
    items: T[],
    predicate: (item: T) => boolean
  ): T[];

  // Filter utilities
  getAvailableFilters(items: LocalInventoryItem[]): {
    categories: string[];
    locations: string[];
    statuses: string[];
  };
  validateFilterCriteria(criteria: FilterCriteria): { isValid: boolean; errors: string[] };
}

export class InventoryFilterServiceImpl implements InventoryFilterService {
  filterItems(items: LocalInventoryItem[], criteria: FilterCriteria): FilterResult {
    const filteredItems = this.filterByMultipleCriteria(items, criteria);

    return {
      items: filteredItems,
      totalCount: items.length,
      filteredCount: filteredItems.length,
      appliedFilters: criteria,
    };
  }

  filterTools(tools: ToolItem[], criteria: FilterCriteria): FilterResult<ToolItem> {
    const filteredTools = this.filterByMultipleCriteria(tools, criteria) as ToolItem[];

    return {
      items: filteredTools,
      totalCount: tools.length,
      filteredCount: filteredTools.length,
      appliedFilters: criteria,
    };
  }

  filterSupplies(supplies: SupplyItem[], criteria: FilterCriteria): FilterResult<SupplyItem> {
    const filteredSupplies = this.filterByMultipleCriteria(supplies, criteria) as SupplyItem[];

    return {
      items: filteredSupplies,
      totalCount: supplies.length,
      filteredCount: filteredSupplies.length,
      appliedFilters: criteria,
    };
  }

  filterEquipment(
    equipment: EquipmentItem[],
    criteria: FilterCriteria
  ): FilterResult<EquipmentItem> {
    const filteredEquipment = this.filterByMultipleCriteria(equipment, criteria) as EquipmentItem[];

    return {
      items: filteredEquipment,
      totalCount: equipment.length,
      filteredCount: filteredEquipment.length,
      appliedFilters: criteria,
    };
  }

  filterOfficeHardware(
    hardware: OfficeHardwareItem[],
    criteria: FilterCriteria
  ): FilterResult<OfficeHardwareItem> {
    const filteredHardware = this.filterByMultipleCriteria(
      hardware,
      criteria
    ) as OfficeHardwareItem[];

    return {
      items: filteredHardware,
      totalCount: hardware.length,
      filteredCount: filteredHardware.length,
      appliedFilters: criteria,
    };
  }

  filterBySearch(items: LocalInventoryItem[], searchQuery: string): LocalInventoryItem[] {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase().trim();
    const searchableFields = [
      'item',
      'category',
      'location',
      'barcode',
      'toolId',
      'supplyId',
      'equipmentId',
      'hardwareId',
    ];

    return items.filter(item => {
      return searchableFields.some(field => {
        const value = (item as Record<string, unknown>)[field];
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }

  filterByCategory(items: LocalInventoryItem[], category: string): LocalInventoryItem[] {
    if (!category) return items;
    return items.filter(item => item.category === category);
  }

  filterByLocation(items: LocalInventoryItem[], location: string): LocalInventoryItem[] {
    if (!location) return items;
    return items.filter(item => item.location === location);
  }

  filterByStatus(items: LocalInventoryItem[], status: string): LocalInventoryItem[] {
    if (!status) return items;
    return items.filter(item => this.getItemStatus(item) === status);
  }

  filterByTracked(items: LocalInventoryItem[], trackedOnly: boolean): LocalInventoryItem[] {
    if (!trackedOnly) return items;
    return items.filter(item => this.isItemTracked(item));
  }

  filterByFavorites(items: LocalInventoryItem[], favoritesOnly: boolean): LocalInventoryItem[] {
    if (!favoritesOnly) return items;
    return items.filter(item => this.isItemFavorite(item));
  }

  filterByDateRange(
    items: LocalInventoryItem[],
    startDate: Date,
    endDate: Date
  ): LocalInventoryItem[] {
    return items.filter(item => {
      const itemDate = this.getItemDate(item);
      if (!itemDate) return true;

      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  filterByMultipleCriteria(
    items: LocalInventoryItem[],
    criteria: FilterCriteria
  ): LocalInventoryItem[] {
    let filtered = [...items];

    // Apply search filter
    if (criteria.searchQuery) {
      filtered = this.filterBySearch(filtered, criteria.searchQuery);
    }

    // Apply category filter
    if (criteria.category) {
      filtered = this.filterByCategory(filtered, criteria.category);
    }

    // Apply location filter
    if (criteria.location) {
      filtered = this.filterByLocation(filtered, criteria.location);
    }

    // Apply status filter
    if (criteria.status) {
      filtered = this.filterByStatus(filtered, criteria.status);
    }

    // Apply tracked filter
    if (criteria.showTrackedOnly) {
      filtered = this.filterByTracked(filtered, true);
    }

    // Apply favorites filter
    if (criteria.showFavoritesOnly) {
      filtered = this.filterByFavorites(filtered, true);
    }

    // Apply date range filter
    if (criteria.dateRange) {
      filtered = this.filterByDateRange(filtered, criteria.dateRange.start, criteria.dateRange.end);
    }

    // Apply inactive filter
    if (criteria.includeInactive === false) {
      filtered = this.filterOutInactive(filtered);
    }

    // Apply expired filter
    if (criteria.includeExpired === false) {
      filtered = this.filterOutExpired(filtered);
    }

    return filtered;
  }

  filterByCustomPredicate<T extends LocalInventoryItem>(
    items: T[],
    predicate: (item: T) => boolean
  ): T[] {
    return items.filter(predicate);
  }

  getAvailableFilters(items: LocalInventoryItem[]): {
    categories: string[];
    locations: string[];
    statuses: string[];
  } {
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    const locations = [...new Set(items.map(item => item.location).filter(Boolean))];
    const statuses = [...new Set(items.map(item => this.getItemStatus(item)).filter(Boolean))];

    return {
      categories: categories.sort(),
      locations: locations.sort(),
      statuses: statuses.sort(),
    };
  }

  validateFilterCriteria(criteria: FilterCriteria): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate search query
    if (criteria.searchQuery && criteria.searchQuery.length < 2) {
      errors.push('Search query must be at least 2 characters long');
    }

    // Validate date range
    if (criteria.dateRange) {
      if (criteria.dateRange.start > criteria.dateRange.end) {
        errors.push('Start date must be before end date');
      }
    }

    // Validate that we're not filtering by both tracked and favorites
    if (criteria.showTrackedOnly && criteria.showFavoritesOnly) {
      errors.push('Cannot filter by both tracked and favorites simultaneously');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  private getItemStatus(item: LocalInventoryItem): string {
    if ('p2Status' in item) return item.p2Status || '';
    if ('status' in item) return item.status || '';
    if ('quantity' in item) return item.quantity?.toString() || '';
    if ('expiration' in item) return item.expiration || '';
    if ('warranty' in item) return item.warranty || '';
    return '';
  }

  private isItemTracked(item: LocalInventoryItem): boolean {
    return 'tracked' in item ? item.tracked : false;
  }

  private isItemFavorite(item: LocalInventoryItem): boolean {
    return 'favorite' in item ? item.favorite : false;
  }

  private getItemDate(item: LocalInventoryItem): Date | null {
    if ('lastUpdated' in item && item.lastUpdated) {
      return new Date(item.lastUpdated);
    }
    if ('updatedAt' in item && item.updatedAt) {
      return new Date(item.updatedAt);
    }
    if ('expiration' in item && item.expiration) {
      return new Date(item.expiration);
    }
    if ('lastServiced' in item && item.lastServiced) {
      return new Date(item.lastServiced);
    }
    return null;
  }

  private filterOutInactive(items: LocalInventoryItem[]): LocalInventoryItem[] {
    return items.filter(item => {
      const status = this.getItemStatus(item);
      return status !== 'Inactive' && status !== 'inactive';
    });
  }

  private filterOutExpired(items: LocalInventoryItem[]): LocalInventoryItem[] {
    return items.filter(item => {
      if ('expiration' in item && item.expiration) {
        return new Date(item.expiration) > new Date();
      }
      return true;
    });
  }
}
