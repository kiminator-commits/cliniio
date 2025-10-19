import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { useLoginStore } from '../../store/useLoginStore';
import { ToolService } from '@/services/tools/ToolService';
import { getCurrentFacilityId } from './SterilizationUtils';

export class SterilizationCycleCompleter {
  /**
   * Complete cycle and return tools to inventory
   */
  static async completeCycle(
    cycleId: string,
    autoclaveReceiptId?: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const authToken = useLoginStore.getState().authToken;
      if (!authToken) {
        throw new Error('User not authenticated');
      }

      // Get current user from Supabase
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('Failed to get current user');
      }

      const userId = user.id;
      const now = new Date().toISOString();

      // Get cycle
      const facilityId = await getCurrentFacilityId();
      const { data: cycle, error: cycleError } = (await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (cycleError || !cycle) {
        throw new Error('Cycle not found');
      }

      const typedCycle =
        cycle as unknown as Database['public']['Tables']['sterilization_cycles']['Row'];

      // Complete final phase - cycle_phases table does not exist
      const phaseError = null;

      if (phaseError) {
        throw new Error(
          `Failed to complete final phase: ${phaseError.message}`
        );
      }

      // Update cycle to completed
      const { error: cycleUpdateError } = await supabase
        .from('sterilization_cycles')
        .update({
          status: 'completed',
          end_time: now,
          updated_at: now,
        } as Database['public']['Tables']['sterilization_cycles']['Update'])
        .eq('id', cycleId)
        .eq('facility_id', facilityId);

      if (cycleUpdateError) {
        throw new Error(
          `Failed to complete cycle: ${cycleUpdateError?.message}`
        );
      }

      // Return all tools to available status
      const { data: tools, error: toolsError } = (await supabase
        .from('tools')
        .select('id, tool_name')
        .eq('current_cycle_id', cycleId)
        .eq('facility_id', facilityId)) as {
        data: Database['public']['Tables']['tools']['Row'][] | null;
        error;
      };

      if (toolsError) {
        throw new Error(`Failed to get cycle tools: ${toolsError?.message}`);
      }

      if (tools && tools.length > 0) {
        const toolIds = (
          tools as unknown as Database['public']['Tables']['tools']['Row'][]
        ).map((tool) => tool.id);

        // Update status using ToolService for each tool
        const toolUpdatePromises = toolIds.map((toolId) =>
          ToolService.updateToolStatus(toolId, 'clean')
        );
        await Promise.all(toolUpdatePromises);

        // Update additional fields that ToolService doesn't handle yet
        await ToolService.clearCycleAssignment(toolIds, 'clean');
      }

      // Create audit log for cycle completion
      await supabase.from('audit_logs').insert({
        user_id: userId,
        facility_id: typedCycle.facility_id,
        module: 'sterilization',
        action: 'cycle_completed',
        table_name: 'sterilization_cycles',
        record_id: cycleId,
        old_values: { status: typedCycle.status },
        new_values: { status: 'completed', end_time: now },
        metadata: {
          cycle_id: cycleId,
          tools_returned: tools?.length || 0,
          autoclave_receipt_id: autoclaveReceiptId,
        },
      } as Database['public']['Tables']['audit_logs']['Insert']);

      return {
        success: true,
        message: `Cycle completed successfully. ${tools?.length || 0} tool(s) returned to inventory.`,
      };
    } catch (error) {
      console.error('Error completing cycle:', error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : 'Failed to complete cycle',
      };
    }
  }
}
