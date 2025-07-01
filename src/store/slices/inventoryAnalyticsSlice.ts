import { StateCreator } from 'zustand';

export interface InventoryAnalyticsState {
  // Analytics data
  analyticsData: {
    totalItems: number;
    lowStockItems: number;
    expiredItems: number;
    categories: Record<string, number>;
    recentActivity: Array<{
      id: string;
      action: string;
      timestamp: string;
      itemName: string;
    }>;
  };

  // Loading state
  isLoadingAnalytics: boolean;

  // Analytics actions
  setAnalyticsData: (data: InventoryAnalyticsState['analyticsData']) => void;
  setLoadingAnalytics: (loading: boolean) => void;
  updateAnalytics: () => void;

  // Utility actions
  resetAnalytics: () => void;
}

export const createInventoryAnalyticsSlice: StateCreator<
  InventoryAnalyticsState,
  [],
  [],
  InventoryAnalyticsState
> = set => ({
  // Analytics data
  analyticsData: {
    totalItems: 0,
    lowStockItems: 0,
    expiredItems: 0,
    categories: {},
    recentActivity: [],
  },

  // Loading state
  isLoadingAnalytics: false,

  // Analytics actions
  setAnalyticsData: data => set({ analyticsData: data }),
  setLoadingAnalytics: loading => set({ isLoadingAnalytics: loading }),
  updateAnalytics: () => {
    // This would typically fetch analytics data from an API
    set(() => ({ isLoadingAnalytics: true }));
    // Simulate API call
    setTimeout(() => {
      set(state => ({
        isLoadingAnalytics: false,
        analyticsData: {
          ...state.analyticsData,
          // Update with new data
        },
      }));
    }, 1000);
  },

  // Utility actions
  resetAnalytics: () =>
    set({
      analyticsData: {
        totalItems: 0,
        lowStockItems: 0,
        expiredItems: 0,
        categories: {},
        recentActivity: [],
      },
      isLoadingAnalytics: false,
    }),
});
