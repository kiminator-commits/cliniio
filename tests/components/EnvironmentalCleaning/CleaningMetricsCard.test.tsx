import React from 'react';
import { render, screen } from '@testing-library/react';
import CleaningMetricsCard from '../../../src/components/EnvironmentalCleaning/CleaningMetricsCard';
import { CleaningMetrics } from '../../../src/pages/EnvironmentalClean/models';

describe('CleaningMetricsCard', () => {
  const mockMetrics: CleaningMetrics = {
    totalRooms: 50,
    cleanRooms: 35,
    dirtyRooms: 10,
    inProgressRooms: 5,
    cleaningEfficiency: 85.5,
    averageCleaningTime: 45,
    lastUpdated: '2024-01-15T10:30:00Z',
  };

  it('renders the component with correct title', () => {
    render(<CleaningMetricsCard metrics={mockMetrics} />);

    expect(screen.getByText('Cleaning Metrics')).toBeInTheDocument();
  });

  it('displays total rooms count', () => {
    render(<CleaningMetricsCard metrics={mockMetrics} />);

    expect(screen.getByText('Total Rooms: 50')).toBeInTheDocument();
  });

  it('displays cleaned rooms count', () => {
    render(<CleaningMetricsCard metrics={mockMetrics} />);

    expect(screen.getByText('Rooms Cleaned: 35')).toBeInTheDocument();
  });

  it('displays pending rooms count (dirty + in progress)', () => {
    render(<CleaningMetricsCard metrics={mockMetrics} />);

    expect(screen.getByText('Rooms Pending: 15')).toBeInTheDocument();
  });

  it('calculates pending rooms correctly', () => {
    const metricsWithDifferentValues: CleaningMetrics = {
      ...mockMetrics,
      dirtyRooms: 8,
      inProgressRooms: 3,
    };

    render(<CleaningMetricsCard metrics={metricsWithDifferentValues} />);

    expect(screen.getByText('Rooms Pending: 11')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroMetrics: CleaningMetrics = {
      totalRooms: 0,
      cleanRooms: 0,
      dirtyRooms: 0,
      inProgressRooms: 0,
      cleaningEfficiency: 0,
      averageCleaningTime: 0,
      lastUpdated: '2024-01-15T10:30:00Z',
    };

    render(<CleaningMetricsCard metrics={zeroMetrics} />);

    expect(screen.getByText('Total Rooms: 0')).toBeInTheDocument();
    expect(screen.getByText('Rooms Cleaned: 0')).toBeInTheDocument();
    expect(screen.getByText('Rooms Pending: 0')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<CleaningMetricsCard metrics={mockMetrics} />);

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('bg-white', 'p-4', 'rounded', 'shadow');
  });

  it('renders with different metric values', () => {
    const differentMetrics: CleaningMetrics = {
      totalRooms: 100,
      cleanRooms: 80,
      dirtyRooms: 15,
      inProgressRooms: 5,
      cleaningEfficiency: 92.3,
      averageCleaningTime: 30,
      lastUpdated: '2024-01-16T14:20:00Z',
    };

    render(<CleaningMetricsCard metrics={differentMetrics} />);

    expect(screen.getByText('Total Rooms: 100')).toBeInTheDocument();
    expect(screen.getByText('Rooms Cleaned: 80')).toBeInTheDocument();
    expect(screen.getByText('Rooms Pending: 20')).toBeInTheDocument();
  });
});
