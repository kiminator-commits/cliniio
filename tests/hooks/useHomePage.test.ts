import { renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import useHomePage from '../../src/hooks/useHomePage';

// Mock the dependencies
vi.mock('../../src/store/homeStore', () => ({
  useHomeStore: vi.fn(),
}));

vi.mock('../../src/hooks/useHomeActions', () => ({
  useHomeActions: vi.fn(),
}));

import { useHomeStore } from '../../src/store/homeStore';
import { useHomeActions } from '../../src/hooks/useHomeActions';

const mockUseHomeStore = useHomeStore as vi.MockedFunction<typeof useHomeStore>;
const mockUseHomeActions = useHomeActions as vi.MockedFunction<
  typeof useHomeActions
>;

describe('useHomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return tasks, gamificationData, leaderboardUsers, and handleTaskComplete', () => {
    const mockTasks = [
      { id: '1', title: 'Task 1', completed: false },
      { id: '2', title: 'Task 2', completed: true },
    ];

    const mockGamificationData = {
      points: 100,
      level: 5,
      badges: ['first_task', 'streak_7'],
    };

    const mockLeaderboardUsers = [
      { id: '1', name: 'User 1', points: 150 },
      { id: '2', name: 'User 2', points: 120 },
    ];

    const mockHandleTaskComplete = vi.fn();

    mockUseHomeStore.mockReturnValue({
      tasks: mockTasks,
      gamificationData: mockGamificationData,
      leaderboardUsers: mockLeaderboardUsers,
    });

    mockUseHomeActions.mockReturnValue({
      handleTaskComplete: mockHandleTaskComplete,
    });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.tasks).toEqual(mockTasks);
    expect(result.current.gamificationData).toEqual(mockGamificationData);
    expect(result.current.leaderboardUsers).toEqual(mockLeaderboardUsers);
    expect(result.current.handleTaskComplete).toBe(mockHandleTaskComplete);
  });

  it('should handle empty data', () => {
    mockUseHomeStore.mockReturnValue({
      tasks: [],
      gamificationData: null,
      leaderboardUsers: [],
    });

    mockUseHomeActions.mockReturnValue({
      handleTaskComplete: vi.fn(),
    });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.tasks).toEqual([]);
    expect(result.current.gamificationData).toBeNull();
    expect(result.current.leaderboardUsers).toEqual([]);
    expect(typeof result.current.handleTaskComplete).toBe('function');
  });

  it('should handle undefined data', () => {
    mockUseHomeStore.mockReturnValue({
      tasks: undefined,
      gamificationData: undefined,
      leaderboardUsers: undefined,
    });

    mockUseHomeActions.mockReturnValue({
      handleTaskComplete: vi.fn(),
    });

    const { result } = renderHook(() => useHomePage());

    expect(result.current.tasks).toBeUndefined();
    expect(result.current.gamificationData).toBeUndefined();
    expect(result.current.leaderboardUsers).toBeUndefined();
    expect(typeof result.current.handleTaskComplete).toBe('function');
  });

  it('should call useHomeStore and useHomeActions', () => {
    mockUseHomeStore.mockReturnValue({
      tasks: [],
      gamificationData: null,
      leaderboardUsers: [],
    });

    mockUseHomeActions.mockReturnValue({
      handleTaskComplete: vi.fn(),
    });

    renderHook(() => useHomePage());

    expect(mockUseHomeStore).toHaveBeenCalledTimes(1);
    expect(mockUseHomeActions).toHaveBeenCalledTimes(1);
  });

  it('should maintain referential stability of returned values', () => {
    const mockTasks = [{ id: '1', title: 'Task 1', completed: false }];
    const mockGamificationData = { points: 100, level: 5, badges: [] };
    const mockLeaderboardUsers = [{ id: '1', name: 'User 1', points: 150 }];
    const mockHandleTaskComplete = vi.fn();

    mockUseHomeStore.mockReturnValue({
      tasks: mockTasks,
      gamificationData: mockGamificationData,
      leaderboardUsers: mockLeaderboardUsers,
    });

    mockUseHomeActions.mockReturnValue({
      handleTaskComplete: mockHandleTaskComplete,
    });

    const { result, rerender } = renderHook(() => useHomePage());

    const firstResult = result.current;

    rerender();

    expect(result.current).toStrictEqual(firstResult);
  });
});
