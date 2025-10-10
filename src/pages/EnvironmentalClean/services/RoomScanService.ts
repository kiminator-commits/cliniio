import { supabase } from '../../../lib/supabase';
import { RoomStatusType } from '../models';
import { auditLogger } from '../../../utils/auditLogger';
import { useStatusTypesStore } from '../../../store/statusTypesStore';

export interface Room {
  id: string;
  barcode: string;
  name: string;
  department?: string;
  floor?: string;
  building?: string;
  roomType?: string;
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScanResult {
  success: boolean;
  room?: Room;
  message: string;
}

export interface StatusUpdateResult {
  success: boolean;
  message: string;
  roomId?: string;
  status?: RoomStatusType;
}

// Row types for Supabase
interface _RoomRow {
  id: string;
  barcode: string;
  name: string;
  department?: string | null;
  floor?: string | null;
  building?: string | null;
  room_type?: string | null;
  capacity?: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface EnvironmentalCleanRow {
  id: string;
  room_id: string;
  room_name: string;
  status: string;
  cleaning_type?: string | null;
  scheduled_time?: string | null;
  completed_time?: string | null;
  created_at: string;
  updated_at: string;
}

interface InventoryUsageRow {
  environmental_clean_id: string;
  inventory_item_id: string;
  quantity_used: number;
  usage_reason: string;
  task_step: string;
  used_by?: string | null;
}

export class RoomScanService {
  static async scanRoomBarcode(barcode: string): Promise<ScanResult> {
    try {
      if (!barcode || barcode.trim() === '') {
        return { success: false, message: 'Please enter a valid barcode' };
      }

      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('barcode', barcode.trim())
        .eq('is_active', true)
        .single();

      if (error) {
        if ((error as { code?: string }).code === 'PGRST116') {
          return {
            success: false,
            message: `Room with barcode "${barcode}" not found in system`,
          };
        }
        throw error;
      }

      if (!data) {
        return { success: false, message: 'Room not found in system' };
      }

      const roomData = data as {
        id: string;
        barcode: string;
        name: string;
        department?: string;
        floor?: string;
        building?: string;
        status: string;
        last_cleaned?: string;
        next_cleaning_due?: string;
        cleaning_frequency_days?: number;
        created_at: string;
        updated_at: string;
        facility_id: string;
      };
      const room: Room = {
        id: roomData.id,
        barcode: roomData.barcode,
        name: roomData.name,
        department: roomData.department ?? undefined,
        floor: roomData.floor ?? undefined,
        building: roomData.building ?? undefined,
        roomType: (roomData as { room_type?: string }).room_type ?? undefined,
        capacity: (roomData as { capacity?: number }).capacity ?? undefined,
        isActive: (roomData as { is_active?: boolean }).is_active,
        createdAt: roomData.created_at,
        updatedAt: roomData.updated_at,
      };

      auditLogger.log('environmental_clean', 'room_scanned', {
        roomId: room.id,
        roomName: room.name,
        barcode: barcode,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        room,
        message: `Room "${room.name}" scanned successfully!`,
      };
    } catch (error) {
      console.error('❌ Error scanning room barcode:', error);
      return {
        success: false,
        message:
          'An error occurred while scanning the barcode. Please try again.',
      };
    }
  }

  static async updateRoomStatus(
    roomId: string,
    status: RoomStatusType
  ): Promise<StatusUpdateResult> {
    try {
      if (!roomId) {
        return { success: false, message: 'Room ID is required' };
      }

      const statusTypesStore = useStatusTypesStore.getState();
      const allStatuses = statusTypesStore.getAllStatusTypes();
      const validStatusIds = allStatuses.map((s) => s.id);

      if (!validStatusIds.includes(status)) {
        return { success: false, message: `Invalid status: ${status}` };
      }

      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        return { success: false, message: 'Room not found in system' };
      }

      const room = roomData as {
        id: string;
        name: string;
        facility_id: string;
      };
      const databaseStatus = this.mapStatusToDatabase(status);

      const updateData: Partial<EnvironmentalCleanRow> = {
        status: databaseStatus,
        updated_at: new Date().toISOString(),
      };

      if (status === 'available') {
        updateData.completed_time = new Date().toISOString();
      }

      const { data: existingRecord } = await supabase
        .from('environmental_cleans_enhanced')
        .select('id')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (existingRecord) {
        const existingRecordData = existingRecord as { id: string };
        const { error } = await supabase
          .from('environmental_cleans_enhanced')
          .update(updateData)
          .eq('id', existingRecordData.id);
        if (error) throw error;
      } else {
        const insertData: Partial<EnvironmentalCleanRow> = {
          room_id: roomId,
          room_name: room.name,
          status: databaseStatus,
          cleaning_type: 'routine',
          scheduled_time: new Date().toISOString(),
          ...updateData,
        };

        const { error } = await supabase
          .from('environmental_cleans_enhanced')
          .insert(insertData);
        if (error) throw error;
      }

      auditLogger.log('environmental_clean', 'room_status_updated', {
        roomId,
        roomName: room.name,
        status,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Room "${room.name}" status updated to ${status}`,
        roomId,
        status,
      };
    } catch (error) {
      console.error('❌ Error updating room status:', error);
      return {
        success: false,
        message:
          'An error occurred while updating room status. Please try again.',
      };
    }
  }

  static async completeRoomCleaning(
    roomId: string,
    inventoryUsage?: Array<{
      itemId: string;
      quantity: number;
      usageReason: string;
      taskStep: string;
    }>
  ): Promise<StatusUpdateResult> {
    try {
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('name')
        .eq('id', roomId)
        .single();

      if (roomError || !roomData) {
        return { success: false, message: 'Room not found in system' };
      }

      const room = roomData as {
        id: string;
        name: string;
        facility_id: string;
      };
      const { data: updatedClean, error: updateError } = await supabase
        .from('environmental_cleans_enhanced')
        .update({
          status: 'completed',
          completed_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(1)
        .select()
        .single();

      if (updateError) throw updateError;

      if (inventoryUsage && inventoryUsage.length > 0 && updatedClean) {
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id;

        const inventoryUsageData: InventoryUsageRow[] = inventoryUsage.map(
          (usage) => ({
            environmental_clean_id: (updatedClean as { id: string }).id,
            inventory_item_id: usage.itemId,
            quantity_used: usage.quantity,
            usage_reason: usage.usageReason,
            task_step: usage.taskStep,
            used_by: userId ?? null,
          })
        );

        const { error: inventoryError } = await supabase
          .from('environmental_cleaning_inventory_usage')
          .insert(inventoryUsageData);

        if (inventoryError) {
          console.error('❌ Error tracking inventory usage:', inventoryError);
        }
      }

      auditLogger.log('environmental_clean', 'room_cleaning_completed', {
        roomId,
        roomName: room.name,
        inventoryUsage: inventoryUsage?.length || 0,
        timestamp: new Date().toISOString(),
      });

      return {
        success: true,
        message: `Room "${room.name}" cleaning completed successfully`,
        roomId,
        status: 'clean' as RoomStatusType,
      };
    } catch (error) {
      console.error('❌ Error completing room cleaning:', error);
      return {
        success: false,
        message:
          'An error occurred while completing room cleaning. Please try again.',
      };
    }
  }

  static getAvailableStatuses() {
    const statusTypesStore = useStatusTypesStore.getState();
    const coreStatuses = statusTypesStore.getCoreStatusTypes();
    const publishedStatuses = statusTypesStore.getPublishedStatusTypes();
    return [...coreStatuses, ...publishedStatuses.filter((s) => !s.isCore)];
  }

  private static mapStatusToDatabase(status: RoomStatusType): string {
    // Map common status names to database statuses
    const statusMap: Record<string, string> = {
      Clean: 'clean',
      Dirty: 'dirty',
      'In Progress': 'in_progress',
      'Out of Service': 'cancelled',
      Supervisor: 'pending',
      Isolation: 'failed',
      Quarantine: 'failed',
      Maintenance: 'pending',
      'Equipment Failure': 'failed',
      'Patient Occupied': 'pending',
      'Discharge Cleaning': 'pending',
      Unassigned: 'pending',
      'Audit Required': 'pending',
    };
    return statusMap[status] || 'dirty';
  }

  static mapDatabaseToStatus(dbStatus: string): RoomStatusType {
    // Map database statuses to room status names
    const statusMap: Record<string, string> = {
      completed: 'Clean',
      clean: 'Clean',
      pending: 'Dirty',
      dirty: 'Dirty',
      in_progress: 'In Progress',
      failed: 'Supervisor', // Changed from Biohazard to Supervisor for better workflow
      cancelled: 'Out of Service',
    };
    return statusMap[dbStatus] || 'Dirty';
  }
}
