import { renderHook } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { useInventoryStore } from '../../src/hooks/useInventoryStore';

// Mock the store
vi.mock('@/store/inventoryStore', () => ({
  useInventoryStore: vi.fn(),
}));

import { useInventoryStore as mockUseStore } from '@/store/inventoryStore';

const mockUseStoreFn = mockUseStore as vi.MockedFunction<typeof mockUseStore>;

describe('useInventoryStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the store state and actions', () => {
    const mockStoreReturn = {
      items: [],
      loading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      fetchItems: vi.fn(),
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result } = renderHook(() => useInventoryStore());

    expect(result.current).toEqual(mockStoreReturn);
    expect(mockUseStoreFn).toHaveBeenCalledTimes(1);
  });

  it('should handle store with items', () => {
    const mockItems = [
      { id: '1', name: 'Item 1', category: 'Category A' },
      { id: '2', name: 'Item 2', category: 'Category B' },
    ];

    const mockStoreReturn = {
      items: mockItems,
      loading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      fetchItems: vi.fn(),
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result } = renderHook(() => useInventoryStore());

    expect(result.current.items).toEqual(mockItems);
    expect(result.current.items).toHaveLength(2);
  });

  it('should handle loading state', () => {
    const mockStoreReturn = {
      items: [],
      loading: true,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      fetchItems: vi.fn(),
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result } = renderHook(() => useInventoryStore());

    expect(result.current.loading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to fetch items');
    const mockStoreReturn = {
      items: [],
      loading: false,
      error: mockError,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      fetchItems: vi.fn(),
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result } = renderHook(() => useInventoryStore());

    expect(result.current.error).toBe(mockError);
  });

  it('should provide action functions', () => {
    const mockAddItem = vi.fn();
    const mockUpdateItem = vi.fn();
    const mockDeleteItem = vi.fn();
    const mockFetchItems = vi.fn();

    const mockStoreReturn = {
      items: [],
      loading: false,
      error: null,
      addItem: mockAddItem,
      updateItem: mockUpdateItem,
      deleteItem: mockDeleteItem,
      fetchItems: mockFetchItems,
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result } = renderHook(() => useInventoryStore());

    expect(typeof result.current.addItem).toBe('function');
    expect(typeof result.current.updateItem).toBe('function');
    expect(typeof result.current.deleteItem).toBe('function');
    expect(typeof result.current.fetchItems).toBe('function');
  });

  it('should maintain referential stability', () => {
    const mockStoreReturn = {
      items: [],
      loading: false,
      error: null,
      addItem: vi.fn(),
      updateItem: vi.fn(),
      deleteItem: vi.fn(),
      fetchItems: vi.fn(),
    };

    mockUseStoreFn.mockReturnValue(mockStoreReturn);

    const { result, rerender } = renderHook(() => useInventoryStore());

    const firstResult = result.current;

    rerender();

    expect(result.current).toBe(firstResult);
  });
});
