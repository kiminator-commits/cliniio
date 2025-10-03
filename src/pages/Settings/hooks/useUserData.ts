import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../../lib/supabase';

interface UserData {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string;
  department: string;
  position: string;
  date_of_birth: string;
  bio: string;
  preferred_language: string;
  timezone: string;
  avatar_url?: string;
  active_sessions: number;
}

export const useUserData = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      let { data: profileData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      // If no profile exists, create a default one
      if (!profileData) {
        const defaultProfile = {
          id: user.id,
          email: user.email || '',
          first_name: '',
          last_name: '',
          role: 'user' as const,
          phone: '',
          department: '',
          position: '',
          date_of_birth: '',
          bio: '',
          preferred_language: 'en',
          timezone: 'UTC',
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('users')
          .insert(defaultProfile)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default profile:', insertError);
          // Still set the form with basic user info
          profileData = {
            ...defaultProfile,
            active_sessions: 0,
          };
        } else {
          profileData = newProfile;
        }
      }

      if (profileData) {
        // Fetch the current active_sessions count
        try {
          const { data: sessionsData } = await supabase
            .from('user_sessions')
            .select('id')
            .eq('user_id', user.id)
            .eq('is_active', true);

          const activeSessionsCount = sessionsData?.length || 0;

          // Update the profile data with the real active sessions count
          const updatedProfileData: UserData = {
            ...profileData,
            active_sessions: activeSessionsCount,
          } as UserData;

          setUserData(updatedProfileData);
        } catch (sessionsError) {
          console.warn('Failed to fetch active sessions count:', sessionsError);
          setUserData({ ...profileData, active_sessions: 0 } as UserData);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to fetch user data';
      setError(errorMessage);
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshUserData = useCallback(() => {
    fetchUserData();
  }, [fetchUserData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  return {
    userData,
    loading,
    error,
    refreshUserData,
  };
};
