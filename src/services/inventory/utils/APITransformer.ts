import { InventoryItem } from '../../../types/inventory';

/**
 * Handles API-specific transformations for inventory items
 */
export class APITransformer {
  /**
   * Transforms inventory items for API consumption
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
