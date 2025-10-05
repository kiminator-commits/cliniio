import { supabase } from '@/lib/supabaseClient';
import {
  BITestResult,
  CreateBITestRequest,
  UpdateBITestRequest,
  BITestFilters,
} from '../../types/biWorkflowTypes';

// Type definitions based on actual database schema
interface BITestResultRow {
  id: string;
  facility_id: string;
  operator_id?: string;
  cycle_id?: string;
  test_number: string;
  test_date: string;
  result: string;
  status: string;
  bi_lot_number?: string;
  bi_expiry_date?: string;
  incubation_time_minutes?: number;
  incubation_temperature_celsius?: number;
  test_conditions?: Record<string, unknown>;
  failure_reason?: string;
  skip_reason?: string;
  compliance_notes?: string;
  audit_signature?: string;
  created_at: string;
  updated_at: string;
}

/**
 * BI Test Service - Handles BI test CRUD operations
 */
export class BITestService {
  /**
   * Create a new BI test result
   */
  static async createBITestResult(
    testData: CreateBITestRequest
  ): Promise<BITestResult> {
    try {
      // Generate unique test number inline
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');
      const timestamp = Date.now().toString().slice(-6);
      const testNumber = `BI-${dateStr}-${timestamp}`;

      const insertData: Partial<BITestResult> = {
        facility_id: testData.facility_id,
        operator_id: testData.operator_id,
        cycle_id: testData.cycle_id || '00000000-0000-0000-0000-000000000000', // Use placeholder UUID for standalone tests
        test_number: testNumber,
        test_date: testData.test_date || new Date().toISOString(),
        result: testData.result,
        bi_lot_number: testData.bi_lot_number,
        bi_expiry_date: testData.bi_expiry_date,
        incubation_time_minutes: testData.incubation_time_minutes,
        incubation_temperature_celsius: testData.incubation_temperature_celsius,
        test_conditions: testData.test_conditions,
        failure_reason: testData.failure_reason,
        skip_reason: testData.skip_reason,
        compliance_notes: testData.compliance_notes,
        // Removed created_by and updated_by - they don't exist in the table schema
      };

      console.log(
        '🔍 Inserting BI test data:',
        JSON.stringify(insertData, null, 2)
      );

      const { data, error } = await supabase
        .from('bi_test_results')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('❌ Database error details:', error);
        throw error;
      }

      // Add type guard to ensure data has required properties
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid test result data');
      }

      const result = data as BITestResultRow;
      return {
        id: result.id,
        facility_id: result.facility_id,
        operator_id: result.operator_id || undefined,
        cycle_id: result.cycle_id || undefined,
        test_number: result.test_number,
        test_date: result.test_date,
        result: result.result as 'pass' | 'fail' | 'skip',
        status: result.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'failed',
        bi_lot_number: result.bi_lot_number || undefined,
        bi_expiry_date: result.bi_expiry_date || undefined,
        incubation_time_minutes: result.incubation_time_minutes || undefined,
        incubation_temperature_celsius:
          result.incubation_temperature_celsius || undefined,
        test_conditions: result.test_conditions || {},
        failure_reason: result.failure_reason || undefined,
        skip_reason: result.skip_reason || undefined,
        compliance_notes: result.compliance_notes || undefined,
        audit_signature: result.audit_signature || undefined,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
    } catch (error) {
      console.error('Failed to create BI test result:', error);
      throw error;
    }
  }

  /**
   * Update an existing BI test result
   */
  static async updateBITestResult(
    id: string,
    updateData: UpdateBITestRequest
  ): Promise<BITestResult> {
    const { data: result, error } = await supabase
      .from('bi_test_results')
      .update({
        ...updateData,
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

    const testResult = result as BITestResultRow;
    return {
      id: testResult.id,
      facility_id: testResult.facility_id,
      operator_id: testResult.operator_id || undefined,
      cycle_id: testResult.cycle_id || undefined,
      test_number: testResult.test_number,
      test_date: testResult.test_date,
      result: testResult.result as 'pass' | 'fail' | 'skip',
      status: testResult.status as
        | 'pending'
        | 'in_progress'
        | 'completed'
        | 'failed',
      bi_lot_number: testResult.bi_lot_number || undefined,
      bi_expiry_date: testResult.bi_expiry_date || undefined,
      incubation_time_minutes: testResult.incubation_time_minutes || undefined,
      incubation_temperature_celsius:
        testResult.incubation_temperature_celsius || undefined,
      test_conditions: testResult.test_conditions || {},
      failure_reason: testResult.failure_reason || undefined,
      skip_reason: testResult.skip_reason || undefined,
      compliance_notes: testResult.compliance_notes || undefined,
      audit_signature: testResult.audit_signature || undefined,
      created_at: testResult.created_at,
      updated_at: testResult.updated_at,
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

    return ((data as BITestResultRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      operator_id: item.operator_id || undefined,
      cycle_id: item.cycle_id || undefined,
      test_number: item.test_number,
      test_date: item.test_date,
      result: item.result as 'pass' | 'fail' | 'skip',
      status: item.status as 'pending' | 'in_progress' | 'completed' | 'failed',
      bi_lot_number: item.bi_lot_number || undefined,
      bi_expiry_date: item.bi_expiry_date || undefined,
      incubation_time_minutes: item.incubation_time_minutes || undefined,
      incubation_temperature_celsius:
        item.incubation_temperature_celsius || undefined,
      test_conditions: item.test_conditions || {},
      failure_reason: item.failure_reason || undefined,
      skip_reason: item.skip_reason || undefined,
      compliance_notes: item.compliance_notes || undefined,
      audit_signature: item.audit_signature || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  /**
   * Get a single BI test result by ID
   */
  static async getBITestResult(testId: string): Promise<BITestResult | null> {
    try {
      const { data, error } = await supabase
        .from('bi_test_results')
        .select('*')
        .eq('id', testId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No rows returned
        }
        throw error;
      }

      // Add type guard to ensure data has required properties
      if (!data || typeof data !== 'object') {
        return null;
      }

      const result = data as BITestResultRow;
      return {
        id: result.id,
        facility_id: result.facility_id,
        operator_id: result.operator_id || undefined,
        cycle_id: result.cycle_id || undefined,
        test_number: result.test_number,
        test_date: result.test_date,
        result: result.result as 'pass' | 'fail' | 'skip',
        status: result.status as
          | 'pending'
          | 'in_progress'
          | 'completed'
          | 'failed',
        bi_lot_number: result.bi_lot_number || undefined,
        bi_expiry_date: result.bi_expiry_date || undefined,
        incubation_time_minutes: result.incubation_time_minutes || undefined,
        incubation_temperature_celsius:
          result.incubation_temperature_celsius || undefined,
        test_conditions: result.test_conditions || {},
        failure_reason: result.failure_reason || undefined,
        skip_reason: result.skip_reason || undefined,
        compliance_notes: result.compliance_notes || undefined,
        audit_signature: result.audit_signature || undefined,
        created_at: result.created_at,
        updated_at: result.updated_at,
      };
    } catch (error) {
      console.error('Failed to get BI test result:', error);
      throw error;
    }
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
  static async generateTestNumber(facilityId: string): Promise<string> {
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

    const testNumber = `BI-${dateStr}-${String((count ?? 0) + 1).padStart(3, '0')}`;
    return testNumber;
  }
}
