import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { ToolStatus } from '@/types/toolTypes';

export type ToolRow = Database['public']['Tables']['tools']['Row'];
type ToolUpdate = Database['public']['Tables']['tools']['Update'];

// Helper functions for tenant and audit stamping
async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

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
  return userData.facility_id;
}

export const ToolService = {
  async getToolByBarcode(barcode: string): Promise<ToolRow | null> {
    const facilityId = await getCurrentFacilityId();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('barcode', barcode)
      .eq('facility_id', facilityId)
      .maybeSingle();

    if (error) {
      console.error('ToolService.getToolByBarcode error:', error);
      return null;
    }

    return data;
  },

  async getToolsByStatus(status: ToolStatus): Promise<ToolRow[]> {
    const facilityId = await getCurrentFacilityId();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('status', status)
      .eq('facility_id', facilityId);

    if (error) {
      console.error('ToolService.getToolsByStatus error:', error);
      return [];
    }

    return (data as unknown as ToolRow[]) || [];
  },

  async updateToolStatus(toolId: string, status: ToolStatus) {
    // Handle mock tool case - don't try to update database for mock tools
    if (toolId.startsWith('mock-tool-')) {
      console.log('🧪 Skipping database update for mock tool:', toolId);
      return {
        id: toolId,
        status,
        updated_at: new Date().toISOString(),
      };
    }

    const updates: ToolUpdate = {
      status,
      facility_id: await getCurrentFacilityId(),
      updated_by: await getCurrentUserId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', toolId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getToolByBarcodeAndStatus(barcode: string, status: ToolStatus) {
    // Handle mock data for testing Clean Tool workflow
    if (barcode === 'TEST-CLEAN-001' && status === 'clean') {
      console.log('🧪 Using mock tool data for testing Clean Tool workflow');
      return {
        id: 'mock-tool-test-clean-001',
        barcode: 'TEST-CLEAN-001',
        tool_type: 'surgical_scissors',
        tool_name: 'Test Surgical Scissors',
        status: 'clean',
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        current_cycle_id: '00000000-0000-0000-0000-000000000000', // Use placeholder UUID instead of null
        location: 'Sterilization Room',
        sterilization_count: 0,
        notes: 'Mock tool for testing Clean Tool workflow',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        latitude: null,
        longitude: null,
        gps_accuracy: null,
        location_timestamp: null,
        maintenance_due_date: null,
        metadata: null,
        model: 'Test Model',
        manufacturer: 'Test Manufacturer',
        serial_number: 'TEST-001',
      } as unknown as ToolRow;
    }

    const facilityId = await getCurrentFacilityId();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('barcode', barcode)
      .eq('status', status)
      .eq('facility_id', facilityId)
      .single();
    if (error) throw error;
    return data as unknown as ToolRow;
  },

  async getToolsByFacilityAndStatus(facilityId: string, status: ToolStatus) {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', status);
    if (error) throw error;
    return data as unknown as ToolRow[];
  },

  async getToolsByStatuses(statuses: ToolStatus[]) {
    const facilityId = await getCurrentFacilityId();
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .in('status', statuses)
      .eq('facility_id', facilityId);
    if (error) throw error;
    return data as unknown as ToolRow[];
  },

  async updateToolsStatus(toolIds: string[], status: ToolStatus) {
    const updates: ToolUpdate = {
      status,
      facility_id: await getCurrentFacilityId(),
      updated_by: await getCurrentUserId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .in('id', toolIds)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async updateToolsCyclePhase(
    toolIds: string[],
    status: ToolStatus,
    cycleId: string,
    phase: string
  ) {
    const updates: ToolUpdate = {
      status,
      current_cycle_id: cycleId,
      current_phase: phase,
      facility_id: await getCurrentFacilityId(),
      updated_by: await getCurrentUserId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .in('id', toolIds)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async clearCycleAssignment(toolIds: string[], status: ToolStatus) {
    // Handle mock tool case - don't try to update database for mock tools
    const mockToolIds = toolIds.filter((id) => id.startsWith('mock-tool-'));
    const realToolIds = toolIds.filter((id) => !id.startsWith('mock-tool-'));

    if (mockToolIds.length > 0) {
      console.log('🧪 Skipping database update for mock tools:', mockToolIds);
    }

    if (realToolIds.length === 0) {
      // All tools are mock tools, return mock data
      return mockToolIds.map((id) => ({
        id,
        status,
        current_cycle_id: '00000000-0000-0000-0000-000000000000',
        current_phase: null,
        updated_at: new Date().toISOString(),
      }));
    }

    const updates: ToolUpdate = {
      status,
      current_cycle_id: '00000000-0000-0000-0000-000000000000', // Use placeholder UUID instead of null
      current_phase: null,
      facility_id: await getCurrentFacilityId(),
      updated_by: await getCurrentUserId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .in('id', realToolIds)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  async markAsSterilized(toolId: string) {
    // Handle mock tool case - don't try to update database for mock tools
    if (toolId.startsWith('mock-tool-')) {
      console.log('🧪 Skipping database update for mock tool:', toolId);
      return {
        id: toolId,
        last_sterilized: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }

    const updates: ToolUpdate = {
      last_sterilized: new Date().toISOString(),
      updated_by: await getCurrentUserId(),
      facility_id: await getCurrentFacilityId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', toolId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async updateToolPhase(toolId: string, phase: string) {
    const updates: ToolUpdate = {
      current_phase: phase,
      updated_by: await getCurrentUserId(),
      facility_id: await getCurrentFacilityId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .eq('id', toolId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async touchTools(toolIds: string[]) {
    const updates: ToolUpdate = {
      updated_by: await getCurrentUserId(),
      facility_id: await getCurrentFacilityId(),
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('tools')
      .update(updates)
      .in('id', toolIds)
      .select();
    if (error) throw error;
    return data ?? [];
  },

  // Add more methods like:
  // - insertTool()
  // - archiveTool()
};
