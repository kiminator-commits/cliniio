import { InventoryItem } from '../../../types/inventory';
import { getEnvVar } from '../../../lib/getEnv';

/**
 * Single source of truth for all Inventory data transformations
 * Consolidates all transformation logic to eliminate redundancy
 */
export class InventoryDataTransformer {
  // ============================================================================
  // SUPABASE TRANSFORMATIONS (Single Implementation)
  // ============================================================================

  static transformFromSupabase(
    supabaseItem: Record<string, unknown>
  ): InventoryItem {
    // Extract category from data JSONB field if it exists
    const data = (supabaseItem.data as Record<string, unknown>) || {};
    const category =
      (supabaseItem.category as string) ||
      (data.category as string) ||
      'unknown';

    // Reduced logging in development - only log in debug mode
    const isDev =
      getEnvVar('NODE_ENV') === 'development' ||
      getEnvVar('MODE') === 'development';
    const isDebugMode = getEnvVar('VITE_DEBUG_INVENTORY') === 'true';
    if (isDev && isDebugMode) {
      console.debug('Transforming inventory item:', supabaseItem);
    }

    return {
      id: supabaseItem.id as string,
      name: supabaseItem.name as string,
      category: category,
      location: '', // Default empty since not in DB
      status: 'active', // Default since not in DB
      updated_at: supabaseItem.updated_at as string,
      quantity: supabaseItem.quantity as number,
      unit_cost: supabaseItem.unit_cost as number,
      reorder_point: (supabaseItem.reorder_point as number) || 0,
      expiration_date: (supabaseItem.expiration_date as string) || '',
      created_at: supabaseItem.created_at as string,
      facility_id: (supabaseItem.facility_id as string) || '',
      data: {
        description: (data.description as string) || '',
        barcode: (data.barcode as string) || '',
        warranty: (data.warranty as string) || '',
        serialNumber: (data.serialNumber as string) || '',
        manufacturer: (data.manufacturer as string) || '',
        lastServiced: (data.lastServiced as string) || '',
        unit: (data.unit as string) || '',
        supplier: (data.supplier as string) || '',
        notes: (data.notes as string) || '',
        tags: (data.tags as string[]) || [],
        imageUrl: (data.imageUrl as string) || '',
        isActive: (data.isActive as boolean) ?? true,
        tracked: (data.tracked as boolean) ?? true,
        favorite: (data.favorite as boolean) ?? false,
        purchaseDate: (data.purchaseDate as string) || '',
        createdAt: (data.createdAt as string) || '',
        updatedAt: (data.updatedAt as string) || '',
        currentPhase: (data.currentPhase as string) || '',
        sku: (data.sku as string) || '',
        p2Status: (data.p2Status as string) || '',
        toolId: (data.toolId as string) || '',
        supplyId: (data.supplyId as string) || '',
        equipmentId: (data.equipmentId as string) || '',
        hardwareId: (data.hardwareId as string) || '',
        serviceProvider: (data.serviceProvider as string) || '',
        assignedTo: (data.assignedTo as string) || '',
      },
    };
  }

  static transformToSupabase(
    inventoryItem: Partial<InventoryItem>
  ): Record<string, unknown> {
    // Only include columns that definitely exist in the database schema
    // This prevents schema cache mismatch errors
    const transformed: Record<string, unknown> = {
      name: inventoryItem.name,
      category: inventoryItem.category,
      quantity: inventoryItem.quantity || 0,
      unit_cost: inventoryItem.unit_cost || 0,
      status: inventoryItem.status || 'active',
    };

    // Only add facility_id if it's provided (don't override existing)
    if (inventoryItem.facility_id) {
      transformed.facility_id = inventoryItem.facility_id;
    }

    // Only add optional columns if they exist and have values
    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'description' in inventoryItem.data &&
      typeof inventoryItem.data.description === 'string'
    ) {
      transformed.description = inventoryItem.data.description;
    }

    if (inventoryItem.location) {
      transformed.location = inventoryItem.location;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'sku' in inventoryItem.data &&
      typeof inventoryItem.data.sku === 'string'
    ) {
      transformed.sku = inventoryItem.data.sku;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'barcode' in inventoryItem.data &&
      typeof inventoryItem.data.barcode === 'string'
    ) {
      transformed.barcode = inventoryItem.data.barcode;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'manufacturer' in inventoryItem.data &&
      typeof inventoryItem.data.manufacturer === 'string'
    ) {
      transformed.manufacturer = inventoryItem.data.manufacturer;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'serialNumber' in inventoryItem.data &&
      typeof inventoryItem.data.serialNumber === 'string'
    ) {
      transformed.serial_number = inventoryItem.data.serialNumber;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'expiration' in inventoryItem.data &&
      typeof inventoryItem.data.expiration === 'string'
    ) {
      transformed.expiration_date = inventoryItem.data.expiration;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'unit' in inventoryItem.data &&
      typeof inventoryItem.data.unit === 'string'
    ) {
      transformed.unit_of_measure = inventoryItem.data.unit;
    }

    if (inventoryItem.reorder_point !== undefined) {
      transformed.reorder_point = inventoryItem.reorder_point;
    }

    // maxQuantity removed - not in Supabase schema

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'createdAt' in inventoryItem.data &&
      typeof inventoryItem.data.createdAt === 'string'
    ) {
      transformed.created_at = inventoryItem.data.createdAt;
    }

    if (
      inventoryItem.data &&
      typeof inventoryItem.data === 'object' &&
      inventoryItem.data !== null &&
      'updatedAt' in inventoryItem.data &&
      typeof inventoryItem.data.updatedAt === 'string'
    ) {
      transformed.updated_at = inventoryItem.data.updatedAt;
    }

    return transformed;
  }

  // ============================================================================
  // UI TRANSFORMATIONS (Single Implementation)
  // ============================================================================

  /**
   * Transform inventory items for modal display
   * Single source of truth for modal transformations
   */
  static transformForModal(items: InventoryItem[]): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }> {
    return items.map((item) => ({
      id: item.id || '',
      name: item.name || '',
      barcode:
        ((item.data as Record<string, unknown>)?.barcode as string) ||
        item.id ||
        '',
      currentPhase:
        item.status ||
        ((item.data as Record<string, unknown>)?.currentPhase as string) ||
        'Unknown',
      category: item.category || '',
    }));
  }

  /**
   * Transform inventory items for table display
   * Single source of truth for table transformations
   */
  static transformForTable(items: InventoryItem[]): Array<{
    id: string;
    name: string;
    category: string;
    location: string;
    status: string;
    tracked: boolean;
    favorite: boolean;
    lastUpdated: string;
  }> {
    return items.map((item) => ({
      id: item.id || '',
      name: item.name || '',
      category: item.category || '',
      location: item.location || '',
      status:
        item.status ||
        ((item.data as Record<string, unknown>)?.currentPhase as string) ||
        'Unknown',
      tracked:
        ((item.data as Record<string, unknown>)?.tracked as boolean) || false,
      favorite:
        ((item.data as Record<string, unknown>)?.favorite as boolean) || false,
      lastUpdated:
        ((item.data as Record<string, unknown>)?.updatedAt as string) || '',
    }));
  }

  /**
   * Transform inventory items for export
   * Single source of truth for export transformations
   */
  static transformForExport(items: InventoryItem[]): Record<string, string>[] {
    return items.map((item) => ({
      ID: item.id || '',
      Name: item.name || '',
      Category: item.category || '',
      Location: item.location || '',
      Status:
        item.status ||
        ((item.data as Record<string, unknown>)?.currentPhase as string) ||
        '',
      Quantity: String(item.quantity || 0),
      Cost: String(item.unit_cost || 0),
      Barcode:
        ((item.data as Record<string, unknown>)?.barcode as string) || '',
      SerialNumber:
        ((item.data as Record<string, unknown>)?.serialNumber as string) || '',
      Manufacturer:
        ((item.data as Record<string, unknown>)?.manufacturer as string) || '',
      SKU: ((item.data as Record<string, unknown>)?.sku as string) || '',
      Description:
        ((item.data as Record<string, unknown>)?.description as string) || '',
      Warranty:
        ((item.data as Record<string, unknown>)?.warranty as string) || '',
      LastServiced:
        ((item.data as Record<string, unknown>)?.lastServiced as string) || '',
      Notes: ((item.data as Record<string, unknown>)?.notes as string) || '',
      Tags: Array.isArray((item.data as Record<string, unknown>)?.tags)
        ? ((item.data as Record<string, unknown>).tags as string[]).join(', ')
        : '',
      CreatedAt:
        ((item.data as Record<string, unknown>)?.createdAt as string) || '',
      UpdatedAt:
        ((item.data as Record<string, unknown>)?.updatedAt as string) || '',
    }));
  }

  /**
   * Transform inventory items for search
   * Single source of truth for search transformations
   */
  static transformForSearch(
    items: InventoryItem[]
  ): Record<string, string | number | undefined>[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name || '',
      category: item.category || '',
      location: item.location || '',
      status:
        item.status ||
        ((item.data as Record<string, unknown>)?.currentPhase as string) ||
        '',
      quantity: item.quantity || 0,
      unit_cost: item.unit_cost || 0,
      barcode:
        ((item.data as Record<string, unknown>)?.barcode as string) ||
        undefined,
      description: (item.data as Record<string, unknown>)
        ?.description as string,
    }));
  }

  // ============================================================================
  // UTILITY TRANSFORMATIONS
  // ============================================================================

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
        expiration:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'expiration' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.expiration === 'string'
            ? (item as Partial<InventoryItem>).data.expiration
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
        tags:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'tags' in (item as Partial<InventoryItem>).data &&
          Array.isArray((item as Partial<InventoryItem>).data.tags)
            ? (item as Partial<InventoryItem>).data.tags
            : []) || [],
        imageUrl:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'imageUrl' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.imageUrl === 'string'
            ? (item as Partial<InventoryItem>).data.imageUrl
            : '') || '',
        isActive:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'isActive' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.isActive === 'boolean'
            ? (item as Partial<InventoryItem>).data.isActive
            : true) ?? true,
        tracked:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'tracked' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.tracked === 'boolean'
            ? (item as Partial<InventoryItem>).data.tracked
            : false) ?? false,
        favorite:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'favorite' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.favorite === 'boolean'
            ? (item as Partial<InventoryItem>).data.favorite
            : false) ?? false,
        purchaseDate:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'purchaseDate' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.purchaseDate === 'string'
            ? (item as Partial<InventoryItem>).data.purchaseDate
            : '') || '',
        createdAt: now,
        updatedAt: now,
        currentPhase:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'currentPhase' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.currentPhase === 'string'
            ? (item as Partial<InventoryItem>).data.currentPhase
            : 'Active') || 'Active',
        sku:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'sku' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.sku === 'string'
            ? (item as Partial<InventoryItem>).data.sku
            : '') || '',
        p2Status:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'p2Status' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.p2Status === 'string'
            ? (item as Partial<InventoryItem>).data.p2Status
            : '') || '',
        toolId:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'toolId' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.toolId === 'string'
            ? (item as Partial<InventoryItem>).data.toolId
            : '') || '',
        supplyId:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'supplyId' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.supplyId === 'string'
            ? (item as Partial<InventoryItem>).data.supplyId
            : '') || '',
        equipmentId:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'equipmentId' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.equipmentId === 'string'
            ? (item as Partial<InventoryItem>).data.equipmentId
            : '') || '',
        hardwareId:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'hardwareId' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.hardwareId === 'string'
            ? (item as Partial<InventoryItem>).data.hardwareId
            : '') || '',
        serviceProvider:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'serviceProvider' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.serviceProvider ===
            'string'
            ? (item as Partial<InventoryItem>).data.serviceProvider
            : '') || '',
        assignedTo:
          ((item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data === 'object' &&
          (item as Partial<InventoryItem>).data !== null &&
          'assignedTo' in (item as Partial<InventoryItem>).data &&
          typeof (item as Partial<InventoryItem>).data.assignedTo === 'string'
            ? (item as Partial<InventoryItem>).data.assignedTo
            : '') || '',
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

  // ============================================================================
  // LEGACY TRANSFORMATION FUNCTIONS (Consolidated from transformation.ts)
  // ============================================================================

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
      quantityInStock: Math.max(0, item.quantity || 1),
      isExpired,
      daysUntilExpiry,
    };
  }

  /**
   * Transforms array of inventory items
   */
  static transformInventoryBatch(
    items: InventoryItem[]
  ): ReturnType<typeof this.transformInventoryItem>[] {
    return items.map((item) => this.transformInventoryItem(item));
  }

  /**
   * Converts inventory item to CSV format
   */
  static transformToCSV(items: InventoryItem[]): string {
    if (items.length === 0) return '';

    const headers = ['Name', 'Quantity', 'Category', 'Status', 'Expiry Date'];
    const rows = items.map((item) => [
      item.name,
      (item.quantity || 1).toString(),
      item.category,
      item.status,
      ((item.data as Record<string, unknown>)?.expiration as string) || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Converts CSV string to inventory items
   */
  static transformFromCSV(csvString: string): InventoryItem[] {
    const lines = csvString.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map((h) => h.replace(/"/g, '').trim());
    const dataLines = lines.slice(1);

    return dataLines.map((line) => {
      const values = line.split(',').map((v) => v.replace(/"/g, '').trim());
      const item: Record<string, unknown> = {};

      headers.forEach((header, index) => {
        item[header.toLowerCase().replace(/\s+/g, '')] = values[index] || '';
      });

      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: (item.name as string) || '',
        category: (item.category as string) || '',
        status: (item.status as string) || 'active',
        quantity: parseInt(item.quantity as string) || 1,
        unit_cost: 0,
        reorder_point: 0,
        expiration_date: (item.expirydate as string) || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        facility_id: '',
        location: '',
        supplier: null,
        cost: null,
        vendor: null,
        warranty: null,
        tool_id: null,
        description: null,
        barcode: null,
        sku: null,
        serial_number: null,
        manufacturer: null,
        last_serviced: null,
        unit: null,
        notes: null,
        tags: null,
        image_url: null,
        is_active: null,
        tracked: null,
        favorite: null,
        purchase_date: null,
        last_updated: null,
        current_phase: null,
        p2_status: null,
        supply_id: null,
        equipment_id: null,
        hardware_id: null,
        service_provider: null,
        assigned_to: null,
        maintenance_schedule: null,
        next_due: null,
        expiration: null,
        data: {
          description: '',
          barcode: '',
          warranty: '',
          serialNumber: '',
          manufacturer: '',
          lastServiced: '',
          unit: '',
          supplier: '',
          notes: '',
          tags: [],
          imageUrl: '',
          isActive: true,
          tracked: false,
          favorite: false,
          purchaseDate: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentPhase: '',
          sku: '',
          p2Status: '',
          toolId: '',
          supplyId: '',
          equipmentId: '',
          hardwareId: '',
          serviceProvider: '',
          assignedTo: '',
        },
      } as InventoryItem;
    });
  }

  /**
   * Transforms inventory data for API response
   */
  static transformForAPI(items: InventoryItem[]): Record<string, unknown>[] {
    return items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      status: item.status,
      quantity: item.quantity,
      location: item.location,
      unit_cost: item.unit_cost,
      reorder_point: item.reorder_point,
      expiration_date: item.expiration_date,
      created_at: item.created_at,
      updated_at: item.updated_at,
      facility_id: item.facility_id,
      data: {
        description: (item.data as Record<string, unknown>)
          ?.description as string,
        barcode:
          ((item.data as Record<string, unknown>)?.barcode as string) ||
          undefined,
        serialNumber: (item.data as Record<string, unknown>)
          ?.serialNumber as string,
        manufacturer: (item.data as Record<string, unknown>)
          ?.manufacturer as string,
        supplier: (item.data as Record<string, unknown>)?.supplier as string,
        expiration: (item.data as Record<string, unknown>)
          ?.expiration as string,
        warranty: (item.data as Record<string, unknown>)?.warranty as string,
        notes: (item.data as Record<string, unknown>)?.notes as string,
        tags: (item.data as Record<string, unknown>)?.tags as string[],
        imageUrl: (item.data as Record<string, unknown>)?.imageUrl as string,
        isActive: (item.data as Record<string, unknown>)?.isActive as boolean,
        tracked: (item.data as Record<string, unknown>)?.tracked as boolean,
        favorite: (item.data as Record<string, unknown>)?.favorite as boolean,
        purchaseDate: (item.data as Record<string, unknown>)
          ?.purchaseDate as string,
        lastServiced: (item.data as Record<string, unknown>)
          ?.lastServiced as string,
        unit: (item.data as Record<string, unknown>)?.unit as string,
        currentPhase: (item.data as Record<string, unknown>)
          ?.currentPhase as string,
        sku: (item.data as Record<string, unknown>)?.sku as string,
        p2Status: (item.data as Record<string, unknown>)?.p2Status as string,
        toolId: (item.data as Record<string, unknown>)?.toolId as string,
        supplyId: (item.data as Record<string, unknown>)?.supplyId as string,
        equipmentId: (item.data as Record<string, unknown>)
          ?.equipmentId as string,
        hardwareId: (item.data as Record<string, unknown>)
          ?.hardwareId as string,
        serviceProvider: (item.data as Record<string, unknown>)
          ?.serviceProvider as string,
        assignedTo: (item.data as Record<string, unknown>)
          ?.assignedTo as string,
      },
    }));
  }

  /**
   * Transforms API response to internal format
   */
  static transformFromAPI(apiData: Record<string, unknown>[]): InventoryItem[] {
    return apiData.map((item) => ({
      id: item.id as string,
      name: item.name as string,
      category: item.category as string,
      location: item.location as string,
      status: item.status as string,
      updated_at: item.updated_at as string,
      quantity: item.quantity as number,
      unit_cost: item.unit_cost as number,
      reorder_point: item.reorder_point as number,
      expiration_date: item.expiration_date as string,
      created_at: item.created_at as string,
      facility_id: item.facility_id as string,
      supplier: null,
      cost: null,
      vendor: null,
      warranty: null,
      tool_id: null,
      description: null,
      barcode: null,
      sku: null,
      serial_number: null,
      manufacturer: null,
      last_serviced: null,
      unit: null,
      notes: null,
      tags: null,
      image_url: null,
      is_active: null,
      tracked: null,
      favorite: null,
      purchase_date: null,
      last_updated: null,
      current_phase: null,
      p2_status: null,
      supply_id: null,
      equipment_id: null,
      hardware_id: null,
      service_provider: null,
      assigned_to: null,
      maintenance_schedule: null,
      next_due: null,
      expiration: null,
      data: {
        description: (item.data as Record<string, unknown>)
          ?.description as string,
        barcode: (item.data as Record<string, unknown>)?.barcode as string,
        warranty: (item.data as Record<string, unknown>)?.warranty as string,
        serialNumber: (item.data as Record<string, unknown>)
          ?.serialNumber as string,
        expiration: (item.data as Record<string, unknown>)
          ?.expiration as string,
        manufacturer: (item.data as Record<string, unknown>)
          ?.manufacturer as string,
        lastServiced: (item.data as Record<string, unknown>)
          ?.lastServiced as string,
        unit: (item.data as Record<string, unknown>)?.unit as string,
        supplier: (item.data as Record<string, unknown>)?.supplier as string,
        notes: (item.data as Record<string, unknown>)?.notes as string,
        tags: (item.data as Record<string, unknown>)?.tags as string[],
        imageUrl: (item.data as Record<string, unknown>)?.imageUrl as string,
        isActive: (item.data as Record<string, unknown>)?.isActive as boolean,
        tracked: (item.data as Record<string, unknown>)?.tracked as boolean,
        favorite: (item.data as Record<string, unknown>)?.favorite as boolean,
        purchaseDate: (item.data as Record<string, unknown>)
          ?.purchaseDate as string,
        createdAt: (item.data as Record<string, unknown>)?.createdAt as string,
        updatedAt: (item.data as Record<string, unknown>)?.updatedAt as string,
        currentPhase: (item.data as Record<string, unknown>)
          ?.currentPhase as string,
        sku: (item.data as Record<string, unknown>)?.sku as string,
        p2Status: (item.data as Record<string, unknown>)?.p2Status as string,
        toolId: (item.data as Record<string, unknown>)?.toolId as string,
        supplyId: (item.data as Record<string, unknown>)?.supplyId as string,
        equipmentId: (item.data as Record<string, unknown>)
          ?.equipmentId as string,
        hardwareId: (item.data as Record<string, unknown>)
          ?.hardwareId as string,
        serviceProvider: (item.data as Record<string, unknown>)
          ?.serviceProvider as string,
        assignedTo: (item.data as Record<string, unknown>)
          ?.assignedTo as string,
      },
    }));
  }
}
