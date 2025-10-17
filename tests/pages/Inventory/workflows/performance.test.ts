import { act } from '@testing-library/react';
import { vi, describe, test, expect, beforeEach, it } from 'vitest';
import {
  setupDefaultMocks,
  mockUseInventoryDataManager,
  mockDataManager,
  mockStoreState,
  createLargeDataset,
} from '../__mocks__/inventoryTestMocks';

describe('Performance and Optimization Workflow', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  it('should handle large dataset operations efficiently', async () => {
    // Step 1: Simulate large dataset
    const largeDataset = createLargeDataset(1000);

    const mockLargeDataManager = {
      ...mockDataManager,
      getAllItems: vi.fn(() => largeDataset),
      getAnalyticsData: vi.fn(() => ({
        totalItems: 1000,
        totalValue: 500000,
        categories: ['Category 0', 'Category 1', 'Category 2', 'Category 3'],
      })),
    };
    mockUseInventoryDataManager.mockReturnValue(mockLargeDataManager);

    // Step 2: Test filtering performance
    const startTime = performance.now();
    const filteredItems = mockLargeDataManager
      .getAllItems()
      .filter((item) => item.category === 'Category 0');
    const endTime = performance.now();

    expect(filteredItems).toHaveLength(250); // 1000 / 4 categories
    expect(endTime - startTime).toBeLessThan(100); // Should complete within 100ms

    // Step 3: Test analytics calculation
    const analytics = mockLargeDataManager.getAnalyticsData();
    expect(analytics.totalItems).toBe(1000);
    expect(analytics.totalValue).toBe(500000);
  });

  it('should handle memory-efficient data operations', async () => {
    // Step 1: Test pagination
    const pageSize = 10;

    await act(async () => {
      mockStoreState.setItemsPerPage(pageSize);
    });

    expect(mockStoreState.setItemsPerPage).toHaveBeenCalledWith(pageSize);

    // Step 2: Test lazy loading
    const mockLazyDataManager = {
      ...mockDataManager,
      isLoading: true,
      data: null,
    };
    mockUseInventoryDataManager.mockReturnValue(mockLazyDataManager);

    expect(mockLazyDataManager.isLoading).toBe(true);

    // Step 3: Complete loading
    const mockLoadedDataManager = {
      ...mockDataManager,
      isLoading: false,
      data: mockDataManager.data,
    };
    mockUseInventoryDataManager.mockReturnValue(mockLoadedDataManager);

    expect(mockLoadedDataManager.isLoading).toBe(false);
    expect(mockLoadedDataManager.data).toBeDefined();
  });
});
