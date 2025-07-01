import { renderHook, waitFor } from '@testing-library/react';
import { useCentralizedInventoryData } from '../useCentralizedInventoryData';
import { inventoryDataService } from '@/services/inventoryDataService';

// Mock the service layer
jest.mock('@/services/inventoryDataService');
jest.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: () => ({
    setInventoryLoading: jest.fn(),
  }),
}));

const mockInventoryDataService = inventoryDataService as jest.Mocked<typeof inventoryDataService>;

describe('useCentralizedInventoryData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should provide data access methods', async () => {
    const mockData = {
      tools: [{ item: 'Test Tool', category: 'Surgical' }],
      supplies: [{ item: 'Test Supply', category: 'Supplies' }],
      equipment: [{ item: 'Test Equipment', category: 'Equipment' }],
      officeHardware: [{ item: 'Test Hardware', category: 'Office Hardware' }],
      categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
      isLoading: false,
      error: null,
    };

    mockInventoryDataService.fetchAllInventoryData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useCentralizedInventoryData());

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

    mockInventoryDataService.fetchAllInventoryData.mockResolvedValue(mockData);
    mockInventoryDataService.getFilteredData.mockReturnValue([
      { item: 'Scalpel', category: 'Surgical' },
    ]);

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test filtered data methods
    const filteredTools = result.current.getFilteredData('Scalpel');
    expect(mockInventoryDataService.getFilteredData).toHaveBeenCalledWith(
      mockData.tools,
      'Scalpel',
      undefined
    );
    expect(filteredTools).toEqual([{ item: 'Scalpel', category: 'Surgical' }]);
  });

  it('should provide legacy compatibility properties', async () => {
    const mockData = {
      tools: [{ item: 'Test Tool', category: 'Surgical' }],
      supplies: [{ item: 'Test Supply', category: 'Supplies' }],
      equipment: [{ item: 'Test Equipment', category: 'Equipment' }],
      officeHardware: [{ item: 'Test Hardware', category: 'Office Hardware' }],
      categories: ['Surgical', 'Supplies', 'Equipment', 'Office Hardware'],
      isLoading: false,
      error: null,
    };

    mockInventoryDataService.fetchAllInventoryData.mockResolvedValue(mockData);

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Wait for data to be available
    await waitFor(() => {
      expect(result.current.data).toBeTruthy();
    });

    // Test legacy compatibility properties
    expect(result.current.inventoryData).toEqual(mockData.tools);
    expect(result.current.suppliesData).toEqual(mockData.supplies);
    expect(result.current.equipmentData).toEqual(mockData.equipment);
    expect(result.current.officeHardwareData).toEqual(mockData.officeHardware);
  });

  it('should handle service errors', async () => {
    const errorMessage = 'Failed to fetch data';
    // Mock the service to return a response with an error
    mockInventoryDataService.fetchAllInventoryData.mockResolvedValue({
      tools: [],
      supplies: [],
      equipment: [],
      officeHardware: [],
      categories: [],
      isLoading: false,
      error: errorMessage,
    });

    const { result } = renderHook(() => useCentralizedInventoryData());

    // Wait for the hook to complete its initial fetch and check that data is available
    await waitFor(
      () => {
        expect(result.current.data).toBeTruthy();
      },
      { timeout: 3000 }
    );

    // Wait for loading to finish before asserting
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Check if the error from the response was set
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.data).toBeTruthy();
    expect(result.current.data?.error).toBe(errorMessage);
  });
});
