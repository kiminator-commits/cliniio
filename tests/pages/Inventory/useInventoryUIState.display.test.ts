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

describe('useInventoryUIState - Display', () => {
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

  describe('Initial State', () => {
    it('should return correct initial state from store', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.activeTab).toBe('tools');
      expect(result.current.showFilters).toBe(false);
      expect(result.current.showTrackedOnly).toBe(false);
      expect(result.current.showFavoritesOnly).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.categoryFilter).toBe('');
      expect(result.current.locationFilter).toBe('');
      expect(result.current.itemsPerPage).toBe(10);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.showAddModal).toBe(false);
      expect(result.current.showScanModal).toBe(false);
      expect(result.current.isEditMode).toBe(false);
      expect(result.current.expandedSections).toEqual({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });
  });

  describe('Visibility Toggles', () => {
    it('should toggle filters visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setShowFilters(true);
      });

      expect(mockSetShowFilters).toHaveBeenCalledWith(true);
    });

    it('should set tracked only filter visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setShowTrackedOnly(true);
      });

      expect(mockSetShowTrackedOnly).toHaveBeenCalledWith(true);
    });

    it('should set favorites only filter visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setShowFavoritesOnly(true);
      });

      expect(mockSetShowFavoritesOnly).toHaveBeenCalledWith(true);
    });
  });

  describe('Modal Visibility', () => {
    it('should set add modal visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setShowAddModal(true);
      });

      expect(mockSetShowAddModal).toHaveBeenCalledWith(true);
    });

    it('should set scan modal visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setShowScanModal(true);
      });

      expect(mockSetShowScanModal).toHaveBeenCalledWith(true);
    });

    it('should set edit mode visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());

      act(() => {
        result.current.setEditMode(true);
      });

      expect(mockSetEditMode).toHaveBeenCalledWith(true);
    });
  });

  describe('Panel Visibility', () => {
    it('should display expanded sections correctly', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.expandedSections).toEqual({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });

    it('should set expanded sections visibility', () => {
      const { result } = renderHook(() => useInventoryUIState());
      const newSections = {
        general: true,
        purchase: false,
        maintenance: true,
        usage: false,
      };

      act(() => {
        result.current.setExpandedSections(newSections);
      });

      expect(mockSetExpandedSections).toHaveBeenCalledWith(newSections);
    });
  });

  describe('UI State Display', () => {
    it('should display current active tab', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.activeTab).toBe('tools');
    });

    it('should display current search query', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.searchQuery).toBe('');
    });

    it('should display current category filter', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.categoryFilter).toBe('');
    });

    it('should display current location filter', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.locationFilter).toBe('');
    });

    it('should display current pagination state', () => {
      const { result } = renderHook(() => useInventoryUIState());

      expect(result.current.currentPage).toBe(1);
      expect(result.current.itemsPerPage).toBe(10);
    });
  });
});
