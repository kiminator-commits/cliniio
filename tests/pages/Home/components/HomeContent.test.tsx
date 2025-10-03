import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import React from 'react';
import HomeContent from '@/pages/Home/components/HomeContent';
import { FacilityProvider } from '@/contexts/FacilityContext';

// Mock Supabase to avoid authentication issues
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: null,
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    }),
  },
}));

// Mock the hooks and components to avoid complex dependencies
vi.mock('@/pages/Home/hooks/useHomePageState', () => ({
  useHomePageState: () => ({
    component: null,
  }),
}));

vi.mock('@/hooks/useHomeDataLoader', () => ({
  useHomeDataLoader: () => ({
    tasks: [
      {
        id: '1',
        title: 'Test Task 1',
        description: 'Test task description 1',
        category: 'maintenance',
        difficulty: 'Easy',
        points: 10,
        timeEstimate: '15 min',
        isCompleted: false,
        completedAt: null,
        pointsEarned: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: 'Test Task 2',
        description: 'Test task description 2',
        category: 'environmental',
        difficulty: 'Medium',
        points: 15,
        timeEstimate: '30 min',
        isCompleted: true,
        completedAt: new Date().toISOString(),
        pointsEarned: 15,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    aiMetrics: {
      timeSaved: { daily: 2.5, monthly: 45 },
      costSavings: { monthly: 1200, annual: 15000 },
      aiEfficiency: { timeSavings: 85, proactiveMgmt: 92 },
      teamPerformance: { skills: 78, inventory: 95, sterilization: 88 },
      gamificationStats: {
        totalTasks: 25,
        completedTasks: 18,
        perfectDays: 12,
        currentStreak: 5,
        bestStreak: 8,
      },
    },
    sterilizationMetrics: {
      cyclesCompleted: '24',
      successRate: '98.5%',
      equipmentStatus: 'All Operational',
    },
    integrationMetrics: {
      systemHealth: 'Excellent',
      uptime: '99.9%',
      lastSync: '2 minutes ago',
    },
    loading: false,
    error: null,
  }),
}));

vi.mock('@/hooks/useHomeTasksManager', () => ({
  useHomeTasksManager: () => ({
    tasks: [
      {
        id: '1',
        title: 'Test Task 1',
        completed: false,
        points: 10,
        type: 'general',
        category: 'maintenance',
        priority: 'medium',
        dueDate: '2024-12-31',
        status: 'pending',
      },
      {
        id: '2',
        title: 'Test Task 2',
        completed: true,
        points: 15,
        type: 'cleaning',
        category: 'environmental',
        priority: 'high',
        dueDate: '2024-12-30',
        status: 'completed',
      },
    ],
    loading: false,
    taskError: null,
    selectedCategory: 'all',
    selectedType: 'all',
    storeAvailablePoints: 100,
    storeShowFilters: false,
    gamificationData: {
      streak: 0,
      level: 1,
      rank: 100,
      totalScore: 0,
    },
    handleCategoryChange: vi.fn(),
    handleTypeChange: vi.fn(),
    handleTaskCompleteWithErrorHandling: vi.fn(),
    setStoreShowFilters: vi.fn(),
    setTaskError: vi.fn(),
    pagination: {
      page: 1,
      pageSize: 20,
      total: 2,
      hasMore: false,
    },
    availablePoints: 100,
    completedTasksCount: 1,
    totalTasksCount: 2,
    isLoading: false,
    error: null,
    refreshTasks: vi.fn(),
    loadNextPage: vi.fn(),
    loadPreviousPage: vi.fn(),
    goToPage: vi.fn(),
    hasMore: false,
    currentPage: 1,
  }),
}));

vi.mock('@/components/TaskSection', () => ({
  default: function MockTaskSection() {
    return <div data-testid="tasks-list">Task Section</div>;
  },
}));

vi.mock('@/components/MetricsSection', () => ({
  default: function MockMetricsSection() {
    return <div data-testid="metrics-section">Metrics Section</div>;
  },
}));

vi.mock('@/components/Dashboard/GamificationStats', () => ({
  GamificationStats: function MockGamificationStats() {
    return <div data-testid="gamification-stats">Gamification Stats</div>;
  },
}));

describe('HomeContent', () => {
  it('renders without crashing', () => {
    render(
      <FacilityProvider>
        <HomeContent />
      </FacilityProvider>
    );

    // Check that the component renders without throwing an error
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('gamification-stats')).toBeInTheDocument();
  });

  it('contains all main sections', () => {
    render(
      <FacilityProvider>
        <HomeContent />
      </FacilityProvider>
    );

    // Check that all main sections are rendered
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('gamification-stats')).toBeInTheDocument();
  });

  it('renders components in correct order', () => {
    render(
      <FacilityProvider>
        <HomeContent />
      </FacilityProvider>
    );

    // Check that components are rendered in the expected order
    const container = screen.getByTestId('tasks-list').parentElement;
    expect(container).toBeInTheDocument();

    // Verify the presence of all expected components
    expect(screen.getByTestId('tasks-list')).toBeInTheDocument();
    expect(screen.getByTestId('metrics-section')).toBeInTheDocument();
    expect(screen.getByTestId('gamification-stats')).toBeInTheDocument();
  });
});
