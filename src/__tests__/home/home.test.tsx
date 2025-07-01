import React, { act } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from '../../pages/Home';
import { UserProvider } from '../../contexts/UserContext';
import { UIProvider } from '../../contexts/UIContext';

// Mock hooks and stores used in HomePage
jest.mock('../../hooks/useHomeState', () => ({
  useHomeState: () => ({
    drawerOpen: true,
    setDrawerOpen: jest.fn(),
    tasks: [{ id: 1, name: 'Sample Task', completed: false }],
    gamificationData: {
      streak: 5,
      level: 3,
      rank: 10,
      totalScore: 1000,
      stats: {
        toolsSterilized: 50,
        inventoryChecks: 20,
        perfectDays: 5,
        totalTasks: 100,
        completedTasks: 80,
        currentStreak: 5,
        bestStreak: 7,
      },
    },
    mockMetricsData: {
      timeSaved: { value: 2.5, unit: 'minutes' },
      costSavings: { value: 1250, unit: 'USD' },
      aiEfficiency: { value: 85, unit: '%' },
      teamPerformance: { value: 90, unit: '%' },
    },
    handleTaskComplete: jest.fn(),
    handleRefresh: jest.fn(),
  }),
}));

// Mock the home store
jest.mock('../../store/homeStore', () => ({
  useHomeStore: () => ({
    totalScore: 1000,
    availablePoints: 250,
    showFilters: false,
    setShowFilters: jest.fn(),
    showStatsModal: false,
    setShowStatsModal: jest.fn(),
    showLeaderboardModal: false,
    setShowLeaderboardModal: jest.fn(),
    showChallengeModal: false,
    setShowChallengeModal: jest.fn(),
    leaderboardUsers: [
      { name: 'User 1', score: 1200, avatar: 'U1' },
      { name: 'User 2', score: 1100, avatar: 'U2' },
    ],
  }),
}));

// Mock NavBar component
jest.mock('@/components/NavBar', () => ({
  __esModule: true,
  default: () => <div data-testid="nav-bar">MockNavBar</div>,
}));

// Mock TasksList component
jest.mock('@/components/TasksList', () => ({
  __esModule: true,
  default: () => <div data-testid="tasks-list">MockTasksList</div>,
}));

// Mock PerformanceMetrics component
jest.mock('@/components/PerformanceMetrics/PerformanceMetrics', () => ({
  PerformanceMetrics: () => <div data-testid="performance-metrics">MockPerformanceMetrics</div>,
}));

describe('HomePage', () => {
  it('renders the main sections', async () => {
    await act(async () => {
      render(
        <UIProvider>
          <UserProvider>
            <MemoryRouter>
              <HomePage />
            </MemoryRouter>
          </UserProvider>
        </UIProvider>
      );
    });

    expect(screen.getByTestId('nav-bar')).toBeInTheDocument();
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
    expect(screen.getByTestId('performance-metrics')).toBeInTheDocument();
  });
});
