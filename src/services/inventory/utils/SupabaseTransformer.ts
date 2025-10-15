import { InventoryItem } from '../../../types/inventory';
import { getEnvVar } from '../../../lib/getEnv';

/**
 * Handles transformations between Supabase database format and InventoryItem
 */
export class SupabaseTransformer {
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
}
