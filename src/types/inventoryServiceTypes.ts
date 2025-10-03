// ============================================================================
// INVENTORY SERVICE TYPES - SIMPLIFIED
// ============================================================================

import { InventoryItem } from '@/types/inventoryTypes';

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

/**
 * Service facade interface for inventory operations
 */
export interface InventoryServiceFacade extends InventoryService {
  // Additional facade-specific methods can be added here
  fetchAllInventoryData(): Promise<InventoryDataResponse>;
}

/**
 * Service for handling inventory category logic
 */
export interface InventoryCategoryService {
  createCategoryChangeHandler(
    setActiveTab: (tab: string) => void
  ): (tab: string) => void;
  createTrackedFilterHandler(
    showTrackedOnly: boolean,
    setShowTrackedOnly: (show: boolean) => void
  ): () => void;
  createFavoritesFilterHandler(
    showFavoritesOnly: boolean,
    setShowFavoritesOnly: (show: boolean) => void
  ): () => void;
}

/**
 * Service for handling inventory filtering logic
 */
export interface InventoryFilterService {
  getFilteredTools(): Array<{
    id: string;
    name: string;
    barcode: string;
    currentPhase: string;
    category: string;
  }>;
  setFilteredToolsData(data: InventoryItem[]): void;
}

/**
 * Service for handling inventory status logic
 */
export interface InventoryStatusService {
  getItemStatus(item: InventoryItem): string;
  getStatusBadge(status: string): React.ReactNode;
  getStatusText(status: string): string;
}

// ============================================================================
// BASIC RESPONSE TYPES
// ============================================================================

/**
 * Simple response type for single operations
 */
export interface InventoryResponse {
  data: InventoryItem[];
  error: string | null;
  count?: number;
}

/**
 * LocalStorage inventory data structure
 */
export interface LocalStorageInventoryData {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Inventory data response structure
 */
export interface InventoryDataResponse {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Simple response type for single item operations
 */
export interface InventorySingleResponse {
  data: InventoryItem | null;
  error: string | null;
}

/**
 * Simple response type for create operations
 */
export interface InventoryCreateResponse {
  data: InventoryItem | null;
  error: string | null;
}

/**
 * Simple response type for update operations
 */
export interface InventoryUpdateResponse {
  data: InventoryItem | null;
  error: string | null;
}

/**
 * Simple response type for delete operations
 */
export interface InventoryDeleteResponse {
  success: boolean;
  error: string | null;
}

/**
 * Simple response type for bulk operations
 */
export interface InventoryBulkResponse {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

// ============================================================================
// FILTER AND OPTION TYPES
// ============================================================================

/**
 * Inventory filters
 */
export interface InventoryFilters {
  // Basic filters
  search?: string;
  searchQuery?: string; // Alias for search
  category?: string;
  location?: string;
  status?: string;

  // Numeric ranges
  reorder_point?: number;
  // maxQuantity removed - not in Supabase schema
  minCost?: number;
  maxCost?: number;
  minPrice?: number; // Alias for minCost
  maxPrice?: number; // Alias for maxCost

  // Boolean filters
  isActive?: boolean;
  tracked?: boolean;
  favorite?: boolean;
  trackedOnly?: boolean; // Alias for tracked
  favoritesOnly?: boolean; // Alias for favorite
  showTrackedOnly?: boolean; // Alias for tracked
  showFavoritesOnly?: boolean; // Alias for favorite

  // Date ranges
  createdAt?: {
    start: string;
    end: string;
  };
  updated_at?: {
    start: string;
    end: string;
  };

  // Additional filters
  hasBarcode?: boolean;
}

/**
 * Query options
 */
export interface InventoryQueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  includeArchived?: boolean;
}

/**
 * Create options
 */
export interface InventoryCreateOptions {
  skipValidation?: boolean;
  skipCache?: boolean;
}

/**
 * Update options
 */
export interface InventoryUpdateOptions {
  skipValidation?: boolean;
  skipCache?: boolean;
  validateDependencies?: boolean;
}

/**
 * Delete options
 */
export interface InventoryDeleteOptions {
  softDelete?: boolean;
  skipCache?: boolean;
  validateDependencies?: boolean;
}

// ============================================================================
// SERVICE INTERFACE
// ============================================================================

/**
 * Standardized Inventory Service Interface
 */
export interface InventoryService {
  // === CORE CRUD OPERATIONS ===

  /**
   * Get all inventory items with optional filtering
   */
  getAllItems(
    filters?: InventoryFilters,
    options?: InventoryQueryOptions
  ): Promise<InventoryResponse>;

  /**
   * Get a single inventory item by ID
   */
  getItemById(id: string): Promise<InventorySingleResponse>;

  /**
   * Create a new inventory item
   */
  createItem(
    item: Omit<InventoryItem, 'id' | 'lastUpdated'>,
    options?: InventoryCreateOptions
  ): Promise<InventoryCreateResponse>;

  /**
   * Update an existing inventory item
   */
  updateItem(
    id: string,
    updates: Partial<InventoryItem>,
    options?: InventoryUpdateOptions
  ): Promise<InventoryUpdateResponse>;

  /**
   * Delete an inventory item
   */
  deleteItem(
    id: string,
    options?: InventoryDeleteOptions
  ): Promise<InventoryDeleteResponse>;

  // === BULK OPERATIONS ===

  /**
   * Bulk create multiple inventory items
   */
  bulkCreateItems(
    items: Omit<InventoryItem, 'id' | 'lastUpdated'>[]
  ): Promise<InventoryBulkResponse>;

  /**
   * Bulk update multiple inventory items
   */
  bulkUpdateItems(
    updates: Array<{ id: string; updates: Partial<InventoryItem> }>
  ): Promise<InventoryBulkResponse>;

  /**
   * Bulk delete multiple inventory items
   */
  bulkDeleteItems(ids: string[]): Promise<InventoryBulkResponse>;

  // === CATEGORY MANAGEMENT ===

  /**
   * Get all categories
   */
  getCategories(): Promise<{ data: string[]; error: string | null }>;

  /**
   * Add a new category
   */
  addCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }>;

  /**
   * Delete a category
   */
  deleteCategory(
    category: string
  ): Promise<{ success: boolean; error: string | null }>;

  // === LOCATION MANAGEMENT ===

  /**
   * Get all locations
   */
  getLocations(): Promise<{ data: string[]; error: string | null }>;

  // === FILTERING AND SEARCH ===

  /**
   * Get filtered items
   */
  getFilteredItems(
    filters: InventoryFilters,
    options?: InventoryQueryOptions
  ): Promise<InventoryResponse>;

  // === ANALYTICS ===

  /**
   * Get inventory statistics
   */
  getInventoryStats(): Promise<{
    data: Record<string, unknown> | null;
    error: string | null;
  }>;

  // === DATA TRANSFORMATION ===

  /**
   * Transform data for modal display
   */
  /**
   * @deprecated Use InventoryDataTransformer.transformForModal() instead
   */
  transformDataForModal(items: InventoryItem[]): Record<string, unknown>[];

  // === CACHING AND SYNC ===

  /**
   * Refresh data from source
   */
  refresh(): Promise<{ success: boolean; error: string | null }>;

  /**
   * Clear cache
   */
  clearCache(): void;

  // === REAL-TIME SUBSCRIPTIONS ===

  /**
   * Subscribe to changes
   */
  subscribeToChanges(
    callback: (payload: Record<string, unknown>) => void
  ): () => void;

  // === LEGACY COMPATIBILITY ===

  /**
   * Fetch all inventory data (legacy)
   */
  fetchAllInventoryData(): Promise<InventoryDataResponse>;

  /**
   * Fetch inventory items (legacy)
   */
  fetchInventoryItems(): Promise<InventoryItem[]>;

  /**
   * Add inventory item (legacy)
   */
  addInventoryItem(item: InventoryItem): Promise<InventoryItem>;

  /**
   * Update inventory item (legacy)
   */
  updateInventoryItem(
    id: string,
    item: Partial<InventoryItem>
  ): Promise<InventoryItem>;

  /**
   * Delete inventory item (legacy)
   */
  deleteInventoryItem(id: string): Promise<void>;
}

// ============================================================================
// ADDITIONAL TYPE DEFINITIONS
// ============================================================================

/**
 * Result of an operation
 */
export interface OperationResult {
  success: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Options for deleting items
 */
export interface DeleteItemOptions {
  softDelete?: boolean;
  archive?: boolean;
  reason?: string;
}

/**
 * Search options for inventory items
 */
export interface SearchOptions {
  query: string;
  fields?: string[];
  fuzzy?: boolean;
  caseSensitive?: boolean;
}

/**
 * Filter options for inventory items
 */
export interface FilterOptions {
  category?: string;
  status?: string;
  location?: string;
  reorder_point?: number;
  // maxQuantity removed - not in Supabase schema
  isActive?: boolean;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Sort options for inventory items
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Type of adapter
 */
export type AdapterType = 'localStorage' | 'api' | 'supabase' | 'static';

/**
 * Metadata about an adapter
 */
export interface AdapterMetadata {
  type: AdapterType;
  name: string;
  version: string;
  capabilities: string[];
}

/**
 * Cache statistics
 */
export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  updated_at: string;
}

/**
 * Inventory error codes
 */
export enum InventoryErrorCode {
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}
