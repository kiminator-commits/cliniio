import {
  LocalInventoryItem,
  ToolItem,
  SupplyItem,
  EquipmentItem,
  OfficeHardwareItem,
} from '@/types/inventoryTypes';

export interface TransformationOptions {
  includeInactive?: boolean;
  includeExpired?: boolean;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
}

export interface ModalDataItem {
  id: string;
  name: string;
  barcode: string;
  currentPhase: string;
  category: string;
}

export interface TableDataItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  tracked: boolean;
  favorite: boolean;
  lastUpdated: string;
}

export interface InventoryTransformationService {
  // Core transformation methods
  transformForModal(items: LocalInventoryItem[]): ModalDataItem[];
  transformForTable(items: LocalInventoryItem[]): TableDataItem[];
  transformForExport(items: LocalInventoryItem[]): Record<string, unknown>[];

  // Type-specific transformations
  transformTools(tools: ToolItem[], options?: TransformationOptions): ToolItem[];
  transformSupplies(supplies: SupplyItem[], options?: TransformationOptions): SupplyItem[];
  transformEquipment(equipment: EquipmentItem[], options?: TransformationOptions): EquipmentItem[];
  transformOfficeHardware(
    hardware: OfficeHardwareItem[],
    options?: TransformationOptions
  ): OfficeHardwareItem[];

  // Data normalization
  normalizeItemData(item: LocalInventoryItem): LocalInventoryItem;
  normalizeItemList(items: LocalInventoryItem[]): LocalInventoryItem[];

  // Sorting and filtering transformations
  sortItems(
    items: LocalInventoryItem[],
    field: string,
    direction: 'asc' | 'desc'
  ): LocalInventoryItem[];
  filterByStatus(items: LocalInventoryItem[], status: string): LocalInventoryItem[];
  filterByCategory(items: LocalInventoryItem[], category: string): LocalInventoryItem[];
  filterByLocation(items: LocalInventoryItem[], location: string): LocalInventoryItem[];

  // Utility transformations
  getUniqueCategories(items: LocalInventoryItem[]): string[];
  getUniqueLocations(items: LocalInventoryItem[]): string[];
  getUniqueStatuses(items: LocalInventoryItem[]): string[];
}

export class InventoryTransformationServiceImpl implements InventoryTransformationService {
  transformForModal(items: LocalInventoryItem[]): ModalDataItem[] {
    return items.map(item => ({
      id: this.getItemId(item),
      name: this.getItemName(item),
      barcode: this.getItemBarcode(item),
      currentPhase: this.getItemStatus(item),
      category: item.category || '',
    }));
  }

  transformForTable(items: LocalInventoryItem[]): TableDataItem[] {
    return items.map(item => ({
      id: this.getItemId(item),
      name: this.getItemName(item),
      category: item.category || '',
      location: item.location || '',
      status: this.getItemStatus(item),
      tracked: this.isItemTracked(item),
      favorite: this.isItemFavorite(item),
      lastUpdated: this.getItemLastUpdated(item),
    }));
  }

  transformForExport(items: LocalInventoryItem[]): Record<string, unknown>[] {
    return items.map(item => ({
      id: this.getItemId(item),
      name: this.getItemName(item),
      category: item.category || '',
      location: item.location || '',
      status: this.getItemStatus(item),
      barcode: this.getItemBarcode(item),
      tracked: this.isItemTracked(item),
      favorite: this.isItemFavorite(item),
      lastUpdated: this.getItemLastUpdated(item),
      ...this.getAdditionalFields(item),
    }));
  }

  transformTools(tools: ToolItem[], options?: TransformationOptions): ToolItem[] {
    let transformed = [...tools];

    if (options?.includeInactive === false) {
      transformed = transformed.filter(tool => tool.p2Status !== 'Inactive');
    }

    if (options?.sortBy) {
      transformed = this.sortItems(transformed, options.sortBy, options.sortDirection || 'asc');
    }

    if (options?.limit) {
      transformed = transformed.slice(0, options.limit);
    }

    return transformed;
  }

  transformSupplies(supplies: SupplyItem[], options?: TransformationOptions): SupplyItem[] {
    let transformed = [...supplies];

    if (options?.includeExpired === false) {
      transformed = transformed.filter(supply => {
        if (!supply.expiration) return true;
        return new Date(supply.expiration) > new Date();
      });
    }

    if (options?.sortBy) {
      transformed = this.sortItems(transformed, options.sortBy, options.sortDirection || 'asc');
    }

    if (options?.limit) {
      transformed = transformed.slice(0, options.limit);
    }

    return transformed;
  }

  transformEquipment(equipment: EquipmentItem[], options?: TransformationOptions): EquipmentItem[] {
    let transformed = [...equipment];

    if (options?.includeInactive === false) {
      transformed = transformed.filter(eq => eq.status !== 'Inactive');
    }

    if (options?.sortBy) {
      transformed = this.sortItems(transformed, options.sortBy, options.sortDirection || 'asc');
    }

    if (options?.limit) {
      transformed = transformed.slice(0, options.limit);
    }

    return transformed;
  }

  transformOfficeHardware(
    hardware: OfficeHardwareItem[],
    options?: TransformationOptions
  ): OfficeHardwareItem[] {
    let transformed = [...hardware];

    if (options?.includeInactive === false) {
      transformed = transformed.filter(hw => hw.status !== 'Inactive');
    }

    if (options?.sortBy) {
      transformed = this.sortItems(transformed, options.sortBy, options.sortDirection || 'asc');
    }

    if (options?.limit) {
      transformed = transformed.slice(0, options.limit);
    }

    return transformed;
  }

  normalizeItemData(item: LocalInventoryItem): LocalInventoryItem {
    return {
      ...item,
      item: item.item || '',
      category: item.category || '',
      location: item.location || '',
      id: this.getItemId(item),
    };
  }

  normalizeItemList(items: LocalInventoryItem[]): LocalInventoryItem[] {
    return items.map(item => this.normalizeItemData(item));
  }

  sortItems(
    items: LocalInventoryItem[],
    field: string,
    direction: 'asc' | 'desc'
  ): LocalInventoryItem[] {
    return [...items].sort((a, b) => {
      const valueA = this.getFieldValue(a, field);
      const valueB = this.getFieldValue(b, field);

      if (valueA === valueB) return 0;

      const comparison = valueA > valueB ? 1 : -1;
      return direction === 'asc' ? comparison : -comparison;
    });
  }

  filterByStatus(items: LocalInventoryItem[], status: string): LocalInventoryItem[] {
    return items.filter(item => this.getItemStatus(item) === status);
  }

  filterByCategory(items: LocalInventoryItem[], category: string): LocalInventoryItem[] {
    return items.filter(item => item.category === category);
  }

  filterByLocation(items: LocalInventoryItem[], location: string): LocalInventoryItem[] {
    return items.filter(item => item.location === location);
  }

  getUniqueCategories(items: LocalInventoryItem[]): string[] {
    const categories = items.map(item => item.category).filter(Boolean);
    return [...new Set(categories)];
  }

  getUniqueLocations(items: LocalInventoryItem[]): string[] {
    const locations = items.map(item => item.location).filter(Boolean);
    return [...new Set(locations)];
  }

  getUniqueStatuses(items: LocalInventoryItem[]): string[] {
    const statuses = items.map(item => this.getItemStatus(item)).filter(Boolean);
    return [...new Set(statuses)];
  }

  private getItemId(item: LocalInventoryItem): string {
    if ('toolId' in item) return item.toolId;
    if ('supplyId' in item) return item.supplyId;
    if ('equipmentId' in item) return item.equipmentId;
    if ('hardwareId' in item) return item.hardwareId;
    return item.id || item.item || '';
  }

  private getItemName(item: LocalInventoryItem): string {
    return item.item || '';
  }

  private getItemBarcode(item: LocalInventoryItem): string {
    return this.getItemId(item);
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

  private getItemLastUpdated(item: LocalInventoryItem): string {
    return item.lastUpdated || item.updatedAt || new Date().toISOString();
  }

  private getFieldValue(item: LocalInventoryItem, field: string): unknown {
    const fieldMap: Record<string, unknown> = {
      name: item.item,
      category: item.category,
      location: item.location,
      status: this.getItemStatus(item),
      barcode: this.getItemBarcode(item),
      tracked: this.isItemTracked(item),
      favorite: this.isItemFavorite(item),
      lastUpdated: this.getItemLastUpdated(item),
    };

    return fieldMap[field] ?? null;
  }

  private getAdditionalFields(item: LocalInventoryItem): Record<string, unknown> {
    const additionalFields: Record<string, unknown> = {};

    // Add type-specific fields
    if ('p2Status' in item) {
      additionalFields.p2Status = (item as ToolItem).p2Status;
    }
    if ('expiration' in item) {
      additionalFields.expiration = (item as SupplyItem).expiration;
    }
    if ('serialNumber' in item) {
      additionalFields.serialNumber = (item as EquipmentItem).serialNumber;
    }
    if ('manufacturer' in item) {
      additionalFields.manufacturer = (item as OfficeHardwareItem).manufacturer;
    }

    return additionalFields;
  }
}
