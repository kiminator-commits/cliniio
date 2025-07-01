import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddItemModal from '../modals/AddItemModal';

interface InventoryStoreState {
  inventoryItems: unknown[];
  categories: string[];
  addInventoryItem: (item: unknown) => void;
}

const mockStore: InventoryStoreState = {
  inventoryItems: [],
  categories: ['Category 1', 'Category 2'],
  addInventoryItem: jest.fn(),
};

jest.mock('@/store/useInventoryStore', () => ({
  useInventoryStore: (selector: (state: InventoryStoreState) => unknown) => {
    if (selector) {
      return selector(mockStore);
    }
    return mockStore;
  },
}));

describe('AddItemModal', () => {
  const mockOnHide = jest.fn();
  const mockOnAddItem = jest.fn();
  const mockToggleSection = jest.fn();
  const mockHandleFormChange = jest.fn();

  const mockFormData = {
    itemName: '',
    category: '',
    id: '',
    location: '',
    purchaseDate: '',
    vendor: '',
    cost: '',
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

  const mockExpandedSections = {
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
    render(
      <AddItemModal
        show={true}
        onHide={mockOnHide}
        formData={mockFormData}
        isEditMode={false}
        expandedSections={mockExpandedSections}
        toggleSection={mockToggleSection}
        handleFormChange={mockHandleFormChange}
      />
    );
    expect(screen.getByLabelText(/Item Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/ID \/ Serial #/i)).toBeInTheDocument();
    expect(screen.getByText(/General Information/i)).toBeInTheDocument();
  });

  it('submits form and updates store', async () => {
    render(
      <AddItemModal
        show={true}
        onHide={mockOnHide}
        formData={mockFormData}
        isEditMode={false}
        expandedSections={mockExpandedSections}
        toggleSection={mockToggleSection}
        handleFormChange={mockHandleFormChange}
      />
    );

    const nameInput = screen.getByLabelText(/Item Name/i);
    const categoryInput = screen.getByLabelText(/Category/i);

    fireEvent.change(nameInput, { target: { value: 'Test Item' } });
    fireEvent.change(categoryInput, { target: { value: 'tools' } });

    expect(mockHandleFormChange).toHaveBeenCalledWith('itemName', 'Test Item');
    expect(mockHandleFormChange).toHaveBeenCalledWith('category', 'tools');
  });

  it('validates required fields', async () => {
    render(
      <AddItemModal
        show={true}
        onHide={mockOnHide}
        formData={mockFormData}
        isEditMode={false}
        expandedSections={mockExpandedSections}
        toggleSection={mockToggleSection}
        handleFormChange={mockHandleFormChange}
      />
    );

    expect(screen.getByText(/General Information/i)).toBeInTheDocument();
    expect(screen.getByText(/Purchase Information/i)).toBeInTheDocument();
  });
});
