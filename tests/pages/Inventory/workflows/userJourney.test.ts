import { act } from '@testing-library/react';
import { vi } from 'vitest';
import { InventoryItemData } from '@/pages/Inventory/services/inventoryActionService';
import {
  setupDefaultMocks,
  mockDataManager,
  mockStoreState,
  mockHandleBulkOperation,
  mockHandleArchiveItem,
} from '../__mocks__/inventoryTestMocks';

describe('Multi-step User Journey Workflow', () => {
  beforeEach(() => {
    setupDefaultMocks();
  });

  it('should handle complete inventory audit workflow', async () => {
    // Step 1: Load inventory data
    expect(mockDataManager.data.tools).toHaveLength(1);
    expect(mockDataManager.data.supplies).toHaveLength(1);
    expect(mockDataManager.data.equipment).toHaveLength(1);

    // Step 2: Search for specific items
    await act(async () => {
      mockStoreState.setSearchQuery('screwdriver');
    });

    // Step 3: Filter by category
    await act(async () => {
      mockStoreState.setActiveTab('tools');
    });

    // Step 4: Update item quantities
    await act(async () => {
      await mockDataManager.updateItem('1', { quantity: 8 });
    });

    // Step 5: Add missing items
    const newItem: InventoryItemData = {
      category: 'Tools',
      location: 'Storage Room A',
      quantity: 5,
      unit_cost: 19.99,
      data: {
        item: 'Missing Tool',
      },
    };

    await act(async () => {
      await mockDataManager.createItem(newItem);
    });

    // Step 6: Export audit report
    const itemIds = ['1', '2', '3'];
    await act(async () => {
      mockHandleBulkOperation(
        itemIds,
        'export',
        undefined,
        (result: Record<string, unknown>) => {
          expect(result.exportedCount).toBe(3);
        }
      );
    });

    // Step 7: Verify final state
    expect(mockDataManager.updateItem).toHaveBeenCalledWith('1', {
      quantity: 8,
    });
    expect(mockDataManager.createItem).toHaveBeenCalledWith(newItem);
    expect(mockHandleBulkOperation).toHaveBeenCalled();
  });

  it('should handle inventory reorganization workflow', async () => {
    // Step 1: Identify items to move
    const itemsToMove = ['1', '2'];

    // Step 2: Bulk update locations
    const newLocation = 'New Storage Room';
    await act(async () => {
      mockHandleBulkOperation(
        itemsToMove,
        'update',
        { item: 'Updated Item', category: 'Tools', location: newLocation },
        (result: Record<string, unknown>) => {
          expect(result.updatedCount).toBe(2);
        }
      );
    });

    // Step 3: Update categories
    await act(async () => {
      await mockDataManager.updateItem('1', { category: 'Equipment' });
    });

    // Step 4: Verify reorganization
    const calls = (mockHandleBulkOperation as vi.Mock).mock.calls;
    const found = calls.some(
      (call) =>
        Array.isArray(call[0]) &&
        call[0].length === itemsToMove.length &&
        call[0].every((id, idx) => id === itemsToMove[idx]) &&
        call[1] === 'update' &&
        JSON.stringify(call[2]) ===
          JSON.stringify({
            item: 'Updated Item',
            category: 'Tools',
            location: newLocation,
          })
    );
    expect(found).toBe(true);
    expect(mockDataManager.updateItem).toHaveBeenCalledWith('1', {
      category: 'Equipment',
    });
  });

  it('should handle inventory cleanup workflow', async () => {
    // Step 1: Identify obsolete items
    // Safety Gloves (item 2) is obsolete

    // Step 2: Archive obsolete items
    await act(async () => {
      mockHandleArchiveItem(
        '2',
        (archivedItem: Record<string, unknown>) => {
          expect(archivedItem.status).toBe('Archived');
        },
        (error: string) => {
          throw new Error(`Archive should not fail: ${error}`);
        }
      );
    });

    // Step 3: Delete archived items
    await act(async () => {
      await mockDataManager.deleteItem('2');
    });

    // Step 4: Update analytics
    const analytics = mockDataManager.getAnalyticsData();
    expect(analytics.totalItems).toBe(2);
    // After deleting Safety Gloves ($5.99), total should be $25.99 + $1500.0 = $1525.99
    expect(analytics.totalValue).toBe(1525.99);

    // Step 5: Verify cleanup
    expect(mockHandleArchiveItem).toHaveBeenCalled();
    expect(mockDataManager.deleteItem).toHaveBeenCalledWith('2');
  });
});
