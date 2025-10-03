import { StateCreator } from 'zustand';
import {
  SterilizationPhase,
  SterilizationState,
} from '../types/sterilizationCycleTypes';
import { createNewCycle, createPhase } from '../utils/cycleUtils';
import { Tool } from '../../../types/toolTypes';
import { ToolActionsState } from '../toolActionsSlice';
import { ToolDataState } from '../toolDataSlice';

export const createPhaseActions: StateCreator<
  SterilizationState & ToolActionsState & ToolDataState,
  [],
  [],
  {
    addPhaseToCycle: (
      phaseId: string,
      phaseName: string,
      duration: number
    ) => void;
    startPhase: (phaseId: string) => void;
    completePhase: (phaseId: string) => void;
    pausePhase: (phaseId: string) => void;
    resetPhase: (phaseId: string) => void;
  }
> = (set, get, _store) => ({
  addPhaseToCycle: (phaseId: string, phaseName: string, duration: number) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) {
        // Pull tool IDs from availableTools where currentPhase is 'bath1'
        const currentState = get();
        const toolsInBath1 = currentState.availableTools
          .filter((t: Tool) => t.currentPhase === 'bath1')
          .map((t: Tool) => t.id);

        const newCycle = createNewCycle('Current Operator');
        newCycle.tools = toolsInBath1;

        return { ...state, currentCycle: newCycle };
      }

      // Check if phase already exists
      const existingPhase = state.currentCycle.phases.find(
        (phase: SterilizationPhase) => phase.id === phaseId
      );
      if (existingPhase) {
        return state;
      }

      // Add the phase to the current cycle with all current tools
      const newPhase = createPhase(phaseId, phaseName, duration, [
        ...state.currentCycle.tools,
      ]);

      const updatedPhases = [...state.currentCycle.phases, newPhase];
      const updatedCycle = { ...state.currentCycle, phases: updatedPhases };

      return {
        ...state,
        currentCycle: updatedCycle,
      };
    });
  },

  startPhase: (phaseId: string) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) return state;
      const updatedPhases = state.currentCycle.phases.map(
        (phase: SterilizationPhase) =>
          phase.id === phaseId
            ? {
                ...phase,
                isActive: true,
                startTime: new Date(),
                status: 'active' as const,
              }
            : phase
      );
      return {
        ...state,
        currentCycle: { ...state.currentCycle, phases: updatedPhases },
      };
    });
  },

  completePhase: (phaseId: string) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) return state;
      const updatedPhases = state.currentCycle.phases.map(
        (phase: SterilizationPhase) =>
          phase.id === phaseId
            ? {
                ...phase,
                isActive: false,
                endTime: new Date(),
                status: 'completed' as const,
              }
            : phase
      );
      return {
        ...state,
        currentCycle: { ...state.currentCycle, phases: updatedPhases },
      };
    });
  },

  pausePhase: (phaseId: string) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) return state;
      const updatedPhases = state.currentCycle.phases.map(
        (phase: SterilizationPhase) =>
          phase.id === phaseId
            ? { ...phase, isActive: false, status: 'paused' as const }
            : phase
      );
      return {
        ...state,
        currentCycle: { ...state.currentCycle, phases: updatedPhases },
      };
    });
  },

  resetPhase: (phaseId: string) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) return state;
      const updatedPhases = state.currentCycle.phases.map(
        (phase: SterilizationPhase) =>
          phase.id === phaseId
            ? {
                ...phase,
                isActive: false,
                startTime: null,
                endTime: null,
                status: 'pending' as const,
              }
            : phase
      );
      return {
        ...state,
        currentCycle: { ...state.currentCycle, phases: updatedPhases },
      };
    });
  },
});
