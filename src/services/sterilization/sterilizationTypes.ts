import { ToolStatus } from '@/types/toolTypes';

export interface SterilizationPhase {
  name: string;
  duration: number;
  temperature?: number;
  pressure?: number;
  order: number;
  title: string;
}

export interface SterilizationCycle {
  id: string;
  cycleId: string;
  facilityId: string;
  cycleType: string;
  status: ToolStatus;
  startTime: Date;
  endTime?: Date;
  temperatureCelsius?: number;
  pressurePsi?: number;
  cycleName?: string;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCycleResult {
  success: boolean;
  message: string;
  cycle?: SterilizationCycle;
  error?: string;
}

export interface CycleCreationParams {
  toolIds: string[];
  cycleType: string;
  facilityId: string;
  userId: string;
  userName: string;
}

export interface CycleCompletionParams {
  cycleId: string;
  autoclaveReceiptId?: string;
  userId: string;
  userName: string;
}
