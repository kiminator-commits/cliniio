// Consolidated Type Definitions
// This file provides clean, consistent type definitions across the application

import { Database, Json } from './supabase/generated';

// ============================================================================
// CORE DATABASE TYPES
// ============================================================================

// Inventory Types
export type InventoryItemRow =
  Database['public']['Tables']['inventory_items']['Row'];
export type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

// Sterilization Types
export type SterilizationCycleRow =
  Database['public']['Tables']['sterilization_cycles']['Row'];
export type SterilizationCycleInsert =
  Database['public']['Tables']['sterilization_cycles']['Insert'];
export type SterilizationCycleUpdate =
  Database['public']['Tables']['sterilization_cycles']['Update'];

// Environmental Clean Types - Note: cleaning_sessions table not found in current schema
// export type CleaningSessionRow = Database['public']['Tables']['cleaning_sessions']['Row'];
// export type CleaningSessionInsert = Database['public']['Tables']['cleaning_sessions']['Insert'];
// export type CleaningSessionUpdate = Database['public']['Tables']['cleaning_sessions']['Update'];

// Knowledge Hub Types - Note: help_articles table not found in current schema
// export type HelpArticleRow = Database['public']['Tables']['help_articles']['Row'];
// export type HelpArticleInsert = Database['public']['Tables']['help_articles']['Insert'];
// export type HelpArticleUpdate = Database['public']['Tables']['help_articles']['Update'];

// User Types
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

// ============================================================================
// APPLICATION-SPECIFIC INTERFACES
// ============================================================================

// Inventory Item Interface (with proper typing)
export interface InventoryItem {
  id: string;
  facility_id: string | null;
  name: string | null;
  quantity: number | null;
  data: Json | null;
  created_at: string | null;
  updated_at: string | null;
  reorder_point: number | null;
  expiration_date: string | null;
  unit_cost: number | null;
  category: string | null;
  status: string | null;
  location: string | null;
  supplier: string | null;
  cost: number | null;
  vendor: string | null;
  warranty: string | null;
  maintenance_schedule: string | null;
  next_due: string | null;
  service_provider: string | null;
  assigned_to: string | null;
  notes: string | null;
  tool_id: string | null;
  supply_id: string | null;
  equipment_id: string | null;
  hardware_id: string | null;
  p2_status: string | null;
  serial_number: string | null;
  manufacturer: string | null;
  image_url: string | null;
  tags: string[] | null;
  favorite: boolean | null;
  tracked?: boolean | null;
  barcode: string | null;
  sku?: string | null;
  description: string | null;
  current_phase: string | null;
  is_active: boolean | null;
  unit: string | null;
  expiration: string | null;
  purchase_date: string | null;
  last_serviced: string | null;
  last_updated: string | null;
}

// Sterilization Cycle Interface
export interface SterilizationCycle {
  id: string;
  facility_id: string | null;
  cycle_number: string | null;
  cycle_type: string | null;
  status: string | null;
  start_time: string | null;
  end_time: string | null;
  temperature: number | null;
  pressure: number | null;
  duration_minutes: number | null;
  operator_id: string | null;
  equipment_id: string | null;
  cycle_parameters: Json | null;
  environmental_factors: Json | null;
  quality_indicators: Json | null;
  compliance_data: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

// Environmental Clean Session Interface
export interface CleaningSession {
  id: string;
  facility_id: string | null;
  session_type: string | null;
  area: string | null;
  cleaning_type: string | null;
  started_time: string | null;
  completed_time: string | null;
  duration_minutes: number | null;
  quality_score: number | null;
  operator_id: string | null;
  equipment_used: Json | null;
  chemicals_used: Json | null;
  compliance_data: Json | null;
  created_at: string | null;
  updated_at: string | null;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  count: number;
  error: string | null;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isInventoryItem(obj: unknown): obj is InventoryItem {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id?: unknown }).id === 'string'
  );
}

export function isSterilizationCycle(obj: unknown): obj is SterilizationCycle {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id?: unknown }).id === 'string' &&
    'cycle_number' in obj
  );
}

export function isCleaningSession(obj: unknown): obj is CleaningSession {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    typeof (obj as { id?: unknown }).id === 'string' &&
    'session_type' in obj
  );
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type NonNullable<T> = T extends null | undefined ? never : T;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
