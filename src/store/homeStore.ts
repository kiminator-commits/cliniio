import { create } from 'zustand';

export interface LeaderboardUser {
  id: string;
  name: string;
  score: number;
  rank: number;
  avatar?: string;
}

export interface HomeState {
  // State
  totalScore: number;
  availablePoints: number;
  showFilters: boolean;
  showLeaderboardModal: boolean;
  showStatsModal: boolean;
  showChallengeModal: boolean;
  leaderboardUsers: LeaderboardUser[];

  // Actions
  setTotalScore: (value: number) => void;
  setAvailablePoints: (value: number) => void;
  setShowFilters: (value: boolean) => void;
  setShowLeaderboardModal: (value: boolean) => void;
  setShowStatsModal: (value: boolean) => void;
  setShowChallengeModal: (value: boolean) => void;
  setLeaderboardUsers: (users: LeaderboardUser[]) => void;
}

export const useHomeStore = create<HomeState>(set => ({
  // Initial state
  totalScore: 0,
  availablePoints: 0,
  showFilters: false,
  showLeaderboardModal: false,
  showStatsModal: false,
  showChallengeModal: false,
  leaderboardUsers: [],

  // Actions
  setTotalScore: (value: number) => set({ totalScore: value }),
  setAvailablePoints: (value: number) => set({ availablePoints: value }),
  setShowFilters: (value: boolean) => set({ showFilters: value }),
  setShowLeaderboardModal: (value: boolean) => set({ showLeaderboardModal: value }),
  setShowStatsModal: (value: boolean) => set({ showStatsModal: value }),
  setShowChallengeModal: (value: boolean) => set({ showChallengeModal: value }),
  setLeaderboardUsers: (users: LeaderboardUser[]) => set({ leaderboardUsers: users }),
}));
