// Typed Supabase operations for inventory
// This file provides proper types for all Supabase inventory operations

import { InventoryItem } from '../inventoryTypes';
import { Json } from '../../../types/database.types';

// Re-export InventoryItem for other modules
export type { InventoryItem };

// ============================================================================
// SUPABASE RESPONSE TYPES
// ============================================================================

export interface SupabaseInventoryRow {
  id: string;
  facility_id: string | null;
  name: string | null;
  quantity: number | null;
  data: Json | null;
  created_at: string | null;
  updated_at: string | null;
  reorder_level: number | null;
  reorder_point: number | null;
  status: string | null;
  expiration_date: string | null;
  unit_cost: number | null;
  category: string | null;
  archived: boolean | null;
  archived_at: string | null;
  archived_by: string | null;
  archive_reason: string | null;
}

export interface SupabaseResponse<T = SupabaseInventoryRow> {
  data: T[] | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
}

export interface SupabaseSingleResponse<T = SupabaseInventoryRow> {
  data: T | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
}

// ============================================================================
// REALTIME SUBSCRIPTION TYPES
// ============================================================================

export interface RealtimeInventoryPayload {
  schema: string;
  table: string;
  commit_timestamp: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: SupabaseInventoryRow | null;
  old: SupabaseInventoryRow | null;
  errors: string[] | null;
}

export interface RealtimeSubscriptionOptions {
  event?: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  schema?: string;
  table?: string;
  filter?: string;
}

// ============================================================================
// CRUD OPERATION TYPES
// ============================================================================

export interface CreateInventoryItemData {
  facility_id?: string | null;
  name?: string | null;
  quantity?: number | null;
  data?: Json | null;
  reorder_level?: number | null;
  reorder_point?: number | null;
  status?: string | null;
  expiration_date?: string | null;
  unit_cost?: number | null;
  category?: string | null;
}

export interface UpdateInventoryItemData {
  name?: string | null;
  quantity?: number | null;
  data?: Json | null;
  reorder_level?: number | null;
  reorder_point?: number | null;
  status?: string | null;
  expiration_date?: string | null;
  unit_cost?: number | null;
  category?: string | null;
  archived?: boolean | null;
  archived_at?: string | null;
  archived_by?: string | null;
  archive_reason?: string | null;
}

export interface InventoryQueryOptions {
  select?: string;
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
  filters?: {
    category?: string;
    facility_id?: string;
    [key: string]: unknown;
  };
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isSupabaseInventoryRow = (
  obj: unknown
): obj is SupabaseInventoryRow => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
};

export const isSupabaseResponse = <T>(
  obj: unknown
): obj is SupabaseResponse<T> => {
  return (
    typeof obj === 'object' && obj !== null && ('data' in obj || 'error' in obj)
  );
};

export const isRealtimeInventoryPayload = (
  obj: unknown
): obj is RealtimeInventoryPayload => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'eventType' in obj &&
    'table' in obj &&
    typeof (obj as Record<string, unknown>).table === 'string'
  );
};

// ============================================================================
// TRANSFORMATION TYPES
// ============================================================================

export interface InventoryTransformationResult {
  success: boolean;
  data?: InventoryItem;
  error?: string;
}

export interface InventoryBatchTransformationResult {
  success: boolean;
  data?: InventoryItem[];
  error?: string;
  processedCount: number;
  errorCount: number;
}
