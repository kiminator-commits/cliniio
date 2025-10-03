import {
  InventoryFilters,
  InventoryQueryOptions,
} from '../types/inventoryServiceTypes';
import { InventoryItem } from '@/types/inventoryTypes';

// Define proper types for Supabase query builder
interface SupabaseQueryBuilder {
  eq: (column: string, value: unknown) => SupabaseQueryBuilder;
  or: (condition: string) => SupabaseQueryBuilder;
  gte: (column: string, value: number) => SupabaseQueryBuilder;
  lte: (column: string, value: number) => SupabaseQueryBuilder;
  order: (
    column: string,
    options: { ascending: boolean }
  ) => SupabaseQueryBuilder;
  limit: (count: number) => SupabaseQueryBuilder;
  range: (start: number, end: number) => SupabaseQueryBuilder;
}

/**
 * Standardized filtering for all Inventory services
 * Provides consistent filtering logic across the entire module
 */
export class InventoryStandardizedFilters {
  // ============================================================================
  // FILTER VALIDATION
  // ============================================================================

  /**
   * Validate filter parameters
   */
  static validateFilters(filters?: InventoryFilters): boolean {
    if (!filters) {
      return true;
    }

    // Validate search term length
    if (filters.search && filters.search.trim().length < 2) {
      return false;
    }

    // Validate status values
    const validStatuses = ['active', 'inactive', 'maintenance', 'retired'];
    if (filters.status && !validStatuses.includes(filters.status)) {
      return false;
    }

    // Validate numeric ranges
    if (filters.minQuantity !== undefined && filters.minQuantity < 0) {
      return false;
    }

    if (filters.maxQuantity !== undefined && filters.maxQuantity < 0) {
      return false;
    }

    if (filters.minCost !== undefined && filters.minCost < 0) {
      return false;
    }

    if (filters.maxCost !== undefined && filters.maxCost < 0) {
      return false;
    }

    // Validate range consistency
    if (
      filters.minQuantity !== undefined &&
      filters.maxQuantity !== undefined
    ) {
      if (filters.minQuantity > filters.maxQuantity) {
        return false;
      }
    }

    if (filters.minCost !== undefined && filters.maxCost !== undefined) {
      if (filters.minCost > filters.maxCost) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get filter summary for logging
   */
  static getFilterSummary(filters?: InventoryFilters): string {
    if (!filters) {
      return 'no filters';
    }

    const parts: string[] = [];

    if (filters.category) parts.push(`category: ${filters.category}`);
    if (filters.status) parts.push(`status: ${filters.status}`);
    if (filters.location) parts.push(`location: ${filters.location}`);
    if (filters.search) parts.push(`search: "${filters.search}"`);
    if (filters.minQuantity !== undefined)
      parts.push(`minQuantity: ${filters.minQuantity}`);
    if (filters.maxQuantity !== undefined)
      parts.push(`maxQuantity: ${filters.maxQuantity}`);
    if (filters.minCost !== undefined)
      parts.push(`minCost: ${filters.minCost}`);
    if (filters.maxCost !== undefined)
      parts.push(`maxCost: ${filters.maxCost}`);
    if (filters.isActive !== undefined)
      parts.push(`isActive: ${filters.isActive}`);
    if (filters.tracked !== undefined)
      parts.push(`tracked: ${filters.tracked}`);
    if (filters.favorite !== undefined)
      parts.push(`favorite: ${filters.favorite}`);

    return parts.length > 0 ? parts.join(', ') : 'no filters';
  }

  // ============================================================================
  // SUPABASE FILTERING
  // ============================================================================

  /**
   * Apply filters to Supabase query
   */
  static applyFiltersToSupabaseQuery(
    query: unknown,
    filters?: InventoryFilters
  ): unknown {
    if (!filters) {
      return query;
    }

    let filteredQuery = query as SupabaseQueryBuilder;

    // Apply category filter
    if (filters.category) {
      filteredQuery = filteredQuery.eq('category', filters.category);
    }

    // Apply status filter
    if (filters.status) {
      filteredQuery = filteredQuery.eq('status', filters.status);
    }

    // Apply location filter
    if (filters.location) {
      filteredQuery = filteredQuery.eq('location', filters.location);
    }

    // Apply search filter
    if (filters.search) {
      filteredQuery = filteredQuery.or(
        `name.ilike.%${filters.search}%,category.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    // Apply quantity filters
    if (filters.minQuantity !== undefined) {
      filteredQuery = filteredQuery.gte('quantity', filters.minQuantity);
    }

    if (filters.maxQuantity !== undefined) {
      filteredQuery = filteredQuery.lte('quantity', filters.maxQuantity);
    }

    // Apply cost filters
    if (filters.minCost !== undefined) {
      filteredQuery = filteredQuery.gte('cost', filters.minCost);
    }

    if (filters.maxCost !== undefined) {
      filteredQuery = filteredQuery.lte('cost', filters.maxCost);
    }

    // Apply boolean filters
    if (filters.isActive !== undefined) {
      filteredQuery = filteredQuery.eq('is_active', filters.isActive);
    }

    if (filters.tracked !== undefined) {
      filteredQuery = filteredQuery.eq('tracked', filters.tracked);
    }

    if (filters.favorite !== undefined) {
      filteredQuery = filteredQuery.eq('favorite', filters.favorite);
    }

    return filteredQuery;
  }

  /**
   * Apply query options to Supabase query
   */
  static applyQueryOptionsToSupabaseQuery(
    query: unknown,
    options?: InventoryQueryOptions
  ): unknown {
    if (!options) {
      return query;
    }

    let modifiedQuery = query as SupabaseQueryBuilder;

    // Apply ordering
    if (options.orderBy) {
      const direction = options.orderDirection || 'asc';
      modifiedQuery = modifiedQuery.order(options.orderBy, {
        ascending: direction === 'asc',
      });
    }

    // Apply pagination
    if (options.limit) {
      modifiedQuery = modifiedQuery.limit(options.limit);
    }

    if (options.offset) {
      modifiedQuery = modifiedQuery.range(
        options.offset,
        options.offset + (options.limit || 100) - 1
      );
    }

    // Apply include deleted filter
    if (!options.includeDeleted) {
      modifiedQuery = modifiedQuery.eq('deleted_at', null);
    }

    return modifiedQuery;
  }

  // ============================================================================
  // IN-MEMORY FILTERING
  // ============================================================================

  /**
   * Apply filters to in-memory array
   */
  static applyFiltersToArray(
    items: InventoryItem[],
    filters?: InventoryFilters
  ): InventoryItem[] {
    if (!filters) {
      return items;
    }

    return items.filter((item) => {
      // Category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }

      // Location filter
      if (filters.location && item.location !== filters.location) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch =
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
            item.data.serialNumber.toLowerCase().includes(searchLower));

        if (!matchesSearch) {
          return false;
        }
      }

      // Quantity filters
      if (
        filters.minQuantity !== undefined &&
        (item.quantity || 0) < filters.minQuantity
      ) {
        return false;
      }

      if (
        filters.maxQuantity !== undefined &&
        (item.quantity || 0) > filters.maxQuantity
      ) {
        return false;
      }

      // Cost filters
      if (
        filters.minCost !== undefined &&
        (item.unit_cost || 0) < filters.minCost
      ) {
        return false;
      }

      if (
        filters.maxCost !== undefined &&
        (item.unit_cost || 0) > filters.maxCost
      ) {
        return false;
      }

      // Boolean filters
      if (
        filters.isActive !== undefined &&
        item.data?.isActive !== filters.isActive
      ) {
        return false;
      }

      if (
        filters.tracked !== undefined &&
        item.data?.tracked !== filters.tracked
      ) {
        return false;
      }

      if (
        filters.favorite !== undefined &&
        item.data?.favorite !== filters.favorite
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Apply query options to in-memory array
   */
  static applyQueryOptionsToArray(
    items: InventoryItem[],
    options?: InventoryQueryOptions
  ): InventoryItem[] {
    if (!options) {
      return items;
    }

    let modifiedItems = [...items];

    // Apply ordering
    if (options.orderBy) {
      const direction = options.orderDirection || 'asc';
      modifiedItems.sort((a, b) => {
        // Type-safe property access using keyof InventoryItem
        const orderByKey = options.orderBy! as keyof InventoryItem;
        const aValue = a[orderByKey];
        const bValue = b[orderByKey];

        if (
          aValue !== undefined &&
          bValue !== undefined &&
          aValue !== null &&
          bValue !== null
        ) {
          if (aValue < bValue) return direction === 'asc' ? -1 : 1;
          if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply pagination
    if (options.offset || options.limit) {
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;
      modifiedItems = modifiedItems.slice(start, end);
    }

    return modifiedItems;
  }

  // ============================================================================
  // FILTER BUILDERS
  // ============================================================================

  /**
   * Build filter from search query
   */
  static buildFilterFromSearch(searchQuery: string): InventoryFilters {
    return {
      search: searchQuery.trim(),
    };
  }

  /**
   * Build filter from category
   */
  static buildFilterFromCategory(category: string): InventoryFilters {
    return {
      category,
    };
  }

  /**
   * Build filter from status
   */
  static buildFilterFromStatus(
    status: 'active' | 'inactive' | 'maintenance' | 'retired'
  ): InventoryFilters {
    return {
      status,
    };
  }

  /**
   * Build filter from location
   */
  static buildFilterFromLocation(location: string): InventoryFilters {
    return {
      location,
    };
  }

  /**
   * Combine multiple filters
   */
  static combineFilters(
    ...filters: (InventoryFilters | undefined)[]
  ): InventoryFilters {
    const combined: InventoryFilters = {};

    for (const filter of filters) {
      if (filter) {
        Object.assign(combined, filter);
      }
    }

    return combined;
  }

  // ============================================================================
  // FILTER UTILITIES
  // ============================================================================

  /**
   * Get unique values for a field from items
   */
  static getUniqueValues(
    items: InventoryItem[],
    field: keyof InventoryItem
  ): string[] {
    const values = items
      .map((item) => item[field])
      .filter((value) => value !== undefined && value !== null && value !== '');

    return [...new Set(values)].map((v: unknown) => String(v));
  }

  /**
   * Get available filter options from items
   */
  static getAvailableFilterOptions(items: InventoryItem[]): {
    categories: string[];
    statuses: string[];
    locations: string[];
  } {
    return {
      categories: this.getUniqueValues(items, 'category'),
      statuses: this.getUniqueValues(items, 'status'),
      locations: this.getUniqueValues(items, 'location'),
    };
  }
}
