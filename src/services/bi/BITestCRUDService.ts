import { supabase } from '@/lib/supabaseClient';
import {
  BITestResult,
  CreateBITestRequest,
  UpdateBITestRequest,
  BITestFilters,
  TestConditions,
} from '../../types/biWorkflowTypes';

// Define interface for database table row
interface BITestResultRow {
  id: string;
  facility_id: string;
  operator_id: string | null;
  cycle_id: string | null;
  test_number: string;
  test_date: string;
  result: 'pass' | 'fail' | 'skip';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  bi_lot_number: string | null;
  bi_expiry_date: string | null;
  incubation_time_minutes: number | null;
  incubation_temperature_celsius: number | null;
  test_conditions: Record<string, unknown> | null;
  failure_reason: string | null;
  skip_reason: string | null;
  compliance_notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * BI Test CRUD Service
 * Handles all basic CRUD operations for BI test results
 */
export class BITestCRUDService {
  /**
   * Create a new BI test result
   */
  static async createBITestResult(
    data: CreateBITestRequest
  ): Promise<BITestResult> {
    const testNumber = await this.generateTestNumber(data.facility_id);

    const insertData = {
      facility_id: data.facility_id,
      operator_id: data.operator_id,
      cycle_id: data.cycle_id,
      test_number: testNumber,
      test_date: new Date().toISOString(),
      result: data.result,
      status: 'completed' as const,
      bi_lot_number: data.bi_lot_number,
      bi_expiry_date: data.bi_expiry_date,
      incubation_time_minutes: data.incubation_time_minutes,
      incubation_temperature_celsius: data.incubation_temperature_celsius,
      test_conditions: data.test_conditions || {},
      failure_reason: data.failure_reason,
      skip_reason: data.skip_reason,
      compliance_notes: data.compliance_notes,
    };

    const { data: result, error } = await supabase
      .from('bi_test_results')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create BI test result: ${error.message}`);
    }

    if (!result) {
      throw new Error('No data returned from BI test result creation');
    }

    const resultRow = result as BITestResultRow;
    return {
      id: resultRow.id,
      facility_id: resultRow.facility_id,
      test_number: resultRow.test_number,
      test_date: resultRow.test_date,
      result: resultRow.result,
      status: resultRow.status,
      operator_id: resultRow.operator_id,
      cycle_id: resultRow.cycle_id,
      test_conditions: (resultRow.test_conditions as TestConditions) || {},
      created_at: resultRow.created_at,
      updated_at: resultRow.updated_at,
    };
  }

  /**
   * Update an existing BI test result
   */
  static async updateBITestResult(
    id: string,
    data: UpdateBITestRequest
  ): Promise<BITestResult> {
    const { data: result, error } = await supabase
      .from('bi_test_results')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update BI test result: ${error.message}`);
    }

    if (!result) {
      throw new Error('No data returned from BI test result update');
    }

    const resultRow = result as BITestResultRow;
    return {
      id: resultRow.id,
      facility_id: resultRow.facility_id,
      test_number: resultRow.test_number,
      test_date: resultRow.test_date,
      result: resultRow.result,
      status: resultRow.status,
      operator_id: resultRow.operator_id,
      cycle_id: resultRow.cycle_id,
      test_conditions: (resultRow.test_conditions as TestConditions) || {},
      created_at: resultRow.created_at,
      updated_at: resultRow.updated_at,
    };
  }

  /**
   * Get BI test results with filtering
   */
  static async getBITestResults(
    filters: BITestFilters = {}
  ): Promise<BITestResult[]> {
    let query = supabase
      .from('bi_test_results')
      .select(
        `
        *,
        facilities(name, facility_code),
        operators(name, role),
        sterilization_cycles(cycle_number, cycle_type)
      `
      )
      .order('test_date', { ascending: false });

    // Apply filters
    if (filters.facility_id) {
      query = query.eq('facility_id', filters.facility_id);
    }
    if (filters.operator_id) {
      query = query.eq('operator_id', filters.operator_id);
    }
    if (filters.cycle_id) {
      query = query.eq('cycle_id', filters.cycle_id);
    }
    if (filters.result) {
      query = query.eq('result', filters.result);
    }
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.start_date) {
      query = query.gte('test_date', filters.start_date);
    }
    if (filters.end_date) {
      query = query.lte('test_date', filters.end_date);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(
        filters.offset,
        filters.offset + (filters.limit || 10) - 1
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch BI test results: ${error.message}`);
    }

    return ((data as BITestResultRow[]) || []).map(
      (item): BITestResult => ({
        id: item.id,
        facility_id: item.facility_id,
        test_number: item.test_number,
        test_date: item.test_date,
        result: item.result,
        status: item.status,
        operator_id: item.operator_id,
        cycle_id: item.cycle_id,
        test_conditions: (item.test_conditions as TestConditions) || {},
        created_at: item.created_at,
        updated_at: item.updated_at,
      })
    );
  }

  /**
   * Get a single BI test result by ID
   */
  static async getBITestResult(id: string): Promise<BITestResult> {
    const { data, error } = await supabase
      .from('bi_test_results')
      .select(
        `
        *,
        facilities(name, facility_code),
        operators(name, role),
        sterilization_cycles(cycle_number, cycle_type)
      `
      )
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch BI test result: ${error.message}`);
    }

    if (!data) {
      throw new Error('BI test result not found');
    }

    const resultRow = data as BITestResultRow;
    return {
      id: resultRow.id,
      facility_id: resultRow.facility_id,
      test_number: resultRow.test_number,
      test_date: resultRow.test_date,
      result: resultRow.result,
      status: resultRow.status,
      operator_id: resultRow.operator_id,
      cycle_id: resultRow.cycle_id,
      test_conditions: (resultRow.test_conditions as TestConditions) || {},
      created_at: resultRow.created_at,
      updated_at: resultRow.updated_at,
    };
  }

  /**
   * Delete a BI test result
   */
  static async deleteBITestResult(id: string): Promise<void> {
    const { error } = await supabase
      .from('bi_test_results')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete BI test result: ${error.message}`);
    }
  }

  /**
   * Generate unique test number
   */
  private static async generateTestNumber(facilityId: string): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

    // Get count of tests for today
    const { count, error } = await supabase
      .from('bi_test_results')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId)
      .gte('test_date', today.toISOString().split('T')[0])
      .lt(
        'test_date',
        new Date(today.getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );

    if (error) {
      throw new Error(`Failed to generate test number: ${error.message}`);
    }

    const testNumber = `BI-${dateStr}-${String((count || 0) + 1).padStart(3, '0')}`;
    return testNumber;
  }
}
