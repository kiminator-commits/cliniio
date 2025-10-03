import { supabase } from '../lib/supabaseClient';
import { Database } from '@/types/database.types';
import { Json } from '../types/supabase';
import { ToolService as CoreToolService } from './tools/ToolService';

// Import Tool interface from main types to avoid conflicts
import { Tool } from '@/types/toolTypes';

export interface ToolScanResult {
  success: boolean;
  message: string;
  tool?: Tool;
}

// Define proper types for Supabase operations
// Note: These types are defined for future use and consistency
// type SupabaseClientType = SupabaseClient<Database>;
// type SupabaseError = {
//   message: string;
//   details?: string;
//   hint?: string;
//   code?: string;
// };

// Define types for database table operations
interface ToolRow {
  id: string;
  tool_name: string;
  barcode: string;
  category?: string; // Made optional as it may not exist in database
  tool_type?: string;
  status:
    | 'available'
    | 'in_cycle'
    | 'maintenance'
    | 'retired'
    | 'problem'
    | 'quarantine';
  location?: string;
  sterilization_count: number;
  last_sterilized?: string;
  notes?: string;
  facility_id: string;
  current_cycle_id?: string;
  created_at: string;
  updated_at: string;
}

interface SterilizationCycleRow {
  id: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  completed_at?: string;
}

interface AuditLogInsert {
  user_id?: string;
  facility_id: string;
  module: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: Json;
  new_values: Json;
  metadata: Json;
  created_at?: string;
  updated_at?: string;
}

export class ToolService {
  /**
   * Scan a tool by barcode and update its status to 'in_cycle' (dirty)
   */
  static async scanToolForCleanWorkflow(
    barcode: string,
    operatorId?: string
  ): Promise<ToolScanResult> {
    try {
      // First, find the tool by barcode and status
      let tool;
      try {
        tool = await CoreToolService.getToolByBarcodeAndStatus(
          barcode,
          'clean'
        );

        if (!tool) {
          return {
            success: false,
            message: `Tool with barcode "${barcode}" not found or not available for sterilization.`,
          };
        }
      } catch {
        return {
          success: false,
          message: `Tool with barcode "${barcode}" not found or not available for sterilization.`,
        };
      }

      // Check if tool is in 'complete' phase (ready to be marked as dirty)
      if (tool.current_cycle_id) {
        // Get the current cycle status
        const { data: cycle } = await supabase
          .from('sterilization_cycles')
          .select('status')
          .eq('id', tool.current_cycle_id)
          .single();

        if (
          (cycle as unknown as SterilizationCycleRow)?.status !== 'completed'
        ) {
          return {
            success: false,
            message: `Tool "${(tool as ToolRow).tool_name}" is not ready for clean workflow. Current cycle status: ${(cycle as unknown as SterilizationCycleRow)?.status || 'unknown'}`,
          };
        }
      }

      // Update tool status to 'in_cycle' (dirty) and set current_cycle_id to null
      const updatedTool = await CoreToolService.updateToolStatus(
        (tool as ToolRow).id,
        'dirty'
      );

      // Update additional fields that CoreToolService doesn't handle yet
      await CoreToolService.clearCycleAssignment(
        [(tool as ToolRow).id],
        'dirty'
      );

      // Update last_sterilized separately since clearCycleAssignment doesn't handle it
      await CoreToolService.markAsSterilized((tool as ToolRow).id);

      // Create audit log entry
      const auditLogData: AuditLogInsert = {
        user_id: operatorId,
        facility_id: (tool as ToolRow).facility_id,
        module: 'sterilization',
        action: 'tool_scanned_clean_workflow',
        table_name: 'sterilization_tools',
        record_id: (tool as ToolRow).id,
        old_values: {
          status: 'available',
          current_cycle_id: (tool as ToolRow).current_cycle_id,
        } as Json,
        new_values: {
          status: 'in_cycle',
          current_cycle_id: null,
        } as Json,
        metadata: {
          barcode: barcode,
          workflow: 'clean',
          previous_phase: 'complete',
          new_phase: 'dirty',
        } as Json,
      };

      await supabase
        .from('audit_logs')
        .insert(
          auditLogData as Database['public']['Tables']['audit_logs']['Insert']
        );

      // Convert to Tool format
      const toolData = updatedTool as ToolRow;
      const sterilizationTool: Tool = {
        id: toolData.id,
        name: toolData.tool_name,
        barcode: toolData.barcode,
        category: toolData.category || 'general',
        type: toolData.tool_type,
        currentPhase: 'failed', // This represents 'dirty' in the UI
        status: toolData.status as
          | 'available'
          | 'maintenance'
          | 'retired'
          | 'in_cycle'
          | 'problem',
        location: toolData.location,
        cycleCount: toolData.sterilization_count || 0,
        lastSterilized: toolData.last_sterilized,
        notes: toolData.notes,
      };

      return {
        success: true,
        message: `Successfully scanned tool "${toolData.tool_name}" and marked as dirty. Ready for sterilization.`,
        tool: sterilizationTool,
      };
    } catch (error) {
      console.error('Error scanning tool for clean workflow:', error);
      return {
        success: false,
        message: 'An unexpected error occurred while scanning the tool.',
      };
    }
  }

  /**
   * Scan a tool by barcode and mark it as having a problem
   * This is part of the Clean Workflow - tool was scanned but found to be unusable
   */
  static async scanToolForProblemWorkflow(
    barcode: string,
    problemType: string,
    problemNotes: string,
    operatorId?: string
  ): Promise<ToolScanResult> {
    try {
      // Find the tool by barcode (any status)
      const { data: tool, error: findError } = await supabase
        .from('tools')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (findError || !tool) {
        return {
          success: false,
          message: `Tool with barcode "${barcode}" not found in system.`,
        };
      }

      const toolData = tool as unknown as ToolRow;

      // Get the last sterilization cycle for process improvement analysis
      let lastCycleInfo: SterilizationCycleRow | null = null;
      if (toolData.current_cycle_id) {
        const { data: cycle } = await supabase
          .from('sterilization_cycles')
          .select('*')
          .eq('id', toolData.current_cycle_id)
          .single();
        lastCycleInfo = cycle as unknown as SterilizationCycleRow;
      }

      // Update tool status to 'quarantine' (problem)
      const updatedTool = await CoreToolService.updateToolStatus(
        toolData.id,
        'problem'
      );

      // Update additional fields that CoreToolService doesn't handle yet
      await CoreToolService.clearCycleAssignment([toolData.id], 'problem');

      // Update notes separately since clearCycleAssignment doesn't handle it
      const { error: updateError } = await supabase
        .from('tools')
        .update({
          updated_at: new Date().toISOString(),
          notes: `PROBLEM: ${problemType} - ${problemNotes}`,
        } as Database['public']['Tables']['tools']['Update'])
        .eq('id', toolData.id);

      if (updateError) {
        console.error('Failed to update tool status:', updateError);
        return {
          success: false,
          message: 'Failed to update tool status. Please try again.',
        };
      }

      // Create comprehensive audit log for process improvement
      const auditLogData: AuditLogInsert = {
        user_id: operatorId,
        facility_id: toolData.facility_id,
        module: 'sterilization',
        action: 'tool_scanned_problem_workflow',
        table_name: 'sterilization_tools',
        record_id: toolData.id,
        old_values: {
          status: toolData.status,
          current_cycle_id: toolData.current_cycle_id,
          sterilization_count: toolData.sterilization_count,
          last_sterilized: toolData.last_sterilized,
        } as Json,
        new_values: {
          status: 'quarantine',
          current_cycle_id: null,
          notes: `PROBLEM: ${problemType} - ${problemNotes}`,
        } as Json,
        metadata: {
          barcode: barcode,
          workflow: 'problem',
          problem_type: problemType,
          problem_notes: problemNotes,
          previous_phase: 'clean_workflow_scan',
          new_phase: 'quarantine',
          last_cycle_id: toolData.current_cycle_id,
          last_cycle_status: lastCycleInfo?.status,
          last_cycle_completed: lastCycleInfo?.completed_at,
          sterilization_count_at_problem: toolData.sterilization_count,
          process_improvement_flag: true,
          inspection_quality_issue:
            problemType.includes('damage') ||
            problemType.includes('inspection'),
          cleaning_quality_issue:
            problemType.includes('cleaning') ||
            problemType.includes('contamination'),
        } as Json,
      };

      await supabase
        .from('audit_logs')
        .insert(
          auditLogData as Database['public']['Tables']['audit_logs']['Insert']
        );

      // Convert to Tool format
      const updatedToolData = updatedTool as ToolRow;
      const sterilizationTool: Tool = {
        id: updatedToolData.id,
        name: updatedToolData.tool_name,
        barcode: updatedToolData.barcode,
        category: updatedToolData.category || 'general',
        type: updatedToolData.tool_type,
        currentPhase: 'quarantine',
        status: updatedToolData.status as
          | 'available'
          | 'maintenance'
          | 'retired'
          | 'in_cycle'
          | 'problem',
        location: updatedToolData.location,
        cycleCount: updatedToolData.sterilization_count || 0,
        lastSterilized: updatedToolData.last_sterilized,
        notes: updatedToolData.notes,
      };

      return {
        success: true,
        message: `Tool "${updatedToolData.tool_name}" marked as problem (${problemType}). Process improvement data collected.`,
        tool: sterilizationTool,
      };
    } catch (error) {
      console.error('Error scanning tool for problem workflow:', error);
      return {
        success: false,
        message:
          'An unexpected error occurred while processing the problem tool.',
      };
    }
  }

  /**
   * Get all available tools for a facility
   */
  static async getAvailableTools(facilityId: string): Promise<Tool[]> {
    try {
      const facilityTools = await CoreToolService.getToolsByFacilityAndStatus(
        facilityId,
        'clean'
      );
      // Sort since ToolService doesn't handle sorting yet
      const sortedTools = facilityTools.sort((a, b) =>
        (a.tool_name || '').localeCompare(b.tool_name || '')
      );

      return sortedTools.map((tool): Tool => {
        const toolData = tool as ToolRow;
        return {
          id: toolData.id,
          name: toolData.tool_name,
          barcode: toolData.barcode,
          category: toolData.category || 'general',
          type: toolData.tool_type,
          currentPhase: toolData.current_cycle_id ? 'complete' : 'available',
          status: toolData.status as
            | 'available'
            | 'maintenance'
            | 'retired'
            | 'in_cycle'
            | 'problem',
          location: toolData.location,
          cycleCount: toolData.sterilization_count || 0,
          lastSterilized: toolData.last_sterilized,
          notes: toolData.notes,
        };
      });
    } catch (error) {
      console.error('Error fetching available tools:', error);
      return [];
    }
  }
}
