import React, { useMemo, useEffect, memo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLoginStore } from '@/stores/useLoginStore';
import { useUser } from '@/contexts/UserContext';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import { SecureAuthService as _SecureAuthService } from '@/services/secureAuthService';
import { supabase } from '@/lib/supabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRouteComponent: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const _authToken = useLoginStore((state) => state.authToken);
  const _tokenExpiry = useLoginStore((state) => state.tokenExpiry);
  const reset = useLoginStore((state) => state.reset);
  const _isTokenExpired = useLoginStore((state) => state.isTokenExpired);
  const getRemainingSessionTime = useLoginStore(
    (state) => state.getRemainingSessionTime
  );
  const [authTimeout, setAuthTimeout] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const { currentUser, isLoading: userLoading, clearUserData } = useUser();

  // Performance tracking - only for actual pages, not route components
  const { recordAuthenticationComplete } = usePagePerformance({
    pageName: `Page-${location.pathname}`, // Changed from ProtectedRoute to Page
    trackAuthentication: true,
  });

  // Memoize authentication check to prevent unnecessary recalculations
  const authStatus = useMemo(() => {
    // Use UserContext authentication status - Supabase session validation handled in useEffect
    const isAuthenticated = !!currentUser;
    const remainingTime = getRemainingSessionTime();

    return {
      isAuthenticated,
      isTokenExpired: false, // Supabase handles session expiration
      remainingTime,
    };
  }, [currentUser, getRemainingSessionTime]);

  // Supabase session verification on mount
  useEffect(() => {
    setIsValidatingToken(true);

    const validateSupabaseSession = async () => {
      try {
        console.log('[AUTH] Validating Supabase session...');
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log('[AUTH] No valid session found - redirecting to login');
          clearUserData(); // Clear user data
          reset(); // Clear invalid session
          return;
        }

        console.log('[AUTH] Supabase session validation successful');
      } catch (error) {
        console.error('[AUTH] Supabase session validation failed:', error);
        clearUserData(); // Clear user data
        reset(); // Clear invalid session
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateSupabaseSession();
  }, [reset, clearUserData]); // Removed authToken and authStatus dependencies

  // Add timeout to prevent hanging authentication - reduced to 3 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!authStatus.isAuthenticated && !isValidatingToken) {
        console.warn('⚠️ Authentication check timed out after 3 seconds');
        setAuthTimeout(true);
      }
    }, 3000); // 3 second timeout

    return () => clearTimeout(timeoutId);
  }, [authStatus.isAuthenticated, isValidatingToken]);

  // Record authentication completion only once when auth status changes
  useEffect(() => {
    if (authStatus.isAuthenticated) {
      recordAuthenticationComplete();
    }
  }, [authStatus.isAuthenticated, recordAuthenticationComplete]);

  // Handle authentication timeout
  useEffect(() => {
    if (authTimeout) {
      console.error('❌ Authentication timeout - redirecting to login');
      clearUserData(); // Clear user data
      reset();
    }
  }, [authTimeout, reset, clearUserData]);

  // Show loading if we're validating token, loading user, or have auth timeout
  if (
    isValidatingToken ||
    (!authStatus.isAuthenticated && userLoading) ||
    (authStatus.isAuthenticated && !currentUser && userLoading) ||
    authTimeout
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        {isValidatingToken && (
          <div className="ml-3 text-sm text-gray-600">
            Validating secure session...
          </div>
        )}
      </div>
    );
  }

  // Handle unauthenticated user
  if (!authStatus.isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but no user data, still allow the page to render
  // The user data will load asynchronously
  return <>{children}</>;
};

ProtectedRouteComponent.displayName = 'ProtectedRoute';

export const ProtectedRoute = memo(ProtectedRouteComponent);
