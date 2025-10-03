import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useInventoryState } from '@/pages/Inventory/hooks/useInventoryState';
import { useInventoryStore } from '@/store/useInventoryStore';
import { FormData } from '@/types/inventoryTypes';

// Mock the store
vi.mock('@/store/useInventoryStore');
const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;

describe('useInventoryState - Integration', () => {
  const mockSetActiveTab = vi.fn();
  const mockSetShowTrackedOnly = vi.fn();
  const mockSetShowFavoritesOnly = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetFormData = vi.fn();
  const mockSetEditMode = vi.fn();
  const mockResetFormData = vi.fn();
  const mockSetFavorites = vi.fn();
  const mockSetExpandedSections = vi.fn();
  const mockToggleAddModal = vi.fn();
  const mockOpenAddModal = vi.fn();
  const mockCloseAddModal = vi.fn();

  const defaultStoreState = {
    // UI State
    activeTab: 'tools' as 'tools' | 'supplies' | 'equipment' | 'officeHardware',
    setActiveTab: mockSetActiveTab,
    showFilters: false,
    setShowFilters: vi.fn(),
    showTrackedOnly: false,
    setShowTrackedOnly: mockSetShowTrackedOnly,
    showFavoritesOnly: false,
    setShowFavoritesOnly: mockSetShowFavoritesOnly,
    expandedSections: {
      general: true,
      purchase: false,
      maintenance: false,
      usage: false,
    },
    setExpandedSections: mockSetExpandedSections,
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

    // Filter State
    searchQuery: '',
    setSearchQuery: mockSetSearchQuery,

    // Data State
    items: [],
    categories: [],
    isLoading: false,
    isCategoriesLoading: false,
    formData: {},
    setFormData: mockSetFormData,
    setEditMode: mockSetEditMode,
    resetForm: mockResetFormData,
    favorites: [],
    setFavorites: mockSetFavorites,
    addItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    addCategory: vi.fn(),
    removeCategory: vi.fn(),
    setItems: vi.fn(),
    setCategories: vi.fn(),
    setLoading: vi.fn(),
    setCategoriesLoading: vi.fn(),

    // Modal State
    showAddModal: false,
    toggleAddModal: mockToggleAddModal,
    setShowAddModal: vi.fn(),
    openAddModal: mockOpenAddModal,
    closeAddModal: mockCloseAddModal,

    // Filter State
    filters: {},
    setFilters: vi.fn(),

    // Pagination State
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    setCurrentPage: vi.fn(),
    setItemsPerPage: vi.fn(),

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

    // Missing required properties for InventoryStore
    selectedItems: [],
    setSelectedItems: vi.fn(),
    setInventoryLoading: vi.fn(),
    inventoryItems: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInventoryStore.mockReturnValue(defaultStoreState);
  });

  describe('State Synchronization', () => {
    it('should reflect updated store state', () => {
      const updatedState = {
        ...defaultStoreState,
        showTrackedOnly: true,
        showFavoritesOnly: true,
        searchQuery: 'updated query',
        formData: {
          itemName: 'Updated Item',
          category: 'Tools',
          id: 'updated-1',
          location: 'Storage Room A',
          purchaseDate: '2024-01-01',
          vendor: 'Test Vendor',
          unit_cost: '25.99',
          warranty: '1 year',
          maintenanceSchedule: 'Monthly',
          lastServiced: '2024-01-01',
          nextDue: '2024-02-01',
          serviceProvider: 'Test Provider',
          assignedTo: 'Test User',
          status: 'Active',
          quantity: '10',
          notes: 'Test notes',
        } as FormData,
        favorites: ['updated1', 'updated2'],
        expandedSections: {
          general: true,
          purchase: false,
          maintenance: false,
          usage: false,
        },
      };

      mockUseInventoryStore.mockReturnValue(updatedState);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.showTrackedOnly).toBe(true);
      expect(result.current.showFavoritesOnly).toBe(true);
      expect(result.current.searchQuery).toBe('updated query');
      expect(result.current.formData).toEqual(updatedState.formData);
      expect(result.current.favorites).toEqual(['updated1', 'updated2']);
      expect(result.current.expandedSections).toEqual({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });

    it('should integrate with inventory store data', () => {
      const storeWithData = {
        ...defaultStoreState,
        items: [
          { id: '1', name: 'Item 1', category: 'Tools' },
          { id: '2', name: 'Item 2', category: 'Supplies' },
        ],
        categories: ['Tools', 'Supplies', 'Equipment'],
        isLoading: true,
        isCategoriesLoading: false,
      };

      mockUseInventoryStore.mockReturnValue(storeWithData);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.items).toEqual(storeWithData.items);
      expect(result.current.categories).toEqual(storeWithData.categories);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isCategoriesLoading).toBe(false);
    });

    it('should integrate with analytics data', () => {
      const storeWithAnalytics = {
        ...defaultStoreState,
        analyticsData: {
          totalItems: 100,
          lowStockItems: 5,
          outOfStockItems: 2,
          expiredItems: 1,
          categories: { Tools: 50, Supplies: 30, Equipment: 20 },
          recentActivity: [
            {
              id: '1',
              action: 'Added',
              item: 'Item 1',
              timestamp: '2024-01-01',
            },
          ],
        },
        isLoadingAnalytics: false,
      };

      mockUseInventoryStore.mockReturnValue(storeWithAnalytics);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.analyticsData).toEqual(
        storeWithAnalytics.analyticsData
      );
      expect(result.current.isLoadingAnalytics).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle null form data', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setFormData(null as unknown as FormData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(null);
    });

    it('should handle undefined form data', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setFormData(undefined as unknown as FormData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(undefined);
    });

    it('should handle very long search query', () => {
      const { result } = renderHook(() => useInventoryState());
      const longQuery = 'a'.repeat(1000);

      act(() => {
        result.current.setSearchQuery(longQuery);
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith(longQuery);
    });

    it('should handle special characters in favorites', () => {
      const { result } = renderHook(() => useInventoryState());
      const specialFavorites = ['item-1', 'item_2', 'item.3', 'item@4'];

      act(() => {
        result.current.setFavorites(specialFavorites);
      });

      expect(mockSetFavorites).toHaveBeenCalledWith(specialFavorites);
    });

    it('should handle empty store state', () => {
      const emptyStoreState = {
        ...defaultStoreState,
        items: [],
        categories: [],
        favorites: [],
        formData: {},
        searchQuery: '',
        showTrackedOnly: false,
        showFavoritesOnly: false,
      };

      mockUseInventoryStore.mockReturnValue(emptyStoreState);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.items).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.favorites).toEqual([]);
      expect(result.current.formData).toEqual({});
      expect(result.current.searchQuery).toBe('');
      expect(result.current.showTrackedOnly).toBe(false);
      expect(result.current.showFavoritesOnly).toBe(false);
    });

    it('should handle large datasets', () => {
      const largeItems = Array.from({ length: 1000 }, (_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        category: `Category ${i % 10}`,
      }));

      const largeCategories = Array.from(
        { length: 100 },
        (_, i) => `Category ${i}`
      );

      const storeWithLargeData = {
        ...defaultStoreState,
        items: largeItems,
        categories: largeCategories,
      };

      mockUseInventoryStore.mockReturnValue(storeWithLargeData);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.items).toHaveLength(1000);
      expect(result.current.categories).toHaveLength(100);
    });
  });

  describe('External Data Handling', () => {
    it('should handle external form data updates', () => {
      const externalFormData: FormData = {
        itemName: 'External Item',
        category: 'External Category',
        id: 'external-1',
        location: 'External Location',
        purchaseDate: '2024-01-01',
        vendor: 'External Vendor',
        unit_cost: '99.99',
        warranty: '2 years',
        maintenanceSchedule: 'Quarterly',
        lastServiced: '2024-01-01',
        nextDue: '2024-04-01',
        serviceProvider: 'External Provider',
        assignedTo: 'External User',
        status: 'Active',
        quantity: '5',
        notes: 'External notes',
      };

      const storeWithExternalData = {
        ...defaultStoreState,
        formData: externalFormData,
      };

      mockUseInventoryStore.mockReturnValue(storeWithExternalData);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.formData).toEqual(externalFormData);
    });

    it('should handle external favorites updates', () => {
      const externalFavorites = ['external1', 'external2', 'external3'];

      const storeWithExternalFavorites = {
        ...defaultStoreState,
        favorites: externalFavorites,
      };

      mockUseInventoryStore.mockReturnValue(storeWithExternalFavorites);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.favorites).toEqual(externalFavorites);
    });

    it('should handle external search query updates', () => {
      const externalSearchQuery = 'external search term';

      const storeWithExternalSearch = {
        ...defaultStoreState,
        searchQuery: externalSearchQuery,
      };

      mockUseInventoryStore.mockReturnValue(storeWithExternalSearch);

      const { result } = renderHook(() => useInventoryState());

      expect(result.current.searchQuery).toBe(externalSearchQuery);
    });
  });
});
