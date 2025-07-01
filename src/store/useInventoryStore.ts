import { create } from 'zustand';
import {
  InventoryUIState,
  createInventoryUIStoreSlice,
} from './inventorySlices/createInventoryUIStoreSlice';
import {
  InventoryDataState,
  createInventoryDataStoreSlice,
} from './inventorySlices/createInventoryDataStoreSlice';
import {
  InventoryModalState,
  createInventoryModalStoreSlice,
} from './inventorySlices/createInventoryModalStoreSlice';
import { ScanModalState, createScanModalSlice } from './inventorySlices/createScanModalSlice';
import {
  createInventoryFilterSlice,
  FilterState,
} from './inventorySlices/createInventoryFilterSlice';
import {
  createInventoryPaginationSlice,
  PaginationState,
} from './inventorySlices/createInventoryPaginationSlice';

type InventoryStore = InventoryUIState &
  InventoryDataState &
  InventoryModalState &
  ScanModalState &
  PaginationState &
  FilterState;

export const useInventoryStore = create<InventoryStore>()((...a) => ({
  ...createInventoryUIStoreSlice(...a),
  ...createInventoryDataStoreSlice(...a),
  ...createInventoryModalStoreSlice(...a),
  ...createScanModalSlice(a[0]),
  ...createInventoryPaginationSlice(a[0]),
  ...createInventoryFilterSlice(a[0]),
}));
