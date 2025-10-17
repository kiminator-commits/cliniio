import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryManagementTable from '@/__mocks__/InventoryManagementTable';
import { InventoryItem } from '@/types/inventoryTypes';

interface InventoryStoreState {
  inventoryItems: InventoryItem[];
  filters: Record<string, string>;
  pagination: { currentPage: number; pageSize: number };
  sorting: { field: string | null; direction: 'asc' | 'desc' };
  selectedItems: string[];
  categories: string[];
  isCategoriesLoading: boolean;
  addInventoryItem: (item: InventoryItem) => void;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
  setPagination: (pagination: {
    currentPage: number;
    pageSize: number;
  }) => void;
}

const mockStore: InventoryStoreState = {
  inventoryItems: [],
  filters: {},
  pagination: { currentPage: 1, pageSize: 10 },
  sorting: { field: null, direction: 'asc' },
  selectedItems: [],
  categories: ['Test Category'],
  isCategoriesLoading: false,
  addInventoryItem: vi.fn(),
  addCategory: vi.fn(),
  removeCategory: vi.fn(),
  setPagination: vi.fn(),
};

vi.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: (selector: (state: InventoryStoreState) => unknown) => {
    if (selector) {
      return selector(mockStore);
    }
    return mockStore;
  },
}));

describe('Inventory Management Flow', () => {
  const mockItems: InventoryItem[] = [];
  const mockOnAddItem = vi.fn();
  const mockOnEditItem = vi.fn();
  const mockOnDeleteItem = vi.fn();

  beforeEach(() => {
    mockStore.inventoryItems = [];
    mockStore.filters = {};
    mockStore.pagination = { currentPage: 1, pageSize: 10 };
    mockStore.sorting = { field: null, direction: 'asc' };
    mockStore.selectedItems = [];
    mockStore.categories = ['Test Category'];
    mockStore.isCategoriesLoading = false;
    (mockStore.addInventoryItem as vi.Mock).mockClear();
    (mockStore.addCategory as vi.Mock).mockClear();
    (mockStore.removeCategory as vi.Mock).mockClear();
    (mockStore.setPagination as vi.Mock).mockClear();
    mockOnAddItem.mockClear();
    mockOnEditItem.mockClear();
    mockOnDeleteItem.mockClear();
  });

  it('renders inventory table and category management correctly', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );
    expect(screen.getByText(/Manage Categories/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Add Item/i })
    ).toBeInTheDocument();
  });

  it('allows adding a category and reflects state', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );
    const categoryInput = screen.getByPlaceholderText(/new category/i);
    fireEvent.change(categoryInput, {
      target: { value: 'Integration Category' },
    });
    const addCategoryButton = screen.getByRole('button', {
      name: /Add Category/i,
    });
    fireEvent.click(addCategoryButton);
    expect(mockStore.addCategory).toHaveBeenCalledWith('Integration Category');
  });

  it('allows adding an inventory item via AddItemModal', async () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
        container={document.body}
      />
    );

    // Click Add Item button to open modal
    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

    // Verify that onAddItem was called with an empty item
    expect(mockOnAddItem).toHaveBeenCalledWith(
      expect.objectContaining({
        id: '',
        name: '',
        category: '',
        quantity: 0,
        location: '',
      })
    );
  });

  it('displays inventory items in a table', () => {
    const testItems: InventoryItem[] = [
      {
        id: '1',
        name: 'Item One',
        category: 'FilterCategory',
        quantity: 10,
        location: 'A1',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: {
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
      {
        id: '2',
        name: 'Item Two',
        category: 'OtherCategory',
        quantity: 5,
        location: 'B1',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        data: {
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    render(
      <InventoryManagementTable
        items={testItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    // Check if items are displayed in the table
    expect(screen.getByText('Item One')).toBeInTheDocument();
    expect(screen.getByText('Item Two')).toBeInTheDocument();
    expect(screen.getByText('FilterCategory')).toBeInTheDocument();
    expect(screen.getByText('OtherCategory')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('A1')).toBeInTheDocument();
    expect(screen.getByText('B1')).toBeInTheDocument();
  });
});
