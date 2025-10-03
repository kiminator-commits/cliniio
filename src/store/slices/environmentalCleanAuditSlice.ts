import { StateCreator } from 'zustand';

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  details: Record<string, unknown>;
}

export interface EnvironmentalCleanAuditState {
  logs: AuditLogEntry[];
  addAuditLog: (action: string, details: Record<string, unknown>) => void;
}

export const createEnvironmentalCleanAuditSlice: StateCreator<
  EnvironmentalCleanAuditState
> = (set, get) => ({
  logs: [],
  addAuditLog: (action, details) => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    set({ logs: [...get().logs, entry] });
  },
});
