import { supabase } from '../../lib/supabaseClient';
import { Database } from '@/types/database.types';
import { ToolStatus } from './types/sterilizationTypes';

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

/**
 * Sterilization Tool Service - Handles tool management operations
 */
export class ToolService {
  /**
   * Get tools in a cycle
   */
  static async getToolsInCycle(cycleId: string): Promise<ToolStatus[]> {
    try {
      const facilityId = await getCurrentFacilityId();
      const { data: tools, error } = await supabase
        .from('tools')
        .select('*')
        .eq('current_cycle_id', cycleId)
        .eq('facility_id', facilityId);

      if (error) {
        throw new Error(`Failed to fetch cycle tools: ${error.message}`);
      }

      return (
        (tools as unknown as Database['public']['Tables']['tools']['Row'][]) ||
        []
      ).map((tool) => {
        return {
          id: tool.id,
          name: tool.tool_name,
          barcode: tool.barcode,
          toolType: tool.tool_type,
          priority: tool.priority as unknown as 'P1' | 'P2',
          status: tool.status,
          currentPhase: tool.current_phase,
          currentCycleId: tool.current_cycle_id,
        };
      });
    } catch (error) {
      console.error('Error fetching cycle tools:', error);
      return [];
    }
  }
}
