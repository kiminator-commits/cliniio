import {
  LocalInventoryItem,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
  getItemStatus,
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
  filterItems(
    items: LocalInventoryItem[],
    criteria: FilterCriteria
  ): FilterResult;
  filterTools(
    tools: ToolItem[],
    criteria: FilterCriteria
  ): FilterResult<ToolItem>;
  filterSupplies(
    supplies: SupplyItem[],
    criteria: FilterCriteria
  ): FilterResult<SupplyItem>;
  filterEquipment(
    equipment: EquipmentItem[],
    criteria: FilterCriteria
  ): FilterResult<EquipmentItem>;
  filterOfficeHardware(
    hardware: OfficeHardwareItem[],
    criteria: FilterCriteria
  ): FilterResult<OfficeHardwareItem>;

  // Individual filter methods
  filterBySearch(
    items: LocalInventoryItem[],
    searchQuery: string
  ): LocalInventoryItem[];
  filterByCategory(
    items: LocalInventoryItem[],
    category: string
  ): LocalInventoryItem[];
  filterByLocation(
    items: LocalInventoryItem[],
    location: string
  ): LocalInventoryItem[];
  filterByStatus(
    items: LocalInventoryItem[],
    status: string
  ): LocalInventoryItem[];
  filterByTracked(
    items: LocalInventoryItem[],
    trackedOnly: boolean
  ): LocalInventoryItem[];
  filterByFavorites(
    items: LocalInventoryItem[],
    favoritesOnly: boolean
  ): LocalInventoryItem[];
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
  validateFilterCriteria(criteria: FilterCriteria): {
    isValid: boolean;
    errors: string[];
  };
}

export class InventoryFilterServiceImpl implements InventoryFilterService {
  filterItems(
    items: LocalInventoryItem[],
    criteria: FilterCriteria
  ): FilterResult {
    const filteredItems = this.filterByMultipleCriteria(items, criteria);

    return {
      items: filteredItems,
      totalCount: items.length,
      filteredCount: filteredItems.length,
      appliedFilters: criteria,
    };
  }

  filterTools(
    tools: ToolItem[],
    criteria: FilterCriteria
  ): FilterResult<ToolItem> {
    const filteredTools = this.filterByMultipleCriteria(
      tools,
      criteria
    ) as ToolItem[];

    return {
      items: filteredTools,
      totalCount: tools.length,
      filteredCount: filteredTools.length,
      appliedFilters: criteria,
    };
  }

  filterSupplies(
    supplies: SupplyItem[],
    criteria: FilterCriteria
  ): FilterResult<SupplyItem> {
    const filteredSupplies = this.filterByMultipleCriteria(
      supplies,
      criteria
    ) as SupplyItem[];

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
    const filteredEquipment = this.filterByMultipleCriteria(
      equipment,
      criteria
    ) as EquipmentItem[];

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

  filterBySearch(
    items: LocalInventoryItem[],
    searchQuery: string
  ): LocalInventoryItem[] {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    const searchableFields = [
      'item',
      'category',
      'location',
      'status',
      'p2Status',
      'toolId',
      'supplyId',
      'equipmentId',
      'hardwareId',
    ];

    return items.filter((item) => {
      return searchableFields.some((field) => {
        const value = this.getSafeProperty(item, field);
        return value?.toString().toLowerCase().includes(query);
      });
    });
  }

  filterByCategory(
    items: LocalInventoryItem[],
    category: string
  ): LocalInventoryItem[] {
    if (!category) return items;
    return items.filter((item) => item.category === category);
  }

  filterByLocation(
    items: LocalInventoryItem[],
    location: string
  ): LocalInventoryItem[] {
    if (!location) return items;
    return items.filter((item) => item.location === location);
  }

  filterByStatus(
    items: LocalInventoryItem[],
    status: string
  ): LocalInventoryItem[] {
    if (!status) return items;
    return items.filter((item) => this.getItemStatus(item) === status);
  }

  filterByTracked(
    items: LocalInventoryItem[],
    trackedOnly: boolean
  ): LocalInventoryItem[] {
    if (!trackedOnly) return items;
    return items.filter((item) => this.isItemTracked(item));
  }

  filterByFavorites(
    items: LocalInventoryItem[],
    favoritesOnly: boolean
  ): LocalInventoryItem[] {
    if (!favoritesOnly) return items;
    return items.filter((item) => this.isItemFavorite(item));
  }

  filterByDateRange(
    items: LocalInventoryItem[],
    startDate: Date,
    endDate: Date
  ): LocalInventoryItem[] {
    return items.filter((item) => {
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
      filtered = this.filterByDateRange(
        filtered,
        criteria.dateRange.start,
        criteria.dateRange.end
      );
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
    const categories = [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ];
    const locations = [
      ...new Set(items.map((item) => item.location).filter(Boolean)),
    ];
    const statuses = [
      ...new Set(items.map((item) => this.getItemStatus(item)).filter(Boolean)),
    ];

    return {
      categories: (categories as string[]).sort(),
      locations: (locations as string[]).sort(),
      statuses: (statuses as string[]).sort(),
    };
  }

  validateFilterCriteria(criteria: FilterCriteria): {
    isValid: boolean;
    errors: string[];
  } {
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
    // Use the existing helper function from inventoryTypes
    return getItemStatus(item);
  }

  private isItemTracked(item: LocalInventoryItem): boolean {
    return 'tracked' in item ? Boolean(item.data?.tracked) : false;
  }

  private isItemFavorite(item: LocalInventoryItem): boolean {
    return 'favorite' in item ? Boolean(item.data?.favorite) : false;
  }

  private getItemDate(item: LocalInventoryItem): Date | null {
    if ('lastUpdated' in item && item.lastUpdated) {
      return new Date(item.lastUpdated as string);
    }
    if ('updatedAt' in item && item.data?.updatedAt) {
      return new Date(item.data.updatedAt as string);
    }
    if ('expiration' in item && item.data?.expiration) {
      return new Date(item.data.expiration as string);
    }
    if ('lastServiced' in item && item.data?.lastServiced) {
      return new Date(item.data.lastServiced as string);
    }
    return null;
  }

  private filterOutInactive(items: LocalInventoryItem[]): LocalInventoryItem[] {
    return items.filter((item) => {
      const status = this.getItemStatus(item);
      return status !== 'Inactive' && status !== 'inactive';
    });
  }

  private filterOutExpired(items: LocalInventoryItem[]): LocalInventoryItem[] {
    return items.filter((item) => {
      if ('expiration' in item && item.data?.expiration) {
        return new Date(item.data.expiration as string) > new Date();
      }
      return true;
    });
  }

  private getSafeProperty(item: LocalInventoryItem, field: string): unknown {
    switch (field) {
      case 'item':
        return item.item;
      case 'category':
        return item.category;
      case 'location':
        return item.location;
      case 'status':
        return 'status' in item ? item.status : undefined;
      case 'p2Status':
        return 'p2Status' in item ? item.data?.p2Status : undefined;
      case 'toolId':
        return 'toolId' in item ? item.data?.toolId : undefined;
      case 'supplyId':
        return 'supplyId' in item ? item.data?.supplyId : undefined;
      case 'equipmentId':
        return 'equipmentId' in item ? item.data?.equipmentId : undefined;
      case 'hardwareId':
        return 'hardwareId' in item ? item.data?.hardwareId : undefined;
      default:
        return undefined;
    }
  }
}
