import { renderHook, waitFor } from '@testing-library/react';
import { vi, describe, expect } from 'vitest';
import { useCentralizedInventoryData } from '../../src/hooks/useCentralizedInventoryData';

// Mock the service access
const mockFetchInventoryItems = vi.fn();
const mockFetchAllInventoryData = vi.fn().mockResolvedValue({
  data: [
    {
      id: '1',
      name: 'Test Tool',
      category: 'Tools',
      quantity: 1,
      location: 'Test',
    },
    {
      id: '2',
      name: 'Test Supply',
      category: 'Supplies',
      quantity: 1,
      location: 'Test',
    },
    {
      id: '3',
      name: 'Test Equipment',
      category: 'Equipment',
      quantity: 1,
      location: 'Test',
    },
    {
      id: '4',
      name: 'Test Hardware',
      category: 'Office Hardware',
      quantity: 1,
      location: 'Test',
    },
  ],
});

vi.mock('@/services/inventory/InventoryServiceFacade', () => ({
  InventoryServiceFacadeImpl: {
    getInstance: vi.fn(() => ({
      getAllItems: mockFetchAllInventoryData,
      fetchInventoryItems: mockFetchInventoryItems,
    })),
  },
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
    const expectedTools = [
      {
        id: '1',
        name: 'Test Tool',
        category: 'Tools',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedSupplies = [
      {
        id: '2',
        name: 'Test Supply',
        category: 'Supplies',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedEquipment = [
      {
        id: '3',
        name: 'Test Equipment',
        category: 'Equipment',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedOfficeHardware = [
      {
        id: '4',
        name: 'Test Hardware',
        category: 'Office Hardware',
        quantity: 1,
        location: 'Test',
      },
    ];

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test data access methods
    expect(result.current.getTools()).toEqual(expectedTools);
    expect(result.current.getSupplies()).toEqual(expectedSupplies);
    expect(result.current.getEquipment()).toEqual(expectedEquipment);
    expect(result.current.getOfficeHardware()).toEqual(expectedOfficeHardware);
    expect(result.current.getCategories()).toEqual(['Tools', 'Supplies', 'Equipment', 'Office Hardware']);
  });

  it('should provide filtered data methods', async () => {
    // Mock the filtered data response
    mockFetchAllInventoryData.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Scalpel',
          category: 'Tools',
          quantity: 1,
          location: 'Test',
        },
        {
          id: '2',
          name: 'Forceps',
          category: 'Tools',
          quantity: 1,
          location: 'Test',
        },
        {
          id: '3',
          name: 'Bandage',
          category: 'Supplies',
          quantity: 1,
          location: 'Test',
        },
      ],
    });

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test filtered data methods
    const filteredTools = await result.current.getFilteredData('Scalpel');
    expect(mockFetchAllInventoryData).toHaveBeenCalled();
    expect(filteredTools).toEqual([
      {
        id: '1',
        name: 'Scalpel',
        category: 'Tools',
        quantity: 1,
        location: 'Test',
      },
    ]);
  });

  it('should provide legacy compatibility properties', async () => {
    // Reset mock to use the original data
    mockFetchAllInventoryData.mockResolvedValue({
      data: [
        {
          id: '1',
          name: 'Test Tool',
          category: 'Tools',
          quantity: 1,
          location: 'Test',
        },
        {
          id: '2',
          name: 'Test Supply',
          category: 'Supplies',
          quantity: 1,
          location: 'Test',
        },
        {
          id: '3',
          name: 'Test Equipment',
          category: 'Equipment',
          quantity: 1,
          location: 'Test',
        },
        {
          id: '4',
          name: 'Test Hardware',
          category: 'Office Hardware',
          quantity: 1,
          location: 'Test',
        },
      ],
    });

    const expectedTools = [
      {
        id: '1',
        name: 'Test Tool',
        category: 'Tools',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedSupplies = [
      {
        id: '2',
        name: 'Test Supply',
        category: 'Supplies',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedEquipment = [
      {
        id: '3',
        name: 'Test Equipment',
        category: 'Equipment',
        quantity: 1,
        location: 'Test',
      },
    ];
    const expectedOfficeHardware = [
      {
        id: '4',
        name: 'Test Hardware',
        category: 'Office Hardware',
        quantity: 1,
        location: 'Test',
      },
    ];

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Trigger data loading
    await result.current.refreshData();

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test legacy compatibility properties
    expect(result.current.tools).toEqual(expectedTools);
    expect(result.current.supplies).toEqual(expectedSupplies);
    expect(result.current.equipment).toEqual(expectedEquipment);
    expect(result.current.officeHardware).toEqual(expectedOfficeHardware);
  });
});
