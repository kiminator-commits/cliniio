import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useHomeActions } from '@/hooks/useHomeActions';
import { useHomeStore } from '@/store/homeStore';
import {
  setupTestEnvironment,
  teardownTestEnvironment,
} from '../../tests/utils/testUtils';

// Mock the home store
vi.mock('@/store/homeStore');

describe('useHomeActions', () => {
  const mockSetAvailablePoints = vi.fn();
  const mockSetTotalScore = vi.fn();
  const mockTotalScore = 100;
  const mockAvailablePoints = 50;

  beforeEach(() => {
    setupTestEnvironment();

    // Mock the home store
    (useHomeStore as vi.Mock).mockReturnValue({
      setAvailablePoints: mockSetAvailablePoints,
      setTotalScore: mockSetTotalScore,
      totalScore: mockTotalScore,
      availablePoints: mockAvailablePoints,
    });
  });

  afterEach(() => {
    teardownTestEnvironment();
    vi.clearAllMocks();
  });

  it('should handle task completion correctly', () => {
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskComplete('task-1', 25);
    });

    expect(mockSetTotalScore).toHaveBeenCalledWith(125); // 100 + 25
    expect(mockSetAvailablePoints).toHaveBeenCalledWith(25); // 50 - 25
  });

  it('should handle task completion with zero points', () => {
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskComplete('task-2', 0);
    });

    expect(mockSetTotalScore).toHaveBeenCalledWith(100); // 100 + 0
    expect(mockSetAvailablePoints).toHaveBeenCalledWith(50); // 50 - 0
  });

  it('should handle task completion with negative points', () => {
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskComplete('task-3', -10);
    });

    expect(mockSetTotalScore).toHaveBeenCalledWith(90); // 100 + (-10)
    expect(mockSetAvailablePoints).toHaveBeenCalledWith(60); // 50 - (-10)
  });

  it('should handle task start', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskStart('task-1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Task started:', 'task-1');
    consoleSpy.mockRestore();
  });

  it('should handle task skip', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskSkip('task-1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Task skipped:', 'task-1');
    consoleSpy.mockRestore();
  });

  it('should handle task reset', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskReset('task-1');
    });

    expect(consoleSpy).toHaveBeenCalledWith('Task reset:', 'task-1');
    consoleSpy.mockRestore();
  });

  it('should prevent available points from going below zero', () => {
    const { result } = renderHook(() => useHomeActions());

    act(() => {
      result.current.handleTaskComplete('task-1', 100); // More than available points
    });

    expect(mockSetTotalScore).toHaveBeenCalledWith(200); // 100 + 100
    expect(mockSetAvailablePoints).toHaveBeenCalledWith(0); // Math.max(0, 50 - 100) = 0
  });

  it('should return all required functions', () => {
    const { result } = renderHook(() => useHomeActions());

    expect(result.current.handleTaskComplete).toBeDefined();
    expect(result.current.handleTaskStart).toBeDefined();
    expect(result.current.handleTaskSkip).toBeDefined();
    expect(result.current.handleTaskReset).toBeDefined();
    expect(typeof result.current.handleTaskComplete).toBe('function');
    expect(typeof result.current.handleTaskStart).toBe('function');
    expect(typeof result.current.handleTaskSkip).toBe('function');
    expect(typeof result.current.handleTaskReset).toBe('function');
  });
});
