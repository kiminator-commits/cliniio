import { supabase } from '../../lib/supabaseClient';

async function getCurrentFacilityId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: userData, error } = await supabase
    .from('users')
    .select('facility_id')
    .eq('id', user.id)
    .single();

  if (error || !userData) throw new Error('Failed to get user facility');
  return (userData as unknown as { facility_id: string }).facility_id;
}

export interface BatchInfo {
  batchId: string;
  batchName: string;
  cycleId?: string;
  cycleName?: string;
  status: 'preparing' | 'packaged' | 'in_cycle' | 'completed' | 'failed';
  packageType?: string;
  packageSize?: string;
  totalItems: number;
  createdBy: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface ToolBatchInfo {
  toolId: string;
  toolName: string;
  barcode: string;
  batchId: string;
  batchName: string;
  cycleId?: string;
  cycleName?: string;
  packageType?: string;
  packageSize?: string;
  status: string;
  lastSterilized?: Date;
  cycleCount: number;
}

// Define proper types for Supabase operations

// Define types for database table operations
interface SterilizationBatchRow {
  id: string;
  batch_name: string;
  batch_type: string;
  cycle_id?: string;
  status: 'preparing' | 'packaged' | 'in_cycle' | 'completed' | 'failed';
  package_count: number;
  total_items: number;
  requested_by: string;
  created_at: string;
  completed_at?: string;
}

interface SterilizationCycleRow {
  id: string;
  cycle_name: string;
  status: string;
  created_at: string;
  completed_at?: string;
}

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface ToolRow {
  id: string;
  tool_name: string;
  barcode: string;
  status: string;
  last_sterilized?: string;
  sterilization_count: number;
  created_at: string;
  updated_at: string;
}

interface ToolWithCycleRow {
  current_cycle_id: string | null;
  tool_name: string;
}

interface CycleWithTimesRow {
  id: string;
  cycle_name: string;
  status: string;
  start_time: string;
  end_time: string | null;
}

// Define types for Supabase join responses
interface _BatchItemWithBatch {
  batch_id: string;
  sterilization_batches: SterilizationBatchRow;
}

export class BatchTrackingService {
  /**
   * Get batch information for a specific tool
   */
  static async getBatchInfoForTool(toolId: string): Promise<BatchInfo | null> {
    try {
      // First, get the tool's current batch from sterilization_batches
      const { data: batchItem, error: batchItemError } = await supabase
        .from('sterilization_batches')
        .select('*')
        .eq('id', toolId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (batchItemError || !batchItem) {
        return null;
      }

      const batch = batchItem as unknown as SterilizationBatchRow;

      // Get cycle information if available
      let cycleName: string | undefined;
      if (batch.cycle_id) {
        const facilityId = await getCurrentFacilityId();
        const { data: cycle, error: cycleError } = await supabase
          .from('sterilization_cycles')
          .select('cycle_name')
          .eq('id', batch.cycle_id)
          .eq('facility_id', facilityId)
          .single();

        if (!cycleError && cycle) {
          const cycleData = cycle as unknown as SterilizationCycleRow;
          cycleName = cycleData.cycle_name;
        }
      }

      // Get user information
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', batch.requested_by)
        .single();

      const createdBy = userError
        ? 'Unknown'
        : (user as unknown as UserRow)?.full_name || 'Unknown';

      return {
        batchId: batch.id,
        batchName: batch.batch_name,
        cycleId: batch.cycle_id,
        cycleName,
        status: batch.status,
        totalItems: batch.total_items,
        createdBy,
        createdAt: new Date(batch.created_at),
        completedAt: batch.completed_at
          ? new Date(batch.completed_at)
          : undefined,
      };
    } catch (error) {
      console.error('Error getting batch info for tool:', error);
      return null;
    }
  }

  /**
   * Get comprehensive batch information for multiple tools
   */
  static async getBatchInfoForTools(
    toolIds: string[]
  ): Promise<ToolBatchInfo[]> {
    try {
      if (toolIds.length === 0) {
        return [];
      }

      // Get batch information for all tools
      const { data: batchItems, error: batchItemsError } = await supabase
        .from('sterilization_batches')
        .select('*')
        .in('id', toolIds)
        .order('created_at', { ascending: false });

      if (batchItemsError || !batchItems) {
        return [];
      }

      // Get tool information
      const facilityId = await getCurrentFacilityId();
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('id, tool_name, barcode, last_sterilized, sterilization_count')
        .in('id', toolIds)
        .eq('facility_id', facilityId);

      if (toolsError || !tools) {
        return [];
      }

      // Create a map of tool data
      const toolMap = new Map(
        (tools as unknown as ToolRow[]).map((tool) => [
          tool.id,
          {
            name: tool.tool_name,
            barcode: tool.barcode,
            lastSterilized: tool.last_sterilized,
            cycleCount: tool.sterilization_count,
          },
        ])
      );

      // Get cycle information for all batches
      const batchItemsData = batchItems as unknown as SterilizationBatchRow[];
      const cycleIds = Array.from(
        new Set(
          batchItemsData
            .map((item) => item.cycle_id)
            .filter(Boolean) as string[]
        )
      );
      const cycleMap = new Map<string, string>();

      if (cycleIds.length > 0) {
        const facilityId = await getCurrentFacilityId();
        const { data: cycles, error: cyclesError } = await supabase
          .from('sterilization_cycles')
          .select('id, cycle_name')
          .in('id', cycleIds)
          .eq('facility_id', facilityId);

        if (!cyclesError && cycles) {
          (cycles as unknown as SterilizationCycleRow[]).forEach((cycle) => {
            cycleMap.set(cycle.id, cycle.cycle_name);
          });
        }
      }

      // Combine the data
      return batchItemsData.map((item) => {
        const toolData = toolMap.get(item.id);

        return {
          toolId: item.id,
          toolName: (toolData?.name as string) || 'Unknown Tool',
          barcode: (toolData?.barcode as string) || 'Unknown',
          batchId: item.id,
          batchName: item.batch_name,
          cycleId: item.cycle_id,
          cycleName: item.cycle_id ? cycleMap.get(item.cycle_id) : undefined,
          status: item.status,
          lastSterilized: toolData?.lastSterilized
            ? new Date(toolData.lastSterilized)
            : undefined,
          cycleCount: (toolData?.cycleCount as number) || 0,
        };
      });
    } catch (error) {
      console.error('Error getting batch info for tools:', error);
      return [];
    }
  }

  /**
   * Get current batch for a tool from sterilization cycle data
   */
  static async getCurrentBatchFromCycle(
    toolId: string
  ): Promise<BatchInfo | null> {
    try {
      // Get the tool's current cycle
      const facilityId = await getCurrentFacilityId();
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('current_cycle_id, tool_name')
        .eq('id', toolId)
        .eq('facility_id', facilityId)
        .single();

      const toolData = tool as unknown as ToolWithCycleRow;
      if (toolError || !tool || !toolData.current_cycle_id) {
        return null;
      }

      // Get the cycle information
      const { data: cycle, error: cycleError } = await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', toolData.current_cycle_id)
        .eq('facility_id', facilityId)
        .single();

      if (cycleError || !cycle) {
        return null;
      }

      // Get the batch associated with this cycle
      const { data: batch, error: batchError } = await supabase
        .from('sterilization_batches')
        .select('*')
        .eq('cycle_id', toolData.current_cycle_id)
        .single();

      const cycleData = cycle as unknown as CycleWithTimesRow;
      if (batchError || !batch) {
        // If no batch exists, create a virtual batch from cycle data
        return {
          batchId: `VIRTUAL-${toolData.current_cycle_id}`,
          batchName: `Cycle ${cycleData.cycle_name || cycleData.id}`,
          cycleId: toolData.current_cycle_id,
          cycleName: cycleData.cycle_name,
          status: cycleData.status as
            | 'preparing'
            | 'packaged'
            | 'in_cycle'
            | 'completed'
            | 'failed',
          totalItems: 1, // We don't know the total for virtual batches
          createdBy: 'System',
          createdAt: new Date(cycleData.start_time),
          completedAt: cycleData.end_time
            ? new Date(cycleData.end_time)
            : undefined,
        };
      }

      // Get user information
      const batchData = batch as unknown as SterilizationBatchRow;
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', batchData.requested_by)
        .single();

      const userData = user as unknown as UserRow;
      const createdBy = userError
        ? 'Unknown'
        : userData?.full_name || 'Unknown';

      return {
        batchId: batchData.id,
        batchName: batchData.batch_name,
        cycleId: batchData.cycle_id || undefined,
        cycleName: cycleData.cycle_name,
        status: batchData.status,
        totalItems: batchData.total_items,
        createdBy,
        createdAt: new Date(batchData.created_at),
        completedAt: batchData.completed_at
          ? new Date(batchData.completed_at)
          : undefined,
      };
    } catch (error) {
      console.error('Error getting current batch from cycle:', error);
      return null;
    }
  }

  /**
   * Generate a batch ID from sterilization cycle data
   */
  static generateBatchIdFromCycleData(
    toolDetails: Record<string, unknown>
  ): string | null {
    try {
      // If tool has a cycle ID, use it to generate a batch ID
      if (toolDetails.cycleId) {
        return `BATCH-${toolDetails.cycleId}`;
      }

      // If tool has last sterilized date, generate a batch ID based on that
      if (toolDetails.lastSterilized) {
        const sterilizedDate = new Date(toolDetails.lastSterilized as string);
        const batchId = `BATCH-${sterilizedDate.getFullYear()}${String(sterilizedDate.getMonth() + 1).padStart(2, '0')}${String(sterilizedDate.getDate()).padStart(2, '0')}-${(toolDetails.id as string).slice(-4)}`;
        return batchId;
      }

      // If tool has a current cycle from the store
      if (toolDetails.currentCycleId) {
        return `BATCH-${toolDetails.currentCycleId}`;
      }

      return null;
    } catch (error) {
      console.error('Failed to generate batch ID from cycle data:', error);
      return null;
    }
  }

  /**
   * Get the most recent batch for a tool
   */
  static async getMostRecentBatchForTool(
    toolId: string
  ): Promise<BatchInfo | null> {
    try {
      // Try to get batch info from batch_items first
      let batchInfo = await this.getBatchInfoForTool(toolId);

      if (batchInfo) {
        return batchInfo;
      }

      // If no batch_items record, try to get from current cycle
      batchInfo = await this.getCurrentBatchFromCycle(toolId);

      if (batchInfo) {
        return batchInfo;
      }

      // If still no batch, generate one from tool data
      const facilityId = await getCurrentFacilityId();
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('tool_name, last_sterilized, sterilization_count')
        .eq('id', toolId)
        .eq('facility_id', facilityId)
        .single();

      if (toolError || !tool) {
        return null;
      }

      // Generate a virtual batch from tool data
      const toolData = tool as unknown as ToolRow;
      if (toolData.last_sterilized) {
        const sterilizedDate = new Date(toolData.last_sterilized);
        return {
          batchId: `VIRTUAL-${toolId}`,
          batchName: `Last Sterilization - ${toolData.tool_name}`,
          status: 'completed',
          totalItems: 1,
          createdBy: 'System',
          createdAt: sterilizedDate,
          completedAt: sterilizedDate,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting most recent batch for tool:', error);
      return null;
    }
  }
}
