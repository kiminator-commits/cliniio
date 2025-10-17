import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, test, expect } from 'vitest';
import { useCentralizedInventoryData } from '../../src/hooks/useCentralizedInventoryData';

// Mock the service access
const mockFetchInventoryItems = vi.fn();
const mockFetchAllInventoryData = vi.fn().mockResolvedValue({
  tools: [
    {
      id: '1',
      name: 'Test Tool',
      category: 'Surgical',
      quantity: 1,
      location: 'Test',
    },
  ],
  supplies: [
    {
      id: '2',
      name: 'Test Supply',
      category: 'Supplies',
      quantity: 1,
      location: 'Test',
    },
  ],
  equipment: [
    {
      id: '3',
      name: 'Test Equipment',
      category: 'Equipment',
      quantity: 1,
      location: 'Test',
    },
  ],
  officeHardware: [
    {
      id: '4',
      name: 'Test Hardware',
      category: 'Office Hardware',
      quantity: 1,
      location: 'Test',
    },
  ],
  categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
  isLoading: false,
  error: null,
});

vi.mock('@/services/ServiceAccess', () => ({
  getInventoryService: vi.fn(() => ({
    initialize: vi.fn().mockResolvedValue(undefined),
    isReady: vi.fn().mockReturnValue(true),
    fetchAllInventoryData: mockFetchAllInventoryData,
    fetchInventoryItems: mockFetchInventoryItems,
  })),
}));

// Mock the store
vi.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: () => ({
    setInventoryLoading: vi.fn(),
  }),
}));

// Import the mocked services
// import { getInventoryService } from '@/services/ServiceAccess';

describe('useCentralizedInventoryData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchInventoryItems.mockResolvedValue([
      { name: 'Scalpel', category: 'Surgical' },
      { name: 'Forceps', category: 'Surgical' },
      { name: 'Bandage', category: 'Supplies' },
    ]);
  });

  it('should provide data access methods', async () => {
    const mockData = {
      tools: [
        {
          id: '1',
          name: 'Test Tool',
          category: 'Surgical',
          quantity: 1,
          location: 'Test',
        },
      ],
      supplies: [
        {
          id: '2',
          name: 'Test Supply',
          category: 'Supplies',
          quantity: 1,
          location: 'Test',
        },
      ],
      equipment: [
        {
          id: '3',
          name: 'Test Equipment',
          category: 'Equipment',
          quantity: 1,
          location: 'Test',
        },
      ],
      officeHardware: [
        {
          id: '4',
          name: 'Test Hardware',
          category: 'Office Hardware',
          quantity: 1,
          location: 'Test',
        },
      ],
      categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
      isLoading: false,
      error: null,
    };

    const { getInventoryService } = await import('@/services/ServiceAccess');
    const mockService = getInventoryService();
    (mockService.fetchAllInventoryData as vi.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test data access methods
    expect(result.current.getTools()).toEqual(mockData.tools);
    expect(result.current.getSupplies()).toEqual(mockData.supplies);
    expect(result.current.getEquipment()).toEqual(mockData.equipment);
    expect(result.current.getOfficeHardware()).toEqual(mockData.officeHardware);
    expect(result.current.getCategories()).toEqual(mockData.categories);
  });

  it('should provide filtered data methods', async () => {
    const mockData = {
      tools: [{ item: 'Scalpel', category: 'Surgical' }],
      supplies: [{ item: 'Gauze', category: 'Supplies' }],
      equipment: [{ item: 'Monitor', category: 'Equipment' }],
      officeHardware: [{ item: 'Computer', category: 'Office Hardware' }],
      categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
      isLoading: false,
      error: null,
    };

    const { getInventoryService } = await import('@/services/ServiceAccess');
    const mockService = getInventoryService();
    (mockService.fetchAllInventoryData as vi.Mock).mockResolvedValue(mockData);
    (mockService.fetchInventoryItems as vi.Mock).mockResolvedValue([
      {
        id: '1',
        name: 'Scalpel',
        category: 'Surgical',
        quantity: 1,
        location: 'Test',
      },
    ]);

    // Ensure the mock is properly set up
    expect(mockService.fetchInventoryItems).toBeDefined();

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test filtered data methods
    const filteredTools = await result.current.getFilteredData('Scalpel');
    expect(mockFetchInventoryItems).toHaveBeenCalled();
    expect(filteredTools).toEqual([
      {
        id: '1',
        name: 'Scalpel',
        category: 'Surgical',
        quantity: 1,
        location: 'Test',
      },
    ]);
  });

  it('should provide legacy compatibility properties', async () => {
    const mockData = {
      tools: [
        {
          id: '1',
          name: 'Test Tool',
          category: 'Surgical',
          quantity: 1,
          location: 'Test',
        },
      ],
      supplies: [
        {
          id: '2',
          name: 'Test Supply',
          category: 'Supplies',
          quantity: 1,
          location: 'Test',
        },
      ],
      equipment: [
        {
          id: '3',
          name: 'Test Equipment',
          category: 'Equipment',
          quantity: 1,
          location: 'Test',
        },
      ],
      officeHardware: [
        {
          id: '4',
          name: 'Test Hardware',
          category: 'Office Hardware',
          quantity: 1,
          location: 'Test',
        },
      ],
      categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
      isLoading: false,
      error: null,
    };

    const { getInventoryService } = await import('@/services/ServiceAccess');
    const mockService = getInventoryService();
    (mockService.fetchAllInventoryData as vi.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test legacy compatibility properties
    expect(result.current.tools).toEqual(mockData.tools);
    expect(result.current.supplies).toEqual(mockData.supplies);
    expect(result.current.equipment).toEqual(mockData.equipment);
    expect(result.current.officeHardware).toEqual(mockData.officeHardware);
  });
});
