// Library imports
import { StateCreator } from 'zustand';

// Type imports
import { SterilizationCycleState } from './types/sterilizationCycleTypes';
import { Tool } from '../../types/toolTypes';
import { BITestResult } from '../../types/sterilizationTypes';
import { ToolActionsState } from './toolActionsSlice';
import { ToolDataState } from './toolDataSlice';

// Action imports
import { createCycleActions } from './actions/cycleActions';
import { createPhaseActions } from './actions/phaseActions';
import { createToolActions } from './actions/toolActions';

// Utility imports
import { getCycleStats } from './utils/cycleStatsUtils';

// Commented imports (for future use)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { useSterilizationStore } from '../sterilizationStore';

export const createSterilizationCycleSlice: StateCreator<
  SterilizationCycleState & ToolActionsState & ToolDataState,
  [],
  [],
  SterilizationCycleState
> = (set, get, store) => {
  // set parameter is used by the slice creator pattern
  const cycleActions = createCycleActions(set, get, store);
  const phaseActions = createPhaseActions(set, get, store);
  const toolActions = createToolActions(set, get, store);

  return {
    // Initial state
    currentCycle: null,
    cycles: [],
    error: null,

    // Cycle actions
    ...cycleActions,

    // Phase actions
    ...phaseActions,

    // Tool actions
    ...toolActions,

    // Statistics
    getCycleStats: () => {
      const state = get() as SterilizationCycleState; // Access to combined store state
      return getCycleStats(
        state.cycles || [],
        (state.availableTools as Tool[]) || [],
        (state.biTestResults as BITestResult[]) || []
      );
    },
  };
};
