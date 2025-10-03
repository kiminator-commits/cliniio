import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
  useCallback,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { logger } from '../utils/_core/logger';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  title?: string; // e.g., "Dr.", "Nurse", etc.
  avatar_url?: string | null;
  facility_id?: string; // Add facility_id to User interface
}

interface UserContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  getUserDisplayName: () => string;
  refreshUserData: () => Promise<void>;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Try to get user from localStorage on initialization
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        // Check if user data is still valid (not expired)
        if (parsed && parsed.id) {
          return parsed;
        }
      } catch (err) {
        console.error(err);
        console.warn('Failed to parse saved user data');
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  // Increase cache duration to 30 minutes to reduce frequent re-authentication
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  const getUserDisplayName = () => {
    if (!currentUser) {
      return 'Unknown User';
    }

    // If name is empty or just whitespace, use email as fallback
    if (!currentUser.name || currentUser.name.trim() === '') {
      return currentUser.email || 'Unknown User';
    }

    // Return just the name without any title
    return currentUser.name;
  };

  const handleSetCurrentUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
      setLastFetchTime(Date.now());
    } else {
      localStorage.removeItem('currentUser');
      setLastFetchTime(0);
    }
  };

  const refreshUserData = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (isLoading) {
      return;
    }

    // Check if we have recent cached data
    const now = Date.now();
    if (currentUser && now - lastFetchTime < CACHE_DURATION) {
      logger.info('✅ UserContext: Using cached user data');
      setHasInitialized(true);
      return;
    }

    try {
      setIsLoading(true);
      logger.info('🔄 UserContext: Starting user data refresh...');

      // Check if we have an active Supabase session before proceeding
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        logger.info(
          '⚠️ UserContext: No active Supabase session, skipping refresh'
        );
        setHasInitialized(true);
        return;
      }

      // Add timeout to prevent hanging - reduced to 5 seconds for faster failure
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('User data fetch timeout')), 5000);
      });

      const fetchPromise = (async () => {
        const startTime = Date.now();

        // Get user auth data
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error('❌ UserContext: Auth error:', authError);
          return;
        }

        if (!user) {
          logger.info('⚠️ UserContext: No authenticated user found');
          return;
        }

        logger.info('✅ UserContext: Found authenticated user:', user.id);
        const authTime = Date.now() - startTime;
        logger.info(`⏱️ UserContext: Auth fetch took ${authTime}ms`);

        // Get user profile data
        const profileStartTime = Date.now();
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error(
            '❌ UserContext: Failed to fetch user profile:',
            profileError
          );
          return;
        }

        const profileTime = Date.now() - profileStartTime;
        logger.info(`⏱️ UserContext: Profile fetch took ${profileTime}ms`);
        logger.info(
          `⏱️ UserContext: Total fetch time: ${Date.now() - startTime}ms`
        );

        if (userProfile) {
          // Transform the user data to match our User interface
          const transformedUser: User = {
            id: userProfile.id as string,
            name:
              `${userProfile.first_name || ''} ${userProfile.last_name || ''}`.trim() ||
              (userProfile.email as string)?.split('@')[0] ||
              'User',
            email: userProfile.email as string,
            role: userProfile.role as string,
            avatar_url: userProfile.avatar_url as string | null,
            facility_id: userProfile.facility_id as string, // Include facility_id
          };

          // Map database role to display role
          const roleMapping: Record<string, string> = {
            admin: 'Administrator',
            manager: 'Manager',
            user: 'User',
            viewer: 'Viewer',
          };

          const userRole =
            typeof userProfile.role === 'string' ? userProfile.role : 'user';
          transformedUser.role = roleMapping[userRole] || userRole;

          setCurrentUser(transformedUser);
          setLastFetchTime(now);
        }
      })();

      // Race between fetch and timeout
      await Promise.race([fetchPromise, timeoutPromise]);
    } catch (error) {
      if (error instanceof Error && error.message.includes('timeout')) {
        logger.warn(
          '⚠️ UserContext: User data fetch timed out, this may indicate database performance issues'
        );
      }
      console.error('❌ UserContext: Error refreshing user data:', error);
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  }, [isLoading, currentUser, lastFetchTime, CACHE_DURATION]);

  // Optimize initialization to be non-blocking
  useEffect(() => {
    if (!hasInitialized) {
      const now = Date.now();

      // If we have cached user data that's still valid, use it immediately
      if (currentUser && now - lastFetchTime < CACHE_DURATION) {
        setHasInitialized(true);
        return;
      }

      // Defer authentication to avoid blocking initial render
      const timer = setTimeout(() => {
        if (process.env.NODE_ENV === 'development' || currentUser) {
          refreshUserData();
        } else {
          setHasInitialized(true);
        }
      }, 100); // Small delay to avoid blocking render

      return () => clearTimeout(timer);
    }
  }, [
    hasInitialized,
    currentUser,
    lastFetchTime,
    CACHE_DURATION,
    refreshUserData,
  ]);

  return (
    <UserContext.Provider
      value={{
        currentUser,
        setCurrentUser: handleSetCurrentUser,
        getUserDisplayName,
        refreshUserData,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
