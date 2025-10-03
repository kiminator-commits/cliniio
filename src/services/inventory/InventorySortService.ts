import {
  LocalInventoryItem,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
  getItemStatus,
} from '@/types/inventoryTypes';

export type SortDirection = 'asc' | 'desc';

export interface SortField {
  key: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  getValue?: (item: LocalInventoryItem) => unknown;
}

export interface SortCriteria {
  field: string;
  direction: SortDirection;
}

export interface SortResult<T = LocalInventoryItem> {
  items: T[];
  appliedSort: SortCriteria;
}

export interface InventorySortService {
  // Core sorting methods
  sortItems(items: LocalInventoryItem[], criteria: SortCriteria): SortResult;
  sortTools(tools: ToolItem[], criteria: SortCriteria): SortResult<ToolItem>;
  sortSupplies(
    supplies: SupplyItem[],
    criteria: SortCriteria
  ): SortResult<SupplyItem>;
  sortEquipment(
    equipment: EquipmentItem[],
    criteria: SortCriteria
  ): SortResult<EquipmentItem>;
  sortOfficeHardware(
    hardware: OfficeHardwareItem[],
    criteria: SortCriteria
  ): SortResult<OfficeHardwareItem>;

  // Multi-field sorting
  sortByMultipleFields(
    items: LocalInventoryItem[],
    criteria: SortCriteria[]
  ): SortResult;

  // Predefined sort configurations
  sortByName(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;
  sortByCategory(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;
  sortByLocation(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;
  sortByStatus(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;
  sortByDate(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;
  sortByQuantity(
    items: LocalInventoryItem[],
    direction?: SortDirection
  ): SortResult;

  // Custom sorting
  sortByCustomField<T extends LocalInventoryItem>(
    items: T[],
    field: string,
    direction: SortDirection,
    getValue?: (item: T) => unknown
  ): SortResult<T>;

  // Sort utilities
  getAvailableSortFields(): SortField[];
  validateSortCriteria(criteria: SortCriteria): {
    isValid: boolean;
    errors: string[];
  };
  toggleSortDirection(currentDirection: SortDirection): SortDirection;
}

export class InventorySortServiceImpl implements InventorySortService {
  private readonly defaultSortFields: SortField[] = [
    {
      key: 'name',
      label: 'Name',
      type: 'string',
      getValue: (item) => item.item,
    },
    {
      key: 'category',
      label: 'Category',
      type: 'string',
      getValue: (item) => item.category,
    },
    {
      key: 'location',
      label: 'Location',
      type: 'string',
      getValue: (item) => item.location,
    },
    {
      key: 'status',
      label: 'Status',
      type: 'string',
      getValue: (item) => this.getItemStatus(item),
    },
    {
      key: 'date',
      label: 'Date',
      type: 'date',
      getValue: (item) => this.getItemDate(item),
    },
    {
      key: 'quantity',
      label: 'Quantity',
      type: 'number',
      getValue: (item) => this.getItemQuantity(item),
    },
    {
      key: 'tracked',
      label: 'Tracked',
      type: 'boolean',
      getValue: (item) => this.isItemTracked(item),
    },
    {
      key: 'favorite',
      label: 'Favorite',
      type: 'boolean',
      getValue: (item) => this.isItemFavorite(item),
    },
  ];

  sortItems(items: LocalInventoryItem[], criteria: SortCriteria): SortResult {
    const sortedItems = this.sortByCustomField(
      items,
      criteria.field,
      criteria.direction
    );

    return {
      items: sortedItems.items,
      appliedSort: criteria,
    };
  }

  sortTools(tools: ToolItem[], criteria: SortCriteria): SortResult<ToolItem> {
    const sortedTools = this.sortByCustomField(
      tools,
      criteria.field,
      criteria.direction
    ) as SortResult<ToolItem>;

    return {
      items: sortedTools.items,
      appliedSort: criteria,
    };
  }

  sortSupplies(
    supplies: SupplyItem[],
    criteria: SortCriteria
  ): SortResult<SupplyItem> {
    const sortedSupplies = this.sortByCustomField(
      supplies,
      criteria.field,
      criteria.direction
    ) as SortResult<SupplyItem>;

    return {
      items: sortedSupplies.items,
      appliedSort: criteria,
    };
  }

  sortEquipment(
    equipment: EquipmentItem[],
    criteria: SortCriteria
  ): SortResult<EquipmentItem> {
    const sortedEquipment = this.sortByCustomField(
      equipment,
      criteria.field,
      criteria.direction
    ) as SortResult<EquipmentItem>;

    return {
      items: sortedEquipment.items,
      appliedSort: criteria,
    };
  }

  sortOfficeHardware(
    hardware: OfficeHardwareItem[],
    criteria: SortCriteria
  ): SortResult<OfficeHardwareItem> {
    const sortedHardware = this.sortByCustomField(
      hardware,
      criteria.field,
      criteria.direction
    ) as SortResult<OfficeHardwareItem>;

    return {
      items: sortedHardware.items,
      appliedSort: criteria,
    };
  }

  sortByMultipleFields(
    items: LocalInventoryItem[],
    criteria: SortCriteria[]
  ): SortResult {
    let sortedItems = [...items];

    for (const sortCriteria of criteria) {
      const result = this.sortByCustomField(
        sortedItems,
        sortCriteria.field,
        sortCriteria.direction
      );
      sortedItems = result.items;
    }

    return {
      items: sortedItems,
      appliedSort: criteria[0] || { field: '', direction: 'asc' },
    };
  }

  sortByName(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(
      items,
      'name',
      direction,
      (item) => item.item
    );
  }

  sortByCategory(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(
      items,
      'category',
      direction,
      (item) => item.category
    );
  }

  sortByLocation(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(
      items,
      'location',
      direction,
      (item) => item.location
    );
  }

  sortByStatus(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(items, 'status', direction, (item) =>
      this.getItemStatus(item)
    );
  }

  sortByDate(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(items, 'date', direction, (item) =>
      this.getItemDate(item)
    );
  }

  sortByQuantity(
    items: LocalInventoryItem[],
    direction: SortDirection = 'asc'
  ): SortResult {
    return this.sortByCustomField(items, 'quantity', direction, (item) =>
      this.getItemQuantity(item)
    );
  }

  sortByCustomField<T extends LocalInventoryItem>(
    items: T[],
    field: string,
    direction: SortDirection,
    getValue?: (item: T) => unknown
  ): SortResult<T> {
    const sortedItems = [...items].sort((a, b) => {
      const valueA = getValue ? getValue(a) : this.getFieldValue(a, field);
      const valueB = getValue ? getValue(b) : this.getFieldValue(b, field);
      const comparison = this.compareValues(valueA, valueB);
      return direction === 'desc' ? -comparison : comparison;
    });

    return {
      items: sortedItems,
      appliedSort: { field, direction },
    };
  }

  getAvailableSortFields(): SortField[] {
    return [...this.defaultSortFields];
  }

  validateSortCriteria(criteria: SortCriteria): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!criteria.field) {
      errors.push('Sort field is required');
    }

    if (!criteria.direction || !['asc', 'desc'].includes(criteria.direction)) {
      errors.push('Sort direction must be "asc" or "desc"');
    }

    const availableFields = this.defaultSortFields.map((field) => field.key);
    if (criteria.field && !availableFields.includes(criteria.field)) {
      errors.push(`Invalid sort field: ${criteria.field}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toggleSortDirection(currentDirection: SortDirection): SortDirection {
    return currentDirection === 'asc' ? 'desc' : 'asc';
  }

  private getFieldValue(item: LocalInventoryItem, field: string): unknown {
    const fieldMap: Record<string, unknown> = {
      name: item.item,
      category: item.category,
      location: item.location,
      status: this.getItemStatus(item),
      date: this.getItemDate(item),
      quantity: this.getItemQuantity(item),
      tracked: this.isItemTracked(item),
      favorite: this.isItemFavorite(item),
    };

    return fieldMap[field] ?? null;
  }

  private compareValues(a: unknown, b: unknown): number {
    // Handle null/undefined values
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return a.getTime() - b.getTime();
    }

    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return a - b;
    }

    // Handle booleans
    if (typeof a === 'boolean' && typeof b === 'boolean') {
      return a === b ? 0 : a ? 1 : -1;
    }

    // Handle strings
    if (typeof a === 'string' && typeof b === 'string') {
      return a.localeCompare(b);
    }

    // Fallback to string comparison
    const stringA = String(a);
    const stringB = String(b);
    return stringA.localeCompare(stringB);
  }

  private getItemStatus(item: LocalInventoryItem): string {
    return getItemStatus(item);
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

  private getItemQuantity(item: LocalInventoryItem): number {
    if ('quantity' in item) {
      return typeof item.quantity === 'number' ? item.quantity : 0;
    }
    return 0;
  }

  private isItemTracked(item: LocalInventoryItem): boolean {
    return 'tracked' in item ? Boolean(item.data?.tracked) : false;
  }

  private isItemFavorite(item: LocalInventoryItem): boolean {
    return 'favorite' in item ? Boolean(item.data?.favorite) : false;
  }
}
