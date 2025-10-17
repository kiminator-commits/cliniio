import { supabase } from '../../lib/supabaseClient';
import { logger } from '../../utils/logger';

/**
 * ⚠️ SECURITY GUARD: HomeDataUserProvider
 * This class fetches user-specific data from the users table.
 * It should ONLY be called AFTER successful authentication to prevent unauthorized data access.
 */

export class HomeDataUserProvider {
  private cachedUser: {
    id: string;
    facility_id?: string;
    lastCheck: number;
  } | null = null;
  private readonly USER_CACHE_DURATION = 15 * 60 * 1000; // 15 minutes (unified with data cache)

  /**
   * Get cached user or fetch from Supabase with retry logic for race conditions
   */
  async getCachedUser() {
    // SECURITY CHECKPOINT: Ensure we're not on the login page
    if (
      typeof window !== 'undefined' &&
      window.location.pathname === '/login'
    ) {
      return null;
    }
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

    // CRITICAL: Don't make database calls until user is properly authenticated
    if (!user) {
      return null;
    }

    // Wait for authentication to be fully established
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      return null;
    }

    if (user) {
      // Retry logic for race conditions where user profile might not exist yet
      const maxRetries = 3;
      let lastError: Error | null = null;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          // Get user's facility from users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('facility_id')
            .eq('id', user.id)
            .single();

          if (userError) {
            // Check if this is a race condition (user doesn't exist yet)
            if (userError.code === 'PGRST116' || userError.code === '406') {
              lastError = userError;

              if (attempt < maxRetries - 1) {
                // Wait with exponential backoff for UserContext to create the profile
                const delay = Math.pow(2, attempt) * 500; // 500ms, 1s, 2s
                logger.info(
                  `HomeDataService: User profile not found (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                continue;
              }
            }

            logger.warn(
              `HomeDataService: User ${user.id} not found in users table or no facility_id. Error: ${userError?.message || 'No facility_id'}`
            );

            // Use development fallback for now
            this.cachedUser = {
              id: user.id,
              facility_id: '550e8400-e29b-41d4-a716-446655440000',
              lastCheck: now,
            };
            return this.cachedUser;
          }

          if (!userData?.facility_id) {
            logger.warn(
              `HomeDataService: User ${user.id} found but no facility_id`
            );

            // Use development fallback for now
            this.cachedUser = {
              id: user.id,
              facility_id: '550e8400-e29b-41d4-a716-446655440000',
              lastCheck: now,
            };
            return this.cachedUser;
          }

          // Success!
          this.cachedUser = {
            id: user.id,
            facility_id: userData.facility_id as string,
            lastCheck: now,
          };
          return this.cachedUser;
        } catch (error) {
          lastError = error as Error;

          if (attempt < maxRetries - 1) {
            const delay = Math.pow(2, attempt) * 500;
            logger.info(
              `HomeDataService: API error (attempt ${attempt + 1}/${maxRetries}), retrying in ${delay}ms...`,
              error
            );
            await new Promise((resolve) => setTimeout(resolve, delay));
            continue;
          }

          // Final attempt failed
          logger.error(
            `HomeDataService: Final attempt failed after ${maxRetries} tries:`,
            error
          );
          break;
        }
      }

      // All retries failed
      logger.warn(
        `HomeDataService: All retries failed for user ${user.id}, using fallback. Last error: ${lastError?.message || 'Unknown'}`
      );

      // Use development fallback for now
      this.cachedUser = {
        id: user.id,
        facility_id: '550e8400-e29b-41d4-a716-446655440000',
        lastCheck: now,
      };
      return this.cachedUser;
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
