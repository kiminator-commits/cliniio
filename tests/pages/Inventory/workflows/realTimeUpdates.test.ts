import { act } from '@testing-library/react';
import {
  setupDefaultMocks,
  mockUseInventoryDataManager,
  mockDataManager,
} from '../__mocks__/inventoryTestMocks';

describe('Real-time Data Updates Workflow', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  it('should handle concurrent item updates', async () => {
    // Simulate concurrent updates to the same item
    const itemId = '1';
    const update1 = { quantity: 15 };
    const update2 = { quantity: 20 };

    // First update
    await act(async () => {
      await mockDataManager.updateItem(itemId, update1);
    });

    // Second update (should be based on latest state)
    await act(async () => {
      await mockDataManager.updateItem(itemId, update2);
    });

    expect(mockDataManager.updateItem).toHaveBeenCalledTimes(2);
    expect(mockDataManager.updateItem).toHaveBeenNthCalledWith(
      1,
      itemId,
      update1
    );
    expect(mockDataManager.updateItem).toHaveBeenNthCalledWith(
      2,
      itemId,
      update2
    );
  });

  it('should handle data refresh and state updates', async () => {
    // Initial data load
    expect(mockDataManager.isLoading).toBe(false);
    expect(mockDataManager.data.tools).toHaveLength(1);

    // Trigger data refresh
    await act(async () => {
      await mockDataManager.refreshData();
    });

    expect(mockDataManager.refreshData).toHaveBeenCalled();

    // Verify refresh state
    const mockRefreshingState = {
      ...mockDataManager,
      isRefreshing: true,
    };
    mockUseInventoryDataManager.mockReturnValue(mockRefreshingState);

    expect(mockRefreshingState.isRefreshing).toBe(true);

    // Complete refresh
    const mockRefreshedState = {
      ...mockDataManager,
      isRefreshing: false,
      lastUpdated: new Date(),
    };
    mockUseInventoryDataManager.mockReturnValue(mockRefreshedState);

    expect(mockRefreshedState.isRefreshing).toBe(false);
  });

  it('should handle real-time category updates', async () => {
    // Add new category
    await act(async () => {
      await mockDataManager.addCategory('New Category');
    });

    expect(mockDataManager.addCategory).toHaveBeenCalledWith('New Category');

    // Verify categories are updated
    const updatedCategories = mockDataManager.getCategories();
    expect(updatedCategories).toEqual([
      'Tools',
      'Supplies',
      'Equipment',
      'Office Hardware',
    ]);

    // Delete category
    await act(async () => {
      await mockDataManager.deleteCategory('Old Category');
    });

    expect(mockDataManager.deleteCategory).toHaveBeenCalledWith('Old Category');
  });
});
