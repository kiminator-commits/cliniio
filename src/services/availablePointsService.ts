import { supabase } from '../lib/supabaseClient';

// Database row interfaces - removed unused interfaces

export interface AvailablePointsData {
  totalAvailable: number;
  pointsEarned: number;
  pointsRemaining: number;
  challengesCompleted: number;
  totalChallenges: number;
}

class AvailablePointsService {
  private async getCachedUser() {
    const { FacilityService } = await import('@/services/facilityService');
    const facilityId = await FacilityService.getCurrentFacilityId();
    const userId = await FacilityService.getCurrentUserId();
    if (!userId || !facilityId) {
      throw new Error(
        'No authenticated user or facility for availablePointsService'
      );
    }
    return {
      id: userId,
      facility_id: facilityId,
    };
  }

  async calculateAvailablePoints(): Promise<AvailablePointsData> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        console.log(
          'availablePointsService: No authenticated user found, returning defaults'
        );
        return {
          totalAvailable: 250,
          pointsEarned: 0,
          pointsRemaining: 250,
          challengesCompleted: 0,
          totalChallenges: 0,
        };
      }

      console.log(
        'availablePointsService: Calculating available points for user:',
        user.id
      );
      console.log(
        'availablePointsService: User facility_id:',
        user.facility_id
      );

      // Fetch all challenges for the facility
      const { data: allChallenges, error: challengesError } = await supabase
        .from('home_challenges')
        .select('id, points')
        .eq('facility_id', user.facility_id);

      if (challengesError) {
        console.error('Error fetching challenges:', challengesError);
        return {
          totalAvailable: 250,
          pointsEarned: 0,
          pointsRemaining: 250,
          challengesCompleted: 0,
          totalChallenges: 0,
        };
      }

      // Fetch completed challenges for the user
      const { data: completedChallenges, error: completionsError } =
        await supabase
          .from('home_challenge_completions')
          .select('challenge_id, points_earned')
          .eq('user_id', user.id)
          .eq('facility_id', user.facility_id);

      if (completionsError) {
        console.error(
          'Error fetching challenge completions:',
          completionsError
        );
        return {
          totalAvailable: 250,
          pointsEarned: 0,
          pointsRemaining: 250,
          challengesCompleted: 0,
          totalChallenges: allChallenges?.length || 0,
        };
      }

      // Calculate totals
      const totalChallenges = allChallenges?.length || 0;
      const challengesCompleted = completedChallenges?.length || 0;
      const totalAvailablePoints =
        (allChallenges as { points?: number }[])?.reduce(
          (sum: number, challenge: { points?: number }) =>
            sum + ((challenge.points as number) || 0),
          0
        ) || 0;
      const pointsEarned =
        (completedChallenges as { points_earned?: number }[])?.reduce(
          (sum: number, completion: { points_earned?: number }) =>
            sum + ((completion.points_earned as number) || 0),
          0
        ) || 0;
      const pointsRemaining = totalAvailablePoints - pointsEarned;

      console.log('availablePointsService: Calculated points:', {
        totalChallenges,
        challengesCompleted,
        totalAvailablePoints,
        pointsEarned,
        pointsRemaining,
      });

      return {
        totalAvailable: totalAvailablePoints as number,
        pointsEarned: pointsEarned as number,
        pointsRemaining: Math.max(0, pointsRemaining as number),
        challengesCompleted,
        totalChallenges,
      };
    } catch (error) {
      console.error('Error in calculateAvailablePoints:', error);
      return {
        totalAvailable: 250,
        pointsEarned: 0,
        pointsRemaining: 250,
        challengesCompleted: 0,
        totalChallenges: 0,
      };
    }
  }
}

export const availablePointsService = new AvailablePointsService();
