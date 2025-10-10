import { supabase } from '../../../lib/supabase';
import { CleaningAnalytics } from '../models';

// Define proper types for environmental clean data
interface EnvironmentalCleanRoom {
  id: string;
  room_name: string;
  status: string;
  scheduled_time: string;
  completed_time?: string;
  created_at: string;
}

interface RoomCounts {
  completed: number;
  pending: number;
  in_progress: number;
  failed: number;
  cancelled: number;
  verified: number;
}

interface DailyEfficiency {
  completed: number;
  total: number;
  efficiency: number;
}

export class EnvironmentalCleanAnalyticsService {
  /**
   * Fetch real-time analytics from Supabase
   */
  static async fetchAnalytics(): Promise<CleaningAnalytics> {
    try {
      console.log('📊 Fetching analytics from Supabase...');

      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select('status, completed_time, scheduled_time, created_at');

      if (error) throw error;

      const roomData = (data || []) as unknown as EnvironmentalCleanRoom[];

      const totalRooms = roomData.length;
      const cleanRooms = roomData.filter(
        (room) =>
          room.status === 'clean' ||
          room.status === 'completed' ||
          room.status === 'verified'
      ).length;
      const dirtyRooms = roomData.filter(
        (room) => room.status === 'dirty' || room.status === 'pending'
      ).length;
      const inProgressRooms = roomData.filter(
        (room) => room.status === 'in_progress'
      ).length;
      const biohazardRooms = roomData.filter(
        (room) => room.status === 'biohazard'
      ).length;
      const theftRooms = roomData.filter(
        (room) => room.status === 'theft'
      ).length;
      const lowInventoryRooms = roomData.filter(
        (room) => room.status === 'low_inventory'
      ).length;
      const outOfServiceRooms = roomData.filter(
        (room) => room.status === 'out_of_service'
      ).length;
      const publicAreas = roomData.filter(
        (room) => room.status === 'public_areas'
      ).length;

      const cleaningEfficiency =
        totalRooms > 0 ? Math.round((cleanRooms / totalRooms) * 100) : 0;

      // Calculate average cleaning time (simplified)
      const completedRooms = roomData.filter(
        (room) => room.completed_time && room.scheduled_time
      );
      let averageCleaningTime = 0;

      if (completedRooms.length > 0) {
        const totalTime = completedRooms.reduce((sum, room) => {
          const start = new Date(room.scheduled_time).getTime();
          const end = new Date(room.completed_time).getTime();
          return sum + (end - start);
        }, 0);
        averageCleaningTime = Math.round(
          totalTime / completedRooms.length / (1000 * 60)
        ); // Convert to minutes
      }

      const analytics: CleaningAnalytics = {
        totalRooms,
        cleanRooms,
        dirtyRooms,
        inProgressRooms,
        biohazardRooms,
        theftRooms,
        lowInventoryRooms,
        outOfServiceRooms,
        publicAreas,
        cleaningEfficiency,
        averageCleaningTime,
        lastUpdated: new Date().toISOString(),
      };

      console.log('✅ Analytics fetched successfully:', analytics);
      return analytics;
    } catch (error) {
      console.error('❌ Error fetching analytics:', error);
      throw error;
    }
  }

  /**
   * Get room counts by status for detailed analytics
   */
  static async getRoomCountsByStatus() {
    try {
      console.log('📊 Fetching room counts from Supabase...');

      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select('status');

      if (error) throw error;

      const roomData = (data || []) as unknown as EnvironmentalCleanRoom[];

      const counts: RoomCounts = {
        completed: roomData.filter(
          (room) => room.status === 'clean' || room.status === 'completed'
        ).length,
        pending: roomData.filter(
          (room) => room.status === 'dirty' || room.status === 'pending'
        ).length,
        in_progress: roomData.filter((room) => room.status === 'in_progress')
          .length,
        failed: roomData.filter((room) => room.status === 'failed').length,
        cancelled: roomData.filter((room) => room.status === 'cancelled')
          .length,
        verified: roomData.filter((room) => room.status === 'verified').length,
      };

      console.log('✅ Room counts fetched successfully:', counts);
      return counts;
    } catch (error) {
      console.error('❌ Error getting room counts by status:', error);
      throw error;
    }
  }

  /**
   * Get recently completed cleanings
   */
  static async getRecentlyCompletedCleanings(limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select('room_name, completed_time, cleaner_id')
        .eq('status', 'clean')
        .not('completed_time', 'is', null)
        .order('completed_time', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const roomData = (data || []) as unknown as EnvironmentalCleanRoom[];

      const recentlyCleaned = roomData.map((item: EnvironmentalCleanRoom) => ({
        room: (item.room_name as string) || 'Unknown Room',
        cleanedAt: item.completed_time as string,
        cleanedBy: (item as { cleaner_id?: string }).cleaner_id
          ? `Cleaner ${(item as { cleaner_id?: string }).cleaner_id}`
          : 'System',
      }));

      return recentlyCleaned;
    } catch (error) {
      console.error('❌ Error getting recently completed cleanings:', error);
      throw error;
    }
  }

  /**
   * Get cleaning efficiency trends
   */
  static async getCleaningEfficiencyTrends(days: number = 7) {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('environmental_cleans_enhanced')
        .select('status, completed_time, scheduled_time, created_at')
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const roomData = (data || []) as unknown as EnvironmentalCleanRoom[];

      // Group by day and calculate efficiency
      const dailyEfficiency: Record<string, DailyEfficiency> = {};

      roomData.forEach((room) => {
        const date = new Date(room.created_at).toISOString().split('T')[0];

        if (!dailyEfficiency[date]) {
          dailyEfficiency[date] = { completed: 0, total: 0, efficiency: 0 };
        }

        dailyEfficiency[date].total++;

        if (room.status === 'completed' || room.status === 'verified') {
          dailyEfficiency[date].completed++;
        }
      });

      // Calculate efficiency for each day
      Object.keys(dailyEfficiency).forEach((date) => {
        const day = dailyEfficiency[date];
        day.efficiency =
          day.total > 0 ? Math.round((day.completed / day.total) * 100) : 0;
      });

      return dailyEfficiency;
    } catch (error) {
      console.error('❌ Error getting cleaning efficiency trends:', error);
      throw error;
    }
  }
}
