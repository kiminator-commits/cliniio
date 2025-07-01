import { create } from 'zustand';
import { resetToolMetadata } from '@/hooks/usePhaseTimer';

interface TimerState {
  timeRemaining: number;
  elapsedTime: number;
  isRunning: boolean;
  overexposed: boolean;
  ciStripIncluded: boolean;
  biTestPassed: boolean;
  batchId: string | null;
  setTimeRemaining: (seconds: number) => void;
  setElapsedTime: (seconds: number) => void;
  setIsRunning: (running: boolean) => void;
  setOverexposed: (value: boolean) => void;
  setCiStripIncluded: (value: boolean) => void;
  setBiTestPassed: (value: boolean) => void;
  setBatchId: (value: string | null) => void;
  resetTimer: () => void;
}

export const useTimerStore = create<TimerState>(set => ({
  timeRemaining: 0,
  elapsedTime: 0,
  isRunning: false,
  overexposed: false,
  ciStripIncluded: false,
  biTestPassed: false,
  batchId: null,

  setTimeRemaining: seconds => set({ timeRemaining: seconds }),
  setElapsedTime: seconds => set({ elapsedTime: seconds }),
  setIsRunning: running => set({ isRunning: running }),
  setOverexposed: value => set({ overexposed: value }),
  setCiStripIncluded: value => set({ ciStripIncluded: value }),
  setBiTestPassed: value => set({ biTestPassed: value }),
  setBatchId: value => set({ batchId: value }),
  resetTimer: () => {
    localStorage.removeItem('phaseTimerStart');
    resetToolMetadata();
    set({
      timeRemaining: 0,
      elapsedTime: 0,
      isRunning: false,
      overexposed: false,
      ciStripIncluded: false,
      biTestPassed: false,
      batchId: null,
    });
  },
}));
