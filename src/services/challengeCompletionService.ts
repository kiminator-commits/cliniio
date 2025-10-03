import { supabase } from '../lib/supabaseClient';

export interface ChallengeCompletion {
  challenge_id: string;
  user_id: string;
  facility_id: string;
  points_earned: number;
  completed_at: string;
}

class ChallengeCompletionService {
  private getCachedUser() {
    // For development, provide a mock user context
    if (process.env.NODE_ENV === 'development') {
      return {
        id: '550e8400-e29b-41d4-a716-446655440001',
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
      };
    }

    // In production, get from auth context
    return null;
  }

  async completeChallenge(
    challengeId: string,
    points: number
  ): Promise<boolean> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        console.error(
          'challengeCompletionService: No authenticated user found'
        );
        return false;
      }

      console.log(
        'challengeCompletionService: Completing challenge:',
        challengeId,
        'for user:',
        user.id
      );

      // Check if challenge already completed
      const { data: existingCompletion } = await supabase
        .from('home_challenge_completions')
        .select('id')
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id)
        .eq('facility_id', user.facility_id)
        .single();

      if (existingCompletion) {
        console.log('challengeCompletionService: Challenge already completed');
        return true; // Already completed, consider it successful
      }

      // Insert new completion
      const { data, error } = await supabase
        .from('home_challenge_completions')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          facility_id: user.facility_id,
          points_earned: points,
          completed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Error completing challenge:', error);
        return false;
      }

      console.log(
        'challengeCompletionService: Challenge completed successfully:',
        data
      );
      return true;
    } catch (error) {
      console.error('Error in completeChallenge:', error);
      return false;
    }
  }

  async getCompletedChallenges(): Promise<string[]> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        console.log(
          'challengeCompletionService: No authenticated user found, returning empty array'
        );
        return [];
      }

      const { data: completions, error } = await supabase
        .from('home_challenge_completions')
        .select('challenge_id')
        .eq('user_id', user.id)
        .eq('facility_id', user.facility_id);

      if (error) {
        console.error('Error fetching completed challenges:', error);
        return [];
      }

      return completions?.map((c) => c.challenge_id as string) || [];
    } catch (error) {
      console.error('Error in getCompletedChallenges:', error);
      return [];
    }
  }
}

export const challengeCompletionService = new ChallengeCompletionService();
