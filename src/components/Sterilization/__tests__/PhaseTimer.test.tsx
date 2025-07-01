jest.mock('@/store/timerStore', () => ({
  useTimerStore: () => ({
    timeRemaining: 1800,
    elapsedTime: 0,
    isRunning: true,
    overexposed: false,
    setTimeRemaining: jest.fn(),
    setElapsedTime: jest.fn(),
    setIsRunning: jest.fn(),
    setOverexposed: jest.fn(),
    resetTimer: jest.fn(),
  }),
}));

import { render, screen } from '@testing-library/react';
import PhaseTimer from '../PhaseTimer';
import { act } from 'react';
import '@testing-library/jest-dom';

jest.useFakeTimers();

describe('PhaseTimer', () => {
  it('renders the component correctly', () => {
    const mockComplete = jest.fn();
    const mockStart = jest.fn();
    const mockPause = jest.fn();

    render(
      <PhaseTimer
        phase={{
          id: 'bath1',
          name: 'Bath 1',
          duration: 3,
          tools: [],
          isActive: false,
          startTime: null,
          endTime: null,
          status: 'pending',
        }}
        onPhaseComplete={mockComplete}
        onPhaseStart={mockStart}
        onPhasePause={mockPause}
      />
    );

    // Verify the component renders without crashing
    expect(screen.getByText('Bath 1')).toBeInTheDocument();
  });

  it('calls onPhaseComplete after timer duration', () => {
    const mockComplete = jest.fn();
    render(
      <PhaseTimer
        phase={{
          id: 'test',
          name: 'Test',
          duration: 3,
          tools: [],
          isActive: true,
          startTime: null,
          endTime: null,
          status: 'active',
        }}
        onPhaseComplete={mockComplete}
        onPhaseStart={jest.fn()}
        onPhasePause={jest.fn()}
      />
    );

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockComplete).toHaveBeenCalledWith({
      id: 'test',
      name: 'Test',
      duration: 3,
      tools: [],
      isActive: true,
      startTime: null,
      endTime: null,
      status: 'active',
    });
  });
});
