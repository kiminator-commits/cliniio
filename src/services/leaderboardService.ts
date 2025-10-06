import { supabase } from '@/lib/supabaseClient';

export interface LeaderboardData {
  id: string;
  user_id: string;
  facility_id: string;
  points: number;
  rank: number;
  user_name: string;
  department: string;
  created_at: string;
  updated_at: string;
}

export const leaderboardService = {
  async fetchLeaderboard() {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Leaderboard fetch blocked — no authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('facility_id', user.user_metadata?.facility_id || '')
      .order('points', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      // Return empty array instead of throwing error
      return [];
    }

    return data || [];
  },

  async fetchLeaderboardData() {
    // Alias for fetchLeaderboard to maintain compatibility
    return this.fetchLeaderboard();
  },
};
