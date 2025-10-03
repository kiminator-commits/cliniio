// Strengthened Supabase table mapping types
// This file provides specific types for database table operations and mappings

import { Database } from './supabase';

// ============================================================================
// TABLE ROW TYPES
// ============================================================================

export type InventoryItemRow =
  Database['public']['Tables']['inventory_items']['Row'];
export type InventoryItemInsert =
  Database['public']['Tables']['inventory_items']['Insert'];
export type InventoryItemUpdate =
  Database['public']['Tables']['inventory_items']['Update'];

export type ActivityFeedRow =
  Database['public']['Tables']['activity_feed']['Row'];
export type ActivityFeedInsert =
  Database['public']['Tables']['activity_feed']['Insert'];
export type ActivityFeedUpdate =
  Database['public']['Tables']['activity_feed']['Update'];

export type EnvironmentalCleanRow =
  Database['public']['Tables']['environmental_cleans_enhanced']['Row'];
export type EnvironmentalCleanInsert =
  Database['public']['Tables']['environmental_cleans_enhanced']['Insert'];
export type EnvironmentalCleanUpdate =
  Database['public']['Tables']['environmental_cleans_enhanced']['Update'];

export type SterilizationRow =
  Database['public']['Tables']['sterilization_cycles']['Row'];
export type SterilizationInsert =
  Database['public']['Tables']['sterilization_cycles']['Insert'];
export type SterilizationUpdate =
  Database['public']['Tables']['sterilization_cycles']['Update'];

export type KnowledgeHubRow =
  Database['public']['Tables']['knowledge_hub_content']['Row'];
export type KnowledgeHubInsert =
  Database['public']['Tables']['knowledge_hub_content']['Insert'];
export type KnowledgeHubUpdate =
  Database['public']['Tables']['knowledge_hub_content']['Update'];

// ============================================================================
// TABLE MAPPING INTERFACES
// ============================================================================

export interface TableMapping<TDatabase, TApplication> {
  toApplication: (dbRow: TDatabase) => TApplication;
  toDatabase: (appData: TApplication) => TDatabase;
  validate: (data: unknown) => data is TDatabase;
}

// ============================================================================
// INVENTORY TABLE MAPPINGS
// ============================================================================

export interface InventoryTableMapping
  extends TableMapping<InventoryItemRow, InventoryItemRow> {
  toApplication: (dbRow: InventoryItemRow) => InventoryItemRow;
  toDatabase: (appData: InventoryItemRow) => InventoryItemRow;
  validate: (data: unknown) => data is InventoryItemRow;
}

// ============================================================================
// ENVIRONMENTAL CLEAN TABLE MAPPINGS
// ============================================================================

export interface EnvironmentalCleanTableMapping
  extends TableMapping<EnvironmentalCleanRow, EnvironmentalCleanRow> {
  toApplication: (dbRow: EnvironmentalCleanRow) => EnvironmentalCleanRow;
  toDatabase: (appData: EnvironmentalCleanRow) => EnvironmentalCleanRow;
  validate: (data: unknown) => data is EnvironmentalCleanRow;
}

// ============================================================================
// STERILIZATION TABLE MAPPINGS
// ============================================================================

export interface SterilizationTableMapping
  extends TableMapping<SterilizationRow, SterilizationRow> {
  toApplication: (dbRow: SterilizationRow) => SterilizationRow;
  toDatabase: (appData: SterilizationRow) => SterilizationRow;
  validate: (data: unknown) => data is SterilizationRow;
}

// ============================================================================
// KNOWLEDGE HUB TABLE MAPPINGS
// ============================================================================

export interface KnowledgeHubTableMapping
  extends TableMapping<KnowledgeHubRow, KnowledgeHubRow> {
  toApplication: (dbRow: KnowledgeHubRow) => KnowledgeHubRow;
  toDatabase: (appData: KnowledgeHubRow) => KnowledgeHubRow;
  validate: (data: unknown) => data is KnowledgeHubRow;
}

// ============================================================================
// QUERY BUILDER TYPES
// ============================================================================

export interface QueryFilter {
  column: string;
  operator:
    | 'eq'
    | 'ne'
    | 'gt'
    | 'gte'
    | 'lt'
    | 'lte'
    | 'like'
    | 'ilike'
    | 'in'
    | 'is'
    | 'not';
  value: string | number | boolean | string[] | null;
}

export interface QueryOrder {
  column: string;
  ascending: boolean;
}

export interface QueryOptions {
  select?: string[];
  filters?: QueryFilter[];
  order?: QueryOrder[];
  limit?: number;
  offset?: number;
}

// ============================================================================
// RESPONSE TYPES
// ============================================================================

export interface SupabaseTableResponse<T> {
  data: T[] | null;
  error: {
    message: string;
    details?: string;
    hint?: string;
    code?: string;
  } | null;
  count?: number | null;
}

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isInventoryItemRow = (obj: unknown): obj is InventoryItemRow => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'facility_id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
};

export const isEnvironmentalCleanRow = (
  obj: unknown
): obj is EnvironmentalCleanRow => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'room_id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
};

export const isSterilizationRow = (obj: unknown): obj is SterilizationRow => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'workflow_id' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
};

export const isKnowledgeHubRow = (obj: unknown): obj is KnowledgeHubRow => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'title' in obj &&
    typeof (obj as Record<string, unknown>).id === 'string'
  );
};

// ============================================================================
// TABLE MAPPING FACTORY
// ============================================================================

export class TableMappingFactory {
  static createInventoryMapping(): InventoryTableMapping {
    return {
      toApplication: (dbRow: InventoryItemRow) => dbRow,
      toDatabase: (appData: InventoryItemRow) => appData,
      validate: isInventoryItemRow,
    };
  }

  static createEnvironmentalCleanMapping(): EnvironmentalCleanTableMapping {
    return {
      toApplication: (dbRow: EnvironmentalCleanRow) => dbRow,
      toDatabase: (appData: EnvironmentalCleanRow) => appData,
      validate: isEnvironmentalCleanRow,
    };
  }

  static createSterilizationMapping(): SterilizationTableMapping {
    return {
      toApplication: (dbRow: SterilizationRow) => dbRow,
      toDatabase: (appData: SterilizationRow) => appData,
      validate: isSterilizationRow,
    };
  }

  static createKnowledgeHubMapping(): KnowledgeHubTableMapping {
    return {
      toApplication: (dbRow: KnowledgeHubRow) => dbRow,
      toDatabase: (appData: KnowledgeHubRow) => appData,
      validate: isKnowledgeHubRow,
    };
  }
}
