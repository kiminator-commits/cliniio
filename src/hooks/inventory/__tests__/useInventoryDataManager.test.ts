import { renderHook, act, waitFor } from '@testing-library/react';
import { useInventoryDataManager } from '../useInventoryDataManager';
import { inventoryDataService } from '@/services/inventoryDataService';
import { useInventoryStore } from '@/store/useInventoryStore';
import { auditLogger } from '@/utils/auditLogger';
import { useErrorRecovery } from '@/hooks/useErrorRecovery';

// Mock dependencies
jest.mock('@/services/inventoryDataService');
jest.mock('@/store/useInventoryStore');
jest.mock('@/utils/auditLogger');
jest.mock('@/hooks/useErrorRecovery');

const mockInventoryDataService = inventoryDataService as jest.Mocked<typeof inventoryDataService>;
const mockUseInventoryStore = useInventoryStore as jest.MockedFunction<typeof useInventoryStore>;
const mockAuditLogger = auditLogger as jest.Mocked<typeof auditLogger>;
const mockUseErrorRecovery = useErrorRecovery as jest.MockedFunction<typeof useErrorRecovery>;

describe('useInventoryDataManager', () => {
  const mockSetInventoryLoading = jest.fn();
  const mockErrorRecovery = {
    handleError: jest.fn(),
    clearError: jest.fn(),
  };

  const mockInventoryData = {
    tools: [
      { id: '1', item: 'Screwdriver', category: 'Tools', quantity: 10, price: 15.99 },
      { id: '2', item: 'Hammer', category: 'Tools', quantity: 5, price: 25.99 },
    ],
    supplies: [{ id: '3', item: 'Paper', category: 'Supplies', quantity: 100, price: 5.99 }],
    equipment: [{ id: '4', item: 'Drill', category: 'Equipment', quantity: 2, price: 199.99 }],
    officeHardware: [
      { id: '5', item: 'Monitor', category: 'Office Hardware', quantity: 8, price: 299.99 },
    ],
    categories: ['Tools', 'Supplies', 'Equipment', 'Office Hardware'],
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUseInventoryStore.mockReturnValue({
      setInventoryLoading: mockSetInventoryLoading,
    } as ReturnType<typeof useInventoryStore>);

    mockUseErrorRecovery.mockReturnValue(mockErrorRecovery);

    mockInventoryDataService.fetchAllInventoryData.mockResolvedValue(mockInventoryData);
    mockInventoryDataService.addInventoryItem.mockResolvedValue(mockInventoryData.tools[0]);
    mockInventoryDataService.updateInventoryItem.mockResolvedValue(mockInventoryData.tools[0]);
    mockInventoryDataService.deleteInventoryItem.mockResolvedValue();
    mockInventoryDataService.addCategory.mockResolvedValue('New Category');
    mockInventoryDataService.deleteCategory.mockResolvedValue();
    mockInventoryDataService.getFilteredData.mockImplementation((data, searchQuery) => {
      if (!searchQuery) return data;
      return data.filter(item => item.item.toLowerCase().includes(searchQuery.toLowerCase()));
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useInventoryDataManager());

      expect(result.current.data).toBeNull();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isRefreshing).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeNull();
      // The operationInProgress will be set to 'fetch' immediately on mount
      expect(result.current.operationInProgress.type).toBe('fetch');
    });

    it('should fetch data on mount', async () => {
      renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(mockInventoryDataService.fetchAllInventoryData).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Data Fetching', () => {
    it('should fetch data successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockInventoryData);
      expect(result.current.error).toBeNull();
      expect(result.current.lastUpdated).toBeInstanceOf(Date);
      expect(mockSetInventoryLoading).toHaveBeenCalledWith(true);
      // The loading state is set to false in the finally block, but we need to wait for it
      await waitFor(() => {
        expect(mockSetInventoryLoading).toHaveBeenCalledWith(false);
      });
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'data_fetched', {
        itemCount: 5,
        categories: 4,
      });
    });

    it('should handle fetch errors', async () => {
      const errorMessage = 'Failed to fetch data';
      mockInventoryDataService.fetchAllInventoryData.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(mockErrorRecovery.handleError).toHaveBeenCalledWith(errorMessage);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'data_fetch_error', {
        error: errorMessage,
      });
    });

    it('should refresh data in background', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.refreshData();
      });

      expect(result.current.isRefreshing).toBe(false);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'data_refreshed', {
        itemCount: 5,
      });
    });
  });

  describe('CRUD Operations', () => {
    it('should create item successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const newItem = {
        id: '6',
        item: 'New Tool',
        category: 'Tools',
        quantity: 1,
        price: 50.0,
      };

      await act(async () => {
        await result.current.createItem(newItem);
      });

      expect(mockInventoryDataService.addInventoryItem).toHaveBeenCalledWith(newItem);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'item_created', {
        itemId: newItem.id,
        category: newItem.category,
      });
    });

    it('should update item successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const updates = { quantity: 15 };

      await act(async () => {
        await result.current.updateItem('1', updates);
      });

      expect(mockInventoryDataService.updateInventoryItem).toHaveBeenCalledWith('1', updates);
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'item_updated', {
        itemId: '1',
        updates,
      });
    });

    it('should delete item successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteItem('1');
      });

      expect(mockInventoryDataService.deleteInventoryItem).toHaveBeenCalledWith('1');
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'item_deleted', {
        itemId: '1',
      });
    });

    it('should handle CRUD operation errors', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const errorMessage = 'Failed to create item';
      mockInventoryDataService.addInventoryItem.mockRejectedValue(new Error(errorMessage));

      await act(async () => {
        try {
          await result.current.createItem({ id: '6', item: 'Test', category: 'Tools' });
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.operationInProgress).toEqual({ type: null });
    });
  });

  describe('Category Management', () => {
    it('should add category successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.addCategory('New Category');
      });

      expect(mockInventoryDataService.addCategory).toHaveBeenCalledWith('New Category');
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'category_added', {
        category: 'New Category',
      });
    });

    it('should delete category successfully', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.deleteCategory('Tools');
      });

      expect(mockInventoryDataService.deleteCategory).toHaveBeenCalledWith('Tools');
      expect(mockAuditLogger.log).toHaveBeenCalledWith('inventory', 'category_deleted', {
        category: 'Tools',
      });
    });
  });

  describe('Data Access Methods', () => {
    it('should get all items', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const allItems = result.current.getAllItems();
      expect(allItems).toHaveLength(5);
      expect(allItems).toEqual([
        ...mockInventoryData.tools,
        ...mockInventoryData.supplies,
        ...mockInventoryData.equipment,
        ...mockInventoryData.officeHardware,
      ]);
    });

    it('should get items by category', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const tools = result.current.getItemsByCategory('Tools');
      expect(tools).toHaveLength(2);
      expect(tools).toEqual(mockInventoryData.tools);
    });

    it('should get filtered items', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const filteredItems = result.current.getFilteredItems('screw');
      expect(filteredItems).toHaveLength(1);
      expect(filteredItems[0].item).toBe('Screwdriver');
    });

    it('should get categories', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const categories = result.current.getCategories();
      expect(categories).toEqual(mockInventoryData.categories);
    });
  });

  describe('Analytics Data', () => {
    it('should calculate analytics correctly', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const analytics = result.current.getAnalyticsData();

      expect(analytics.totalItems).toBe(5);
      expect(analytics.totalValue).toBeCloseTo(
        15.99 * 10 + 25.99 * 5 + 5.99 * 100 + 199.99 * 2 + 299.99 * 8
      );
      expect(analytics.categories).toEqual(mockInventoryData.categories);
    });
  });

  describe('Error Handling', () => {
    it('should clear error', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Set an error first
      await act(async () => {
        mockInventoryDataService.fetchAllInventoryData.mockRejectedValueOnce(
          new Error('Test error')
        );
        await result.current.refreshData();
      });

      expect(result.current.error).toBeTruthy();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
      expect(mockErrorRecovery.clearError).toHaveBeenCalled();
    });

    it('should retry last operation', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Perform an operation
      await act(async () => {
        await result.current.createItem({ id: '6', item: 'Test', category: 'Tools' });
      });

      // Retry the operation
      await act(async () => {
        await result.current.retryLastOperation();
      });

      expect(mockInventoryDataService.addInventoryItem).toHaveBeenCalledTimes(2);
    });
  });

  describe('Legacy Compatibility', () => {
    it('should provide legacy data access', async () => {
      const { result } = renderHook(() => useInventoryDataManager());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.inventoryData).toEqual(mockInventoryData.tools);
      expect(result.current.suppliesData).toEqual(mockInventoryData.supplies);
      expect(result.current.equipmentData).toEqual(mockInventoryData.equipment);
      expect(result.current.officeHardwareData).toEqual(mockInventoryData.officeHardware);
    });
  });
});
