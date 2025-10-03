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

describe('useInventoryState - Updates', () => {
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

  describe('UI State Actions', () => {
    it('should set active tab', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setActiveTab('supplies');
      });

      expect(mockSetActiveTab).toHaveBeenCalledWith('supplies');
    });

    it('should set tracked only filter', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setShowTrackedOnly(true);
      });

      expect(mockSetShowTrackedOnly).toHaveBeenCalledWith(true);
    });

    it('should set favorites only filter', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setShowFavoritesOnly(true);
      });

      expect(mockSetShowFavoritesOnly).toHaveBeenCalledWith(true);
    });
  });

  describe('Search and Filter Actions', () => {
    it('should set search query', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setSearchQuery('screwdriver');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('screwdriver');
    });

    it('should handle empty search query', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setSearchQuery('');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('');
    });

    it('should handle special characters in search query', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setSearchQuery('screwdriver & hammer');
      });

      expect(mockSetSearchQuery).toHaveBeenCalledWith('screwdriver & hammer');
    });
  });

  describe('Form Data Management', () => {
    it('should set form data', () => {
      const { result } = renderHook(() => useInventoryState());
      const formData: FormData = {
        itemName: 'Test Item',
        category: 'Tools',
        id: 'test-1',
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
      };

      act(() => {
        result.current.setFormData(formData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(formData);
    });

    it('should set partial form data', () => {
      const { result } = renderHook(() => useInventoryState());
      const partialData: Partial<FormData> = {
        itemName: 'Test Item',
        category: 'Tools',
        id: 'test-1',
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
      };

      act(() => {
        result.current.setFormData(partialData as FormData);
      });

      expect(mockSetFormData).toHaveBeenCalledWith(partialData);
    });

    it('should set edit mode', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setEditMode(true);
      });

      expect(mockSetEditMode).toHaveBeenCalledWith(true);
    });

    it('should reset form data', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.resetFormData();
      });

      expect(mockResetFormData).toHaveBeenCalled();
    });
  });

  describe('Favorites Management', () => {
    it('should set favorites array', () => {
      const { result } = renderHook(() => useInventoryState());
      const favorites = ['item1', 'item2', 'item3'];

      act(() => {
        result.current.setFavorites(favorites);
      });

      expect(mockSetFavorites).toHaveBeenCalledWith(favorites);
    });

    it('should handle empty favorites array', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setFavorites([]);
      });

      expect(mockSetFavorites).toHaveBeenCalledWith([]);
    });

    it('should handle single favorite item', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setFavorites(['item1']);
      });

      expect(mockSetFavorites).toHaveBeenCalledWith(['item1']);
    });
  });

  describe('Expanded Sections Management', () => {
    it('should set expanded sections', () => {
      const { result } = renderHook(() => useInventoryState());
      const expandedSections = {
        general: true,
        purchase: false,
        maintenance: true,
        usage: false,
      };

      act(() => {
        result.current.setExpandedSections(expandedSections);
      });

      expect(mockSetExpandedSections).toHaveBeenCalledWith(expandedSections);
    });

    it('should handle empty expanded sections', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.setExpandedSections({
          general: false,
          purchase: false,
          maintenance: false,
          usage: false,
        });
      });

      expect(mockSetExpandedSections).toHaveBeenCalledWith({
        general: false,
        purchase: false,
        maintenance: false,
        usage: false,
      });
    });
  });

  describe('Modal State Actions', () => {
    it('should open add modal', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.openAddModal();
      });

      expect(mockOpenAddModal).toHaveBeenCalled();
    });

    it('should close add modal', () => {
      const { result } = renderHook(() => useInventoryState());

      act(() => {
        result.current.closeAddModal();
      });

      expect(mockCloseAddModal).toHaveBeenCalled();
    });
  });
});
