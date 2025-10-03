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

describe('useInventoryUIState - Interactions', () => {
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

  describe('Tab Interactions', () => {
    it('should set active tab correctly', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setActiveTab('supplies');
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('supplies');
    });

    it('should handle tab switching to equipment', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setActiveTab('equipment');
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('equipment');
    });

    it('should handle tab switching to office hardware', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setActiveTab('officeHardware');
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('officeHardware');
    });
  });

  describe('Filter Interactions', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setSearchQuery('screwdriver');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('screwdriver');
    });

    it('should set category filter', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setCategoryFilter('Tools');
      });

      expect(mockSetCategoryFilter).toHaveBeenCalledWith('Tools');
    });

    it('should set location filter', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setLocationFilter('Storage Room A');
      });

      expect(mockSetLocationFilter).toHaveBeenCalledWith('Storage Room A');
    });
  });

  describe('Pagination Interactions', () => {
    it('should set items per page', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setItemsPerPage(25);
      });

      expect(mockSetItemsPerPage).toHaveBeenCalledWith(25);
    });

    it('should set current page', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setCurrentPage(3);
      });

      expect(mockSetCurrentPage).toHaveBeenCalledWith(3);
    });
  });

  describe('Toggle Interactions', () => {
    it('should toggle expanded section correctly', () => {
      const mockExpandedSections = {
        general: false,
        purchase: true,
        maintenance: false,
        usage: true,
      };
      mockUseInventoryStore.mockReturnValue({
        ...defaultStoreState,
        expandedSections: mockExpandedSections,
      });

      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.toggleExpandedSection('general');
      });

      expect(mockSetExpandedSections).toHaveBeenCalledWith({
        general: true,
        purchase: true,
        maintenance: false,
        usage: true,
      });
    });

    it('should toggle expanded section from true to false', () => {
      const mockExpandedSections = {
        general: true,
        purchase: false,
        maintenance: true,
        usage: false,
      };
      mockUseInventoryStore.mockReturnValue({
        ...defaultStoreState,
        expandedSections: mockExpandedSections,
      });

      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.toggleExpandedSection('general');
      });

      expect(mockSetExpandedSections).toHaveBeenCalledWith({
        general: false,
        purchase: false,
        maintenance: true,
        usage: false,
      });
    });
  });

  describe('Reset Interactions', () => {
    it('should reset all UI state', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.resetUIState();
      });

      expect(mockSetShowFilters).toHaveBeenCalledWith(false);
      expect(mockSetShowTrackedOnly).toHaveBeenCalledWith(false);
      expect(mockSetShowFavoritesOnly).toHaveBeenCalledWith(false);
      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
      expect(mockSetCategoryFilter).toHaveBeenCalledWith('');
      expect(mockSetLocationFilter).toHaveBeenCalledWith('');
      expect(mockSetItemsPerPage).toHaveBeenCalledWith(10);
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
      expect(mockSetShowAddModal).toHaveBeenCalledWith(false);
      expect(mockSetShowScanModal).toHaveBeenCalledWith(false);
      expect(mockSetEditMode).toHaveBeenCalledWith(false);
      expect(mockSetExpandedSections).toHaveBeenCalledWith({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });

    it('should reset filters only', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.resetFilters();
      });

      expect(mockSetShowTrackedOnly).toHaveBeenCalledWith(false);
      expect(mockSetShowFavoritesOnly).toHaveBeenCalledWith(false);
      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
      expect(mockSetCategoryFilter).toHaveBeenCalledWith('');
      expect(mockSetLocationFilter).toHaveBeenCalledWith('');
    });

    it('should reset pagination only', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.resetPagination();
      });

      expect(mockSetItemsPerPage).toHaveBeenCalledWith(10);
      expect(mockSetCurrentPage).toHaveBeenCalledWith(1);
    });
  });
});
