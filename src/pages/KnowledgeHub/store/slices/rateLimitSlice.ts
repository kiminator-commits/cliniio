import { StateCreator } from 'zustand';
import { knowledgeHubApiService } from '../../services/knowledgeHubApiService';

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
    const stats = knowledgeHubApiService.getRateLimitStats();
    set({ rateLimitStats: stats });
  },

  resetRateLimiter: () => {
    knowledgeHubApiService.resetRateLimiter();
    set({ rateLimitStats: null, isRateLimited: false });
  },

  setRateLimited: (isRateLimited: boolean) => set({ isRateLimited }),
});
