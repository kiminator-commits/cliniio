import { supabase } from '@/lib/supabase';
import {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
} from '@/components/ChallengeModal';
import { logger } from '../utils/_core/logger';

interface UserRow {
  id: string;
  facility_id: string;
}

export interface ChallengeCompletion {
  id: string;
  challenge_id: string;
  user_id: string;
  facility_id: string;
  completed_at: string;
  points_earned: number;
}

export interface CreateChallengeCompletionData {
  challenge_id: string;
  points_earned: number;
}

class ChallengeService {
  private lastLogTime: number = 0; // Prevent duplicate logs in StrictMode
  private lastRawLogTime: number = 0; // Separate throttling for raw data logs

  private async getCachedUser() {
    const { FacilityService } = await import('@/services/facilityService');
    const { userId, facilityId } =
      await FacilityService.getCurrentUserAndFacility();
    if (!userId || !facilityId) {
      throw new Error('No authenticated user or facility for challengeService');
    }
    return {
      id: userId,
      facility_id: facilityId,
    };
  }

  private async getCachedUserOld() {
    // In production, get from auth context
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // CRITICAL: Wait for authentication to be fully established before database calls
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      return null;
    }

    // Fetch user profile from database to get facility_id
    const { data: userProfile, error } = await supabase
      .from('users')
      .select('id, facility_id')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);

      // If user doesn't exist in users table, create them with a default facility
      console.log('Creating user profile for:', user.id);

      // Get current facility ID
      const { FacilityService } = await import('@/services/facilityService');
      const facilityId = await FacilityService.getCurrentFacilityId();

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          facility_id: facilityId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select('id, facility_id')
        .single();

      if (createError) {
        console.error('Error creating user profile:', createError);
        return null;
      }

      return newUser;
    }

    return userProfile;
  }

  async fetchChallenges(): Promise<Challenge[]> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        logger.debug(
          'challengeService: No authenticated user found, returning empty array'
        );
        return [];
      }

      logger.debug(
        'challengeService: Fetching challenges for facility:',
        (user as UserRow).facility_id
      );

      // Single optimized query instead of duplicate queries
      const { data, error } = await supabase
        .from('home_challenges')
        .select('*')
        .eq('facility_id', (user as UserRow).facility_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      // Only log once per calculation to avoid StrictMode duplicate logs
      const now = Date.now();
      if (now - this.lastRawLogTime > 1000) {
        // Only log once per second
        logger.debug('challengeService: Raw challenges data:', data);
        this.lastRawLogTime = now;
      }

      // Transform the data to match the Challenge interface
      const challenges: Challenge[] = (data as Record<string, unknown>[]).map(
        (challenge: Record<string, unknown>) => ({
          id: challenge.id as string,
          title: challenge.title as string,
          description: challenge.description as string,
          category: challenge.category as ChallengeCategory,
          difficulty: challenge.difficulty as ChallengeDifficulty,
          points: challenge.points as number,
          timeEstimate: challenge.time_estimate as string,
          completed: false, // We'll check completions separately
        })
      );

      // Get user's completed challenges to mark them as completed
      const completedChallenges = await this.getUserCompletedChallenges();
      const completedIds = new Set(
        completedChallenges.map((c) => c.challenge_id)
      );

      challenges.forEach((challenge) => {
        challenge.completed = completedIds.has(challenge.id);
      });

      // Only log once per calculation to avoid StrictMode duplicate logs
      if (now - this.lastLogTime > 1000) {
        // Only log once per second
        logger.debug('challengeService: Transformed challenges:', challenges);
        this.lastLogTime = now;
      }
      return challenges;
    } catch (error) {
      console.error('Error in fetchChallenges:', error);
      return [];
    }
  }

  async getUserCompletedChallenges(): Promise<ChallengeCompletion[]> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        logger.debug(
          'challengeService: No authenticated user found for completed challenges'
        );
        return [];
      }

      const { data, error } = await supabase
        .from('home_challenge_completions')
        .select('*')
        .eq('user_id', (user as UserRow).id)
        .eq('facility_id', (user as UserRow).facility_id)
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed challenges:', error);
        return [];
      }

      return (data as unknown as ChallengeCompletion[]) || [];
    } catch (error) {
      console.error('Error in getUserCompletedChallenges:', error);
      return [];
    }
  }

  async completeChallenge(
    completionData: CreateChallengeCompletionData
  ): Promise<boolean> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        console.error(
          'challengeService: No authenticated user found for challenge completion'
        );
        return false;
      }

      const { data, error } = await supabase
        .from('home_challenge_completions')
        .insert({
          challenge_id: completionData.challenge_id,
          user_id: (user as UserRow).id,
          facility_id: (user as UserRow).facility_id,
          points_earned: completionData.points_earned,
        })
        .select()
        .single();

      if (error) {
        console.error('Error completing challenge:', error);
        return false;
      }

      logger.debug('challengeService: Challenge completed successfully:', data);
      return true;
    } catch (error) {
      console.error('Error in completeChallenge:', error);
      return false;
    }
  }

  async createChallenge(
    challengeData: Omit<Challenge, 'id' | 'completed'>
  ): Promise<Challenge | null> {
    try {
      const user = await this.getCachedUser();

      if (!user) {
        console.error(
          'challengeService: No authenticated user found for creating challenge'
        );
        return null;
      }

      const { data, error } = await supabase
        .from('home_challenges')
        .insert({
          title: challengeData.title,
          description: challengeData.description,
          category: challengeData.category,
          difficulty: challengeData.difficulty,
          points: challengeData.points,
          time_estimate: challengeData.timeEstimate,
          facility_id: (user as UserRow).facility_id,
          created_by: (user as UserRow).id,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating challenge:', error);
        return null;
      }

      return {
        id: (data as Record<string, unknown>).id as string,
        title: (data as Record<string, unknown>).title as string,
        description: (data as Record<string, unknown>).description as string,
        category: (data as Record<string, unknown>)
          .category as ChallengeCategory,
        difficulty: (data as Record<string, unknown>)
          .difficulty as ChallengeDifficulty,
        points: (data as Record<string, unknown>).points as number,
        timeEstimate: (data as Record<string, unknown>).time_estimate as string,
        completed: false,
      };
    } catch (error) {
      console.error('Error in createChallenge:', error);
      return null;
    }
  }
}

export const challengeService = new ChallengeService();
