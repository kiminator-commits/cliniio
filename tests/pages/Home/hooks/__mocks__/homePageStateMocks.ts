import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { useHomePageState } from '@/pages/Home/hooks/useHomePageState';

// Define the type for the hook return value
type UseHomePageStateReturn = {
  state: 'loading' | 'error' | 'empty' | 'ready';
  component: React.ReactNode | null;
};

// Mock the useHomeTasksManager hook
const mockUseHomeTasksManager = vi.fn();
vi.mock('@/hooks/useHomeTasksManager', () => ({
  useHomeTasksManager: () => mockUseHomeTasksManager(),
}));

// Mock task data
export const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    completed: false,
    points: 50,
    type: 'Training Task',
    category: 'Policy Updates',
    priority: 'high',
    dueDate: '10/16/2023',
    status: 'pending',
  },
  {
    id: '2',
    title: 'Test Task 2',
    completed: true,
    points: 75,
    type: 'Required Task',
    category: 'Safety',
    priority: 'medium',
    dueDate: '10/20/2023',
    status: 'completed',
  },
];

export const mockCompletedTask = {
  id: '1',
  title: 'Completed Task',
  completed: true,
  points: 50,
  type: 'Training Task',
  category: 'Policy Updates',
  priority: 'high',
  dueDate: '10/16/2023',
  status: 'completed',
};

export const mockPendingTask = {
  id: '2',
  title: 'Pending Task',
  completed: false,
  points: 75,
  type: 'Required Task',
  category: 'Safety',
  priority: 'medium',
  dueDate: '10/20/2023',
  status: 'pending',
};

// Default mock return value
export const defaultMockReturnValue = {
  tasks: [],
  loading: false,
  taskError: null,
  selectedCategory: '',
  selectedType: '',
  storeAvailablePoints: 0,
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
  canCompleteTask: vi.fn(),
  setStoreShowFilters: vi.fn(),
  setTaskError: vi.fn(),
};

// Mock factory functions
export const createLoadingMock = () => ({
  ...defaultMockReturnValue,
  tasks: undefined,
  loading: true,
  taskError: null,
});

export const createErrorMock = (
  errorMessage: string = 'Network error occurred'
) => ({
  ...defaultMockReturnValue,
  tasks: [],
  loading: false,
  taskError: errorMessage,
});

export const createEmptyMock = () => ({
  ...defaultMockReturnValue,
  tasks: [],
  loading: false,
  taskError: null,
});

export const createReadyMock = (
  tasks: Record<string, unknown>[] = mockTasks
) => ({
  ...defaultMockReturnValue,
  tasks,
  loading: false,
  taskError: null,
});

export const createMixedStateMock = () => ({
  ...defaultMockReturnValue,
  tasks: [mockCompletedTask, mockPendingTask],
  loading: false,
  taskError: null,
});

// Test helper functions
export const renderHomePageStateHook = () => {
  return renderHook(() => useHomePageState());
};

export const setupMock = (mockReturnValue: Record<string, unknown>) => {
  mockUseHomeTasksManager.mockReturnValue(mockReturnValue);
};

export const clearMocks = () => {
  vi.clearAllMocks();
};

// Error messages for testing
export const errorMessages = [
  'Network error occurred',
  'Server timeout',
  'Authentication failed',
  'Database connection error',
  'Unknown error',
];

// Test expectations
export const expectReadyState = (result: {
  current: UseHomePageStateReturn;
}) => {
  expect(result.current.state).toBe('ready');
  expect(result.current.component).toBeNull();
};

export const expectNullComponent = (result: {
  current: UseHomePageStateReturn;
}) => {
  expect(result.current.component).toBeNull();
};
