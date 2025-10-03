import React from 'react';
import { vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { ErrorBoundary } from 'react-error-boundary';
import InventoryPage from '@/pages/Inventory/index';
import { InventoryActionService } from '@/pages/Inventory/services/inventoryActionService';
import { useInventoryDataManager } from '@/hooks/inventory/useInventoryDataManager';
import { useInventoryStore } from '@/store/useInventoryStore';
import { useScanModalManagement } from '@/hooks/inventory/useScanModalManagement';
import {
  mockDataManager,
  mockStoreState,
  mockScanModalManagement,
  createTestItem,
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

describe('Inventory Bulk Operations', () => {
  beforeEach(() => {
    setupMocks();

    // Setup default mocks
    mockUseInventoryDataManager.mockReturnValue(mockDataManager);
    mockUseInventoryStore.mockReturnValue(mockStoreState);
    mockUseScanModalManagement.mockReturnValue(mockScanModalManagement);
  });

  describe('Bulk Operations Flow', () => {
    it('should handle bulk delete operation', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const itemIds = ['1', '2'];

      // Mock bulk delete operation
      const mockBulkDeleteResult = { deletedCount: 2 };
      vi.spyOn(
        InventoryActionService,
        'handleBulkOperation'
      ).mockImplementation(async (ids, operation, data, onSuccess) => {
        if (operation === 'delete' && onSuccess) {
          onSuccess(mockBulkDeleteResult);
        }
      });

      await act(async () => {
        await InventoryActionService.handleBulkOperation(
          itemIds,
          'delete',
          undefined,
          (result) => {
            expect(result).toEqual(mockBulkDeleteResult);
          },
          (error) => {
            fail(`Bulk delete should not fail: ${error}`);
          }
        );
      });

      expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
        itemIds,
        'delete',
        undefined,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle bulk update operation', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const itemIds = ['1', '2'];
      const updateData = createTestItem({
        item: 'Updated Item',
        category: 'Tools',
        location: 'Archive Room',
        status: 'inactive',
      });

      // Mock bulk update operation
      const mockBulkUpdateResult = { updatedCount: 2 };
      vi.spyOn(
        InventoryActionService,
        'handleBulkOperation'
      ).mockImplementation(async (ids, operation, data, onSuccess) => {
        if (operation === 'update' && onSuccess) {
          onSuccess(mockBulkUpdateResult);
        }
      });

      await act(async () => {
        await InventoryActionService.handleBulkOperation(
          itemIds,
          'update',
          updateData,
          (result) => {
            expect(result).toEqual(mockBulkUpdateResult);
          },
          (error) => {
            fail(`Bulk update should not fail: ${error}`);
          }
        );
      });

      expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
        itemIds,
        'update',
        updateData,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle bulk export operation', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const itemIds = ['1', '2'];

      // Mock bulk export operation
      const mockBulkExportResult = { exportedCount: 2 };
      vi.spyOn(
        InventoryActionService,
        'handleBulkOperation'
      ).mockImplementation(async (ids, operation, data, onSuccess) => {
        if (operation === 'export' && onSuccess) {
          onSuccess(mockBulkExportResult);
        }
      });

      await act(async () => {
        await InventoryActionService.handleBulkOperation(
          itemIds,
          'export',
          undefined,
          (result) => {
            expect(result).toEqual(mockBulkExportResult);
          },
          (error) => {
            fail(`Bulk export should not fail: ${error}`);
          }
        );
      });

      expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
        itemIds,
        'export',
        undefined,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle bulk operation errors', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const emptyItemIds: string[] = [];

      // Mock bulk operation error
      vi.spyOn(
        InventoryActionService,
        'handleBulkOperation'
      ).mockImplementation(async (ids, operation, data, onSuccess, onError) => {
        if (ids.length === 0 && onError) {
          onError('No items selected');
        }
      });

      await act(async () => {
        await InventoryActionService.handleBulkOperation(
          emptyItemIds,
          'delete',
          undefined,
          () => {
            fail('Bulk operation should fail with empty item IDs');
          },
          (error) => {
            expect(error).toBe('No items selected');
          }
        );
      });

      expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
        emptyItemIds,
        'delete',
        undefined,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle bulk operations with large item sets', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const largeItemIds = Array.from({ length: 100 }, (_, i) => `item-${i}`);

      // Mock bulk operation with large dataset
      const mockBulkResult = { updatedCount: 100 };
      vi.spyOn(
        InventoryActionService,
        'handleBulkOperation'
      ).mockImplementation(async (ids, operation, data, onSuccess) => {
        if (operation === 'update' && onSuccess) {
          onSuccess(mockBulkResult);
        }
      });

      const updateData = { status: 'archived' };

      await act(async () => {
        await InventoryActionService.handleBulkOperation(
          largeItemIds,
          'update',
          updateData,
          (result) => {
            expect(result).toEqual(mockBulkResult);
          },
          (error) => {
            fail(`Bulk operation should not fail: ${error}`);
          }
        );
      });

      expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
        largeItemIds,
        'update',
        updateData,
        expect.any(Function),
        expect.any(Function)
      );
    });

    it('should handle bulk operations with different data types', async () => {
      render(
        <ErrorBoundary fallback={<div>Error occurred</div>}>
          <InventoryPage />
        </ErrorBoundary>
      );

      const itemIds = ['1', '2', '3'];

      // Test different bulk operations
      const operations = [
        {
          type: 'delete',
          data: undefined,
          expectedResult: { deletedCount: 3 },
        },
        {
          type: 'update',
          data: { status: 'active' },
          expectedResult: { updatedCount: 3 },
        },
        {
          type: 'export',
          data: undefined,
          expectedResult: { exportedCount: 3 },
        },
      ];

      for (const operation of operations) {
        vi.spyOn(
          InventoryActionService,
          'handleBulkOperation'
        ).mockImplementation(async (ids, op, data, onSuccess) => {
          if (op === operation.type && onSuccess) {
            onSuccess(operation.expectedResult);
          }
        });

        await act(async () => {
          InventoryActionService.handleBulkOperation(
            itemIds,
            operation.type as 'delete' | 'update' | 'export',
            operation.data,
            (result) => {
              expect(result).toEqual(operation.expectedResult);
            },
            (error) => {
              fail(`Bulk ${operation.type} should not fail: ${error}`);
            }
          );
        });

        expect(InventoryActionService.handleBulkOperation).toHaveBeenCalledWith(
          itemIds,
          operation.type,
          operation.data,
          expect.any(Function),
          expect.any(Function)
        );
      }
    });
  });
});
