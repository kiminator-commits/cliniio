// import { InventoryActionService } from '../../services/inventoryActionService';
import { vi } from 'vitest';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useBackgroundSync } from '@/hooks/useBackgroundSync';
import { useCentralizedInventoryData } from '@/hooks/useCentralizedInventoryData';

// Mock all the hooks and services
vi.mock('@/hooks/inventory/useInventoryDataManager');
vi.mock('@/store/useInventoryStore');
vi.mock('@/hooks/useBackgroundSync');
vi.mock('@/hooks/useCentralizedInventoryData');
vi.mock('@/hooks/inventory/useInventoryContext');
vi.mock('@/pages/Inventory/hooks/useInventoryPageSetup');

// Create mock functions for InventoryActionService
export const mockHandleBulkOperation = vi.fn();
export const mockHandleArchiveItem = vi.fn();
export const mockHandleDeleteItem = vi.fn();

// Mock the action service
vi.mock('@/pages/Inventory/services/inventoryActionService', () => ({
  InventoryActionService: {
    handleBulkOperation: mockHandleBulkOperation,
    handleArchiveItem: mockHandleArchiveItem,
    handleDeleteItem: mockHandleDeleteItem,
    processBulkDeletion: vi.fn(),
    processBulkUpdate: vi.fn(),
    processBulkExport: vi.fn(),
    processItemArchiving: vi.fn(),
  },
}));

// Mock the hooks
export const mockUseInventoryDataManager =
  useInventoryDataManager as vi.MockedFunction<typeof useInventoryDataManager>;
export const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;
export const mockUseBackgroundSync = useBackgroundSync as vi.MockedFunction<
  typeof useBackgroundSync
>;
export const mockUseCentralizedInventoryData =
  useCentralizedInventoryData as vi.MockedFunction<
    typeof useCentralizedInventoryData
  >;

// Mock data
export const mockInventoryData = [
  {
    id: '1',
    name: 'Screwdriver Set',
    category: 'Tools',
    location: 'Storage Room A',
    status: 'active',
    quantity: 10,
    unit_cost: 25.99,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    data: {
      item: 'Screwdriver Set', // Legacy compatibility
      lastUpdated: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '2',
    name: 'Safety Gloves',
    category: 'Supplies',
    location: 'Storage Room B',
    status: 'active',
    quantity: 50,
    unit_cost: 5.99,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    data: {
      item: 'Safety Gloves', // Legacy compatibility
      lastUpdated: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
  {
    id: '3',
    name: 'Microscope',
    category: 'Equipment',
    location: 'Lab Room 1',
    status: 'active',
    quantity: 2,
    unit_cost: 1500.0,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    data: {
      item: 'Microscope', // Legacy compatibility
      lastUpdated: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  },
];

export const mockCategories = [
  'Tools',
  'Supplies',
  'Equipment',
  'Office Hardware',
];

// Mock store state
export const mockStoreState = {
  // UI State
  activeTab: 'tools' as 'tools' | 'supplies' | 'equipment' | 'officeHardware',
  showFilters: false,
  setShowFilters: vi.fn(),
  showTrackedOnly: false,
  showFavoritesOnly: false,
  itemsPerPage: 10,
  expandedSections: {
    general: true,
    purchase: false,
    maintenance: false,
    usage: false,
  },
  setExpandedSections: vi.fn(),
  toggleExpandedSection: vi.fn(),
  showFiltersPanel: false,
  setShowFiltersPanel: vi.fn(),
  showAnalytics: true,
  setShowAnalytics: vi.fn(),
  showBulkActions: false,
  setShowBulkActions: vi.fn(),
  trackedItems: new Set<string>(),
  trackingData: new Map(),
  toggleTrackedItem: vi.fn(),
  setTrackedItems: vi.fn(),
  setTrackingData: vi.fn(),

  // Data State
  items: [],
  categories: [],
  isLoading: false,
  isCategoriesLoading: false,
  favorites: [],
  inventoryItems: [],
  selectedItems: [],
  setSelectedItems: vi.fn(),
  setInventoryLoading: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
  addCategory: vi.fn(),
  removeCategory: vi.fn(),
  setItems: vi.fn(),
  setCategories: vi.fn(),
  setLoading: vi.fn(),
  setCategoriesLoading: vi.fn(),

  // Form State
  formData: {
    itemName: '',
    category: '',
    id: '',
    location: '',
    purchaseDate: '',
    vendor: '',
    cost: '',
    warranty: '',
    maintenanceSchedule: '',
    lastServiced: '',
    nextDue: '',
    serviceProvider: '',
    assignedTo: '',
    status: '',
    quantity: '',
    notes: '',
    barcode: '',
  },
  isEditMode: false,
  isDirty: false,
  setFormData: vi.fn(),
  updateField: vi.fn(),
  updateMultipleFields: vi.fn(),
  setEditMode: vi.fn(),
  toggleSection: vi.fn(),
  resetForm: vi.fn(),
  markAsDirty: vi.fn(),
  markAsClean: vi.fn(),
  openEditModal: vi.fn(),
  closeEditModal: vi.fn(),

  // Modal State
  showAddModal: false,
  showDeleteModal: false,
  showEditModal: false,
  showTrackModal: false,
  toggleTrackModal: vi.fn(),
  showUploadBarcodeModal: false,
  toggleUploadBarcodeModal: vi.fn(),
  showScanModal: false,
  scanMode: null as 'add' | 'use' | null,
  scannedItems: [],
  itemToDelete: null,
  setItemToDelete: vi.fn(),
  openDeleteModal: vi.fn(),
  closeDeleteModal: vi.fn(),
  setScanMode: vi.fn(),
  addScannedItem: vi.fn(),
  removeScannedItem: vi.fn(),
  resetScannedItems: vi.fn(),
  setShowAddModal: vi.fn(),
  setShowTrackModal: vi.fn(),
  setShowUploadBarcodeModal: vi.fn(),
  setShowDeleteModal: vi.fn(),
  setShowEditModal: vi.fn(),
  setShowScanModal: vi.fn(),
  setShowTrackedOnly: vi.fn(),
  setShowFavoritesOnly: vi.fn(),
  openAddModal: vi.fn(),
  closeAddModal: vi.fn(),
  openTrackModal: vi.fn(),
  closeTrackModal: vi.fn(),
  openUploadBarcodeModal: vi.fn(),
  closeUploadBarcodeModal: vi.fn(),
  openScanModal: vi.fn(),
  closeScanModal: vi.fn(),

  // Actions
  setActiveTab: vi.fn(),
  setItemsPerPage: vi.fn(),
  resetFormData: vi.fn(),
  setFavorites: vi.fn(),
  toggleAddModal: vi.fn(),
  toggleDeleteModal: vi.fn(),
  toggleEditModal: vi.fn(),

  // Filter State
  filters: {},
  setFilters: vi.fn(),
  resetFilters: vi.fn(),
  searchQuery: '',
  searchTerm: '',
  categoryFilter: '',
  locationFilter: '',
  statusFilter: '',
  activeFilter: '',
  setSearchQuery: vi.fn(),
  setSearchTerm: vi.fn(),
  setCategoryFilter: vi.fn(),
  setLocationFilter: vi.fn(),
  setStatusFilter: vi.fn(),
  setActiveFilter: vi.fn(),
  sortField: 'name',
  sortDirection: 'asc' as 'asc' | 'desc',
  setSortField: vi.fn(),
  setSortDirection: vi.fn(),
  clearFilters: vi.fn(),
  clearSearch: vi.fn(),
  toggleFavorite: vi.fn(),

  // Pagination State
  currentPage: 1,
  totalItems: 0,
  setCurrentPage: vi.fn(),
  setTotalItems: vi.fn(),
  nextPage: vi.fn(),
  previousPage: vi.fn(),
  goToPage: vi.fn(),
  resetPagination: vi.fn(),
  totalPages: 1,
  startIndex: 0,
  endIndex: 10,
  pagination: {
    currentPage: 1,
    pageSize: 10,
  },

  // Analytics State
  analyticsData: {
    totalItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    expiredItems: 0,
    categories: {},
    recentActivity: [],
  },
  isLoadingAnalytics: false,
  setAnalyticsData: vi.fn(),
  setLoadingAnalytics: vi.fn(),
  updateAnalytics: vi.fn(),
  resetAnalytics: vi.fn(),
};

// Mock background sync
export const mockBackgroundSync = {
  isOnline: true,
  isSyncing: false,
  lastSyncTime: new Date(),
  syncData: vi.fn(),
  retryFailedOperations: vi.fn(),
  getPendingOperations: vi.fn(() => []),
  clearPendingOperations: vi.fn(),
  attemptBackgroundSync: vi.fn(),
};

// Mock centralized data
export const mockCentralizedData = {
  data: {
    tools: mockInventoryData.filter((item) => item.category === 'Tools'),
    supplies: mockInventoryData.filter((item) => item.category === 'Supplies'),
    equipment: mockInventoryData.filter(
      (item) => item.category === 'Equipment'
    ),
    officeHardware: [],
    categories: mockCategories,
    isLoading: false,
    error: null,
  },
  inventoryData: mockInventoryData.filter((item) => item.category === 'Tools'),
  suppliesData: mockInventoryData.filter(
    (item) => item.category === 'Supplies'
  ),
  equipmentData: mockInventoryData.filter(
    (item) => item.category === 'Equipment'
  ),
  officeHardwareData: [],
  isLoading: false,
  error: null,
  getTools: vi.fn(() =>
    mockInventoryData.filter((item) => item.category === 'Tools')
  ),
  getSupplies: vi.fn(() =>
    mockInventoryData.filter((item) => item.category === 'Supplies')
  ),
  getEquipment: vi.fn(() =>
    mockInventoryData.filter((item) => item.category === 'Equipment')
  ),
  getOfficeHardware: vi.fn(() => []),
  getCategories: vi.fn(() => mockCategories),
  refreshData: vi.fn(),
  clearError: vi.fn(),
  getFilteredData: vi.fn(() => Promise.resolve(mockInventoryData)),
  getFilteredSuppliesData: vi.fn(() =>
    Promise.resolve(
      mockInventoryData.filter((item) => item.category === 'Supplies')
    )
  ),
  getFilteredEquipmentData: vi.fn(() =>
    Promise.resolve(
      mockInventoryData.filter((item) => item.category === 'Equipment')
    )
  ),
  getFilteredOfficeHardwareData: vi.fn(() => Promise.resolve([])),
  getFilteredToolsData: vi.fn(() =>
    Promise.resolve(
      mockInventoryData.filter((item) => item.category === 'Tools')
    )
  ),
  getFilteredCategoriesData: vi.fn(() => mockCategories),
  getFilteredLocationsData: vi.fn(() => [
    'Storage Room A',
    'Storage Room B',
    'Lab Room 1',
  ]),
  getFilteredStatusesData: vi.fn(() => ['active']),
};

// Mock scan modal management
export const mockScanModalManagement = {
  // State
  scanMode: 'add' as 'add' | 'use' | null,
  scannedItems: [],
  currentScannedItemIndex: 0,
  storeFormData: {
    itemName: '',
    category: '',
    id: '',
    location: '',
    purchaseDate: '',
    vendor: '',
    cost: '',
    warranty: '',
    maintenanceSchedule: '',
    lastServiced: '',
    nextDue: '',
    serviceProvider: '',
    assignedTo: '',
    status: '',
    quantity: '',
    notes: '',
    barcode: '',
  },
  isEditMode: false,

  // Handlers
  handleScanClick: vi.fn(),
  handleOpenAddItemModalWithBarcode: vi.fn(),
  getProgressInfo: vi.fn(() => ({
    current: 1,
    total: 5,
    percentage: 20,
    currentItemName: 'Test Item',
  })),

  // Store setters
  setFormData: vi.fn(),
  setScanMode: vi.fn(),
  resetScannedItems: vi.fn(),
  setShowScanModal: vi.fn(),
};

// Track current items for dynamic analytics
let currentItems = [...mockInventoryData];

// Mock data manager
export const mockDataManager = {
  // Data
  data: {
    tools: mockInventoryData.filter((item) => item.category === 'Tools'),
    supplies: mockInventoryData.filter((item) => item.category === 'Supplies'),
    equipment: mockInventoryData.filter(
      (item) => item.category === 'Equipment'
    ),
    officeHardware: [],
  },
  inventoryData: mockInventoryData.filter((item) => item.category === 'Tools'),
  suppliesData: mockInventoryData.filter(
    (item) => item.category === 'Supplies'
  ),
  equipmentData: mockInventoryData.filter(
    (item) => item.category === 'Equipment'
  ),
  officeHardwareData: [],

  // Loading states
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastUpdated: new Date(),
  operationInProgress: { type: null },

  // Operations
  fetchData: vi.fn(),
  refreshData: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn((id: string) => {
    // Remove item from current items when deleted
    currentItems = currentItems.filter((item) => item.id !== id);
  }),
  addCategory: vi.fn(),
  deleteCategory: vi.fn(),
  clearError: vi.fn(),
  retryLastOperation: vi.fn(),

  // Data access
  getItemsByCategory: vi.fn((category: string) =>
    mockInventoryData.filter((item) => item.category === category)
  ),
  getFilteredItems: vi.fn(() => Promise.resolve(mockInventoryData)),
  getAllItems: vi.fn(() => currentItems),
  getCategories: vi.fn(() => mockCategories),
  getAnalyticsData: vi.fn(() => {
    const totalItems = currentItems.length;
    const totalValue = currentItems.reduce(
      (sum, item) => sum + (item.unit_cost as number),
      0
    );

    return {
      totalItems,
      totalValue: Math.round(totalValue * 100) / 100, // Round to 2 decimal places
      categories: mockCategories,
    };
  }),
};

/**
 * Setup default mocks for all tests
 */
export const setupDefaultMocks = () => {
  vi.clearAllMocks();

  // Reset current items to initial state
  currentItems = [...mockInventoryData];

  // Setup default mocks
  mockUseInventoryDataManager.mockReturnValue(mockDataManager);
  mockUseInventoryStore.mockReturnValue(mockStoreState);
  mockUseBackgroundSync.mockReturnValue(mockBackgroundSync);
  mockUseCentralizedInventoryData.mockReturnValue(mockCentralizedData);

  // Setup InventoryActionService mocks
  mockHandleBulkOperation.mockImplementation(
    (
      itemIds: string[],
      operation: string,
      operationData: Record<string, unknown>,
      onSuccess?: (result: Record<string, unknown>) => void,
      onError?: (error: string) => void
    ) => {
      try {
        let result;
        switch (operation) {
          case 'export':
            result = {
              success: true,
              exportedCount: itemIds.length,
              exportedItems: itemIds,
            };
            break;
          case 'archive':
            result = {
              success: true,
              archivedCount: itemIds.length,
              archivedItems: itemIds,
            };
            break;
          case 'delete':
            result = {
              success: true,
              deletedCount: itemIds.length,
              deletedItems: itemIds,
            };
            break;
          case 'update':
            result = {
              success: true,
              updatedCount: itemIds.length,
              updatedItems: itemIds,
            };
            break;
          default:
            result = {
              success: true,
              deletedCount: itemIds.length,
              deletedItems: itemIds,
            };
        }
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onError?.(errorMessage);
        throw error;
      }
    }
  );

  mockHandleArchiveItem.mockImplementation(
    (
      itemId: string,
      onSuccess?: (result: Record<string, unknown>) => void,
      onError?: (error: string) => void
    ) => {
      try {
        const result = {
          success: true,
          archivedItem: itemId,
          status: 'Archived',
        };
        onSuccess?.(result);
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onError?.(errorMessage);
        throw error;
      }
    }
  );

  mockHandleDeleteItem.mockImplementation(
    (
      itemId: string,
      onSuccess?: () => void,
      onError?: (error: string) => void
    ) => {
      try {
        const result = { success: true, deletedItem: itemId };
        onSuccess?.();
        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        onError?.(errorMessage);
        throw error;
      }
    }
  );
};

/**
 * Setup mocks for all tests (alias for setupDefaultMocks)
 */
export const setupMocks = setupDefaultMocks;

/**
 * Create large dataset for performance testing
 */
export const createLargeDataset = (size: number = 1000) => {
  return Array.from({ length: size }, (_, index) => ({
    id: `item-${index}`,
    name: `Item ${index}`,
    category: `Category ${index % 4}`,
    location: `Location ${index % 10}`,
    status: 'active',
    quantity: Math.floor(Math.random() * 100) + 1,
    unit_cost: Math.floor(Math.random() * 1000) + 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    data: {
      item: `Item ${index}`, // Legacy compatibility
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }));
};

/**
 * Create a test item with optional overrides
 */
export const createTestItem = (overrides: Record<string, unknown> = {}) => ({
  id: 'test-item-id',
  name: 'Test Item',
  category: 'Tools',
  location: 'Storage Room A',
  status: 'active',
  quantity: 10,
  unit_cost: 25.99,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  data: {
    item: 'Test Item', // Legacy compatibility
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  ...overrides,
});

/**
 * Create an invalid test item for validation testing
 */
export const createInvalidTestItem = () => ({
  name: '', // Invalid: empty name
  category: 'Test Category',
  quantity: -1, // Invalid: negative quantity
  unit_cost: -10.0, // Invalid: negative cost
  location: '', // Invalid: empty location
});
