import { supabase } from '../../lib/supabaseClient';
import { Database, Json } from '../../types/database.types';
import {
  Facility,
  Operator,
  SterilizationCycle,
  SterilizationPhase,
  Tool,
  CycleParameters,
  EnvironmentalFactors,
  Equipment,
  // MaintenanceSchedule,
  // PerformanceMetrics,
  ComplianceAudit,
  AuditFinding,
  CorrectiveAction,
} from '../../types/biWorkflowTypes';

// Use proper Supabase generated types
type UserRow = Database['public']['Tables']['users']['Row'];
type SterilizationCycleRow =
  Database['public']['Tables']['sterilization_cycles']['Row'];
type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];

/**
 * BI Facility and Cycle Service - Handles facilities, operators, cycles, and equipment
 */
export class BIFacilityCycleService {
  private static cache: Map<
    string,
    { data: SterilizationCycle[]; timestamp: number }
  > = new Map();
  private static CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  /**
   * Get all facilities (mock implementation since facilities table doesn't exist)
   */
  static async getFacilities(): Promise<Facility[]> {
    // Since there's no facilities table, return a default facility
    // In a real implementation, you might want to create a facilities table
    return [
      {
        id: 'default-facility',
        name: 'Default Facility',
        facility_code: 'DF001',
        address: undefined,
        contact_email: undefined,
        contact_phone: undefined,
        compliance_requirements: {},
        settings: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
  }

  /**
   * Get operators for a facility
   */
  static async getOperators(facilityId: string): Promise<Operator[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('first_name');

    if (error) {
      throw new Error(`Failed to fetch operators: ${error.message}`);
    }

    return ((data as UserRow[]) || []).map((item: UserRow) => ({
      id: item.id || '',
      facility_id: item.facility_id,
      user_id: item.id || undefined,
      name:
        item.full_name ||
        `${item.first_name || ''} ${item.last_name || ''}`.trim(),
      email: item.email || undefined,
      role:
        ((item.preferences as { role?: string })?.role as
          | 'operator'
          | 'supervisor'
          | 'admin') || 'operator',
      certification_number:
        (item.preferences as { certification_number?: string })
          ?.certification_number || undefined,
      certification_expiry:
        (item.preferences as { certification_expiry?: string })
          ?.certification_expiry || undefined,
      permissions:
        (item.preferences as { permissions?: Record<string, unknown> })
          ?.permissions || {},
      performance_metrics:
        (item.preferences as { performance_metrics?: Record<string, unknown> })
          ?.performance_metrics || {},
      is_active: item.is_active || false,
      created_at: item.created_at || '',
      updated_at: item.updated_at || '',
    })) as Operator[];
  }

  /**
   * Get sterilization cycles for a facility
   */
  static async getSterilizationCycles(
    facilityId: string,
    limit: number = 50
  ): Promise<SterilizationCycle[]> {
    const cacheKey = `${facilityId}-${limit}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    // Optimize query - only select fields needed for analytics
    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select(
        'id, cycle_number, start_time, end_time, status, parameters, tools'
      )
      .eq('facility_id', facilityId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch sterilization cycles: ${error.message}`);
    }

    const cycles = ((data as SterilizationCycleRow[]) || []).map(
      (item: SterilizationCycleRow) => ({
        id: item.id,
        facility_id: item.facility_id || '',
        operator_id: item.operator_id || undefined,
        cycle_number: item.cycle_number || '',
        cycle_type:
          (item.cycle_type as 'standard' | 'express' | 'custom') || 'standard',
        status:
          (item.status as
            | 'pending'
            | 'in_progress'
            | 'completed'
            | 'failed'
            | 'cancelled') || 'pending',
        start_time: item.start_time || '',
        end_time: item.end_time || undefined,
        phases: (item.parameters as unknown as SterilizationPhase[]) || [],
        tools: (item.tools as unknown as Tool[]) || [],
        cycle_parameters: (item.parameters as CycleParameters) || {},
        environmental_factors: (item.results as EnvironmentalFactors) || {},
        notes: item.notes || undefined,
        created_at: item.created_at || '',
        updated_at: item.updated_at || '',
      })
    ) as SterilizationCycle[];

    // Cache the result
    this.cache.set(cacheKey, { data: cycles, timestamp: Date.now() });

    return cycles;
  }

  /**
   * Create a new sterilization cycle
   */
  static async createSterilizationCycle(
    cycleData: Partial<SterilizationCycle>
  ): Promise<SterilizationCycle> {
    const cycleNumber = await this.generateCycleNumber(cycleData.facility_id!);

    const insertData: Database['public']['Tables']['sterilization_cycles']['Insert'] =
      {
        id: crypto.randomUUID(),
        facility_id: cycleData.facility_id!,
        operator_id: cycleData.operator_id || '',
        cycle_type: cycleData.cycle_type || 'standard',
        cycle_number: cycleNumber,
        start_time: new Date().toISOString(),
        status: cycleData.status || 'pending',
        parameters: (cycleData.cycle_parameters as unknown as Json) || {},
        results: (cycleData.environmental_factors as unknown as Json) || {},
        tools: (cycleData.tools as unknown as Json) || [],
        notes: cycleData.notes,
        autoclave_id: 'default-autoclave', // Default autoclave ID
        tool_batch_id: 'default-batch', // Default batch ID
      };

    const { data, error } = await supabase
      .from('sterilization_cycles')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create sterilization cycle: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from sterilization cycle creation');
    }

    const cycleRow = data as SterilizationCycleRow;
    return {
      id: cycleRow.id,
      facility_id: cycleRow.facility_id || '',
      operator_id: cycleRow.operator_id || undefined,
      cycle_number: cycleRow.cycle_number || '',
      cycle_type:
        (cycleRow.cycle_type as 'standard' | 'express' | 'custom') ||
        'standard',
      status:
        (cycleRow.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'failed'
          | 'cancelled') || 'pending',
      start_time: cycleRow.start_time || '',
      end_time: cycleRow.end_time || undefined,
      phases: (cycleRow.tools as unknown as SterilizationPhase[]) || [],
      tools: (cycleRow.tools as unknown as Tool[]) || [],
      cycle_parameters: (cycleRow.parameters as CycleParameters) || {},
      environmental_factors: (cycleRow.results as EnvironmentalFactors) || {},
      notes: cycleRow.notes || undefined,
      created_at: cycleRow.created_at || '',
      updated_at: cycleRow.updated_at || '',
    } as SterilizationCycle;
  }

  /**
   * Get equipment for a facility (mock implementation since autoclave_equipment table doesn't exist)
   */
  static async getEquipment(_facilityId: string): Promise<Equipment[]> {
    // Since there's no autoclave_equipment table, return empty array
    // In a real implementation, you might want to create an equipment table
    return [];
  }

  /**
   * Get compliance audits for a facility
   */
  static async getComplianceAudits(
    facilityId: string
  ): Promise<ComplianceAudit[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('facility_id', facilityId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch compliance audits: ${error.message}`);
    }

    return ((data as AuditLogRow[]) || []).map((item: AuditLogRow) => ({
      id: item.id || '',
      facility_id: item.facility_id || '',
      audit_type:
        ((item.metadata as { audit_type?: string })?.audit_type as
          | 'daily'
          | 'weekly'
          | 'monthly'
          | 'annual'
          | 'incident') || 'daily',
      audit_date: item.created_at,
      auditor_id: item.user_id ?? 'system',
      audit_scope:
        (item.metadata as { audit_scope?: Record<string, unknown> })
          ?.audit_scope || {},
      findings:
        (item.metadata as { findings?: AuditFinding[] })?.findings || [],
      compliance_score:
        (item.metadata as { compliance_score?: number })?.compliance_score ||
        undefined,
      recommendations:
        (item.metadata as { recommendations?: string })?.recommendations ||
        undefined,
      corrective_actions:
        (item.metadata as { corrective_actions?: CorrectiveAction[] })
          ?.corrective_actions || [],
      follow_up_date:
        (item.metadata as { follow_up_date?: string })?.follow_up_date ||
        undefined,
      status:
        ((item.metadata as { status?: string })?.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'closed') || 'pending',
      created_at: item.created_at,
      updated_at: item.updated_at || '',
    })) as ComplianceAudit[];
  }

  /**
   * Generate unique cycle number
   */
  private static async generateCycleNumber(
    facilityId: string
  ): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    // Get count of cycles for today
    const { count, error } = await supabase
      .from('sterilization_cycles')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId)
      .gte('start_time', today.toISOString().split('T')[0])
      .lt(
        'start_time',
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );

    if (error) {
      throw new Error(`Failed to generate cycle number: ${error.message}`);
    }

    const cycleNumber = `CYCLE-${dateStr}-${String((count ?? 0) + 1).padStart(3, '0')}`;
    return cycleNumber;
  }
}
