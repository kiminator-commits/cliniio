import { InventoryItem } from '../../../types/inventory';

/**
 * Handles utility transformations and helper functions for inventory items
 */
export class UtilsTransformer {
  /**
   * Create a new inventory item with default values
   */
  static createNewItem(
    item: Partial<Omit<InventoryItem, 'id' | 'lastUpdated'>>
  ): InventoryItem {
    const now = new Date().toISOString();

    return {
      id: '',
      name: (item as Partial<InventoryItem>).name || '',
      category: (item as Partial<InventoryItem>).category || '',
      location: (item as Partial<InventoryItem>).location || '',
      status: (item as Partial<InventoryItem>).status || 'Active',
      quantity: (item as Partial<InventoryItem>).quantity || 0,
      unit_cost: (item as Partial<InventoryItem>).unit_cost || 0,
      reorder_point: (item as Partial<InventoryItem>).reorder_point || 0,
      expiration_date: (item as Partial<InventoryItem>).expiration_date || '',
      created_at: now,
      updated_at: now,
      facility_id: (item as Partial<InventoryItem>).facility_id || '',
      data: {
        description:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'description' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.description === 'string'
            ? (item as Partial<InventoryItem>).data.description
            : '') || '',
        barcode:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'barcode' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.barcode === 'string'
            ? (item as Partial<InventoryItem>).data.barcode
            : '') || '',
        warranty:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'warranty' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.warranty === 'string'
            ? (item as Partial<InventoryItem>).data.warranty
            : '') || '',
        serialNumber:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'serialNumber' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.serialNumber === 'string'
            ? (item as Partial<InventoryItem>).data.serialNumber
            : '') || '',
        manufacturer:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'manufacturer' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.manufacturer === 'string'
            ? (item as Partial<InventoryItem>).data.manufacturer
            : '') || '',
        lastServiced:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'lastServiced' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.lastServiced === 'string'
            ? (item as Partial<InventoryItem>).data.lastServiced
            : '') || '',
        unit:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'unit' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.unit === 'string'
            ? (item as Partial<InventoryItem>).data.unit
            : '') || '',
        supplier:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'supplier' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.supplier === 'string'
            ? (item as Partial<InventoryItem>).data.supplier
            : '') || '',
        notes:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'notes' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.notes === 'string'
            ? (item as Partial<InventoryItem>).data.notes
            : '') || '',
        tags: [],
        imageUrl: '',
        isActive: true,
        tracked: true,
        favorite: false,
        purchaseDate: '',
        createdAt: now,
        updatedAt: now,
        currentPhase: 'Active',
        sku: '',
        p2Status: '',
        toolId: '',
        supplyId: '',
        equipmentId: '',
        hardwareId: '',
        serviceProvider: '',
        assignedTo: '',
      },
    };
  }

  /**
   * Update an item with current timestamp
   */
  static updateItemWithTimestamp(
    item: Partial<InventoryItem>
  ): Partial<InventoryItem> {
    const now = new Date().toISOString();

    return {
      ...item,
      data: {
        ...(item.data && typeof item.data === 'object' && item.data !== null
          ? item.data
          : {}),
        lastUpdated: now,
        updatedAt: now,
      },
    };
  }

  /**
   * Normalizes item name (removes extra spaces, converts to title case)
   */
  static normalizeItemName(name: string): string {
    if (!name) return '';

    return name
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Normalizes category name
   */
  static normalizeCategory(category: string): string {
    if (!category) return '';

    return category
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  /**
   * Transforms raw inventory data to normalized format
   */
  static transformInventoryItem(item: InventoryItem): InventoryItem & {
    normalizedName: string;
    normalizedCategory: string;
    quantityInStock: number;
    isExpired: boolean;
    daysUntilExpiry: number | null;
  } {
    const normalizedName = this.normalizeItemName(item.name || '');
    const normalizedCategory = this.normalizeCategory(item.category || '');
    const expiryDate = (item.data as Record<string, unknown>)?.expiration
      ? new Date((item.data as Record<string, unknown>).expiration as string)
      : null;
    const now = new Date();

    const isExpired = expiryDate ? expiryDate < now : false;
    const daysUntilExpiry = expiryDate
      ? Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
      : null;

    return {
      ...item,
      normalizedName,
      normalizedCategory,
      quantityInStock: item.quantity || 0,
      isExpired,
      daysUntilExpiry,
    };
  }

  /**
   * Transforms inventory batch data
   */
  static transformInventoryBatch(
    items: InventoryItem[]
  ): Array<
    InventoryItem & { normalizedName: string; normalizedCategory: string }
  > {
    return items.map((item) => ({
      ...item,
      normalizedName: this.normalizeItemName(item.name || ''),
      normalizedCategory: this.normalizeCategory(item.category || ''),
    }));
  }
}
