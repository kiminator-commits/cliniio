console.log('🚀 loginService.ts loaded at:', new Date().toISOString());

import { supabase } from '@/lib/supabaseClient';
import { rateLimitService, RateLimitInfo } from './rateLimitService';
import { sessionManager } from '@/lib/sessionManager';
import { UserSessionService } from './userSessionService';
import { LOGIN_ERRORS } from '@/constants/loginConstants';
import { LoginAnalyticsData } from '@/hooks/useLoginAnalytics';
import type { User, Session } from '@supabase/supabase-js';

export interface LoginResult {
  success: boolean;
  session?: Session;
  user?: User;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
}

export interface LoginAttemptData {
  email: string;
  password: string;
  stage: string;
  otp?: string;
  rememberMe: boolean;
  rememberDevice: boolean;
}

// Helper function to get user-friendly error message from Supabase error
export const getSupabaseErrorMessage = (
  error:
    | {
        code?: string;
        status?: string;
        message?: string;
      }
    | unknown
): string => {
  if (!error) return LOGIN_ERRORS.unexpectedError;

  // Type guard to safely access error properties
  const errorObj = error as {
    code?: string;
    status?: string;
    message?: string;
  };
  const errorCode = errorObj.code || errorObj.status;
  const errorMessage = errorObj.message || '';

  // Map Supabase error codes to user-friendly messages
  switch (errorCode) {
    case 'INVALID_LOGIN_CREDENTIALS':
    case 'invalid_grant':
      return LOGIN_ERRORS.invalidCredentials;

    case 'USER_NOT_FOUND':
    case 'user_not_found':
      return LOGIN_ERRORS.userNotFound;

    case 'INVALID_EMAIL':
    case 'invalid_email':
      return LOGIN_ERRORS.invalidEmail;

    case 'WEAK_PASSWORD':
    case 'weak_password':
      return LOGIN_ERRORS.weakPassword;

    case 'EMAIL_NOT_CONFIRMED':
    case 'email_not_confirmed':
      return LOGIN_ERRORS.emailNotConfirmed;

    case 'TOO_MANY_REQUESTS':
    case 'too_many_requests':
      return LOGIN_ERRORS.tooManyRequests;

    case 'ACCOUNT_LOCKED':
    case 'account_locked':
      return LOGIN_ERRORS.accountLocked;

    case 'NETWORK_ERROR':
    case 'network_error':
      return LOGIN_ERRORS.networkError;

    case 'SERVER_ERROR':
    case 'server_error':
      return LOGIN_ERRORS.serverError;

    case 'SESSION_EXPIRED':
    case 'session_expired':
      return LOGIN_ERRORS.sessionExpired;

    default:
      // Check error message content for common patterns
      if (
        errorMessage.toLowerCase().includes('invalid credentials') ||
        errorMessage.toLowerCase().includes('invalid login')
      ) {
        return LOGIN_ERRORS.invalidCredentials;
      }
      if (
        errorMessage.toLowerCase().includes('user not found') ||
        errorMessage.toLowerCase().includes('no user found')
      ) {
        return LOGIN_ERRORS.userNotFound;
      }
      if (
        errorMessage.toLowerCase().includes('email not confirmed') ||
        errorMessage.toLowerCase().includes('email not verified')
      ) {
        return LOGIN_ERRORS.emailNotConfirmed;
      }
      if (
        errorMessage.toLowerCase().includes('too many requests') ||
        errorMessage.toLowerCase().includes('rate limit')
      ) {
        return LOGIN_ERRORS.tooManyRequests;
      }
      if (
        errorMessage.toLowerCase().includes('account locked') ||
        errorMessage.toLowerCase().includes('temporarily locked')
      ) {
        return LOGIN_ERRORS.accountLocked;
      }
      if (
        errorMessage.toLowerCase().includes('network') ||
        errorMessage.toLowerCase().includes('connection')
      ) {
        return LOGIN_ERRORS.networkError;
      }
      if (
        errorMessage.toLowerCase().includes('server') ||
        errorMessage.toLowerCase().includes('internal')
      ) {
        return LOGIN_ERRORS.serverError;
      }
      if (
        errorMessage.toLowerCase().includes('session') ||
        errorMessage.toLowerCase().includes('expired')
      ) {
        return LOGIN_ERRORS.sessionExpired;
      }
      return LOGIN_ERRORS.unexpectedError;
  }
};

// Check rate limiting using server-side service
export const checkRateLimit = async (
  email: string
): Promise<{
  isAllowed: boolean;
  error?: string;
  rateLimitInfo?: RateLimitInfo;
}> => {
  try {
    const rateLimitInfo = await rateLimitService.checkRateLimit(email);

    if (rateLimitInfo.isLocked) {
      return {
        isAllowed: false,
        error: rateLimitInfo.error || LOGIN_ERRORS.accountLockedTemporary,
        rateLimitInfo,
      };
    }

    return { isAllowed: true, rateLimitInfo };
  } catch (error) {
    console.error('Rate limit check failed:', error);
    // Fail open - allow login if rate limiting fails
    return { isAllowed: true };
  }
};

// Attempt login with Supabase
export const attemptLogin = async (
  credentials: LoginAttemptData
): Promise<LoginResult> => {
  try {
    // Check server-side rate limiting first
    const rateLimitCheck = await checkRateLimit(credentials.email);
    if (!rateLimitCheck.isAllowed) {
      return {
        success: false,
        error: rateLimitCheck.error || 'Account temporarily locked',
        rateLimitInfo: rateLimitCheck.rateLimitInfo,
      };
    }

    // Attempt authentication
    const result = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (result.error) {
      // Record failed attempt
      await rateLimitService.recordAttempt(credentials.email, false);

      // Get rate limit info after failed attempt
      const updatedRateLimit = await rateLimitService.checkRateLimit(
        credentials.email
      );

      if (updatedRateLimit.isLocked) {
        return {
          success: false,
          error:
            updatedRateLimit.error ||
            'Account temporarily locked due to too many failed attempts',
          rateLimitInfo: updatedRateLimit,
        };
      }

      // Use specific Supabase error message
      const specificError = getSupabaseErrorMessage(result.error);
      return {
        success: false,
        error: specificError,
        rateLimitInfo: updatedRateLimit,
      };
    }

    if (result.data.session) {
      // Record successful login and reset rate limiting
      await rateLimitService.recordAttempt(credentials.email, true);
      await rateLimitService.resetRateLimit(credentials.email);

      // Configure session manager based on user preferences
      if (credentials.rememberMe) {
        sessionManager.setRememberMe(true);
      } else {
        sessionManager.setRememberMe(false);
      }

      // Ensure user profile exists in our users table
      if (result.data.user) {
        try {
          // First check if user already exists and get their facility_id
          const { data: existingUser } = await supabase
            .from('users')
            .select('facility_id')
            .eq('id', result.data.user.id)
            .single();

          const { error: profileError } = await supabase.from('users').upsert(
            {
              id: result.data.user.id,
              email: result.data.user.email,
              last_login: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              // Preserve existing facility_id if user already exists, otherwise use default
              facility_id:
                existingUser?.facility_id ||
                '550e8400-e29b-41d4-a716-446655440000',
            },
            {
              onConflict: 'id',
            }
          );

          if (profileError) {
            console.warn('Failed to update user profile:', profileError);
          }

          // Create a new user session to track active sessions count
          try {
            const deviceInfo = UserSessionService.getDeviceInfo();
            const sessionToken = result.data.session?.access_token || '';

            await UserSessionService.createSession(
              result.data.user.id,
              sessionToken,
              deviceInfo,
              undefined, // IP address would be captured server-side
              navigator.userAgent
            );
          } catch (sessionError) {
            console.warn('Failed to create user session:', sessionError);
            // Don't fail the login if session tracking fails
          }
        } catch (profileError) {
          console.warn('Error updating user profile:', profileError);
        }
      }

      return {
        success: true,
        session: result.data.session,
        user: result.data.user,
      };
    }

    return {
      success: false,
      error: LOGIN_ERRORS.unexpectedError,
    };
  } catch (error) {
    console.error('Login attempt failed:', error);

    // Record failed attempt
    await rateLimitService.recordAttempt(credentials.email, false);

    return {
      success: false,
      error: LOGIN_ERRORS.unexpectedError,
    };
  }
};

// Log login attempt for security monitoring
export const logLoginAttempt = (data: LoginAnalyticsData): void => {
  console.info(`Login attempt initiated for email: ${data.email}`, {
    timestamp: data.timestamp,
    email: data.email,
    ipAddress: 'client-side',
    userAgent: data.userAgent,
    stage: data.stage,
  });
};

// Log login failure for security monitoring
export const logLoginFailure = (data: LoginAnalyticsData): void => {
  console.warn(`Login failed for email: ${data.email}`, {
    timestamp: data.timestamp,
    email: data.email,
    error: data.error,
    ipAddress: 'client-side',
    userAgent: data.userAgent,
  });
};

// Log successful login for security monitoring
export const logLoginSuccess = (data: LoginAnalyticsData): void => {
  console.info(`Login successful for email: ${data.email}`, {
    timestamp: data.timestamp,
    email: data.email,
    userId: data.userId,
    ipAddress: 'client-side',
    userAgent: data.userAgent,
  });
};
