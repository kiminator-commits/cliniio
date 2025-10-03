// Export all inventory page types
export * from './inventoryDashboardTypes';
export * from './inventorySearchTypes';
export * from './scanInventoryModalTypes';

// Re-export main inventory types
export * from '../../../types/inventoryTypes';

// Re-export TabType from the main types file
export type { TabType } from '@/types/inventory';

// Import InventoryItem for use in this file
import { InventoryItem } from '../../../types/inventoryTypes';

// Additional types needed for inventory page
export interface StoreFormData {
  [key: string]: unknown;
}

// Use the unified InventoryItem type for consistency
export type InventoryItemData = Partial<InventoryItem>;

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
