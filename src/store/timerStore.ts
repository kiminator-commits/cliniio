import { create } from 'zustand';
import { validateLocationAssignment } from '@/services/ai/aiTriageService';

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

  // Room assignment actions
  triggerRoomAssignment: () => void;
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

            // Handle autoclave completion - trigger room assignment
            if (id === 'autoclave' && timer.elapsedTime === timer.duration) {
              // Only trigger once when timer first completes
              get().triggerRoomAssignment();
            }
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

            // Handle autoclave completion - trigger room assignment
            if (
              id === 'autoclave' &&
              currentTimer.elapsedTime === currentTimer.duration
            ) {
              // Only trigger once when timer first completes
              get().triggerRoomAssignment();
            }
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

  triggerRoomAssignment: () => {
    // Show room assignment modal
    const modal = document.createElement('div');
    modal.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 class="text-lg font-semibold mb-4">Room Assignment Required</h2>
        <p class="text-sm text-gray-600 mb-4">Autoclave cycle completed. Please scan the location barcode where these tools will be stored.</p>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Location Barcode</label>
            <input 
              id="locationBarcode" 
              type="text" 
              placeholder="Scan or enter location barcode" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div class="flex space-x-3">
            <button 
              id="assignLocation" 
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Assign Location
            </button>
            <button 
              id="skipLocation" 
              class="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const assignButton = modal.querySelector('#assignLocation');
    const skipButton = modal.querySelector('#skipLocation');
    const locationInput = modal.querySelector(
      '#locationBarcode'
    ) as HTMLInputElement;

    const handleAssign = async () => {
      const locationCode = locationInput.value.trim();
      if (!locationCode) {
        alert('Please enter a location barcode');
        return;
      }

      try {
        // Get current batch ID from localStorage or sterilization store
        const currentBatchId = localStorage.getItem('currentBatchId');
        if (!currentBatchId) {
          alert('No active batch found');
          return;
        }

        // Validate location assignment
        const validationResult = await validateLocationAssignment({
          batchId: currentBatchId,
          toolsCount: 1, // This should be the actual count
          assignedLocation: locationCode,
        });

        if (validationResult.status === 'invalid_location') {
          alert(`Invalid location: ${validationResult.reasoning}`);
          return;
        }

        // Update database with location
        const { supabase } = await import('@/lib/supabaseClient');

        // Update sterilization batch
        await supabase
          .from('sterilization_batches')
          .update({ location_barcode: locationCode })
          .eq('id', currentBatchId);

        // Update inventory items
        await supabase
          .from('inventory_items')
          .update({ scanned_location: locationCode })
          .eq('batch_id', currentBatchId);

        alert(`✅ Location ${locationCode} assigned successfully`);
        document.body.removeChild(modal);
      } catch (error) {
        console.error('Error assigning location:', error);
        alert('Error assigning location. Please try again.');
      }
    };

    const handleSkip = () => {
      document.body.removeChild(modal);
    };

    assignButton?.addEventListener('click', handleAssign);
    skipButton?.addEventListener('click', handleSkip);

    // Focus on input
    setTimeout(() => locationInput?.focus(), 100);
  },
}));
