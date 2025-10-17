import { StateCreator } from 'zustand';
import { DEPRECATED_MOCK_NOTICE } from '../../services/deprecatedNotice';

// Rate limiting state interface
export interface RateLimitState {
  rateLimitStats: {
    currentRequests: number;
    currentBurstRequests: number;
    maxRequests: number;
    maxBurstRequests: number;
    windowMs: number;
  } | null;
  isRateLimited: boolean;
}

// Rate limiting actions interface
export interface RateLimitActions {
  updateRateLimitStats: () => void;
  resetRateLimiter: () => void;
  setRateLimited: (isRateLimited: boolean) => void;
}

// Combined rate limiting slice type
export type RateLimitSlice = RateLimitState & RateLimitActions;

// Rate limiting slice creator
export const createRateLimitSlice: StateCreator<RateLimitSlice> = (set) => ({
  // Initial state
  rateLimitStats: null,
  isRateLimited: false,

  // Rate limiting actions
  updateRateLimitStats: () => {
    console.warn(DEPRECATED_MOCK_NOTICE);
    const stats = {
      currentRequests: 0,
      currentBurstRequests: 0,
      maxRequests: 100,
      maxBurstRequests: 20,
      windowMs: 60000,
    };
    set({ rateLimitStats: stats });
  },

  resetRateLimiter: () => {
    console.warn(DEPRECATED_MOCK_NOTICE);
    set({ rateLimitStats: null, isRateLimited: false });
  },

  setRateLimited: (isRateLimited: boolean) => set({ isRateLimited }),
});
