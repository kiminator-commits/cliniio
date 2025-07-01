import { StateCreator } from 'zustand';

export interface InventoryUIState {
  // Tab and view state
  activeTab: string;
  showFilters: boolean;
  showTrackedOnly: boolean;
  showFavoritesOnly: boolean;

  // Tracking state
  trackedItems: Set<string>;
  trackingData: Map<string, { doctor: string; timestamp: string }>;

  // UI actions
  setActiveTab: (tab: string) => void;
  setShowFilters: (show: boolean) => void;
  setShowTrackedOnly: (show: boolean) => void;
  setShowFavoritesOnly: (show: boolean) => void;

  // Tracking actions
  toggleTrackedItem: (itemId: string, doctor: string) => void;
  setTrackedItems: (items: Set<string>) => void;
  setTrackingData: (data: Map<string, { doctor: string; timestamp: string }>) => void;
}

export const createInventoryUISlice: StateCreator<
  InventoryUIState,
  [],
  [],
  InventoryUIState
> = set => ({
  // Tab and view state
  activeTab: 'tools',
  showFilters: false,
  showTrackedOnly: false,
  showFavoritesOnly: false,

  // Tracking state
  trackedItems: new Set(),
  trackingData: new Map(),

  // UI actions
  setActiveTab: tab => set({ activeTab: tab }),
  setShowFilters: show => set({ showFilters: show }),
  setShowTrackedOnly: show => set({ showTrackedOnly: show }),
  setShowFavoritesOnly: show => set({ showFavoritesOnly: show }),

  // Tracking actions
  toggleTrackedItem: (itemId, doctor) =>
    set(state => {
      const newTrackedItems = new Set(state.trackedItems);
      const newTrackingData = new Map(state.trackingData);

      if (newTrackedItems.has(itemId)) {
        newTrackedItems.delete(itemId);
        newTrackingData.delete(itemId);
      } else {
        newTrackedItems.add(itemId);
        newTrackingData.set(itemId, { doctor, timestamp: new Date().toISOString() });
      }

      return {
        trackedItems: newTrackedItems,
        trackingData: newTrackingData,
      };
    }),
  setTrackedItems: items => set({ trackedItems: items }),
  setTrackingData: data => set({ trackingData: data }),
});
