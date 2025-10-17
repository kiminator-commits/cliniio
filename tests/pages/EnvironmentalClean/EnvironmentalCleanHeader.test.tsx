import React from 'react';
import { vi, describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import EnvironmentalCleanHeader from '@/pages/EnvironmentalClean/components/EnvironmentalCleanHeader';

describe('EnvironmentalCleanHeader', () => {
  const defaultProps = {
    isScanning: false,
    onScan: vi.fn(),
    searchTerm: '',
    onSearchTermChange: vi.fn(),
    selectedStatus: 'all' as
      | 'all'
      | 'clean'
      | 'dirty'
      | 'in_progress'
      | undefined,
    onStatusChange: vi.fn(),
  };

  it('renders title and scanner button', () => {
    render(<EnvironmentalCleanHeader {...defaultProps} />);

    expect(screen.getByText('Environmental Clean')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Track and manage room cleaning workflows and maintain compliance standards.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Room Scanner')).toBeInTheDocument();
    expect(screen.getByText('Scan Room')).toBeInTheDocument();
  });

  it('calls onScan when scan button is clicked', () => {
    const onScan = vi.fn();
    render(<EnvironmentalCleanHeader {...defaultProps} onScan={onScan} />);

    const scanButton = screen.getByText('Scan Room');
    fireEvent.click(scanButton);

    expect(onScan).toHaveBeenCalled();
  });
});
