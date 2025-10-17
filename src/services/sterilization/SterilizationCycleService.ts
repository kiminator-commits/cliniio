import { ToolService, ToolRow } from '@/services/tools/ToolService';
import { SterilizationCycleCreator } from './SterilizationCycleCreator';
import { SterilizationCycleRetriever } from './SterilizationCycleRetriever';
import { SterilizationCycleCompleter } from './SterilizationCycleCompleter';
import { SterilizationCycle, CreateCycleResult } from './sterilizationTypes';

/**
 * Main SterilizationCycleService - now acts as a facade for modular components
 */
export class SterilizationCycleService {
  /**
   * Create a new sterilization cycle and assign tools to it using transactions
   */
  static async createCycleWithTransaction(
    toolIds: string[],
    cycleType: string = 'routine',
    notes?: string
  ): Promise<CreateCycleResult> {
    return SterilizationCycleCreator.createCycleWithTransaction(
      toolIds,
      cycleType,
      notes
    );
  }

  /**
   * Create a new sterilization cycle and assign tools to it (legacy method)
   */
  static async createCycleAndAssignTools(
    toolIds: string[],
    cycleType: string = 'routine',
    notes?: string
  ): Promise<CreateCycleResult> {
    return SterilizationCycleCreator.createCycleAndAssignTools(
      toolIds,
      cycleType,
      notes
    );
  }

  /**
   * Get a sterilization cycle by ID
   */
  static async getCycleById(
    cycleId: string
  ): Promise<SterilizationCycle | null> {
    return SterilizationCycleRetriever.getCycleById(cycleId);
  }

  /**
   * Complete cycle and return tools to inventory
   */
  static async completeCycle(
    cycleId: string,
    autoclaveReceiptId?: string
  ): Promise<{ success: boolean; message: string }> {
    return SterilizationCycleCompleter.completeCycle(
      cycleId,
      autoclaveReceiptId
    );
  }
}

/**
 * Load dirty tools for cycle assignment
 */
export async function loadDirtyToolsForCycle(): Promise<ToolRow[]> {
  try {
    const dirtyTools = await ToolService.getToolsByStatus('dirty');
    return dirtyTools;
  } catch (error) {
    console.error('Failed to load dirty tools:', error);
    return [];
  }
}

// Re-export types for backward compatibility
export type {
  SterilizationCycle,
  CreateCycleResult,
} from './sterilizationTypes';
export type { SterilizationPhase } from './sterilizationTypes';
