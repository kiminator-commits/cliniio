import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useInventoryUIState } from '@/pages/Inventory/hooks/useInventoryUIState';
import { useInventoryStore } from '@/store/useInventoryStore';
import { TabType } from '@/pages/Inventory/types';

// Mock the store
vi.mock('@/store/useInventoryStore');
const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;

describe('useInventoryUIState - Integration', () => {
  const mockSetActiveTab = vi.fn();
  const mockSetShowFilters = vi.fn();
  const mockSetShowTrackedOnly = vi.fn();
  const mockSetShowFavoritesOnly = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetCategoryFilter = vi.fn();
  const mockSetLocationFilter = vi.fn();
  const mockSetItemsPerPage = vi.fn();
  const mockSetCurrentPage = vi.fn();
  const mockSetShowAddModal = vi.fn();
  const mockSetShowScanModal = vi.fn();
  const mockSetEditMode = vi.fn();
  const mockSetExpandedSections = vi.fn();

  const defaultStoreState = {
    // UI State
    activeTab: 'tools' as TabType,
    setActiveTab: mockSetActiveTab,
    showFilters: false,
    setShowFilters: mockSetShowFilters,
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
    categoryFilter: '',
    setCategoryFilter: mockSetCategoryFilter,
    locationFilter: '',
    setLocationFilter: mockSetLocationFilter,

    // Data State
    items: [],
    categories: [],
    isLoading: false,
    isCategoriesLoading: false,
    formData: {},
    setFormData: vi.fn(),
    setEditMode: mockSetEditMode,
    resetForm: vi.fn(),
    favorites: [],
    setFavorites: vi.fn(),
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
    setShowAddModal: mockSetShowAddModal,
    showScanModal: false,
    setShowScanModal: mockSetShowScanModal,
    isEditMode: false,
    toggleAddModal: vi.fn(),
    openAddModal: vi.fn(),

    // Filter State
    filters: {},
    setFilters: vi.fn(),

    // Pagination State
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    setCurrentPage: mockSetCurrentPage,
    setItemsPerPage: mockSetItemsPerPage,

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

  describe('Inventory State Integration', () => {
    it('should integrate with inventory store state', () => {
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

      const { result } = renderHook(() => useInventoryUIState());

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

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.analyticsData).toEqual(
        storeWithAnalytics.analyticsData
      );
      expect(result.current.isLoadingAnalytics).toBe(false);
    });
  });

  describe('Persistence Integration', () => {
    it('should maintain state across re-renders', () => {
      const { result, rerender } = renderHook(() => useInventoryUIState());

      const firstRender = {
        activeTab: result.current.activeTab,
        showFilters: result.current.showFilters,
        searchQuery: result.current.searchQuery,
      };

      rerender();

      expect(result.current.activeTab).toBe(firstRender.activeTab);
      expect(result.current.showFilters).toBe(firstRender.showFilters);
      expect(result.current.searchQuery).toBe(firstRender.searchQuery);
    });

    it('should persist filter state changes', () => {
      const storeWithFilters = {
        ...defaultStoreState,
        searchQuery: 'persisted search',
        categoryFilter: 'persisted category',
        locationFilter: 'persisted location',
      };

      mockUseInventoryStore.mockReturnValue(storeWithFilters);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.searchQuery).toBe('persisted search');
      expect(result.current.categoryFilter).toBe('persisted category');
      expect(result.current.locationFilter).toBe('persisted location');
    });

    it('should persist pagination state changes', () => {
      const storeWithPagination = {
        ...defaultStoreState,
        currentPage: 5,
        itemsPerPage: 25,
        totalItems: 100,
      };

      mockUseInventoryStore.mockReturnValue(storeWithPagination);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.currentPage).toBe(5);
      expect(result.current.itemsPerPage).toBe(25);
      expect(result.current.totalItems).toBe(100);
    });
  });

  describe('External Components Integration', () => {
    it('should integrate with external filter components', () => {
      const externalFilterState = {
        ...defaultStoreState,
        showFilters: true,
        showTrackedOnly: true,
        showFavoritesOnly: true,
        searchQuery: 'external search',
        categoryFilter: 'external category',
        locationFilter: 'external location',
      };

      mockUseInventoryStore.mockReturnValue(externalFilterState);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.showFilters).toBe(true);
      expect(result.current.showTrackedOnly).toBe(true);
      expect(result.current.showFavoritesOnly).toBe(true);
      expect(result.current.searchQuery).toBe('external search');
      expect(result.current.categoryFilter).toBe('external category');
      expect(result.current.locationFilter).toBe('external location');
    });

    it('should integrate with external modal components', () => {
      const externalModalState = {
        ...defaultStoreState,
        showAddModal: true,
        showScanModal: true,
        isEditMode: true,
      };

      mockUseInventoryStore.mockReturnValue(externalModalState);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.showAddModal).toBe(true);
      expect(result.current.showScanModal).toBe(true);
      expect(result.current.isEditMode).toBe(true);
    });

    it('should integrate with external tab components', () => {
      const externalTabState = {
        ...defaultStoreState,
        activeTab: 'equipment' as TabType,
      };

      mockUseInventoryStore.mockReturnValue(externalTabState);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.activeTab).toBe('equipment');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty search query', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });

    it('should handle special characters in search query', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setSearchQuery('screwdriver & hammer');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('screwdriver & hammer');
    });

    it('should handle large page numbers', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setCurrentPage(999);
      });

      expect(mockSetCurrentPage).toHaveBeenCalledWith(999);
    });

    it('should handle zero items per page', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setItemsPerPage(0);
      });

      expect(mockSetItemsPerPage).toHaveBeenCalledWith(0);
    });

    it('should handle empty store state', () => {
      const emptyStoreState = {
        ...defaultStoreState,
        items: [],
        categories: [],
        searchQuery: '',
        categoryFilter: '',
        locationFilter: '',
        showFilters: false,
        showTrackedOnly: false,
        showFavoritesOnly: false,
      };

      mockUseInventoryStore.mockReturnValue(emptyStoreState);

      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.items).toEqual([]);
      expect(result.current.categories).toEqual([]);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.categoryFilter).toBe('');
      expect(result.current.locationFilter).toBe('');
      expect(result.current.showFilters).toBe(false);
      expect(result.current.showTrackedOnly).toBe(false);
      expect(result.current.showFavoritesOnly).toBe(false);
    });
  });
});
