// Sterilization Service - Thin facade that aggregates functionality from providers
import { Tool } from '../types/sterilizationTypes';
import { WorkflowType } from '../config/workflowConfig';

// Re-export all functionality from provider modules
export { ToolService } from './sterilization/SterilizationToolProvider';
export { BatchTrackingService } from './sterilization/SterilizationBatchProvider';
export {
  SterilizationCycleService,
  loadDirtyToolsForCycle,
} from './sterilization/SterilizationCycleProvider';
export { SterilizationPhaseService } from './sterilization/SterilizationPhaseProvider';
export { TransactionManager } from './sterilization/SterilizationTransactionProvider';

// Re-export types from provider modules
export type {
  BatchInfo,
  ToolBatchInfo,
} from './sterilization/SterilizationBatchProvider';
export type {
  CreateCycleResult,
  SterilizationPhase,
} from './sterilization/SterilizationCycleProvider';
export type {
  CyclePhase,
  PhaseTransitionResult,
} from './sterilization/SterilizationPhaseProvider';
export type {
  SterilizationCycleData,
  TransactionResult,
  SterilizationCycleTransactionData,
} from './sterilization/SterilizationTransactionProvider';

// Legacy interfaces for backward compatibility
export interface SterilizationCycle {
  id: string;
  batchId: string;
  phase: string;
  startTime: string;
  endTime: string;
}

export interface ScanResult {
  success: boolean;
  message: string;
  tool?: Tool;
}

export class SterilizationService {
  static scanTool(workflow: WorkflowType, availableTools: Tool[]): ScanResult {
    // Ensure we always find a valid tool by selecting from available tools
    const availableBarcodes = availableTools.map((t) => t.barcode);
    const barcode =
      availableBarcodes[Math.floor(Math.random() * availableBarcodes.length)];
    const tool = availableTools.find((t) => t.barcode === barcode);

    if (!tool) {
      return {
        success: false,
        message: 'No tools available for scanning',
      };
    }

    return {
      success: true,
      message: `Successfully processed ${tool.name} for ${workflow} workflow`,
      tool,
    };
  }
}
