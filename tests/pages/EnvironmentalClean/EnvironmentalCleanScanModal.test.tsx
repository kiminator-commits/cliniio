import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnvironmentalCleanScanModal, {
  EnvironmentalCleanScanModalProps,
} from '@/pages/EnvironmentalClean/components/EnvironmentalCleanScanModal';

// Mock the status types store
vi.mock('@/store/statusTypesStore', () => ({
  useStatusTypesStore: () => ({
    getCoreStatusTypes: () => [
      {
        id: 'dirty',
        name: 'Dirty',
        icon: 'broom',
        color: '#dc2626',
        description: 'Room needs cleaning',
        isCore: true,
      },
      {
        id: 'in_progress',
        name: 'In Progress',
        icon: 'progress-clock',
        color: '#ca8a04',
        description: 'Cleaning in progress',
        isCore: true,
      },
      {
        id: 'clean',
        name: 'Clean',
        icon: 'check-circle',
        color: '#16a34a',
        description: 'Room is clean',
        isCore: true,
      },
    ],
    getPublishedStatusTypes: () => [],
  }),
}));

// Using centralized mock from __mocks__ directory

describe('EnvironmentalCleanScanModal', () => {
  const defaultProps: EnvironmentalCleanScanModalProps = {
    show: true,
    onClose: vi.fn(),
    hasScanned: false,
    handleStatusSelect: vi.fn(),
    handleDoneScan: vi.fn(),
  };

  test('renders status selection interface initially', () => {
    render(<EnvironmentalCleanScanModal {...defaultProps} />);
    expect(screen.getByText('Environmental Clean Scanner')).toBeInTheDocument();
    expect(screen.getByText('Select Room Status')).toBeInTheDocument();
    expect(screen.getByText('Dirty')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('Clean')).toBeInTheDocument();
  });

  test('renders scanner interface after status selection', () => {
    const { rerender } = render(
      <EnvironmentalCleanScanModal {...defaultProps} />
    );

    // First, select a status
    fireEvent.click(screen.getByText('Dirty'));

    // Re-render with the status selected (simulating state change)
    rerender(<EnvironmentalCleanScanModal {...defaultProps} />);

    expect(screen.getByText('Dirty Status')).toBeInTheDocument();
    expect(screen.getByText('Click to Scan')).toBeInTheDocument();
    expect(
      screen.getByText('Use camera to scan room barcode')
    ).toBeInTheDocument();
  });

  test('renders all status buttons initially', () => {
    render(<EnvironmentalCleanScanModal {...defaultProps} />);
    ['Dirty', 'In Progress', 'Clean'].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
  });

  test('calls handleStatusSelect on button click', () => {
    const mockHandleStatusSelect = vi.fn();
    const props = {
      ...defaultProps,
      handleStatusSelect: mockHandleStatusSelect,
    };
    render(<EnvironmentalCleanScanModal {...props} />);
    fireEvent.click(screen.getByText('Dirty'));
    expect(mockHandleStatusSelect).toHaveBeenCalledWith('dirty');
  });

  test('shows scanner interface after status selection', () => {
    const { rerender } = render(
      <EnvironmentalCleanScanModal {...defaultProps} />
    );

    // Select a status first
    fireEvent.click(screen.getByText('Dirty'));

    // Re-render to show scanner interface
    rerender(<EnvironmentalCleanScanModal {...defaultProps} />);

    // Verify scanner interface elements are present
    expect(screen.getByText('Dirty Status')).toBeInTheDocument();
    expect(screen.getByText('Click to Scan')).toBeInTheDocument();
    expect(
      screen.getByText('Use camera to scan room barcode')
    ).toBeInTheDocument();
    expect(screen.getByText('← Back to Status Selection')).toBeInTheDocument();

    // Verify the scan button is present (by finding the barcode icon)
    expect(screen.getByTestId('mdi-icon')).toBeInTheDocument();
  });
});
