import { StateCreator } from 'zustand';
import {
  SterilizationCycle,
  SterilizationState,
} from '../types/sterilizationCycleTypes';
import { createNewCycle } from '../utils/cycleUtils';
import { Tool } from '../../../types/toolTypes';
import { BIFacilityCycleService } from '../../../services/bi/BIFacilityCycleService';
import { ToolActionsState } from '../toolActionsSlice';
import { ToolDataState } from '../toolDataSlice';

/**
 * Creates cycle action functions for sterilization cycle management
 * @param set - Zustand state setter function
 * @param get - Zustand state getter function
 * @returns Object containing cycle action functions
 */
export const createCycleActions: StateCreator<
  SterilizationState & ToolActionsState & ToolDataState,
  [],
  [],
  {
    setCurrentCycle: (cycle: SterilizationCycle | null) => void;
    setError: (error: string | null) => void;
    startNewCycle: (operator: string) => void;
    addToolToCycle: (toolId: string) => void;
    loadCycles: (facilityId: string) => Promise<void>;
  }
> = (set, get, _store) => ({
  /**
   * Sets the current active sterilization cycle
   * @param cycle - The cycle to set as current, or null to clear
   */
  setCurrentCycle: (cycle: SterilizationCycle | null) =>
    set((state: SterilizationState) => ({ ...state, currentCycle: cycle })),

  /**
   * Sets an error message in the state
   * @param error - The error message to set, or null to clear
   */
  setError: (error: string | null) =>
    set((state: SterilizationState) => ({ ...state, error })),

  /**
   * Starts a new sterilization cycle with the specified operator
   * @param operator - The name of the operator starting the cycle
   */
  startNewCycle: (operator: string) => {
    const newCycle = createNewCycle(operator);
    set((state: SterilizationState) => ({ ...state, currentCycle: newCycle }));
  },

  /**
   * Adds a tool to the current sterilization cycle
   * @param toolId - The ID of the tool to add
   */
  addToolToCycle: (toolId: string) => {
    set((state: SterilizationState) => {
      const currentCycle = state.currentCycle;

      // Handle case where no cycle is currently active
      if (!currentCycle) {
        // Create a new cycle with the tool already included
        const newCycle = createNewCycle('Current Operator');
        newCycle.tools = [toolId];

        // Update the tool's status using the current state
        const currentState = get();
        if (currentState.updateToolStatus) {
          const tool = currentState.availableTools.find(
            (t: Tool) => t.id === toolId
          );
          if (tool) {
            currentState.updateToolStatus(toolId, 'bath1');
          }
        }

        return { ...state, currentCycle: newCycle };
      }

      // Handle case where a cycle already exists
      // Only add tool if it's not already in the cycle (prevent duplicates)
      if (!currentCycle.tools.includes(toolId)) {
        const updatedCycle = {
          ...currentCycle,
          tools: [...currentCycle.tools, toolId],
        };

        // Update the tool's status using the current state
        const currentState = get();
        if (currentState.updateToolStatus) {
          const tool = currentState.availableTools.find(
            (t: Tool) => t.id === toolId
          );
          if (tool) {
            currentState.updateToolStatus(toolId, 'bath1');
          }
        }

        return {
          ...state,
          currentCycle: updatedCycle,
        };
      }

      // Tool is already in cycle, no changes needed
      return state;
    });
  },

  loadCycles: async (facilityId: string) => {
    try {
      const dbCycles =
        await BIFacilityCycleService.getSterilizationCycles(facilityId);

      // Convert database cycles to store cycles
      const cycles: SterilizationCycle[] = dbCycles.map((dbCycle) => ({
        id: dbCycle.id,
        cycleNumber: dbCycle.cycle_number,
        phases: Array.isArray(dbCycle.phases)
          ? dbCycle.phases.map((phase) => ({
              id: phase.id,
              name: phase.name,
              duration: phase.duration,
              tools: Array.isArray(phase.tools)
                ? phase.tools.map((tool: unknown) => String(tool))
                : [],
              isActive: phase.isActive,
              startTime: phase.startTime ? new Date(phase.startTime) : null,
              endTime: phase.endTime ? new Date(phase.endTime) : null,
              status: phase.status,
            }))
          : [], // Default to empty array if phases is not an array
        tools: Array.isArray(dbCycle.tools)
          ? dbCycle.tools.map((tool) => tool.id)
          : [], // Default to empty array if tools is not an array
        operator: dbCycle.operator_id || 'Unknown',
        startTime: dbCycle.start_time
          ? new Date(dbCycle.start_time)
          : new Date(),
        completedAt: dbCycle.end_time || null,
        batchId: dbCycle.cycle_number,
      }));

      set((state: SterilizationState) => ({ ...state, cycles }));
    } catch (error) {
      console.error('Failed to load sterilization cycles:', error);
      set((state: SterilizationState) => ({
        ...state,
        error: error instanceof Error ? error.message : 'Failed to load cycles',
      }));
    }
  },
});
