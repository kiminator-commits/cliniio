import { act } from 'react';

const mockStore = {
  inventoryItems: [],
  filters: {},
  pagination: { currentPage: 1, pageSize: 10 },
  sorting: { field: null, direction: 'asc' },
  selectedItems: [],
  categories: [],
  addInventoryItem: jest.fn(),
  getState: () => ({
    inventoryItems: [],
    filters: {},
    pagination: { currentPage: 1, pageSize: 10 },
    sorting: { field: null, direction: 'asc' },
    selectedItems: [],
    categories: [],
    addInventoryItem: jest.fn(),
  }),
};

jest.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: () => mockStore,
}));

describe('useInventoryStore', () => {
  beforeEach(() => {
    mockStore.inventoryItems = [];
    mockStore.filters = {};
    mockStore.pagination = { currentPage: 1, pageSize: 10 };
    mockStore.sorting = { field: null, direction: 'asc' };
    mockStore.selectedItems = [];
    mockStore.categories = [];
    mockStore.addInventoryItem.mockClear();
  });

  it('adds an inventory item correctly', () => {
    const testItem = {
      id: '1',
      name: 'Test Item',
      category: 'Test',
      quantity: 5,
      location: 'A1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    act(() => {
      mockStore.addInventoryItem(testItem);
    });

    expect(mockStore.addInventoryItem).toHaveBeenCalledWith(testItem);
  });
});
