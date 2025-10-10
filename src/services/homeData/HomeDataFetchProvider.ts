import { getScopedClient } from '../../lib/supabaseClient';
import { HomePageData, HomeTask } from '../../types/homeTypes';
import { logger } from '../../utils/logger';

export class HomeDataFetchProvider {
  /**
   * Fetch fresh data from the database
   */
  async fetchFreshData(
    user: {
      id: string;
      facility_id?: string;
      lastCheck: number;
    },
    facilityId?: string
  ): Promise<HomePageData> {
    logger.info(
      'HomeDataService: Fetching fresh data for facility:',
      facilityId || user.facility_id
    );

    const supabase = getScopedClient(facilityId || user.facility_id);

    // Fetch challenges and completions separately to avoid complex SQL parsing issues
    const { data: challengesData, error: challengesError } = await supabase
      .from('home_challenges')
      .select(
        'id, title, description, points, created_at, updated_at, facility_id'
      )
      .eq('facility_id', facilityId || user.facility_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (challengesError) {
      logger.error('Error fetching challenges:', challengesError);
      // Return empty data instead of throwing error
      return {
        tasks: [],
        availablePoints: 0,
        completedTasksCount: 0,
        totalTasksCount: 0,
      };
    }

    // Fetch completions for the user
    const { data: completionsData, error: completionsError } = await supabase
      .from('home_challenge_completions')
      .select('challenge_id, points_earned')
      .eq('user_id', user.id)
      .eq('facility_id', facilityId || user.facility_id);

    if (completionsError) {
      logger.error('Error fetching completions:', completionsError);
      // Continue with empty completions if there's an error
    }

    // Create a map of challenge completions for quick lookup
    const completionsMap = new Map();
    (completionsData || []).forEach((completion) => {
      completionsMap.set(completion.challenge_id, completion);
    });

    // Process the challenges data with completion information
    const tasks: HomeTask[] = (challengesData || []).map((challenge) => {
      const completion = completionsMap.get(challenge.id);
      const isCompleted = !!completion;
      const pointsEarned = completion?.points_earned || 0;

      return {
        id: challenge.id as string,
        title: challenge.title as string,
        description: (challenge.description as string) || '',
        category: (challenge as { category?: string }).category || 'general',
        difficulty:
          (challenge as { difficulty?: string }).difficulty || 'medium',
        points: challenge.points as number,
        timeEstimate:
          (challenge as { time_estimate?: string }).time_estimate ||
          '5 minutes',
        isCompleted: isCompleted,
        completedAt: completion?.completed_at || null,
        pointsEarned: pointsEarned,
        createdAt: challenge.created_at as string,
        updatedAt: challenge.updated_at as string,
      };
    });

    return {
      tasks,
      availablePoints: 0, // Will be calculated by metrics provider
      completedTasksCount: 0, // Will be calculated by metrics provider
      totalTasksCount: tasks.length,
    };
  }

  /**
   * Fetch optimized data with pagination
   */
  async fetchOptimizedData(
    user: {
      id: string;
      facility_id?: string;
      lastCheck: number;
    },
    page: number = 1,
    pageSize: number = 20,
    facilityId?: string
  ): Promise<{
    tasks: HomeTask[];
    totalCount: number;
    completedCount: number;
    availablePoints: number;
  }> {
    const offset = (page - 1) * pageSize;
    const supabase = getScopedClient(facilityId || user.facility_id);

    // First, get total count for pagination
    const { count: totalCount } = await supabase
      .from('home_challenges')
      .select('*', { count: 'exact', head: true })
      .eq('facility_id', facilityId || user.facility_id)
      .eq('is_active', true);

    // Then fetch paginated data with completions
    const { data: challengesData, error: challengesError } = await supabase
      .from('home_challenges')
      .select(
        `
        *,
        completion_data:home_challenge_completions!left(
          completed:completed_at,
          completed_at,
          points_earned
        )
      `
      )
      .eq('facility_id', facilityId || user.facility_id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (challengesError) {
      logger.error('Error fetching challenges:', challengesError);
      throw new Error(`Failed to fetch challenges: ${challengesError.message}`);
    }

    // Transform the data to match expected format
    const tasks: HomeTask[] = (challengesData || []).map(
      (challenge: Record<string, unknown>) => {
        const completionData = (
          challenge.completion_data as {
            completed?: boolean;
            completed_at?: string;
            points_earned?: number;
          }[]
        )?.[0];
        return {
          id: challenge.id as string,
          title: challenge.title as string,
          description: challenge.description as string,
          category: (challenge as { category?: string }).category || 'General',
          difficulty:
            (challenge as { difficulty?: string }).difficulty || 'Medium',
          points: challenge.points as number,
          timeEstimate:
            (challenge as { time_estimate?: string }).time_estimate ||
            '5 minutes',
          isCompleted: !!completionData?.completed,
          completedAt: completionData?.completed_at || null,
          pointsEarned: completionData?.points_earned || 0,
          createdAt: challenge.created_at as string,
          updatedAt: challenge.updated_at as string,
        };
      }
    );

    // Get user's available points
    const { data: pointsData, error: pointsError } = await supabase
      .from('home_challenge_completions')
      .select('points_earned')
      .eq('user_id', user.id)
      .eq('facility_id', facilityId || user.facility_id);

    if (pointsError) {
      logger.error('Error fetching points:', pointsError);
    }

    const availablePoints = (pointsData || []).reduce(
      (sum, item) =>
        sum + ((item as { points_earned?: number }).points_earned || 0),
      0
    );

    // Get completed tasks count
    const { count: completedCount, error: completedError } = await supabase
      .from('home_challenge_completions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('facility_id', facilityId || user.facility_id);

    if (completedError) {
      logger.error('Error fetching completed count:', completedError);
    }

    return {
      tasks,
      totalCount: totalCount || 0,
      completedCount: completedCount || 0,
      availablePoints,
    };
  }
}
