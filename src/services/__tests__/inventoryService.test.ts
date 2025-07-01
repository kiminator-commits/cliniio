import { inventoryService } from '../inventoryService';
import { InventoryItem } from '../types/inventoryTypes';

// Mock Supabase client
jest.mock('../../lib/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: () => ({
      select: () =>
        Promise.resolve({
          data: [
            {
              id: '1',
              name: 'Test Item',
              category: 'Test Category',
              quantity: 10,
              location: 'Test Location',
            },
          ],
          error: null,
        }),
      insert: () => ({
        single: () =>
          Promise.resolve({
            data: {
              id: '2',
              name: 'New Item',
              category: 'Test Category',
              quantity: 5,
              location: 'Test Location',
            },
            error: null,
          }),
      }),
      delete: () => ({
        eq: () => Promise.resolve({ data: null, error: null }),
      }),
    }),
  },
}));

describe('inventoryService', () => {
  it('should return mock inventory items from fetchInventoryItems', async () => {
    const items = await inventoryService.fetchInventoryItems();
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({
      id: '1',
      name: 'Test Item',
      category: 'Test Category',
      quantity: 10,
      location: 'Test Location',
    });
  });

  it('should add inventory item correctly with addInventoryItem', async () => {
    const newItem: InventoryItem = {
      name: 'New Item',
      category: 'Test Category',
      quantity: 5,
      location: 'Test Location',
    };

    const addedItem = await inventoryService.addInventoryItem(newItem);
    expect(addedItem).toEqual({
      id: '2',
      ...newItem,
    });
  });

  it('should resolve deleteInventoryItem without throwing', async () => {
    await expect(inventoryService.deleteInventoryItem('123')).resolves.toBeUndefined();
  });
});
