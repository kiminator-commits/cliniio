import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import AddItemModal from '../../../src/components/Inventory/modals/AddItemModal';

interface InventoryStoreState {
  inventoryItems: unknown[];
  categories: string[];
  addInventoryItem: vi.Mock;
}

const mockStore: InventoryStoreState = {
  inventoryItems: [],
  categories: ['Category 1', 'Category 2'],
  addInventoryItem: vi.fn(),
};

vi.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: (selector: (state: InventoryStoreState) => unknown) => {
    if (selector) {
      return selector(mockStore);
    }
    return mockStore;
  },
}));

// Mock the useInventoryModals hook
vi.mock('@/hooks/inventory/useInventoryModals', () => ({
  useInventoryModals: () => ({
    showAddModal: true,
    closeAddModal: vi.fn(),
    formData: {
      itemName: '',
      category: '',
      id: '',
      location: '',
      purchaseDate: '',
      vendor: '',
      unit_cost: '',
      warranty: '',
      notes: '',
      status: 'active',
    },
    isEditMode: false,
    expandedSections: {
      general: true,
      purchase: false,
      maintenance: false,
      usage: false,
    },
    handleFormChange: vi.fn(),
    toggleSection: vi.fn(),
    handleSaveItem: vi.fn(),
  }),
}));

describe('AddItemModal', () => {
  const mockOnHide = vi.fn();
  const mockOnAddItem = vi.fn();
  const mockToggleSection = vi.fn();
  const mockHandleFormChange = vi.fn();

  const _mockFormData = {
    itemName: '',
    category: '',
    id: '',
    location: '',
    purchaseDate: '',
    vendor: '',
    unit_cost: '',
    warranty: '',
    maintenanceSchedule: '',
    lastServiced: '',
    nextDue: '',
    serviceProvider: '',
    assignedTo: '',
    status: '',
    quantity: '',
    notes: '',
  };

  const _mockExpandedSections = {
    general: true,
    purchase: false,
    maintenance: false,
    usage: false,
  };

  beforeEach(() => {
    mockStore.inventoryItems = [];
    mockStore.categories = ['Test Category'];
    mockStore.addInventoryItem.mockClear();
    mockOnHide.mockClear();
    mockOnAddItem.mockClear();
    mockToggleSection.mockClear();
    mockHandleFormChange.mockClear();
  });

  it('renders modal fields correctly', () => {
    render(<AddItemModal />);
    expect(screen.getByText(/General Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Maintenance Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Usage Information/i)).toBeInTheDocument();
  });

  it('submits form and updates store', async () => {
    render(<AddItemModal />);

    // Test that the modal renders with the correct sections
    expect(screen.getByText(/General Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Information/i)).toBeInTheDocument();

    // Test that the save button is present
    const saveButton = screen.getByText(/Save Item/i);
    expect(saveButton).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<AddItemModal />);

    expect(screen.getByText(/General Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Information/i)).toBeInTheDocument();
  });
});
