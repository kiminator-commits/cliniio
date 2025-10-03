import React from 'react';
import { vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import ScanInventoryModal from '../../../src/pages/Inventory/ScanInventoryModal';
import * as handlers from '../../../src/pages/Inventory/services/scanInventoryModalService';
import { setupComponentTest } from '../../utils/testHelpers';

// Mock @mdi/react to use centralized mock
vi.mock('@mdi/react', () => ({
  Icon: ({ path, size = 1, color, className, ...props }: any) =>
    React.createElement(
      'svg',
      {
        'data-testid': 'icon',
        width: size * 24,
        height: size * 24,
        className,
        style: { color },
        ...props,
      },
      React.createElement('path', { d: path })
    ),
}));

// Mock the handlers
vi.spyOn(handlers, 'formatScannedItemsCount').mockReturnValue('1 item');

describe('ScanInventoryModal', () => {
  beforeEach(() => {
    setupComponentTest(); // Setup centralized mocks
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.resetAllMocks();
  });

  it('shows mode selection when scanMode is null', () => {
    const { getByText } = render(
      <ScanInventoryModal
        scanMode={null}
        scannedItems={[]}
        onClose={() => {}}
        onSelectMode={() => {}}
        onScan={() => {}}
        onProcess={() => {}}
      />
    );

    expect(getByText('Scan Inventory')).toBeInTheDocument();
    expect(getByText('Add Inventory')).toBeInTheDocument();
    expect(getByText('Use Inventory')).toBeInTheDocument();
  });

  it('shows scanner interface when scanMode is set', () => {
    const { getByText } = render(
      <ScanInventoryModal
        scanMode="add"
        scannedItems={[]}
        onClose={() => {}}
        onSelectMode={() => {}}
        onScan={() => {}}
        onProcess={() => {}}
      />
    );

    expect(getByText('Inventory Scanner')).toBeInTheDocument();
    expect(getByText('Scanner Active')).toBeInTheDocument();
    expect(getByText('Camera Scanner')).toBeInTheDocument();
  });

  it('displays scanned items section when items are present', () => {
    const scannedItems = ['INV-001-Test Item', 'INV-002-Another Item'];

    const { getByText } = render(
      <ScanInventoryModal
        scanMode="add"
        scannedItems={scannedItems}
        onClose={() => {}}
        onSelectMode={() => {}}
        onScan={() => {}}
        onProcess={() => {}}
      />
    );

    expect(getByText(/Scanned Items/)).toBeInTheDocument();
    expect(getByText('INV-001-Test Item')).toBeInTheDocument();
    expect(getByText('INV-002-Another Item')).toBeInTheDocument();
  });

  it('calls onSelectMode when mode buttons are clicked', () => {
    const mockOnSelectMode = vi.fn();

    const { getByText } = render(
      <ScanInventoryModal
        scanMode={null}
        scannedItems={[]}
        onClose={() => {}}
        onSelectMode={mockOnSelectMode}
        onScan={() => {}}
        onProcess={() => {}}
      />
    );

    fireEvent.click(getByText('Add Inventory'));
    expect(mockOnSelectMode).toHaveBeenCalledWith('add');

    fireEvent.click(getByText('Use Inventory'));
    expect(mockOnSelectMode).toHaveBeenCalledWith('use');
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = vi.fn();

    render(
      <ScanInventoryModal
        scanMode="add"
        scannedItems={[]}
        onClose={mockOnClose}
        onSelectMode={() => {}}
        onScan={() => {}}
        onProcess={() => {}}
      />
    );

    // Find the close button by its specific class in the document body
    const closeButton = document.body.querySelector('button.text-gray-400');
    expect(closeButton).toBeInTheDocument();
    fireEvent.click(closeButton!);
    expect(mockOnClose).toHaveBeenCalled();
  });
});
