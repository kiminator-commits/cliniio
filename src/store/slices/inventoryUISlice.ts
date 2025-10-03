import { StateCreator } from 'zustand';
import { TabType } from '@/types/inventory';
import { ExpandedSections } from '@/types/inventoryTypes';

export interface InventoryUIState {
  // Tab and view state
  activeTab: TabType;
  showFilters: boolean;
  showTrackedOnly: boolean;
  showFavoritesOnly: boolean;

  // UI preferences
  expandedSections: ExpandedSections;
  showFiltersPanel: boolean;
  showAnalytics: boolean;
  showBulkActions: boolean;

  // Tracking state
  trackedItems: Set<string>;
  trackingData: Map<string, { doctor: string; timestamp: string }>;

  // UI actions
  setActiveTab: (tab: TabType) => void;
  setShowFilters: (show: boolean) => void;
  setShowTrackedOnly: (show: boolean) => void;
  setShowFavoritesOnly: (show: boolean) => void;

  // UI preferences actions
  setExpandedSections: (sections: ExpandedSections) => void;
  toggleExpandedSection: (section: keyof ExpandedSections) => void;
  setShowFiltersPanel: (show: boolean) => void;
  setShowAnalytics: (show: boolean) => void;
  setShowBulkActions: (show: boolean) => void;

  // Tracking actions
  toggleTrackedItem: (itemId: string, doctor: string) => void;
  setTrackedItems: (items: Set<string>) => void;
  setTrackingData: (
    data: Map<string, { doctor: string; timestamp: string }>
  ) => void;
}

export const createInventoryUISlice: StateCreator<
  InventoryUIState,
  [],
  [],
  InventoryUIState
> = (set) => ({
  // Tab and view state
  activeTab: 'tools',
  showFilters: false,
  showTrackedOnly: false,
  showFavoritesOnly: false,

  // UI preferences
  expandedSections: {
    general: true,
    purchase: false,
    maintenance: false,
    usage: false,
  },
  showFiltersPanel: false,
  showAnalytics: true,
  showBulkActions: false,

  // Tracking state
  trackedItems: new Set(),
  trackingData: new Map(),

  // UI actions
  setActiveTab: (tab: TabType) => set({ activeTab: tab }),
  setShowFilters: (show) => set({ showFilters: show }),
  setShowTrackedOnly: (show) => set({ showTrackedOnly: show }),
  setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

  // UI preferences actions
  setExpandedSections: (sections) => set({ expandedSections: sections }),
  toggleExpandedSection: (section: keyof ExpandedSections) =>
    set((state) => ({
      expandedSections: {
        ...state.expandedSections,
        [section]: !state.expandedSections[section],
      },
    })),
  setShowFiltersPanel: (show) => set({ showFiltersPanel: show }),
  setShowAnalytics: (show) => set({ showAnalytics: show }),
  setShowBulkActions: (show) => set({ showBulkActions: show }),

  // Tracking actions
  toggleTrackedItem: (itemId, doctor) =>
    set((state) => {
      const newTrackedItems = new Set(state.trackedItems);
      const newTrackingData = new Map(state.trackingData);

      if (newTrackedItems.has(itemId)) {
        newTrackedItems.delete(itemId);
        newTrackingData.delete(itemId);
      } else {
        newTrackedItems.add(itemId);
        newTrackingData.set(itemId, {
          doctor,
          timestamp: new Date().toISOString(),
        });
      }

      return {
        trackedItems: newTrackedItems,
        trackingData: newTrackingData,
      };
    }),
  setTrackedItems: (items) => set({ trackedItems: items }),
  setTrackingData: (data) => set({ trackingData: data }),
});
