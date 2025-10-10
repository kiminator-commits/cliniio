// ✅ PackagingSessionSlice: handles tool batching, batch ID generation, and operator context

import { StateCreator } from 'zustand';

export interface PackagingSession {
  id: string; // Unique session ID
  operatorName: string; // Operator performing packaging
  facilityId: string; // Tenant/facility context
  currentBatchId?: string; // Generated batch code (e.g., PKG-1234)
  scannedTools: string[]; // Array of tool barcodes
  startedAt: string; // ISO timestamp
}

export interface PackagingSessionSlice {
  currentSession: PackagingSession | null;
  startPackagingSession: (operatorName: string, facilityId: string) => void;
  addToolToSession: (barcode: string) => void;
  removeToolFromSession: (barcode: string) => void;
  generateBatchId: () => string;
  assignBatchIdToSession: (batchId: string) => void;
  endPackagingSession: () => void;
  resetPackagingSession: () => void;
}

export const createPackagingSessionSlice: StateCreator<
  PackagingSessionSlice,
  [],
  [],
  PackagingSessionSlice
> = (set, get) => ({
  currentSession: null,

  startPackagingSession: (operatorName, facilityId) => {
    const session: PackagingSession = {
      id: crypto.randomUUID(),
      operatorName,
      facilityId,
      scannedTools: [],
      startedAt: new Date().toISOString(),
    };
    set({ currentSession: session });
  },

  addToolToSession: (barcode) => {
    const session = get().currentSession;
    if (!session) return;
    if (!session.scannedTools.includes(barcode)) {
      session.scannedTools.push(barcode);
      set({ currentSession: { ...session } });
    }
  },

  removeToolFromSession: (barcode) => {
    const session = get().currentSession;
    if (!session) return;
    session.scannedTools = session.scannedTools.filter((t) => t !== barcode);
    set({ currentSession: { ...session } });
  },

  generateBatchId: () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `PKG-${randomNum}`;
  },

  assignBatchIdToSession: (batchId) => {
    const session = get().currentSession;
    if (!session) return;
    session.currentBatchId = batchId;
    set({ currentSession: { ...session } });
  },

  endPackagingSession: () => {
    set({ currentSession: null });
  },

  resetPackagingSession: () => {
    set({ currentSession: null });
  },
});
