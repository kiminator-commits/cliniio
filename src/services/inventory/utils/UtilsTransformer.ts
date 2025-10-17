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

    // Helper function to safely extract data properties
    const getDataProperty = (key: string): string => {
      if (
        item.data &&
        typeof item.data === 'object' &&
        item.data !== null &&
        key in item.data &&
        typeof (item.data as Record<string, unknown>)[key] === 'string'
      ) {
        return (item.data as Record<string, unknown>)[key] as string;
      }
      return '';
    };

    return {
      id: '',
      facility_id: item.facility_id || '',
      name: item.name || '',
      quantity: item.quantity || 0,
      data: {
        description: getDataProperty('description'),
        barcode: getDataProperty('barcode'),
        warranty: getDataProperty('warranty'),
        serialNumber: getDataProperty('serialNumber'),
        manufacturer: getDataProperty('manufacturer'),
        lastServiced: getDataProperty('lastServiced'),
        unit: getDataProperty('unit'),
        supplier: getDataProperty('supplier'),
        notes: getDataProperty('notes'),
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
      created_at: now,
      updated_at: now,
      reorder_point: item.reorder_point || 0,
      expiration_date: item.expiration_date || '',
      unit_cost: item.unit_cost || 0,
      category: item.category || '',
      status: item.status || 'Active',
      location: item.location || '',
      supplier: item.supplier || '',
      cost: item.cost || 0,
      vendor: item.vendor || '',
      warranty: item.warranty || '',
      maintenance_schedule: item.maintenance_schedule || '',
      next_due: item.next_due || '',
      service_provider: item.service_provider || '',
      assigned_to: item.assigned_to || '',
      notes: item.notes || '',
      tool_id: item.tool_id || '',
      supply_id: item.supply_id || '',
      equipment_id: item.equipment_id || '',
      hardware_id: item.hardware_id || '',
      p2_status: item.p2_status || '',
      serial_number: item.serial_number || '',
      manufacturer: item.manufacturer || '',
      image_url: item.image_url || '',
      tags: item.tags || [],
      favorite: item.favorite || false,
      tracked: item.tracked || true,
      barcode: item.barcode || '',
      sku: item.sku || '',
      description: item.description || '',
      current_phase: item.current_phase || 'Active',
      is_active: item.is_active || true,
      unit: item.unit || '',
      expiration: item.expiration || '',
      purchase_date: item.purchase_date || '',
      last_serviced: item.last_serviced || '',
      last_updated: now,
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
