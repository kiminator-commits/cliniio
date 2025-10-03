/**
 * Supabase provider for inventory action database operations
 * Extracted from inventoryActionService.ts
 */

import { supabase } from '@/lib/supabase';

/**
 * Get suppliers by facility ID
 */
export async function getSuppliersByFacility(
  facilityId: string
): Promise<{ data: unknown[] | null; error: unknown }> {
  try {
    // This would need to be implemented in InventoryCrudOperations
    // For now, we'll use a direct Supabase call as a fallback
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error(
        'InventoryActionService getSuppliersByFacility error:',
        error
      );
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting suppliers by facility:', error);
    return { data: null, error };
  }
}

/**
 * Get inventory transactions by facility ID
 */
export async function getInventoryTransactionsByFacility(
  facilityId: string
): Promise<{ data: unknown[] | null; error: unknown }> {
  try {
    // This would need to be implemented in InventoryCrudOperations
    // For now, we'll use a direct Supabase call as a fallback
    const { data, error } = await supabase
      .from('inventory_transactions')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error(
        'InventoryActionService getInventoryTransactionsByFacility error:',
        error
      );
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting inventory transactions by facility:', error);
    return { data: null, error };
  }
}

/**
 * Get inventory costs by facility ID
 */
export async function getInventoryCostsByFacility(
  facilityId: string
): Promise<{ data: unknown[] | null; error: unknown }> {
  try {
    // This would need to be implemented in InventoryCrudOperations
    // For now, we'll use a direct Supabase call as a fallback
    const { data, error } = await supabase
      .from('inventory_costs')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error(
        'InventoryActionService getInventoryCostsByFacility error:',
        error
      );
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting inventory costs by facility:', error);
    return { data: null, error };
  }
}

/**
 * Get equipment maintenance by facility ID
 */
export async function getEquipmentMaintenanceByFacility(
  facilityId: string
): Promise<{ data: unknown[] | null; error: unknown }> {
  try {
    // This would need to be implemented in InventoryCrudOperations
    // For now, we'll use a direct Supabase call as a fallback
    const { data, error } = await supabase
      .from('equipment_maintenance')
      .select('*')
      .eq('facility_id', facilityId);

    if (error) {
      console.error(
        'InventoryActionService getEquipmentMaintenanceByFacility error:',
        error
      );
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting equipment maintenance by facility:', error);
    return { data: null, error };
  }
}
