import { StateCreator } from 'zustand';
import { ToolDataState, createToolDataSlice } from './toolDataSlice';
import { ToolActionsState, createToolActionsSlice } from './toolActionsSlice';
import {
  BatchManagementState,
  createBatchManagementSlice,
} from './batchManagementSlice';

export interface ToolManagementState
  extends ToolDataState,
    ToolActionsState,
    BatchManagementState {}

export const createToolManagementSlice: StateCreator<
  ToolManagementState,
  [],
  [],
  ToolManagementState
> = (set, get, store) => ({
  ...createToolDataSlice(set, get, store),
  ...createToolActionsSlice(set, get, store),
  ...createBatchManagementSlice(set, get, store),
});
