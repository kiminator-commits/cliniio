import { create } from 'zustand';

export interface Timer {
  id: string;
  timeRemaining: number;
  elapsedTime: number;
  duration: number;
  isRunning: boolean;
  overexposed: boolean;
}

interface TimerStore {
  timers: Record<string, Timer>;
  overexposed: boolean;
  intervals: Record<string, NodeJS.Timeout>;

  // Timer actions
  startTimer: (
    id: string,
    duration: number,
    resumeFrom?: { timeRemaining: number; elapsedTime: number }
  ) => void;
  pauseTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  updateTimer: (id: string, timeRemaining: number) => void;
  getTimer: (id: string) => Timer | undefined;
  resumeTimer: (id: string) => void;

  // Overexposure actions
  setOverexposed: (overexposed: boolean) => void;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: {},
  overexposed: false,
  intervals: {},

  startTimer: (
    id: string,
    duration: number,
    resumeFrom?: { timeRemaining: number; elapsedTime: number }
  ) => {
    // Clear any existing interval for this timer
    const existingInterval = get().intervals[id];
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    set((state) => ({
      timers: {
        ...state.timers,
        [id]: {
          id,
          timeRemaining: resumeFrom
            ? resumeFrom.timeRemaining
            : id === 'drying'
              ? 0
              : duration,
          elapsedTime: resumeFrom ? resumeFrom.elapsedTime : 0,
          duration,
          isRunning: true,
          overexposed: false,
        },
      },
    }));

    // Start the timer interval
    const interval = setInterval(() => {
      const timer = get().timers[id];
      if (timer && timer.isRunning) {
        if (id === 'drying') {
          // For drying, count up from 0
          const newElapsedTime = timer.elapsedTime + 1;
          set((state) => ({
            timers: {
              ...state.timers,
              [id]: {
                ...timer,
                elapsedTime: newElapsedTime,
              },
            },
          }));
        } else {
          // For other phases, count down then up for overexposure
          const newElapsedTime = timer.elapsedTime + 1;

          if (timer.timeRemaining > 0) {
            // Still counting down
            const newTimeRemaining = timer.timeRemaining - 1;

            set((state) => ({
              timers: {
                ...state.timers,
                [id]: {
                  ...timer,
                  timeRemaining: newTimeRemaining,
                  elapsedTime: newElapsedTime,
                  overexposed: false,
                },
              },
            }));
          } else {
            // Timer reached 0, now counting up for overexposure (bath phases only)
            const isBathPhase = id === 'bath1' || id === 'bath2';
            const overexposureTime = isBathPhase
              ? timer.elapsedTime - timer.duration
              : 0;

            set((state) => ({
              timers: {
                ...state.timers,
                [id]: {
                  ...timer,
                  timeRemaining: 0,
                  elapsedTime: newElapsedTime,
                  overexposed: isBathPhase && overexposureTime > 0,
                },
              },
              overexposed:
                (isBathPhase && overexposureTime > 0) || state.overexposed,
            }));
          }
        }
      }
    }, 1000);

    // Store the interval reference
    set((state) => ({
      intervals: {
        ...state.intervals,
        [id]: interval,
      },
    }));
  },

  pauseTimer: (id: string) => {
    // Clear the interval when pausing
    const interval = get().intervals[id];
    if (interval) {
      clearInterval(interval);
      set((state) => {
        const newIntervals = { ...state.intervals };
        delete newIntervals[id];
        return {
          intervals: newIntervals,
        };
      });
    }

    set((state) => ({
      timers: {
        ...state.timers,
        [id]: state.timers[id]
          ? { ...state.timers[id], isRunning: false }
          : state.timers[id],
      },
    }));
  },

  resetTimer: (id: string) => {
    // Clear the interval when resetting
    const interval = get().intervals[id];
    if (interval) {
      clearInterval(interval);
      set((state) => {
        const newIntervals = { ...state.intervals };
        delete newIntervals[id];
        return {
          intervals: newIntervals,
        };
      });
    }

    set((state) => ({
      timers: {
        ...state.timers,
        [id]: state.timers[id]
          ? {
              ...state.timers[id],
              timeRemaining: id === 'drying' ? 0 : state.timers[id].duration, // Drying resets to 0
              elapsedTime: 0,
              isRunning: false,
              overexposed: false,
            }
          : state.timers[id],
      },
    }));
  },

  updateTimer: (id: string, timeRemaining: number) => {
    set((state) => ({
      timers: {
        ...state.timers,
        [id]: state.timers[id]
          ? { ...state.timers[id], timeRemaining }
          : state.timers[id],
      },
    }));
  },

  getTimer: (id: string) => {
    return get().timers[id];
  },

  resumeTimer: (id: string) => {
    const timer = get().timers[id];
    if (!timer) return;

    // Clear any existing interval for this timer
    const existingInterval = get().intervals[id];
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Resume the timer with current state
    set((state) => ({
      timers: {
        ...state.timers,
        [id]: {
          ...timer,
          isRunning: true,
        },
      },
    }));

    // Start the timer interval
    const interval = setInterval(() => {
      const currentTimer = get().timers[id];
      if (currentTimer && currentTimer.isRunning) {
        if (id === 'drying') {
          // For drying, count up from current elapsed time
          const newElapsedTime = currentTimer.elapsedTime + 1;
          set((state) => ({
            timers: {
              ...state.timers,
              [id]: {
                ...currentTimer,
                elapsedTime: newElapsedTime,
              },
            },
          }));
        } else {
          // For other phases, count down then up for overexposure
          const newElapsedTime = currentTimer.elapsedTime + 1;

          if (currentTimer.timeRemaining > 0) {
            // Still counting down
            const newTimeRemaining = currentTimer.timeRemaining - 1;

            set((state) => ({
              timers: {
                ...state.timers,
                [id]: {
                  ...currentTimer,
                  timeRemaining: newTimeRemaining,
                  elapsedTime: newElapsedTime,
                  overexposed: false,
                },
              },
            }));
          } else {
            // Timer reached 0, now counting up for overexposure (bath phases only)
            const isBathPhase = id === 'bath1' || id === 'bath2';
            const overexposureTime = isBathPhase
              ? currentTimer.elapsedTime - currentTimer.duration
              : 0;

            set((state) => ({
              timers: {
                ...state.timers,
                [id]: {
                  ...currentTimer,
                  timeRemaining: 0,
                  elapsedTime: newElapsedTime,
                  overexposed: isBathPhase && overexposureTime > 0,
                },
              },
              overexposed:
                (isBathPhase && overexposureTime > 0) || state.overexposed,
            }));
          }
        }
      }
    }, 1000);

    // Store the interval reference
    set((state) => ({
      intervals: {
        ...state.intervals,
        [id]: interval,
      },
    }));
  },

  setOverexposed: (overexposed: boolean) => {
    set({ overexposed });
  },
}));
