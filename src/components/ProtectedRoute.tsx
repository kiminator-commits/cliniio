import React, { useMemo, useEffect, memo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useLoginStore } from '@/stores/useLoginStore';
import { useUser } from '@/contexts/UserContext';
import { usePagePerformance } from '@/hooks/usePagePerformance';
import { SecureAuthService } from '@/services/secureAuthService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRouteComponent: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const location = useLocation();
  const authToken = useLoginStore((state) => state.authToken);
  const _tokenExpiry = useLoginStore((state) => state.tokenExpiry);
  const reset = useLoginStore((state) => state.reset);
  const isTokenExpired = useLoginStore((state) => state.isTokenExpired);
  const getRemainingSessionTime = useLoginStore((state) => state.getRemainingSessionTime);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const { currentUser, isLoading: userLoading } = useUser();

  // Performance tracking
  const { recordAuthenticationComplete } = usePagePerformance({
    pageName: `ProtectedRoute-${location.pathname}`,
    trackAuthentication: true,
  });

  // Memoize authentication check to prevent unnecessary recalculations
  const authStatus = useMemo(() => {
    const tokenExpired = isTokenExpired();
    const isAuthenticated = !!authToken && !tokenExpired;
    const remainingTime = getRemainingSessionTime();

    return {
      isAuthenticated,
      isTokenExpired: !!authToken && tokenExpired,
      remainingTime,
    };
  }, [authToken, isTokenExpired, getRemainingSessionTime]);

  // Secure token validation on mount and when token changes
  useEffect(() => {
    if (authToken && !authStatus.isTokenExpired && !isValidatingToken) {
      setIsValidatingToken(true);
      
      const validateAuthToken = async () => {
        try {
          console.log('[AUTH] Validating token with secure server...');
          const authService = new SecureAuthService();
          const isValid = await authService.validateToken(authToken);
          if (!isValid) {
            throw new Error('Token validation failed');
          }
          console.log('[AUTH] Token validation successful');
        } catch (error) {
          console.error('[AUTH] Token validation failed:', error);
          reset(); // Clear invalid session
        } finally {
          setIsValidatingToken(false);
        }
      };

      validateAuthToken();
    }
  }, [authToken, authStatus.isTokenExpired, isValidatingToken, reset]);

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
      reset();
    }
  }, [authTimeout, reset]);

  // Handle expired token
  useEffect(() => {
    if (authStatus.isTokenExpired) {
      reset();
    }
  }, [authStatus.isTokenExpired, reset]);

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
