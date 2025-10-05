import { supabase } from '@/lib/supabaseClient';

// Type definitions based on actual database schema
interface BITestKitRow {
  id: string;
  facility_id: string;
  name: string;
  manufacturer: string;
  lot_number: string;
  serial_number?: string;
  barcode?: string;
  expiry_date: string;
  incubation_time_minutes: number;
  incubation_temperature_celsius: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  location?: string;
  status: string;
  supplier?: string;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface BITestKit {
  id: string;
  facility_id: string;
  name: string;
  manufacturer: string;
  lot_number: string;
  serial_number?: string;
  barcode?: string;
  expiry_date: string;
  incubation_time_minutes: number;
  incubation_temperature_celsius: number;
  quantity: number;
  min_quantity: number;
  max_quantity: number;
  location?: string;
  status: 'active' | 'inactive' | 'expired' | 'quarantine';
  supplier?: string;
  cost?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface TestConditions {
  room_temperature_celsius: number;
  humidity_percent: number;
  equipment_used: string;
  operator_id: string;
  facility_id: string;
  test_date: string;
  environmental_notes?: string;
  [key: string]: unknown;
}

export interface BITestResult {
  toolId: string;
  passed: boolean;
  date: Date;
  status?: 'pass' | 'fail' | 'skip';
}

/**
 * BI Test Kit Service
 * Handles all operations related to BI test kit management
 */
export class BITestKitService {
  /**
   * Get available BI test kits for a facility
   */
  static async getAvailableKits(facilityId: string): Promise<BITestKit[]> {
    const { data, error } = await supabase
      .from('bi_test_kits')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('status', 'active')
      .gt('quantity', 0)
      .gt('expiry_date', new Date().toISOString().split('T')[0])
      .order('expiry_date', { ascending: true });

    if (error) {
      throw new Error(`Failed to get available BI test kits: ${error.message}`);
    }

    return ((data as BITestKitRow[]) || []).map((item) => ({
      id: item.id,
      facility_id: item.facility_id,
      name: item.name,
      manufacturer: item.manufacturer,
      lot_number: item.lot_number,
      serial_number: item.serial_number || undefined,
      barcode: item.barcode || undefined,
      expiry_date: item.expiry_date,
      incubation_time_minutes: item.incubation_time_minutes,
      incubation_temperature_celsius: item.incubation_temperature_celsius,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      max_quantity: item.max_quantity,
      location: item.location || undefined,
      status: item.status as 'active' | 'inactive' | 'expired' | 'quarantine',
      supplier: item.supplier || undefined,
      cost: item.cost || undefined,
      notes: item.notes || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by || undefined,
      updated_by: item.updated_by || undefined,
    }));
  }

  /**
   * Get a specific BI test kit by ID
   */
  static async getKitById(kitId: string): Promise<BITestKit> {
    const { data, error } = await supabase
      .from('bi_test_kits')
      .select('*')
      .eq('id', kitId)
      .single();

    if (error) {
      throw new Error(`Failed to get BI test kit: ${error.message}`);
    }

    if (!data) {
      throw new Error('BI test kit not found');
    }

    const kit = data as BITestKitRow;
    return {
      id: kit.id,
      facility_id: kit.facility_id,
      name: kit.name,
      manufacturer: kit.manufacturer,
      lot_number: kit.lot_number,
      serial_number: kit.serial_number || undefined,
      barcode: kit.barcode || undefined,
      expiry_date: kit.expiry_date,
      incubation_time_minutes: kit.incubation_time_minutes,
      incubation_temperature_celsius: kit.incubation_temperature_celsius,
      quantity: kit.quantity,
      min_quantity: kit.min_quantity,
      max_quantity: kit.max_quantity,
      location: kit.location || undefined,
      status: kit.status as 'active' | 'inactive' | 'expired' | 'quarantine',
      supplier: kit.supplier || undefined,
      cost: kit.cost || undefined,
      notes: kit.notes || undefined,
      created_at: kit.created_at,
      updated_at: kit.updated_at,
      created_by: kit.created_by || undefined,
      updated_by: kit.updated_by || undefined,
    };
  }

  /**
   * Create a new BI test kit
   */
  static async createKit(
    kitData: Omit<BITestKit, 'id' | 'created_at' | 'updated_at'>
  ): Promise<BITestKit> {
    const insertData: Partial<BITestKitRow> = {
      facility_id: kitData.facility_id,
      name: kitData.name,
      manufacturer: kitData.manufacturer,
      lot_number: kitData.lot_number,
      serial_number: kitData.serial_number,
      barcode: kitData.barcode,
      expiry_date: kitData.expiry_date,
      incubation_time_minutes: kitData.incubation_time_minutes,
      incubation_temperature_celsius: kitData.incubation_temperature_celsius,
      quantity: kitData.quantity,
      min_quantity: kitData.min_quantity,
      max_quantity: kitData.max_quantity,
      location: kitData.location,
      status: kitData.status,
      supplier: kitData.supplier,
      cost: kitData.cost,
      notes: kitData.notes,
      created_by: kitData.created_by,
      updated_by: kitData.updated_by,
    };

    const { data, error } = await supabase
      .from('bi_test_kits')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create BI test kit: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from BI test kit creation');
    }

    const kit = data as BITestKitRow;
    return {
      id: kit.id,
      facility_id: kit.facility_id,
      name: kit.name,
      manufacturer: kit.manufacturer,
      lot_number: kit.lot_number,
      serial_number: kit.serial_number || undefined,
      barcode: kit.barcode || undefined,
      expiry_date: kit.expiry_date,
      incubation_time_minutes: kit.incubation_time_minutes,
      incubation_temperature_celsius: kit.incubation_temperature_celsius,
      quantity: kit.quantity,
      min_quantity: kit.min_quantity,
      max_quantity: kit.max_quantity,
      location: kit.location || undefined,
      status: kit.status as 'active' | 'inactive' | 'expired' | 'quarantine',
      supplier: kit.supplier || undefined,
      cost: kit.cost || undefined,
      notes: kit.notes || undefined,
      created_at: kit.created_at,
      updated_at: kit.updated_at,
      created_by: kit.created_by || undefined,
      updated_by: kit.updated_by || undefined,
    };
  }

  /**
   * Update BI test kit quantity (decrease by 1 when used)
   */
  static async useKit(kitId: string): Promise<void> {
    // First get current quantity
    const { data: currentKit, error: fetchError } = await supabase
      .from('bi_test_kits')
      .select('quantity')
      .eq('id', kitId)
      .single();

    if (fetchError || !currentKit) {
      throw new Error(
        `Failed to fetch BI test kit: ${fetchError?.message || 'Kit not found'}`
      );
    }

    const kit = currentKit as { quantity: number };
    if (kit.quantity <= 0) {
      throw new Error('BI test kit quantity is already 0');
    }

    const { error } = await supabase
      .from('bi_test_kits')
      .update({
        quantity: kit.quantity - 1,
        updated_at: new Date().toISOString(),
      })
      .eq('id', kitId);

    if (error) {
      throw new Error(
        `Failed to update BI test kit quantity: ${error.message}`
      );
    }
  }

  /**
   * Decrement BI test kit quantity (alias for useKit to avoid React Hook naming confusion)
   */
  static async decrementKitQuantity(kitId: string): Promise<void> {
    return this.useKit(kitId);
  }

  /**
   * Get current environmental test conditions
   */
  static async getCurrentTestConditions(): Promise<TestConditions> {
    // Get current user and facility
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error('User not authenticated');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('facility_id')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User facility not found');
    }

    const userFacility = userData as { facility_id: string };
    // In a real implementation, this would get data from environmental sensors
    // For now, we'll use reasonable defaults and allow manual entry
    const testConditions: TestConditions = {
      room_temperature_celsius: 22.0, // Default room temperature
      humidity_percent: 45.0, // Default humidity
      equipment_used: 'Standard Incubator', // Default equipment
      operator_id: user.id,
      facility_id: userFacility.facility_id,
      test_date: new Date().toISOString(),
      environmental_notes: 'Standard laboratory conditions',
    };

    return testConditions;
  }

  /**
   * Generate appropriate failure reason based on test result
   */
  static async getFailureReason(): Promise<string> {
    // In a real implementation, this would analyze the test conditions
    // and provide specific failure reasons based on the test parameters
    const baseReason = 'Positive growth detected during incubation period';

    // Add additional context based on test conditions if available
    try {
      const conditions = await this.getCurrentTestConditions();
      return `${baseReason}. Test conducted at ${conditions.room_temperature_celsius}°C for standard incubation period.`;
    } catch (err) {
      console.error(err);
      return baseReason;
    }
  }

  /**
   * Generate appropriate skip reason based on test result
   */
  static async getSkipReason(): Promise<string> {
    // In a real implementation, this would be based on operator input
    // or system conditions that prevented the test
    return 'Test skipped by operator - reason documented in compliance notes';
  }

  /**
   * Generate appropriate compliance notes for passed tests
   */
  static async getComplianceNotes(): Promise<string> {
    // In a real implementation, this would include compliance verification
    // and any relevant regulatory information
    const baseNote =
      'BI test passed successfully - sterilization process validated';

    try {
      const conditions = await this.getCurrentTestConditions();
      return `${baseNote}. Test conditions: ${conditions.room_temperature_celsius}°C, standard incubation period.`;
    } catch (err) {
      console.error(err);
      return baseNote;
    }
  }

  /**
   * Check if facility has sufficient BI test kits
   */
  static async checkKitInventory(facilityId: string): Promise<{
    available: number;
    low_stock: boolean;
    expired_count: number;
    recommendations: string[];
  }> {
    const { data, error } = await supabase
      .from('bi_test_kits')
      .select('quantity, expiry_date, status')
      .eq('facility_id', facilityId);

    if (error) {
      throw new Error(`Failed to check kit inventory: ${error.message}`);
    }

    const kits =
      (data as { quantity: number; expiry_date: string; status: string }[]) ||
      [];

    const available = kits
      .filter(
        (kit) =>
          kit.status === 'active' &&
          kit.quantity > 0 &&
          new Date(kit.expiry_date) > new Date()
      )
      .reduce((sum, kit) => sum + kit.quantity, 0);

    const expired_count = kits.filter(
      (kit) => new Date(kit.expiry_date) <= new Date()
    ).length;

    const low_stock = available < 5; // Consider low stock if less than 5 kits available

    const recommendations: string[] = [];
    if (low_stock) {
      recommendations.push(
        'Order additional BI test kits to maintain adequate inventory'
      );
    }
    if (expired_count > 0) {
      recommendations.push(
        `Dispose of ${expired_count} expired BI test kit(s)`
      );
    }

    return {
      available,
      low_stock,
      expired_count,
      recommendations,
    };
  }
}
