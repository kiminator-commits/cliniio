import { supabase } from '../../lib/supabaseClient';
import {
  Facility,
  Operator,
  SterilizationCycle,
  Equipment,
  ComplianceAudit,
  SterilizationPhase,
  Tool,
  CycleParameters,
  EnvironmentalFactors,
  MaintenanceSchedule,
  PerformanceMetrics,
  AuditFinding,
  CorrectiveAction,
} from '../../types/biWorkflowTypes';

// Type definitions based on actual database schema
interface FacilityRow {
  id: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  hourly_rate?: number;
  staff_count?: number;
  subscription_tier?: string;
  created_by?: string;
  contact_info?: Record<string, unknown>;
  settings?: Record<string, unknown>;
  address?: Record<string, unknown>;
  updated_by?: string;
}

interface SterilizationCycleRow {
  id: string;
  facility_id: string;
  operator_id: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  pressure_psi?: number;
  parameters?: Record<string, unknown>;
  results?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  tools?: Record<string, unknown>;
  cycle_time?: number;
  autoclave_id?: string;
  tool_batch_id?: string;
  cycle_type?: string;
  cycle_number?: string;
  status?: string;
  notes?: string;
  temperature_celsius?: number;
}

interface OperatorRow {
  id: string;
  facility_id: string;
  name: string;
  role: string;
  email?: string;
  phone?: string;
  permissions?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EquipmentRow {
  id: string;
  facility_id: string;
  equipment_type: string;
  model_number?: string;
  serial_number?: string;
  manufacturer?: string;
  installation_date?: string;
  last_calibration_date?: string;
  next_calibration_date?: string;
  maintenance_schedule?: Record<string, unknown>;
  performance_metrics?: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ComplianceAuditRow {
  id: string;
  facility_id: string;
  audit_type: string;
  audit_date: string;
  auditor_id?: string;
  audit_scope?: Record<string, unknown>;
  findings?: Record<string, unknown>[];
  recommendations?: string;
  corrective_actions?: Record<string, unknown>[];
  status: string;
  created_at: string;
  updated_at: string;
}

/**
 * BI Facility Service
 * Handles all facility, operator, and related entity operations
 */
export class BIFacilityService {
  /**
   * Get all facilities
   */
  static async getFacilities(): Promise<Facility[]> {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch facilities: ${error.message}`);
    }

    return ((data as FacilityRow[]) || []).map((item) => ({
      id: item.id,
      name: item.name,
      facility_code: item.type, // Using type as facility_code since facility_code doesn't exist in schema
      address: (item.address as unknown as string) || undefined,
      contact_email:
        (item.contact_info as { email?: string })?.email || undefined,
      contact_phone:
        (item.contact_info as { phone?: string })?.phone || undefined,
      compliance_requirements: item.settings || {},
      settings: item.settings || {},
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
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
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch operators: ${error.message}`);
    }

    return ((data as OperatorRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      name: item.name,
      role: item.role as 'operator' | 'supervisor' | 'admin',
      email: item.email || undefined,
      phone: item.phone || undefined,
      permissions: item.permissions || {},
      performance_metrics: item.performance_metrics || {},
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * Get sterilization cycles for a facility
   */
  static async getSterilizationCycles(
    facilityId: string,
    limit: number = 50
  ): Promise<SterilizationCycle[]> {
    const { data, error } = await supabase
      .from('sterilization_cycles')
      .select(
        `
        *,
        operators(name, role),
        bi_test_results(id, result, test_date)
      `
      )
      .eq('facility_id', facilityId)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(`Failed to fetch sterilization cycles: ${error.message}`);
    }

    return ((data as SterilizationCycleRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      cycle_number: item.cycle_number || '',
      cycle_type:
        (item.cycle_type as 'standard' | 'express' | 'custom') || 'standard',
      start_time: item.start_time,
      end_time: item.end_time || '',
      status:
        (item.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'failed'
          | 'cancelled') || 'pending',
      operator_id: item.operator_id,
      phases: (item.parameters as unknown as SterilizationPhase[]) || [],
      tools: (item.tools as unknown as Tool[]) || [],
      cycle_parameters: (item.parameters as CycleParameters) || {},
      environmental_factors: (item.results as EnvironmentalFactors) || {},
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * Create a new sterilization cycle
   */
  static async createSterilizationCycle(
    cycleData: Partial<SterilizationCycle>
  ): Promise<SterilizationCycle> {
    const cycleNumber = await this.generateCycleNumber(cycleData.facility_id!);

    const insertData: Partial<SterilizationCycleRow> = {
      facility_id: cycleData.facility_id!,
      operator_id: cycleData.operator_id,
      cycle_type: cycleData.cycle_type || 'standard',
      cycle_number: cycleNumber,
      start_time: new Date().toISOString(),
      status: cycleData.status || 'pending',
      parameters: cycleData.cycle_parameters as Record<string, unknown>,
      results: cycleData.environmental_factors as Record<string, unknown>,
      tools: cycleData.tools as unknown as Record<string, unknown>,
      notes: cycleData.notes,
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

    const cycle = data as SterilizationCycleRow;
    return {
      id: cycle.id,
      facility_id: cycle.facility_id,
      cycle_number: cycle.cycle_number || '',
      cycle_type:
        (cycle.cycle_type as 'standard' | 'express' | 'custom') || 'standard',
      start_time: cycle.start_time,
      end_time: cycle.end_time || '',
      status:
        (cycle.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'failed'
          | 'cancelled') || 'pending',
      operator_id: cycle.operator_id,
      phases: (cycle.parameters as unknown as SterilizationPhase[]) || [],
      tools: (cycle.tools as unknown as Tool[]) || [],
      cycle_parameters: (cycle.parameters as CycleParameters) || {},
      environmental_factors: (cycle.results as EnvironmentalFactors) || {},
      created_at: cycle.created_at,
      updated_at: cycle.updated_at,
    };
  }

  /**
   * Get equipment for a facility
   */
  static async getEquipment(facilityId: string): Promise<Equipment[]> {
    const { data, error } = await supabase
      .from('autoclave_equipment')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('is_active', true)
      .order('equipment_type');

    if (error) {
      throw new Error(`Failed to fetch equipment: ${error.message}`);
    }

    return ((data as EquipmentRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      equipment_type: item.equipment_type,
      model_number: item.model_number || undefined,
      serial_number: item.serial_number || undefined,
      manufacturer: item.manufacturer || undefined,
      installation_date: item.installation_date || undefined,
      last_calibration_date: item.last_calibration_date || undefined,
      next_calibration_date: item.next_calibration_date || undefined,
      maintenance_schedule:
        (item.maintenance_schedule as MaintenanceSchedule) || {},
      performance_metrics:
        (item.performance_metrics as PerformanceMetrics) || {},
      is_active: item.is_active,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * Get compliance audits for a facility
   */
  static async getComplianceAudits(
    facilityId: string
  ): Promise<ComplianceAudit[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select(
        `
        *,
        operators(name, role)
      `
      )
      .eq('facility_id', facilityId)
      .order('audit_date', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch compliance audits: ${error.message}`);
    }

    return ((data as ComplianceAuditRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      audit_type:
        (item.audit_type as
          | 'daily'
          | 'weekly'
          | 'monthly'
          | 'annual'
          | 'incident') || 'daily',
      audit_date: item.audit_date,
      auditor_id: item.auditor_id || undefined,
      audit_scope: item.audit_scope || {},
      findings: (item.findings as AuditFinding[]) || [],
      recommendations: item.recommendations || undefined,
      corrective_actions: (item.corrective_actions as CorrectiveAction[]) || [],
      status:
        (item.status as 'pending' | 'in_progress' | 'completed' | 'closed') ||
        'pending',
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
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
      .select('*', { count: 'exact' })
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

    const cycleNumber = `CYCLE-${dateStr}-${String(((count as number) || 0) + 1).padStart(3, '0')}`;
    return cycleNumber;
  }
}
