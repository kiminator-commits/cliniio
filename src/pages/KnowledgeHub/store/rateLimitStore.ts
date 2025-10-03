import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { knowledgeHubApiService } from '../services/knowledgeHubApiService';

// Rate limiting state interface
interface RateLimitState {
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
interface RateLimitActions {
  updateRateLimitStats: () => void;
  resetRateLimiter: () => void;
  setRateLimited: (isRateLimited: boolean) => void;
}

// Combined rate limiting store type
type RateLimitStore = RateLimitState & RateLimitActions;

// Create the rate limiting store
export const useRateLimitStore = create<RateLimitStore>()(
  devtools((set) => ({
    // Initial state
    rateLimitStats: null,
    isRateLimited: false,

    // Rate limiting actions
    updateRateLimitStats: () => {
      const stats = knowledgeHubApiService.getRateLimitStats();
      set({ rateLimitStats: stats });
    },

    resetRateLimiter: () => {
      knowledgeHubApiService.resetRateLimiter();
      set({ rateLimitStats: null, isRateLimited: false });
    },

    setRateLimited: (isRateLimited: boolean) => set({ isRateLimited }),
  }))
);

// Selector hooks for rate limiting state
export const useRateLimitStats = () =>
  useRateLimitStore((state) => state.rateLimitStats);
export const useIsRateLimited = () =>
  useRateLimitStore((state) => state.isRateLimited);

// Action hooks for rate limiting
export const useUpdateRateLimitStats = () =>
  useRateLimitStore((state) => state.updateRateLimitStats);
export const useResetRateLimiter = () =>
  useRateLimitStore((state) => state.resetRateLimiter);
export const useSetRateLimited = () =>
  useRateLimitStore((state) => state.setRateLimited);
