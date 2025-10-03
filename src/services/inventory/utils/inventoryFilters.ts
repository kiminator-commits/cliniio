import { InventoryFilters } from '../types/inventoryServiceTypes';
import { InventoryItem } from '@/types/inventoryTypes';

export class InventoryFilterManager {
  static applyFilters(
    items: InventoryItem[],
    filters?: InventoryFilters
  ): InventoryItem[] {
    if (!filters) return items;

    let filteredItems = items;

    if (filters.category) {
      filteredItems = filteredItems.filter(
        (item) => item.category === filters.category
      );
    }

    if (filters.status) {
      filteredItems = filteredItems.filter(
        (item) => item.status === filters.status
      );
    }

    if (filters.location) {
      filteredItems = filteredItems.filter(
        (item) => item.location === filters.location
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(
        (item) =>
          (item.name && item.name.toLowerCase().includes(searchLower)) ||
          (item.category &&
            item.category.toLowerCase().includes(searchLower)) ||
          (item.data?.description &&
            typeof item.data.description === 'string' &&
            item.data.description.toLowerCase().includes(searchLower)) ||
          (item.data?.barcode &&
            typeof item.data.barcode === 'string' &&
            item.data.barcode.toLowerCase().includes(searchLower)) ||
          (item.data?.serialNumber &&
            typeof item.data.serialNumber === 'string' &&
            item.data.serialNumber.toLowerCase().includes(searchLower))
      );
    }

    return filteredItems;
  }

  static buildSupabaseQuery(filters?: InventoryFilters) {
    let query = '';

    if (filters?.category) {
      query += `category.eq.${filters.category}`;
    }

    if (filters?.status) {
      if (query) query += ',';
      query += `status.eq.${filters.status}`;
    }

    if (filters?.location) {
      if (query) query += ',';
      query += `location.eq.${filters.location}`;
    }

    if (filters?.search) {
      if (query) query += ',';
      query += `or(name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%)`;
    }

    return query;
  }

  static getUniqueCategories(items: InventoryItem[]): string[] {
    return [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ] as string[];
  }

  static getUniqueLocations(items: InventoryItem[]): string[] {
    return [
      ...new Set(items.map((item) => item.location).filter(Boolean)),
    ] as string[];
  }

  static getUniqueStatuses(items: InventoryItem[]): string[] {
    return [
      ...new Set(items.map((item) => item.status).filter(Boolean)),
    ] as string[];
  }

  static getDefaultCategories(): string[] {
    return ['Surgical', 'Dental', 'Supplies', 'Equipment', 'Office Hardware'];
  }

  static getDefaultLocations(): string[] {
    return ['Main Clinic', 'Storage Room', 'Sterilization Room'];
  }

  static getDefaultStatuses(): string[] {
    return ['active', 'inactive', 'maintenance', 'retired'];
  }

  static validateFilters(filters: InventoryFilters): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (
      filters.category &&
      !this.getDefaultCategories().includes(filters.category)
    ) {
      errors.push(`Invalid category: ${filters.category}`);
    }

    if (filters.status && !this.getDefaultStatuses().includes(filters.status)) {
      errors.push(`Invalid status: ${filters.status}`);
    }

    if (
      filters.location &&
      !this.getDefaultLocations().includes(filters.location)
    ) {
      errors.push(`Invalid location: ${filters.location}`);
    }

    if (filters.search && filters.search.length < 2) {
      errors.push('Search term must be at least 2 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
