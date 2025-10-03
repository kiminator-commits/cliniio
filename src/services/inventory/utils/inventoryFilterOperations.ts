import { SupabaseClient } from '@supabase/supabase-js';
import { InventoryFilters } from '../types/inventoryServiceTypes';

// Define proper types for Supabase query builder
interface SupabaseQueryBuilder {
  eq: (column: string, value: unknown) => SupabaseQueryBuilder;
  or: (condition: string) => SupabaseQueryBuilder;
}

/**
 * Standardized filter operations for inventory services
 * Provides consistent filtering logic across the entire module
 */
export class InventoryFilterOperations {
  /**
   * Apply filters to a Supabase query
   */
  static applyFilters(query: unknown, filters?: InventoryFilters): unknown {
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
        `name.ilike.%${filters.search}%,category.ilike.%${filters.search}%`
      );
    }

    return filteredQuery;
  }

  /**
   * Apply filters to a Supabase query with table name
   */
  static applyFiltersToTable(
    supabase: SupabaseClient,
    tableName: string,
    filters?: InventoryFilters
  ): unknown {
    const query = supabase.from(tableName).select(
      `
      id,
      name,
      category,
      quantity,
      unit_cost,
      reorder_point,
      expiration_date,
      data,
      created_at,
      updated_at
    `,
      { count: 'exact' }
    );
    return this.applyFilters(query, filters);
  }

  /**
   * Apply filters to a Supabase query with custom select
   */
  static applyFiltersToSelect(
    supabase: SupabaseClient,
    tableName: string,
    select: string,
    filters?: InventoryFilters
  ): unknown {
    const query = supabase.from(tableName).select(select, { count: 'exact' });
    return this.applyFilters(query, filters);
  }

  /**
   * Apply filters to a Supabase query for single item
   */
  static applyFiltersToSingle(
    supabase: SupabaseClient,
    tableName: string,
    id: string
  ): unknown {
    return supabase.from(tableName).select('*').eq('id', id).single();
  }

  /**
   * Apply filters to a Supabase query for categories
   */
  static applyFiltersToCategories(
    supabase: SupabaseClient,
    tableName: string
  ): unknown {
    return supabase
      .from(tableName)
      .select('category')
      .not('category', 'is', null);
  }

  /**
   * Apply filters to a Supabase query for locations
   */
  static applyFiltersToLocations(
    supabase: SupabaseClient,
    tableName: string
  ): unknown {
    return supabase
      .from(tableName)
      .select('location')
      .not('location', 'is', null);
  }

  /**
   * Extract unique values from filter results
   */
  static extractUniqueValues(data: unknown[], field: string): string[] {
    return Array.from(
      new Set(
        data?.map(
          (item: unknown) => (item as Record<string, unknown>)[field] as string
        ) || []
      )
    );
  }

  /**
   * Build search query for multiple fields
   */
  static buildSearchQuery(
    searchTerm: string,
    fields: string[] = ['name', 'category']
  ): string {
    return fields.map((field) => `${field}.ilike.%${searchTerm}%`).join(',');
  }

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

    return parts.length > 0 ? parts.join(', ') : 'no filters';
  }
}
