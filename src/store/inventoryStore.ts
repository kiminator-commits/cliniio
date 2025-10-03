import { create } from 'zustand';
import {
  createInventoryDataSlice,
  InventoryDataState,
} from './slices/inventoryDataSlice';
import {
  createInventoryUISlice,
  InventoryUIState,
} from './slices/inventoryUISlice';
import {
  createInventoryModalSlice,
  InventoryModalState,
} from './slices/inventoryModalSlice';
import {
  createInventoryFilterSlice,
  InventoryFilterState,
} from './slices/inventoryFilterSlice';
import {
  createInventoryFormSlice,
  InventoryFormState,
} from './slices/inventoryFormSlice';
import {
  createInventoryPaginationSlice,
  InventoryPaginationState,
} from './slices/inventoryPaginationSlice';
import {
  createInventoryAnalyticsSlice,
  InventoryAnalyticsState,
} from './slices/inventoryAnalyticsSlice';

type InventoryStore = InventoryDataState &
  InventoryUIState &
  InventoryModalState &
  InventoryFilterState &
  InventoryFormState &
  InventoryPaginationState &
  InventoryAnalyticsState;

export const useInventoryStore = create<InventoryStore>()((...a) => ({
  ...createInventoryDataSlice(...a),
  ...createInventoryUISlice(...a),
  ...createInventoryModalSlice(...a),
  ...createInventoryFilterSlice(...a),
  ...createInventoryFormSlice(...a),
  ...createInventoryPaginationSlice(...a),
  ...createInventoryAnalyticsSlice(...a),
}));
