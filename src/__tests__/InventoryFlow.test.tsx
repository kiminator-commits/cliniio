jest.mock('@/store/useInventoryStore', () => {
  const actual = jest.requireActual('@/store/useInventoryStore');
  return {
    ...actual,
    useInventoryStore: jest.fn(() => ({
      items: [],
      categories: [],
      fetchItems: jest.fn(),
      fetchCategories: jest.fn(),
      setState: jest.fn(),
      pagination: { currentPage: 1, pageSize: 10 },
      setPagination: jest.fn(),
      inventoryItems: [],
    })),
  };
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InventoryManagementTable from '@/__testHelpers__/InventoryManagementTable';

describe('InventoryFlow', () => {
  const mockItems = [];
  const mockOnAddItem = jest.fn();
  const mockOnEditItem = jest.fn();
  const mockOnDeleteItem = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the inventory management table', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('displays empty state when no items are present', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    const tableBody = screen.getByRole('table').querySelector('tbody');
    expect(tableBody).toBeEmptyDOMElement();
  });

  it('triggers add item callback when Add Item button is clicked', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    const addItemButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addItemButton);

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

  it('renders table headers correctly', () => {
    render(
      <InventoryManagementTable
        items={mockItems}
        onAddItem={mockOnAddItem}
        onEditItem={mockOnEditItem}
        onDeleteItem={mockOnDeleteItem}
      />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Category')).toBeInTheDocument();
    expect(screen.getByText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
});
