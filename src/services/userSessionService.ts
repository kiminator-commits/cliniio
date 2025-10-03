import { supabase } from '../lib/supabase';

export interface UserSession {
  id: string;
  user_id: string;
  session_token: string;
  device_info: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  login_time: string;
  last_activity: string;
  is_active: boolean;
  logout_time?: string;
  created_at: string;
  updated_at: string;
}

export class UserSessionService {
  /**
   * Create a new login session for a user
   */
  static async createSession(
    userId: string,
    sessionToken: string,
    deviceInfo?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ session: UserSession | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .insert({
          id: crypto.randomUUID(),
          user_id: userId,
          session_token: sessionToken,
          device_info: deviceInfo as Record<string, unknown>,
          ip_address: ipAddress,
          user_agent: userAgent,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;

      return { session: data as unknown as UserSession, error: null };
    } catch (error) {
      console.error('Error creating user session:', error);
      return {
        session: null,
        error:
          error instanceof Error ? error.message : 'Failed to create session',
      };
    }
  }

  /**
   * Mark a session as inactive (logout)
   */
  static async deactivateSession(
    sessionToken: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          logout_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken)
        .eq('is_active', true);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error deactivating user session:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to deactivate session',
      };
    }
  }

  /**
   * Get all active sessions for a user
   */
  static async getActiveSessions(
    userId: string
  ): Promise<{ sessions: UserSession[]; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('login_time', { ascending: false });

      if (error) throw error;

      return { sessions: data as unknown as UserSession[], error: null };
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return {
        sessions: [],
        error:
          error instanceof Error ? error.message : 'Failed to get sessions',
      };
    }
  }

  /**
   * Update last activity for a session
   */
  static async updateLastActivity(
    sessionToken: string
  ): Promise<{ success: boolean; error: string | null }> {
    try {
      const { error } = await supabase
        .from('user_sessions')
        .update({
          last_activity: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('session_token', sessionToken)
        .eq('is_active', true);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error updating session activity:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to update activity',
      };
    }
  }

  /**
   * Clean up expired sessions (older than 24 hours)
   */
  static async cleanupExpiredSessions(): Promise<{
    success: boolean;
    error: string | null;
  }> {
    try {
      const cutoffTime = new Date(
        Date.now() - 24 * 60 * 60 * 1000
      ).toISOString();

      const { error } = await supabase
        .from('user_sessions')
        .update({
          is_active: false,
          logout_time: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .lt('last_activity', cutoffTime)
        .eq('is_active', true);

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Error cleaning up expired sessions:', error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'Failed to cleanup sessions',
      };
    }
  }

  /**
   * Get device info from browser
   */
  static getDeviceInfo(): Record<string, unknown> {
    return {
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      screenWidth: screen.width,
      screenHeight: screen.height,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }
}
