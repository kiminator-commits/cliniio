import { supabase } from '@/lib/supabaseClient';
import { Database } from '@/types/database.types';
import { handleSupabaseError } from '@/lib/supabase';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];

export interface AuthResponse {
  user: User | null;
  session: Record<string, unknown> | null;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials extends LoginCredentials {
  fullName: string;
  role?: 'admin' | 'user' | 'manager';
}

export class SupabaseAuthService {
  /**
   * Sign in with email and password
   */
  static async signIn({
    email,
    password,
  }: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Check if data and data.user exist before accessing data.user.id
      if (data && data.user && data.user.id) {
        // Get user profile from our users table
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) {
          console.warn('Failed to fetch user profile:', profileError);
        }

        return {
          user: userProfile as User | null,
          session: data.session as Record<string, unknown>,
          error: null,
        };
      }

      return {
        user: null,
        session: null,
        error: 'No user data received',
      };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        user: null,
        session: null,
        error: authError.message,
      };
    }
  }

  /**
   * Sign up with email and password
   */
  static async signUp({
    email,
    password,
    fullName,
    role = 'user',
  }: SignUpCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Split full name into first and last name
        const nameParts = fullName.trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Create user profile in our users table
        const userProfile: UserInsert = {
          id: data.user.id,
          email: data.user.email!,
          first_name: firstName,
          last_name: lastName,
          role,
          facility_id: 'default', // TODO: Assign proper facility during signup process
        };

        const { error: profileError } = await supabase
          .from('users')
          .insert(userProfile);

        if (profileError) {
          console.warn('Failed to create user profile:', profileError);
        }

        return {
          user: userProfile as User,
          session: data.session as Record<string, unknown>,
          error: null,
        };
      }

      return {
        user: null,
        session: null,
        error: 'No user data received',
      };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        user: null,
        session: null,
        error: authError.message,
      };
    }
  }

  /**
   * Sign out the current user
   */
  static async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return { error: authError.message };
    }
  }

  /**
   * Get the current user session
   */
  static async getCurrentUser(): Promise<AuthResponse> {
    try {
      const {
        data: { user: supabaseUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        throw error;
      }

      if (!supabaseUser) {
        return {
          user: null,
          session: null,
          error: null,
        };
      }

      // CRITICAL: Wait for authentication to be fully established before database calls
      const session = await supabase.auth.getSession();
      if (!session.data.session) {
        return {
          user: null,
          session: null,
          error: 'No active session',
        };
      }

      // Get user profile from our users table
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.warn('Failed to fetch user profile:', profileError);
      }

      return {
        user: userProfile as User | null,
        session: null,
        error: null,
      };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        user: null,
        session: null,
        error: authError.message,
      };
    }
  }

  /**
   * Get the current session
   */
  static async getSession(): Promise<{
    session: Record<string, unknown> | null;
    error: string | null;
  }> {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        throw error;
      }

      return {
        session: session as Record<string, unknown>,
        error: null,
      };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        session: null,
        error: authError.message,
      };
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(
    userId: string,
    updates: Partial<User>
  ): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return {
        user: data as User,
        error: null,
      };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return {
        user: null,
        error: authError.message,
      };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(email: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return { error: authError.message };
    }
  }

  /**
   * Update password
   */
  static async updatePassword(
    newPassword: string
  ): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw error;
      }

      return { error: null };
    } catch (error) {
      const authError = handleSupabaseError(
        error as Error | { message?: string; error_description?: string }
      );
      return { error: authError.message };
    }
  }

  /**
   * Listen to auth state changes
   */
  static onAuthStateChange(
    callback: (event: string, session: Record<string, unknown>) => void
  ) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session as Record<string, unknown>);
    });
  }
}
