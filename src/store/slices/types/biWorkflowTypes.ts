import { StateCreator } from 'zustand';
import { BIFailureIncident } from '../../../services/bi/failure';

/**
 * BI Test Result interface
 */
export interface BITestResult {
  id: string;
  toolId: string;
  passed: boolean;
  date: Date;
  status: 'pass' | 'fail' | 'skip' | 'pending';
  operatorId?: string;
  notes?: string;
  cycleId?: string;
}

/**
 * Activity Log Item interface
 */
export interface ActivityLogItem {
  id: string;
  type:
    | 'bi-test'
    | 'bi-failure'
    | 'cycle-complete'
    | 'tool-quarantine'
    | 'regulatory-notification'
    | 'tool-200-scans'
    | 'bath-1-change'
    | 'bath-2-change'
    | 'autoclave-cycle-started'
    | 'tool-problem-flagged'
    | 'batch-id-created';
  title: string;
  description?: string;
  time: Date;
  toolCount?: number;
  color: string;
  operatorId?: string;
  metadata?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

/**
 * Pending Change interface
 */
export interface PendingChange {
  id: string;
  type: 'bi-test' | 'bi-failure' | 'settings';
  data: unknown;
  timestamp: Date;
}

/**
 * BI Compliance Status interface
 */
export interface BIComplianceStatus {
  isCompliant: boolean;
  nextTestDue: Date | null;
  daysUntilDue: number;
  status: 'compliant' | 'due-soon' | 'overdue' | 'failed';
}

/**
 * Activity Summary interface
 */
export interface ActivitySummary {
  totalActivities: number;
  recentActivities: number;
  biTestCount: number;
  failureCount: number;
}

/**
 * BI Workflow State interface
 */
export interface BIWorkflowState {
  // Core BI Test State
  biTestCompleted: boolean;
  biTestDate: string | null;
  biTestResults: BITestResult[];
  nextBITestDue: Date | null;
  lastBITestDate: string | null;
  biTestPassed: boolean;
  biTestOptedOut: boolean;
  biTestInProgress: boolean;

  // BI Failure State
  biFailureActive: boolean;
  biFailureDetails: BIFailureIncident | null;
  biFailureHistory: BIFailureIncident[];
  biFailureLoading: boolean;
  biFailureError: string | null;

  // Activity Log
  activityLog: ActivityLogItem[];
  activityLogLoading: boolean;

  // Compliance Settings
  enforceBI: boolean;
  enforceCI: boolean;
  allowOverrides: boolean;
  complianceSettingsLoading: boolean;

  // Synchronization State
  isSyncing: boolean;
  lastSyncTime: Date | null;
  syncError: string | null;
  pendingChanges: PendingChange[];

  // Optimistic Updates
  optimisticUpdates: Map<string, unknown>;

  // Actions - BI Test Management
  setBiTestCompleted: (completed: boolean) => void;
  setBiTestDate: (date: string) => void;
  recordBITestResult: (result: Omit<BITestResult, 'id'>) => Promise<void>;
  setNextBITestDue: (date: Date) => void;
  setLastBITestDate: (date: string) => void;
  setBiTestPassed: (value: boolean) => void;
  setBiTestOptedOut: (optedOut: boolean) => void;
  setBiTestInProgress: (inProgress: boolean) => void;
  resetBIState: () => void;

  // Actions - BI Failure Management
  activateBIFailure: (details: {
    affectedToolsCount: number;
    affectedBatchIds: string[];
    operator: string;
    failureReason?: string;
    severity?: 'low' | 'medium' | 'high' | 'critical';
  }) => Promise<void>;
  deactivateBIFailure: () => Promise<void>;
  updateBIFailureStatus: (status: BIFailureIncident['status']) => Promise<void>;
  resolveBIFailure: (resolutionNotes?: string) => Promise<void>;
  getBIFailureHistory: () => Promise<void>;

  // Actions - Activity Log
  addActivity: (activity: Omit<ActivityLogItem, 'id'>) => void;
  clearActivityLog: () => void;
  loadActivityLog: () => Promise<void>;

  // Actions - Compliance Settings
  setEnforceBI: (value: boolean) => Promise<void>;
  setEnforceCI: (value: boolean) => Promise<void>;
  setAllowOverrides: (value: boolean) => Promise<void>;
  toggleEnforceBI: () => Promise<void>;
  toggleEnforceCI: () => Promise<void>;
  loadComplianceSettings: () => Promise<void>;

  // Actions - Synchronization
  syncWithSupabase: () => Promise<void>;
  syncBIFailureFromDatabase: (incident: unknown) => void;
  addPendingChange: (change: {
    type: 'bi-test' | 'bi-failure' | 'settings';
    data: unknown;
  }) => void;
  clearPendingChanges: () => void;
  retryFailedSync: () => Promise<void>;

  // Actions - Optimistic Updates
  addOptimisticUpdate: (key: string, data: unknown) => void;
  removeOptimisticUpdate: (key: string) => void;
  clearOptimisticUpdates: () => void;

  // Actions - State Persistence
  saveStateToLocalStorage: () => void;
  loadStateFromLocalStorage: () => void;
  clearLocalStorage: () => void;

  // Computed Values
  getBIComplianceStatus: () => BIComplianceStatus;
  getBIFailureRiskLevel: () => 'low' | 'medium' | 'high' | 'critical';
  getActivitySummary: () => ActivitySummary;
}

/**
 * Slice creator type
 */
export type BIWorkflowSliceCreator = StateCreator<
  BIWorkflowState,
  [],
  [],
  BIWorkflowState
>;
