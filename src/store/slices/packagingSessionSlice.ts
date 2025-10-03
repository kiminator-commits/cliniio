import { StateCreator } from 'zustand';
import { Tool } from '../../types/sterilizationTypes';

export interface PackagingSession {
  id: string;
  operator: string;
  startTime: Date;
  status: 'active' | 'completed' | 'cancelled';
  scannedTools: Tool[];
  isBatchMode: boolean;
  currentBatchId?: string | null;
}

export interface PackagingSessionState {
  // Session state
  currentPackagingSession: PackagingSession | null;
  sessionLoading: boolean;
  sessionError: string | null;

  // Actions
  startPackagingSession: (
    operator: string,
    isBatchMode?: boolean,
    batchId?: string
  ) => void;
  endPackagingSession: () => void;
  addToolToSession: (toolId: string) => void;
  removeToolFromSession: (toolId: string) => void;
  clearSessionError: () => void;
}

export const createPackagingSessionSlice: StateCreator<
  PackagingSessionState,
  [],
  [],
  PackagingSessionState
> = (set, get) => ({
  currentPackagingSession: null,
  sessionLoading: false,
  sessionError: null,

  startPackagingSession: (
    operator: string,
    isBatchMode = false,
    batchId?: string
  ) => {
    const session: PackagingSession = {
      id: `session_${Date.now()}`,
      operator,
      startTime: new Date(),
      status: 'active',
      scannedTools: [],
      isBatchMode,
      currentBatchId: batchId || null,
    };
    set({
      currentPackagingSession: session,
      sessionError: null,
    });
  },

  endPackagingSession: () => {
    set({ currentPackagingSession: null });
  },

  addToolToSession: (toolId: string) => {
    const currentSession = get().currentPackagingSession;
    if (currentSession) {
      // Note: In a real implementation, you'd fetch the tool details from the database
      const updatedSession = {
        ...currentSession,
        scannedTools: [...currentSession.scannedTools, { id: toolId } as Tool],
      };
      set({ currentPackagingSession: updatedSession });
    }
  },

  removeToolFromSession: (toolId: string) => {
    const currentSession = get().currentPackagingSession;
    if (currentSession) {
      const updatedSession = {
        ...currentSession,
        scannedTools: currentSession.scannedTools.filter(
          (tool) => tool.id !== toolId
        ),
      };
      set({ currentPackagingSession: updatedSession });
    }
  },

  clearSessionError: () => {
    set({ sessionError: null });
  },
});
