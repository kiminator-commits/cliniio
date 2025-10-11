import { InventoryItem } from '../../../types/inventoryTypes';

// ============================================================================
// STANDARDIZED FILTER INTERFACES
// ============================================================================

export interface InventoryFilters {
  category?: string;
  status?: 'active' | 'inactive' | 'p2' | 'n/a';
  location?: string;
  search?: string;
  minQuantity?: number;
  maxQuantity?: number;
  minCost?: number;
  maxCost?: number;
  isActive?: boolean;
  tracked?: boolean;
  favorite?: boolean;
}

// ============================================================================
// STANDARDIZED RESPONSE INTERFACES
// ============================================================================

export interface InventoryResponse {
  data: InventoryItem[];
  error: string | null;
  count?: number;
}

export interface InventorySingleResponse {
  data: InventoryItem | null;
  error: string | null;
}

export interface InventoryCreateResponse {
  data: InventoryItem | null;
  error: string | null;
}

export interface InventoryUpdateResponse {
  data: InventoryItem | null;
  error: string | null;
}

export interface InventoryDeleteResponse {
  success: boolean;
  error: string | null;
}

export interface InventoryBulkResponse {
  success: boolean;
  processedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface InventoryDataResponse {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
}

export interface InventoryStats {
  totalItems: number;
  activeItems: number;
  totalValue: number;
  categories: { [key: string]: number };
}

// ============================================================================
// STANDARDIZED OPERATION INTERFACES
// ============================================================================

export interface InventoryCreateOptions {
  validateData?: boolean;
  skipCache?: boolean;
  returnFullItem?: boolean;
}

export interface InventoryUpdateOptions {
  validateData?: boolean;
  skipCache?: boolean;
  returnFullItem?: boolean;
  partialUpdate?: boolean;
}

export interface InventoryDeleteOptions {
  softDelete?: boolean;
  skipCache?: boolean;
  validateDependencies?: boolean;
}

export interface InventoryQueryOptions {
  filters?: InventoryFilters;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
  includeDeleted?: boolean;
}

// ============================================================================
// STANDARDIZED ERROR INTERFACES
// ============================================================================

export interface InventoryError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  operation: string;
}

export interface InventoryValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface InventoryValidationResult {
  isValid: boolean;
  errors: InventoryValidationError[];
}

// ============================================================================
// STANDARDIZED SERVICE INTERFACE
// ============================================================================

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
    data: InventoryStats | null;
    error: string | null;
  }>;

  // === DATA TRANSFORMATION ===

  /**
   * Transform data for modal display
   */
  /**
   * @deprecated Use InventoryDataTransformer.transformForModal() instead
   */
  transformDataForModal(items: InventoryItem[]): InventoryModalData[];

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
// LEGACY INTERFACES (FOR BACKWARD COMPATIBILITY)
// ============================================================================

export interface InventoryModalData {
  id: string;
  name: string;
  barcode: string;
  currentPhase: string;
  category: string;
}

export interface InventoryCache {
  data: InventoryDataResponse | null;
  timestamp: number;
  ttl: number;
}

export interface SupabaseItem {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  description?: string;
  quantity?: number;
  cost?: number;
  barcode?: string;
  warranty?: string;
  serial_number?: string;
  expiration?: string;
  manufacturer?: string;
  unit?: string;
  min_quantity?: number;
  max_quantity?: number;
  supplier?: string;
  notes?: string;
  tags?: string[];
  image_url?: string;
  is_active?: boolean;
  tracked?: boolean;
  favorite?: boolean;
  purchase_date?: string;
  current_phase?: string;
  sku?: string;
  p2_status?: string;
  created_at: string;
  updated_at?: string;
}
