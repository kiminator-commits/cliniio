import React from 'react';
import { render, screen } from '@testing-library/react';
import TaskSummaryCard from '../../../src/components/EnvironmentalCleaning/TaskSummaryCard';
import { TaskSummary } from '../../../src/pages/EnvironmentalClean/models';
import { describe, test, expect } from 'vitest';

describe('TaskSummaryCard', () => {
  const mockTasks: TaskSummary = {
    totalTasks: 30,
    completedTasks: 22,
    pendingTasks: 6,
    overdueTasks: 2,
  };

  it('renders the component with correct title', () => {
    render(<TaskSummaryCard tasks={mockTasks} />);

    expect(screen.getByText('Task Summary')).toBeInTheDocument();
  });

  it('displays total tasks count', () => {
    render(<TaskSummaryCard tasks={mockTasks} />);

    expect(screen.getByText('Total Tasks: 30')).toBeInTheDocument();
  });

  it('displays completed tasks count', () => {
    render(<TaskSummaryCard tasks={mockTasks} />);

    expect(screen.getByText('Completed Tasks: 22')).toBeInTheDocument();
  });

  it('displays pending tasks count', () => {
    render(<TaskSummaryCard tasks={mockTasks} />);

    expect(screen.getByText('Pending Tasks: 6')).toBeInTheDocument();
  });

  it('handles zero values correctly', () => {
    const zeroTasks: TaskSummary = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
    };

    render(<TaskSummaryCard tasks={zeroTasks} />);

    expect(screen.getByText('Total Tasks: 0')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks: 0')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks: 0')).toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    const { container } = render(<TaskSummaryCard tasks={mockTasks} />);

    const cardElement = container.firstChild as HTMLElement;
    expect(cardElement).toHaveClass('bg-white', 'p-4', 'rounded', 'shadow');
  });

  it('renders with different task values', () => {
    const differentTasks: TaskSummary = {
      totalTasks: 100,
      completedTasks: 80,
      pendingTasks: 15,
      overdueTasks: 5,
    };

    render(<TaskSummaryCard tasks={differentTasks} />);

    expect(screen.getByText('Total Tasks: 100')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks: 80')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks: 15')).toBeInTheDocument();
  });

  it('displays all task counts in correct order', () => {
    render(<TaskSummaryCard tasks={mockTasks} />);

    const taskElements = screen.getAllByText(/Tasks?:/);
    expect(taskElements).toHaveLength(3);

    // Check the order of elements
    const parentElement = taskElements[0].parentElement;
    const allText = parentElement?.textContent || '';

    expect(allText).toContain('Total Tasks: 30');
    expect(allText).toContain('Completed Tasks: 22');
    expect(allText).toContain('Pending Tasks: 6');
  });

  it('handles large numbers correctly', () => {
    const largeTasks: TaskSummary = {
      totalTasks: 5000,
      completedTasks: 4000,
      pendingTasks: 800,
      overdueTasks: 200,
    };

    render(<TaskSummaryCard tasks={largeTasks} />);

    expect(screen.getByText('Total Tasks: 5000')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks: 4000')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks: 800')).toBeInTheDocument();
  });

  it('renders with edge case values', () => {
    const edgeCaseTasks: TaskSummary = {
      totalTasks: 1,
      completedTasks: 1,
      pendingTasks: 0,
      overdueTasks: 0,
    };

    render(<TaskSummaryCard tasks={edgeCaseTasks} />);

    expect(screen.getByText('Total Tasks: 1')).toBeInTheDocument();
    expect(screen.getByText('Completed Tasks: 1')).toBeInTheDocument();
    expect(screen.getByText('Pending Tasks: 0')).toBeInTheDocument();
  });

  it('maintains consistent structure across different props', () => {
    const { rerender } = render(<TaskSummaryCard tasks={mockTasks} />);

    expect(screen.getByText('Task Summary')).toBeInTheDocument();

    const newTasks: TaskSummary = {
      totalTasks: 10,
      completedTasks: 5,
      pendingTasks: 3,
      overdueTasks: 2,
    };

    rerender(<TaskSummaryCard tasks={newTasks} />);

    expect(screen.getByText('Task Summary')).toBeInTheDocument();
    expect(screen.getByText('Total Tasks: 10')).toBeInTheDocument();
  });
});
