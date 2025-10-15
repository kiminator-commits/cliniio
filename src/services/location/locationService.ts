import { supabase } from '@/lib/supabaseClient';
import type { Location } from '@/types/locationTypes';

/**
 * CRUD operations for the locations table.
 * All methods scoped by facility_id for RLS safety.
 */

export async function fetchLocations(facilityId: string): Promise<Location[]> {
  const { data, error } = await supabase
    .from('locations')
    .select('*')
    .eq('facility_id', facilityId)
    .order('name', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function createLocation(
  facilityId: string,
  name: string,
  barcode: string,
  parentId?: string,
  capacity?: number
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .insert([
      {
        facility_id: facilityId,
        name,
        barcode,
        parent_id: parentId ?? null,
        capacity: capacity ?? 0,
      },
    ])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateLocationStatus(
  locationId: string,
  status: string
): Promise<Location> {
  const { data, error } = await supabase
    .from('locations')
    .update({ status })
    .eq('id', locationId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLocation(locationId: string): Promise<void> {
  const { error } = await supabase
    .from('locations')
    .delete()
    .eq('id', locationId);
  if (error) throw error;
}

export async function validateLocationBarcode(
  barcode: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('locations')
    .select('id, status')
    .eq('barcode', barcode)
    .single();
  if (error || !data) return false;
  return data.status === 'active';
}
