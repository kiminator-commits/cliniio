import { StateCreator } from 'zustand';
import {
  SterilizationPhase,
  SterilizationState,
} from '../types/sterilizationCycleTypes';
import { getNextPhaseId, getPhaseConfig } from '../utils/cycleUtils';
import { Tool } from '../../../types/toolTypes';
import { ToolActionsState } from '../toolActionsSlice';
import { ToolDataState } from '../toolDataSlice';

export const createToolActions: StateCreator<
  SterilizationState & ToolActionsState & ToolDataState,
  [],
  [],
  {
    moveToolToNextPhase: (toolId: string) => void;
  }
> = (set, get, _store) => ({
  moveToolToNextPhase: (toolId: string) => {
    set((state: SterilizationState) => {
      if (!state.currentCycle) return state;

      // Find the current phase that contains this tool
      const currentPhase = state.currentCycle.phases.find(
        (phase: SterilizationPhase) =>
          phase.tools.includes(toolId) && phase.isActive
      );

      if (!currentPhase) return state;

      // Determine the next phase based on current phase
      const nextPhaseId = getNextPhaseId(currentPhase.id);

      if (!nextPhaseId) {
        // Tool has completed all phases, increment cycle count
        const currentState = get();
        if (currentState.incrementToolCycleCount) {
          currentState.incrementToolCycleCount(toolId);
        }
        return state;
      }

      // Check if this is a P2 Status tool and it's completing the drying phase
      const currentState = get();
      const tool = currentState.availableTools.find(
        (t: Tool) => t.id === toolId
      );
      if (tool?.isP2Status && nextPhaseId === 'autoclave') {
        // P2 Status tools complete after drying, skip autoclave
        // Increment cycle count and mark as complete
        if (currentState.incrementToolCycleCount) {
          currentState.incrementToolCycleCount(toolId);
        }
        return state;
      }

      // Find or create the next phase
      let nextPhase = state.currentCycle.phases.find(
        (phase: SterilizationPhase) => phase.id === nextPhaseId
      );

      if (!nextPhase) {
        // Create the next phase if it doesn't exist
        const phaseConfig = getPhaseConfig(nextPhaseId);

        if (phaseConfig) {
          nextPhase = {
            id: nextPhaseId,
            name: phaseConfig.name,
            duration: phaseConfig.duration,
            tools: [],
            isActive: false,
            startTime: null,
            endTime: null,
            status: 'pending',
          };
        }
      }

      if (!nextPhase) return state;

      // Remove tool from current phase and add to next phase
      const updatedPhases = state.currentCycle.phases.map(
        (phase: SterilizationPhase) => {
          if (phase.id === currentPhase.id) {
            return {
              ...phase,
              tools: phase.tools.filter((id: string) => id !== toolId),
            };
          }
          if (phase.id === nextPhaseId) {
            return {
              ...phase,
              tools: [...phase.tools, toolId],
            };
          }
          return phase;
        }
      );

      // Add the new phase if it was created
      if (
        !state.currentCycle.phases.find(
          (phase: SterilizationPhase) => phase.id === nextPhaseId
        )
      ) {
        updatedPhases.push(nextPhase);
      }

      return {
        ...state,
        currentCycle: {
          ...state.currentCycle,
          phases: updatedPhases,
        },
      };
    });
  },
});
