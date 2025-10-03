import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import { Room, RoomStatusType } from '../../models';
import { auditLogger } from '@/utils/auditLogger';
import { createUserFriendlyError } from '../errors/EnvironmentalCleanServiceError';
import {
  mapDatabaseStatusToRoomStatus,
  mapRoomStatusToDatabaseStatus,
} from '../utils/statusMapper';

// Row type for Supabase mapping
interface EnvironmentalCleanRow {
  id: string;
  room_id: string;
  room_name: string | null;
  status: string;
  cleaning_type: string | null;
  scheduled_time: string | null;
  completed_time?: string | null;
  quality_score?: number | null;
  compliance_score?: number | null;
  checklist_items?: string[] | null;
  completed_items?: string[] | null;
  failed_items?: string[] | null;
  created_at: string;
  updated_at: string;
}

export class RoomService {
  static async fetchRooms(): Promise<Room[]> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select(
          `
          id,
          room_id,
          room_name,
          status,
          cleaning_type,
          scheduled_time,
          completed_time,
          quality_score,
          compliance_score,
          created_at,
          updated_at
        `
        )
        .order('scheduled_time', { ascending: false });

      if (error) throw error;

      const rooms: Room[] = (data ?? []).map(
        (item: {
          room_id?: string;
          id?: string;
          status: string;
          cleaning_type?: string;
          last_cleaned?: string;
          next_cleaning?: string;
          notes?: string;
          created_at: string;
          updated_at: string;
        }) => {
          const mappedStatus = mapDatabaseStatusToRoomStatus(item.status);
          return {
            id: item.room_id || item.id,
            name: item.room_name || `Room ${item.room_id || item.id}`,
            status: mappedStatus,
            metadata: {
              cleaningType: item.cleaning_type ?? '',
              qualityScore: item.quality_score ?? 0,
              complianceScore: item.compliance_score ?? 0,
              scheduledTime: item.scheduled_time ?? '',
              completedTime: item.completed_time ?? undefined,
            },
            createdAt: item.created_at,
            updatedAt: item.updated_at,
          };
        }
      );

      return rooms;
    } catch (error) {
      console.warn(
        'Environmental Clean rooms fetch failed, falling back to static data:',
        error
      );
      return [
        {
          id: 'room-1',
          name: 'Operating Room 1',
          status: 'pending' as RoomStatusType,
          metadata: {
            cleaningType: 'surgical',
            qualityScore: 95,
            complianceScore: 98,
            scheduledTime: new Date().toISOString(),
            completedTime: undefined,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'room-2',
          name: 'Recovery Room A',
          status: 'in_progress' as RoomStatusType,
          metadata: {
            cleaningType: 'standard',
            qualityScore: 87,
            complianceScore: 92,
            scheduledTime: new Date().toISOString(),
            completedTime: undefined,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'room-3',
          name: 'ICU Room 3',
          status: 'completed' as RoomStatusType,
          metadata: {
            cleaningType: 'intensive',
            qualityScore: 99,
            complianceScore: 100,
            scheduledTime: new Date().toISOString(),
            completedTime: new Date().toISOString(),
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
    }
  }

  static async updateRoomStatus(
    roomId: string,
    status: RoomStatusType
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('environmental_cleans_enhanced')
        .update({
          status: mapRoomStatusToDatabaseStatus(status),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['environmental_cleans_enhanced']['Update'])
        .eq('room_id', roomId);

      if (error) throw error;

      auditLogger.log('environmental_clean', 'room_status_updated', {
        roomId,
        status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const friendlyError = createUserFriendlyError(error, 'updateRoomStatus');
      console.error('❌ Failed to update room status:', friendlyError);
      throw friendlyError;
    }
  }

  static async createEnvironmentalClean(
    roomData: Partial<Room>
  ): Promise<Room> {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .insert({
          room_id: roomData.id ?? '',
          room_name: roomData.name ?? '',
          status: 'pending',
          cleaning_type: 'routine',
          scheduled_time: new Date().toISOString(),
          checklist_items: [],
          completed_items: [],
          failed_items: [],
        } as Database['public']['Tables']['environmental_cleans_enhanced']['Insert'])
        .select()
        .single();

      if (error || !data) throw error ?? new Error('Insert failed');

      const room: Room = {
        id: (data as { room_id: string }).room_id,
        name:
          (data as { room_name?: string; room_id: string }).room_name ||
          `Room ${(data as { room_id: string }).room_id}`,
        status: mapDatabaseStatusToRoomStatus(
          (data as { status: string }).status
        ),
        metadata: {
          cleaningType:
            (data as { cleaning_type?: string }).cleaning_type ?? '',
          scheduledTime:
            (data as { scheduled_time?: string }).scheduled_time ?? '',
        },
        createdAt: (data as { created_at: string }).created_at,
        updatedAt: (data as { updated_at: string }).updated_at,
      };

      auditLogger.log('environmental_clean', 'room_created', {
        roomId: room.id,
        roomName: room.name,
      });

      return room;
    } catch (error) {
      const friendlyError = createUserFriendlyError(
        error,
        'createEnvironmentalClean'
      );
      console.error('❌ Failed to create environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  static async updateEnvironmentalClean(
    id: string,
    roomData: Partial<Room>
  ): Promise<Room> {
    try {
      const updateData: Partial<EnvironmentalCleanRow> = {
        updated_at: new Date().toISOString(),
      };

      if (roomData.name) {
        updateData.room_name = roomData.name;
      }
      if (roomData.status) {
        updateData.status = mapRoomStatusToDatabaseStatus(roomData.status);
      }

      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .update(
          updateData as Database['public']['Tables']['environmental_cleans_enhanced']['Update']
        )
        .eq('room_id', id)
        .select()
        .single();

      if (error || !data) throw error ?? new Error('Update failed');

      const room: Room = {
        id: (data as { room_id: string }).room_id,
        name:
          (data as { room_name?: string; room_id: string }).room_name ||
          `Room ${(data as { room_id: string }).room_id}`,
        status: mapDatabaseStatusToRoomStatus(
          (data as { status: string }).status
        ),
        metadata: {
          cleaningType:
            (data as { cleaning_type?: string }).cleaning_type ?? '',
          qualityScore: (data as { quality_score?: number }).quality_score ?? 0,
          complianceScore:
            (data as { compliance_score?: number }).compliance_score ?? 0,
          scheduledTime:
            (data as { scheduled_time?: string }).scheduled_time ?? '',
          completedTime:
            (data as { completed_time?: string }).completed_time ?? undefined,
        },
        createdAt: (data as { created_at: string }).created_at,
        updatedAt: (data as { updated_at: string }).updated_at,
      };

      auditLogger.log('environmental_clean', 'room_updated', {
        roomId: room.id,
        roomName: room.name,
      });

      return room;
    } catch (error) {
      const friendlyError = createUserFriendlyError(
        error,
        'updateEnvironmentalClean'
      );
      console.error('❌ Failed to update environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  static async deleteEnvironmentalClean(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('environmental_cleans_enhanced')
        .delete()
        .eq('room_id', id);

      if (error) throw error;

      auditLogger.log('environmental_clean', 'room_deleted', { roomId: id });
    } catch (error) {
      const friendlyError = createUserFriendlyError(
        error,
        'deleteEnvironmentalClean'
      );
      console.error('❌ Failed to delete environmental clean:', friendlyError);
      throw friendlyError;
    }
  }

  static async completeRoomCleaning(roomId: string): Promise<void> {
    try {
      if (!roomId) throw new Error('Room ID is required');

      const { error } = await supabase
        .from('environmental_cleans_enhanced')
        .update({
          status: 'completed',
          completed_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Database['public']['Tables']['environmental_cleans_enhanced']['Update'])
        .eq('room_id', roomId);

      if (error) throw error;

      auditLogger.log('environmental_clean', 'room_cleaning_completed', {
        roomId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const friendlyError = createUserFriendlyError(
        error,
        'completeRoomCleaning'
      );
      console.error('❌ Error completing room cleaning:', friendlyError);
      throw friendlyError;
    }
  }
}
