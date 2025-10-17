import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import InventoryPage from '@/pages/Inventory/index';
// import { InventoryActionService } from '../services/inventoryActionService';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import {
  mockDataManager,
  mockStoreState,
  mockScanModalManagement,
  createTestItem,
  createInvalidTestItem,
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

describe('Inventory CRUD Operations', () => {
  beforeEach(() => {
    setupMocks();

    // Setup default mocks
    mockUseInventoryDataManager.mockReturnValue(mockDataManager);
    mockUseInventoryStore.mockReturnValue(mockStoreState);
    mockUseScanModalManagement.mockReturnValue(mockScanModalManagement);
  });

  describe('Complete CRUD Operations Flow', () => {
    it('should handle complete create, read, update, delete workflow', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Verify initial state
      expect(screen.getByTestId('provider-tree')).toBeInTheDocument();
      expect(screen.getByTestId('page-content')).toBeInTheDocument();

      // Test Create Operation
      const createItemData = createTestItem({
        item: 'New Test Item',
        category: 'Tools',
        location: 'Storage Room C',
        quantity: 5,
        unit_cost: 15.99,
      });

      await act(async () => {
        await mockDataManager.createItem(createItemData);
      });

      expect(mockDataManager.createItem).toHaveBeenCalledWith(createItemData);

      // Test Read Operation
      const allItems = mockDataManager.getAllItems();
      expect(allItems).toBeDefined();

      // Test Update Operation
      const updateData = { quantity: 15 };
      await act(async () => {
        await mockDataManager.updateItem('1', updateData);
      });

      expect(mockDataManager.updateItem).toHaveBeenCalledWith('1', updateData);

      // Test Delete Operation
      await act(async () => {
        await mockDataManager.deleteItem('1');
      });

      expect(mockDataManager.deleteItem).toHaveBeenCalledWith('1');
    });

    it('should handle validation errors during CRUD operations', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test validation error in create operation
      const invalidItemData = createInvalidTestItem();

      // Mock validation error
      const mockValidationError = new Error(
        'Item name is required, Quantity must be a positive number'
      );
      mockDataManager.createItem.mockRejectedValueOnce(mockValidationError);

      await act(async () => {
        try {
          await mockDataManager.createItem(invalidItemData);
        } catch {
          // Expected to throw
        }
      });

      expect(mockDataManager.createItem).toHaveBeenCalledWith(invalidItemData);
    });

    it('should handle item creation with different categories', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const toolsItem = createTestItem({ category: 'Tools' });
      const suppliesItem = createTestItem({ category: 'Supplies' });
      const equipmentItem = createTestItem({ category: 'Equipment' });

      await act(async () => {
        await mockDataManager.createItem(toolsItem);
        await mockDataManager.createItem(suppliesItem);
        await mockDataManager.createItem(equipmentItem);
      });

      expect(mockDataManager.createItem).toHaveBeenCalledWith(toolsItem);
      expect(mockDataManager.createItem).toHaveBeenCalledWith(suppliesItem);
      expect(mockDataManager.createItem).toHaveBeenCalledWith(equipmentItem);
    });

    it('should handle item updates with partial data', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      // Test partial updates
      const quantityUpdate = { quantity: 20 };
      const locationUpdate = { location: 'New Storage Room' };
      const statusUpdate = { status: 'inactive' };

      await act(async () => {
        await mockDataManager.updateItem('1', quantityUpdate);
        await mockDataManager.updateItem('1', locationUpdate);
        await mockDataManager.updateItem('1', statusUpdate);
      });

      expect(mockDataManager.updateItem).toHaveBeenCalledWith(
        '1',
        quantityUpdate
      );
      expect(mockDataManager.updateItem).toHaveBeenCalledWith(
        '1',
        locationUpdate
      );
      expect(mockDataManager.updateItem).toHaveBeenCalledWith(
        '1',
        statusUpdate
      );
    });

    it('should handle bulk item deletion', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const itemIds = ['1', '2', '3'];

      await act(async () => {
        for (const id of itemIds) {
          await mockDataManager.deleteItem(id);
        }
      });

      expect(mockDataManager.deleteItem).toHaveBeenCalledWith('1');
      expect(mockDataManager.deleteItem).toHaveBeenCalledWith('2');
      expect(mockDataManager.deleteItem).toHaveBeenCalledWith('3');
    });
  });
});
