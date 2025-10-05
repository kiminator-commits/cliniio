// Auth Service Implementation
import {
  User,
  Session,
  AuthResponse,
  PostgrestError,
} from '@supabase/supabase-js';
import {
  SignInCredentials,
  SignUpCredentials,
  VerifyOtpParams,
  ResendParams,
  MockConfig,
} from '../types/supabaseMockTypes';
import {
  createMockUser,
  createMockSession,
  createMockError,
  createMockAuthError,
} from './mockGenerators';

export const createAuthService = (
  config: MockConfig,
  mockUser: User,
  mockSession: Session
) => ({
  async getUser(): Promise<AuthResponse> {
    if (config.shouldError) {
      return {
        data: { user: null, session: null },
        error: createMockAuthError(config.errorMessage),
      };
    }
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    };
  },

  async getSession(): Promise<{
    data: { session: Session | null };
    error: PostgrestError | null;
  }> {
    if (config.shouldError) {
      return {
        data: { session: null },
        error: createMockError(config.errorMessage),
      };
    }
    return {
      data: { session: mockSession },
      error: null,
    };
  },

  async signInWithPassword(
    _credentials: SignInCredentials
  ): Promise<AuthResponse> {
    if (config.shouldError) {
      return {
        data: { user: null, session: null },
        error: createMockAuthError(config.errorMessage),
      };
    }
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    };
  },

  async signUp(_credentials: SignUpCredentials): Promise<AuthResponse> {
    if (config.shouldError) {
      return {
        data: { user: null, session: null },
        error: createMockAuthError(config.errorMessage),
      };
    }
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    };
  },

  async signOut(): Promise<{ error: PostgrestError | null }> {
    return { error: null };
  },

  onAuthStateChange(
    _callback: (event: string, session: Session | null) => void
  ): {
    data: { subscription: { unsubscribe: () => void } };
  } {
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            // console.log('[MOCK] Auth state change unsubscribed');
          },
        },
      },
    };
  },

  async refreshSession(): Promise<AuthResponse> {
    if (config.shouldError) {
      return {
        data: { user: null, session: null },
        error: createMockAuthError(config.errorMessage),
      };
    }
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    };
  },

  async setSession(session: Session): Promise<AuthResponse> {
    return {
      data: { user: session.user, session },
      error: null,
    };
  },

  async setUser(user: User): Promise<AuthResponse> {
    return {
      data: { user, session: null },
      error: null,
    };
  },

  async updateUser(attributes: Partial<User>): Promise<AuthResponse> {
    const updatedUser = { ...mockUser, ...attributes };
    return {
      data: { user: updatedUser, session: mockSession },
      error: null,
    };
  },

  async resetPasswordForEmail(
    _email: string,
    _options?: { redirectTo?: string }
  ): Promise<{
    data: Record<string, never>;
    error: PostgrestError | null;
  }> {
    return { data: {}, error: null };
  },

  async verifyOtp(_params: VerifyOtpParams): Promise<AuthResponse> {
    if (config.shouldError) {
      return {
        data: { user: null, session: null },
        error: createMockAuthError(config.errorMessage),
      };
    }
    return {
      data: { user: mockUser, session: mockSession },
      error: null,
    };
  },

  async resend(_params: ResendParams): Promise<{
    data: Record<string, never>;
    error: PostgrestError | null;
  }> {
    return { data: {}, error: null };
  },
});
