import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { ToolStatus } from '@/types/toolTypes';
import { SterilizationCycle } from './SterilizationTypes';
import { getCurrentFacilityId, safeDate } from './SterilizationUtils';

export class SterilizationCycleRetriever {
  /**
   * Get a sterilization cycle by ID
   */
  static async getCycleById(
    cycleId: string
  ): Promise<SterilizationCycle | null> {
    try {
      const facilityId = await getCurrentFacilityId();
      const { data: cycle, error } = (await supabase
        .from('sterilization_cycles')
        .select('*')
        .eq('id', cycleId)
        .eq('facility_id', facilityId)
        .single()) as {
        data:
          | Database['public']['Tables']['sterilization_cycles']['Row']
          | null;
        error;
      };

      if (error || !cycle) {
        return null;
      }

      const typedCycle =
        cycle as unknown as Database['public']['Tables']['sterilization_cycles']['Row'];

      return {
        id: typedCycle.id,
        cycleId: typedCycle.id || '',
        facilityId: typedCycle.facility_id,
        cycleType: typedCycle.cycle_type,
        status: typedCycle.status as ToolStatus,
        startTime: safeDate(typedCycle.start_time) || new Date(),
        endTime: safeDate(typedCycle.end_time),
        temperatureCelsius: typedCycle.temperature_celsius || undefined,
        pressurePsi: typedCycle.pressure_psi || undefined,
        cycleName: typedCycle.cycle_number || undefined,
        notes: typedCycle.notes || undefined,
        createdBy: typedCycle.created_at,
        createdAt: safeDate(typedCycle.created_at) || new Date(),
        updatedAt: safeDate(typedCycle.updated_at) || new Date(),
      };
    } catch (error) {
      console.error('Error fetching cycle:', error);
      return null;
    }
  }
}
