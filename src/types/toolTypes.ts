import { Database } from '@/types/database.types';

export interface Tool {
  id: string;
  name: string;
  barcode: string;
  category: string;
  status: 'available' | 'in_cycle' | 'maintenance' | 'retired' | 'problem';
  lastSterilized?: string;
  cycleCount: number;
  maxCycles?: number;
  location?: string;
  notes?: string;
  type?: string;
  currentPhase?:
    | 'bath1'
    | 'bath2'
    | 'airDry'
    | 'autoclave'
    | 'complete'
    | 'failed'
    | string;
  startTime?: Date | null;
  endTime?: Date | null;
  phaseStartTime?: Date | null;
  phaseEndTime?: Date | null;
  biStatus?: 'pending' | 'pass' | 'fail' | 'in-progress';
  operator?: string;
  cycleId?: string;
  label?: string;
  problemType?: 'damaged' | 'improperly_cleaned' | 'worn_out' | 'other';
  problemNotes?: string;
  problemReportedBy?: string;
  problemReportedAt?: Date;
  isP2Status?: boolean; // Identifies tools that only go through Bath 1, Bath 2, and Drying (no autoclave)
}

// Simplified tool interface for testing - just barcode and name
export interface SimpleTool {
  barcode: string;
  name: string;
}

// Use tool_status enum directly from Supabase types
export type ToolStatus = Database['public']['Enums']['tool_status'];

export type ProblemType =
  | 'damaged'
  | 'improperly_cleaned'
  | 'worn_out'
  | 'other';

export interface BiologicalIndicator {
  id: string;
  name: string;
  lotNumber: string;
  expirationDate: string;
  testDate?: string;
  result?: 'pass' | 'fail' | 'pending';
  location: string;
  operator?: string;
  notes?: string;
}

export interface BITestResult {
  id: string;
  toolId: string;
  passed: boolean;
  date: Date;
  status: 'pass' | 'fail' | 'skip' | 'pending';
  operator?: string;
  notes?: string;
  cycleId?: string;
}
