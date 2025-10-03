import { supabase } from '../../lib/supabaseClient';
import { logger } from '../../utils/logger';

export class HomeDataUserProvider {
  private cachedUser: {
    id: string;
    facility_id?: string;
    lastCheck: number;
  } | null = null;
  private readonly USER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (unified with data cache)

  /**
   * Get cached user or fetch from Supabase
   */
  async getCachedUser() {
    const now = Date.now();
    if (
      this.cachedUser &&
      now - this.cachedUser.lastCheck < this.USER_CACHE_DURATION
    ) {
      return this.cachedUser;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      // Get user's facility from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('facility_id')
        .eq('id', user.id)
        .single();

      if (userError || !userData?.facility_id) {
        // Only use fallback in development
        if (process.env.NODE_ENV === 'development') {
          logger.warn(
            'HomeDataService: No facility_id found for user, using development fallback'
          );
          this.cachedUser = {
            id: user.id,
            facility_id: '550e8400-e29b-41d4-a716-446655440000',
            lastCheck: now,
          };
          return this.cachedUser;
        }

        throw new Error('User facility not found');
      }

      this.cachedUser = {
        id: user.id,
        facility_id: userData.facility_id as string,
        lastCheck: now,
      };
    }
    return this.cachedUser;
  }

  /**
   * Clear user cache
   */
  clearUserCache(): void {
    this.cachedUser = null;
  }

  /**
   * Get user cache duration
   */
  getUserCacheDuration(): number {
    return this.USER_CACHE_DURATION;
  }
}
