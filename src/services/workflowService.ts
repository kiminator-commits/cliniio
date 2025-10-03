import { supabase } from '../lib/supabaseClient';
import { ToolStatus } from '@/types/toolTypes';

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

export interface WorkflowSession {
  id: string;
  session_type: string;
  operator_name: string;
  status: ToolStatus;
  started_at: string;
  metadata?: Record<string, unknown>;
}

export interface WorkflowEvent {
  id: string;
  session_id: string;
  event_type: string;
  event_data: Record<string, unknown>;
  timestamp: string;
}

export class WorkflowService {
  // Start a new workflow session - COMMENTED OUT: table deleted
  // static async startSession(
  //   sessionType: string,
  //   operatorName: string,
  //   metadata?: Record<string, unknown>
  // ): Promise<WorkflowSession> {
  //   // Get the current authenticated user
  //   const {
  //     data: { user },
  //     error: authError,
  //   } = await supabase.auth.getUser();

  //   if (authError || !user) {
  //     throw new Error('User not authenticated. Please log in again.');
  //   }

  //   const { data, error } = await supabase
  //     .from('workflow_sessions')
  //     .insert({
  //       session_type: sessionType,
  //       operator_id: user.id,
  //       operator_name: operatorName,
  //       status: 'active',
  //       metadata: metadata || {},
  //     })
  //     .select()
  //     .single();

  //   if (error) throw new Error(`Failed to start session: ${error.message}`);
  //   return data as unknown as WorkflowSession;
  // }

  // End a workflow session - COMMENTED OUT: table deleted
  // static async endSession(sessionId: string): Promise<void> {
  //   const { error } = await supabase
  //     .from('workflow_sessions')
  //     .update({
  //       status: 'completed',
  //       ended_at: new Date().toISOString(),
  //     })
  //     .eq('id', sessionId);

  //   if (error) throw new Error(`Failed to end session: ${error.message}`);
  // }

  // Log a workflow event - COMMENTED OUT: table deleted
  // static async logEvent(
  //   sessionId: string,
  //   eventType: string,
  //   eventData?: Record<string, unknown>
  // ): Promise<WorkflowEvent> {
  //   // Get the current authenticated user
  //   const {
  //     data: { user },
  //     error: authError,
  //   } = await supabase.auth.getUser();

  //   if (authError || !user) {
  //     throw new Error('User not authenticated. Please log in again.');
  //   }

  //   const { data, error } = await supabase
  //     .from('workflow_events')
  //     .insert({
  //       session_id: sessionId,
  //       event_type: eventType,
  //       event_data: eventData || {},
  //       operator_id: user.id,
  //       timestamp: new Date().toISOString(),
  //     })
  //     .select()
  //     .single();

  //   if (error) throw new Error(`Failed to log event: ${error.message}`);
  //   return data as unknown as WorkflowEvent;
  // }

  // Add tool to workflow
  static async addTool(
    sessionId: string,
    toolId: string,
    toolName: string,
    barcode?: string,
    phase?: string
  ): Promise<void> {
    const facilityId = await getCurrentFacilityId();
    const { error } = await supabase.from('tools').insert({
      current_phase: phase,
      id: toolId,
      tool_name: toolName,
      barcode,
      status: 'active',
      facility_id: facilityId,
      current_cycle_id: sessionId,
    });

    if (error) throw new Error(`Failed to add tool: ${error.message}`);
  }

  // Get active sessions - COMMENTED OUT: table deleted
  // static async getActiveSessions(): Promise<WorkflowSession[]> {
  //   const { data, error } = await supabase
  //     .from('workflow_sessions')
  //     .select('*')
  //     .eq('status', 'active')
  //     .order('started_at', { ascending: false });

  //   if (error) throw new Error(`Failed to get sessions: ${error.message}`);
  //   return (data || []) as unknown as WorkflowSession[];
  // }
}
