import { StateCreator } from 'zustand';
import { SterilizationCycle } from './sterilizationCycleSlice';

export interface SterilizationTool {
  id: string;
  name: string;
  barcode: string;
  currentPhase: 'bath1' | 'bath2' | 'airDry' | 'autoclave' | 'complete' | 'failed';
  startTime: Date | null;
  endTime: Date | null;
  phaseStartTime: Date | null;
  phaseEndTime: Date | null;
  biStatus: 'pending' | 'pass' | 'fail' | 'in-progress';
  notes: string;
  operator: string;
  cycleId: string;
}

export interface ToolManagementState {
  availableTools: SterilizationTool[];
  currentCycle: SterilizationCycle | null;
  addToolToCycle: (toolId: string) => void;
}

export const createToolManagementSlice: StateCreator<
  ToolManagementState,
  [],
  [],
  ToolManagementState
> = set => ({
  availableTools: [
    {
      id: '1',
      name: 'Scalpel #1',
      barcode: 'SCAL001',
      currentPhase: 'complete',
      startTime: null,
      endTime: null,
      phaseStartTime: null,
      phaseEndTime: null,
      biStatus: 'pass',
      notes: '',
      operator: '',
      cycleId: '',
    },
    {
      id: '2',
      name: 'Forceps #1',
      barcode: 'FORC001',
      currentPhase: 'complete',
      startTime: null,
      endTime: null,
      phaseStartTime: null,
      phaseEndTime: null,
      biStatus: 'pass',
      notes: '',
      operator: '',
      cycleId: '',
    },
    {
      id: '3',
      name: 'Retractor #1',
      barcode: 'RETR001',
      currentPhase: 'complete',
      startTime: null,
      endTime: null,
      phaseStartTime: null,
      phaseEndTime: null,
      biStatus: 'pass',
      notes: '',
      operator: '',
      cycleId: '',
    },
  ],
  currentCycle: null,
  addToolToCycle: (toolId: string) =>
    set(state => ({
      currentCycle: state.currentCycle
        ? {
            ...state.currentCycle,
            tools: [...state.currentCycle.tools, toolId],
          }
        : null,
    })),
});
