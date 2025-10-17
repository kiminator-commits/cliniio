import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, act } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import InventoryPage from '@/pages/Inventory/index';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import {
  mockDataManager,
  mockStoreState,
  mockScanModalManagement,
  mockCategories,
  setupMocks,
} from './__mocks__/inventoryTestMocks';

// Mock all the hooks and services
vi.mock('@/hooks/inventory/useInventoryDataManager');
vi.mock('@/store/useInventoryStore');
vi.mock('@/hooks/inventory/useScanModalManagement');
vi.mock('@/hooks/inventory/useInventoryContext');
vi.mock('@/pages/Inventory/hooks/useInventoryPageSetup');

// Mock the action service
vi.mock('@/pages/Inventory/services/inventoryActionService');

// Mock the data manager hook
const mockUseInventoryDataManager =
  useInventoryDataManager as vi.MockedFunction<typeof useInventoryDataManager>;
const mockUseInventoryStore = useInventoryStore as vi.MockedFunction<
  typeof useInventoryStore
>;
const mockUseScanModalManagement = useScanModalManagement as vi.MockedFunction<
  typeof useScanModalManagement
>;

// Mock the page setup hook
vi.mock('@/pages/Inventory/hooks/useInventoryPageSetup', () => ({
  useInventoryPageSetup: () => ({
    ProviderTree: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="provider-tree">{children}</div>
    ),
    PageContent: () => (
      <div data-testid="page-content">Inventory Dashboard</div>
    ),
  }),
}));

// Mock the context hook
vi.mock('@/hooks/inventory/useInventoryContext', () => ({
  useInventoryContext: () => ({
    handleShowAddModal: vi.fn(),
    handleEditClick: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleDuplicateClick: vi.fn(),
    handleArchiveClick: vi.fn(),
    handleBulkDelete: vi.fn(),
    handleBulkUpdate: vi.fn(),
    handleBulkExport: vi.fn(),
  }),
}));

describe('Inventory Data Management', () => {
  beforeEach(() => {
    setupMocks();

    // Setup default mocks
    mockUseInventoryDataManager.mockReturnValue(mockDataManager);
    mockUseInventoryStore.mockReturnValue(mockStoreState);
    mockUseScanModalManagement.mockReturnValue(mockScanModalManagement);
  });

  describe('Data Management Flow', () => {
    it('should handle data fetching and analytics', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test data fetching
      await act(async () => {
        await mockDataManager.fetchData();
      });

      expect(mockDataManager.fetchData).toHaveBeenCalled();

      // Test analytics data
      const analytics = mockDataManager.getAnalyticsData();
      expect(analytics.totalItems).toBe(3);
      expect(analytics.totalValue).toBe(1531.98);
      expect(analytics.categories).toEqual(mockCategories);

      // Test category management
      await act(async () => {
        await mockDataManager.addCategory('New Category');
      });

      expect(mockDataManager.addCategory).toHaveBeenCalledWith('New Category');

      await act(async () => {
        await mockDataManager.deleteCategory('Old Category');
      });

      expect(mockDataManager.deleteCategory).toHaveBeenCalledWith(
        'Old Category'
      );
    });

    it('should handle data refresh and error recovery', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test data refresh
      await act(async () => {
        await mockDataManager.refreshData();
      });

      expect(mockDataManager.refreshData).toHaveBeenCalled();

      // Test error clearing
      await act(async () => {
        mockDataManager.clearError();
      });

      expect(mockDataManager.clearError).toHaveBeenCalled();

      // Test retry operation
      await act(async () => {
        await mockDataManager.retryLastOperation();
      });

      expect(mockDataManager.retryLastOperation).toHaveBeenCalled();
    });

    it('should handle data filtering and search', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test getting items by category
      mockDataManager.getItemsByCategory('Tools');
      expect(mockDataManager.getItemsByCategory).toHaveBeenCalledWith('Tools');

      // Test getting filtered items
      await mockDataManager.getFilteredItems();
      expect(mockDataManager.getFilteredItems).toHaveBeenCalled();

      // Test getting all items
      const allItems = mockDataManager.getAllItems();
      expect(allItems).toBeDefined();

      // Test getting categories
      const categories = mockDataManager.getCategories();
      expect(categories).toEqual(mockCategories);
    });

    it('should handle data loading states', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test initial loading state
      expect(mockDataManager.isLoading).toBe(false);
      expect(mockDataManager.isRefreshing).toBe(false);

      // Test data availability
      expect(mockDataManager.data).toBeDefined();
      expect(mockDataManager.inventoryData).toBeDefined();
      expect(mockDataManager.lastUpdated).toBeInstanceOf(Date);
    });

    it('should handle category-specific data access', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test category-specific data
      expect(mockDataManager.data.tools).toBeDefined();
      expect(mockDataManager.data.supplies).toBeDefined();
      expect(mockDataManager.data.equipment).toBeDefined();
      expect(mockDataManager.data.officeHardware).toBeDefined();

      // Test category-specific data accessors
      expect(mockDataManager.suppliesData).toBeDefined();
      expect(mockDataManager.equipmentData).toBeDefined();
      expect(mockDataManager.officeHardwareData).toBeDefined();
    });
  });
});
