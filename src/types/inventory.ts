// Centralized Inventory Types
// This file exports all inventory-related types to fix import issues

export * from './inventoryTypes';

// Re-export inventory page types
export * from '../pages/Inventory/types';

// Explicitly export TabType to ensure it's available
export type { TabType } from '../pages/Inventory/types';

// Additional types needed for the inventory system
export interface InventoryStore {
  // UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCategoryChange: (tab: string) => void;
  showTrackedOnly: boolean;
  setShowTrackedOnly: (show: boolean) => void;
  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  trackedItems: Set<string>;
  trackingData: Map<string, { doctor: string; timestamp: string }>;
  toggleTrackedItem: (itemId: string, doctor: string) => void;
  isInventoryLoading: boolean;
  setInventoryLoading: (loading: boolean) => void;
  isCategoriesLoading: boolean;
  setCategoriesLoading: (loading: boolean) => void;
  favorites: string[];
  setFavorites: (favorites: string[]) => void;
  handleToggleFavorite: (itemId: string) => void;
  resetFilters: () => void;

  // Data State
  inventoryItems: InventoryItem[];
  categories: string[];
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setPagination: (pagination: Record<string, unknown>) => void;
  pagination: {
    currentPage: number;
    pageSize: number;
  };
  sorting: {
    field: string | null;
    direction: string;
  };
  setSorting: (sorting: Record<string, unknown>) => void;
  filters: Record<string, unknown>;
  selectedItems: string[];
  setSelectedItems: (items: string[]) => void;

  // Data refresh methods
  refreshInventoryData: () => Promise<void>;
  getFilteredItems: () => InventoryItem[];
  getUniqueCategories: () => string[];

  // Modal State
  showAddModal: boolean;
  toggleAddModal: () => void;
  setShowAddModal: (show: boolean) => void;
  showTrackModal: boolean;
  toggleTrackModal: () => void;
  showUploadBarcodeModal: boolean;
  toggleUploadBarcodeModal: () => void;
  showScanModal: boolean;
  setShowScanModal: (show: boolean) => void;
  scanMode: 'add' | 'use' | null;
  scannedItems: string[];
  setScanMode: (mode: 'add' | 'use' | null) => void;
  addScannedItem: (id: string) => void;
  removeScannedItem: (id: string) => void;
  resetScannedItems: () => void;
}

// Re-export the unified InventoryItem type from inventoryTypes
export type { InventoryItem } from './inventoryTypes';

// Import InventoryItem for use in this file
import { InventoryItem } from './inventoryTypes';

export interface ExpandedSections {
  general: boolean;
  purchase: boolean;
  maintenance: boolean;
  usage: boolean;
  [key: string]: boolean;
}

export interface StoreFormData {
  [key: string]: unknown;
}

export interface InventoryItemData {
  item: string;
  category: string;
  location: string;
  status?: string;
}

export interface StatsData {
  toolsSterilized: number;
  inventoryChecks: number;
  perfectDays: number;
  totalTasks: number;
  completedTasks: number;
  currentStreak: number;
  bestStreak: number;
}

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface InventoryData {
  tools: InventoryItem[];
  supplies: InventoryItem[];
  equipment: InventoryItem[];
  officeHardware: InventoryItem[];
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

export interface UseInventoryDataManagerReturn {
  data: InventoryData;
  inventoryData: InventoryItem[];
  suppliesData: InventoryItem[];
  equipmentData: InventoryItem[];
  officeHardwareData: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
  refreshData: () => void;
  getAnalyticsData: () => Record<string, unknown>;
  getAllItems: () => InventoryItem[];
  getCategories: () => string[];
  clearError: () => void;
}

export interface UseCentralizedInventoryDataReturn {
  data: InventoryData;
  inventoryData: InventoryItem[];
  suppliesData: InventoryItem[];
  equipmentData: InventoryItem[];
  officeHardwareData: InventoryItem[];
  categories: string[];
  isLoading: boolean;
  error: string | null;
  getFilteredData: (category: string) => InventoryItem[];
  getFilteredSuppliesData: () => InventoryItem[];
  getFilteredEquipmentData: () => InventoryItem[];
  getFilteredOfficeHardwareData: () => InventoryItem[];
  refreshData: () => void;
  getAnalyticsData: () => Record<string, unknown>;
  getAllItems: () => InventoryItem[];
  getCategories: () => string[];
}

export interface UseInventoryFormValidationReturn {
  validateFormData: (data: Record<string, unknown>) => boolean;
}

export interface UseInventoryFormSubmissionReturn {
  submitFormData: (data: Record<string, unknown>) => Promise<void>;
}

export interface InventoryStoreState {
  inventoryItems: InventoryItem[];
  filters: Record<string, unknown>;
  pagination: {
    currentPage: number;
    pageSize: number;
  };
  sorting: {
    field: string | null;
    direction: string;
  };
  selectedItems: string[];
  categories: string[];
  isCategoriesLoading: boolean;
  addInventoryItem: (item: InventoryItem) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setPagination: (pagination: Record<string, unknown>) => void;
}

export interface InventoryModalsProps {
  formData: Partial<InventoryItem>;
  isEditMode: boolean;
  expandedSections: Record<string, boolean>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  handleShowAddModal: () => void;
  handleCloseAddModal: () => void;
  handleEditClick: (item: InventoryItem) => void;
  handleDeleteItem: (item: InventoryItem) => void;
  getStatusText: (status: string) => string;
}

export interface EditItemModalProps {
  show: boolean;
  onHide: () => void;
  item: InventoryItem;
  onSave: () => void;
  container?: HTMLElement;
}

export interface TrackItemModalProps {
  show: boolean;
  onHide: () => void;
  item: InventoryItem;
  onSave: () => void;
  container?: HTMLElement;
}

export interface ExpandedFiltersPanelProps {
  activeTab: string;
  filters: {
    searchQuery: string;
    category: string;
    location: string;
    showTrackedOnly: boolean;
    showFavoritesOnly: boolean;
  };
  setCategoryFilter: (category: string) => void;
  setLocationFilter: (location: string) => void;
  setSearchQuery: (value: string) => void;
  onToggleFavoritesFilter: () => void;
  onToggleTrackedFilter: () => void;
  onClearFilters: () => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
}

export interface SortableTableHeaderProps {
  label: string;
  field: string;
  activeField: string | null;
  direction: string;
  onSort: (field: string) => void;
  scope: string;
}

export interface InventoryTableRowProps {
  item: InventoryItem;
  index: number;
  activeTab: string;
  expandedActions: Record<string, boolean>;
  setExpandedActions: (actions: Record<string, boolean>) => void;
  handleEditClick: (item: InventoryItem) => void;
  handleDeleteItem: (item: InventoryItem) => void;
  handleToggleFavorite: (itemId: string) => void;
  handleToggleTracked: (itemId: string) => void;
  isFavorite: boolean;
  isTracked: boolean;
}

export interface InventoryUIStateType {
  searchTerm: string;
  isSearching: boolean;
  searchResults: InventoryItem[];
  totalResults: number;
  searchTimestamp: Date | null;
  searchError: string | null;
  categoryFilter: string;
  locationFilter: string;
  setCategoryFilter: (filter: string) => void;
  setLocationFilter: (filter: string) => void;
}

// Re-export FormData from inventoryTypes to avoid conflicts
export type { FormData } from './inventoryTypes';

// Alias InventoryFormData to FormData for backward compatibility
export interface InventoryFormData {
  id?: string;
  itemName: string;
  category: string;
  location: string;
  status: string;
  quantity: number;
  unitCost: number;
  minimumQuantity: number;
  maximumQuantity: number;
  supplier: string;
  barcode?: string;
  sku?: string;
  description?: string;
  notes?: string;
  updated_at: string;
  createdAt: string;
  [key: string]: unknown;
}

export interface AnalyticsMetrics {
  totalItems: number;
  totalValue: number;
  averagePrice: number;
  lowStockCount: number;
  outOfStockCount: number;
  overstockCount: number;
  categoryCount: number;
  statusCount: number;
  locationCount: number; // Number of unique locations
  lowStockItems: number; // Number of items below minimum quantity
}

export interface ReportOptions {
  includeCharts: boolean;
  includeDetails: boolean;
  timeRange?: 'week' | 'month' | 'quarter' | 'year';
  format?: 'csv' | 'json' | 'pdf' | null;
  filters?: Record<string, string | number | boolean> | null;
}

export interface InventoryFilters {
  category?: string;
  status?: string;
  searchTerm?: string;
  location?: string;
  minQuantity?: number;
  maxQuantity?: number;
}

export interface InventoryStatus {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface TrackingEvent {
  id: string;
  itemId: string;
  eventType: 'check_in' | 'check_out' | 'maintenance' | 'repair' | 'disposal';
  timestamp: string;
  userId: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}
