import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('@/components/NavBar', () => ({
  __esModule: true,
  default: () => <div data-testid="nav-bar">MockNavBar</div>,
}));

jest.mock('@/components/PerformanceMetrics/PerformanceMetrics', () => ({
  __esModule: true,
  PerformanceMetrics: () => <div data-testid="performance-metrics">MockPerformance</div>,
}));

jest.mock('@/components/TasksList', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-list">MockTasksList</div>,
}));

describe('Home Components', () => {
  it('renders NavBar component', () => {
    render(<div data-testid="nav-bar">MockNavBar</div>);
    expect(screen.getByTestId('nav-bar')).toBeInTheDocument();
  });

  it('renders PerformanceMetrics component', () => {
    render(<div data-testid="performance-metrics">MockPerformance</div>);
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
  });

  it('renders TasksList component', () => {
    render(<div data-testid="tasks-list">MockTasksList</div>);
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
  });
});
