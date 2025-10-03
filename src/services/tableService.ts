import { supabase } from '../lib/supabaseClient';
import { Database } from '@/types/database.types';
import {
  createSafeQueryBuilder,
  getSafeFields,
  logQueryPerformance,
} from '../utils/queryOptimization';

// Type-safe table names from the database schema
type TableName = keyof Database['public']['Tables'];

// TypeScript interfaces
export interface QueryOptions {
  facilityId?: string;
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface TableServiceResponse<T> {
  data: T | T[] | null;
  error: string | null;
}

// Common table record interface
export interface BaseTableRecord {
  id: string;
  created_at: string;
  updated_at: string;
  facility_id?: string;
}

// Specific table type examples (can be extended as needed)
export interface FacilityRecord extends BaseTableRecord {
  name: string;
  facility_code: string;
  address?: string;
  contact_email?: string;
  contact_phone?: string;
  is_active: boolean;
}

export interface InventoryItemRecord extends BaseTableRecord {
  name: string;
  category: string;
  quantity: number;
  unit_cost: number;
  reorder_point: number;
  expiration_date?: string;
}

export interface UserRecord extends BaseTableRecord {
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
}

/**
 * Generic Table Service
 * Provides standardized CRUD operations for any Supabase table
 */
export class TableService {
  /**
   * Get all records from a table with automatic pagination and safety constraints
   */
  static async getAll<T = Record<string, unknown>>(
    tableName: TableName,
    options?: QueryOptions
  ): Promise<TableServiceResponse<T[]>> {
    const startTime = Date.now();

    try {
      // Create safe query with automatic pagination
      const { query, warnings } = createSafeQueryBuilder(
        supabase.from(tableName),
        options,
        tableName
      );

      // Use safe fields instead of select('*')
      const safeFields = getSafeFields(tableName);
      const safeQuery = query.select(safeFields);

      // Apply facility filter if provided
      if (options?.facilityId) {
        safeQuery.eq('facility_id', options.facilityId);
      }

      // Apply custom filters
      if (options?.filters) {
        Object.entries(options.filters).forEach(([key, value]) => {
          safeQuery.eq(key, value as string | number | boolean);
        });
      }

      const { data, error } = await safeQuery;

      const duration = Date.now() - startTime;
      const rowCount = data?.length || 0;

      // Log performance metrics
      logQueryPerformance(tableName, 'getAll', duration, rowCount, options);

      // Log warnings
      if (warnings.length > 0) {
        console.warn(`Query warnings for ${tableName}:`, warnings);
      }

      if (error) {
        return {
          data: null,
          error: `Failed to fetch records from ${tableName}: ${error.message}`,
        };
      }

      return { data: (data || []) as T[], error: null };
    } catch (error) {
      const duration = Date.now() - startTime;
      logQueryPerformance(tableName, 'getAll', duration, 0, options);

      return {
        data: null,
        error: `Unexpected error fetching records from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get a single record by ID
   */
  static async getById<T = Record<string, unknown>>(
    tableName: TableName,
    id: string
  ): Promise<TableServiceResponse<T>> {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return {
          data: null,
          error: `Failed to fetch record from ${tableName}: ${error.message}`,
        };
      }

      return { data: data as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error fetching record from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Insert a new record
   */
  static async insert<T = Record<string, unknown>>(
    tableName: TableName,
    data: Partial<T>
  ): Promise<TableServiceResponse<T>> {
    try {
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: `Failed to insert record into ${tableName}: ${error.message}`,
        };
      }

      return { data: insertedData as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error inserting record into ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Update a record by ID
   */
  static async update<T = Record<string, unknown>>(
    tableName: TableName,
    id: string,
    data: Partial<T>
  ): Promise<TableServiceResponse<T>> {
    try {
      const { data: updatedData, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return {
          data: null,
          error: `Failed to update record in ${tableName}: ${error.message}`,
        };
      }

      return { data: updatedData as T, error: null };
    } catch (error) {
      return {
        data: null,
        error: `Unexpected error updating record in ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Delete a record by ID
   */
  static async deleteById(
    tableName: TableName,
    id: string
  ): Promise<TableServiceResponse<boolean>> {
    try {
      const { error } = await supabase.from(tableName).delete().eq('id', id);

      if (error) {
        return {
          data: false,
          error: `Failed to delete record from ${tableName}: ${error.message}`,
        };
      }

      return { data: true, error: null };
    } catch (error) {
      return {
        data: false,
        error: `Unexpected error deleting record from ${tableName}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
}

// Legacy function exports for backward compatibility
export const getAll = TableService.getAll;
export const getById = TableService.getById;
export const insert = TableService.insert;
export const update = TableService.update;
export const deleteById = TableService.deleteById;
