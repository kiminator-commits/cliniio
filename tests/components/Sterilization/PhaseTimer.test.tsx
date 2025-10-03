import React from 'react';
import { vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PhaseTimer from '../../../src/components/Sterilization/PhaseTimer';

vi.mock('@/store/sterilizationStore', () => ({
  useSterilizationStore: () => ({
    currentCycle: null,
    moveToolToNextPhase: vi.fn(),
    resetPhase: vi.fn(),
  }),
}));

vi.mock('@/store/timerStore', () => ({
  useTimerStore: () => ({
    getTimer: vi.fn(() => ({
      timeRemaining: 1800,
      elapsedTime: 0,
      isRunning: true,
      overexposed: false,
    })),
    startTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resetTimer: vi.fn(),
    overexposed: false,
  }),
}));

import '@testing-library/jest-dom';

vi.useFakeTimers();

describe('PhaseTimer', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it('renders the component correctly', () => {
    const mockComplete = vi.fn();
    const mockStart = vi.fn();
    const mockPause = vi.fn();

    render(
      <PhaseTimer
        phase={{
          id: 'bath1',
          name: 'Bath 1',
          duration: 1800,
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

    // Verify the component renders without crashing - use getAllByText to handle multiple elements
    const bath1Elements = screen.getAllByText('Bath 1');
    expect(bath1Elements.length).toBeGreaterThan(0);
    expect(bath1Elements[0]).toBeInTheDocument();
  });

  it('renders phase timer with correct props', () => {
    const mockComplete = vi.fn();
    const mockStart = vi.fn();
    const mockPause = vi.fn();

    render(
      <PhaseTimer
        phase={{
          id: 'bath1',
          name: 'Bath 1',
          duration: 1800,
          tools: [],
          isActive: true,
          startTime: null,
          endTime: null,
          status: 'active',
        }}
        onPhaseComplete={mockComplete}
        onPhaseStart={mockStart}
        onPhasePause={mockPause}
      />
    );

    // Verify the component renders with active phase
    const bath1Elements = screen.getAllByText('Bath 1');
    expect(bath1Elements.length).toBeGreaterThan(0);
    expect(bath1Elements[0]).toBeInTheDocument();
  });
});
