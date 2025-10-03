import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useInventoryState } from '@/pages/Inventory/hooks/useInventoryState';
import { useInventoryStore } from '@/store/useInventoryStore';

// Mock the store
vi.mock('@/store/useInventoryStore');
const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;

describe('useInventoryState - Initialization', () => {
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

  describe('Initial State', () => {
    it('should return correct initial state from store', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.showTrackedOnly).toBe(false);
      expect(result.current.showFavoritesOnly).toBe(false);
      expect(result.current.searchQuery).toBe('');
      expect(result.current.formData).toEqual({});
      expect(result.current.favorites).toEqual([]);
      expect(result.current.expandedSections).toEqual({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });

    it('should initialize with default active tab', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.activeTab).toBe('tools');
    });

    it('should initialize with default filter states', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.showTrackedOnly).toBe(false);
      expect(result.current.showFavoritesOnly).toBe(false);
      expect(result.current.searchQuery).toBe('');
    });

    it('should initialize with default form data', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.formData).toEqual({});
    });

    it('should initialize with default favorites', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.favorites).toEqual([]);
    });

    it('should initialize with default expanded sections', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current.expandedSections).toEqual({
        general: true,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });
  });

  describe('Hook Setup', () => {
    it('should call useInventoryStore on initialization', () => {
      renderHook(() => useInventoryState());

      expect(mockUseInventoryStore).toHaveBeenCalledTimes(1);
    });

    it('should return all required state properties', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current).toHaveProperty('activeTab');
      expect(result.current).toHaveProperty('showTrackedOnly');
      expect(result.current).toHaveProperty('showFavoritesOnly');
      expect(result.current).toHaveProperty('searchQuery');
      expect(result.current).toHaveProperty('formData');
      expect(result.current).toHaveProperty('favorites');
      expect(result.current).toHaveProperty('expandedSections');
    });

    it('should return all required action functions', () => {
      const { result } = renderHook(() => useInventoryState());

      expect(result.current).toHaveProperty('setActiveTab');
      expect(result.current).toHaveProperty('setShowTrackedOnly');
      expect(result.current).toHaveProperty('setShowFavoritesOnly');
      expect(result.current).toHaveProperty('setSearchQuery');
      expect(result.current).toHaveProperty('setFormData');
      expect(result.current).toHaveProperty('setEditMode');
      expect(result.current).toHaveProperty('resetFormData');
      expect(result.current).toHaveProperty('setFavorites');
      expect(result.current).toHaveProperty('setExpandedSections');
      expect(result.current).toHaveProperty('openAddModal');
      expect(result.current).toHaveProperty('closeAddModal');
    });
  });

  describe('Action Function References', () => {
    it('should return stable function references', () => {
      const { result, rerender } = renderHook(() => useInventoryState());

      const firstRender = {
        setActiveTab: result.current.setActiveTab,
        setShowTrackedOnly: result.current.setShowTrackedOnly,
        setShowFavoritesOnly: result.current.setShowFavoritesOnly,
        setSearchQuery: result.current.setSearchQuery,
        setFormData: result.current.setFormData,
        setEditMode: result.current.setEditMode,
        resetFormData: result.current.resetFormData,
        setFavorites: result.current.setFavorites,
        setExpandedSections: result.current.setExpandedSections,
      };

      rerender();

      expect(result.current.setActiveTab).toBe(firstRender.setActiveTab);
      expect(result.current.setShowTrackedOnly).toBe(
        firstRender.setShowTrackedOnly
      );
      expect(result.current.setShowFavoritesOnly).toBe(
        firstRender.setShowFavoritesOnly
      );
      expect(result.current.setSearchQuery).toBe(firstRender.setSearchQuery);
      expect(result.current.setFormData).toBe(firstRender.setFormData);
      expect(result.current.setEditMode).toBe(firstRender.setEditMode);
      expect(result.current.resetFormData).toBe(firstRender.resetFormData);
      expect(result.current.setFavorites).toBe(firstRender.setFavorites);
      expect(result.current.setExpandedSections).toBe(
        firstRender.setExpandedSections
      );
    });
  });
});
