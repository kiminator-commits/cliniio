import { InventoryItem } from '../../../types/inventory';

/**
 * Handles UI-specific transformations for inventory items
 */
export class UITransformer {
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
}
