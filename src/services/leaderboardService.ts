import { supabase } from '../lib/supabaseClient';

export interface LeaderboardData {
  id: string;
  user_id: string;
  facility_id: string;
  total_points: number;
  completed_tasks: number;
  current_streak: number;
  best_streak: number;
  created_at: string;
  updated_at: string;
  user_name?: string;
  department?: string;
  rank?: number;
}

export const leaderboardService = {
  async fetchLeaderboard(facilityId?: string) {
    // If no facilityId provided, try to get it from auth user metadata as fallback
    let currentFacilityId = facilityId;
    
    if (!currentFacilityId) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('Leaderboard fetch blocked — no authenticated user');
        return [];
      }

      currentFacilityId = user.user_metadata?.facility_id;
    }

    if (!currentFacilityId) {
      console.warn('No facility ID available for leaderboard fetch');
      return [];
    }

    const { data, error } = await supabase
      .from('user_gamification_stats')
      .select(`
        id,
        user_id,
        facility_id,
        total_points,
        completed_tasks,
        current_streak,
        best_streak,
        created_at,
        updated_at,
        user_facilities!inner(user_id, users!inner(email, user_metadata))
      `)
      .eq('facility_id', currentFacilityId)
      .order('total_points', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      // Return empty array instead of throwing error
      return [];
    }

    // Process the data to add ranking and user names
    const processedData = (data || []).map((item, index) => ({
      ...item,
      rank: index + 1,
      user_name: item.user_facilities?.[0]?.users?.[0]?.email?.split('@')[0] || 'Anonymous',
      department: item.user_facilities?.[0]?.users?.[0]?.user_metadata?.department || 'Unknown',
      points: item.total_points, // Keep backward compatibility
    }));

    return processedData;
  },

  async fetchLeaderboardData(facilityId?: string) {
    // Alias for fetchLeaderboard to maintain compatibility
    return this.fetchLeaderboard(facilityId);
  },
};
