import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CategoryManagement from '../forms/CategoryManagement';

interface InventoryStoreState {
  categories: string[];
  isCategoriesLoading: boolean;
  addCategory: (category: string) => void;
  removeCategory: (category: string) => void;
}

const mockStore = {
  categories: ['Test Category'],
  isCategoriesLoading: false,
  addCategory: jest.fn(),
  removeCategory: jest.fn(),
};

jest.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: (selector: (state: InventoryStoreState) => unknown) => {
    if (selector) {
      return selector(mockStore);
    }
    return mockStore;
  },
}));

describe('CategoryManagement', () => {
  beforeEach(() => {
    mockStore.categories = ['Test Category'];
    mockStore.isCategoriesLoading = false;
    mockStore.addCategory.mockClear();
    mockStore.removeCategory.mockClear();
  });

  it('renders category input and add button', () => {
    render(<CategoryManagement />);
    expect(screen.getByPlaceholderText(/new category/i)).toBeInTheDocument();
    expect(screen.getByText(/Add/i)).toBeInTheDocument();
  });

  it('adds a category when form is submitted', () => {
    render(<CategoryManagement />);
    const input = screen.getByPlaceholderText(/new category/i);
    fireEvent.change(input, { target: { value: 'New Category' } });
    fireEvent.click(screen.getByText(/Add/i));
    expect(mockStore.addCategory).toHaveBeenCalledWith('New Category');
  });

  it('removes a category when remove button is clicked', () => {
    render(<CategoryManagement />);
    const removeButton = screen.getByText(/Remove/i);
    fireEvent.click(removeButton);
    expect(mockStore.removeCategory).toHaveBeenCalledWith('Test Category');
  });

  it('shows loading state when categories are loading', () => {
    mockStore.isCategoriesLoading = true;
    render(<CategoryManagement />);
    expect(screen.getByText(/Loading categories/i)).toBeInTheDocument();
  });
});
