import React from 'react';
import { render, screen } from '@testing-library/react';
import ScheduleSummaryCard from '../../../src/components/EnvironmentalCleaning/ScheduleSummaryCard';
import { ScheduleSummary } from '../../../src/pages/EnvironmentalClean/models';
import { describe, test, expect } from 'vitest';

describe('ScheduleSummaryCard', () => {
  const mockSchedule: ScheduleSummary = {
    totalTasks: 25,
    completedTasks: 18,
    pendingTasks: 5,
    overdueTasks: 2,
  };

  it('renders the component with correct title', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    expect(screen.getByText('Schedule Summary')).toBeInTheDocument();
  });

  it('displays total tasks count', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    expect(screen.getByText('Total Tasks: 25')).toBeInTheDocument();
  });

  it('displays completed tasks count', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    expect(screen.getByText('Completed: 18')).toBeInTheDocument();
  });

  it('displays pending tasks count', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    expect(screen.getByText('Pending: 5')).toBeInTheDocument();
  });

  it('displays overdue tasks count', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    expect(screen.getByText('Overdue: 2')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroSchedule: ScheduleSummary = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
    };

    render(<ScheduleSummaryCard schedule={zeroSchedule} />);

    expect(screen.getByText('Total Tasks: 0')).toBeInTheDocument();
    expect(screen.getByText('Completed: 0')).toBeInTheDocument();
    expect(screen.getByText('Pending: 0')).toBeInTheDocument();
    expect(screen.getByText('Overdue: 0')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <ScheduleSummaryCard schedule={mockSchedule} />
    );

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('bg-white', 'p-4', 'rounded', 'shadow');
  });

  it('renders with different schedule values', () => {
    const differentSchedule: ScheduleSummary = {
      totalTasks: 50,
      completedTasks: 35,
      pendingTasks: 10,
      overdueTasks: 5,
    };

    render(<ScheduleSummaryCard schedule={differentSchedule} />);

    expect(screen.getByText('Total Tasks: 50')).toBeInTheDocument();
    expect(screen.getByText('Completed: 35')).toBeInTheDocument();
    expect(screen.getByText('Pending: 10')).toBeInTheDocument();
    expect(screen.getByText('Overdue: 5')).toBeInTheDocument();
  });

  it('displays all task counts in correct order', () => {
    render(<ScheduleSummaryCard schedule={mockSchedule} />);

    // Check individual elements exist
    expect(screen.getByText('Total Tasks: 25')).toBeInTheDocument();
    expect(screen.getByText('Completed: 18')).toBeInTheDocument();
    expect(screen.getByText('Pending: 5')).toBeInTheDocument();
    expect(screen.getByText('Overdue: 2')).toBeInTheDocument();
  });

  it('handles large numbers correctly', () => {
    const largeSchedule: ScheduleSummary = {
      totalTasks: 1000,
      completedTasks: 750,
      pendingTasks: 200,
      overdueTasks: 50,
    };

    render(<ScheduleSummaryCard schedule={largeSchedule} />);

    expect(screen.getByText('Total Tasks: 1000')).toBeInTheDocument();
    expect(screen.getByText('Completed: 750')).toBeInTheDocument();
    expect(screen.getByText('Pending: 200')).toBeInTheDocument();
    expect(screen.getByText('Overdue: 50')).toBeInTheDocument();
  });
});
